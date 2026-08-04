# Pentaho Helm Chart

A Helm chart for deploying Pentaho Business Analytics Platform with PostgreSQL on Kubernetes.

## Overview

This Helm chart deploys:
- **Pentaho Server 11.0.0.0-237** - Business Intelligence and Analytics Platform
- **PostgreSQL 15** - Database backend for Pentaho repositories
- **Ingress** - HTTP/HTTPS routing via Traefik
- **Persistent Storage** - Data persistence using PersistentVolumeClaims

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- K3s cluster (or any Kubernetes cluster)
- At least 8Gi RAM and 4 CPU cores available
- 25Gi storage for persistent volumes

## Documentation

This chart includes comprehensive documentation:

- **[DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)** - Complete deployment guide (80+ pages) with:
  - Understanding Helm charts and deployment architecture
  - Pre-deployment planning and infrastructure requirements
  - Step-by-step deployment process with detailed explanations
  - Configuration deep dive with examples
  - Environment-specific deployments (dev/qa/prod)
  - Advanced deployment scenarios (blue-green, CI/CD, cert-manager, secrets management)
  - Comprehensive troubleshooting guide with solutions
- **[values.yaml](values.yaml)** - All configurable parameters with inline documentation

## Quick Start

**For comprehensive deployment instructions, see [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)**

### 1. Add the Pentaho Docker Image

Build or import the Pentaho Docker image to your cluster:

```bash
# If using K3s
cd ../docker-build
./build.sh
sudo k3s ctr images import pentaho-server-11.0.0.0-237.tar

# Or build with import
./build.sh --import
```

### 2. Install the Chart

```bash
# Install with default values
helm install pentaho ./pentaho

# Or install with custom values
helm install pentaho ./pentaho -f custom-values.yaml

# Install in specific namespace
helm install pentaho ./pentaho --namespace pentaho --create-namespace
```

### 3. Access Pentaho

Wait for pods to be ready (3-5 minutes):

```bash
kubectl get pods -n pentaho -w
```

Access via port-forward:

```bash
kubectl port-forward -n pentaho svc/pentaho-server 8080:8080
```

Then open: http://localhost:8080/pentaho

**Default credentials:**
- Username: `admin`
- Password: `password`

## Configuration

### Common Configuration Options

| Parameter | Description | Default |
|-----------|-------------|---------|
| `global.namespace` | Namespace to deploy into | `pentaho` |
| `global.timezone` | Timezone for all components | `America/New_York` |
| `global.storageClass` | Storage class for PVCs | `local-path` |
| `pentaho.image.repository` | Pentaho image repository | `pentaho/pentaho-server` |
| `pentaho.image.tag` | Pentaho image tag | `11.0.0.0-237` |
| `pentaho.replicas` | Number of Pentaho replicas | `1` |
| `pentaho.resources.requests.memory` | Pentaho minimum memory | `2Gi` |
| `pentaho.resources.limits.memory` | Pentaho maximum memory | `6Gi` |
| `pentaho.jvm.minMemory` | JVM min heap size | `2048m` |
| `pentaho.jvm.maxMemory` | JVM max heap size | `4096m` |
| `postgresql.enabled` | Deploy PostgreSQL | `true` |
| `postgresql.persistence.size` | PostgreSQL PVC size | `10Gi` |
| `database.auth.postgresPassword` | PostgreSQL superuser password | `postgres` |
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.className` | Ingress class name | `traefik` |

### Example: Custom Values

Create a `custom-values.yaml` file:

```yaml
# Custom configuration
global:
  timezone: "Europe/London"

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

  # Enable persistent storage
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

# Custom ingress host
ingress:
  rules:
    - host: pentaho.company.com
      paths:
        - path: /
          pathType: Prefix

  # Enable TLS
  tls:
    enabled: true
    secretName: pentaho-tls-secret
    hosts:
      - pentaho.company.com

# Change default passwords
database:
  auth:
    postgresPassword: "SecureP@ssw0rd123"
    jcrPassword: "SecureJCR123"
    quartzPassword: "SecureQuartz123"
    hibernatePassword: "SecureHibernate123"
```

Install with custom values:

```bash
helm install pentaho ./pentaho -f custom-values.yaml
```

## Values Reference

### Global Settings

```yaml
global:
  namespace: pentaho
  timezone: "America/New_York"
  storageClass: local-path
```

### Pentaho Server Settings

```yaml
pentaho:
  enabled: true
  image:
    repository: pentaho/pentaho-server
    tag: 11.0.0.0-237
    pullPolicy: IfNotPresent
  replicas: 1
  hostname: pentaho-server

  service:
    type: ClusterIP
    http:
      port: 8080
      targetPort: 8080
    https:
      port: 8443
      targetPort: 8443

  resources:
    requests:
      memory: "2Gi"
      cpu: "1"
    limits:
      memory: "6Gi"
      cpu: "4"

  jvm:
    minMemory: "2048m"
    maxMemory: "4096m"

  persistence:
    data:
      enabled: false
      size: 10Gi
    solutions:
      enabled: false
      size: 5Gi
```

### PostgreSQL Settings

```yaml
postgresql:
  enabled: true
  image:
    repository: postgres
    tag: "15"
  replicas: 1

  service:
    type: ClusterIP
    port: 5432

  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "2Gi"
      cpu: "2"

  persistence:
    enabled: true
    size: 10Gi
```

### Database Authentication

```yaml
database:
  type: postgres
  host: postgres
  port: 5432

  auth:
    postgresPassword: "postgres"
    jcrUser: "jcr_user"
    jcrPassword: "password"
    quartzUser: "pentaho_user"
    quartzPassword: "password"
    hibernateUser: "hibuser"
    hibernatePassword: "password"
