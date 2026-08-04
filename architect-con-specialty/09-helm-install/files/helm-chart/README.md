# Pentaho Helm Chart

A production-ready Helm chart for deploying Pentaho Business Analytics Platform with PostgreSQL on Kubernetes.

## Overview

This Helm chart provides a complete deployment solution for:

- **Pentaho Server 11.0.0.0-237** - Business Intelligence and Analytics Platform
- **PostgreSQL 15** - Database backend with automatic initialization
- **Ingress Support** - HTTP/HTTPS routing via Traefik
- **Persistent Storage** - Data persistence using PersistentVolumeClaims
- **Health Monitoring** - Liveness, readiness, and startup probes
- **Configurable Resources** - Flexible CPU and memory allocation

## Features

- Full Kubernetes manifest templating with Helm
- Configurable JVM memory settings
- Database initialization with SQL scripts
- Ingress with optional TLS/HTTPS
- Health probes for reliability
- Resource requests and limits
- Persistent storage support
- Init containers for PostgreSQL readiness
- Comprehensive documentation

## Directory Structure

```
helm-chart/
├── INSTALL.md                    # Installation guide
├── README.md                     # This file
└── pentaho/                      # Helm chart
    ├── Chart.yaml                # Chart metadata
    ├── values.yaml               # Default configuration values
    ├── README.md                 # Chart documentation
    ├── .helmignore               # Files to ignore
    ├── charts/                   # Chart dependencies (empty)
    ├── files/
    │   └── db_init/              # PostgreSQL init SQL scripts
    │       ├── 1_create_jcr_postgresql.sql
    │       ├── 2_create_quartz_postgresql.sql
    │       ├── 3_create_repository_postgresql.sql
    │       ├── 4_pentaho_logging_postgresql.sql
    │       └── 5_pentaho_mart_postgresql.sql
    └── templates/                # Kubernetes resource templates
        ├── _helpers.tpl          # Template helpers
        ├── NOTES.txt             # Post-installation notes
        ├── namespace.yaml        # Namespace resource
        ├── secret.yaml           # Database credentials
        ├── configmap-pentaho.yaml         # Pentaho config
        ├── configmap-postgres-init.yaml   # DB init scripts
        ├── pvc.yaml              # Persistent volume claims
        ├── postgres-deployment.yaml       # PostgreSQL deployment
        ├── postgres-service.yaml          # PostgreSQL service
        ├── pentaho-deployment.yaml        # Pentaho deployment
        ├── pentaho-service.yaml           # Pentaho service
        └── ingress.yaml          # Ingress rules
```

## Quick Start

### 1. Prerequisites

- Kubernetes 1.19+ (K3s, EKS, GKE, AKS, etc.)
- Helm 3.0+
- Pentaho Docker image imported to cluster
- At least 8Gi RAM and 4 CPU cores
- 25Gi storage available

### 2. Install

```bash
# Navigate to helm-chart directory
cd /home/pentaho/Pentaho-K3s-PostgreSQL/helm-chart

# Install with default values
helm install pentaho ./pentaho

# Or install in specific namespace
helm install pentaho ./pentaho --namespace pentaho --create-namespace
```

### 3. Access

```bash
# Port forward
kubectl port-forward -n pentaho svc/pentaho-server 8080:8080

# Open browser
http://localhost:8080/pentaho

# Login
Username: admin
Password: password
```

## Configuration

The chart is highly configurable through [values.yaml](pentaho/values.yaml). Common configurations:

### Change JVM Memory

```bash
helm install pentaho ./pentaho \
  --set pentaho.jvm.minMemory=4096m \
  --set pentaho.jvm.maxMemory=8192m \
  --set pentaho.resources.limits.memory=12Gi
```

### Enable Persistent Storage

```bash
helm install pentaho ./pentaho \
  --set pentaho.persistence.data.enabled=true \
  --set pentaho.persistence.solutions.enabled=true
```

### Change Database Passwords

```bash
helm install pentaho ./pentaho \
  --set database.auth.postgresPassword=SecurePass123 \
  --set database.auth.jcrPassword=SecurePass123 \
  --set database.auth.quartzPassword=SecurePass123 \
  --set database.auth.hibernatePassword=SecurePass123
```

### Custom Ingress Host

```bash
helm install pentaho ./pentaho \
  --set ingress.rules[0].host=pentaho.company.com
```

### Use Custom Values File

Create `custom-values.yaml`:

```yaml
pentaho:
  resources:
    limits:
      memory: "12Gi"
      cpu: "6"
  jvm:
    maxMemory: "8192m"

postgresql:
  persistence:
    size: 50Gi

ingress:
  rules:
    - host: pentaho.company.com
      paths:
        - path: /
          pathType: Prefix
```

Install:

```bash
helm install pentaho ./pentaho -f custom-values.yaml
```

## Documentation

