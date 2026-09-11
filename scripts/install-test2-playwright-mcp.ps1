param(
    [string]$Repo = (Split-Path -Parent $PSScriptRoot),
    [string]$Node = (Join-Path $env:LOCALAPPDATA 'TEST2\node\node.exe'),
    [string]$ImportStorageState = ''
)

$ErrorActionPreference = 'Stop'

$repoPath = (Resolve-Path -LiteralPath $Repo).Path
$nodePath = (Resolve-Path -LiteralPath $Node).Path
$mcpCli = Join-Path $repoPath 'node_modules\@playwright\mcp\cli.js'
if (-not (Test-Path -LiteralPath $mcpCli -PathType Leaf)) {
    throw 'Playwright MCP is not installed. Run npm.cmd install in the repository first.'
}

$test2Root = Join-Path $env:LOCALAPPDATA 'TEST2'
$authDir = Join-Path $test2Root 'auth'
$storageState = Join-Path $authDir 'user.json'
$stagingRoot = Join-Path $test2Root 'staging'
New-Item -ItemType Directory -Force -Path $authDir, $stagingRoot | Out-Null

if ($ImportStorageState) {
    $sourceState = (Resolve-Path -LiteralPath $ImportStorageState).Path
    Copy-Item -LiteralPath $sourceState -Destination $storageState -Force
}
if (-not (Test-Path -LiteralPath $storageState -PathType Leaf)) {
    throw "Saved login is missing. Re-run with -ImportStorageState pointing to a private Playwright .auth\user.json file."
}

$configDir = Join-Path $env:USERPROFILE '.codex'
$configPath = Join-Path $configDir 'config.toml'
New-Item -ItemType Directory -Force -Path $configDir | Out-Null
$config = if (Test-Path -LiteralPath $configPath) { Get-Content -LiteralPath $configPath -Raw } else { '' }

$begin = '# BEGIN TEST2 PLAYWRIGHT MCP'
$end = '# END TEST2 PLAYWRIGHT MCP'
if ($config -notmatch [regex]::Escape($begin) -and $config -match '(?m)^\[mcp_servers\.playwright\]\s*$') {
    throw 'An unmanaged mcp_servers.playwright entry already exists in config.toml. Remove or rename it before installing TEST2 Playwright MCP.'
}

foreach ($value in @($nodePath, $mcpCli, $storageState, $stagingRoot)) {
    if ($value.Contains("'")) { throw "TOML path contains an unsupported apostrophe: $value" }
}

$block = @"
$begin
[mcp_servers.playwright]
command = '$nodePath'
args = ['$mcpCli', '--isolated', '--storage-state', '$storageState', '--output-dir', '$stagingRoot', '--viewport-size', '1440x900', '--timeout-action', '10000']
cwd = '$stagingRoot'
startup_timeout_sec = 120
tool_timeout_sec = 120
enabled = true
$end
"@

$pattern = '(?s)' + [regex]::Escape($begin) + '.*?' + [regex]::Escape($end)
if ($config -match $pattern) {
    $updated = [regex]::Replace($config, $pattern, $block)
} else {
    $updated = $config.TrimEnd() + "`r`n`r`n" + $block + "`r`n"
}

if (Test-Path -LiteralPath $configPath) {
    Copy-Item -LiteralPath $configPath -Destination "$configPath.test2-backup" -Force
}
Set-Content -LiteralPath $configPath -Value $updated -Encoding utf8

Write-Host 'Playwright MCP configured for TEST2.'
Write-Host "Evidence root: $stagingRoot"
Write-Host 'Restart the Codex desktop app before starting a new tester task.'

