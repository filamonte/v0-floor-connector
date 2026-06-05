param(
  [switch]$CommandsOnly
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

function Add-Check {
  param(
    [System.Collections.Generic.List[object]]$Checks,
    [string]$Name,
    [ValidateSet("required", "optional", "repo-local")]
    [string]$Kind,
    [ValidateSet("pass", "warning", "fail")]
    [string]$Status,
    [string]$Detail,
    [string]$NextStep = ""
  )

  $Checks.Add([pscustomobject]@{
    Name = $Name
    Kind = $Kind
    Status = $Status
    Detail = $Detail
    NextStep = $NextStep
  })
}

function Get-FirstLine {
  param([string]$Text)

  return (($Text -split "`r?`n") | Where-Object { $_ } | Select-Object -First 1)
}

function Get-VersionLine {
  param(
    [string]$Text
  )

  $lines = @($Text -split "`r?`n" | Where-Object { $_ })
  if ($Text -match "currently installed v?([0-9]+(?:\.[0-9]+)+)") {
    return "v$($Matches[1])"
  }

  $matchingLine = $lines | Where-Object { $_ -match "^(?:v|Version\s+)?[0-9]+(?:\.[0-9]+)+" } | Select-Object -First 1

  if ($matchingLine) {
    return $matchingLine
  }

  return Get-FirstLine $Text
}

$validationCommands = @(
  "pnpm.cmd worktree:doctor",
  "pnpm.cmd devtools:link",
  "pnpm.cmd --filter @floorconnector/web typecheck",
  "pnpm.cmd --filter @floorconnector/web lint",
  "pnpm.cmd fc:preflight:fast"
)

if ($CommandsOnly) {
  $validationCommands | ForEach-Object { Write-Host $_ }
  exit 0
}

$checks = New-Object System.Collections.Generic.List[object]

$node = Invoke-Capture "node" @("--version")
if ($node.Code -eq 0) {
  Add-Check $checks "Node" "required" "pass" $node.Output
} else {
  Add-Check $checks "Node" "required" "fail" $node.Output "Install Node 20+."
}

$pnpm = Invoke-Capture "pnpm.cmd" @("--version")
if ($pnpm.Code -eq 0) {
  Add-Check $checks "pnpm" "required" "pass" $pnpm.Output
} else {
  Add-Check $checks "pnpm" "required" "fail" $pnpm.Output "Run corepack enable, then retry."
}

foreach ($tool in @(
  @{ Name = "Prettier"; Args = @("exec", "prettier", "--version") },
  @{ Name = "Playwright"; Args = @("exec", "playwright", "--version") },
  @{ Name = "Turbo"; Args = @("exec", "turbo", "--version") },
  @{ Name = "ESLint"; Args = @("exec", "eslint", "--version") },
  @{ Name = "TypeScript"; Args = @("exec", "tsc", "--version") }
)) {
  $result = Invoke-Capture "pnpm.cmd" $tool.Args
  if ($result.Code -eq 0) {
    Add-Check $checks $tool.Name "repo-local" "pass" (Get-FirstLine $result.Output)
  } else {
    Add-Check $checks $tool.Name "repo-local" "fail" $result.Output "Run pnpm devtools:link, then pnpm install from C:\FloorConnector if dependencies are missing."
  }
}

$browser = Invoke-Capture "node" @("-e", "const { chromium } = require('@playwright/test'); const fs = require('node:fs'); const p = chromium.executablePath(); console.log(fs.existsSync(p) ? p : 'missing:' + p);")
if ($browser.Code -eq 0 -and $browser.Output -notmatch "^missing:") {
  Add-Check $checks "Playwright Chromium browser" "repo-local" "pass" $browser.Output
} else {
  Add-Check $checks "Playwright Chromium browser" "repo-local" "warning" $browser.Output "Run pnpm.cmd exec playwright install chromium when browser smoke is required."
}

$ghPath = Resolve-DevToolCommand -Name "gh"
if ($ghPath) {
  $ghVersion = Invoke-Capture $ghPath @("--version")
  Add-Check $checks "GitHub CLI" "optional" "pass" (Get-FirstLine $ghVersion.Output)
} else {
  Add-Check $checks "GitHub CLI" "optional" "warning" "not found" "Run pnpm setup:gh for install/auth guidance."
}

foreach ($optional in @("vercel", "supabase")) {
  $path = Resolve-DevToolCommand -Name $optional
  if ($path) {
    $version = Invoke-Capture $path @("--version")
    Add-Check $checks "$optional CLI" "optional" "pass" (Get-VersionLine $version.Output)
  } else {
    Add-Check $checks "$optional CLI" "optional" "warning" "not found" "Use repo-local checks when available; install only when that workflow requires it."
  }
}

Write-Host "FloorConnector tooling baseline"
Write-Host ""
foreach ($check in $checks) {
  Write-Host ("[{0}] {1} ({2}) - {3}" -f $check.Status.ToUpperInvariant(), $check.Name, $check.Kind, $check.Detail)
  if ($check.NextStep) {
    Write-Host ("      next: {0}" -f $check.NextStep)
  }
}

Write-Host ""
Write-Host "Standard feature-stream validation:"
$validationCommands | ForEach-Object { Write-Host ("  {0}" -f $_) }

if (($checks | Where-Object { $_.Kind -ne "optional" -and $_.Status -eq "fail" }).Count -gt 0) {
  exit 1
}
