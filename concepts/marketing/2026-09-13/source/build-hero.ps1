$ErrorActionPreference = 'Stop'

$sourceDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryRoot = (Resolve-Path (Join-Path $sourceDirectory '..\..\..\..')).Path
$sourceFile = Join-Path $sourceDirectory 'hero.svg'
$generatedSourceFile = Join-Path $sourceDirectory 'hero.generated.svg'
$outputFile = Join-Path $repositoryRoot 'assets\marketing\bookmarkvault-hero.png'
$magick = (Get-Command magick -ErrorAction Stop).Source

function Get-PngDataUri([string] $Path) {
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    return 'data:image/png;base64,' + [Convert]::ToBase64String($bytes)
}

$logoFile = Join-Path $repositoryRoot 'concepts\marketing\2026-09-13\selected\bookmarkvault-logo-512.png'
$desktopFile = Join-Path $repositoryRoot 'concepts\marketing\2026-09-13\selected\discover.png'
$mobileFile = Join-Path $repositoryRoot 'concepts\marketing\2026-09-13\selected\mobile.png'
$svg = [System.IO.File]::ReadAllText($sourceFile)
$svg = $svg.Replace('asset:logo', (Get-PngDataUri $logoFile))
$svg = $svg.Replace('asset:desktop', (Get-PngDataUri $desktopFile))
$svg = $svg.Replace('asset:mobile', (Get-PngDataUri $mobileFile))
[System.IO.File]::WriteAllText($generatedSourceFile, $svg)

Push-Location $sourceDirectory
try {
    & $magick -background none $generatedSourceFile $outputFile
    if ($LASTEXITCODE -ne 0) {
        throw "ImageMagick failed with exit code $LASTEXITCODE."
    }
}
finally {
    Pop-Location
    if (Test-Path -LiteralPath $generatedSourceFile) {
        Remove-Item -LiteralPath $generatedSourceFile -Force
    }
}

$dimensions = & $magick identify -format '%wx%h' $outputFile
if ($LASTEXITCODE -ne 0 -or $dimensions -ne '1600x900') {
    throw "Hero dimensions are $dimensions, expected 1600x900."
}

Write-Host "Built $outputFile ($dimensions)"
