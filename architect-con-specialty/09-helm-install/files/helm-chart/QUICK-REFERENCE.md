# Pentaho Helm Chart - Quick Reference

## Installation Commands

```bash
# Basic install
helm install pentaho ./pentaho

# Install with namespace
helm install pentaho ./pentaho -n pentaho --create-namespace

# Install with custom values
helm install pentaho ./pentaho -f custom-values.yaml

# Install with overrides
helm install pentaho ./pentaho \
  --set pentaho.jvm.maxMemory=8192m \
  --set pentaho.resources.limits.memory=12Gi
```

## Management Commands

```bash
# Check status
helm status pentaho -n pentaho

# List releases
helm list -n pentaho

# Upgrade
helm upgrade pentaho ./pentaho -f custom-values.yaml

# Rollback
helm rollback pentaho

# Uninstall
helm uninstall pentaho -n pentaho
```

## Kubectl Commands

```bash
# Check pods
kubectl get pods -n pentaho

# Watch pods
kubectl get pods -n pentaho -w

# View logs
kubectl logs -f deployment/pentaho-server -n pentaho
kubectl logs -f deployment/postgres -n pentaho

# Describe pod
kubectl describe pod -l app=pentaho-server -n pentaho

# Check all resources
kubectl get all -n pentaho

# Check PVCs
kubectl get pvc -n pentaho

# Execute in pod
kubectl exec -it deployment/pentaho-server -n pentaho -- bash
kubectl exec -it deployment/postgres -n pentaho -- psql -U postgres
```

## Access Methods

```bash
# Port forward (recommended for testing)
kubectl port-forward -n pentaho svc/pentaho-server 8080:8080
# Then: http://localhost:8080/pentaho

# Via ingress with /etc/hosts
echo "$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}') pentaho.local" | sudo tee -a /etc/hosts
# Then: http://pentaho.local/pentaho

# Direct node IP
# http://<node-ip>/pentaho
```

## Common Configurations

### Production Settings

```yaml
pentaho:
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
```

### Development Settings

```yaml
pentaho:
  resources:
    requests:
      memory: "2Gi"
      cpu: "1"
    limits:
      memory: "4Gi"
      cpu: "2"
  jvm:
    minMemory: "2048m"
    maxMemory: "2048m"
```

### Custom Ingress

```yaml
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
```

## Database Operations

```bash
# Connect to PostgreSQL
kubectl exec -it deployment/postgres -n pentaho -- psql -U postgres

# List databases
kubectl exec deployment/postgres -n pentaho -- psql -U postgres -c "\l"

# Backup database
kubectl exec deployment/postgres -n pentaho -- \
  pg_dumpall -U postgres > backup-$(date +%Y%m%d).sql

# Restore database
kubectl exec -i deployment/postgres -n pentaho -- \
  psql -U postgres < backup-20260216.sql

# Check Quartz tables
kubectl exec deployment/postgres -n pentaho -- \
  psql -U pentaho_user -d quartz -c "\dt"

# Check JCR tables
kubectl exec deployment/postgres -n pentaho -- \
  psql -U jcr_user -d jackrabbit -c "\dt"
```

## Debugging

```bash
# Render templates locally
helm template pentaho ./pentaho

# Debug template rendering
helm template pentaho ./pentaho --debug

# Dry-run install
helm install pentaho ./pentaho --dry-run --debug

# Get computed values
helm get values pentaho -n pentaho

# Get all values (including defaults)
helm get values pentaho -n pentaho --all

# Get manifest
helm get manifest pentaho -n pentaho

# Check events
kubectl get events -n pentaho --sort-by='.lastTimestamp'

# Check pod details
kubectl describe pod -l app=pentaho-server -n pentaho

# View init container logs
kubectl logs -l app=pentaho-server -n pentaho -c wait-for-postgres
```

## Validation

```bash
# Lint chart
helm lint pentaho

# Template rendering test
helm template test ./pentaho > rendered.yaml

# Validate YAML
kubectl apply --dry-run=client -f rendered.yaml
```

## Troubleshooting

### Pentaho Not Starting

```bash
# Check pod status
kubectl get pods -n pentaho

# Check events
kubectl describe pod -l app=pentaho-server -n pentaho

# Check logs
kubectl logs -f deployment/pentaho-server -n pentaho

# Common fixes:
# - Wait for PostgreSQL: kubectl get pods -l app=postgres -n pentaho
# - Check image: kubectl describe pod -l app=pentaho-server -n pentaho | grep Image
# - Check resources: kubectl describe pod -l app=pentaho-server -n pentaho | grep -A5 "Limits\|Requests"
```

### PostgreSQL Issues

```bash
# Check PostgreSQL status
kubectl get pods -l app=postgres -n pentaho

# Check PostgreSQL logs
kubectl logs deployment/postgres -n pentaho

# Test connectivity
kubectl exec deployment/pentaho-server -n pentaho -- nc -zv postgres 5432
```

### Login 404 Error

```bash
# Check if webapp deployed
kubectl logs deployment/pentaho-server -n pentaho | grep "Deployment of web application"

# Check if pod is ready
kubectl get pods -l app=pentaho-server -n pentaho

# Restart pod
kubectl rollout restart deployment/pentaho-server -n pentaho
```

## Default Credentials

```
Username: admin
Password: password
```

**WARNING:** Change these immediately for production!

## Important Files

```
helm-chart/
├── INSTALL.md              # Installation guide
├── QUICK-REFERENCE.md      # This file
├── README.md               # Overview
└── pentaho/
    ├── Chart.yaml          # Chart metadata
    ├── values.yaml         # Configuration
    ├── README.md           # Detailed docs
    └── templates/          # Kubernetes templates
```

## Key Ports

- **8080** - Pentaho HTTP
- **8443** - Pentaho HTTPS
- **5432** - PostgreSQL

## Key Paths

- Pentaho Server: `/opt/pentaho/pentaho-server`
- Pentaho Data: `/opt/pentaho/pentaho-server/data`
- Pentaho Solutions: `/opt/pentaho/pentaho-server/pentaho-solutions`
- PostgreSQL Data: `/var/lib/postgresql/data/pgdata`

## Resources

- Chart Documentation: [pentaho/README.md](pentaho/README.md)
- Installation Guide: [INSTALL.md](INSTALL.md)
- Pentaho Docs: https://docs.hitachivantara.com/
- Helm Docs: https://helm.sh/docs/

## Version Info

- Chart Version: 1.0.0
- Pentaho Version: 11.0.0.0-237
- PostgreSQL Version: 15
- Kubernetes: 1.19+
- Helm: 3.0+
