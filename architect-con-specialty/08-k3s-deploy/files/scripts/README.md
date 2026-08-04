# Pentaho K3s Scripts

This directory contains utility scripts for managing, monitoring, and maintaining your Pentaho K3s deployment.

## Recent Improvements (2026-01)

All scripts have been significantly improved with:

### 1. **Enhanced Error Handling**
- **`set -euo pipefail`**: All scripts now use stricter error checking
  - Exit on any error (`-e`)
  - Exit on undefined variables (`-u`)
  - Exit on pipe failures (`-o pipefail`)

### 2. **Terminal-Aware Colors**
- Colors are only used when output is to a terminal
- When redirected to files or pipes, output is plain text
- Prevents ANSI escape codes in log files

### 3. **Shared Common Functions** (`common.sh`)
All scripts now source a common library providing:
- Standardized logging functions (`log_info`, `log_success`, `log_error`, etc.)
- Display functions (`print_header`, `print_step`, etc.)
- Progress indicators (spinners, progress dots)
- Validation helpers (check pods, namespaces, etc.)
- Retry logic with exponential backoff
- Cleanup handlers with trap support
- Port management utilities
- JSON output support for CI/CD integration
- Kubernetes helper functions
- Database helper functions

### 4. **Improved Robustness**
- Port-forward operations now check port availability
- Proper cleanup handlers for background processes
- Better error messages with actionable advice
- Configurable thresholds via environment variables

## Script Inventory

### Deployment & Management
- **`../deploy.sh`** - Complete Pentaho deployment to K3s
- **`../destroy.sh`** - Remove Pentaho resources from K3s
- **`validate-deployment.sh`** - Verify deployment is correct
- **`verify-k3s.sh`** - Check K3s installation and health

### Database Management
- **`backup-postgres.sh`** - Backup PostgreSQL databases
- **`restore-postgres.sh`** - Restore from backup
- **`monitor-postgres.sh`** - PostgreSQL health and performance metrics

### Monitoring & Health
- **`health-check.sh`** - Quick health check of all components
- **`monitor-resources.sh`** - Resource usage monitoring

## Using common.sh in Your Scripts

To use the shared functions in your own scripts:

```bash
#!/bin/bash
set -euo pipefail

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# Now you can use shared functions
print_header "My Custom Script"
log_info "Starting operation..."

if pod_is_running "app=postgres"; then
    print_success "PostgreSQL is running"
else
    log_error "PostgreSQL not found"
    exit 1
fi
```

### Available Functions

#### Logging
```bash
log_info "Information message"
log_success "Success message"
log_warning "Warning message"
log_error "Error message"
log_debug "Debug message (only shown if DEBUG=true)"
```

#### Display
```bash
print_header "Section Title"
print_step "Step description"
print_success "Success message with checkmark"
print_error "Error message with X"
print_warning "Warning message"
print_info "Info message"
```

#### Progress Indicators
```bash
# Spinner for long operations
start_spinner "Processing..."
# ... long operation ...
stop_spinner $?

# Progress dots
some_command & show_progress $!
```

#### Kubernetes Helpers
```bash
# Check if namespace exists
if namespace_exists "pentaho"; then
    echo "Namespace found"
fi

# Check if pod is running
if pod_is_running "app=postgres" "pentaho"; then
    echo "Pod is running"
fi

# Check if pod is ready
if pod_is_ready "app=postgres"; then
    echo "Pod is ready"
fi

# Get pod name
POD_NAME=$(get_pod_name "app=postgres" "pentaho")

# Get node IP
NODE_IP=$(get_node_ip)

# Check if metrics are available
if metrics_available; then
    kubectl top pods
fi
```

#### Database Helpers
```bash
# Execute SQL in PostgreSQL
result=$(pg_exec "SELECT 1" "postgres" "postgres" "pentaho")

# Check if database exists
if pg_database_exists "jackrabbit"; then
    echo "Database exists"
fi
```

#### Retry Logic
```bash
# Retry a command up to 5 times
retry 5 kubectl get pods

# Wait for a condition (60 second timeout)
wait_for "pod_is_ready app=postgres" 60 "PostgreSQL to be ready"
```

#### Cleanup Handlers
```bash
# Define cleanup function
cleanup_temp_files() {
    rm -f /tmp/myfile.tmp
}

# Register cleanup (runs on EXIT, INT, TERM)
register_cleanup cleanup_temp_files
```

#### Port Management
```bash
# Check if port is available
if port_is_available 8080; then
    echo "Port 8080 is free"
fi

# Find available port starting from 8080
PORT=$(find_available_port 8080)
```

### Environment Variables

Configure script behavior with environment variables:

```bash
# Namespace (default: pentaho)
export NAMESPACE="my-pentaho"

# PostgreSQL connection limits (default: 50)
export MAX_POSTGRES_CONNECTIONS=100

# Cache hit ratio threshold (default: 90)
export MIN_CACHE_HIT_RATIO=95

# Enable debug output
export DEBUG=true

# Enable verbose output
export VERBOSE=true

# Quiet mode (errors only)
export QUIET=true

# JSON output for CI/CD
export JSON_OUTPUT=true
```

## Configuration

### Configurable Thresholds

Scripts now use environment variables for thresholds:

