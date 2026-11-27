<#
.SYNOPSIS
    Runs the Streaming Data course's four message brokers on Podman
    (Windows): HiveMQ and EMQX (MQTT), RabbitMQ (AMQP) and Apache Kafka.

.DESCRIPTION
    Only Podman is required: no docker, docker-compose or podman-compose.
    Each broker is one container, from one pinned image:

      pcm-hivemq    MQTT  127.0.0.1:1883   Control Center http://localhost:9090
                    (admin / hivemq; websockets on 9081)
      pcm-emqx      MQTT  127.0.0.1:1884   Dashboard http://localhost:18083
                    (admin / public; EMQX asks for a new password on first sign-in)
      pcm-rabbitmq  AMQP  127.0.0.1:5672   Management http://localhost:15672
                    (guest / guest)
      pcm-kafka     Kafka 127.0.0.1:9092   KRaft, one node; the topic pdi-users
                    is created with one partition

    An existing container on the pinned image is started, never replaced.
    One on another image (an older release, or the compose file this kit
    replaces) is removed and created again from the pinned image, because
    the labs are written against these versions. A broker counts as up only
    when it answers its own client, not when its port opens: Kafka, for
    example, opens 9092 several seconds before it can create a topic.

.PARAMETER Broker
    Which brokers to start: hivemq, emqx, rabbitmq, kafka, or all (the
    default). Several may be given: -Broker hivemq,kafka.

.PARAMETER Stop
    Stop the brokers named by -Broker and exit. Their data is kept.

.PARAMETER Reset
    Remove the brokers named by -Broker (their topics, queues and retained
    messages go with them), then create them again.

.PARAMETER Status
    Print each broker's container, image and state, and exit.

.PARAMETER Topic
    Create this Kafka topic if it does not exist (with -Partitions), then
    describe it: its partitions, and which broker leads each. Kafka must be
    running. Exits after.

.PARAMETER Partitions
    The partition count for a topic -Topic creates. Default 1. An existing
    topic keeps its count.

.PARAMETER Group
    Describe this Kafka consumer group: for each partition it has read,
    the committed offset, the end of the log and the lag. Exits after.

.PARAMETER NoCgroups
    Start the containers with --cgroups=disabled from the outset. Normally
    not needed: when a start fails with
      crun: controller `pids` is not available ... OCI runtime error
    (exit code 126, WSL 2.9 and 3.0), the script retries that container
    with --cgroups=disabled by itself, as run-podman-mysql.ps1 does.

.EXAMPLE
    .\run-podman-streaming.ps1
    .\run-podman-streaming.ps1 -Broker kafka
    .\run-podman-streaming.ps1 -Status
    .\run-podman-streaming.ps1 -Broker kafka -Reset
    .\run-podman-streaming.ps1 -Topic line1-alerts -Partitions 3
    .\run-podman-streaming.ps1 -Group line1-alert-loader

.NOTES
    Windows PowerShell 5.1+. ASCII only.

    1.0.0 (2026-11-26): replaces the streaming profile of
    workshop-services\docker-compose.yml, which needed a compose provider
    and, through it, started a second MySQL on 3306 beside the MySQL kit's
    sampledata-mysql. Images pinned: HiveMQ 4.57.0 (the Enterprise image,
    whose Control Center the lab uses; HiveMQ Community Edition has none, and
    without a licence file it runs as a 25-connection trial), EMQX 6.3.3,
    RabbitMQ 4.4.1, Kafka 4.4.0 (Pentaho Data Integration 11 ships the Kafka
    4.1 client).

    1.1.0 (2026-11-26): -Topic/-Partitions creates and describes a Kafka
    topic and -Group describes a consumer group, with Kafka's own tools
    inside pcm-kafka, so a Windows learner never types a container path
    (the Streaming Data capstone uses both).
#>
[CmdletBinding()]
param(
    [ValidateSet('all', 'hivemq', 'emqx', 'rabbitmq', 'kafka')]
    [string[]]$Broker = @('all'),
    [switch]$Stop,
    [switch]$Reset,
    [switch]$Status,
    [string]$Topic = "",
    [ValidateRange(1, 64)]
    [int]$Partitions = 1,
    [string]$Group = "",
    [switch]$NoCgroups
)

$ErrorActionPreference = 'Continue'
$ScriptVersion = '1.1.0'
$script:NoCgroups = [bool]$NoCgroups

