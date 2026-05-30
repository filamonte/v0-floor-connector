$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "dev-tool-paths.ps1")

function Invoke-WaveGit {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Repo,
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  try {
    $output = git -C $Repo @Arguments 2>&1
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

function Get-WaveGitHubRepoSlug {
  param([string]$Repo)

  $remote = Invoke-WaveGit -Repo $Repo -Arguments @("remote", "get-url", "origin")
  if ($remote.Code -ne 0 -or -not $remote.Output) {
    return ""
  }

  $url = $remote.Output.Trim()
  if ($url -match "github\.com[:/](?<owner>[^/]+)/(?<repo>[^/]+?)(\.git)?$") {
    return "{0}/{1}" -f $Matches.owner, $Matches.repo
  }

  return ""
}

function Get-WaveFallbackPullRequest {
  param(
    [string]$Repo,
    [string]$Branch
  )

  $upstream = Invoke-WaveGit -Repo $Repo -Arguments @(
    "rev-parse",
    "--abbrev-ref",
    "--symbolic-full-name",
    "@{upstream}"
  )
  if ($upstream.Code -ne 0 -or -not $upstream.Output) {
    return $null
  }

  $upstreamSha = Invoke-WaveGit -Repo $Repo -Arguments @("rev-parse", $upstream.Output)
  if ($upstreamSha.Code -ne 0 -or -not $upstreamSha.Output) {
    return $null
  }

  $pullRefs = Invoke-WaveGit -Repo $Repo -Arguments @(
    "for-each-ref",
    "--format=%(refname:short) %(objectname)",
    "refs/remotes/origin/pr"
  )
  if ($pullRefs.Code -ne 0 -or -not $pullRefs.Output) {
    return $null
  }

  $repoSlug = Get-WaveGitHubRepoSlug -Repo $Repo
  foreach ($line in @($pullRefs.Output -split "`r?`n")) {
    if ($line -notmatch "^origin/pr/(?<number>\d+)\s+(?<sha>[0-9a-f]{40})$") {
      continue
    }

    if ($Matches.sha -ne $upstreamSha.Output) {
      continue
    }

    $url = if ($repoSlug) {
      "https://github.com/$repoSlug/pull/$($Matches.number)"
    } else {
      ""
    }

    return [pscustomobject]@{
      Number = [int]$Matches.number
      Url = $url
      IsDraft = $null
      State = "unknown"
      HeadRefName = $Branch
      HeadSha = $Matches.sha
      Source = "git-ref-fallback"
    }
  }

  return $null
}

function Get-WaveOpenPullRequestForBranch {
  param(
    [string]$Repo,
    [string]$Branch
  )

  $ghPath = Resolve-DevToolCommand -Name "gh"
  if ($ghPath) {
    & $ghPath auth status 1>$null 2>$null
    if ($LASTEXITCODE -eq 0) {
      $json = & $ghPath pr list --head $Branch --state open --json number,url,isDraft,state,headRefName,headRefOid 2>$null
      if ($LASTEXITCODE -ne 0) {
        return [pscustomobject]@{
          PullRequest = $null
          Warning = "GitHub CLI could not read PR metadata for $Branch."
          Source = "gh-error"
        }
      }

      if ($json -and $json -ne "[]") {
        $prs = @($json | ConvertFrom-Json)
        $pr = $prs[0]
        return [pscustomobject]@{
          PullRequest = [pscustomobject]@{
            Number = [int]$pr.number
            Url = [string]$pr.url
            IsDraft = [bool]$pr.isDraft
            State = [string]$pr.state
            HeadRefName = [string]$pr.headRefName
            HeadSha = [string]$pr.headRefOid
            Source = "gh"
          }
          Warning = ""
          Source = "gh"
        }
      }

      return [pscustomobject]@{
        PullRequest = $null
        Warning = ""
        Source = "gh"
      }
    }

    return [pscustomobject]@{
      PullRequest = (Get-WaveFallbackPullRequest -Repo $Repo -Branch $Branch)
      Warning = "GitHub CLI is available but not authenticated; PR drift guard used local origin/pr refs if present."
      Source = "gh-unauthenticated"
    }
  }

  return [pscustomobject]@{
    PullRequest = (Get-WaveFallbackPullRequest -Repo $Repo -Branch $Branch)
    Warning = "GitHub CLI is unavailable; PR drift guard used local origin/pr refs if present and cannot confirm open/draft state."
    Source = "gh-unavailable"
  }
}

function Get-WavePullRequestDrift {
  param(
    [string]$Repo = (Get-Location).Path,
    [string]$Branch = ""
  )

  if (-not $Branch) {
    $branchResult = Invoke-WaveGit -Repo $Repo -Arguments @("branch", "--show-current")
    if ($branchResult.Code -eq 0) {
      $Branch = $branchResult.Output
    }
  }

  if (-not $Branch) {
    return [pscustomobject]@{
      Status = "unknown-no-branch"
      Branch = ""
      HasPullRequest = $false
      PullRequestNumber = $null
      PullRequestUrl = ""
      PullRequestState = ""
      PullRequestIsDraft = $null
      PullRequestHeadRef = ""
      PullRequestHeadSha = ""
      LocalHeadSha = ""
      LocalOnlyCommitCount = $null
      Warning = "PR drift guard cannot inspect a detached HEAD or unnamed branch."
      SuggestedAction = "Switch to a named stream branch before opening or updating a PR."
    }
  }

  $localHead = Invoke-WaveGit -Repo $Repo -Arguments @("rev-parse", "HEAD")
  $localHeadSha = if ($localHead.Code -eq 0) { $localHead.Output } else { "" }
  $lookup = Get-WaveOpenPullRequestForBranch -Repo $Repo -Branch $Branch
  $pr = $lookup.PullRequest

  if (-not $pr) {
    $status = if ($lookup.Source -eq "gh") { "no-open-pr" } else { "unknown-gh-unavailable" }
    return [pscustomobject]@{
      Status = $status
      Branch = $Branch
      HasPullRequest = $false
      PullRequestNumber = $null
      PullRequestUrl = ""
      PullRequestState = ""
      PullRequestIsDraft = $null
      PullRequestHeadRef = ""
      PullRequestHeadSha = ""
      LocalHeadSha = $localHeadSha
      LocalOnlyCommitCount = $null
      Warning = $lookup.Warning
      SuggestedAction = if ($lookup.Warning) { "Install/authenticate gh or fetch PR refs to inspect PR drift." } else { "" }
    }
  }

  $localOnlyCommitCount = $null
  $headKnownLocally = $false
  if ($pr.HeadSha) {
    $catFile = Invoke-WaveGit -Repo $Repo -Arguments @("cat-file", "-e", "$($pr.HeadSha)^{commit}")
    $headKnownLocally = ($catFile.Code -eq 0)
    if ($headKnownLocally) {
      $count = Invoke-WaveGit -Repo $Repo -Arguments @("rev-list", "--count", "$($pr.HeadSha)..HEAD")
      if ($count.Code -eq 0 -and $count.Output -match "^\d+$") {
        $localOnlyCommitCount = [int]$count.Output
      }
    }
  }

  $status = "ok"
  $warning = $lookup.Warning
  $suggestedAction = ""
  if (-not $pr.HeadSha) {
    $status = "unknown-missing-pr-head"
    $warning = (($warning, "PR drift guard could not read the PR head SHA.") | Where-Object { $_ }) -join " "
    $suggestedAction = "Inspect the PR manually before pushing."
  } elseif ($localHeadSha -eq $pr.HeadSha) {
    $status = "ok"
  } elseif ($headKnownLocally -and $localOnlyCommitCount -gt 0) {
    $status = "local-ahead-of-pr"
    $warning = "Local branch has commits not included in open PR #$($pr.Number). Pushing now may widen the PR."
    $suggestedAction = "Do not push unless intentionally updating this PR. Create a new branch/PR for unrelated follow-up work, or reconcile/reset carefully after the current PR is merged."
  } else {
    $status = "head-differs"
    $warning = "Local HEAD differs from PR #$($pr.Number) head, but the PR head commit is not available locally for ancestry checks."
    $suggestedAction = "Fetch PR refs or inspect the PR manually before pushing."
  }

  return [pscustomobject]@{
    Status = $status
    Branch = $Branch
    HasPullRequest = $true
    PullRequestNumber = $pr.Number
    PullRequestUrl = $pr.Url
    PullRequestState = $pr.State
    PullRequestIsDraft = $pr.IsDraft
    PullRequestHeadRef = $pr.HeadRefName
    PullRequestHeadSha = $pr.HeadSha
    LocalHeadSha = $localHeadSha
    LocalOnlyCommitCount = $localOnlyCommitCount
    Warning = $warning
    SuggestedAction = $suggestedAction
  }
}

function Write-WavePullRequestDriftWarning {
  param(
    [Parameter(Mandatory = $true)]
    $Drift
  )

  if (-not $Drift.Warning) {
    return
  }

  Write-Host ""
  Write-Host "PR drift guard warning:" -ForegroundColor Yellow
  Write-Host ("  {0}" -f $Drift.Warning) -ForegroundColor Yellow
  if ($Drift.PullRequestNumber) {
    Write-Host ("  PR: #{0} {1}" -f $Drift.PullRequestNumber, $Drift.PullRequestUrl) -ForegroundColor Yellow
  }
  if ($Drift.LocalHeadSha) {
    Write-Host ("  Local HEAD: {0}" -f $Drift.LocalHeadSha) -ForegroundColor Yellow
  }
  if ($Drift.PullRequestHeadSha) {
    Write-Host ("  PR head:    {0}" -f $Drift.PullRequestHeadSha) -ForegroundColor Yellow
  }
  if ($null -ne $Drift.LocalOnlyCommitCount) {
    Write-Host ("  Local-only commits: {0}" -f $Drift.LocalOnlyCommitCount) -ForegroundColor Yellow
  }
  if ($Drift.SuggestedAction) {
    Write-Host ("  Suggested action: {0}" -f $Drift.SuggestedAction) -ForegroundColor Yellow

  }
}
