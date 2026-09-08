$ErrorActionPreference = 'Stop'

$repo = 'C:\Users\harry.piper\Documents\ChatGPT\Test2-github'
$node = 'C:\Users\harry.piper\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$configPath = Join-Path $repo 'config\test2-publisher-task.json'

if (!(Test-Path -LiteralPath $node)) { throw "Bundled Node runtime not found: $node" }
if (!(Test-Path -LiteralPath $configPath)) { throw "Publisher task manifest not found: $configPath" }

$config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
$script = Join-Path $repo ($config.script -replace '/', '\')
$launcher = Join-Path $repo 'scripts\run-test2-publisher-hidden.vbs'
$taskName = [string]$config.taskName
$intervalSeconds = [int]$config.intervalSeconds
$durationDays = [int]$config.durationDays
$description = [string]$config.description

if ($intervalSeconds -lt 60) { throw "intervalSeconds must be at least 60" }
if (!(Test-Path -LiteralPath $script)) { throw "Publisher script not found: $script" }
if (!(Test-Path -LiteralPath $launcher)) { throw "Hidden launcher not found: $launcher" }

$action = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument "`"$launcher`"" -WorkingDirectory $repo
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Seconds $intervalSeconds) -RepetitionDuration (New-TimeSpan -Days $durationDays)
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType InteractiveToken -RunLevel Limited
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description $description -Force | Out-Null
Write-Output "Installed: $taskName every $intervalSeconds seconds from $configPath"

