param(
  [string]$CanonicalRepo = "C:\FloorConnector",
  [switch]$SkipFetch
)

$ErrorActionPreference = "Stop"

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

function Get-Recommendation {
  param(
    [bool]$Detached,
    [bool]$Dirty,
    [string]$Upstream,
    [string]$BehindMain,
    [string]$Behind
  )

  if ($Detached) { return "Create/switch to a named stream branch before work." }
  if ($Dirty) { return "Commit, stash, or intentionally preserve local changes before reconciling." }
  if (-not $Upstream) { return "Push with -u or set upstream if this stream should be shared." }
  if ($BehindMain -ne "0") { return "Merge latest main into this stream, then run pnpm worktree:doctor." }
  if ($Behind -ne "0") { return "Review upstream changes before merge or push." }
  return "No action required."
}

if (-not $SkipFetch) {
  Write-Host "Fetching origin..."
  $fetch = Invoke-Git $CanonicalRepo @("fetch", "origin")
  if ($fetch.Code -ne 0) {
    Write-Host ("Fetch warning: {0}" -f $fetch.Output) -ForegroundColor Yellow
  }
}

$rows = @()
foreach ($worktree in Get-Worktrees -Repo $CanonicalRepo) {
  $dirty = [bool](Invoke-Git $worktree.Path @("status", "--porcelain")).Output
  $upstreamResult = if (-not $worktree.Detached -and $worktree.Branch) {
    Invoke-Git $worktree.Path @("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}")
  } else {
    [pscustomobject]@{ Code = 1; Output = "" }
  }
  $upstream = if ($upstreamResult.Code -eq 0) { $upstreamResult.Output } else { "" }
  $ahead = "n/a"
  $behind = "n/a"

  if ($upstream) {
    $counts = Invoke-Git $worktree.Path @("rev-list", "--left-right", "--count", "HEAD...@{upstream}")
    if ($counts.Code -eq 0 -and $counts.Output -match "(\d+)\s+(\d+)") {
      $ahead = $Matches[1]
      $behind = $Matches[2]
    }
  }

  $behindMain = "n/a"
  if (-not $worktree.Detached -and $worktree.Branch -ne "main") {
    $mainCounts = Invoke-Git $worktree.Path @("rev-list", "--left-right", "--count", "HEAD...main")
    if ($mainCounts.Code -eq 0 -and $mainCounts.Output -match "(\d+)\s+(\d+)") {
      $behindMain = $Matches[2]
    }
  } elseif ($worktree.Branch -eq "main") {
    $behindMain = "0"
  }

  $risk = if ($worktree.Detached) {
    "detached"
  } elseif ($dirty) {
    "dirty"
  } elseif (-not $upstream) {
    "missing-upstream"
  } elseif ($behindMain -ne "0") {
    "behind-main"
  } elseif ($behind -ne "0") {
    "behind-upstream"
  } else {
    "low"
  }

  $rows += [pscustomobject]@{
    Worktree = Split-Path -Leaf $worktree.Path
    Branch = if ($worktree.Detached) { "(detached)" } else { $worktree.Branch }
    Upstream = if ($upstream) { $upstream } else { "(none)" }
    Ahead = $ahead
    Behind = $behind
    BehindMain = $behindMain
    Dirty = if ($dirty) { "yes" } else { "no" }
    Risk = $risk
    Recommendation = Get-Recommendation -Detached:$worktree.Detached -Dirty:$dirty -Upstream $upstream -BehindMain $behindMain -Behind $behind
  }
}

$rows | Format-Table -AutoSize

$attention = $rows | Where-Object { $_.Risk -ne "low" }
if ($attention) {
  Write-Host ""
  Write-Host "Attention:" -ForegroundColor Yellow
  foreach ($row in $attention) {
    Write-Host ("  {0}: {1}. {2}" -f $row.Worktree, $row.Risk, $row.Recommendation) -ForegroundColor Yellow
  }
}
