# Pentaho Helm Chart Installation Guide

## Quick Installation

### 1. Verify Prerequisites

```bash
# Check Helm version (requires 3.0+)
helm version

# Check Kubernetes cluster
kubectl cluster-info
kubectl get nodes

# Check available storage classes
kubectl get storageclass
```

### 2. Ensure Pentaho Image is Available

If using a local K3s cluster, import the Pentaho image:

```bash
# Build the image (if not already built)
cd ../docker-build
./build.sh

# Import to K3s
sudo k3s ctr images import pentaho-server-11.0.0.0-237.tar

# Verify
sudo k3s ctr images ls | grep pentaho
```

### 3. Install the Chart

**Default installation:**

```bash
cd /home/pentaho/Pentaho-K3s-PostgreSQL/helm-chart
helm install pentaho ./pentaho
```

**Install in specific namespace:**

```bash
helm install pentaho ./pentaho --namespace pentaho --create-namespace
```

**Install with custom values:**

```bash
helm install pentaho ./pentaho -f custom-values.yaml
```

**Install with command-line overrides:**

```bash
helm install pentaho ./pentaho \
  --set pentaho.resources.limits.memory=8Gi \
  --set pentaho.jvm.maxMemory=6144m \
  --set database.auth.postgresPassword=SecurePassword123
```

### 4. Monitor Installation

```bash
# Watch pod status
kubectl get pods -n pentaho -w

# Check all resources
kubectl get all -n pentaho

# View Pentaho logs
kubectl logs -f deployment/pentaho-server -n pentaho
```

### 5. Access Pentaho

**Via port-forward (recommended for testing):**

```bash
kubectl port-forward -n pentaho svc/pentaho-server 8080:8080
```

Then open: http://localhost:8080/pentaho

**Via Ingress:**

Add to `/etc/hosts`:
```bash
echo "$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}') pentaho.local" | sudo tee -a /etc/hosts
```

Then access: http://pentaho.local/pentaho

**Default credentials:**
- Username: `admin`
- Password: `password`

## Installation Examples

### Development Environment

```bash
helm install pentaho ./pentaho \
  --set pentaho.resources.requests.memory=2Gi \
  --set pentaho.resources.limits.memory=4Gi \
  --set pentaho.jvm.maxMemory=2048m
```

### Production Environment

Create `production-values.yaml`:

```yaml
global:
  timezone: "America/New_York"
  storageClass: longhorn

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
      size: 50Gi
    solutions:
      enabled: true
      size: 20Gi

postgresql:
  persistence:
    size: 50Gi

ingress:
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

database:
  auth:
    postgresPassword: "ChangeMe123!"
    jcrPassword: "ChangeMe123!"
    quartzPassword: "ChangeMe123!"
    hibernatePassword: "ChangeMe123!"
```

Install:

```bash
helm install pentaho ./pentaho -f production-values.yaml
```

## Verification

### Check Deployment Status

```bash
# All pods should be Running
kubectl get pods -n pentaho

# Expected output:
# NAME                              READY   STATUS    RESTARTS   AGE
# pentaho-server-xxxxxxxxxx-xxxxx   1/1     Running   0          5m
# postgres-xxxxxxxxxx-xxxxx         1/1     Running   0          5m
```

### Verify Database Initialization

```bash
# Check PostgreSQL logs for successful initialization
kubectl logs deployment/postgres -n pentaho | grep "PostgreSQL init process complete"

# List databases
kubectl exec deployment/postgres -n pentaho -- psql -U postgres -c "\l"

# Should show: jackrabbit, quartz, hibernate databases
```

### Test Pentaho Access

```bash
# Port forward
kubectl port-forward -n pentaho svc/pentaho-server 8080:8080 &

# Test with curl (should return 200)
curl -I http://localhost:8080/pentaho/Login

# Kill port-forward
kill %1
```

## Upgrading

### Upgrade to New Values

```bash
# Edit values
vim production-values.yaml

# Apply changes
helm upgrade pentaho ./pentaho -f production-values.yaml
```

### Upgrade to New Chart Version

```bash
helm upgrade pentaho ./pentaho --version 1.1.0
```

### View Upgrade Status

```bash
# Check release history
helm history pentaho

# Check rollout status
kubectl rollout status deployment/pentaho-server -n pentaho
```

## Rollback

```bash
# Rollback to previous version
helm rollback pentaho

# Rollback to specific revision
helm rollback pentaho 2

# View history
helm history pentaho
```