```bash
# PostgreSQL monitoring
export MAX_POSTGRES_CONNECTIONS=50  # Max recommended connections
export MIN_CACHE_HIT_RATIO=90       # Minimum cache hit ratio (%)
```

### Terminal Detection

Colors are automatically disabled when:
- Output is redirected to a file: `./script.sh > output.log`
- Output is piped: `./script.sh | grep something`
- Running in CI/CD environments

## Examples

### Basic Usage

```bash
# Run health check
./scripts/health-check.sh

# Backup database
./scripts/backup-postgres.sh

# Monitor resources
./scripts/monitor-resources.sh
```

### With Custom Configuration

```bash
# Use custom namespace
NAMESPACE=my-namespace ./scripts/health-check.sh

# Adjust PostgreSQL thresholds
MAX_POSTGRES_CONNECTIONS=100 \
MIN_CACHE_HIT_RATIO=95 \
./scripts/monitor-postgres.sh
```

### Quiet Mode for Cron

```bash
# Only output errors (perfect for cron jobs)
QUIET=true ./scripts/health-check.sh

# With exit code checking
if ! QUIET=true ./scripts/health-check.sh; then
    echo "Health check failed!" | mail -s "Alert" admin@example.com
fi
```

### JSON Output for CI/CD

```bash
# Get JSON output for parsing
JSON_OUTPUT=true ./scripts/validate-deployment.sh | jq .
```

### Debug Mode

```bash
# Show detailed debug information
DEBUG=true ./scripts/backup-postgres.sh

# Or verbose mode
VERBOSE=true ./scripts/validate-deployment.sh
```

## Error Handling Improvements

### Before
```bash
# Silent failures possible
docker save image | k3s ctr images import - | grep -v "unpacking"
```

### After
```bash
# Errors are caught and logged
IMPORT_LOG=$(mktemp)
trap "rm -f ${IMPORT_LOG}" EXIT

if docker save image | k3s ctr images import - | tee "${IMPORT_LOG}" | grep -v "unpacking"; then
    if grep -qi "error" "${IMPORT_LOG}"; then
        print_error "Import failed"
        cat "${IMPORT_LOG}"
        exit 1
    fi
fi
```

## Port Management Improvements

### Before
```bash
# Potential port conflicts
kubectl port-forward svc/pentaho 8080:8080 &
sleep 3
curl localhost:8080
```

### After
```bash
# Find available port automatically
PORT=$(find_available_port 8080)
kubectl port-forward svc/pentaho ${PORT}:8080 &

# Wait for port-forward to be ready
wait_for "port_is_available ${PORT}" 10 "port-forward"
curl localhost:${PORT}
```

## Pod Status Checking Improvements

### Before
```bash
# Binary check
if kubectl get pod -l app=postgres -n pentaho | grep -q Running; then
    echo "Running"
fi
```

### After
```bash
# Detailed status checking
POD_STATUS=$(kubectl get pod -l app=postgres -n pentaho -o jsonpath='{.items[0].status.phase}')

if [[ "${POD_STATUS}" == "Running" ]]; then
    echo "Pod is running"
elif [[ "${POD_STATUS}" =~ ^(Pending|ContainerCreating)$ ]]; then
    echo "Pod is starting"
elif [[ "${POD_STATUS}" =~ ^(Error|CrashLoopBackOff)$ ]]; then
    echo "Pod has errors"
    ((ERRORS++))
fi
```

## Best Practices

1. **Always source common.sh** for consistency
2. **Use `set -euo pipefail`** for strict error checking
3. **Register cleanup handlers** for temporary resources
4. **Use helper functions** instead of direct kubectl calls
5. **Check return codes** and provide helpful error messages
6. **Quote all variables** to prevent word splitting
7. **Use `[[ ]]` instead of `[ ]`** for better error handling

## Troubleshooting

### Scripts fail with "common.sh not found"
Make sure you're running scripts from the correct location:
```bash
cd /path/to/Pentaho-K3s-PostgreSQL
./scripts/health-check.sh
```

### Colors appear as escape codes in logs
This should not happen anymore. If it does, colors should auto-disable when output is not a terminal. File an issue if you see this.

### Port-forward fails
The improved scripts now detect port conflicts and find available ports automatically. If issues persist, check:
```bash
# See what's using ports
lsof -i :8080
netstat -tuln | grep 8080
```

## Contributing

When adding new scripts:

1. Use the template:
```bash
#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# Your script here
```

2. Follow the naming convention:
   - Use kebab-case: `my-new-script.sh`
   - Be descriptive: `backup-mongodb.sh` not `backup.sh`

3. Add documentation:
   - Header comments explaining purpose
   - Usage examples
   - Exit codes

4. Test with:
   - Normal operation
   - Redirected output: `./script.sh > log.txt`
   - Pipes: `./script.sh | grep foo`
   - Error conditions

## Additional Resources

- **Project README**: `../README.md`
- **Deployment Guide**: `../docs/DEPLOYMENT.md`
- **Architecture**: `../docs/ARCHITECTURE.md`
- **Troubleshooting**: `../docs/TROUBLESHOOTING.md`

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review script output with `DEBUG=true`
3. Check pod logs: `kubectl logs -n pentaho <pod-name>`
4. Create an issue in the project repository
