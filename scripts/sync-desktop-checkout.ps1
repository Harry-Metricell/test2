[CmdletBinding()]
param(
    [string]$Repo,
    [string]$LogPath = "$env:LOCALAPPDATA\TEST2\desktop-sync.log"
)

$ErrorActionPreference = 'Stop'
$Repo = if ($Repo) { (Resolve-Path -LiteralPath $Repo).Path } else { Split-Path -Parent $PSScriptRoot }
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $LogPath) | Out-Null

function Log([string]$Message) {
    $line = "$(Get-Date -Format o) $Message"
    Add-Content -LiteralPath $LogPath -Value $line
}

Push-Location $Repo
try {
    $branch = (git branch --show-current).Trim()
    if ($branch -ne 'main') { Log "SKIP branch is '$branch', expected main"; exit 0 }

    $fetchOutput = git fetch origin main 2>&1
    if ($LASTEXITCODE -ne 0) { Log "FAIL git fetch origin main: $($fetchOutput -join ' ')"; exit 1 }

    $behind = [int](git rev-list --count HEAD..origin/main)
    $ahead = [int](git rev-list --count origin/main..HEAD)
    if ($ahead -gt 0) { Log "SKIP local branch is ahead by $ahead commit(s); no files changed"; exit 0 }
    if ($behind -eq 0) { Log 'OK already up to date'; exit 0 }

    $localPaths = @(git status --porcelain | ForEach-Object { $_.Substring(3).Trim() } | Where-Object { $_ })
    if ($localPaths.Count -gt 0) {
        $incomingPaths = @(git diff --name-only HEAD..origin/main)
        $overlap = @($localPaths | Where-Object { $incomingPaths -contains $_ })
        if ($overlap.Count -gt 0) {
            Log "SKIP incoming update touches local file(s): $($overlap -join ', '); no files changed"
            exit 0
        }
        Log "INFO preserving unrelated local file(s): $($localPaths -join ', ')"
    }

    $mergeOutput = git merge --ff-only origin/main 2>&1
    if ($LASTEXITCODE -ne 0) { Log "FAIL fast-forward refused: $($mergeOutput -join ' ')"; exit 1 }
    Log "OK fast-forwarded by $behind commit(s)"
}
catch {
    Log "FAIL $($_.Exception.Message)"
    exit 1
}
finally { Pop-Location }

