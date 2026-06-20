# Instala dependências locais (Poetry) e prepara ambiente de desenvolvimento.
# Uso: .\scripts\setup-local.ps1

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\mongodb.ps1"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "==> Verificando Python..." -ForegroundColor Cyan
python --version

Write-Host "==> Instalando Poetry (se necessario)..." -ForegroundColor Cyan
python -m pip install --upgrade pip --quiet
python -m pip install poetry --quiet

Write-Host "==> Instalando dependencias do projeto..." -ForegroundColor Cyan
python -m poetry install

Write-Host "==> Criando .env a partir de .env.example (se nao existir)..." -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    (Get-Content ".env") -replace "AI_PROVIDER=gemini", "AI_PROVIDER=fake" | Set-Content ".env"
    Write-Host "    .env criado com AI_PROVIDER=fake (sem necessidade de Gemini)." -ForegroundColor Yellow
}

Write-Host "==> Criando diretorio de dados do MongoDB..." -ForegroundColor Cyan
$dataDir = Join-Path $ProjectRoot "data\db"
New-Item -ItemType Directory -Force -Path $dataDir | Out-Null

Write-Host "==> Verificando MongoDB local..." -ForegroundColor Cyan
$mongodPath = Resolve-MongodPath -ProjectRoot $ProjectRoot
if ($mongodPath) {
    Write-Host "    MongoDB OK: $mongodPath" -ForegroundColor Green
} elseif (Test-IsWindows10) {
    Write-Host "    Windows 10: instalando MongoDB 7.0 portable (8.x nao funciona no Win10)..." -ForegroundColor Yellow
    & "$PSScriptRoot\install-mongodb-win10.ps1"
} else {
    Write-Host "    MongoDB nao encontrado. Tentando instalar via winget..." -ForegroundColor Yellow
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install MongoDB.Server --accept-package-agreements --accept-source-agreements
    } else {
        Write-Host "    winget indisponivel. Instale manualmente ou use Atlas." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Setup concluido!" -ForegroundColor Green
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "  1. .\scripts\start-mongodb.ps1        # terminal 1 — MongoDB"
Write-Host "  2. python -m poetry run chatterbox    # terminal 2 — API"
Write-Host "  3. python -m poetry run pytest        # testes"
