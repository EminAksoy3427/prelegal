# Builds the Prelegal image and runs it in the background.
# Usage: .\scripts\start-windows.ps1              (serves on http://localhost:8000)
#        .\scripts\start-windows.ps1 -Port 9000
param([int]$Port = 8000)

$Image = "prelegal"
$Container = "prelegal"

Push-Location (Join-Path $PSScriptRoot "..")
try {
    docker build -t $Image .
    if ($LASTEXITCODE -ne 0) { throw "docker build failed." }

    if (docker ps -a --filter "name=^$Container$" --format "{{.Names}}") {
        docker rm -f $Container | Out-Null
    }

    docker run -d --name $Container -p "${Port}:8000" $Image | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "docker run failed." }

    Write-Host "Prelegal is running at http://localhost:$Port"
    Write-Host "Stop it with .\scripts\stop-windows.ps1"
}
finally {
    Pop-Location
}
