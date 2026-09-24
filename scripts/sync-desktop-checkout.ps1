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

    for ($attempt = 1; $attempt -le 3; $attempt++) {
        $fetchOutput = @(Invoke-Test2Git fetch origin main 2>&1)
        if ($LASTEXITCODE -eq 0) { break }
        $fetchText = $fetchOutput -join ' '
        $refRace = $fetchText -match 'incorrect old value|cannot lock ref|is at .+ but expected'
        if (-not $refRace -or $attempt -eq 3) { Log "FAIL git fetch origin main: $fetchText"; exit 1 }
        Log "INFO retrying concurrent Git fetch (attempt $attempt)"
        Start-Sleep -Milliseconds ($attempt * 250)
    }

    $behind = [int](Invoke-Test2Git rev-list --count HEAD..origin/main)
    $ahead = [int](Invoke-Test2Git rev-list --count origin/main..HEAD)
    if ($ahead -gt 0) { Log "SKIP local branch is ahead by $ahead commit(s); no files changed"; exit 0 }
    if ($behind -eq 0) { Log 'OK already up to date'; exit 0 }

    # Jira import and Status Bundler own these generated projections on GitHub.
    # Local copies are disposable and must never hold up a fast-forward-only sync.
    # Preserve genuine edits everywhere else and refuse any ahead/diverged branch.
    $generatedPatterns = @(
        '^status/generated/[^/]+\.json$',
        '^status/handoffs\.json$',
        '^status/ticket-status\.md$',
        '^status/tickets\.json$',
        '^tickets/[^/]+/status\.json$',
        '^tickets/[^/]+/ticket\.md$'
    )
    $localPaths = @(Invoke-Test2Git status --porcelain | ForEach-Object { $_.Substring(3).Trim() } | Where-Object { $_ })
    $incomingPaths = @(Invoke-Test2Git diff --name-only HEAD..origin/main | ForEach-Object { $_ -replace '\\', '/' })
    $overlap = @($localPaths | Where-Object {
        $candidate = $_ -replace '\\', '/'
        $incomingPaths -contains $candidate
    })
    $alreadyAtRemote = @()
    foreach ($relativePath in $overlap) {
        [void](Invoke-Test2Git diff --quiet origin/main -- $relativePath)
        if ($LASTEXITCODE -eq 0) { $alreadyAtRemote += $relativePath }
    }
    $unsafeOverlap = @($overlap | Where-Object {
        $candidate = $_ -replace '\\', '/'
        $sameAsRemote = $alreadyAtRemote -contains $_
        -not $sameAsRemote -and -not ($generatedPatterns | Where-Object { $candidate -match $_ })
    })
    if ($unsafeOverlap.Count -gt 0) {
        Log "SKIP incoming update touches non-generated local file(s): $($unsafeOverlap -join ', '); no files changed"
        exit 0
    }

    $discardGenerated = @($overlap | Where-Object {
        $candidate = $_ -replace '\\', '/'
        ($alreadyAtRemote -contains $_) -or ($generatedPatterns | Where-Object { $candidate -match $_ })
    })
    $unrelatedLocalPaths = @($localPaths | Where-Object { $incomingPaths -notcontains ($_ -replace '\\', '/') })
    if ($unrelatedLocalPaths.Count -gt 0) {
        Log "INFO preserving unrelated local file(s): $($unrelatedLocalPaths -join ', ')"
    }
    if ($discardGenerated.Count -gt 0) {
        Log "INFO backing up and refreshing safe incoming overlap(s) from GitHub: $($discardGenerated -join ', ')"
        foreach ($relativePath in $discardGenerated) {
            $target = Join-Path $Repo ($relativePath -replace '/', '\\')
            if (Test-Path -LiteralPath $target) {
                $backupRoot = Join-Path $Repo '.agent-staging/desktop-sync-backup'
                $backupStamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
                $backupPath = Join-Path $backupRoot (($relativePath -replace '/', '\\') + ".local-backup.$backupStamp")
                New-Item -ItemType Directory -Force -Path (Split-Path -Parent $backupPath) | Out-Null
                Copy-Item -LiteralPath $target -Destination $backupPath
                $sourceHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $target).Hash
                $backupHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $backupPath).Hash
                if ($sourceHash -ne $backupHash) {
                    throw "Local backup verification failed for $relativePath; refusing to replace it"
                }
                Remove-Item -LiteralPath $target -Force
            }
        }
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

