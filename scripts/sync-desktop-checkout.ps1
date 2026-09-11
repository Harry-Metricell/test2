[CmdletBinding()]
param(
    [string]$Repo = $PSScriptRoot | Split-Path,
    [string]$LogPath = "$env:LOCALAPPDATA\TEST2\desktop-sync.log"
)

$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $LogPath) | Out-Null

function Log([string]$Message) {
    $line = "$(Get-Date -Format o) $Message"
    Add-Content -LiteralPath $LogPath -Value $line
}

Push-Location $Repo
try {
    $branch = (git branch --show-current).Trim()
    if ($branch -ne 'main') { Log "SKIP branch is '$branch', expected main"; exit 0 }

    git fetch --quiet origin main
    if ($LASTEXITCODE -ne 0) { Log 'FAIL git fetch origin main'; exit 1 }

    $changes = @(git status --porcelain)
    if ($changes.Count -gt 0) {
        Log "SKIP local changes present ($($changes.Count) item(s)); no files changed"
        exit 0
    }

    $behind = [int](git rev-list --count HEAD..origin/main)
    $ahead = [int](git rev-list --count origin/main..HEAD)
    if ($ahead -gt 0) { Log "SKIP local branch is ahead by $ahead commit(s); no files changed"; exit 0 }
    if ($behind -eq 0) { Log 'OK already up to date'; exit 0 }

    git merge --ff-only origin/main --quiet
    if ($LASTEXITCODE -ne 0) { Log 'FAIL fast-forward refused'; exit 1 }
    Log "OK fast-forwarded by $behind commit(s)"
}
catch {
    Log "FAIL $($_.Exception.Message)"
    exit 1
}
finally { Pop-Location }
