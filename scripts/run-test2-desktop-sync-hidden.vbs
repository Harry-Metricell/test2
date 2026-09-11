Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
repo = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
script = repo & "\scripts\sync-desktop-checkout.ps1"
command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & script & """ -Repo """ & repo & """"
exitCode = shell.Run(command, 0, True)
WScript.Quit exitCode
