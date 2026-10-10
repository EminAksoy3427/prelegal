# Stops and removes the Prelegal container. Its temporary database goes with it.

$Container = "prelegal"

if (docker ps -a --filter "name=^$Container$" --format "{{.Names}}") {
    docker rm -f $Container | Out-Null
    Write-Host "Prelegal stopped."
}
else {
    Write-Host "Prelegal is not running."
}