```

### Ingress Settings

```yaml
ingress:
  enabled: true
  className: traefik

  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web
    traefik.ingress.kubernetes.io/buffering: "true"

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

## Deployment Examples

### Development Environment

```bash
helm install pentaho ./pentaho \
  --set pentaho.resources.requests.memory=2Gi \
  --set pentaho.resources.limits.memory=4Gi \
  --set pentaho.jvm.maxMemory=2048m
```

### Production Environment

```yaml
# production-values.yaml
global:
  storageClass: longhorn  # or nfs-client

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
  resources:
    requests:
      memory: "2Gi"
      cpu: "1"
    limits:
      memory: "4Gi"
      cpu: "2"
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
    postgresPassword: "<strong-password>"
    jcrPassword: "<strong-password>"
    quartzPassword: "<strong-password>"
    hibernatePassword: "<strong-password>"
```

```bash
helm install pentaho ./pentaho -f production-values.yaml
```

## Management Commands

### Upgrade

```bash
# Upgrade with new values
helm upgrade pentaho ./pentaho -f custom-values.yaml

# Upgrade to new chart version
helm upgrade pentaho ./pentaho --version 1.1.0
```

### Rollback

```bash
# List releases
helm history pentaho

# Rollback to previous version
helm rollback pentaho

# Rollback to specific revision
helm rollback pentaho 2
```

### Uninstall

```bash
# Uninstall release
helm uninstall pentaho

# Uninstall and delete namespace
helm uninstall pentaho -n pentaho
kubectl delete namespace pentaho
```

## Monitoring and Troubleshooting

### Check Status

```bash
# Check all resources
kubectl get all -n pentaho

# Check pods
kubectl get pods -n pentaho

# Check persistent volumes
kubectl get pvc -n pentaho
```

### View Logs

```bash
# Pentaho Server logs
kubectl logs -f deployment/pentaho-server -n pentaho

# PostgreSQL logs
kubectl logs -f deployment/postgres -n pentaho

# Init container logs
kubectl logs -l app=pentaho-server -n pentaho -c wait-for-postgres
```

### Debug Pod Issues

```bash
# Describe pod
kubectl describe pod -l app=pentaho-server -n pentaho

# Check events
kubectl get events -n pentaho --sort-by='.lastTimestamp'

# Execute command in pod
kubectl exec -it deployment/pentaho-server -n pentaho -- bash
```

### Database Access

```bash
# Connect to PostgreSQL
kubectl exec -it deployment/postgres -n pentaho -- psql -U postgres

# List databases
kubectl exec deployment/postgres -n pentaho -- psql -U postgres -c "\l"

# Check Quartz tables
kubectl exec deployment/postgres -n pentaho -- \
  psql -U pentaho_user -d quartz -c "\dt"
```

## Security Considerations

### Production Checklist

- [ ] Change all default passwords
- [ ] Enable TLS/HTTPS
- [ ] Use external secrets management (Vault, AWS Secrets Manager)
- [ ] Enable network policies
- [ ] Configure resource limits
- [ ] Set up regular backups
- [ ] Enable audit logging
- [ ] Configure LDAP/AD authentication
- [ ] Use private container registry
- [ ] Enable pod security policies
- [ ] Configure ingress rate limiting

### Securing Secrets

Use Kubernetes external secrets:

```bash
# Install external-secrets operator
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets

# Create SecretStore and ExternalSecret
# Refer to external-secrets documentation
```

Or use existing secrets:

```yaml
security:
  createSecrets: false
  existingSecret: my-existing-secret
```

## Backup and Restore

### Backup PostgreSQL

```bash
# Manual backup
kubectl exec deployment/postgres -n pentaho -- \
  pg_dumpall -U postgres > pentaho-backup-$(date +%Y%m%d).sql

# Restore backup
kubectl exec -i deployment/postgres -n pentaho -- \
  psql -U postgres < pentaho-backup-20260216.sql
```

### Backup Persistent Volumes

```bash
# Find PVC node and path
kubectl get pvc -n pentaho
kubectl describe pvc postgres-data-pvc -n pentaho

# On the node
sudo tar czf postgres-backup.tar.gz /var/lib/rancher/k3s/storage/<pvc-name>
```

## Advanced Configuration

### Custom Init Scripts

Add custom SQL scripts to the chart:

1. Place SQL files in `files/db_init/`
2. Update `configmap-postgres-init.yaml` template

### Network Policies

Enable network policies:

```yaml
networkPolicy:
  enabled: true
```

### Node Affinity

Schedule pods on specific nodes:

```yaml
nodeSelector:
  kubernetes.io/hostname: node1

affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
    - labelSelector:
        matchExpressions:
        - key: app
          operator: In
          values:
          - pentaho-server
      topologyKey: kubernetes.io/hostname
```

## Known Limitations

1. **Single Replica**: Pentaho Server runs as single replica due to ReadWriteOnce volumes
2. **No HA**: PostgreSQL is single instance (not clustered)
3. **Persistent Volumes Disabled**: By default, Pentaho persistent volumes are disabled to avoid overwriting container files
4. **Manual Scaling**: Requires ReadWriteMany volumes for multi-replica deployment

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Test your changes
4. Submit a pull request

## License

This Helm chart is provided as-is under the MIT License.

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/Pentaho-K3s-PostgreSQL/issues
- Pentaho Documentation: https://docs.hitachivantara.com/

## Changelog

### Version 1.0.0
- Initial release
- Pentaho Server 11.0.0.0-237
- PostgreSQL 15
- Ingress support
- Persistent storage
- Configurable resources and JVM settings
