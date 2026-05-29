param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidatePattern("^[A-Za-z0-9._-]+$")]
  [string]$Name,
  [string]$CanonicalRepo = "C:\FloorConnector",
  [string]$WorktreeRoot = "C:\FC-worktrees",
  [switch]$Yes
)

$ErrorActionPreference = "Stop"

$path = Join-Path $WorktreeRoot $Name

if (-not (Test-Path -LiteralPath $path)) {
  throw "Worktree path not found: $path"
}

$branch = git -C $path branch --show-current
if (-not $branch) {
  throw "Worktree is detached or branch cannot be determined: $path"
}

$status = git -C $path status --porcelain
if ($status) {
  throw "Worktree is dirty. Commit, stash, or preserve changes before finishing $Name."
}

$upstream = git -C $path rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>$null
$counts = if ($LASTEXITCODE -eq 0) { git -C $path rev-list --left-right --count 'HEAD...@{upstream}' } else { "n/a n/a" }
$mainCounts = git -C $path rev-list --left-right --count "main...$branch"

Write-Host "Finish worktree review:"
Write-Host "  worktree: $Name"
Write-Host "  branch:   $branch"
Write-Host "  path:     $path"
Write-Host "  upstream: $(if ($upstream) { $upstream } else { '(none)' })"
Write-Host "  upstream ahead/behind: $counts"
Write-Host "  main vs branch counts: $mainCounts"

if (-not $Yes) {
  $answer = Read-Host "Remove this worktree? Type 'finish $Name' to continue"
  if ($answer -ne "finish $Name") {
    Write-Host "Cancelled."
    exit 0
  }
}

git -C $CanonicalRepo worktree remove $path

$deleteBranch = $false
if ($Yes) {
  $deleteBranch = $true
} else {
  $deleteAnswer = Read-Host "Delete local branch '$branch'? Type 'delete $branch' to delete, or press Enter to keep"
  $deleteBranch = $deleteAnswer -eq "delete $branch"
}

if ($deleteBranch) {
  git -C $CanonicalRepo branch -d $branch
}

$registry = Join-Path $CanonicalRepo "active-worktrees.md"
if (Test-Path -LiteralPath $registry) {
  $today = Get-Date -Format "yyyy-MM-dd"
  $lines = Get-Content -LiteralPath $registry
  $updated = $lines | ForEach-Object {
    if ($_ -match "^\|\s*`$Name`\s*\|") {
      $cells = $_ -split "\|"
      if ($cells.Count -ge 9) {
        $cells[6] = " Archived "
        $cells[8] = " Retired $today "
        return ($cells -join "|")
      }
    }
    $_
  }
  Set-Content -LiteralPath $registry -Value $updated
}

Write-Host "Finished worktree $Name."
