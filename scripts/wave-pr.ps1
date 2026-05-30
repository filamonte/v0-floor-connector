param(
  [string]$Wave = "",
  [string]$Stream = "",
  [string]$Summary = "",
  [string]$Validation = "",
  [string]$Risks = "",
  [string]$Rollback = "",
  [switch]$Ready,
  [switch]$SkipLabels,
  [switch]$AllowUpdateExistingPr,
  [string]$Base = "main"
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib\wave-pr-guards.ps1")
. (Join-Path $PSScriptRoot "lib\dev-tool-paths.ps1")

$repo = (git rev-parse --show-toplevel).Trim()
$branch = (git -C $repo branch --show-current).Trim()

if (-not $branch) {
  throw "Detached HEAD or no current branch. Create or switch to a named stream branch before opening a PR."
}

if ($branch -eq $Base) {
  throw "Refusing to open a PR from $Base. Use a stream branch."
}

if (-not $Wave) { $Wave = $branch -replace "^stream/", "" }
if (-not $Stream) { $Stream = $branch -replace "^stream/", "" }
if (-not $Summary) { $Summary = "Wave implementation for $Wave." }
if (-not $Validation) { $Validation = "Not reported yet. Run pnpm wave:review and targeted validation before marking ready." }
if (-not $Risks) { $Risks = "Requires human review for FloorConnector architecture guardrails." }
if (-not $Rollback) { $Rollback = "Revert this PR before merge, or revert the merge commit after merge if needed." }

$dirty = (git -C $repo status --porcelain)
if ($dirty) {
  Write-Host "Warning: working tree has uncommitted changes." -ForegroundColor Yellow
  git -C $repo status --short
  $continue = Read-Host "Continue opening a PR from committed branch state only? Type YES to continue"
  if ($continue -ne "YES") {
    throw "Aborted because working tree is dirty."
  }
}

$prDrift = Get-WavePullRequestDrift -Repo $repo -Branch $branch
if ($prDrift.HasPullRequest) {
  if ($prDrift.Status -eq "ok") {
    Write-Host "Open PR already exists and local HEAD matches the PR head:"
    Write-Host ("  PR #{0}: {1}" -f $prDrift.PullRequestNumber, $prDrift.PullRequestUrl)
    Write-Host "No duplicate PR was created. No merge, auto-merge, ready-for-review transition, branch deletion, or worktree deletion was performed."
    exit 0
  }

  if (-not $AllowUpdateExistingPr) {
    Write-WavePullRequestDriftWarning -Drift $prDrift
    Write-Host ""
    Write-Host "Refusing to push or update the existing PR by default." -ForegroundColor Yellow
    Write-Host "Next steps:"
    Write-Host "  - Leave the draft PR untouched if these local commits are unrelated."
    Write-Host "  - Create a new branch/PR for later work."
    Write-Host "  - Re-run with -AllowUpdateExistingPr only when intentionally updating this PR."
    Write-Host "  - Reconcile/reset carefully after the current PR is merged if needed."
    exit 0
  }

  Write-WavePullRequestDriftWarning -Drift $prDrift
  Write-Host ""
  Write-Host "AllowUpdateExistingPr was supplied; pushing current branch to update existing PR #$($prDrift.PullRequestNumber)." -ForegroundColor Yellow
}

$upstream = git -C $repo rev-parse --abbrev-ref --symbolic-full-name "@{upstream}" 2>$null
if ($LASTEXITCODE -ne 0 -or -not $upstream) {
  Write-Host "No upstream configured for $branch." -ForegroundColor Yellow
  $push = if ($prDrift.HasPullRequest -and $AllowUpdateExistingPr) {
    "YES"
  } else {
    Read-Host "Push with -u origin $branch before opening the PR? Type YES to push"
  }
  if ($push -eq "YES") {
    git -C $repo push -u origin $branch
    if ($LASTEXITCODE -ne 0) {
      throw "git push -u origin $branch failed."
    }
  } else {
    Write-Host ""
    Write-Host "Manual PR setup required because the branch has no upstream:"
    Write-Host "  git push -u origin $branch"
  }
}

if ($prDrift.HasPullRequest -and $AllowUpdateExistingPr) {
  git -C $repo push
  if ($LASTEXITCODE -ne 0) {
    throw "git push failed while updating PR #$($prDrift.PullRequestNumber)."
  }

  Write-Host ""
  Write-Host "Existing PR updated:"
  Write-Host ("  PR #{0}: {1}" -f $prDrift.PullRequestNumber, $prDrift.PullRequestUrl)
  Write-Host "No duplicate PR was created. No ready-for-review transition, merge, auto-merge, branch deletion, or worktree deletion was performed."
  exit 0
}

$filesChanged = git -C $repo diff --name-only "$Base...HEAD" 2>$null
if ($LASTEXITCODE -ne 0 -or -not $filesChanged) {
  $filesChanged = git -C $repo diff-tree --no-commit-id --name-only -r HEAD
}

$fileList = if ($filesChanged) {
  ($filesChanged | ForEach-Object { "- $_" }) -join "`n"
} else {
  "- No changed files detected from $Base...HEAD."
}

$codexReviewText = "@codex review this PR for FloorConnector architecture drift, tenant/security regressions, readiness workflow bypasses, duplicate canonical models, financial/payment-state issues, missing tests, and missing docs updates."
$draftNote = if ($Ready) {
  "Human explicitly requested non-draft PR creation with --ready. Do not merge until review and validation are complete."
} else {
  "Draft by default. Do not mark ready until pnpm wave:review, pnpm worktree:audit, targeted validation, and human confirmation are complete."
}

$title = "[$Stream] $Wave"
$body = @"
## Wave / Stream

- Wave: $Wave
- Stream: $Stream

## Summary

$Summary

## Files Changed

$fileList

## Validation Run

$Validation

## Risks

$Risks

## Rollback Notes

$Rollback

## Codex Review Request

$codexReviewText

## Draft PR Safety

$draftNote

No automatic merge, auto-merge, ready-for-review transition, branch deletion, or worktree deletion is authorized by this PR.
"@

$ghPath = Resolve-DevToolCommand -Name "gh"
if (-not $ghPath) {
  Write-Host "GitHub CLI is not installed or not on PATH." -ForegroundColor Yellow
  Get-GitHubCliInstallGuidance | ForEach-Object { Write-Host $_ }
  Write-Host ""
  Write-Host "Create this PR manually in GitHub:"
  Write-Host "- Base: $Base"
  Write-Host "- Compare: $branch"
  Write-Host "- State: Draft"
  Write-Host "- Title: $title"
  Write-Host ""
  Write-Host $body
  exit 0
}

& $ghPath auth status 1>$null 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "GitHub CLI is not authenticated." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Create this PR manually in GitHub:"
  Write-Host "- Base: $Base"
  Write-Host "- Compare: $branch"
  Write-Host "- State: Draft"
  Write-Host "- Title: $title"
  Write-Host ""
  Write-Host $body
  exit 0
}

