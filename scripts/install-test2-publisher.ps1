$ErrorActionPreference = 'Stop'

$repo = if ($Repo) { (Resolve-Path -LiteralPath $Repo).Path } else { Split-Path -Parent $PSScriptRoot }
$node = if ($env:TEST2_NODE -and (Test-Path $env:TEST2_NODE)) { $env:TEST2_NODE } elseif (Test-Path "$env:LOCALAPPDATA\TEST2\node\node.exe") { "$env:LOCALAPPDATA\TEST2\node\node.exe" } else { 'node.exe' }
$configPath = Join-Path $repo 'config\test2-publisher-task.json'

if ($node -ne 'node.exe' -and !(Test-Path -LiteralPath $node)) { throw "Node runtime not found: $node" }
if (!(Test-Path -LiteralPath $configPath)) { throw "Publisher task manifest not found: $configPath" }

$config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
$script = Join-Path $repo ($config.script -replace '/', '\')
$taskName = [string]$config.taskName
$intervalSeconds = [int]$config.intervalSeconds
$durationDays = [int]$config.durationDays
$description = [string]$config.description

if ($intervalSeconds -lt 60) { throw "intervalSeconds must be at least 60" }
if (!(Test-Path -LiteralPath $script)) { throw "Publisher script not found: $script" }
if ($node -eq 'node.exe') { throw "A portable Node runtime is required for the hidden publisher task" }

 $scriptArgument = "`"$script`""
 $action = New-ScheduledTaskAction -Execute $node -Argument $scriptArgument -WorkingDirectory $repo
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Seconds $intervalSeconds) -RepetitionDuration (New-TimeSpan -Days $durationDays)
$settings = New-ScheduledTaskSettingsSet -Hidden -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description $description -Force | Out-Null
Write-Output "Installed: $taskName every $intervalSeconds seconds from $configPath"


