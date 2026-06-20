# Funções compartilhadas para localizar um mongod funcional no Windows.

function Test-MongodWorks {
    param([Parameter(Mandatory = $true)][string]$MongodPath)

    if (-not (Test-Path $MongodPath)) {
        return $false
    }

    $stdout = Join-Path $env:TEMP "chatterbox-mongod-version.out"
    $stderr = Join-Path $env:TEMP "chatterbox-mongod-version.err"
    Remove-Item $stdout, $stderr -ErrorAction SilentlyContinue

    $process = Start-Process `
        -FilePath $MongodPath `
        -ArgumentList "--version" `
        -Wait `
        -PassThru `
        -NoNewWindow `
        -RedirectStandardOutput $stdout `
        -RedirectStandardError $stderr

    return $process.ExitCode -eq 0
}

function Get-PortableMongodPath {
    param([Parameter(Mandatory = $true)][string]$ProjectRoot)

    return Join-Path $ProjectRoot "tools\mongodb\bin\mongod.exe"
}

function Resolve-MongodPath {
    param([Parameter(Mandatory = $true)][string]$ProjectRoot)

    $candidates = @(
        (Get-PortableMongodPath -ProjectRoot $ProjectRoot)
    )

    $programFiles = Get-ChildItem "C:\Program Files\MongoDB\Server\*\bin\mongod.exe" -ErrorAction SilentlyContinue |
        Sort-Object { [version]$_.Directory.Parent.Name } -Descending
    foreach ($item in $programFiles) {
        $candidates += $item.FullName
    }

    $pathMongod = Get-Command mongod -ErrorAction SilentlyContinue
    if ($pathMongod) {
        $candidates += $pathMongod.Source
    }

    foreach ($candidate in ($candidates | Select-Object -Unique)) {
        if (Test-MongodWorks -MongodPath $candidate) {
            return $candidate
        }
    }

    return $null
}

function Test-IsWindows10 {
    return [System.Environment]::OSVersion.Version.Build -lt 22000
}
