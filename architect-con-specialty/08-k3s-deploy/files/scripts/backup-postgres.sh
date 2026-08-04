#!/bin/bash
# =============================================================================
# PostgreSQL Backup Script for K3s
# =============================================================================
# Creates a complete backup of all Pentaho PostgreSQL databases using pg_dumpall.
# This includes all three Pentaho repository databases:
#   - jackrabbit (JCR content repository)
#   - quartz (scheduler database)
#   - hibernate (Pentaho configuration repository)
#
# The backup includes:
#   - All database schemas, tables, and data
#   - User accounts and permissions
#   - Database roles and configurations
#
# Backup files are automatically compressed with gzip to save disk space.
#
# Usage: ./scripts/backup-postgres.sh
#
# Output: backups/pentaho-postgres-backup-YYYYMMDD-HHMMSS.sql.gz
#
# Prerequisites:
#   - kubectl configured with access to the cluster
#   - PostgreSQL pod must be running in the pentaho namespace
#   - Sufficient disk space for the backup file
#
# Notes:
#   - Backups are created in the project's backups/ directory
#   - Backup files are excluded from git via .gitignore
#   - For production, consider using external backup solutions (Velero, etc.)
# =============================================================================

set -euo pipefail  # Exit immediately if any command fails

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"
# Get the absolute path to the backups directory (project_root/backups)
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)  # Format: 20260126-143022
BACKUP_FILE="${BACKUP_DIR}/pentaho-postgres-backup-${TIMESTAMP}.sql"

echo -e "${YELLOW}PostgreSQL Backup for K3s${NC}"
echo "=========================="

# -----------------------------------------------------------------------------
# Create Backup Directory
# -----------------------------------------------------------------------------
# Ensures the backups directory exists before attempting to write backup files
mkdir -p "${BACKUP_DIR}"

# -----------------------------------------------------------------------------
# Verify PostgreSQL Pod is Running
# -----------------------------------------------------------------------------
# Checks that the PostgreSQL pod is in "Running" state
# If the pod is not running, the backup cannot proceed
if ! pod_is_running "app=postgres" "${NAMESPACE}"; then
    log_error "PostgreSQL pod is not running"
    exit 1
fi

# -----------------------------------------------------------------------------
# Get PostgreSQL Pod Name
# -----------------------------------------------------------------------------
# Dynamically retrieves the pod name using label selector
# This works even if the pod name changes (e.g., after recreation)
POD_NAME=$(get_pod_name "app=postgres" "${NAMESPACE}")

echo "Backing up from pod: ${POD_NAME}"
echo "Backup file: ${BACKUP_FILE}"
echo ""

# -----------------------------------------------------------------------------
# Create Database Backup
# -----------------------------------------------------------------------------
# Uses pg_dumpall to create a complete backup of all databases
# pg_dumpall includes:
#   - All databases (jackrabbit, quartz, hibernate)
#   - Global objects (roles, tablespaces)
#   - Database-specific objects (schemas, tables, data, indexes)
#
# The command runs inside the PostgreSQL pod and outputs SQL to stdout
# The output is redirected to a file on the local filesystem
echo -e "${YELLOW}Creating backup...${NC}"
kubectl exec ${POD_NAME} -n ${NAMESPACE} -- \
    pg_dumpall -U postgres > "${BACKUP_FILE}"

# -----------------------------------------------------------------------------
# Compress Backup File
# -----------------------------------------------------------------------------
# Compresses the SQL backup with gzip to reduce disk space usage
# Typical compression ratios: 10:1 to 20:1 for database dumps
echo -e "${YELLOW}Compressing backup...${NC}"
gzip "${BACKUP_FILE}"
BACKUP_FILE="${BACKUP_FILE}.gz"

# -----------------------------------------------------------------------------
# Display Backup Summary
# -----------------------------------------------------------------------------
# Shows the backup file location and size for verification
BACKUP_SIZE=$(ls -lh "${BACKUP_FILE}" | awk '{print $5}')
echo ""
echo -e "${GREEN}Backup complete!${NC}"
echo "File: ${BACKUP_FILE}"
echo "Size: ${BACKUP_SIZE}"
echo ""

# -----------------------------------------------------------------------------
# List Recent Backups
# -----------------------------------------------------------------------------
# Displays the 5 most recent backup files for reference
# Files are sorted by modification time (newest first)
echo "Recent backups:"
ls -lht "${BACKUP_DIR}"/*.gz 2>/dev/null | head -5

echo ""
echo "To restore this backup, run:"
echo "  ./scripts/restore-postgres.sh ${BACKUP_FILE}"
