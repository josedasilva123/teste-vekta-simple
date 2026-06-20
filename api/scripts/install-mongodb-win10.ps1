# Instala MongoDB 7.0 portable (compatível com Windows 10).
# MongoDB 8.x exige Windows 11 — no Win10 o mongod.exe falha ao iniciar.
# Uso: .\scripts\install-mongodb-win10.ps1

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\mongodb.ps1"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$toolsDir = Join-Path $ProjectRoot "tools"
$mongodPath = Get-PortableMongodPath -ProjectRoot $ProjectRoot
$version = "7.0.21"
$zipName = "mongodb-windows-x86_64-$version.zip"
$zipPath = Join-Path $toolsDir $zipName
$uri = "https://fastdl.mongodb.org/windows/$zipName"

New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null

if (Test-MongodWorks -MongodPath $mongodPath) {
    Write-Host "MongoDB portable ja instalado: $mongodPath" -ForegroundColor Green
    exit 0
}

Write-Host "Baixando MongoDB $version (~600 MB). Aguarde..." -ForegroundColor Cyan
if (-not (Test-Path $zipPath)) {
    Invoke-WebRequest -Uri $uri -OutFile $zipPath -UseBasicParsing
}

$extractRoot = Join-Path $toolsDir "_extract"
if (Test-Path $extractRoot) {
    Remove-Item $extractRoot -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $extractRoot | Out-Null

Write-Host "Extraindo..." -ForegroundColor Cyan
Expand-Archive -Path $zipPath -DestinationPath $extractRoot -Force

$innerDir = Get-ChildItem $extractRoot -Directory | Select-Object -First 1
$targetDir = Join-Path $toolsDir "mongodb"
if (Test-Path $targetDir) {
    Remove-Item $targetDir -Recurse -Force
}
Move-Item $innerDir.FullName $targetDir

Remove-Item $extractRoot -Recurse -Force -ErrorAction SilentlyContinue

if (-not (Test-MongodWorks -MongodPath $mongodPath)) {
    Write-Host "Falha ao validar mongod em $mongodPath" -ForegroundColor Red
    exit 1
}

Write-Host "MongoDB $version instalado em $targetDir" -ForegroundColor Green
Write-Host "Inicie com: .\scripts\start-mongodb.ps1" -ForegroundColor Cyan