# One row per broker: everything the labs depend on is in this table.
$Brokers = [ordered]@{
    hivemq = @{
        Name  = 'pcm-hivemq'
        Title = 'HiveMQ (MQTT)'
        Image = 'docker.io/hivemq/hivemq4:4.57.0'
        Ports = @('1883:1883', '9090:8080', '9081:8000')
        Env   = @('JAVA_OPTS=-Xms256m -Xmx512m')
        Args  = @()
        # The broker logs this line once its listeners accept clients.
        Ready = { (podman logs --tail 200 pcm-hivemq 2>&1 | Out-String) -match 'Started HiveMQ in' }
        Show  = @('MQTT          tcp://localhost:1883   (no login)',
                  'Control Center http://localhost:9090  admin / hivemq',
                  'Websockets    ws://localhost:9081')
    }
    emqx = @{
        Name  = 'pcm-emqx'
        Title = 'EMQX (MQTT)'
        Image = 'docker.io/emqx/emqx:6.3.3'
        Ports = @('1884:1883', '18083:18083')
        Env   = @()
        Args  = @()
        Ready = { podman exec pcm-emqx emqx ctl status 2>$null | Out-Null; $LASTEXITCODE -eq 0 }
        Show  = @('MQTT          tcp://localhost:1884   (no login)',
                  'Dashboard     http://localhost:18083 admin / public (new password asked on first sign-in)')
    }
    rabbitmq = @{
        Name  = 'pcm-rabbitmq'
        Title = 'RabbitMQ (AMQP)'
        Image = 'docker.io/library/rabbitmq:4.4.1-management'
        Ports = @('5672:5672', '15672:15672')
        Env   = @('RABBITMQ_DEFAULT_USER=guest', 'RABBITMQ_DEFAULT_PASS=guest')
        Args  = @('--hostname', 'pcm-rabbitmq')
        Ready = { podman exec pcm-rabbitmq rabbitmq-diagnostics -q check_port_connectivity 2>$null | Out-Null; $LASTEXITCODE -eq 0 }
        Show  = @('AMQP          amqp://localhost:5672  guest / guest',
                  'Management    http://localhost:15672 guest / guest')
    }
    kafka = @{
        Name  = 'pcm-kafka'
        Title = 'Apache Kafka'
        Image = 'docker.io/apache/kafka:4.4.0'
        Ports = @('9092:9092')
        # One node is both broker and controller (KRaft). Clients on this
        # machine reach it as 127.0.0.1:9092, the address it advertises;
        # 'localhost' would reach Windows' IPv6 loopback first and hang.
        Env   = @('KAFKA_NODE_ID=1',
                  'KAFKA_PROCESS_ROLES=broker,controller',
                  'KAFKA_CONTROLLER_QUORUM_VOTERS=1@localhost:9093',
                  'KAFKA_LISTENERS=HOST://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093',
                  'KAFKA_ADVERTISED_LISTENERS=HOST://127.0.0.1:9092',
                  'KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=HOST:PLAINTEXT,CONTROLLER:PLAINTEXT',
                  'KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER',
                  'KAFKA_INTER_BROKER_LISTENER_NAME=HOST',
                  'KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1',
                  'KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1',
                  'KAFKA_TRANSACTION_STATE_LOG_MIN_ISR=1',
                  'KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS=0',
                  'KAFKA_AUTO_CREATE_TOPICS_ENABLE=true',
                  'KAFKA_NUM_PARTITIONS=1',
                  'KAFKA_HEAP_OPTS=-Xms256m -Xmx512m')
        Args  = @('--hostname', 'pcm-kafka')
        Ready = { podman exec pcm-kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server 127.0.0.1:9092 --list 2>$null | Out-Null; $LASTEXITCODE -eq 0 }
        Show  = @('Bootstrap     127.0.0.1:9092         (no login; use the IP, not localhost)',
                  'Topic         pdi-users (1 partition)')
    }
}

function Fail([string]$Message) {
    Write-Host $Message -ForegroundColor Red
    exit 1
}

