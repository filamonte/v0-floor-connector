param(
  [switch]$InstallWithWinget
)

$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "lib\dev-tool-paths.ps1")

function Invoke-Capture {
  param(
    [string]$Command,
    [string[]]$Arguments
  )

  try {
    $output = & $Command @Arguments 2>&1
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

function Write-Guidance {
  Get-GitHubCliInstallGuidance | ForEach-Object { Write-Host $_ }
}

$ghPath = Resolve-DevToolCommand -Name "gh"

if (-not $ghPath -and $InstallWithWinget) {
  $winget = Resolve-DevToolCommand -Name "winget"
  if (-not $winget) {
    Write-Host "winget was not found. GitHub CLI was not installed." -ForegroundColor Yellow
    Write-Guidance
    exit 0
  }

  Write-Host "Installing GitHub CLI with winget..."
  & $winget install --id GitHub.cli --accept-package-agreements --accept-source-agreements
  if ($LASTEXITCODE -ne 0) {
    Write-Host "winget install did not complete successfully." -ForegroundColor Yellow
    Write-Guidance
    exit 0
  }

  $ghPath = Resolve-DevToolCommand -Name "gh"
}

if (-not $ghPath) {
  Write-Host "GitHub CLI was not found." -ForegroundColor Yellow
  Write-Guidance
  exit 0
}

Write-Host "GitHub CLI found:"
Write-Host "  $ghPath"
Write-Host ""

$version = Invoke-Capture $ghPath @("--version")
if ($version.Code -eq 0) {
  Write-Host "Version:"
  Write-Host $version.Output
} else {
  Write-Host "Could not read GitHub CLI version:" -ForegroundColor Yellow
  Write-Host $version.Output
}

Write-Host ""
Write-Host "Auth status:"
$auth = Invoke-Capture $ghPath @("auth", "status")
if ($auth.Output) {
  Write-Host $auth.Output
}

if ($auth.Code -ne 0) {
  Write-Host ""
  Write-Host "GitHub CLI is available but unauthenticated." -ForegroundColor Yellow
  Write-Host "Run:"
  Write-Host "  gh auth login"
}
