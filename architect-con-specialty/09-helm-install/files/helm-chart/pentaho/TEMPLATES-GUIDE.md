# Helm Chart Templates Guide

This document explains each YAML template file in the Helm chart and its purpose.

## Template Files Overview

All template files are located in: `templates/`

### Deployment Order

Helm deploys resources in this order (based on resource type weights):

1. **Namespace** → Creates isolated environment
2. **Secrets** → Stores credentials
3. **ConfigMaps** → Stores configuration
4. **PersistentVolumeClaims** → Requests storage
5. **Services** → Creates DNS endpoints
6. **Deployments** → Creates pods
7. **Ingress** → Routes external traffic

---

## Template Files

### 1. namespace.yaml

**Purpose**: Creates an isolated Kubernetes namespace to contain all Pentaho resources

**What it creates**: A Kubernetes namespace (default: `pentaho`)

**When deployed**: First (before all other resources)

**Configuration**:
```yaml
global:
  namespace: pentaho  # Set to empty string to skip namespace creation
```

**Key features**:
- Conditional: Only created if `global.namespace` is set
- All other resources are deployed into this namespace
- Provides isolation from other applications

**Example**:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: pentaho
  labels:
    app.kubernetes.io/name: pentaho
    app.kubernetes.io/managed-by: Helm
```

---

### 2. secret.yaml

**Purpose**: Stores sensitive database credentials (passwords) encrypted in Kubernetes

**What it creates**: A Kubernetes Secret with PostgreSQL and Pentaho database passwords

**When deployed**: Second (before deployments need them)

**Configuration**:
```yaml
database:
  auth:
    postgresPassword: "postgres"      # PostgreSQL superuser
    jcrPassword: "password"           # JackRabbit user
    quartzPassword: "password"        # Quartz user
    hibernatePassword: "password"     # Hibernate user
```

**Key features**:
- Base64 encoded automatically by Kubernetes
- Can be disabled if using external secrets: `security.createSecrets: false`
- Referenced by Pentaho and PostgreSQL pods

**Contains**:
- `postgres-password` - PostgreSQL superuser password
- `jcr-user`, `jcr-password`, `jcr-database` - JackRabbit credentials
- `quartz-user`, `quartz-password`, `quartz-database` - Quartz credentials
- `hibernate-user`, `hibernate-password`, `hibernate-database` - Hibernate credentials

**Security note**: For production, use external secrets management (Vault, AWS Secrets Manager)

---

### 3. configmap-pentaho.yaml

**Purpose**: Configures Pentaho environment variables (JVM memory, database settings, paths, timezone)

**What it creates**: A ConfigMap with Pentaho Server configuration

**When deployed**: Third (before Pentaho deployment)

**Configuration**:
```yaml
pentaho:
  jvm:
    minMemory: "2048m"
    maxMemory: "4096m"

database:
  type: postgres
  host: postgres
  port: 5432

global:
  timezone: "America/New_York"