# 'podman run -d', retried once with --cgroups=disabled when Podman cannot
# create a cgroup (WSL 2.9 / 3.0, exit 126, "crun: controller `pids`"). The
# text is checked as well as the code: a port clash also exits 126.
function Start-Container([string]$Name, [string[]]$RunArgs) {
    $extra = @()
    if ($script:NoCgroups) { $extra = @('--cgroups=disabled') }
    $out  = & podman run -d --name $Name @extra @RunArgs 2>&1
    $code = $LASTEXITCODE
    if ($code -eq 0) { return }
    $text = ($out | ForEach-Object { "$_" }) -join "`n"
    if (-not $script:NoCgroups -and $code -eq 126 -and $text -match 'cgroup|controller') {
        Write-Host "Podman could not create a cgroup for $Name (WSL 2.9 / 3.0). Retrying with --cgroups=disabled." -ForegroundColor Yellow
        $script:NoCgroups = $true
        podman rm -f --ignore $Name | Out-Null
        $out  = & podman run -d --name $Name --cgroups=disabled @RunArgs 2>&1
        $code = $LASTEXITCODE
        if ($code -eq 0) { return }
        $text = ($out | ForEach-Object { "$_" }) -join "`n"
    }
    Write-Host $text -ForegroundColor Red
    if ($text -match 'address already in use') {
        Write-Host "Something inside the Podman machine still holds that port. Restarting the machine clears" -ForegroundColor Yellow
        Write-Host "leftovers from earlier attempts:  podman machine stop; podman machine start" -ForegroundColor Yellow
    }
    Fail "podman run $Name failed (exit code $code)."
}

function Get-State([string]$Name) {
    podman container exists $Name
    if ($LASTEXITCODE -ne 0) { return $null }
    $f = (podman inspect --format '{{.ImageName}}|{{.State.Running}}' $Name 2>$null | Out-String).Trim()
    $image, $running = $f -split '\|', 2
    return @{ Image = $image; Running = ($running -eq 'true') }
}

# ---------------------------------------------------------------- Podman ---

Write-Host "run-podman-streaming.ps1 $ScriptVersion"
if (-not (Get-Command podman -ErrorAction SilentlyContinue)) {
    Fail "podman was not found on PATH. Install Podman Desktop (https://podman-desktop.io), then open a new PowerShell window and run this script again."
}
$machineInfo = podman machine inspect --format '{{.Name}} {{.State}}' 2>$null
if ($LASTEXITCODE -ne 0 -or -not $machineInfo) {
    Fail "No Podman machine exists yet. Run 'podman machine init' once (Podman Desktop does this on first launch), then run this script again."
}
$machineName, $machineState = "$machineInfo" -split ' ', 2
if ($machineState -ne 'running') {
    Write-Host "Podman machine $machineName is '$machineState'. Starting it..."
    podman machine start
    if ($LASTEXITCODE -ne 0) { Fail "podman machine start failed (exit code $LASTEXITCODE)." }
}

$keys = if ($Broker -contains 'all') { @($Brokers.Keys) } else { @($Brokers.Keys | Where-Object { $Broker -contains $_ }) }

# ---------------------------------------------------------------- Status ---

if ($Status) {
    foreach ($k in $keys) {
        $b = $Brokers[$k]; $s = Get-State $b.Name
        if (-not $s) { Write-Host ("  {0,-13} not created" -f $b.Name); continue }
        $note = if ($s.Image -ne $b.Image) { "  (the pinned image is $($b.Image))" } else { '' }
        Write-Host ("  {0,-13} {1,-8} {2}{3}" -f $b.Name, $(if ($s.Running) { 'running' } else { 'stopped' }), $s.Image, $note)
    }
    exit 0
}

# ------------------------------------------------------- Topic and Group ---
# Kafka's own tools, run inside pcm-kafka, so a learner on Windows never
# types a path inside the container.

if ($Topic -or $Group) {
    $s = Get-State 'pcm-kafka'
    if (-not $s -or -not $s.Running) { Fail "Kafka is not running. Start it first: .\run-podman-streaming.ps1 -Broker kafka" }
    $kt = '/opt/kafka/bin'
    if ($Topic) {
        if ($Topic -notmatch '^[A-Za-z0-9._-]{1,249}$') { Fail "'$Topic' is not a valid Kafka topic name." }
        podman exec pcm-kafka "$kt/kafka-topics.sh" --bootstrap-server 127.0.0.1:9092 --create --if-not-exists --topic $Topic --partitions $Partitions --replication-factor 1 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { Fail "Could not create the topic $Topic." }
        podman exec pcm-kafka "$kt/kafka-topics.sh" --bootstrap-server 127.0.0.1:9092 --describe --topic $Topic
    }
    if ($Group) {
        podman exec pcm-kafka "$kt/kafka-consumer-groups.sh" --bootstrap-server 127.0.0.1:9092 --describe --group $Group
        if ($LASTEXITCODE -ne 0) { Fail "Could not describe the group $Group (has it read anything yet?)." }
    }
    exit 0
}

