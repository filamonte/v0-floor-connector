param(
  [string]$Path = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
  param(
    [string]$Name,
    [scriptblock]$Command
  )

  Write-Host ""
  Write-Host "== $Name =="
  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$Name failed with exit code $LASTEXITCODE"
  }
}

function Get-ChangedFiles {
  $tracked = git -C $Path diff --name-only HEAD
  $untracked = git -C $Path ls-files --others --exclude-standard
  return @($tracked + $untracked) |
    Where-Object { $_ } |
    Sort-Object -Unique
}

Invoke-Step "worktree:doctor" { pnpm.cmd --dir $Path worktree:doctor }
Invoke-Step "worktree:audit" { pnpm.cmd --dir $Path worktree:audit }

Write-Host ""
Write-Host "== git status =="
git -C $Path status --short --branch

$changedFiles = @(Get-ChangedFiles)
Write-Host ""
Write-Host "== changed files =="
if ($changedFiles.Count -eq 0) {
  Write-Host "No changed files."
} else {
  $changedFiles | ForEach-Object { Write-Host "  $_" }
}

$prettierExtensions = @(".css", ".html", ".js", ".jsx", ".json", ".jsonc", ".md", ".mdx", ".mjs", ".ts", ".tsx", ".yaml", ".yml")
$prettierFiles = @(
  $changedFiles | Where-Object {
    $extension = [System.IO.Path]::GetExtension($_)
    $prettierExtensions -contains $extension
  }
)

Write-Host ""
Write-Host "== prettier check =="
if ($prettierFiles.Count -eq 0) {
  Write-Host "No changed Prettier-supported files detected."
} else {
  pnpm.cmd --dir $Path exec prettier --check @prettierFiles
  if ($LASTEXITCODE -ne 0) {
    throw "Prettier check failed."
  }
}

Write-Host ""
Write-Host "== targeted validation reminder =="
Write-Host "- Run targeted tests for changed helpers, actions, read models, scripts, or protected routes."
Write-Host "- Report any auth, fixture, data, or environment blocker honestly."
Write-Host "- Do not treat redirects, login pages, missing fixtures, or 404s as successful QA unless expected."

Write-Host ""
Write-Host "== merge-readiness checklist =="
Write-Host "- No duplicate business models."
Write-Host "- No portal-only copies of canonical records."
Write-Host "- No detached invoice/payment/contract/signature models."
Write-Host "- No financial math or payment-state changes without targeted tests."
Write-Host "- No auth, tenant isolation, RLS, or portal-access drift without validation."
Write-Host "- No readiness, signature, scheduling, invoice, or payment gate bypass."
Write-Host "- No autonomous AI/provider actions unless explicitly scoped and reviewed."
Write-Host "- Docs updated when implementation behavior changed."
Write-Host "- PR remains draft until human confirms readiness."
Write-Host "- No merge, auto-merge, branch deletion, or worktree deletion is performed by this script."