$bodyFile = Join-Path ([System.IO.Path]::GetTempPath()) ("floorconnector-wave-pr-{0}.md" -f ([guid]::NewGuid()))
Set-Content -LiteralPath $bodyFile -Value $body -Encoding UTF8

try {
  $args = @("pr", "create", "--base", $Base, "--head", $branch, "--title", $title, "--body-file", $bodyFile)
  if (-not $Ready) {
    $args += "--draft"
  }

  $prUrl = & $ghPath @args
  if ($LASTEXITCODE -ne 0) {
    throw "gh pr create failed."
  }

  Write-Host ""
  Write-Host "PR created:"
  Write-Host $prUrl

  if ($SkipLabels) {
    Write-Host ""
    Write-Host "Skipping label application by request."
  } else {
    Write-Host ""
    Write-Host "Labels are best-effort:"
    foreach ($label in @("codex", "wave", "needs-verification")) {
      $labelOutput = $null
      $labelExitCode = 0

      try {
        $labelOutput = & $ghPath pr edit $prUrl --add-label $label 2>&1
        $labelExitCode = $LASTEXITCODE
      } catch {
        $labelExitCode = 1
        $labelOutput = $_.Exception.Message
      }

      if ($labelExitCode -eq 0) {
        Write-Host "  added $label"
      } else {
        $labelMessage = ($labelOutput | Out-String).Trim()
        if (-not $labelMessage) {
          $labelMessage = "gh pr edit exited with code $labelExitCode"
        }
        Write-Host "  warning: could not add $label - $labelMessage" -ForegroundColor Yellow
      }
    }
  }

  if (-not $Ready) {
    Write-Host ""
    Write-Host "Draft PR created by default. No ready-for-review transition, merge, auto-merge, branch deletion, or worktree deletion was performed."
  }
} finally {
  Remove-Item -LiteralPath $bodyFile -Force -ErrorAction SilentlyContinue
}
