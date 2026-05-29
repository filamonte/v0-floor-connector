param(
  [string]$Path = (Get-Location).Path,
  [string]$CanonicalRepo = "C:\FloorConnector",
  [switch]$Quiet
)

$ErrorActionPreference = "Stop"
$results = New-Object System.Collections.Generic.List[object]

function Add-Result {
  param(
    [ValidateSet("PASS", "WARNING", "FAIL")]
    [string]$Status,
    [string]$Check,
    [string]$Detail,
    [string]$Remediation = ""
  )

  $script:results.Add([pscustomobject]@{
    Status = $Status
    Check = $Check
    Detail = $Detail
    Remediation = $Remediation
  })
}

function Invoke-Capture {
  param(
    [string]$Command,
    [string[]]$Arguments,
    [string]$WorkingDirectory
  )

  try {
    Push-Location $WorkingDirectory
    try {
      $output = & $Command @Arguments 2>&1
      return [pscustomobject]@{
        Code = $LASTEXITCODE
        Output = (($output | Out-String).Trim())
      }
    } finally {
      Pop-Location
    }
  }
  catch {
    return [pscustomobject]@{
      Code = 1
      Output = $_.Exception.Message
    }
  }
}

function Normalize-Path {
  param([string]$InputPath)

  $InputPath = $InputPath -replace "^Microsoft.PowerShell.Core\\FileSystem::", ""

  if ($InputPath.StartsWith("\\??\")) {
    $InputPath = $InputPath.Substring(5)
  }

  if ($InputPath.StartsWith("\\?\")) {
    $InputPath = $InputPath.Substring(4)
  }

  if ($InputPath.StartsWith("\??\")) {
    $InputPath = $InputPath.Substring(4)
  }

  if ($InputPath -match "^\\[^\\]" -and (Get-Location).Drive) {
    $InputPath = "$(Get-Location | Select-Object -ExpandProperty Drive | Select-Object -ExpandProperty Name):$InputPath"
  }

  try {
    return [System.IO.Path]::GetFullPath($InputPath).TrimEnd("\")
  } catch {
    throw "Unable to normalize path '$InputPath': $($_.Exception.Message)"
  }
}

function Get-LinkTargetPath {
  param($Item)

  if (-not $Item -or -not $Item.Target) {
    return $null
  }

  if ($Item.Target -is [array]) {
    return $Item.Target[0]
  }

  return [string]$Item.Target
}

function Test-SamePath {
  param([string]$Left, [string]$Right)

  return [string]::Equals((Normalize-Path $Left), (Normalize-Path $Right), [System.StringComparison]::OrdinalIgnoreCase)
}

function Test-HardLinkToSource {
  param([string]$TargetPath, [string]$SourcePath)

  if (-not (Test-Path -LiteralPath $TargetPath -PathType Leaf)) {
    return $false
  }

  try {
    $targetFileId = fsutil file queryfileid $TargetPath 2>$null
    $sourceFileId = fsutil file queryfileid $SourcePath 2>$null
  } catch {
    return $false
  }

  $targetId = [regex]::Match(($targetFileId -join " "), "0x[0-9a-fA-F]+").Value
  $sourceId = [regex]::Match(($sourceFileId -join " "), "0x[0-9a-fA-F]+").Value

  return $targetId -and $sourceId -and $targetId -eq $sourceId
}

function Test-SharedToolLink {
  param(
    [string]$WorktreePath,
    [string]$CanonicalPath,
    [string]$RelativePath,
    [ValidateSet("File", "Directory")]
    [string]$Kind
  )

  $targetPath = Join-Path $WorktreePath $RelativePath
  $sourcePath = Join-Path $CanonicalPath $RelativePath
  $targetItem = Get-Item -LiteralPath $targetPath -Force -ErrorAction SilentlyContinue
  $sourceItem = Get-Item -LiteralPath $sourcePath -Force -ErrorAction SilentlyContinue

  if (-not $sourceItem) {
    Add-Result "WARNING" "$RelativePath source" "Canonical source is not present at $sourcePath" "Create it in C:\FloorConnector when that tool state is needed."
    return
  }

  if (-not $targetItem) {
    Add-Result "FAIL" "$RelativePath link" "Missing from $WorktreePath" "Run pnpm devtools:link from C:\FloorConnector."
    return
  }

  if (Test-SamePath $WorktreePath $CanonicalPath) {
    Add-Result "PASS" "$RelativePath source" "Present in canonical repo"
    return
  }

  $linkTarget = Get-LinkTargetPath $targetItem
  if (($targetItem.LinkType -eq "Junction" -or $targetItem.LinkType -eq "SymbolicLink") -and $linkTarget -and (Test-SamePath $linkTarget $sourcePath)) {
    Add-Result "PASS" "$RelativePath link" "$($targetItem.LinkType) -> $sourcePath"
    return
  }

  if ($Kind -eq "File" -and (Test-HardLinkToSource -TargetPath $targetPath -SourcePath $sourcePath)) {
    Add-Result "PASS" "$RelativePath link" "HardLink -> $sourcePath"
    return
  }

  Add-Result "FAIL" "$RelativePath link" "Existing item is not linked to $sourcePath" "Run pnpm devtools:link:fix for ignored tool directories, or manually review env files."
}

$worktreePath = Normalize-Path $Path
$canonicalPath = Normalize-Path $CanonicalRepo

if (-not (Test-Path -LiteralPath $worktreePath)) {
  Add-Result "FAIL" "repository path" "Path does not exist: $worktreePath" "Pass -Path with a valid repo/worktree path."
} else {
  $repoRoot = Invoke-Capture "git" @("-C", $worktreePath, "rev-parse", "--show-toplevel") $worktreePath
  if ($repoRoot.Code -eq 0) {
    Add-Result "PASS" "repository root" $repoRoot.Output
    $worktreePath = Normalize-Path $repoRoot.Output
  } else {
    Add-Result "FAIL" "repository root" $repoRoot.Output "Run this from a FloorConnector git worktree."
  }
}

$node = Invoke-Capture "node" @("--version") $worktreePath
if ($node.Code -eq 0 -and $node.Output -match "v(\d+)") {
  if ([int]$Matches[1] -ge 20) {
    Add-Result "PASS" "Node version" $node.Output
  } else {
    Add-Result "FAIL" "Node version" $node.Output "Use Node 20+; .node-version is set to 20."
  }
} else {
  Add-Result "FAIL" "Node version" $node.Output "Install Node 20+."
}

$pnpm = Invoke-Capture "pnpm.cmd" @("--version") $worktreePath
if ($pnpm.Code -eq 0) {
  $packageJsonPath = Join-Path $canonicalPath "package.json"
  $expectedPnpm = $null
  if (Test-Path -LiteralPath $packageJsonPath) {
    $packageJson = Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json
    if ($packageJson.packageManager -match "^pnpm@(.+)$") {
      $expectedPnpm = $Matches[1]
    }
  }

  if ($expectedPnpm -and $pnpm.Output -ne $expectedPnpm) {
    Add-Result "WARNING" "pnpm version" "$($pnpm.Output), expected $expectedPnpm" "Run corepack prepare pnpm@$expectedPnpm --activate."
  } else {
    Add-Result "PASS" "pnpm version" $pnpm.Output
  }
} else {
  Add-Result "FAIL" "pnpm version" $pnpm.Output "Run corepack enable, then retry."
}

$corepack = Invoke-Capture "corepack" @("--version") $worktreePath
if ($corepack.Code -eq 0) { Add-Result "PASS" "Corepack" $corepack.Output } else { Add-Result "WARNING" "Corepack" $corepack.Output "Run corepack enable from an elevated shell if pnpm resolution drifts." }

foreach ($spec in @(
  @{ RelativePath = "node_modules"; Kind = "Directory" },
  @{ RelativePath = ".env.local"; Kind = "File" },
  @{ RelativePath = ".turbo"; Kind = "Directory" },
  @{ RelativePath = "playwright\.auth"; Kind = "Directory" }
)) {
  Test-SharedToolLink -WorktreePath $worktreePath -CanonicalPath $canonicalPath -RelativePath $spec.RelativePath -Kind $spec.Kind
}

$tools = @(
  @{ Name = "prettier"; Args = @("exec", "prettier", "--version") },
  @{ Name = "turbo"; Args = @("exec", "turbo", "--version") },
  @{ Name = "next"; Args = @("--filter", "@floorconnector/web", "exec", "next", "--version") },
  @{ Name = "playwright"; Args = @("exec", "playwright", "--version") }
)

foreach ($tool in $tools) {
  $toolResult = Invoke-Capture "pnpm.cmd" $tool.Args $worktreePath
  if ($toolResult.Code -eq 0) {
    Add-Result "PASS" "$($tool.Name) available" $toolResult.Output
  } else {
    Add-Result "FAIL" "$($tool.Name) available" $toolResult.Output "Run pnpm devtools:link from C:\FloorConnector and confirm node_modules is linked."
  }
}

$worktreeList = Invoke-Capture "git" @("-C", $worktreePath, "worktree", "list") $worktreePath
if ($worktreeList.Code -eq 0) { Add-Result "PASS" "git worktree list" "available" } else { Add-Result "FAIL" "git worktree list" $worktreeList.Output "Repair the git checkout before continuing." }

$branch = Invoke-Capture "git" @("-C", $worktreePath, "branch", "--show-current") $worktreePath
if ($branch.Code -eq 0 -and $branch.Output) { Add-Result "PASS" "branch state" $branch.Output } else { Add-Result "WARNING" "branch state" "Detached HEAD or branch not found" "Create or switch to a stream branch before implementation work." }

$origin = Invoke-Capture "git" @("-C", $worktreePath, "remote", "get-url", "origin") $worktreePath
if ($origin.Code -eq 0) { Add-Result "PASS" "remote origin" $origin.Output } else { Add-Result "FAIL" "remote origin" $origin.Output "Configure origin before pushing or comparing branch state." }

$upstream = Invoke-Capture "git" @("-C", $worktreePath, "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}") $worktreePath
if ($upstream.Code -eq 0) {
  $counts = Invoke-Capture "git" @("-C", $worktreePath, "rev-list", "--left-right", "--count", "HEAD...@{upstream}") $worktreePath
  if ($counts.Code -eq 0 -and $counts.Output -match "(\d+)\s+(\d+)") {
    Add-Result "PASS" "ahead/behind" "ahead $($Matches[1]), behind $($Matches[2]) relative to $($upstream.Output)"
  } else {
    Add-Result "WARNING" "ahead/behind" $counts.Output "Fetch origin and check branch tracking."
  }
} else {
  Add-Result "WARNING" "ahead/behind" "No upstream configured" "Set upstream on first push with git push -u origin <branch>."
}

if (-not $Quiet) {
  foreach ($result in $results) {
    $line = "[{0}] {1} - {2}" -f $result.Status, $result.Check, $result.Detail
    if ($result.Status -eq "FAIL") {
      Write-Host $line -ForegroundColor Red
    } elseif ($result.Status -eq "WARNING") {
      Write-Host $line -ForegroundColor Yellow
    } else {
      Write-Host $line -ForegroundColor Green
    }

    if ($result.Remediation) {
      Write-Host ("      fix: {0}" -f $result.Remediation)
    }
  }

  $summary = $results | Group-Object Status | Sort-Object Name
  Write-Host ""
  Write-Host "Summary:"
  foreach ($group in $summary) {
    Write-Host ("  {0}: {1}" -f $group.Name, $group.Count)
  }
}

if (($results | Where-Object { $_.Status -eq "FAIL" }).Count -gt 0) {
  exit 1
}
