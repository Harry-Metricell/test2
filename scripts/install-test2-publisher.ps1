param([string]$Repo = (Split-Path -Parent $PSScriptRoot))

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

 $launcher = Join-Path $repo 'scripts\run-test2-publisher-hidden.vbs'
 $action = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument "`"$launcher`"" -WorkingDirectory $repo
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Seconds $intervalSeconds) -RepetitionDuration (New-TimeSpan -Days $durationDays)
$settings = New-ScheduledTaskSettingsSet -Hidden -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description $description -Force | Out-Null
$repairTaskName = "$taskName Repair"
$repairArgs = '-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $PSCommandPath + '" -Repo "' + $repo + '"'
$repairAction = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $repairArgs -WorkingDirectory $repo
$repairTrigger = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
$repairSettings = New-ScheduledTaskSettingsSet -Hidden -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 2)
Register-ScheduledTask -TaskName $repairTaskName -Action $repairAction -Trigger $repairTrigger -Settings $repairSettings -Principal $principal -Description "Repairs the hidden TEST2 Agent Publisher task after login." -Force | Out-Null
$startup = Join-Path $env:APPDATA 'Microsoft\\Windows\\Start Menu\\Programs\\Startup'
New-Item -ItemType Directory -Force -Path $startup | Out-Null
$shortcutPath = Join-Path $startup 'TEST2 Agent Publisher Repair.lnk'
$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = 'powershell.exe'
$shortcut.Arguments = $repairArgs
$shortcut.WorkingDirectory = $repo
$shortcut.WindowStyle = 7
$shortcut.Save()
Write-Output "Installed: $taskName every $intervalSeconds seconds and logon repair task: $repairTaskName"



