param(
  [string]$CanonicalRepo = "C:\FloorConnector",
  [string]$WorktreeRoot = "C:\FC-worktrees",
  [switch]$Fix
)

$ErrorActionPreference = "Stop"

function Resolve-ExistingPath {
  param([string]$Path)

  $item = Get-Item -LiteralPath $Path -Force -ErrorAction SilentlyContinue
  if (-not $item) {
    return $null
  }

  return $item.FullName
}

function Normalize-Path {
  param([string]$Path)

  $Path = $Path -replace "^Microsoft.PowerShell.Core\\FileSystem::", ""

  if ($Path.StartsWith("\\??\")) {
    $Path = $Path.Substring(5)
  }

  if ($Path.StartsWith("\\?\")) {
    $Path = $Path.Substring(4)
  }

  if ($Path.StartsWith("\??\")) {
    $Path = $Path.Substring(4)
  }

  if ($Path -match "^\\[^\\]" -and (Get-Location).Drive) {
    $Path = "$(Get-Location | Select-Object -ExpandProperty Drive | Select-Object -ExpandProperty Name):$Path"
  }

  try {
    return [System.IO.Path]::GetFullPath($Path).TrimEnd("\")
  } catch {
    throw "Unable to normalize path '$Path': $($_.Exception.Message)"
  }
}

function Test-SamePath {
  param(
    [string]$Left,
    [string]$Right
  )

  return [string]::Equals(
    (Normalize-Path $Left),
    (Normalize-Path $Right),
    [System.StringComparison]::OrdinalIgnoreCase
  )
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

function Test-HardLinkToSource {
  param(
    [string]$TargetPath,
    [string]$SourcePath
  )

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

  if (-not $targetId -or -not $sourceId) {
    return $false
  }

  return $targetId -eq $sourceId
}

function Assert-SafeLocalToolPath {
  param(
    [string]$TargetPath,
    [string]$WorktreePath,
    [string]$RelativePath
  )

  $allowed = @(
    "node_modules",
    ".turbo",
    "playwright\.auth"
  )

  if ($allowed -notcontains $RelativePath) {
    throw "Refusing to replace '$RelativePath'. Only ignored local tool directories can be replaced with -Fix."
  }

  $resolvedWorktree = Normalize-Path (Resolve-Path -LiteralPath $WorktreePath)
  $resolvedTarget = Normalize-Path (Resolve-Path -LiteralPath $TargetPath)

  if (-not $resolvedTarget.StartsWith($resolvedWorktree, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to replace '$TargetPath' because it is outside '$WorktreePath'."
  }
}

function Remove-SafeLocalToolDirectory {
  param([string]$TargetPath)

  try {
    Remove-Item -LiteralPath $TargetPath -Recurse -Force
  } catch {
    $longPath = if ($TargetPath.StartsWith("\\?\")) { $TargetPath } else { "\\?\$TargetPath" }
    Remove-Item -LiteralPath $longPath -Recurse -Force
  }
}

function Get-WorktreePaths {
  param(
    [string]$CanonicalRepo,
    [string]$WorktreeRoot
  )

  $paths = New-Object System.Collections.Generic.List[string]
  $worktreeOutput = git -C $CanonicalRepo worktree list --porcelain

  foreach ($line in $worktreeOutput) {
    if ($line -notmatch "^worktree\s+(.+)$") {
      continue
    }

    $path = $Matches[1]
    if ((Normalize-Path $path).StartsWith((Normalize-Path $WorktreeRoot), [System.StringComparison]::OrdinalIgnoreCase)) {
      $paths.Add($path)
    }
  }

  if (Test-Path -LiteralPath $WorktreeRoot) {
    Get-ChildItem -LiteralPath $WorktreeRoot -Directory -Force | ForEach-Object {
      $candidate = $_.FullName
      if (Test-Path -LiteralPath (Join-Path $candidate ".git")) {
        $alreadyKnown = $false
        foreach ($known in $paths) {
          if (Test-SamePath $known $candidate) {
            $alreadyKnown = $true
            break
          }
        }

        if (-not $alreadyKnown) {
          $paths.Add($candidate)
        }
      }
    }
  }

  return $paths | Sort-Object -Unique
}

function Ensure-SharedLink {
  param(
    [string]$WorktreePath,
    [string]$RelativePath,
    [string]$SourcePath,
    [ValidateSet("File", "Directory")]
    [string]$Kind,
    [switch]$Fix
  )

  $targetPath = Join-Path $WorktreePath $RelativePath
  $sourceItem = Get-Item -LiteralPath $SourcePath -Force -ErrorAction SilentlyContinue

  if (-not $sourceItem) {
    return [pscustomobject]@{
      RelativePath = $RelativePath
      Status = "SKIP"
      Detail = "Source not present at $SourcePath"
    }
  }

  $targetItem = Get-Item -LiteralPath $targetPath -Force -ErrorAction SilentlyContinue

  if ($targetItem) {
    $linkTarget = Get-LinkTargetPath $targetItem
    $expectedLinkType = if ($Kind -eq "Directory") { "Junction" } else { "SymbolicLink" }

    if (($targetItem.LinkType -eq "Junction" -or $targetItem.LinkType -eq "SymbolicLink") -and $linkTarget -and (Test-SamePath $linkTarget $SourcePath)) {
      return [pscustomobject]@{
        RelativePath = $RelativePath
        Status = "OK"
        Detail = "$($targetItem.LinkType) already points to $SourcePath"
      }
    }

    if ($Kind -eq "File" -and (Test-HardLinkToSource -TargetPath $targetPath -SourcePath $SourcePath)) {
      return [pscustomobject]@{
        RelativePath = $RelativePath
        Status = "OK"
        Detail = "HardLink already points to $SourcePath"
      }
    }

    if (-not $Fix) {
      return [pscustomobject]@{
        RelativePath = $RelativePath
        Status = "WARN"
        Detail = "Existing item is not the shared $expectedLinkType. Re-run with -Fix to replace ignored local tool directories when safe."
      }
    }

    if ($Kind -eq "File") {
      return [pscustomobject]@{
        RelativePath = $RelativePath
        Status = "WARN"
        Detail = "Existing file was not replaced. Review manually before replacing local env/secrets."
      }
    }

    Assert-SafeLocalToolPath -TargetPath $targetPath -WorktreePath $WorktreePath -RelativePath $RelativePath
    Remove-SafeLocalToolDirectory -TargetPath $targetPath
  }

  $parent = Split-Path -Parent $targetPath
  if (-not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }

  if ($Kind -eq "Directory") {
    New-Item -ItemType Junction -Path $targetPath -Target $SourcePath | Out-Null
    return [pscustomobject]@{
      RelativePath = $RelativePath
      Status = "LINKED"
      Detail = "Junction -> $SourcePath"
    }
  }

  try {
    New-Item -ItemType SymbolicLink -Path $targetPath -Target $SourcePath | Out-Null
    return [pscustomobject]@{
      RelativePath = $RelativePath
      Status = "LINKED"
      Detail = "SymbolicLink -> $SourcePath"
    }
  } catch {
    New-Item -ItemType HardLink -Path $targetPath -Target $SourcePath | Out-Null
  }

  return [pscustomobject]@{
    RelativePath = $RelativePath
    Status = "LINKED"
    Detail = "HardLink -> $SourcePath"
  }
}

$canonicalRoot = Normalize-Path $CanonicalRepo
$worktreeRootPath = Normalize-Path $WorktreeRoot

if (-not (Test-Path -LiteralPath $canonicalRoot)) {
  throw "Canonical repo not found: $canonicalRoot"
}

if (-not (Test-Path -LiteralPath $worktreeRootPath)) {
  throw "Worktree root not found: $worktreeRootPath"
}

$linkSpecs = @(
  @{ RelativePath = ".env.local"; SourcePath = Join-Path $canonicalRoot ".env.local"; Kind = "File" },
  @{ RelativePath = "node_modules"; SourcePath = Join-Path $canonicalRoot "node_modules"; Kind = "Directory" },
  @{ RelativePath = ".turbo"; SourcePath = Join-Path $canonicalRoot ".turbo"; Kind = "Directory" },
  @{ RelativePath = "playwright\.auth"; SourcePath = Join-Path $canonicalRoot "playwright\.auth"; Kind = "Directory" }
)

$worktrees = @(Get-WorktreePaths -CanonicalRepo $canonicalRoot -WorktreeRoot $worktreeRootPath)

Write-Host "Canonical repo: $canonicalRoot"
Write-Host "Worktree root:  $worktreeRootPath"
Write-Host "Mode:           $(if ($Fix) { 'Fix incorrect ignored tool directories' } else { 'Verify/link missing only' })"
Write-Host ""

if ($worktrees.Count -eq 0) {
  Write-Host "No worktrees found under $worktreeRootPath"
  exit 0
}

$allResults = @()

foreach ($worktree in $worktrees) {
  Write-Host "== $worktree =="

  foreach ($spec in $linkSpecs) {
    $result = Ensure-SharedLink `
      -WorktreePath $worktree `
      -RelativePath $spec.RelativePath `
      -SourcePath $spec.SourcePath `
      -Kind $spec.Kind `
      -Fix:$Fix

    $allResults += [pscustomobject]@{
      Worktree = $worktree
      RelativePath = $result.RelativePath
      Status = $result.Status
      Detail = $result.Detail
    }

    Write-Host ("[{0}] {1} - {2}" -f $result.Status, $result.RelativePath, $result.Detail)
  }

  foreach ($buildOutput in @(".next", "dist", "coverage", "test-results")) {
    $buildOutputPath = Join-Path $worktree $buildOutput
    $item = Get-Item -LiteralPath $buildOutputPath -Force -ErrorAction SilentlyContinue

    if ($item -and $item.LinkType) {
      Write-Host ("[WARN] {0} is a link. Build output should not be shared." -f $buildOutput)
    } else {
      Write-Host ("[OK] {0} is not shared" -f $buildOutput)
    }
  }

  Write-Host ""
}

$summary = $allResults | Group-Object Status | Sort-Object Name
Write-Host "Summary:"
foreach ($group in $summary) {
  Write-Host ("  {0}: {1}" -f $group.Name, $group.Count)
}
