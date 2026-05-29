param(
  [string]$PlanPath = "C:\FloorConnector\.codex\active-stream-plan.md",
  [string]$RegistryPath = "C:\FloorConnector\active-worktrees.md"
)

$ErrorActionPreference = "Stop"

Write-Host "FloorConnector Codex Streams"
Write-Host ""

if (Test-Path -LiteralPath $RegistryPath) {
  Write-Host "Active streams:"
  Get-Content -LiteralPath $RegistryPath |
    Where-Object { $_ -match '^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|.*\|\s*Active\s*\|' } |
    ForEach-Object {
      $cells = $_ -split "\|"
      $worktree = $cells[1].Trim()
      $branch = $cells[2].Trim()
      $wave = if ($cells.Count -gt 9) { $cells[9].Trim() } else { "" }
      if ($worktree -ne '`main`') {
        Write-Host ("  {0} -> {1} | {2}" -f $worktree, $branch, $wave)
      }
    }

  Write-Host ""
  Write-Host "Paused or legacy streams:"
  Get-Content -LiteralPath $RegistryPath |
    Where-Object { $_ -match '^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|' -and $_ -notmatch '\|\s*Active\s*\|' } |
    ForEach-Object {
      $cells = $_ -split "\|"
      if ($cells.Count -gt 5) {
        if ($cells[1].Trim() -ne '`main`') {
          Write-Host ("  {0} -> {1} | {2}" -f $cells[1].Trim(), $cells[2].Trim(), $cells[5].Trim())
        }
      }
    }
} else {
  Write-Host "Registry not found: $RegistryPath"
}

Write-Host ""
Write-Host "Recommended next prompt order:"
if (Test-Path -LiteralPath $PlanPath) {
  $inSection = $false
  foreach ($line in Get-Content -LiteralPath $PlanPath) {
    if ($line -eq "## Recommended Next Prompt Order") {
      $inSection = $true
      continue
    }

    if ($inSection -and $line -match "^## ") {
      break
    }

    if ($inSection -and $line -match "^\d+\. ") {
      Write-Host ("  {0}" -f $line)
    }
  }
} else {
  Write-Host "  Plan not found: $PlanPath"
}
