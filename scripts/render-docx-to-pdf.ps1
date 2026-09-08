param(
  [Parameter(Mandatory=$true)][string]$InputDocx,
  [Parameter(Mandatory=$true)][string]$OutputPdf
)
$ErrorActionPreference = 'Stop'
$wordPath = 'C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE'
if (!(Test-Path -LiteralPath $wordPath)) { throw "Microsoft Word not found: $wordPath" }
if (!(Test-Path -LiteralPath $InputDocx)) { throw "DOCX not found: $InputDocx" }
$outDir = Split-Path -Parent $OutputPdf
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$word = $null
$doc = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $doc = $word.Documents.Open($InputDocx, $false, $true)
  $doc.ExportAsFixedFormat($OutputPdf, 17)
  $doc.Close($false)
  $word.Quit()
} finally {
  if ($doc) { [Runtime.InteropServices.Marshal]::ReleaseComObject($doc) | Out-Null }
  if ($word) { [Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null }
}
if (!(Test-Path -LiteralPath $OutputPdf) -or (Get-Item -LiteralPath $OutputPdf).Length -eq 0) {
  throw "Word did not create a non-empty PDF: $OutputPdf"
}
Write-Output $OutputPdf
