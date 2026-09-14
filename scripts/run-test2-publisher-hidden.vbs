Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
repo = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
node = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%\TEST2\node\node.exe")
If Not fso.FileExists(node) Then node = "node.exe"
script = repo & "\scripts\publish-agent-output.mjs"
logPath = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%\TEST2\publisher.log")
command = "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command """ & _
  "& { & '" & node & "' '" & script & "' *>> '" & logPath & "'; exit `$LASTEXITCODE }"""
exitCode = shell.Run(command, 0, True)
Set logFile = fso.OpenTextFile(logPath, 8, True)
logFile.WriteLine Now & " launcher exit code=" & exitCode
logFile.Close
WScript.Quit exitCode



