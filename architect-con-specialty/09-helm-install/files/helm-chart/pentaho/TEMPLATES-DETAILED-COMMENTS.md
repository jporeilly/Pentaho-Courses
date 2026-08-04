# Helm Templates - Detailed Comments and Explanations

This document provides detailed, line-by-line explanations for all Helm template files in the Pentaho chart.

## Table of Contents

1. [namespace.yaml](#namespaceyaml) - Namespace Creation
2. [secret.yaml](#secretyaml) - Database Credentials
3. [pvc.yaml](#pvcyaml) - Persistent Volume Claims
4. [configmap-pentaho.yaml](#configmap-pentahoyaml) - Pentaho Configuration
5. [configmap-postgres-init.yaml](#configmap-postgres-inityaml) - Database Initialization
6. [postgres-service.yaml](#postgres-serviceyaml) - PostgreSQL Service
7. [postgres-deployment.yaml](#postgres-deploymentyaml) - PostgreSQL Deployment
8. [pentaho-service.yaml](#pentaho-serviceyaml) - Pentaho Service
9. [pentaho-deployment.yaml](#pentaho-deploymentyaml) - Pentaho Deployment
10. [ingress.yaml](#ingressyaml) - Ingress Routing

---

## namespace.yaml

**Purpose**: Creates an isolated Kubernetes namespace to contain all Pentaho resources.

### Why Namespaces Matter
- **Logical Isolation**: Separates Pentaho from other applications
- **Resource Quotas**: Can limit CPU/memory per namespace
- **RBAC**: Role-based access control per namespace
- **Network Policies**: Restrict pod-to-pod communication
- **Easy Cleanup**: `kubectl delete namespace pentaho` removes everything

### Detailed Breakdown

```yaml
{{/*
Helm comment block - not rendered in final YAML
Only creates namespace if .Values.global.namespace is set
If empty, uses release namespace or current kubectl context
*/}}
{{- if .Values.global.namespace }}

apiVersion: v1                    # Kubernetes API version for namespaces
kind: Namespace                   # Resource type

metadata:
  # Template function call to get namespace name from values.yaml
  # Uses _helpers.tpl function for consistency
  name: {{ include "pentaho.namespace" . }}

  labels:
    # Standard Helm labels (app, version, instance, managed-by)
    # Defined in _helpers.tpl as reusable template
    {{- include "pentaho.labels" . | nindent 4 }}

    # Component label for filtering: kubectl get all -l component=namespace
    app.kubernetes.io/component: namespace

  {{- with .Values.commonAnnotations }}
  annotations:
    # Optional custom annotations from values.yaml
    # Example: cert-manager.io/inject-ca-from=ca-issuer
    {{- toYaml . | nindent 4 }}
  {{- end }}
{{- end }}
```

### Configuration Options

| Value | Default | Description |
|-------|---------|-------------|
| `global.namespace` | `pentaho` | Namespace name |
| `commonAnnotations` | `{}` | Custom annotations |

### Usage Examples

```bash
# Check if namespace was created
kubectl get namespace pentaho

# View namespace labels
kubectl get namespace pentaho --show-labels

# Delete namespace (WARNING: removes all resources)
kubectl delete namespace pentaho
```

---

## secret.yaml

**Purpose**: Stores sensitive database credentials (passwords) encrypted in Kubernetes.

### Security Considerations

⚠️ **Important Security Notes**:
- Secrets are **base64 encoded**, NOT encrypted by default
- Enable [encryption at rest](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/) in production
- Use external secret managers: HashiCorp Vault, AWS Secrets Manager, Azure Key Vault
- Never commit real passwords to Git repositories
- Rotate credentials regularly

### Detailed Breakdown

```yaml
{{/*
Conditional creation based on security.createSecrets flag
Set to false if using an existing secret or external secret manager
*/}}
{{- if .Values.security.createSecrets }}

apiVersion: v1
kind: Secret                      # Kubernetes Secret resource

metadata:
  # Secret name used by deployments to reference credentials
  # Example: postgres-secrets
  name: {{ include "pentaho.secretName" . }}
  namespace: {{ include "pentaho.namespace" . }}

  labels:
    {{- include "pentaho.labels" . | nindent 4 }}
    app.kubernetes.io/component: secrets

type: Opaque                      # Opaque = arbitrary user-defined data

# stringData vs data:
# - stringData: plain text, auto-encoded to base64
# - data: must manually base64 encode values
stringData:
  # PostgreSQL superuser password
  # Used by PostgreSQL container: POSTGRES_PASSWORD env var
  postgres-password: {{ .Values.database.auth.postgresPassword | quote }}

  # JCR (JackRabbit Content Repository) credentials
  # Stores: reports, folders, permissions, metadata
  jcr-user: {{ .Values.database.auth.jcrUser | quote }}
  jcr-password: {{ .Values.database.auth.jcrPassword | quote }}
  jcr-database: {{ .Values.database.auth.jcrDatabase | quote }}

  # Quartz Scheduler credentials
  # Stores: scheduled reports, triggers, job definitions
  quartz-user: {{ .Values.database.auth.quartzUser | quote }}
  quartz-password: {{ .Values.database.auth.quartzPassword | quote }}
  quartz-database: {{ .Values.database.auth.quartzDatabase | quote }}

  # Hibernate ORM credentials
  # Stores: users, roles, permissions, audit logs
  hibernate-user: {{ .Values.database.auth.hibernateUser | quote }}
  hibernate-password: {{ .Values.database.auth.hibernatePassword | quote }}
  hibernate-database: {{ .Values.database.auth.hibernateDatabase | quote }}
{{- end }}
```

### How Secrets Are Used

Deployments reference secrets via environment variables:

```yaml
env:
  - name: POSTGRES_PASSWORD
    valueFrom:
      secretKeyRef:
        name: postgres-secrets       # Secret name from metadata
        key: postgres-password        # Key from stringData
```

### Configuration Options

| Value | Default | Description |
|-------|---------|-------------|
| `security.createSecrets` | `true` | Create secret or use existing |
| `security.existingSecret` | `""` | Name of existing secret |
| `database.auth.postgresPassword` | `postgres` | PostgreSQL password |
| `database.auth.jcrUser` | `jcr_user` | JCR username |
| `database.auth.jcrPassword` | `password` | JCR password |

### Best Practices

```bash
# Create secret from command line (better than values.yaml)
kubectl create secret generic postgres-secrets \
  --from-literal=postgres-password='MySecurePassword123!' \
  --namespace pentaho

# Use with existing secret
helm install pentaho ./pentaho \
  --set security.createSecrets=false \
  --set security.existingSecret=postgres-secrets

# View secret (base64 encoded)
kubectl get secret postgres-secrets -o yaml

# Decode secret
kubectl get secret postgres-secrets -o jsonpath='{.data.postgres-password}' | base64 -d
```

---

## pvc.yaml

**Purpose**: Requests persistent storage volumes for PostgreSQL data and optional Pentaho data/solutions.

### Why Persistent Volumes Matter

Without PVCs:
- ❌ Data lost when pods restart
- ❌ Cannot scale stateful applications
- ❌ No backup/restore capability

With PVCs:
- ✅ Data survives pod restarts
- ✅ Decoupled storage lifecycle
- ✅ Supports backup and DR
- ✅ Can resize volumes (if supported by storage class)

### Storage Architecture

```
PersistentVolume (PV)           ← Physical storage
        ↑
PersistentVolumeClaim (PVC)     ← Request for storage
        ↑
Pod                              ← Mounts PVC as volume
```

### Detailed Breakdown

```yaml
{{/*
Three PVCs in this file:
1. postgres-data-pvc (enabled by default)
2. pentaho-data-pvc (disabled by default)
3. pentaho-solutions-pvc (disabled by default)
*/}}

# ===== PostgreSQL Data PVC =====
{{- if .Values.postgresql.enabled }}
{{- if .Values.postgresql.persistence.enabled }}
---
apiVersion: v1
kind: PersistentVolumeClaim

metadata:
  # PVC name referenced by postgres deployment
  name: postgres-data-pvc
  namespace: {{ include "pentaho.namespace" . }}
  labels:
    {{- include "pentaho.postgresql.labels" . | nindent 4 }}
    app.kubernetes.io/component: storage

spec:
  # Access modes determine how volumes can be mounted:
  # - ReadWriteOnce (RWO): Single node, read-write
  # - ReadWriteMany (RWX): Multiple nodes, read-write (requires NFS/CephFS)
  # - ReadOnlyMany (ROX): Multiple nodes, read-only
  accessModes:
    - {{ .Values.postgresql.persistence.accessMode }}  # Default: ReadWriteOnce

  # Storage class determines the provisioner:
  # - local-path: K3s default (node-local, fast, no replication)
  # - nfs-client: Network storage (slower, multi-node)
  # - longhorn: Distributed storage (replicated, resilient)
  storageClassName: {{ .Values.global.storageClass }}

  resources:
    requests:
      # Requested size (10Gi default)
      # Can request more than available (overprovisioning)
      storage: {{ .Values.postgresql.persistence.size }}
{{- end }}
{{- end }}

# ===== Pentaho Data PVC (DISABLED BY DEFAULT) =====
{{- if .Values.pentaho.enabled }}
{{- if .Values.pentaho.persistence.data.enabled }}
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pentaho-data-pvc
  namespace: {{ include "pentaho.namespace" . }}
  labels:
    {{- include "pentaho.labels" . | nindent 4 }}
    app.kubernetes.io/component: data-storage
spec:
  accessModes:
    - {{ .Values.pentaho.persistence.data.accessMode }}
  storageClassName: {{ .Values.global.storageClass }}
  resources:
    requests:
      storage: {{ .Values.pentaho.persistence.data.size }}  # Default: 10Gi
{{- end }}

# ===== Pentaho Solutions PVC (DISABLED BY DEFAULT) =====
{{- if .Values.pentaho.persistence.solutions.enabled }}
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pentaho-solutions-pvc
  namespace: {{ include "pentaho.namespace" . }}
  labels:
    {{- include "pentaho.labels" . | nindent 4 }}
    app.kubernetes.io/component: solutions-storage
spec:
  accessModes:
    - {{ .Values.pentaho.persistence.solutions.accessMode }}
  storageClassName: {{ .Values.global.storageClass }}
  resources:
    requests:
      storage: {{ .Values.pentaho.persistence.solutions.size }}  # Default: 5Gi
{{- end }}
{{- end }}
```

### Why Pentaho PVCs Are Disabled

⚠️ **Important**: Kubernetes empty PVCs overwrite directory contents!

```yaml
# Docker behavior (preserves existing files):
volumes:
  - pentaho-data:/opt/pentaho/data       ✅ Existing files remain

# Kubernetes behavior (overwrites with empty directory):
volumeMounts:
  - name: pentaho-data
    mountPath: /opt/pentaho/data         ❌ Existing files deleted!
```

**Solution**: Use initContainer to copy files to PVC before mounting.

### Storage Class Comparison

| Storage Class | Speed | Multi-Node | Replication | Best For |
|---------------|-------|------------|-------------|----------|
| **local-path** | Fast | ❌ No | ❌ No | Development, single-node |
| **nfs-client** | Medium | ✅ Yes | ❌ No | Shared storage |
| **longhorn** | Medium | ✅ Yes | ✅ Yes | Production, HA |
| **rook-ceph** | Medium | ✅ Yes | ✅ Yes | Cloud-native, scalable |

### Configuration Options

| Value | Default | Description |
|-------|---------|-------------|
| `postgresql.persistence.enabled` | `true` | Enable PostgreSQL PVC |
| `postgresql.persistence.size` | `10Gi` | PostgreSQL volume size |
| `pentaho.persistence.data.enabled` | `false` | Enable Pentaho data PVC |
| `pentaho.persistence.solutions.enabled` | `false` | Enable Pentaho solutions PVC |
| `global.storageClass` | `local-path` | Storage provisioner |

### Usage Examples

```bash
# List PVCs
kubectl get pvc -n pentaho

# View PVC details
kubectl describe pvc postgres-data-pvc -n pentaho

# Check bound PersistentVolume
kubectl get pv

# Resize PVC (if storage class supports it)
kubectl patch pvc postgres-data-pvc -n pentaho \
  -p '{"spec":{"resources":{"requests":{"storage":"20Gi"}}}}'

# Delete PVC (WARNING: deletes data!)
kubectl delete pvc postgres-data-pvc -n pentaho
```

---

## configmap-pentaho.yaml

**Purpose**: Configures Pentaho environment variables (JVM memory, database settings, paths, timezone).

### ConfigMaps vs Secrets

| ConfigMap | Secret |
|-----------|--------|
| Non-sensitive configuration | Sensitive data (passwords, keys) |
| Visible in pod specs | Base64 encoded |
| JVM settings, paths, URLs | Database passwords, API keys |

### Detailed Breakdown

```yaml
{{- if .Values.configMaps.pentahoConfig.enabled }}
apiVersion: v1
kind: ConfigMap

metadata:
  name: pentaho-config
  namespace: {{ include "pentaho.namespace" . }}
  labels:
    {{- include "pentaho.labels" . | nindent 4 }}
    app.kubernetes.io/component: config

data:
  # === JVM Memory Settings ===
  # Min heap size: Initial memory allocated to JVM
  # Should be ≤ 75% of container memory request
  PENTAHO_MIN_MEMORY: {{ .Values.pentaho.jvm.minMemory | quote }}  # Default: 2048m

  # Max heap size: Maximum memory JVM can use
  # Should be ≤ 75% of container memory limit
  # Example: 6Gi limit → 4096m max heap
  PENTAHO_MAX_MEMORY: {{ .Values.pentaho.jvm.maxMemory | quote }}  # Default: 4096m

  # === Database Configuration ===
  # Database type (postgres, mysql, oracle)
  DB_TYPE: {{ .Values.database.type | quote }}

  # Database hostname (Service name from postgres-service.yaml)
  # Resolved via Kubernetes DNS: postgres.pentaho.svc.cluster.local
  DB_HOST: {{ include "pentaho.postgresql.host" . | quote }}

  # Database port (5432 for PostgreSQL)
  DB_PORT: {{ include "pentaho.postgresql.port" . | quote }}

  # === Pentaho Installation Paths ===
  # Server directory path (contains tomcat, data, pentaho-solutions)
  PENTAHO_SERVER_PATH: {{ .Values.pentaho.paths.server | quote }}

  # Installation root path
  INSTALLATION_PATH: {{ .Values.pentaho.paths.installation | quote }}

  # === Timezone Configuration ===
  # Sets container timezone (affects logs, scheduled jobs)
  # Format: America/New_York, Europe/London, UTC
  TZ: {{ .Values.global.timezone | quote }}

  # === Custom Environment Variables ===
  # Add additional config via values.yaml:
  # configMaps.pentahoConfig.data:
  #   PENTAHO_DEBUG_MODE: "true"
  #   PENTAHO_LOG_LEVEL: "DEBUG"
  {{- with .Values.configMaps.pentahoConfig.data }}
  {{- toYaml . | nindent 2 }}
  {{- end }}
{{- end }}
```

### How ConfigMaps Are Used

Pentaho deployment references ConfigMap via `envFrom`:

```yaml
containers:
  - name: pentaho-server
    envFrom:
      - configMapRef:
          name: pentaho-config    # Injects ALL keys as environment variables
```

Alternative: Select specific keys:

```yaml
env:
  - name: PENTAHO_MAX_MEMORY
    valueFrom:
      configMapKeyRef:
        name: pentaho-config
        key: PENTAHO_MAX_MEMORY
```

### JVM Memory Sizing Guide

| Container Memory | JVM Min | JVM Max | Notes |
|------------------|---------|---------|-------|
| 2Gi | 512m | 1536m | Minimal (dev only) |
| 4Gi | 1024m | 3072m | Small deployments |
| 6Gi | 2048m | 4096m | **Default** (recommended) |
| 8Gi | 3072m | 6144m | Medium workloads |
| 12Gi | 4096m | 9216m | Large deployments |

**Rule of Thumb**: JVM Max ≤ 75% of container limit

### Configuration Options

| Value | Default | Description |
|-------|---------|-------------|
| `pentaho.jvm.minMemory` | `2048m` | JVM initial heap size |
| `pentaho.jvm.maxMemory` | `4096m` | JVM maximum heap size |
| `database.type` | `postgres` | Database type |
| `database.host` | `postgres` | Database hostname |
| `database.port` | `5432` | Database port |
| `global.timezone` | `America/New_York` | Container timezone |

### Usage Examples

```bash
# View ConfigMap data
kubectl get configmap pentaho-config -n pentaho -o yaml

# Edit ConfigMap (requires pod restart to take effect)
kubectl edit configmap pentaho-config -n pentaho

# Restart Pentaho pods to pick up changes
kubectl rollout restart deployment pentaho-server -n pentaho

# Add custom environment variable
helm upgrade pentaho ./pentaho \
  --set configMaps.pentahoConfig.data.PENTAHO_DEBUG_MODE=true
```

---

## configmap-postgres-init.yaml

**Purpose**: Contains SQL scripts to initialize PostgreSQL databases (jackrabbit, quartz, hibernate) on first startup.

### Database Initialization Flow

```
1. PostgreSQL starts → Empty database
2. Checks /docker-entrypoint-initdb.d/ for *.sql files
3. Executes scripts in alphabetical order (1_, 2_, 3_...)
4. Creates databases, users, schemas, tables
5. Initialization complete → Database ready
```

### Detailed Breakdown

```yaml
{{/*
Only create if both PostgreSQL and init scripts are enabled
Conditional prevents unnecessary resources
*/}}
{{- if and .Values.postgresql.enabled .Values.postgresql.initScripts.enabled }}

apiVersion: v1
kind: ConfigMap

metadata:
  # ConfigMap name referenced by postgres deployment
  name: postgres-init-scripts
  namespace: {{ include "pentaho.namespace" . }}
  labels:
    {{- include "pentaho.postgresql.labels" . | nindent 4 }}
    app.kubernetes.io/component: database-init

data:
  # === Script 1: JCR Database ===
  # Creates: jackrabbit database, jcr_user, schemas, tables
  # Purpose: Content repository (reports, folders, permissions)
  1_create_jcr_postgresql.sql: |
{{ .Files.Get "files/db_init/1_create_jcr_postgresql.sql" | indent 4 }}

  # === Script 2: Quartz Database ===
  # Creates: quartz database, pentaho_user, scheduler tables
  # Purpose: Job scheduling (triggers, cron jobs, scheduled reports)
  2_create_quartz_postgresql.sql: |
{{ .Files.Get "files/db_init/2_create_quartz_postgresql.sql" | indent 4 }}

  # === Script 3: Hibernate Database ===
  # Creates: hibernate database, hibuser, ORM tables
  # Purpose: User/role management, audit logs, settings
  3_create_repository_postgresql.sql: |
{{ .Files.Get "files/db_init/3_create_repository_postgresql.sql" | indent 4 }}

  # === Script 4: Logging Database ===
  # Creates: Pentaho logging tables and schemas
  # Purpose: Application logs, ETL job logs, error tracking
  4_pentaho_logging_postgresql.sql: |
{{ .Files.Get "files/db_init/4_pentaho_logging_postgresql.sql" | indent 4 }}

  # === Script 5: Data Mart Database ===
  # Creates: Pentaho data mart tables
  # Purpose: Analytics, reporting, data warehouse
  5_pentaho_mart_postgresql.sql: |
{{ .Files.Get "files/db_init/5_pentaho_mart_postgresql.sql" | indent 4 }}
{{- end }}
```

### How Init Scripts Are Mounted

PostgreSQL deployment mounts ConfigMap as volume:

```yaml
volumeMounts:
  - name: postgres-init
    mountPath: /docker-entrypoint-initdb.d  # PostgreSQL auto-executes *.sql here

volumes:
  - name: postgres-init
    configMap:
      name: postgres-init-scripts
```

### Script Execution Order

Scripts execute in **alphabetical order**:

```
1_create_jcr_postgresql.sql          (1st)
2_create_quartz_postgresql.sql       (2nd)
3_create_repository_postgresql.sql   (3rd)
4_pentaho_logging_postgresql.sql    (4th)
5_pentaho_mart_postgresql.sql       (5th)
```

### What Each Database Does

| Database | Purpose | Tables | Users |
|----------|---------|--------|-------|
| **jackrabbit** | Content repository | ~40 tables | jcr_user |
| **quartz** | Job scheduler | ~12 tables | pentaho_user |
| **hibernate** | User/role management | ~20 tables | hibuser |
| **pentaho_logging** | Application logs | ~5 tables | pentaho_user |
| **pentaho_mart** | Data warehouse | ~10 tables | pentaho_user |

### Important Notes

⚠️ **Initialization Only Runs Once**:
- Scripts execute only if database is empty
- Subsequent restarts skip initialization
- To re-initialize: delete PVC and recreate

```bash
# Force re-initialization
kubectl delete pvc postgres-data-pvc -n pentaho
helm upgrade pentaho ./pentaho --install
```

### Troubleshooting

```bash
# Check if initialization completed
kubectl logs deployment/postgres -n pentaho | grep "database system is ready"

# View init script errors
kubectl logs deployment/postgres -n pentaho | grep ERROR

# View ConfigMap contents
kubectl get configmap postgres-init-scripts -n pentaho -o yaml

# Check if databases were created
kubectl exec -it deployment/postgres -n pentaho -- psql -U postgres -c "\l"
```

---

## postgres-service.yaml

**Purpose**: Exposes PostgreSQL port 5432 as a stable DNS endpoint for Pentaho to connect to.

### Why Services Matter

Without Services:
- ❌ Pods have ephemeral IPs (change on restart)
- ❌ Can't load balance across replicas
- ❌ No service discovery

With Services:
- ✅ Stable DNS name: `postgres.pentaho.svc.cluster.local`
- ✅ Load balancing across pods
- ✅ Service discovery via DNS or environment variables

### Detailed Breakdown

```yaml
{{- if .Values.postgresql.enabled }}
apiVersion: v1
kind: Service

metadata:
  # Service name becomes DNS hostname
  # Pentaho connects to: postgres:5432
  # Full DNS: postgres.pentaho.svc.cluster.local
  name: {{ .Values.database.host }}  # Default: postgres

  namespace: {{ include "pentaho.namespace" . }}
  labels:
    {{- include "pentaho.postgresql.labels" . | nindent 4 }}
    app.kubernetes.io/component: database

spec:
  # Service type: ClusterIP (internal only)
  # Other types: NodePort (exposes on node), LoadBalancer (cloud LB)
  type: {{ .Values.postgresql.service.type }}  # Default: ClusterIP

  ports:
    # port: Service port (what clients connect to)
    - port: {{ .Values.postgresql.service.port }}  # 5432

      # targetPort: Pod port (where PostgreSQL listens)
      targetPort: {{ .Values.postgresql.service.targetPort }}  # 5432

      # protocol: TCP (PostgreSQL uses TCP)
      protocol: TCP

      # name: Port name (referenced by network policies)
      name: postgres

  # selector: Routes traffic to pods with matching labels
  # Must match postgres deployment's spec.template.metadata.labels
  selector:
    {{- include "pentaho.postgresql.selectorLabels" . | nindent 4 }}
    # Typically:
    #   app.kubernetes.io/name: pentaho
    #   app.kubernetes.io/instance: pentaho
    #   app.kubernetes.io/component: postgresql
{{- end }}
```

### How Service Discovery Works

**Option 1: DNS (Recommended)**

```bash
# Short name (same namespace)
psql -h postgres -U postgres

# Fully qualified domain name (FQDN)
psql -h postgres.pentaho.svc.cluster.local -U postgres
```

**Option 2: Environment Variables**

Kubernetes auto-injects:
```bash
POSTGRES_SERVICE_HOST=10.43.123.45
POSTGRES_SERVICE_PORT=5432
```

**Option 3: Service Endpoint**

```bash
# Get service ClusterIP
kubectl get svc postgres -n pentaho
# NAME       TYPE        CLUSTER-IP     PORT(S)
# postgres   ClusterIP   10.43.123.45   5432/TCP
```

### Service Types Comparison

| Type | Accessibility | Use Case | Example |
|------|---------------|----------|---------|
| **ClusterIP** | Internal only | Database, cache | PostgreSQL, Redis |
| **NodePort** | External via node IP:port | Testing, small deployments | http://nodeip:30080 |
| **LoadBalancer** | External via cloud LB | Production web apps | AWS ELB, GCP LB |
| **ExternalName** | DNS alias | External databases | RDS, Cloud SQL |

### Configuration Options

| Value | Default | Description |
|-------|---------|-------------|
| `postgresql.service.type` | `ClusterIP` | Service type |
| `postgresql.service.port` | `5432` | Service port |
| `postgresql.service.targetPort` | `5432` | Container port |
| `database.host` | `postgres` | Service name (DNS) |

### Usage Examples

```bash
# Get service details
kubectl get svc postgres -n pentaho

# Describe service (shows endpoints)
kubectl describe svc postgres -n pentaho

# Test connection from another pod
kubectl run -it --rm debug --image=postgres:15 --restart=Never -- \
  psql -h postgres.pentaho.svc.cluster.local -U postgres

# Port-forward to localhost (for local testing)
kubectl port-forward svc/postgres 5432:5432 -n pentaho
# Connect: psql -h localhost -U postgres
```

---

## postgres-deployment.yaml

**Purpose**: Deploys PostgreSQL 15 database server with automatic initialization and persistent storage.

### Deployment Architecture

```
Deployment
  └─ ReplicaSet
      └─ Pod
          ├─ Container: postgres:15
          ├─ Volume: postgres-data (PVC)
          └─ Volume: postgres-init (ConfigMap)
```

### Detailed Breakdown

```yaml
{{- if .Values.postgresql.enabled }}
apiVersion: apps/v1
kind: Deployment

metadata:
  name: postgres
  namespace: {{ include "pentaho.namespace" . }}
  labels:
    {{- include "pentaho.postgresql.labels" . | nindent 4 }}
    app.kubernetes.io/component: database

spec:
  # === Replica Configuration ===
  # replicas: Number of pod copies (default: 1)
  # PostgreSQL does NOT support multi-master replication
  # Use PostgreSQL HA solutions (Patroni, Stolon) for multiple replicas
  replicas: {{ .Values.postgresql.replicas }}  # Default: 1

  # === Update Strategy ===
  # Recreate: Stops old pod before starting new (downtime)
  # RollingUpdate: Starts new before stopping old (no downtime)
  # Use Recreate for stateful apps with ReadWriteOnce volumes
  strategy:
    type: {{ .Values.postgresql.strategy.type }}  # Default: Recreate

  # === Pod Selector ===
  # Matches pods managed by this deployment
  selector:
    matchLabels:
      {{- include "pentaho.postgresql.selectorLabels" . | nindent 6 }}

  # === Pod Template ===
  template:
    metadata:
      labels:
        {{- include "pentaho.postgresql.selectorLabels" . | nindent 8 }}

    spec:
      containers:
        - name: postgres

          # === Image Configuration ===
          # Format: repository:tag
          image: "{{ .Values.postgresql.image.repository }}:{{ .Values.postgresql.image.tag }}"
          # Default: postgres:15

          # imagePullPolicy determines when to pull image:
          # - Always: Pull every time (slow, ensures latest)
          # - IfNotPresent: Pull if not cached (default, recommended)
          # - Never: Never pull (requires manual download)
          imagePullPolicy: {{ .Values.postgresql.image.pullPolicy }}

          # === Networking ===
          ports:
            - containerPort: {{ .Values.postgresql.service.targetPort }}  # 5432
              name: postgres    # Port name (for service, network policies)

          # === Environment Variables ===
          env:
            # PostgreSQL superuser password (from Secret)
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: {{ include "pentaho.secretName" . }}
                  key: postgres-password

            # PGDATA: PostgreSQL data directory
            # Must be subdirectory of mount to avoid lost+found conflicts
            - name: PGDATA
              value: {{ .Values.postgresql.persistence.pgdata }}
              # Default: /var/lib/postgresql/data/pgdata

            # TZ: Timezone for logs and timestamps
            - name: TZ
              value: {{ .Values.global.timezone | quote }}

          # === Volume Mounts ===
          volumeMounts:
            {{- if .Values.postgresql.persistence.enabled }}
            # Mount PVC for persistent storage
            - name: postgres-data
              mountPath: {{ .Values.postgresql.persistence.dataPath }}
              # Default: /var/lib/postgresql/data
            {{- end }}

            {{- if .Values.postgresql.initScripts.enabled }}
            # Mount ConfigMap with SQL init scripts
            - name: postgres-init
              mountPath: {{ .Values.postgresql.initScripts.mountPath }}
              # Default: /docker-entrypoint-initdb.d
            {{- end }}

          # === Resource Limits ===
          # Prevents runaway processes from consuming all node resources
          resources:
            requests:
              memory: "512Mi"   # Guaranteed memory
              cpu: "500m"       # Guaranteed CPU (0.5 cores)
            limits:
              memory: "2Gi"     # Maximum memory (OOMKilled if exceeded)
              cpu: "2"          # Maximum CPU (throttled if exceeded)

          # === Health Probes ===
          # Liveness: Is container healthy? (restart if fails)
          {{- if .Values.postgresql.probes.liveness.enabled }}
          livenessProbe:
            exec:
              command:
                - pg_isready      # PostgreSQL utility: checks if DB accepts connections
                - -U              # Username
                - postgres        # Superuser
            initialDelaySeconds: {{ .Values.postgresql.probes.liveness.initialDelaySeconds }}  # 30s
            periodSeconds: {{ .Values.postgresql.probes.liveness.periodSeconds }}  # 10s
            timeoutSeconds: {{ .Values.postgresql.probes.liveness.timeoutSeconds }}  # 5s
            failureThreshold: {{ .Values.postgresql.probes.liveness.failureThreshold }}  # 3 failures = restart
          {{- end }}

          # Readiness: Is container ready to serve traffic? (remove from service if fails)
          {{- if .Values.postgresql.probes.readiness.enabled }}
          readinessProbe:
            exec:
              command:
                - pg_isready
                - -U
                - postgres
            initialDelaySeconds: {{ .Values.postgresql.probes.readiness.initialDelaySeconds }}  # 5s
            periodSeconds: {{ .Values.postgresql.probes.readiness.periodSeconds }}  # 5s
            timeoutSeconds: {{ .Values.postgresql.probes.readiness.timeoutSeconds }}  # 3s
            failureThreshold: {{ .Values.postgresql.probes.readiness.failureThreshold }}  # 3
          {{- end }}

      # === Volumes ===
      volumes:
        {{- if .Values.postgresql.persistence.enabled }}
        # Volume backed by PersistentVolumeClaim
        - name: postgres-data
          persistentVolumeClaim:
            claimName: postgres-data-pvc
        {{- end }}

        {{- if .Values.postgresql.initScripts.enabled }}
        # Volume backed by ConfigMap
        - name: postgres-init
          configMap:
            name: postgres-init-scripts
        {{- end }}

      # === Advanced Scheduling ===
      # Node selector: Schedule on nodes with specific labels
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
        # Example: kubernetes.io/hostname: node1
      {{- end }}

      # Affinity: Advanced pod placement rules
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
        # Example: Prefer nodes in zone us-east-1a
      {{- end }}

      # Tolerations: Allow scheduling on tainted nodes
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
        # Example: Tolerate NoSchedule taint
      {{- end }}
{{- end }}
```

### Probe Timing Explained

```
Pod Start → [Startup Probe] → [Readiness Probe] → [Liveness Probe]
              ↓                 ↓                   ↓
              Wait 30s          Check every 5s      Check every 10s
              Max 3 fails       Fail = Remove       Fail = Restart
```

### Resource Sizing Guide

| Workload | Memory Request | Memory Limit | CPU Request | CPU Limit |
|----------|----------------|--------------|-------------|-----------|
| Dev/Test | 256Mi | 1Gi | 250m | 1 |
| Small | 512Mi | 2Gi | 500m | 2 |
| **Default** | **512Mi** | **2Gi** | **500m** | **2** |
| Medium | 1Gi | 4Gi | 1 | 4 |
| Large | 2Gi | 8Gi | 2 | 8 |

### Configuration Options

| Value | Default | Description |
|-------|---------|-------------|
| `postgresql.replicas` | `1` | Number of pods |
| `postgresql.image.tag` | `15` | PostgreSQL version |
| `postgresql.resources.limits.memory` | `2Gi` | Max memory |
| `postgresql.probes.liveness.enabled` | `true` | Enable liveness probe |

### Usage Examples

```bash
# View deployment status
kubectl get deployment postgres -n pentaho

# View pod details
kubectl get pods -l app.kubernetes.io/component=postgresql -n pentaho

# View logs
kubectl logs deployment/postgres -n pentaho

# Execute SQL command
kubectl exec -it deployment/postgres -n pentaho -- psql -U postgres -c "SELECT version();"

# Restart deployment
kubectl rollout restart deployment postgres -n pentaho

# Scale replicas (NOT recommended for PostgreSQL)
kubectl scale deployment postgres --replicas=2 -n pentaho
```

---

## pentaho-service.yaml

**Purpose**: Exposes Pentaho Server ports 8080 (HTTP) and 8443 (HTTPS) for ingress and internal access.

### Service Architecture

```
Ingress (pentaho.local)
    ↓
pentaho-server Service (ClusterIP)
    ↓
pentaho-server Pod(s)
```

### Detailed Breakdown

```yaml
{{- if .Values.pentaho.enabled }}
apiVersion: v1
kind: Service

metadata:
  # Service name becomes DNS hostname
  # Internal clients connect to: pentaho-server:8080
  # Full DNS: pentaho-server.pentaho.svc.cluster.local
  name: pentaho-server

  namespace: {{ include "pentaho.namespace" . }}
  labels:
    {{- include "pentaho.labels" . | nindent 4 }}
    app.kubernetes.io/component: server

spec:
  # ClusterIP: Internal only (most common for web apps with ingress)
  type: {{ .Values.pentaho.service.type }}  # Default: ClusterIP

  ports:
    # === HTTP Port (8080) ===
    - port: {{ .Values.pentaho.service.http.port }}  # Service port: 8080
      targetPort: {{ .Values.pentaho.service.http.targetPort }}  # Pod port: 8080
      protocol: TCP
      name: http              # Used by ingress to route traffic

    # === HTTPS Port (8443) ===
    - port: {{ .Values.pentaho.service.https.port }}  # Service port: 8443
      targetPort: {{ .Values.pentaho.service.https.targetPort }}  # Pod port: 8443
      protocol: TCP
      name: https             # Optional HTTPS endpoint

  # === Pod Selector ===
  # Routes traffic to pods with matching labels
  selector:
    {{- include "pentaho.selectorLabels" . | nindent 4 }}
    # Example:
    #   app.kubernetes.io/name: pentaho
    #   app.kubernetes.io/instance: pentaho
{{- end }}
```

### How Ingress Uses This Service

Ingress routes external traffic to this service:

```yaml
# ingress.yaml
backend:
  service:
    name: pentaho-server    # Service name
    port:
      number: 8080           # Service port (not container port)
```

Traffic flow:
```
Browser (pentaho.local)
  ↓
Ingress Controller (Traefik)
  ↓
pentaho-server Service (8080)
  ↓
pentaho-server Pod (8080)
```

### Multiple Ports Explained

Why expose both 8080 and 8443?

1. **Port 8080 (HTTP)**:
   - Default Pentaho port
   - Used by ingress controller
   - TLS termination at ingress level

2. **Port 8443 (HTTPS)**:
   - Optional direct HTTPS access
   - TLS termination at Pentaho level
   - Useful for internal HTTPS (without ingress)

### Configuration Options

| Value | Default | Description |
|-------|---------|-------------|
| `pentaho.service.type` | `ClusterIP` | Service type |
| `pentaho.service.http.port` | `8080` | HTTP service port |
| `pentaho.service.https.port` | `8443` | HTTPS service port |

### Usage Examples

```bash
# Get service details
kubectl get svc pentaho-server -n pentaho

# Describe service (shows endpoints)
kubectl describe svc pentaho-server -n pentaho

# Port-forward to localhost
kubectl port-forward svc/pentaho-server 8080:8080 -n pentaho
# Access: http://localhost:8080/pentaho

# Test connection from another pod
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl -v http://pentaho-server:8080/pentaho/Login
```

---

## pentaho-deployment.yaml

**Purpose**: Deploys Pentaho Business Analytics Server with init container, health probes, and resource limits.

### Deployment Architecture

```
Deployment
  └─ ReplicaSet
      └─ Pod
          ├─ Init Container: wait-for-postgres (busybox)
          └─ Container: pentaho-server
              ├─ ConfigMap: pentaho-config (env vars)
              ├─ Secret: postgres-secrets (passwords)
              ├─ Volume: pentaho-data (optional PVC)
              └─ Volume: pentaho-solutions (optional PVC)
```

### Detailed Breakdown

```yaml
{{- if .Values.pentaho.enabled }}
apiVersion: apps/v1
kind: Deployment

metadata:
  name: pentaho-server
  namespace: {{ include "pentaho.namespace" . }}
  labels:
    {{- include "pentaho.labels" . | nindent 4 }}
    app.kubernetes.io/component: server

spec:
  # === Replica Configuration ===
  replicas: {{ .Values.pentaho.replicas }}  # Default: 1
  # Note: Scaling >1 requires session affinity (sticky sessions)

  # === Update Strategy ===
  # Recreate: Stop old pod before starting new (required for ReadWriteOnce PVCs)
  # RollingUpdate: Start new before stopping old (requires ReadWriteMany PVCs)
  strategy:
    type: {{ .Values.pentaho.strategy.type }}  # Default: Recreate

  selector:
    matchLabels:
      {{- include "pentaho.selectorLabels" . | nindent 6 }}

  template:
    metadata:
      labels:
        {{- include "pentaho.selectorLabels" . | nindent 8 }}

    spec:
      # === Hostname ===
      # Sets pod hostname (required for Pentaho initialization)
      hostname: {{ .Values.pentaho.hostname }}  # Default: pentaho-server

      # === Init Containers ===
      # Run before main container starts
      {{- if .Values.pentaho.initContainer.enabled }}
      initContainers:
        - name: wait-for-postgres
          image: "{{ .Values.pentaho.initContainer.image.repository }}:{{ .Values.pentaho.initContainer.image.tag }}"
          # Default: busybox:1.36

          command:
            - sh
            - -c
            - |
              # Shell script to wait for PostgreSQL
              echo "Waiting for PostgreSQL to be ready..."

              # Loop until PostgreSQL accepts connections
              # nc -z: Check if port is open (no data transfer)
              until nc -z {{ include "pentaho.postgresql.host" . }} {{ include "pentaho.postgresql.port" . }}; do
                echo "PostgreSQL is not ready - sleeping"
                sleep 2
              done

              echo "PostgreSQL is ready!"

          resources:
            # Init container resources (minimal)
            {{- toYaml .Values.pentaho.initContainer.resources | nindent 12 }}
      {{- end }}

      # === Main Container ===
      containers:
        - name: pentaho-server

          # === Image Configuration ===
          image: "{{ .Values.pentaho.image.repository }}:{{ .Values.pentaho.image.tag }}"
          # Default: pentaho/pentaho-server:11.0.0.0-237

          imagePullPolicy: {{ .Values.pentaho.image.pullPolicy }}

          # === Networking ===
          ports:
            - containerPort: {{ .Values.pentaho.service.http.targetPort }}  # 8080
              name: http
            - containerPort: {{ .Values.pentaho.service.https.targetPort }}  # 8443
              name: https

          # === Environment Variables ===
          # Option 1: Load ALL env vars from ConfigMap
          envFrom:
            - configMapRef:
                name: pentaho-config
                # Injects: PENTAHO_MIN_MEMORY, PENTAHO_MAX_MEMORY, DB_HOST, etc.

          # Option 2: Load specific env vars from Secret
          env:
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: {{ include "pentaho.secretName" . }}
                  key: postgres-password

          # === Volume Mounts ===
          # Only if persistence is enabled
          {{- if or .Values.pentaho.persistence.data.enabled .Values.pentaho.persistence.solutions.enabled }}
          volumeMounts:
            {{- if .Values.pentaho.persistence.data.enabled }}
            - name: pentaho-data
              mountPath: {{ .Values.pentaho.persistence.data.mountPath }}
              # Default: /opt/pentaho/pentaho-server/data
            {{- end }}

            {{- if .Values.pentaho.persistence.solutions.enabled }}
            - name: pentaho-solutions
              mountPath: {{ .Values.pentaho.persistence.solutions.mountPath }}
              # Default: /opt/pentaho/pentaho-server/pentaho-solutions
            {{- end }}
          {{- end }}

          # === Resource Limits ===
          resources:
            requests:
              memory: "2Gi"     # Guaranteed memory
              cpu: "1"          # Guaranteed CPU (1 core)
            limits:
              memory: "6Gi"     # Max memory (OOMKilled if exceeded)
              cpu: "4"          # Max CPU (throttled if exceeded)

          # === Health Probes ===
          # Startup: Is application starting? (gives extra time for slow starts)
          {{- if .Values.pentaho.probes.startup.enabled }}
          startupProbe:
            httpGet:
              path: {{ .Values.pentaho.probes.startup.path }}  # /pentaho/Login
              port: {{ .Values.pentaho.service.http.targetPort }}  # 8080
            initialDelaySeconds: {{ .Values.pentaho.probes.startup.initialDelaySeconds }}  # 60s
            periodSeconds: {{ .Values.pentaho.probes.startup.periodSeconds }}  # 10s
            timeoutSeconds: {{ .Values.pentaho.probes.startup.timeoutSeconds }}  # 5s
            failureThreshold: {{ .Values.pentaho.probes.startup.failureThreshold }}  # 30 (5 min total)
          {{- end }}

          # Liveness: Is application healthy? (restart if fails)
          {{- if .Values.pentaho.probes.liveness.enabled }}
          livenessProbe:
            httpGet:
              path: {{ .Values.pentaho.probes.liveness.path }}  # /pentaho/Login
              port: {{ .Values.pentaho.service.http.targetPort }}  # 8080
            initialDelaySeconds: {{ .Values.pentaho.probes.liveness.initialDelaySeconds }}  # 300s (5 min)
            periodSeconds: {{ .Values.pentaho.probes.liveness.periodSeconds }}  # 30s
            timeoutSeconds: {{ .Values.pentaho.probes.liveness.timeoutSeconds }}  # 10s
            failureThreshold: {{ .Values.pentaho.probes.liveness.failureThreshold }}  # 5
          {{- end }}

          # Readiness: Is application ready for traffic? (remove from service if fails)
          {{- if .Values.pentaho.probes.readiness.enabled }}
          readinessProbe:
            httpGet:
              path: {{ .Values.pentaho.probes.readiness.path }}  # /pentaho/Login
              port: {{ .Values.pentaho.service.http.targetPort }}  # 8080
            initialDelaySeconds: {{ .Values.pentaho.probes.readiness.initialDelaySeconds }}  # 120s (2 min)
            periodSeconds: {{ .Values.pentaho.probes.readiness.periodSeconds }}  # 10s
            timeoutSeconds: {{ .Values.pentaho.probes.readiness.timeoutSeconds }}  # 5s
            failureThreshold: {{ .Values.pentaho.probes.readiness.failureThreshold }}  # 10
          {{- end }}

      # === Volumes ===
      {{- if or .Values.pentaho.persistence.data.enabled .Values.pentaho.persistence.solutions.enabled }}
      volumes:
        {{- if .Values.pentaho.persistence.data.enabled }}
        - name: pentaho-data
          persistentVolumeClaim:
            claimName: pentaho-data-pvc
        {{- end }}

        {{- if .Values.pentaho.persistence.solutions.enabled }}
        - name: pentaho-solutions
          persistentVolumeClaim:
            claimName: pentaho-solutions-pvc
        {{- end }}
      {{- end }}

      # === Image Pull Secrets ===
      # For private Docker registries
      {{- with .Values.pentaho.image.pullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}

      # === Advanced Scheduling ===
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}

      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}

      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
{{- end }}
```

### Probe Timing Explained

Pentaho is a **slow-starting application** (JVM, Tomcat, database connections):

```
Pod Start (t=0)
  ↓
Init Container: wait-for-postgres (0-60s)
  ↓
Main Container: pentaho-server starts
  ↓
Startup Probe (t=60s, check every 10s, max 30 failures = 5 min)
  SUCCESS → Pod marked as "Started"
  ↓
Readiness Probe (t=120s, check every 10s)
  SUCCESS → Pod added to service (receives traffic)
  ↓
Liveness Probe (t=300s, check every 30s)
  FAILURE (5 consecutive) → Pod restarted
```

### Resource Sizing Guide

| Workload | Memory Request | Memory Limit | CPU Request | CPU Limit | JVM Max |
|----------|----------------|--------------|-------------|-----------|---------|
| Dev/Test | 1Gi | 3Gi | 500m | 2 | 2048m |
| Small | 2Gi | 4Gi | 1 | 2 | 3072m |
| **Default** | **2Gi** | **6Gi** | **1** | **4** | **4096m** |
| Medium | 4Gi | 8Gi | 2 | 6 | 6144m |
| Large | 6Gi | 12Gi | 4 | 8 | 9216m |

**Remember**: JVM Max ≤ 75% of Memory Limit

### Configuration Options

| Value | Default | Description |
|-------|---------|-------------|
| `pentaho.replicas` | `1` | Number of pods |
| `pentaho.image.tag` | `11.0.0.0-237` | Pentaho version |
| `pentaho.resources.limits.memory` | `6Gi` | Max memory |
| `pentaho.probes.startup.failureThreshold` | `30` | Startup timeout (5 min) |

### Usage Examples

```bash
# View deployment status
kubectl get deployment pentaho-server -n pentaho

# View pod details
kubectl get pods -l app.kubernetes.io/component=server -n pentaho

# View logs (main container)
kubectl logs deployment/pentaho-server -n pentaho

# View init container logs
kubectl logs deployment/pentaho-server -c wait-for-postgres -n pentaho

# Describe pod (shows probe status)
kubectl describe pod -l app.kubernetes.io/component=server -n pentaho

# Restart deployment
kubectl rollout restart deployment pentaho-server -n pentaho

# Scale replicas (requires session affinity)
kubectl scale deployment pentaho-server --replicas=2 -n pentaho
```

---

## ingress.yaml

**Purpose**: Routes external HTTP/HTTPS traffic to Pentaho Server via Traefik ingress controller.

### Ingress Architecture

```
Internet
  ↓
DNS: pentaho.local → Node IP
  ↓
Traefik Ingress Controller (Port 80/443)
  ↓
Ingress Rules (path matching)
  ↓
pentaho-server Service (ClusterIP)
  ↓
pentaho-server Pod
```

### Detailed Breakdown

```yaml
{{- if .Values.ingress.enabled }}
apiVersion: {{ include "pentaho.ingress.apiVersion" . }}
# API version depends on Kubernetes version:
# - v1.19+: networking.k8s.io/v1
# - v1.14-1.18: networking.k8s.io/v1beta1

kind: Ingress

metadata:
  name: pentaho-ingress
  namespace: {{ include "pentaho.namespace" . }}
  labels:
    {{- include "pentaho.labels" . | nindent 4 }}
    app.kubernetes.io/component: ingress

  # === Annotations ===
  # Ingress controller-specific configuration
  {{- with .Values.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
    # Example annotations:
    # traefik.ingress.kubernetes.io/router.entrypoints: web,websecure
    # traefik.ingress.kubernetes.io/buffering: "true"
    # cert-manager.io/cluster-issuer: letsencrypt-prod
  {{- end }}

spec:
  # === Ingress Class ===
  # Selects which ingress controller handles this ingress
  # Options: traefik, nginx, haproxy, istio
  {{- if .Values.ingress.className }}
  ingressClassName: {{ .Values.ingress.className }}  # Default: traefik
  {{- end }}

  # === TLS Configuration ===
  # Enables HTTPS with SSL/TLS certificates
  {{- if .Values.ingress.tls.enabled }}
  tls:
    - hosts:
        {{- range .Values.ingress.tls.hosts }}
        - {{ . | quote }}
        # Example: pentaho.local, pentaho.example.com
        {{- end }}

      # Secret containing TLS certificate and private key
      # Create with: kubectl create secret tls pentaho-tls-secret \
      #   --cert=tls.crt --key=tls.key -n pentaho
      secretName: {{ .Values.ingress.tls.secretName }}
  {{- end }}

  # === Routing Rules ===
  rules:
    {{- range .Values.ingress.rules }}
    - {{- if .host }}
      # Host-based routing (virtual hosts)
      # Example: pentaho.local, pentaho.example.com
      host: {{ .host | quote }}
      {{- end }}

      http:
        paths:
          {{- range .paths }}
          - # Path to match (example: /pentaho, /)
            path: {{ .path }}

            # Path matching type:
            # - Prefix: Match path prefix (/pentaho matches /pentaho/*)
            # - Exact: Match exact path (/pentaho only)
            # - ImplementationSpecific: Controller-specific logic
            pathType: {{ .pathType }}  # Default: Prefix

            # Backend service to route traffic to
            backend:
              service:
                name: pentaho-server         # Service name
                port:
                  number: {{ $.Values.pentaho.service.http.port }}  # 8080
          {{- end }}
    {{- end }}
{{- end }}
```

### Routing Rules Explained

The default configuration creates **two rules**:

#### Rule 1: Host-based routing
```yaml
- host: pentaho.local
  paths:
    - path: /
      pathType: Prefix
```
Matches: `http://pentaho.local` and `http://pentaho.local/*`

#### Rule 2: Path-based routing (no host)
```yaml
- paths:
    - path: /pentaho
      pathType: Prefix
```
Matches: `http://<any-host>/pentaho` and `http://<any-host>/pentaho/*`

### Traffic Flow Examples

| Request URL | Matched Rule | Routed To |
|-------------|--------------|-----------|
| `http://pentaho.local/` | Rule 1 (host + /) | pentaho-server:8080 |
| `http://pentaho.local/pentaho/Login` | Rule 1 (host + /) | pentaho-server:8080/pentaho/Login |
| `http://192.168.1.100/pentaho` | Rule 2 (path) | pentaho-server:8080/pentaho |
| `http://example.com/pentaho/api` | Rule 2 (path) | pentaho-server:8080/pentaho/api |
| `http://example.com/app` | ❌ No match | 404 Not Found |

### Path Types Comparison

| Path Type | Path: `/pentaho` Matches | Use Case |
|-----------|---------------------------|----------|
| **Prefix** | `/pentaho`, `/pentaho/`, `/pentaho/Login` | Web applications (recommended) |
| **Exact** | `/pentaho` only (not `/pentaho/`) | API endpoints, specific routes |
| **ImplementationSpecific** | Controller-dependent | Advanced routing |

### TLS/HTTPS Configuration

**Option 1: Manual TLS Secret**

```bash
# Create TLS certificate (self-signed for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt \
  -subj "/CN=pentaho.local"

# Create Kubernetes secret
kubectl create secret tls pentaho-tls-secret \
  --cert=tls.crt --key=tls.key -n pentaho

# Enable TLS in values.yaml
ingress:
  tls:
    enabled: true
    secretName: pentaho-tls-secret
    hosts:
      - pentaho.local
```

**Option 2: Cert-Manager (Automatic TLS)**

```yaml
# values.yaml
ingress:
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  tls:
    enabled: true
    secretName: pentaho-tls-secret  # Auto-created by cert-manager
    hosts:
      - pentaho.example.com
```

### Traefik-Specific Annotations

| Annotation | Purpose | Example |
|------------|---------|---------|
| `traefik.ingress.kubernetes.io/router.entrypoints` | Entry points (ports) | `web,websecure` (80,443) |
| `traefik.ingress.kubernetes.io/buffering` | Enable buffering | `"true"` |
| `traefik.ingress.kubernetes.io/router.middlewares` | Apply middlewares | `pentaho-redirect-https@kubernetescrd` |
| `traefik.ingress.kubernetes.io/service.sticky.cookie` | Session affinity | `"true"` (sticky sessions) |

### Configuration Options

| Value | Default | Description |
|-------|---------|-------------|
| `ingress.enabled` | `true` | Enable ingress |
| `ingress.className` | `traefik` | Ingress controller |
| `ingress.tls.enabled` | `false` | Enable HTTPS |
| `ingress.rules[0].host` | `pentaho.local` | Hostname |
| `ingress.rules[0].paths[0].path` | `/` | URL path |

### Usage Examples

```bash
# Get ingress details
kubectl get ingress pentaho-ingress -n pentaho

# Describe ingress (shows backends, rules)
kubectl describe ingress pentaho-ingress -n pentaho

# Test HTTP access
curl -H "Host: pentaho.local" http://<node-ip>/pentaho/Login

# Test HTTPS access (if TLS enabled)
curl -k https://pentaho.local/pentaho/Login

# Add host entry for local testing
echo "192.168.1.100 pentaho.local" | sudo tee -a /etc/hosts

# View Traefik dashboard (if enabled)
kubectl port-forward -n kube-system deployment/traefik 9000:9000
# Access: http://localhost:9000/dashboard/
```

---

## Summary Table

| Template | Purpose | Critical | Default State |
|----------|---------|----------|---------------|
| **namespace.yaml** | Namespace isolation | ✅ Yes | Enabled |
| **secret.yaml** | Database credentials | ✅ Yes | Enabled |
| **pvc.yaml** | Persistent storage | ✅ Yes (PostgreSQL) | PostgreSQL: ✅<br>Pentaho: ❌ |
| **configmap-pentaho.yaml** | Pentaho config | ✅ Yes | Enabled |
| **configmap-postgres-init.yaml** | Database initialization | ✅ Yes | Enabled |
| **postgres-service.yaml** | PostgreSQL service discovery | ✅ Yes | Enabled |
| **postgres-deployment.yaml** | PostgreSQL database | ✅ Yes | Enabled |
| **pentaho-service.yaml** | Pentaho service discovery | ✅ Yes | Enabled |
| **pentaho-deployment.yaml** | Pentaho application | ✅ Yes | Enabled |
| **ingress.yaml** | External access routing | ✅ Yes | Enabled |

---

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Traefik Ingress Documentation](https://doc.traefik.io/traefik/providers/kubernetes-ingress/)
- [K3s Documentation](https://docs.k3s.io/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Pentaho Documentation](https://help.hitachivantara.com/Documentation/Pentaho)

---

**Last Updated**: 2026-02-16
**Chart Version**: 1.0.0
**Pentaho Version**: 11.0.0.0-237
