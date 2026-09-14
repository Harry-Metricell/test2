Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
repo = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
node = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%\TEST2\node\node.exe")
If Not fso.FileExists(node) Then node = "node.exe"
script = repo & "\scripts\publish-agent-output.mjs"
logPath = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%\TEST2\publisher.log")
repo = fso.GetParentFolderName(script)
command = """" & node & """ """ & script & """"
exitCode = shell.Run(command, 0, True)
WScript.Quit exitCode




