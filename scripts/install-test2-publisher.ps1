$ErrorActionPreference = 'Stop'

$repo = 'C:\Users\harry.piper\Documents\ChatGPT\Test2-github'
$node = 'C:\Users\harry.piper\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$script = Join-Path $repo 'scripts\publish-agent-output.mjs'
$taskName = 'TEST2 Agent Publisher'

if (!(Test-Path -LiteralPath $node)) { throw "Bundled Node runtime not found: $node" }
if (!(Test-Path -LiteralPath $script)) { throw "Publisher script not found: $script" }

$action = New-ScheduledTaskAction -Execute $node -Argument "`"$script`"" -WorkingDirectory $repo
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration (New-TimeSpan -Days 3650)
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description 'Publishes validated TEST2 agent output without administrator access.' -Force | Out-Null
Write-Output "Installed: $taskName"