# ------------------------------------------------------------------ Stop ---

if ($Stop) {
    foreach ($k in $keys) {
        $n = $Brokers[$k].Name
        podman stop --ignore $n | Out-Null
        Write-Host "Stopped $n (its data is kept; start it again with this script)."
    }
    exit 0
}

# ------------------------------------------------------------ Pre-checks ---
# Another container publishing a broker's port (a Mosquitto from another
# workshop holds 1883, for example) would make that broker's start fail.
$ours = @($Brokers.Values | ForEach-Object { $_.Name })
$want = @($keys | ForEach-Object { $Brokers[$_].Ports | ForEach-Object { ($_ -split ':')[0] } })
$blockers = @()
foreach ($line in @(podman ps --format '{{.Names}} {{.Ports}}' 2>$null)) {
    $cname, $ports = "$line" -split ' ', 2
    if ($ours -contains $cname) { continue }
    foreach ($p in $want) {
        if ($ports -match "[:.]$p->") { $blockers += "  $cname holds port $p   stop it with: podman stop $cname"; break }
    }
}
if ($blockers) { Fail ("These containers already publish a port a broker needs:`n" + ($blockers -join "`n")) }

# ------------------------------------------------------------------- Run ---

foreach ($k in $keys) {
    $b = $Brokers[$k]; $n = $b.Name
    $s = Get-State $n
    if ($s -and $Reset) {
        Write-Host "Reset: removing $n ..."
        podman rm -f $n | Out-Null
        $s = $null
    } elseif ($s -and $s.Image -ne $b.Image) {
        Write-Host "$n runs $($s.Image); replacing it with the pinned $($b.Image) ..." -ForegroundColor Yellow
        podman rm -f $n | Out-Null
        $s = $null
    }
    if ($s -and $s.Running) {
        Write-Host "$n is already running."
    } elseif ($s) {
        Write-Host "Starting $n ..."
        $out = podman start $n 2>&1
        if ($LASTEXITCODE -ne 0) { Write-Host (($out | ForEach-Object { "$_" }) -join "`n") -ForegroundColor Red; Fail "podman start $n failed." }
    } else {
        Write-Host "Creating $n from $($b.Image) - the first time pulls the image..."
        $run = @()
        foreach ($p in $b.Ports) { $run += @('-p', $p) }
        foreach ($e in $b.Env) { $run += @('-e', $e) }
        $run += $b.Args
        $run += @('--restart', 'unless-stopped', $b.Image)
        Start-Container $n $run
    }
}

# ------------------------------------------------------- Wait for ready ---

$allUp = $true
foreach ($k in $keys) {
    $b = $Brokers[$k]
    Write-Host -NoNewline "Waiting for $($b.Title) to accept clients"
    $deadline = (Get-Date).AddSeconds(180)
    $up = $false
    while ((Get-Date) -lt $deadline) {
        if (& $b.Ready) { $up = $true; break }
        Write-Host -NoNewline '.'
        Start-Sleep -Seconds 3
    }
    if ($up) { Write-Host ' up' -ForegroundColor Green }
    else { Write-Host ' NOT UP' -ForegroundColor Red; Write-Host "  See its log: podman logs $($b.Name)"; $allUp = $false }
}

# The Kafka lab's topic, made before any client asks for it, so a consumer
# started before the publisher subscribes to a topic that exists.
if ($keys -contains 'kafka' -and $allUp) {
    podman exec pcm-kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server 127.0.0.1:9092 --create --if-not-exists --topic pdi-users --partitions 1 --replication-factor 1 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Host "Could not create the topic pdi-users." -ForegroundColor Red; $allUp = $false }
}

# --------------------------------------------------------------- Summary ---

Write-Host ""
foreach ($k in $keys) {
    $b = $Brokers[$k]
    Write-Host "$($b.Title)  [$($b.Name)]" -ForegroundColor Cyan
    foreach ($l in $b.Show) { Write-Host "  $l" }
}
Write-Host ""
Write-Host "Useful commands:"
Write-Host "  .\run-podman-streaming.ps1 -Status            which brokers run, on which image"
Write-Host "  .\run-podman-streaming.ps1 -Stop              stop them, keep their data"
Write-Host "  .\run-podman-streaming.ps1 -Broker kafka -Reset   start one broker fresh"
if (-not $allUp) { exit 1 }
Write-Host "The brokers are up." -ForegroundColor Green
exit 0
