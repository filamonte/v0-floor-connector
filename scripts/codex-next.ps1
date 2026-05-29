param(
  [string]$PlanPath = "C:\FloorConnector\.codex\active-stream-plan.md"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $PlanPath)) {
  throw "Plan not found: $PlanPath"
}

$items = @()
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
    $items += $line
  }
}

Write-Host "Recommended next implementation prompt order:"
foreach ($item in $items) {
  Write-Host ("  {0}" -f $item)
}
