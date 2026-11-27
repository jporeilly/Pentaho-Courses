<#
.SYNOPSIS
    Start, check or stop the H2O scoring service for the Machine Learning
    course: one long-running H2O server that loads the fraud model once and
    answers every scoring call from Pentaho Data Integration.

.DESCRIPTION
    The course's training and scoring transformations start their own H2O
    engine on the default port, 54321, and shut it down when they finish.
    The scoring service runs apart from them, on port 54400, bound to this
    machine only (127.0.0.1), on Pentaho's own Java.

    H2O lists Java 8 to 17 as supported; Pentaho's Java is 21. The service
    starts with -allow_unsupported_java, the same flag H2O's own Python
    client passes when the course's Python steps start H2O on that Java.

        .\start-h2o-service.ps1            start it (and wait until it answers)
        .\start-h2o-service.ps1 -Status    is it running?
        .\start-h2o-service.ps1 -Stop      shut it down

    Exit codes: 0 running (or stopped, with -Stop), 1 failed, 2 not running
    (-Status only).

.NOTES
    1.0.0 (2026-11-26): first version.
#>
[CmdletBinding()]
param(
    [switch]$Status,
    [switch]$Stop,
    [int]$Port = 54400,
    [string]$VenvPath = (Join-Path $HOME 'h2o-env'),
    [string]$JavaHome = 'C:\Pentaho\java',
    [string]$Memory = '2g'
)

$ErrorActionPreference = 'Stop'
$url = "http://127.0.0.1:$Port"

function Get-Cloud {
    try { return Invoke-RestMethod -Uri "$url/3/Cloud" -TimeoutSec 3 } catch { return $null }
}

if ($Stop) {
    if (-not (Get-Cloud)) { Write-Host "The H2O scoring service is not running on $url."; exit 0 }
    try { Invoke-RestMethod -Method Post -Uri "$url/3/Shutdown" -TimeoutSec 10 | Out-Null } catch { }
    for ($i = 0; $i -lt 20; $i++) { if (-not (Get-Cloud)) { break }; Start-Sleep -Milliseconds 500 }
    if (Get-Cloud) { Write-Host "The H2O scoring service did not stop."; exit 1 }
    Write-Host "The H2O scoring service on $url has stopped."
    exit 0
}

$cloud = Get-Cloud
if ($cloud) {
    Write-Host "The H2O scoring service is running on $url (H2O $($cloud.version), cloud $($cloud.cloud_name))."
    exit 0
}
if ($Status) { Write-Host "The H2O scoring service is not running on $url."; exit 2 }

$jar = Join-Path $VenvPath 'Lib\site-packages\h2o\backend\bin\h2o.jar'
$java = Join-Path $JavaHome 'bin\java.exe'
if (-not (Test-Path -LiteralPath $jar)) { Write-Host "No H2O in $VenvPath ($jar). Run setup-ml.ps1 first."; exit 1 }
if (-not (Test-Path -LiteralPath $java)) { Write-Host "No Java at $java. Pass -JavaHome."; exit 1 }

$logDir = Join-Path $env:TEMP 'h2o-scoring-service'
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$jvmArgs = @("-Xmx$Memory", '-jar', "`"$jar`"", '-name', 'fraud-scoring', '-ip', '127.0.0.1', '-port', "$Port",
          '-log_dir', "`"$logDir`"", '-allow_unsupported_java')
Start-Process -FilePath $java -ArgumentList $jvmArgs -WindowStyle Minimized | Out-Null

for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 1
    $cloud = Get-Cloud
    if ($cloud) {
        Write-Host "The H2O scoring service is running on $url (H2O $($cloud.version), cloud $($cloud.cloud_name))."
        Write-Host "Its web page, H2O Flow, is at $url"
        exit 0
    }
}
Write-Host "The H2O scoring service did not answer within 60 seconds. Its logs are in $logDir."
exit 1
