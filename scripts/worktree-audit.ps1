param(
  [string]$CanonicalRepo = "C:\FloorConnector",
  [string]$RegistryPath = "C:\FloorConnector\active-worktrees.md"
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

function Invoke-Git {
  param([string]$Repo, [string[]]$Arguments)

  try {
    $output = git -C $Repo @Arguments 2>&1
    return [pscustomobject]@{
      Code = $LASTEXITCODE
      Output = (($output | Out-String).Trim())
    }
  } catch {
    return [pscustomobject]@{
      Code = 1
      Output = $_.Exception.Message
    }
  }
}

function Get-Worktrees {
  param([string]$Repo)

  $items = @()
  $current = $null
  foreach ($line in git -C $Repo worktree list --porcelain) {
    if ($line -match "^worktree\s+(.+)$") {
      if ($current) { $items += [pscustomobject]$current }
      $current = [ordered]@{ Path = $Matches[1]; Branch = ""; Detached = $false }
      continue
    }

    if (-not $current) { continue }

    if ($line -match "^branch\s+refs/heads/(.+)$") {
      $current.Branch = $Matches[1]
    } elseif ($line -match "^detached$") {
      $current.Detached = $true
    }
  }

  if ($current) { $items += [pscustomobject]$current }
  return $items
}

function Get-RegistryRows {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return @()
  }

  $rows = @()
  foreach ($line in Get-Content -LiteralPath $Path) {
    if ($line -notmatch '^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|') {
      continue
    }

    $rows +=
      [pscustomobject]@{
        Worktree = $Matches[1]
        Branch = $Matches[2]
      }
  }

  return $rows
}

foreach ($requiredPath in @(
  "scripts\link-worktree-dev-tools.ps1",
  "scripts\worktree-doctor.ps1",
  "scripts\worktree-status.ps1",
  "scripts\worktree-reconcile.ps1",
  "scripts\finish-worktree.ps1",
  "scripts\worktree-audit.ps1",
  "scripts\codex-streams.ps1",
  "scripts\codex-next.ps1",
  ".codex\worktree-rules.md",
  ".codex\parallel-development.md",
  ".codex\active-stream-plan.md",
  ".vscode\settings.json",
  ".vscode\extensions.json",
  ".vscode\tasks.json"
)) {
  $fullPath = Join-Path $CanonicalRepo $requiredPath
  if (Test-Path -LiteralPath $fullPath) {
    Add-Result "PASS" "required file" $requiredPath
  } else {
    Add-Result "FAIL" "required file" "$requiredPath missing" "Restore or recreate this platform file."
  }
}

$worktrees = @(Get-Worktrees -Repo $CanonicalRepo)
$registryRows = @(Get-RegistryRows -Path $RegistryPath)

foreach ($row in $registryRows) {
  $expectedPath = if ($row.Worktree -eq "main") { $CanonicalRepo } else { "C:\FC-worktrees\$($row.Worktree)" }
  $actual = $worktrees | Where-Object { $_.Branch -eq $row.Branch -or (Split-Path -Leaf $_.Path) -eq $row.Worktree } | Select-Object -First 1

  if (Test-Path -LiteralPath $expectedPath) {
    Add-Result "PASS" "registry path" "$($row.Worktree) exists"
  } else {
    Add-Result "FAIL" "registry path" "$($row.Worktree) missing at $expectedPath" "Create the worktree or mark it Archived."
  }

  if ($actual) {
    Add-Result "PASS" "registry branch" "$($row.Worktree) -> $($actual.Branch)"
  } else {
    Add-Result "WARNING" "registry branch" "$($row.Worktree) not present in git worktree list" "Update active-worktrees.md if this stream was retired."
  }
}

foreach ($worktree in $worktrees) {
  if ($worktree.Detached) {
    Add-Result "FAIL" "branch state" "$($worktree.Path) is detached" "Switch to a named branch or retire the worktree."
    continue
  }

  $branchExists = Invoke-Git $CanonicalRepo @("show-ref", "--verify", "--quiet", "refs/heads/$($worktree.Branch)")
  if ($branchExists.Code -eq 0) {
    Add-Result "PASS" "branch exists" $worktree.Branch
  } else {
    Add-Result "FAIL" "branch exists" "$($worktree.Branch) missing" "Repair git worktree metadata."
  }

  $upstream = Invoke-Git $worktree.Path @("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}")
  if ($upstream.Code -eq 0) {
    Add-Result "PASS" "upstream" "$($worktree.Branch) -> $($upstream.Output)"
  } elseif ($worktree.Branch -eq "main") {
    Add-Result "WARNING" "upstream" "main has no upstream" "Set origin/main tracking if needed."
  } else {
    Add-Result "WARNING" "upstream" "$($worktree.Branch) has no upstream" "Push with -u or set upstream if this stream should be shared."
  }
}

foreach ($name in @("portal", "scheduling", "project-workspace")) {
  $path = "C:\FC-worktrees\$name"
  if (-not (Test-Path -LiteralPath $path)) {
    Add-Result "FAIL" "doctor" "$name missing" "Create or restore this worktree."
    continue
  }

  $doctor = & pnpm.cmd --dir $CanonicalRepo worktree:doctor -Path $path -Quiet 2>&1
  if ($LASTEXITCODE -eq 0) {
    Add-Result "PASS" "doctor" "$name passed"
  } else {
    Add-Result "FAIL" "doctor" "$name failed: $doctor" "Run pnpm worktree:doctor in that worktree and repair failures."
  }
}

foreach ($worktree in $worktrees) {
  foreach ($buildOutput in @(".next", "dist", "coverage", "test-results")) {
    $path = Join-Path $worktree.Path $buildOutput
    $item = Get-Item -LiteralPath $path -Force -ErrorAction SilentlyContinue
    if ($item -and $item.LinkType) {
      Add-Result "FAIL" "build output sharing" "$path is $($item.LinkType)" "Remove shared build-output links; these must stay local."
    }
  }
}

if (-not ($results | Where-Object { $_.Check -eq "build output sharing" })) {
  Add-Result "PASS" "build output sharing" "No shared .next, dist, coverage, or test-results links found"
}

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

if (($results | Where-Object { $_.Status -eq "FAIL" }).Count -gt 0) {
  exit 1
}
