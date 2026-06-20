# Inicia MongoDB local usando data/db do projeto (sem Docker).
# Uso: .\scripts\start-mongodb.ps1

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\mongodb.ps1"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$dataDir = Join-Path $ProjectRoot "data\db"
New-Item -ItemType Directory -Force -Path $dataDir | Out-Null

$mongodPath = Resolve-MongodPath -ProjectRoot $ProjectRoot
if (-not $mongodPath) {
    Write-Host "Nenhum mongod funcional encontrado." -ForegroundColor Red
    if (Test-IsWindows10) {
        Write-Host ""
        Write-Host "Windows 10 detectado: MongoDB 8.x (winget) NAO e compativel." -ForegroundColor Yellow
        Write-Host "Execute primeiro:" -ForegroundColor Yellow
        Write-Host "  .\scripts\install-mongodb-win10.ps1" -ForegroundColor Cyan
    } else {
        Write-Host "Instale MongoDB Community ou execute .\scripts\setup-local.ps1" -ForegroundColor Yellow
    }
    exit 1
}

Write-Host "Usando: $mongodPath" -ForegroundColor DarkGray
Write-Host "Iniciando MongoDB em $dataDir ..." -ForegroundColor Cyan
Write-Host "URI: mongodb://localhost:27017" -ForegroundColor Green
Write-Host "(Deixe este terminal aberto enquanto usar a API.)" -ForegroundColor DarkGray
& $mongodPath --dbpath $dataDir --port 27017 --bind_ip 127.0.0.1
