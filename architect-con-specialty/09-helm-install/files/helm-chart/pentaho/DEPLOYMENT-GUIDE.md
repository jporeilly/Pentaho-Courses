# Pentaho Helm Chart - Comprehensive Deployment Guide

This guide provides detailed, step-by-step instructions for deploying Pentaho using Helm, including in-depth explanations of the deployment process, architecture, and best practices.

## Table of Contents

- [Understanding Helm Charts](#understanding-helm-charts)
- [Deployment Architecture](#deployment-architecture)
- [Pre-Deployment Planning](#pre-deployment-planning)
- [Step-by-Step Deployment](#step-by-step-deployment)
- [Understanding the Deployment Process](#understanding-the-deployment-process)
- [Configuration Deep Dive](#configuration-deep-dive)
- [Post-Deployment Tasks](#post-deployment-tasks)
- [Environment-Specific Deployments](#environment-specific-deployments)
- [Advanced Deployment Scenarios](#advanced-deployment-scenarios)
- [Troubleshooting Deployments](#troubleshooting-deployments)

---

## Understanding Helm Charts

### What is Helm?

Helm is the package manager for Kubernetes, often referred to as "apt/yum for Kubernetes." It simplifies the deployment and management of Kubernetes applications by:

1. **Packaging**: Bundling related Kubernetes resources together
2. **Templating**: Parameterizing manifests for reusability across environments
3. **Versioning**: Managing application versions and upgrades
4. **Release Management**: Tracking deployments and enabling rollbacks

### Helm Chart Structure

A Helm chart is a collection of files organized in a specific directory structure:

```
pentaho/                          # Chart root directory
├── Chart.yaml                    # Chart metadata (name, version, description)
├── values.yaml                   # Default configuration values
├── templates/                    # Kubernetes manifest templates
│   ├── _helpers.tpl              # Template helper functions (not rendered)
│   ├── NOTES.txt                 # Post-installation instructions
│   ├── namespace.yaml            # Namespace creation
│   ├── secret.yaml               # Sensitive data (passwords, keys)
│   ├── configmap-*.yaml          # Configuration data
│   ├── pvc.yaml                  # Persistent volume claims
│   ├── *-deployment.yaml         # Pod deployments
│   ├── *-service.yaml            # Service definitions
│   └── ingress.yaml              # Ingress routing rules
└── files/                        # Non-template files (SQL scripts, configs)
    └── db_init/                  # PostgreSQL initialization scripts
```

### How Helm Deploys Applications

When you run `helm install`, Helm performs these steps:

1. **Load Chart**: Reads Chart.yaml, values.yaml, and templates
2. **Render Templates**: Combines templates with values to generate Kubernetes manifests
3. **Validate**: Checks syntax and Kubernetes API compatibility
4. **Create Resources**: Applies manifests to cluster in dependency order
5. **Track Release**: Stores release metadata as a Secret in the cluster
6. **Display Notes**: Shows NOTES.txt with access instructions

---

## Deployment Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         External Access                          │
│  (User Browser, API Clients, kubectl port-forward)             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Kubernetes Ingress Controller                 │
│                         (Traefik/Nginx)                          │
│  • Routes HTTP/HTTPS traffic based on hostname/path             │
│  • SSL/TLS termination                                          │
│  • Load balancing across pods                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Pentaho Service (ClusterIP)                   │
│  • Internal cluster DNS: pentaho-server.pentaho.svc.cluster.local
│  • Ports: 8080 (HTTP), 8443 (HTTPS)                            │
│  • Stable endpoint for ingress and internal access             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Pentaho Server Deployment                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Init Container: wait-for-postgres                       │    │
│  │ • Checks PostgreSQL availability before starting        │    │
│  │ • Prevents "connection refused" errors                  │    │
│  │ • Uses busybox netcat (nc) for TCP port check         │    │
│  └──────────────────────┬─────────────────────────────────┘    │
│                         ▼                                        │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Main Container: Pentaho Server                          │    │
│  │ ┌────────────────────────────────────────────────────┐ │    │
│  │ │ Application Stack:                                  │ │    │
│  │ │ • Tomcat 10.1.48 (Web Server)                      │ │    │
│  │ │ • Java 21 (Runtime)                                │ │    │
│  │ │ • Pentaho BA Platform 11.0.0.0-237                 │ │    │
│  │ │   - Reports & Dashboards                           │ │    │
│  │ │   - Data Integration (ETL)                         │ │    │
│  │ │   - OLAP Analysis                                  │ │    │
│  │ │   - Scheduling & Automation                        │ │    │
│  │ └────────────────────────────────────────────────────┘ │    │
│  │                                                          │    │
│  │ Environment Configuration (from ConfigMap):              │    │
│  │ • JVM Memory: PENTAHO_MIN/MAX_MEMORY                    │    │
│  │ • Database: DB_TYPE, DB_HOST, DB_PORT                   │    │
│  │ • Paths: PENTAHO_SERVER_PATH, INSTALLATION_PATH         │    │
│  │ • Timezone: TZ                                          │    │
│  │                                                          │    │
│  │ Credentials (from Secret):                              │    │
│  │ • POSTGRES_PASSWORD                                     │    │
│  │                                                          │    │
│  │ Health Probes:                                          │    │
│  │ • Startup: /pentaho/Login (max 5 min)                  │    │
│  │ • Liveness: /pentaho/Login (every 30s)                 │    │
│  │ • Readiness: /pentaho/Login (every 10s)                │    │
│  │                                                          │    │
│  │ Resource Limits:                                        │    │
│  │ • Memory: 2Gi request, 6Gi limit                       │    │
│  │ • CPU: 1 core request, 4 cores limit                   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Optional Persistent Volumes (disabled by default):             │
│  • pentaho-data-pvc → /opt/pentaho/pentaho-server/data        │
│  • pentaho-solutions-pvc → /opt/pentaho/pentaho-server/...    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PostgreSQL Service (ClusterIP)                 │
│  • Internal cluster DNS: postgres.pentaho.svc.cluster.local    │
│  • Port: 5432                                                   │
│  • Only accessible within the cluster                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL 15 Deployment                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Container: postgres:15                                  │    │
│  │                                                          │    │
│  │ Databases (auto-initialized on first boot):            │    │
│  │ ┌────────────────────────────────────────────────────┐ │    │
│  │ │ 1. jackrabbit (owner: jcr_user)                    │ │    │
│  │ │    • JCR content repository                        │ │    │
│  │ │    • Stores: reports, dashboards, files            │ │    │
│  │ │    • Tables: JR_*, REPOSITORY_*                    │ │    │
│  │ │                                                      │ │    │
│  │ │ 2. quartz (owner: pentaho_user)                    │ │    │
│  │ │    • Job scheduler database                        │ │    │
│  │ │    • Tables: QRTZ6_* (11 tables)                   │ │    │
│  │ │    • 5 scheduler locks for coordination            │ │    │
│  │ │                                                      │ │    │
│  │ │ 3. hibernate (owner: hibuser)                      │ │    │
│  │ │    • Pentaho repository & audit                    │ │    │
│  │ │    • Schema: logging (~15 tables)                  │ │    │
│  │ │    • Schema: mart (~40 tables)                     │ │    │
│  │ └────────────────────────────────────────────────────┘ │    │
│  │                                                          │    │
│  │ Initialization (via ConfigMap):                         │    │
│  │ • /docker-entrypoint-initdb.d/*.sql                    │    │
│  │ • Runs only on empty database                          │    │
│  │ • Creates users, databases, tables, indexes            │    │
│  │                                                          │    │
│  │ Health Probes:                                          │    │
│  │ • Liveness: pg_isready (every 10s)                     │    │
│  │ • Readiness: pg_isready (every 5s)                     │    │
│  │                                                          │    │
│  │ Resource Limits:                                        │    │
│  │ • Memory: 512Mi request, 2Gi limit                     │    │
│  │ • CPU: 500m request, 2 cores limit                     │    │
│  └──────────────────────┬─────────────────────────────────┘    │
│                         ▼                                        │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Persistent Volume: postgres-data-pvc                    │    │
│  │ • Size: 10Gi (configurable)                            │    │
│  │ • Mount: /var/lib/postgresql/data/pgdata               │    │
│  │ • Storage Class: local-path (K3s default)              │    │
│  │ • Access Mode: ReadWriteOnce                           │    │
│  │ • Data persists across pod restarts                    │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Resource Deployment Order

Helm deploys resources in a specific order to ensure dependencies are satisfied:

1. **Namespace** - Creates isolated environment
2. **Secrets** - Database credentials (must exist before deployments)
3. **ConfigMaps** - Configuration and initialization scripts
4. **PersistentVolumeClaims** - Storage (must exist before volume mounts)
5. **Services** - DNS endpoints (must exist before pods reference them)
6. **Deployments** - Pods (reference secrets, configmaps, PVCs, services)
7. **Ingress** - External routing (references services)

---

## Pre-Deployment Planning

### Infrastructure Requirements

#### Minimum Requirements (Development/Testing)
- **CPU**: 2 cores
- **RAM**: 4Gi
- **Storage**: 15Gi
- **Nodes**: 1

#### Recommended Requirements (Production)
- **CPU**: 8 cores (4 for Pentaho, 2 for PostgreSQL, 2 for system)
- **RAM**: 16Gi (8Gi for Pentaho, 4Gi for PostgreSQL, 4Gi for system)
- **Storage**: 100Gi (50Gi for databases, 50Gi for Pentaho files)
- **Nodes**: 3+ (for high availability)

### Storage Planning

#### Storage Classes

Check available storage classes:

```bash
kubectl get storageclass
```

Common storage classes:
- **local-path** (K3s default): Local node storage, fast but not HA
- **longhorn**: Distributed block storage, HA across nodes
- **nfs-client**: NFS-based storage, supports ReadWriteMany
- **aws-ebs/gcp-pd/azure-disk**: Cloud provider block storage

Choose based on requirements:
- **Development**: local-path (fastest, simplest)
- **Production**: longhorn or cloud provider (HA, backups)
- **Multi-replica**: nfs-client or ReadWriteMany storage

#### Volume Sizing

| Component | Default | Development | Production | Description |
|-----------|---------|-------------|------------|-------------|
| PostgreSQL | 10Gi | 10Gi | 50-100Gi | All database files |
| Pentaho Data | 10Gi | 10Gi | 50Gi | Cache, temp files, logs |
| Pentaho Solutions | 5Gi | 5Gi | 20-50Gi | Reports, dashboards, ETL jobs |

### Network Planning

#### DNS Resolution

Kubernetes provides internal DNS for services:

```
<service-name>.<namespace>.svc.cluster.local
```

Examples:
- `postgres.pentaho.svc.cluster.local` - PostgreSQL service
- `pentaho-server.pentaho.svc.cluster.local` - Pentaho service

Short form (same namespace): `postgres`, `pentaho-server`

#### External Access Options

**Option 1: Port Forward (Development)**
```bash
kubectl port-forward -n pentaho svc/pentaho-server 8080:8080
```
- Pros: Simple, no configuration needed
- Cons: Single user, terminal must stay open

**Option 2: NodePort Service**
```yaml
service:
  type: NodePort
  nodePort: 30080
```
- Pros: Accessible on all nodes
- Cons: Limited port range (30000-32767)

**Option 3: LoadBalancer (Cloud)**
```yaml
service:
  type: LoadBalancer
```
- Pros: External IP, production-ready
- Cons: Requires cloud provider, costs money

**Option 4: Ingress (Recommended)**
```yaml
ingress:
  enabled: true
  host: pentaho.company.com
```
- Pros: HTTP/HTTPS routing, TLS, multiple apps
- Cons: Requires ingress controller, DNS setup

### Security Planning

#### Credentials Management

**Development:**
```yaml
database:
  auth:
    postgresPassword: "simple-password"
```

**Production:**
```bash
# Use external secrets operator
kubectl apply -f external-secrets.yaml

# Or use Kubernetes secrets
kubectl create secret generic pentaho-secrets \
  --from-literal=postgres-password='$(openssl rand -base64 32)' \
  -n pentaho
```

Set in values:
```yaml
security:
  createSecrets: false
  existingSecret: pentaho-secrets
```

#### Network Security

**Network Policies** (optional):
```yaml
networkPolicy:
  enabled: true
```

Restricts traffic to:
- Ingress → Pentaho (port 8080)
- Pentaho → PostgreSQL (port 5432)
- Deny all other traffic

---

## Step-by-Step Deployment

### Step 1: Prepare the Environment

#### 1.1 Verify Prerequisites

```bash
# Check Helm version (requires 3.0+)
helm version
# Expected: version.BuildInfo{Version:"v3.x.x", ...}

# Check Kubernetes cluster
kubectl cluster-info
# Expected: Kubernetes control plane is running at https://...

# Check available nodes
kubectl get nodes
# Expected: At least one node in "Ready" status

# Check available resources
kubectl describe nodes | grep -A 5 "Allocated resources"
# Verify: Sufficient CPU and memory available
```

#### 1.2 Check Storage Class

```bash
# List storage classes
kubectl get storageclass

# Check default storage class
kubectl get storageclass -o jsonpath='{.items[?(@.metadata.annotations.storageclass\.kubernetes\.io/is-default-class=="true")].metadata.name}'
```

Expected output: `local-path` or your cluster's default

#### 1.3 Import Pentaho Image (K3s)

```bash
# Navigate to docker build directory
cd /home/pentaho/Pentaho-K3s-PostgreSQL/docker-build

# Build image (if not already built)
./build.sh

# Import to K3s
sudo k3s ctr images import pentaho-server-11.0.0.0-237.tar

# Verify import
sudo k3s ctr images ls | grep pentaho
# Expected: pentaho/pentaho-server:11.0.0.0-237

# Alternative: Build with automatic import
./build.sh --import
```

For non-K3s clusters:
```bash
# Push to registry
docker tag pentaho/pentaho-server:11.0.0.0-237 registry.company.com/pentaho:11.0.0.0-237
docker push registry.company.com/pentaho:11.0.0.0-237

# Update values.yaml
pentaho:
  image:
    repository: registry.company.com/pentaho
    tag: "11.0.0.0-237"
```

### Step 2: Plan Your Configuration

#### 2.1 Choose Deployment Profile

**Profile 1: Development (Default)**
- Single replica
- Minimal resources
- No persistence
- Default passwords

**Profile 2: Testing**
- Single replica
- Medium resources
- Persistent storage enabled
- Changed passwords

**Profile 3: Production**
- Single replica (or HA setup)
- Maximum resources
- Persistent storage with backups
- Secure passwords
- TLS/HTTPS enabled
- External secrets

#### 2.2 Create Custom Values File

```bash
cd /home/pentaho/Pentaho-K3s-PostgreSQL/helm-chart

# Copy default values for reference
cp pentaho/values.yaml my-values.yaml

# Edit configuration
vim my-values.yaml
```

Example testing configuration:
```yaml
# my-values.yaml
global:
  namespace: pentaho-test
  timezone: "America/New_York"

pentaho:
  resources:
    requests:
      memory: "4Gi"
      cpu: "2"
    limits:
      memory: "8Gi"
      cpu: "4"

  jvm:
    minMemory: "4096m"
    maxMemory: "6144m"

  persistence:
    data:
      enabled: true
      size: 20Gi
    solutions:
      enabled: true
      size: 10Gi

postgresql:
  persistence:
    size: 20Gi

database:
  auth:
    postgresPassword: "TestPass123!"
    jcrPassword: "TestPass123!"
    quartzPassword: "TestPass123!"
    hibernatePassword: "TestPass123!"

ingress:
  rules:
    - host: pentaho-test.company.local
      paths:
        - path: /
          pathType: Prefix
```

### Step 3: Validate Configuration

#### 3.1 Lint the Chart

```bash
helm lint pentaho
```

Expected output:
```
==> Linting pentaho

1 chart(s) linted, 0 chart(s) failed
```

#### 3.2 Render Templates (Dry Run)

```bash
# Render with default values
helm template test-release ./pentaho

# Render with custom values
helm template test-release ./pentaho -f my-values.yaml

# Save rendered output for review
helm template test-release ./pentaho -f my-values.yaml > rendered-manifests.yaml

# Review rendered manifests
less rendered-manifests.yaml
```

Check for:
- Correct namespace
- Correct image names
- Proper resource limits
- Valid secret references
- Correct volume mounts

#### 3.3 Dry-Run Install

```bash
# Simulate installation without actually creating resources
helm install pentaho ./pentaho -f my-values.yaml --dry-run --debug

# This will:
# 1. Validate templates
# 2. Check Kubernetes API compatibility
# 3. Show what would be created
# 4. NOT create any resources
```

### Step 4: Deploy the Chart

#### 4.1 Install Release

```bash
# Option 1: Install with default values
helm install pentaho ./pentaho

# Option 2: Install with custom values
helm install pentaho ./pentaho -f my-values.yaml

# Option 3: Install in specific namespace
helm install pentaho ./pentaho \
  --namespace pentaho \
  --create-namespace \
  -f my-values.yaml

# Option 4: Install with command-line overrides
helm install pentaho ./pentaho \
  --set pentaho.resources.limits.memory=8Gi \
  --set database.auth.postgresPassword=SecurePass123

# Option 5: Install with generated name
helm install --generate-name ./pentaho -f my-values.yaml
```

Expected output:
```
NAME: pentaho
LAST DEPLOYED: Sun Feb 16 11:00:00 2026
NAMESPACE: pentaho
STATUS: deployed
REVISION: 1
NOTES:
================================================================================
 Pentaho Business Analytics Platform
================================================================================
...
```

#### 4.2 Monitor Deployment

```bash
# Watch pod creation
kubectl get pods -n pentaho -w

# Expected sequence:
# 1. postgres-xxx:         0/1 ContainerCreating
# 2. postgres-xxx:         0/1 Running
# 3. postgres-xxx:         1/1 Running (ready)
# 4. pentaho-server-xxx:   0/1 Init:0/1 (wait-for-postgres)
# 5. pentaho-server-xxx:   0/1 PodInitializing
# 6. pentaho-server-xxx:   0/1 Running (startup probe)
# 7. pentaho-server-xxx:   1/1 Running (ready)

# Check deployment status
kubectl rollout status deployment/pentaho-server -n pentaho
kubectl rollout status deployment/postgres -n pentaho

# View events
kubectl get events -n pentaho --sort-by='.lastTimestamp'

# Check all resources
kubectl get all -n pentaho
```

#### 4.3 View Logs

```bash
# PostgreSQL initialization logs
kubectl logs -f deployment/postgres -n pentaho

# Look for:
# "PostgreSQL init process complete"
# "database system is ready to accept connections"

# Pentaho startup logs
kubectl logs -f deployment/pentaho-server -n pentaho

# Look for:
# "Pentaho BI Platform server is ready"
# "Server startup in [XXXXX] milliseconds"
# "Deployment of web application directory [/opt/pentaho/pentaho-server/tomcat/webapps/pentaho] has finished"

# Init container logs (if pods stuck in Init state)
kubectl logs -l app=pentaho-server -n pentaho -c wait-for-postgres
```

### Step 5: Verify Deployment

#### 5.1 Check Pod Status

```bash
# All pods should be Running and Ready
kubectl get pods -n pentaho

# Expected output:
# NAME                              READY   STATUS    RESTARTS   AGE
# pentaho-server-xxxx-yyyy          1/1     Running   0          5m
# postgres-xxxx-yyyy                1/1     Running   0          5m
```

#### 5.2 Verify Database Initialization

```bash
# List databases
kubectl exec deployment/postgres -n pentaho -- psql -U postgres -c "\l"

# Should show: jackrabbit, quartz, hibernate

# Check Quartz tables
kubectl exec deployment/postgres -n pentaho -- \
  psql -U pentaho_user -d quartz -c "\dt"

# Should show: qrtz6_* tables

# Check Quartz locks
kubectl exec deployment/postgres -n pentaho -- \
  psql -U pentaho_user -d quartz -c "SELECT lock_name FROM qrtz6_locks;"

# Should show: 5 locks
```

#### 5.3 Test Pentaho Access

```bash
# Start port forward
kubectl port-forward -n pentaho svc/pentaho-server 8080:8080 &

# Test with curl
curl -I http://localhost:8080/pentaho/Login

# Expected: HTTP/1.1 200

# Test with browser
xdg-open http://localhost:8080/pentaho  # Linux
open http://localhost:8080/pentaho      # macOS

# Login with: admin / password

# Stop port forward
kill %1
```

### Step 6: Configure External Access (Optional)

#### Option A: Ingress with DNS

```bash
# Get ingress
kubectl get ingress -n pentaho

# Get node IP
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}')

# Add to /etc/hosts
echo "$NODE_IP pentaho.local" | sudo tee -a /etc/hosts

# Access
xdg-open http://pentaho.local/pentaho
```

#### Option B: LoadBalancer (Cloud)

```yaml
# Update values
pentaho:
  service:
    type: LoadBalancer

# Apply
helm upgrade pentaho ./pentaho -f my-values.yaml

# Get external IP
kubectl get svc pentaho-server -n pentaho

# Access via external IP
xdg-open http://<EXTERNAL-IP>:8080/pentaho
```

---

## Understanding the Deployment Process

### What Happens During `helm install`

#### Phase 1: Chart Loading (0-1 seconds)

```
1. Helm reads Chart.yaml
   └─> Validates: name, version, appVersion
   └─> Checks: dependencies (none in this chart)

2. Helm loads values.yaml (default values)
   └─> Parses: YAML structure
   └─> Sets: default configuration

3. Helm loads custom values file (if provided)
   └─> Merges: with default values (custom overrides default)
   └─> Validates: data types and structure

4. Helm loads all templates from templates/
   └─> Reads: *.yaml, *.tpl files
   └─> Loads: helper functions from _helpers.tpl
   └─> Reads: non-template files from files/
```

#### Phase 2: Template Rendering (1-2 seconds)

```
1. Helm processes _helpers.tpl
   └─> Defines: reusable functions
   └─> Examples: pentaho.fullname, pentaho.labels

2. For each template file:
   a. Replace {{ .Values.* }} with actual values
   b. Execute {{ if }} conditionals
   c. Loop through {{ range }} arrays
   d. Call {{ include "helper" }} functions
   e. Generate final Kubernetes manifest

3. Example template rendering:

   Template:
   ---
   metadata:
     name: {{ include "pentaho.fullname" . }}
     namespace: {{ .Values.global.namespace }}

   Values:
   ---
   global:
     namespace: pentaho

   Rendered:
   ---
   metadata:
     name: pentaho
     namespace: pentaho
```

#### Phase 3: Validation (1-2 seconds)

```
1. YAML syntax validation
   └─> Checks: valid YAML structure
   └─> Detects: indentation errors, invalid characters

2. Kubernetes API validation
   └─> Verifies: apiVersion exists
   └─> Checks: required fields present
   └─> Validates: field types (string, int, bool)

3. Dependency validation
   └─> Ensures: referenced secrets exist (or will be created)
   └─> Checks: referenced configmaps exist (or will be created)
   └─> Validates: service references
```

#### Phase 4: Resource Creation (10-300 seconds)

Helm creates resources in weighted order:

```
Weight -5: Namespaces
├─> Creates: pentaho namespace
└─> Status: Available immediately

Weight -3: Secrets
├─> Creates: pentaho-secrets (database credentials)
└─> Status: Available immediately

Weight -2: ConfigMaps
├─> Creates: pentaho-config (environment variables)
├─> Creates: postgres-init-scripts (SQL scripts)
└─> Status: Available immediately

Weight 0: PersistentVolumeClaims
├─> Creates: postgres-data-pvc (10Gi)
├─> Creates: pentaho-data-pvc (10Gi, if enabled)
├─> Creates: pentaho-solutions-pvc (5Gi, if enabled)
├─> Provisioner: Creates PersistentVolume
├─> Binds: PVC to PV
└─> Status: Bound (5-10 seconds)

Weight 0: Services
├─> Creates: postgres service (ClusterIP)
│   └─> DNS: postgres.pentaho.svc.cluster.local available
├─> Creates: pentaho-server service (ClusterIP)
│   └─> DNS: pentaho-server.pentaho.svc.cluster.local available
└─> Status: Available immediately

Weight 0: Deployments
├─> Creates: postgres deployment
│   ├─> ReplicaSet: postgres-xxx (1 replica)
│   ├─> Pod: postgres-xxx-yyy
│   │   ├─> Container Creation: (10-30 seconds)
│   │   │   └─> Pulls postgres:15 image (if not cached)
│   │   ├─> Container Start: (1-2 seconds)
│   │   ├─> Init Script Execution: (30-60 seconds)
│   │   │   ├─> 1_create_jcr_postgresql.sql
│   │   │   ├─> 2_create_quartz_postgresql.sql
│   │   │   ├─> 3_create_repository_postgresql.sql
│   │   │   ├─> 4_pentaho_logging_postgresql.sql
│   │   │   └─> 5_pentaho_mart_postgresql.sql
│   │   ├─> Readiness Probe: (5 seconds)
│   │   │   └─> pg_isready -U postgres
│   │   └─> Status: Running and Ready
│   └─> Total Time: 45-95 seconds
│
└─> Creates: pentaho-server deployment
    ├─> ReplicaSet: pentaho-server-xxx (1 replica)
    ├─> Pod: pentaho-server-xxx-yyy
    │   ├─> Init Container: wait-for-postgres
    │   │   ├─> Waits: until PostgreSQL ready
    │   │   └─> Duration: 0-60 seconds (waits for postgres)
    │   ├─> Container Creation: (10-30 seconds)
    │   │   └─> Pulls pentaho/pentaho-server:11.0.0.0-237 (if not cached)
    │   ├─> Container Start: (60-180 seconds)
    │   │   ├─> Apply softwareOverride configs
    │   │   ├─> Start Tomcat
    │   │   ├─> Initialize JCR repository
    │   │   ├─> Connect to databases
    │   │   ├─> Deploy webapps
    │   │   └─> "Server startup in [XXXXX] milliseconds"
    │   ├─> Startup Probe: (60-300 seconds)
    │   │   ├─> Checks: GET /pentaho/Login every 10s
    │   │   └─> Max attempts: 30 (5 minutes)
    │   ├─> Readiness Probe: (after startup probe succeeds)
    │   │   └─> Checks: GET /pentaho/Login every 10s
    │   └─> Status: Running and Ready
    └─> Total Time: 180-480 seconds (3-8 minutes)

Weight 10: Ingress
├─> Creates: pentaho-ingress
├─> Ingress Controller: Processes rules
│   └─> Traefik: Updates routing configuration
└─> Status: Available immediately
```

#### Phase 5: Release Tracking

```
1. Helm creates release metadata Secret
   └─> Name: sh.helm.release.v1.pentaho.v1
   └─> Namespace: pentaho
   └─> Contains:
       ├─> Release name
       ├─> Release revision (1)
       ├─> Chart metadata
       ├─> Values used
       ├─> Rendered manifests
       └─> Installation timestamp

2. This secret enables:
   └─> helm list (show releases)
   └─> helm history (show revisions)
   └─> helm rollback (revert changes)
   └─> helm upgrade (update deployment)
```

#### Phase 6: Post-Installation Notes

```
1. Helm displays NOTES.txt
   └─> Shows: access instructions
   └─> Shows: default credentials
   └─> Shows: next steps

2. Installation complete!
   └─> Release: deployed
   └─> Revision: 1
   └─> Status: accessible via kubectl/helm commands
```

### Total Deployment Time

| Environment | Time Range | Typical |
|-------------|-----------|---------|
| Development (cached images) | 2-5 min | 3 min |
| Development (pull images) | 5-10 min | 7 min |
| Production (cached images) | 4-8 min | 6 min |
| Production (pull images) | 8-15 min | 10 min |

---

## Configuration Deep Dive

### Values.yaml Structure

The `values.yaml` file is organized into logical sections:

```yaml
# Top-level sections:
global:           # Settings that apply to all components
pentaho:          # Pentaho Server configuration
postgresql:       # PostgreSQL configuration
database:         # Database connection and authentication
ingress:          # External access configuration
configMaps:       # ConfigMap generation settings
security:         # Security and secrets
monitoring:       # Observability (optional)
backup:           # Backup configuration (optional)
commonLabels:     # Labels applied to all resources
commonAnnotations: # Annotations applied to all resources
```

### Understanding Value Precedence

Values can be set in multiple places with this precedence (highest to lowest):

1. **--set flag**: `helm install --set pentaho.replicas=2`
2. **--set-file flag**: `helm install --set-file config.json=myconfig.json`
3. **-f/--values flag**: `helm install -f custom-values.yaml`
4. **values.yaml**: Default values in the chart

Example:
```bash
# values.yaml has: replicas: 1
# custom-values.yaml has: replicas: 2
# Command line has: --set pentaho.replicas=3

helm install pentaho ./pentaho -f custom-values.yaml --set pentaho.replicas=3

# Result: replicas=3 (command line wins)
```

### Resource Configuration Explained

#### Memory and CPU Requests vs Limits

```yaml
resources:
  requests:      # Minimum guaranteed resources
    memory: "2Gi"   # Pod won't start if node doesn't have 2Gi available
    cpu: "1"        # Pod guaranteed 1 CPU core
  limits:        # Maximum allowed resources
    memory: "6Gi"   # Pod killed (OOMKilled) if it exceeds 6Gi
    cpu: "4"        # Pod throttled if it tries to use more than 4 cores
```

**Requests**: Used by Kubernetes scheduler to place pods
**Limits**: Enforced by container runtime (cgroups)

Best practices:
- Set requests = limits for predictable performance (QoS Guaranteed)
- Set requests < limits for flexible resource usage (QoS Burstable)
- Always set limits to prevent resource exhaustion

#### JVM Memory vs Container Memory

```yaml
pentaho:
  jvm:
    maxMemory: "4096m"           # JVM heap size
  resources:
    limits:
      memory: "6Gi"              # Container memory limit
```

**Rule**: Container memory should be ~1.5-2x JVM heap

Why?
- JVM heap: Java object storage
- Non-heap: Thread stacks, native memory, metaspace, code cache
- Buffer: Prevents OOMKilled during garbage collection spikes

Example sizing:
- JVM heap 2Gi → Container 4Gi
- JVM heap 4Gi → Container 6-8Gi
- JVM heap 8Gi → Container 12-16Gi

### Persistence Configuration

#### When to Enable Persistence

```yaml
pentaho:
  persistence:
    data:
      enabled: false      # Default: false to avoid volume mount issues
    solutions:
      enabled: false      # Enable for production
```

**Disable (enabled: false)** when:
- ✓ Development/testing
- ✓ Stateless deployments
- ✓ Using ConfigMaps for configuration
- ✓ All data in PostgreSQL

**Enable (enabled: true)** when:
- ✓ Production deployments
- ✓ Custom reports/dashboards need to persist
- ✓ User-uploaded files
- ✓ Log file retention

**Warning**: Empty PVCs overwrite container directories in Kubernetes (unlike Docker named volumes)

Solution: Use initContainer to populate PVCs on first run (not implemented by default)

#### Storage Class Selection

```yaml
global:
  storageClass: local-path    # K3s default
  # storageClass: longhorn    # Distributed storage
  # storageClass: nfs-client  # NFS-based
```

Comparison:

| Storage Class | Performance | HA | Multi-Node | Use Case |
|---------------|-------------|----|-----------| |
| local-path | Fastest | No | No | Development, single-node |
| longhorn | Fast | Yes | Yes | Production K3s |
| nfs-client | Moderate | Yes | Yes | Multi-node, shared access |
| aws-ebs/gcp-pd | Fast | Yes | No | Cloud, single-zone |

### Database Configuration

#### Authentication Values

```yaml
database:
  auth:
    postgresPassword: "postgres"    # PostgreSQL superuser
    jcrUser: "jcr_user"            # JackRabbit user
    jcrPassword: "password"         # JackRabbit password
    jcrDatabase: "jackrabbit"       # JCR database name
    # ... (similar for quartz, hibernate)
```

These values are used in two places:
1. **Secret**: Stored as Kubernetes secret for Pentaho to read
2. **Init Scripts**: Used by SQL scripts to create users/databases

#### External PostgreSQL

To use external PostgreSQL instead of deployed one:

```yaml
postgresql:
  enabled: false              # Don't deploy PostgreSQL

database:
  host: db.company.com        # External hostname
  port: 5432
  auth:
    postgresPassword: "external-password"
```

Requirements:
- Databases must be pre-created: jackrabbit, quartz, hibernate
- Users must be pre-created with appropriate permissions
- Network access from cluster to external database

### Ingress Configuration

#### Host-Based Routing

```yaml
ingress:
  enabled: true
  rules:
    - host: pentaho.company.com     # Specific hostname
      paths:
        - path: /
          pathType: Prefix          # Matches /, /pentaho, /api, etc.
```

Requires:
- DNS: `pentaho.company.com` → cluster ingress IP
- Or `/etc/hosts`: `10.0.0.1 pentaho.company.com`

#### Path-Based Routing

```yaml
ingress:
  rules:
    - paths:                        # No host specified
        - path: /pentaho
          pathType: Prefix          # Only matches /pentaho/*
```

Access:
- `http://<any-node-ip>/pentaho`
- `http://<load-balancer-ip>/pentaho`

#### TLS Configuration

```yaml
ingress:
  tls:
    enabled: true
    secretName: pentaho-tls-cert    # Kubernetes TLS secret
    hosts:
      - pentaho.company.com

  annotations:
    # Change to HTTPS entry point
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
```

Create TLS secret:
```bash
# Using existing certificate
kubectl create secret tls pentaho-tls-cert \
  --cert=tls.crt \
  --key=tls.key \
  -n pentaho

# Using cert-manager (automatic)
# (see Advanced Deployment Scenarios section)
```

---

## Post-Deployment Tasks

### 1. Change Default Passwords

**Via Pentaho UI:**
1. Login: http://localhost:8080/pentaho
2. Username: `admin`, Password: `password`
3. Go to: Administration → Users & Roles
4. Click: admin user → Edit
5. Set new password → Save

**Via Database (emergency):**
```bash
kubectl exec -it deployment/postgres -n pentaho -- psql -U postgres -d hibernate

-- Update admin password (bcrypt hash)
UPDATE users SET password='$2a$10$...' WHERE username='admin';
```

### 2. Configure Authentication

#### LDAP Integration

Edit values.yaml:
```yaml
configMaps:
  pentahoConfig:
    data:
      PENTAHO_SECURITY_PROVIDER: "ldap"
      LDAP_URL: "ldap://ldap.company.com:389"
      LDAP_BASE_DN: "dc=company,dc=com"
      LDAP_BIND_DN: "cn=admin,dc=company,dc=com"
      LDAP_USER_SEARCH_BASE: "ou=users"
```

Then upgrade:
```bash
helm upgrade pentaho ./pentaho -f my-values.yaml
```

### 3. Set Up Monitoring

#### Prometheus ServiceMonitor

```yaml
monitoring:
  enabled: true
  serviceMonitor:
    enabled: true
    interval: 30s
```

This creates a ServiceMonitor resource for prometheus-operator to scrape metrics.

### 4. Configure Backups

#### PostgreSQL Backup CronJob

```yaml
backup:
  enabled: true
  schedule: "0 2 * * *"      # Daily at 2 AM
  retention: 7               # Keep 7 days
  persistence:
    enabled: true
    size: 20Gi
```

Manual backup:
```bash
kubectl exec deployment/postgres -n pentaho -- \
  pg_dumpall -U postgres | gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz
```

### 5. Performance Tuning

Monitor resource usage:
```bash
# Pod resource usage
kubectl top pods -n pentaho

# Node resource usage
kubectl top nodes

# Detailed metrics
kubectl describe node <node-name> | grep -A 5 "Allocated resources"
```

Adjust resources based on usage:
```yaml
pentaho:
  resources:
    limits:
      memory: "12Gi"    # Increase if hitting limits
      cpu: "6"          # Increase for better performance
  jvm:
    maxMemory: "8192m"  # Increase with container memory
```

---

## Environment-Specific Deployments

### Development Environment

**Characteristics:**
- Minimal resources
- Fast startup
- No persistence
- Simple access

**Configuration:**
```yaml
# dev-values.yaml
global:
  namespace: pentaho-dev

pentaho:
  replicas: 1
  resources:
    requests:
      memory: "1Gi"
      cpu: "500m"
    limits:
      memory: "2Gi"
      cpu: "2"
  jvm:
    minMemory: "1024m"
    maxMemory: "1536m"
  persistence:
    data:
      enabled: false
    solutions:
      enabled: false

postgresql:
  resources:
    requests:
      memory: "256Mi"
      cpu: "250m"
    limits:
      memory: "512Mi"
      cpu: "1"
  persistence:
    size: 5Gi

ingress:
  enabled: false    # Use port-forward

database:
  auth:
    postgresPassword: "dev123"
    jcrPassword: "dev123"
    quartzPassword: "dev123"
    hibernatePassword: "dev123"
```

**Deploy:**
```bash
helm install pentaho-dev ./pentaho -f dev-values.yaml

kubectl port-forward -n pentaho-dev svc/pentaho-server 8080:8080
```

### Testing/QA Environment

**Characteristics:**
- Medium resources
- Persistent storage
- Ingress with hostname
- Automated testing

**Configuration:**
```yaml
# qa-values.yaml
global:
  namespace: pentaho-qa
  timezone: "America/New_York"

pentaho:
  replicas: 1
  resources:
    requests:
      memory: "4Gi"
      cpu: "2"
    limits:
      memory: "8Gi"
      cpu: "4"
  jvm:
    minMemory: "4096m"
    maxMemory: "6144m"
  persistence:
    data:
      enabled: true
      size: 20Gi
    solutions:
      enabled: true
      size: 10Gi

postgresql:
  persistence:
    size: 20Gi

ingress:
  enabled: true
  rules:
    - host: pentaho-qa.company.local
      paths:
        - path: /
          pathType: Prefix

database:
  auth:
    postgresPassword: "QA_SecurePass123!"
    jcrPassword: "QA_SecurePass123!"
    quartzPassword: "QA_SecurePass123!"
    hibernatePassword: "QA_SecurePass123!"
```

**Deploy:**
```bash
helm install pentaho-qa ./pentaho -f qa-values.yaml

# Add to /etc/hosts
echo "$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}') pentaho-qa.company.local" | sudo tee -a /etc/hosts

# Access
xdg-open http://pentaho-qa.company.local/pentaho
```

### Production Environment

**Characteristics:**
- Maximum resources
- High availability storage
- TLS/HTTPS
- External secrets
- Monitoring and backups

**Configuration:**
```yaml
# prod-values.yaml
global:
  namespace: pentaho-prod
  timezone: "America/New_York"
  storageClass: longhorn    # Or cloud provider storage

pentaho:
  replicas: 1
  resources:
    requests:
      memory: "8Gi"
      cpu: "4"
    limits:
      memory: "16Gi"
      cpu: "8"
  jvm:
    minMemory: "8192m"
    maxMemory: "12288m"
  persistence:
    data:
      enabled: true
      size: 100Gi
    solutions:
      enabled: true
      size: 50Gi
  probes:
    liveness:
      initialDelaySeconds: 600    # 10 minutes for large deployments
    readiness:
      initialDelaySeconds: 300    # 5 minutes

postgresql:
  resources:
    requests:
      memory: "4Gi"
      cpu: "2"
    limits:
      memory: "8Gi"
      cpu: "4"
  persistence:
    size: 100Gi

ingress:
  enabled: true
  className: traefik
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
    cert-manager.io/cluster-issuer: letsencrypt-prod
  rules:
    - host: pentaho.company.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    enabled: true
    secretName: pentaho-tls-cert
    hosts:
      - pentaho.company.com

# Use external secrets (created separately)
security:
  createSecrets: false
  existingSecret: pentaho-secrets-external

# Enable monitoring
monitoring:
  enabled: true
  serviceMonitor:
    enabled: true
    interval: 30s

# Enable backups
backup:
  enabled: true
  schedule: "0 2 * * *"
  retention: 30
  persistence:
    enabled: true
    size: 200Gi
```

**Deploy:**
```bash
# Create external secrets first
kubectl apply -f external-secrets.yaml -n pentaho-prod

# Install release
helm install pentaho-prod ./pentaho -f prod-values.yaml

# Verify
kubectl get all -n pentaho-prod
kubectl get certificate -n pentaho-prod    # Check TLS cert

# Access
xdg-open https://pentaho.company.com/pentaho
```

---

## Advanced Deployment Scenarios

### Multi-Environment Deployment

Deploy multiple Pentaho instances in the same cluster:

```bash
# Development
helm install pentaho-dev ./pentaho \
  -f dev-values.yaml \
  --namespace pentaho-dev \
  --create-namespace

# Testing
helm install pentaho-qa ./pentaho \
  -f qa-values.yaml \
  --namespace pentaho-qa \
  --create-namespace

# Production
helm install pentaho-prod ./pentaho \
  -f prod-values.yaml \
  --namespace pentaho-prod \
  --create-namespace

# List all releases
helm list --all-namespaces | grep pentaho
```

### Blue-Green Deployment

Run two versions side-by-side for zero-downtime upgrades:

```bash
# Deploy "blue" (current production)
helm install pentaho-blue ./pentaho \
  -f prod-values.yaml \
  --set ingress.rules[0].host=pentaho.company.com \
  --namespace pentaho-prod

# Deploy "green" (new version)
helm install pentaho-green ./pentaho \
  -f prod-values.yaml \
  --set pentaho.image.tag=11.1.0.0-250 \
  --set ingress.rules[0].host=pentaho-green.company.com \
  --namespace pentaho-prod

# Test green deployment
curl -I https://pentaho-green.company.com/pentaho

# Switch traffic (update DNS or ingress)
helm upgrade pentaho-green ./pentaho \
  --set ingress.rules[0].host=pentaho.company.com \
  -f prod-values.yaml

# Remove blue deployment
helm uninstall pentaho-blue -n pentaho-prod
```

### Automated CI/CD Deployment

GitLab CI example:

```.gitlab-ci.yml
deploy:
  stage: deploy
  image: alpine/helm:latest
  script:
    # Lint chart
    - helm lint pentaho

    # Dry-run
    - helm upgrade --install pentaho ./pentaho \
        -f ${CI_ENVIRONMENT_NAME}-values.yaml \
        --namespace pentaho-${CI_ENVIRONMENT_NAME} \
        --create-namespace \
        --dry-run \
        --debug

    # Actual deployment
    - helm upgrade --install pentaho ./pentaho \
        -f ${CI_ENVIRONMENT_NAME}-values.yaml \
        --namespace pentaho-${CI_ENVIRONMENT_NAME} \
        --create-namespace \
        --wait \
        --timeout 10m

    # Verify
    - kubectl get pods -n pentaho-${CI_ENVIRONMENT_NAME}
    - kubectl wait --for=condition=ready pod \
        -l app=pentaho-server \
        -n pentaho-${CI_ENVIRONMENT_NAME} \
        --timeout=600s

  environment:
    name: ${CI_ENVIRONMENT_NAME}
    url: https://pentaho-${CI_ENVIRONMENT_NAME}.company.com

  only:
    - main
    - develop
```

### Using Helm Secrets

Encrypt sensitive values using helm-secrets plugin:

```bash
# Install plugin
helm plugin install https://github.com/jkroepke/helm-secrets

# Create secrets file
cat > secrets.yaml <<EOF
database:
  auth:
    postgresPassword: SuperSecurePassword123!
    jcrPassword: SuperSecurePassword123!
    quartzPassword: SuperSecurePassword123!
    hibernatePassword: SuperSecurePassword123!
EOF

# Encrypt (requires sops and age/gpg)
helm secrets encrypt secrets.yaml

# Commit encrypted file
git add secrets.yaml
git commit -m "Add encrypted secrets"

# Deploy with secrets
helm secrets install pentaho ./pentaho \
  -f values.yaml \
  -f secrets.yaml
```

### Cert-Manager Integration

Automatic TLS certificate management:

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@company.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: traefik
EOF

# Update values for cert-manager
cat > tls-values.yaml <<EOF
ingress:
  enabled: true
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  rules:
    - host: pentaho.company.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    enabled: true
    secretName: pentaho-tls-auto
    hosts:
      - pentaho.company.com
EOF

# Deploy (certificate created automatically)
helm install pentaho ./pentaho -f tls-values.yaml

# Check certificate
kubectl get certificate -n pentaho
kubectl describe certificate pentaho-tls-auto -n pentaho
```

---

## Troubleshooting Deployments

### Common Deployment Issues

#### Issue 1: Helm Install Hangs

**Symptoms:**
```bash
helm install pentaho ./pentaho
# Hangs with no output
```

**Diagnosis:**
```bash
# Check Helm version
helm version

# Check Kubernetes connection
kubectl cluster-info

# Check tiller (Helm 2 only)
kubectl get pods -n kube-system | grep tiller
```

**Solutions:**
- Upgrade to Helm 3 (Helm 2 is deprecated)
- Check kubeconfig: `export KUBECONFIG=~/.kube/config`
- Verify cluster access: `kubectl get nodes`

#### Issue 2: Template Rendering Errors

**Symptoms:**
```bash
helm install pentaho ./pentaho -f my-values.yaml
Error: template: pentaho/templates/deployment.yaml:45: undefined variable "$"
```

**Diagnosis:**
```bash
# Test template rendering
helm template pentaho ./pentaho -f my-values.yaml

# Debug specific template
helm template pentaho ./pentaho --debug | grep -A 10 "deployment.yaml"
```

**Solutions:**
- Fix template syntax errors
- Verify values.yaml structure matches template expectations
- Check for typos in variable names

#### Issue 3: Image Pull Errors

**Symptoms:**
```bash
kubectl get pods -n pentaho
# pentaho-server-xxx: ErrImagePull or ImagePullBackOff
```

**Diagnosis:**
```bash
kubectl describe pod -l app=pentaho-server -n pentaho | grep -A 5 "Events:"
# Error: Failed to pull image "pentaho/pentaho-server:11.0.0.0-237": rpc error...
```

**Solutions:**

For K3s:
```bash
# Import image
cd ../docker-build
sudo k3s ctr images import pentaho-server-11.0.0.0-237.tar

# Verify
sudo k3s ctr images ls | grep pentaho
```

For private registry:
```bash
# Create pull secret
kubectl create secret docker-registry registry-creds \
  --docker-server=registry.company.com \
  --docker-username=user \
  --docker-password=pass \
  -n pentaho

# Update values.yaml
pentaho:
  image:
    pullSecrets:
      - name: registry-creds
```

#### Issue 4: PostgreSQL Init Container Timeout

**Symptoms:**
```bash
kubectl get pods -n pentaho
# pentaho-server-xxx: Init:0/1
```

**Diagnosis:**
```bash
kubectl logs -l app=pentaho-server -n pentaho -c wait-for-postgres
# Waiting for PostgreSQL to be ready...
# PostgreSQL is not ready - sleeping
```

**Solutions:**
```bash
# Check PostgreSQL status
kubectl get pods -l app=postgres -n pentaho

# Check PostgreSQL logs
kubectl logs deployment/postgres -n pentaho

# Common issues:
# - PVC not bound
# - Image not pulled
# - Resource limits too low
# - Init scripts failing
```

#### Issue 5: OOMKilled (Out of Memory)

**Symptoms:**
```bash
kubectl get pods -n pentaho
# pentaho-server-xxx: OOMKilled (restarting)
```

**Diagnosis:**
```bash
kubectl describe pod -l app=pentaho-server -n pentaho | grep -A 5 "Last State:"
# Last State: Terminated
#   Reason: OOMKilled
```

**Solutions:**
Increase memory limits:
```yaml
pentaho:
  resources:
    limits:
      memory: "12Gi"    # Was 6Gi
  jvm:
    maxMemory: "8192m"  # Was 4096m
```

Apply:
```bash
helm upgrade pentaho ./pentaho -f my-values.yaml
```

#### Issue 6: Startup Probe Failure

**Symptoms:**
```bash
kubectl get pods -n pentaho
# pentaho-server-xxx: Running but not Ready (0/1)
```

**Diagnosis:**
```bash
kubectl describe pod -l app=pentaho-server -n pentaho | grep -A 10 "Events:"
# Warning: Unhealthy: Startup probe failed: HTTP probe failed with statuscode: 404

kubectl logs -f deployment/pentaho-server -n pentaho
# Check for errors during startup
```

**Solutions:**
```yaml
# Increase startup probe timeout
pentaho:
  probes:
    startup:
      initialDelaySeconds: 120    # Was 60
      failureThreshold: 40        # Was 30 (total 6.6 minutes)
```

Or disable temporarily for debugging:
```yaml
pentaho:
  probes:
    startup:
      enabled: false
```

#### Issue 7: Database Connection Errors

**Symptoms:**
```bash
kubectl logs deployment/pentaho-server -n pentaho | grep -i error
# ERROR: Cannot establish connection to database
# java.sql.SQLExceptionorg.postgresql.util.PSQLException: Connection refused
```

**Diagnosis:**
```bash
# Test connectivity from Pentaho pod
kubectl exec deployment/pentaho-server -n pentaho -- nc -zv postgres 5432

# Check PostgreSQL service
kubectl get svc postgres -n pentaho

# Check PostgreSQL pod
kubectl get pods -l app=postgres -n pentaho
```

**Solutions:**
- Verify PostgreSQL is running: `kubectl get pods -l app=postgres -n pentaho`
- Check database credentials in secret match init scripts
- Verify service name in values: `database.host: postgres`

### Debugging Techniques

#### Technique 1: Step-by-Step Installation

```bash
# Install only namespace and secrets
helm template pentaho ./pentaho | kubectl apply -f - --dry-run=client

# Render and review each resource type
helm template pentaho ./pentaho | grep "kind: Secret" -A 20

# Install without hooks
helm install pentaho ./pentaho --no-hooks

# Watch events during installation
kubectl get events -n pentaho --watch &
helm install pentaho ./pentaho
```

#### Technique 2: Interactive Debugging

```bash
# Get shell in Pentaho pod
kubectl exec -it deployment/pentaho-server -n pentaho -- /bin/bash

# Inside pod:
# Check environment variables
env | grep -E "DB_|PENTAHO_"

# Check database connectivity
nc -zv postgres 5432

# Check Java version
java -version

# Check Tomcat logs
tail -f /opt/pentaho/pentaho-server/tomcat/logs/catalina.out

# Check JCR repository
ls -la /opt/pentaho/pentaho-server/pentaho-solutions/system/jackrabbit/repository
```

#### Technique 3: Resource Inspection

```bash
# Get all resources
kubectl get all -n pentaho

# Describe each resource type
kubectl describe deployment pentaho-server -n pentaho
kubectl describe service pentaho-server -n pentaho
kubectl describe configmap pentaho-config -n pentaho
kubectl describe secret pentaho-secrets -n pentaho
kubectl describe pvc -n pentaho
kubectl describe ingress pentaho-ingress -n pentaho

# Check resource usage
kubectl top pods -n pentaho
kubectl top nodes
```

#### Technique 4: Helm Release Debugging

```bash
# Get release status
helm status pentaho -n pentaho

# Get release values (what was actually used)
helm get values pentaho -n pentaho

# Get rendered manifests
helm get manifest pentaho -n pentaho > manifests.yaml

# Get release hooks
helm get hooks pentaho -n pentaho

# Check release history
helm history pentaho -n pentaho
```

---

## Best Practices

### 1. Version Control

```bash
# Store values files in Git
git add *-values.yaml
git commit -m "Add Pentaho Helm values"

# Tag releases
git tag -a v1.0.0 -m "Pentaho production deployment v1.0.0"
git push origin v1.0.0

# Use GitOps (ArgoCD, Flux)
```

### 2. Environment Parity

Keep environments as similar as possible:

```
dev-values.yaml
qa-values.yaml
prod-values.yaml

# Only differ in:
# - Resource sizes
# - Replica counts
# - Storage sizes
# - Hostnames
# - Credentials (managed externally)
```

### 3. Security Hardening

```yaml
# Use external secrets
security:
  createSecrets: false
  existingSecret: pentaho-secrets-vault

# Enable network policies
networkPolicy:
  enabled: true

# Use security contexts
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000

# Enable TLS
ingress:
  tls:
    enabled: true
```

### 4. Monitoring and Logging

```yaml
# Enable metrics
monitoring:
  enabled: true

# Configure log aggregation (external)
# - Elasticsearch
# - Loki
# - CloudWatch
```

### 5. Backup Strategy

```yaml
# Automated backups
backup:
  enabled: true
  schedule: "0 2 * * *"    # Daily
  retention: 30             # 30 days

# Test restores regularly
```

### 6. Documentation

Document your deployment:
```bash
# Create deployment README
cat > DEPLOYMENT-NOTES.md <<EOF
# Pentaho Production Deployment

## Environment
- Cluster: production-k8s
- Namespace: pentaho-prod
- Release: pentaho-prod
- Version: 1.0.0

## Values
- File: prod-values.yaml
- Last Updated: 2026-02-16
- Updated By: admin@company.com

## Access
- URL: https://pentaho.company.com
- Admin: See 1Password vault

## Backup
- Schedule: Daily 2 AM
- Retention: 30 days
- Location: s3://backups/pentaho-prod

## Monitoring
- Grafana: https://grafana.company.com/d/pentaho
- Alerts: #pentaho-alerts Slack channel

## Contacts
- Primary: admin@company.com
- Secondary: ops@company.com
EOF
```

---

## Conclusion

This deployment guide has covered:

✅ Understanding Helm charts and how they work
✅ Complete deployment architecture
✅ Pre-deployment planning and requirements
✅ Step-by-step deployment process
✅ Deep dive into configuration options
✅ Environment-specific deployment strategies
✅ Advanced scenarios and integrations
✅ Comprehensive troubleshooting

### Quick Reference

**Install:**
```bash
helm install pentaho ./pentaho -f my-values.yaml
```

**Upgrade:**
```bash
helm upgrade pentaho ./pentaho -f my-values.yaml
```

**Rollback:**
```bash
helm rollback pentaho
```

**Uninstall:**
```bash
helm uninstall pentaho -n pentaho
```

**Debug:**
```bash
helm template pentaho ./pentaho --debug
kubectl logs -f deployment/pentaho-server -n pentaho
kubectl describe pod -l app=pentaho-server -n pentaho
```

### Additional Resources

- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Pentaho Documentation](https://docs.hitachivantara.com/)
- [Chart README](README.md)
- [Installation Guide](../INSTALL.md)
- [Quick Reference](../QUICK-REFERENCE.md)

---

**Document Version:** 1.0.0
**Last Updated:** 2026-02-16
**Author:** Pentaho DevOps Team
