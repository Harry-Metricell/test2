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

function Resolve-Test2Git {
    $candidates = @()
    if ($env:TEST2_GIT) { $candidates += $env:TEST2_GIT }
    $candidates += 'C:\Users\harry.piper\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe'

    $desktopRoot = Join-Path $env:LOCALAPPDATA 'GitHubDesktop'
    if (Test-Path -LiteralPath $desktopRoot) {
        $candidates += Get-ChildItem -LiteralPath $desktopRoot -Directory -Filter 'app-*' -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending |
            ForEach-Object { Join-Path $_.FullName 'resources\app\git\cmd\git.exe' }
    }
    $candidates += 'C:\Program Files\Git\cmd\git.exe'

    $found = $candidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
    if ($found) { return $found }

    $command = Get-Command git -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }
    throw 'Git was not found. Install GitHub Desktop or set TEST2_GIT to the full path of git.exe.'
}

$script:GitExe = Resolve-Test2Git

function Invoke-Test2Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
    # Git writes normal fetch progress to stderr.  Do not let PowerShell treat
    # that normal output as a terminating error; callers check $LASTEXITCODE.
    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try { & $script:GitExe @Arguments }
    finally { $ErrorActionPreference = $previousPreference }
}

Push-Location $Repo
try {
    $branch = (Invoke-Test2Git branch --show-current).Trim()
    if ($branch -ne 'main') { Log "SKIP branch is '$branch', expected main"; exit 0 }

    $fetchOutput = @(Invoke-Test2Git fetch origin main 2>&1)
    if ($LASTEXITCODE -ne 0) { Log "FAIL git fetch origin main: $($fetchOutput -join ' ')"; exit 1 }

    $behind = [int](Invoke-Test2Git rev-list --count HEAD..origin/main)
    $ahead = [int](Invoke-Test2Git rev-list --count origin/main..HEAD)
    if ($ahead -gt 0) { Log "SKIP local branch is ahead by $ahead commit(s); no files changed"; exit 0 }
    if ($behind -eq 0) { Log 'OK already up to date'; exit 0 }

    $localPaths = @(Invoke-Test2Git status --porcelain | ForEach-Object { $_.Substring(3).Trim() } | Where-Object { $_ })
    if ($localPaths.Count -gt 0) {
        $incomingPaths = @(Invoke-Test2Git diff --name-only HEAD..origin/main)
        $overlap = @($localPaths | Where-Object { $incomingPaths -contains $_ })
        if ($overlap.Count -gt 0) {
            Log "SKIP incoming update touches local file(s): $($overlap -join ', '); no files changed"
            exit 0
        }
        Log "INFO preserving unrelated local file(s): $($localPaths -join ', ')"
    }

    $mergeOutput = @(Invoke-Test2Git merge --ff-only origin/main 2>&1)
    if ($LASTEXITCODE -ne 0) { Log "FAIL fast-forward refused: $($mergeOutput -join ' ')"; exit 1 }
    Log "OK fast-forwarded by $behind commit(s)"
}
catch {
    Log "FAIL $($_.Exception.Message)"
    exit 1
}
finally { Pop-Location }

