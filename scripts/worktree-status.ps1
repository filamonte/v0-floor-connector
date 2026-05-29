param(
  [string]$CanonicalRepo = "C:\FloorConnector",
  [switch]$SkipFetch
)

$ErrorActionPreference = "Stop"

function Invoke-Git {
  param(
    [string]$Repo,
    [string[]]$Arguments
  )

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
      if ($current) { $items += $current }
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

  if ($current) { $items += $current }
  return $items
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
  $branch = if ($worktree.Detached) { "(detached)" } else { $worktree.Branch }
  $dirty = (Invoke-Git $worktree.Path @("status", "--porcelain")).Output
  $cleanState = if ($dirty) { "dirty" } else { "clean" }
  $ahead = "n/a"
  $behind = "n/a"

  if (-not $worktree.Detached -and $worktree.Branch) {
    $upstream = Invoke-Git $worktree.Path @("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}")
    if ($upstream.Code -eq 0) {
      $counts = Invoke-Git $worktree.Path @("rev-list", "--left-right", "--count", "HEAD...@{upstream}")
      if ($counts.Code -eq 0 -and $counts.Output -match "(\d+)\s+(\d+)") {
        $ahead = $Matches[1]
        $behind = $Matches[2]
      }
    }
  }

  $rows += [pscustomobject]@{
    Worktree = Split-Path -Leaf $worktree.Path
    Branch = $branch
    Ahead = $ahead
    Behind = $behind
    State = $cleanState
    Path = $worktree.Path
  }
}

$rows | Format-Table -AutoSize

$warnings = $rows | Where-Object { $_.Behind -ne "0" -or $_.State -ne "clean" -or $_.Branch -eq "(detached)" }
if ($warnings) {
  Write-Host "Attention:" -ForegroundColor Yellow
  foreach ($row in $warnings) {
    Write-Host ("  {0}: branch={1}, behind={2}, state={3}" -f $row.Worktree, $row.Branch, $row.Behind, $row.State) -ForegroundColor Yellow
  }
}
