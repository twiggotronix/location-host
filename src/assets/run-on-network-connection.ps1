$wifiArg = "-w"
$wiredArg = "-e"
$scriptPath = $MyInvocation.MyCommand.Path
$scriptDir = Split-Path $scriptPath
$exePath = Join-Path $scriptDir "\location-host.exe"
Write-Output $exePath
# Get network interfaces and their connection types
$networkInterfaces = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }

foreach ($adapter in $networkInterfaces) {
    if ($adapter.MediaType -eq "802.3") {
        # Wired connection
        Start-Process -FilePath $exePath -ArgumentList $wiredArg
        exit
    }
    elseif ($adapter.MediaType -eq "802.11") {
        # Wi-Fi connection
        Start-Process -FilePath $exePath -ArgumentList $wifiArg
        exit
    }
}

Write-Output "No active network connection found."
