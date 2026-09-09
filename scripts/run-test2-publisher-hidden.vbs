Set shell = CreateObject("WScript.Shell")
node = "C:\Users\harry.piper\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
script = "C:\Users\harry.piper\Documents\ChatGPT\Test2-github\scripts\publish-agent-output.mjs"
command = """" & node & """" & " " & """" & script & """"
shell.Run command, 0, False
