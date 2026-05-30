$ErrorActionPreference = "Stop"

function Resolve-DevToolCommand {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name
  )

  $candidates = New-Object System.Collections.Generic.List[string]

  if ($Name -eq "gh" -and $env:FLOORCONNECTOR_GH_PATH) {
    $candidates.Add($env:FLOORCONNECTOR_GH_PATH)
  }

  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if ($command -and $command.Source) {
    $candidates.Add($command.Source)
  }

  try {
    $whereResults = where.exe $Name 2>$null
    foreach ($whereResult in @($whereResults)) {
      if ($whereResult) {
        $candidates.Add([string]$whereResult)
      }
    }
  } catch {
    # where.exe is only a discovery fallback.
  }

  if ($Name -eq "gh") {
    $commonPaths = @(
      "C:\Program Files\GitHub CLI\gh.exe",
      (Join-Path $env:ProgramFiles "GitHub CLI\gh.exe"),
      (Join-Path $env:LOCALAPPDATA "Programs\GitHub CLI\gh.exe")
    )

    foreach ($path in $commonPaths) {
      if ($path) {
        $candidates.Add($path)
      }
    }
  }

  foreach ($candidate in @($candidates | Where-Object { $_ } | Select-Object -Unique)) {
    $expanded = [Environment]::ExpandEnvironmentVariables($candidate)
    if (Test-Path -LiteralPath $expanded -PathType Leaf) {
      return (Resolve-Path -LiteralPath $expanded).Path
    }
  }

  return $null
}

function Get-GitHubCliInstallGuidance {
  return @(
    "Install GitHub CLI with one of:",
    "  winget install --id GitHub.cli",
    "  choco install gh",
    "  https://cli.github.com/",
    "Then authenticate with:",
    "  gh auth login",
    "If gh is installed outside PATH, set:",
    '  $env:FLOORCONNECTOR_GH_PATH = "C:\Program Files\GitHub CLI\gh.exe"'
  )
}