- **[INSTALL.md](INSTALL.md)** - Comprehensive installation guide with examples
- **[pentaho/README.md](pentaho/README.md)** - Detailed chart documentation
- **[pentaho/values.yaml](pentaho/values.yaml)** - All configurable parameters

## Common Operations

### Upgrade

```bash
# Upgrade with new values
helm upgrade pentaho ./pentaho -f custom-values.yaml

# View release history
helm history pentaho
```

### Rollback

```bash
# Rollback to previous version
helm rollback pentaho

# Rollback to specific revision
helm rollback pentaho 2
```

### Uninstall

```bash
# Remove release
helm uninstall pentaho -n pentaho

# Clean up completely (deletes data!)
helm uninstall pentaho -n pentaho
kubectl delete pvc -n pentaho --all
kubectl delete namespace pentaho
```

## Validation

The chart has been validated with:

```bash
# Lint check
helm lint pentaho
# Result: 1 chart(s) linted, 0 chart(s) failed

# Template rendering
helm template test-release ./pentaho
# Result: All templates render successfully

# Dry-run installation
helm install pentaho ./pentaho --dry-run --debug
```

## Key Configuration Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `global.namespace` | Namespace to deploy into | `pentaho` |
| `pentaho.image.tag` | Pentaho image tag | `11.0.0.0-237` |
| `pentaho.replicas` | Number of replicas | `1` |
| `pentaho.jvm.maxMemory` | JVM max heap | `4096m` |
| `pentaho.resources.limits.memory` | Container memory limit | `6Gi` |
| `postgresql.persistence.size` | PostgreSQL PVC size | `10Gi` |
| `database.auth.postgresPassword` | PostgreSQL password | `postgres` |
| `ingress.enabled` | Enable ingress | `true` |

See [pentaho/values.yaml](pentaho/values.yaml) for all parameters.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Ingress                        │
│              (Traefik/Nginx)                    │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│            Pentaho Service                       │
│              (ClusterIP)                         │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│         Pentaho Server Pod                       │
│  ┌──────────────────────────────────────┐      │
│  │  Init: wait-for-postgres              │      │
│  └────────────┬──────────────────────────┘      │
│               ▼                                  │
│  ┌──────────────────────────────────────┐      │
│  │  Pentaho Server Container             │      │
│  │  - Tomcat 10.1                        │      │
│  │  - Java 21                            │      │
│  │  - Reports, Dashboards, ETL           │      │
│  └──────────────────────────────────────┘      │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│          PostgreSQL Service                      │
│              (ClusterIP)                         │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│           PostgreSQL Pod                         │
│  ┌──────────────────────────────────────┐      │
│  │  PostgreSQL 15 Container              │      │
│  │  - jackrabbit database                │      │
│  │  - quartz database                    │      │
│  │  - hibernate database                 │      │
│  └──────────────────────────────────────┘      │
│               │                                  │
│               ▼                                  │
│  ┌──────────────────────────────────────┐      │
│  │  Persistent Volume                    │      │
│  │  (postgres-data-pvc)                  │      │
│  └──────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
```

## Troubleshooting

### Chart Validation Issues

```bash
# Lint the chart
helm lint pentaho

# Debug template rendering
helm template pentaho ./pentaho --debug

# Dry-run installation
helm install pentaho ./pentaho --dry-run --debug
```

### Installation Issues

See [INSTALL.md](INSTALL.md#troubleshooting) for common installation problems.

### Pod Issues

```bash
# Check pod status
kubectl get pods -n pentaho

# View pod events
kubectl describe pod -l app=pentaho-server -n pentaho

# Check logs
kubectl logs -f deployment/pentaho-server -n pentaho
```

## Production Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Enable persistent storage
- [ ] Configure TLS/HTTPS
- [ ] Set appropriate resource limits
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerting
- [ ] Use external secrets management
- [ ] Configure LDAP/AD authentication
- [ ] Enable network policies
- [ ] Test disaster recovery

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the chart: `helm lint pentaho && helm template pentaho`
5. Submit a pull request

## Support

- **Documentation**: [pentaho/README.md](pentaho/README.md)
- **Installation Guide**: [INSTALL.md](INSTALL.md)
- **Issues**: GitHub Issues
- **Pentaho Docs**: https://docs.hitachivantara.com/

## License

This Helm chart is provided as-is under the MIT License.

## Version

- **Chart Version**: 1.0.0
- **App Version**: 11.0.0.0-237 (Pentaho Server)
- **PostgreSQL**: 15
- **Kubernetes**: 1.19+
- **Helm**: 3.0+

## Changelog

### Version 1.0.0 (2026-02-16)

Initial release with:
- Pentaho Server 11.0.0.0-237 deployment
- PostgreSQL 15 with automatic initialization
- Ingress support with Traefik
- Configurable resources and JVM settings
- Health probes and init containers
- Persistent storage support
- Comprehensive documentation
- Production-ready templates
