[CmdletBinding()]
param([string]$Repo)

$ErrorActionPreference = 'Stop'
$Repo = if ($Repo) { (Resolve-Path -LiteralPath $Repo).Path } else { Split-Path -Parent $PSScriptRoot }
$taskName = 'TEST2 Desktop GitHub Sync'
$launcherPath = Join-Path $Repo 'scripts\run-test2-desktop-sync-hidden.vbs'
$action = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument "`"$launcherPath`""
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 2)
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 2) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description 'Fast-forward the clean TEST2 Desktop checkout from GitHub; skip safely when local changes exist.' -Force | Out-Null
Write-Output "Installed '$taskName'. Log: $env:LOCALAPPDATA\TEST2\desktop-sync.log"
