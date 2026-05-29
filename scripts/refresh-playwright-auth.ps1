param(
  [string]$CanonicalRepo = "C:\FloorConnector",
  [switch]$PortalOnly,
  [switch]$ContractorOnly
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $CanonicalRepo)) {
  throw "Canonical repo not found: $CanonicalRepo"
}

if (-not $PortalOnly) {
  Write-Host "Refreshing contractor Playwright auth state..."
  pnpm.cmd --dir $CanonicalRepo e2e:auth
}

if (-not $ContractorOnly) {
  Write-Host "Refreshing portal Playwright auth state..."
  pnpm.cmd --dir $CanonicalRepo e2e:portal-auth
}

Write-Host "Relinking shared auth state into worktrees..."
pnpm.cmd --dir $CanonicalRepo devtools:link

Write-Host "Playwright auth refresh complete."
