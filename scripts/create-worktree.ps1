param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidatePattern("^[A-Za-z0-9._-]+$")]
  [string]$Name,
  [string]$CanonicalRepo = "C:\FloorConnector",
  [string]$WorktreeRoot = "C:\FC-worktrees"
)

$ErrorActionPreference = "Stop"

$branch = "stream/$Name"
$path = Join-Path $WorktreeRoot $Name

if (-not (Test-Path -LiteralPath $CanonicalRepo)) {
  throw "Canonical repo not found: $CanonicalRepo"
}

if (-not (Test-Path -LiteralPath $WorktreeRoot)) {
  New-Item -ItemType Directory -Path $WorktreeRoot -Force | Out-Null
}

if (Test-Path -LiteralPath $path) {
  throw "Worktree path already exists: $path"
}

$existingBranch = git -C $CanonicalRepo branch --list $branch
if ($existingBranch) {
  throw "Branch already exists: $branch"
}

Write-Host "Creating branch $branch at $path"
git -C $CanonicalRepo worktree add -b $branch $path main

Write-Host ""
Write-Host "Linking shared dev tools..."
pnpm.cmd --dir $CanonicalRepo devtools:link

Write-Host ""
Write-Host "Running worktree doctor..."
pnpm.cmd --dir $CanonicalRepo worktree:doctor -Path $path

Write-Host ""
Write-Host "Summary:"
Write-Host "  branch: $branch"
Write-Host "  path:   $path"
Write-Host "  status: created and checked"