```

**Key features**:
- Loaded as environment variables in Pentaho container
- Can be updated and pods restarted to apply changes
- No secrets (passwords) stored here

**Contains**:
- `PENTAHO_MIN_MEMORY` - JVM minimum heap size
- `PENTAHO_MAX_MEMORY` - JVM maximum heap size
- `DB_TYPE` - Database type (postgres)
- `DB_HOST` - Database hostname
- `DB_PORT` - Database port
- `PENTAHO_SERVER_PATH` - Pentaho installation path
- `TZ` - Timezone

---

### 4. configmap-postgres-init.yaml

**Purpose**: Contains SQL scripts to initialize PostgreSQL databases (jackrabbit, quartz, hibernate) on first startup

**What it creates**: A ConfigMap with 5 SQL initialization scripts

**When deployed**: Third (before PostgreSQL deployment)

**Key features**:
- Scripts are loaded from `files/db_init/*.sql`
- Mounted to `/docker-entrypoint-initdb.d/` in PostgreSQL container
- Executed only on first startup (when database is empty)
- Creates databases, users, tables, and indexes

**Contains**:
- `1_create_jcr_postgresql.sql` - JackRabbit content repository
- `2_create_quartz_postgresql.sql` - Quartz job scheduler (11 tables, 5 locks)
- `3_create_repository_postgresql.sql` - Hibernate repository
- `4_pentaho_logging_postgresql.sql` - Logging schema (~15 tables)
- `5_pentaho_mart_postgresql.sql` - Mart schema (~40 tables)

**Configuration**:
```yaml
postgresql:
  initScripts:
    enabled: true
```

---

### 5. pvc.yaml

**Purpose**: Requests persistent storage volumes for PostgreSQL data and optional Pentaho data/solutions

**What it creates**: PersistentVolumeClaims for data persistence

**When deployed**: Fourth (before pods mount them)

**Configuration**:
```yaml
postgresql:
  persistence:
    enabled: true
    size: 10Gi

pentaho:
  persistence:
    data:
      enabled: false  # Disabled by default
      size: 10Gi
    solutions:
      enabled: false  # Disabled by default
      size: 5Gi

global:
  storageClass: local-path  # K3s default
```

**Creates (conditionally)**:
1. `postgres-data-pvc` - PostgreSQL data (always if postgresql.enabled)
2. `pentaho-data-pvc` - Pentaho data directory (optional)
3. `pentaho-solutions-pvc` - Pentaho solutions directory (optional)

**Key features**:
- Uses storage class specified in `global.storageClass`
- ReadWriteOnce access mode (single node access)
- Data persists across pod restarts

**Note**: Pentaho PVCs are disabled by default to avoid empty volume mount issues

---

### 6. postgres-service.yaml

**Purpose**: Exposes PostgreSQL port 5432 as a stable DNS endpoint for Pentaho to connect to

**What it creates**: A ClusterIP Service for PostgreSQL

**When deployed**: Fifth (before deployments reference it)

**Configuration**:
```yaml
postgresql:
  service:
    type: ClusterIP
    port: 5432

database:
  host: postgres  # Service name
```

**Key features**:
- Internal DNS: `postgres.pentaho.svc.cluster.local`
- Short form: `postgres` (within same namespace)
- Not accessible from outside the cluster
- Stable endpoint even if pod IP changes

**Selects pods with labels**:
```yaml
app: postgres
```

---

### 7. postgres-deployment.yaml

**Purpose**: Deploys PostgreSQL 15 database server with automatic initialization and persistent storage

**What it creates**: A Deployment with 1 PostgreSQL pod

**When deployed**: Sixth (after PVCs and ConfigMaps)

**Configuration**:
```yaml
postgresql:
  image:
    repository: postgres
    tag: "15"
  replicas: 1
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "2Gi"
      cpu: "2"
```

**Key features**:
- Uses official `postgres:15` image
- Mounts PVC for data persistence
- Mounts ConfigMap with SQL init scripts
- Health probes: liveness and readiness
- Recreate strategy (not RollingUpdate)

**Environment variables**:
- `POSTGRES_PASSWORD` - From secret
- `PGDATA` - Custom data directory path
- `TZ` - Timezone

**Volumes**:
- `postgres-data` - Persistent volume claim
- `postgres-init` - ConfigMap with SQL scripts

---

### 8. pentaho-service.yaml

**Purpose**: Exposes Pentaho Server ports 8080 (HTTP) and 8443 (HTTPS) for ingress and internal access

**What it creates**: A ClusterIP Service for Pentaho Server

**When deployed**: Fifth (before ingress references it)

**Configuration**:
```yaml
pentaho:
  service:
    type: ClusterIP
    http:
      port: 8080
    https:
      port: 8443
```

**Key features**:
- Internal DNS: `pentaho-server.pentaho.svc.cluster.local`
- Short form: `pentaho-server`
- Two ports: 8080 (HTTP), 8443 (HTTPS)
- Referenced by ingress for routing

**Selects pods with labels**:
```yaml
app: pentaho-server
```

---

### 9. pentaho-deployment.yaml

**Purpose**: Deploys Pentaho Business Analytics Server with init container, health probes, and resource limits

**What it creates**: A Deployment with 1 Pentaho Server pod

**When deployed**: Sixth (after all dependencies)

**Configuration**:
```yaml
pentaho:
  image:
    repository: pentaho/pentaho-server
    tag: 11.0.0.0-237
  replicas: 1
  hostname: pentaho-server
  resources:
    requests:
      memory: "2Gi"
      cpu: "1"
    limits:
      memory: "6Gi"
      cpu: "4"
```

**Key features**:
- **Init container**: `wait-for-postgres` - Waits for PostgreSQL to be ready
- **Main container**: Pentaho Server (Tomcat + Java + Pentaho)
- **Health probes**: Startup (5 min), liveness, readiness
- **Environment**: From ConfigMap and Secret
- **Optional volumes**: Data and solutions PVCs (if enabled)

**Init container**:
```yaml
initContainer:
  enabled: true
  image:
    repository: busybox
    tag: "1.36"
```

Checks PostgreSQL availability before starting Pentaho

**Health probes**:
- Startup: `/pentaho/Login` (max 5 minutes)
- Liveness: `/pentaho/Login` (every 30s)
- Readiness: `/pentaho/Login` (every 10s)

---

### 10. ingress.yaml

**Purpose**: Routes external HTTP/HTTPS traffic to Pentaho Server via Traefik ingress controller

**What it creates**: An Ingress resource with routing rules

**When deployed**: Last (after services are ready)

**Configuration**:
```yaml
ingress:
  enabled: true
  className: traefik

  rules:
    - host: pentaho.local
      paths:
        - path: /
          pathType: Prefix
    - paths:
        - path: /pentaho
          pathType: Prefix

  tls:
    enabled: false
```

**Key features**:
- Two routing rules:
  1. Host-based: `pentaho.local` → all paths
  2. Path-based: `<any-ip>/pentaho` → Pentaho
- Optional TLS/HTTPS support
- Traefik annotations for buffering, timeouts, etc.

**Access methods**:
1. Via hostname: `http://pentaho.local/pentaho`
2. Via node IP: `http://<node-ip>/pentaho`
3. Via port-forward: `kubectl port-forward svc/pentaho-server 8080:8080`

**TLS configuration** (optional):
```yaml
tls:
  enabled: true
  secretName: pentaho-tls-cert
  hosts:
    - pentaho.local
```

---

## Helper Templates

### _helpers.tpl

**Purpose**: Defines reusable template functions

**Not deployed**: Helper file only (not a Kubernetes resource)

**Contains**:
- `pentaho.name` - Chart name
- `pentaho.fullname` - Full release name
- `pentaho.labels` - Common labels
- `pentaho.selectorLabels` - Pod selector labels
- `pentaho.namespace` - Namespace to use
- `pentaho.secretName` - Secret name to use
- `pentaho.postgresql.host` - PostgreSQL host
- `pentaho.ingress.apiVersion` - Ingress API version

**Usage in templates**:
```yaml
name: {{ include "pentaho.fullname" . }}
labels:
  {{- include "pentaho.labels" . | nindent 4 }}
```

---

## NOTES.txt

**Purpose**: Displays post-installation instructions

**Not deployed**: Displayed to user after `helm install`

**Contains**:
- Access instructions
- Default credentials
- Monitoring commands
- Configuration info
- Next steps

**Shown when**:
- `helm install`
- `helm upgrade`
- `helm status`

---

## Template Rendering

### How Values Are Used

Templates use Go templating with Helm functions:

```yaml
# Access values
{{ .Values.pentaho.image.repository }}

# Call helper functions
{{ include "pentaho.fullname" . }}

# Conditionals
{{- if .Values.ingress.enabled }}
...
{{- end }}

# Loops
{{- range .Values.ingress.rules }}
...
{{- end }}
```

### Rendering Locally

Test template rendering without deploying:

```bash
# Render all templates
helm template pentaho ./pentaho

# Render with custom values
helm template pentaho ./pentaho -f custom-values.yaml

# Render specific template
helm template pentaho ./pentaho -s templates/ingress.yaml

# Debug mode
helm template pentaho ./pentaho --debug
```

---

## Validation

### Lint Chart

```bash
helm lint pentaho
```

Checks for:
- Valid YAML syntax
- Required fields present
- Indentation correct
- Template errors

### Dry-Run

```bash
helm install pentaho ./pentaho --dry-run --debug
```

- Renders templates
- Validates against Kubernetes API
- Shows what would be created
- Doesn't actually deploy

---

## Customization

### Override Values

**Method 1: Custom values file**
```yaml
# custom-values.yaml
pentaho:
  replicas: 2
  resources:
    limits:
      memory: "8Gi"
```

```bash
helm install pentaho ./pentaho -f custom-values.yaml
```

**Method 2: Command line**
```bash
helm install pentaho ./pentaho \
  --set pentaho.replicas=2 \
  --set pentaho.resources.limits.memory=8Gi
```

### Modify Templates

Templates can be edited directly:

1. Edit template file: `templates/pentaho-deployment.yaml`
2. Test rendering: `helm template pentaho ./pentaho`
3. Deploy: `helm upgrade pentaho ./pentaho`

---

## Troubleshooting Templates

### Template Rendering Errors

```bash
# Show detailed error
helm template pentaho ./pentaho --debug

# Check specific template
helm template pentaho ./pentaho -s templates/ingress.yaml
```

### Check Generated Resources

```bash
# Save rendered templates
helm template pentaho ./pentaho > rendered.yaml

# Review
less rendered.yaml

# Validate with kubectl
kubectl apply --dry-run=client -f rendered.yaml
```

### Common Issues

**Issue**: `undefined variable`
**Fix**: Check values.yaml has the required value

**Issue**: `template: pentaho/templates/deployment.yaml:45: unexpected EOF`
**Fix**: Check for unclosed `{{-` blocks

**Issue**: `error converting YAML to JSON`
**Fix**: Check YAML indentation

---

## Summary Table

| Template | Resource Type | Purpose | Conditional |
|----------|--------------|---------|-------------|
| namespace.yaml | Namespace | Creates isolated namespace | `global.namespace` |
| secret.yaml | Secret | Stores passwords | `security.createSecrets` |
| configmap-pentaho.yaml | ConfigMap | Pentaho config | `configMaps.pentahoConfig.enabled` |
| configmap-postgres-init.yaml | ConfigMap | SQL init scripts | `postgresql.enabled && postgresql.initScripts.enabled` |
| pvc.yaml | PersistentVolumeClaim | Storage volumes | `*.persistence.enabled` |
| postgres-service.yaml | Service | PostgreSQL DNS endpoint | `postgresql.enabled` |
| postgres-deployment.yaml | Deployment | PostgreSQL pod | `postgresql.enabled` |
| pentaho-service.yaml | Service | Pentaho DNS endpoint | `pentaho.enabled` |
| pentaho-deployment.yaml | Deployment | Pentaho pod | `pentaho.enabled` |
| ingress.yaml | Ingress | External routing | `ingress.enabled` |

---

**Last Updated**: 2026-02-16
**Chart Version**: 1.0.0
**Templates**: 10 resource templates + 2 helpers