## Uninstalling

### Remove Helm Release

```bash
# Uninstall release (keeps PVCs)
helm uninstall pentaho -n pentaho
```

### Complete Cleanup

```bash
# Uninstall release
helm uninstall pentaho -n pentaho

# Delete persistent volumes (WARNING: This deletes all data!)
kubectl delete pvc -n pentaho --all

# Delete namespace
kubectl delete namespace pentaho
```

## Troubleshooting

### Pentaho Pod Not Starting

**Check pod events:**
```bash
kubectl describe pod -l app=pentaho-server -n pentaho
```

**Common issues:**
- Image not found → Import image to cluster
- PostgreSQL not ready → Wait for postgres pod
- Resource limits too low → Increase memory/CPU

### PostgreSQL Connection Errors

**Check PostgreSQL status:**
```bash
kubectl get pods -l app=postgres -n pentaho
kubectl logs deployment/postgres -n pentaho
```

**Test connectivity from Pentaho pod:**
```bash
kubectl exec deployment/pentaho-server -n pentaho -- nc -zv postgres 5432
```

### Login Page Shows 404

**Check webapp deployment:**
```bash
kubectl logs deployment/pentaho-server -n pentaho | grep "Deployment of web application"
```

**Expected:** "Deployment of web application directory [.../pentaho] has finished"

### JCR Repository Errors

**Verify database initialization:**
```bash
# Check jackrabbit database exists
kubectl exec deployment/postgres -n pentaho -- \
  psql -U postgres -c "\l" | grep jackrabbit

# Check JCR tables
kubectl exec deployment/postgres -n pentaho -- \
  psql -U jcr_user -d jackrabbit -c "\dt"
```

### View Helm Chart Values

```bash
# Show computed values
helm get values pentaho -n pentaho

# Show all values (including defaults)
helm get values pentaho -n pentaho --all
```

### Debug Template Rendering

```bash
# Render templates without installing
helm template pentaho ./pentaho

# Render with custom values
helm template pentaho ./pentaho -f production-values.yaml

# Save rendered templates
helm template pentaho ./pentaho > rendered-templates.yaml
```

## Advanced Configuration

### Using External PostgreSQL

```yaml
postgresql:
  enabled: false

database:
  host: external-postgres.company.com
  port: 5432
  auth:
    postgresPassword: "external-password"
```

### Custom Storage Class

```yaml
global:
  storageClass: nfs-client

postgresql:
  persistence:
    size: 100Gi

pentaho:
  persistence:
    data:
      enabled: true
      size: 100Gi
    solutions:
      enabled: true
      size: 50Gi
```

### TLS/HTTPS Configuration

**1. Create TLS secret:**

```bash
# Using cert-manager (recommended)
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: pentaho-tls-cert
  namespace: pentaho
spec:
  secretName: pentaho-tls-cert
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - pentaho.company.com
EOF
```

**2. Enable TLS in values:**

```yaml
ingress:
  tls:
    enabled: true
    secretName: pentaho-tls-cert
    hosts:
      - pentaho.company.com
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
```

## Backup and Restore

### Backup PostgreSQL

```bash
# Create backup
kubectl exec deployment/postgres -n pentaho -- \
  pg_dumpall -U postgres > pentaho-backup-$(date +%Y%m%d-%H%M%S).sql
```

### Restore PostgreSQL

```bash
# Restore from backup
kubectl exec -i deployment/postgres -n pentaho -- \
  psql -U postgres < pentaho-backup-20260216-120000.sql
```

### Backup Persistent Volumes

```bash
# Find PVC details
kubectl get pvc -n pentaho

# Create volume snapshot (if supported by storage class)
kubectl apply -f - <<EOF
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: postgres-snapshot
  namespace: pentaho
spec:
  volumeSnapshotClassName: default-snapshot-class
  source:
    persistentVolumeClaimName: postgres-data-pvc
EOF
```

## Support

For issues and questions:
- Helm Chart Documentation: [pentaho/README.md](pentaho/README.md)
- Project GitHub: https://github.com/yourusername/Pentaho-K3s-PostgreSQL
- Pentaho Documentation: https://docs.hitachivantara.com/

## Next Steps

After successful installation:

1. Change default passwords
2. Configure authentication (LDAP/AD)
3. Set up automated backups
4. Configure monitoring and alerting
5. Tune resource limits based on workload
6. Enable TLS/HTTPS for production
7. Test disaster recovery procedures
