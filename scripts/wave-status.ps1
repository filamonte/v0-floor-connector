param(
  [string]$CanonicalRepo = "C:\FloorConnector",
  [string]$RegistryPath = "C:\FloorConnector\active-worktrees.md"
)

$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "lib\wave-pr-guards.ps1")

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

function Get-ActiveRegistryRows {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return @()
  }

  $rows = @()
  foreach ($line in Get-Content -LiteralPath $Path) {
    if ($line -notmatch '^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|') {
      continue
    }

    if ($line -notmatch '\|\s*Active\s*\|') {
      continue
    }

    $cells = $line -split "\|"
    $rows += [pscustomobject]@{
      Worktree = ($cells[1].Trim() -replace '(^`|`$)', "")
      Branch = ($cells[2].Trim() -replace '(^`|`$)', "")
      Wave = if ($cells.Count -gt 9) { ($cells[9].Trim() -replace '(^`|`$)', "") } else { "" }
    }
  }

  return $rows | Where-Object { $_.Worktree -ne "main" }
}

$ghAvailable = [bool](Get-Command gh -ErrorAction SilentlyContinue)
$ghAuthed = $false
if ($ghAvailable) {
  gh auth status 1>$null 2>$null
  $ghAuthed = ($LASTEXITCODE -eq 0)
}

Write-Host "Active wave files:"
$waveFiles = Get-ChildItem -LiteralPath (Join-Path $CanonicalRepo ".codex\waves") -Filter "*.md" -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -ne "README.md" } |
  Sort-Object Name
if ($waveFiles) {
  $waveFiles | ForEach-Object { Write-Host ("  {0}" -f $_.Name) }
} else {
  Write-Host "  none"
}

Write-Host ""
Write-Host "Stream status:"
$worktrees = @(Get-Worktrees -Repo $CanonicalRepo)
$rows = @()
foreach ($stream in Get-ActiveRegistryRows -Path $RegistryPath) {
  $worktree = $worktrees | Where-Object { $_.Branch -eq $stream.Branch -or (Split-Path -Leaf $_.Path) -eq $stream.Worktree } | Select-Object -First 1
  if (-not $worktree) {
    $rows += [pscustomobject]@{
      Stream = $stream.Worktree
      Branch = $stream.Branch
      Dirty = "missing"
      Unpushed = "unknown"
      PRDrift = "unknown"
      PR = "unknown"
      Wave = $stream.Wave
    }
    continue
  }

  $dirty = if ((Invoke-Git $worktree.Path @("status", "--porcelain")).Output) { "yes" } else { "no" }
  $upstream = Invoke-Git $worktree.Path @("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}")
  $unpushed = "no-upstream"
  if ($upstream.Code -eq 0 -and $upstream.Output) {
    $ahead = Invoke-Git $worktree.Path @("rev-list", "--count", "@{upstream}..HEAD")
    $unpushed = if ($ahead.Code -eq 0 -and [int]$ahead.Output -gt 0) { $ahead.Output } else { "0" }
  }

  $drift = Get-WavePullRequestDrift -Repo $worktree.Path -Branch $worktree.Branch
  $prStatus = if ($drift.HasPullRequest) {
    $draft = if ($null -eq $drift.PullRequestIsDraft) {
      "draft-unknown"
    } elseif ($drift.PullRequestIsDraft) {
      "draft"
    } else {
      "ready"
    }
    "#{0} {1} {2} {3}" -f $drift.PullRequestNumber, $draft, $drift.PullRequestState, $drift.PullRequestUrl
  } elseif ($ghAvailable -and -not $ghAuthed) {
    "gh unauthenticated"
  } elseif (-not $ghAvailable) {
    "gh unavailable"
  } else {
    "none"
  }

  $prDrift = switch ($drift.Status) {
    "ok" { "OK" }
    "local-ahead-of-pr" {
      if ($null -ne $drift.LocalOnlyCommitCount) {
        "local-ahead-of-pr ($($drift.LocalOnlyCommitCount))"
      } else {
        "local-ahead-of-pr"
      }
    }
    "unknown-gh-unavailable" { "unknown-gh-unavailable" }
    "no-open-pr" { "no-open-pr" }
    default { $drift.Status }
  }

  $rows += [pscustomobject]@{
    Stream = $stream.Worktree
    Branch = $worktree.Branch
    Dirty = $dirty
    Unpushed = $unpushed
    PRDrift = $prDrift
    PR = $prStatus
    Wave = $stream.Wave
  }
}

$rows | Format-Table -AutoSize

$driftWarnings = @($rows | Where-Object { $_.PRDrift -like "local-ahead-of-pr*" })
if ($driftWarnings.Count -gt 0) {
  Write-Host ""
  Write-Host "PR drift warnings:" -ForegroundColor Yellow
  foreach ($row in $driftWarnings) {
    $drift = Get-WavePullRequestDrift -Repo ((Get-Worktrees -Repo $CanonicalRepo | Where-Object { $_.Branch -eq $row.Branch } | Select-Object -First 1).Path) -Branch $row.Branch
    Write-WavePullRequestDriftWarning -Drift $drift
  }
}

Write-Host ""
if ($ghAvailable -and $ghAuthed) {
  Write-Host "GitHub CLI available: PR metadata includes draft vs ready when a PR exists."
} elseif ($ghAvailable) {
  Write-Host "GitHub CLI available but unauthenticated: showing local-only status."
} else {
  Write-Host "GitHub CLI not found: showing local-only status."
}
