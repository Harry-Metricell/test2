Set shell = CreateObject("WScript.Shell")
repo = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
node = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%\TEST2\node\node.exe")
If Not fso.FileExists(node) Then node = "node.exe"
script = repo & "\scripts\publish-agent-output.mjs"
command = """" & node & """" & " " & """" & script & """"
exitCode = shell.Run(command, 0, True)
WScript.Quit exitCode


