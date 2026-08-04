#!/bin/bash
# =============================================================================
# Install Pentaho K3s Project to Home Directory
# =============================================================================
# Copies the Pentaho K3s project from the workshop directory to ~/Pentaho-K3s-PostgreSQL
# and ensures all shell scripts are executable.
#
# Usage:
#   ./scripts/install-to-home.sh [OPTIONS]
#
# Options:
#   --force            Overwrite existing installation without confirmation
#   --backup           Create backup of existing installation
#   --dry-run          Show what would be done without doing it
#   --source PATH      Custom source path (default: /home/pentaho/Workshop--Installation/Pentaho-Containers/K3s/Pentaho-K3s-PostgreSQL)
#   --destination PATH Custom destination path (default: /home/pentaho/Pentaho-K3s-PostgreSQL)
#   --help, -h         Show this help message
#
# What it does:
#   1. Checks if destination exists (prompts for confirmation if it does)
#   2. Creates backup if requested
#   3. Copies project directory
#   4. Makes all .sh scripts executable
#   5. Verifies installation
#
# Examples:
#   ./scripts/install-to-home.sh                    # Interactive mode
#   ./scripts/install-to-home.sh --force            # Overwrite without asking
#   ./scripts/install-to-home.sh --backup           # Create backup first
#   ./scripts/install-to-home.sh --dry-run          # Preview changes
#
# =============================================================================

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================

# Default paths
DEFAULT_SOURCE="/home/pentaho/Workshop--Installation/Pentaho-Containers/K3s/Pentaho-K3s-PostgreSQL"
DEFAULT_DESTINATION="/home/pentaho/Pentaho-K3s-PostgreSQL"

SOURCE="${DEFAULT_SOURCE}"
DESTINATION="${DEFAULT_DESTINATION}"
FORCE=false
BACKUP=false
DRY_RUN=false

# Colors (terminal-aware)
if [[ -t 1 ]]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    CYAN='\033[0;36m'
    BOLD='\033[1m'
    NC='\033[0m'
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    CYAN=''
    BOLD=''
    NC=''
fi

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✓ $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ⚠ $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✗ $1" >&2
}

print_header() {
    echo ""
    echo -e "${BOLD}${BLUE}=============================================="
    echo -e "  $1"
    echo -e "==============================================${NC}"
    echo ""
}

show_help() {
    cat << EOF
Install Pentaho K3s Project to Home Directory

Usage: $0 [OPTIONS]

Options:
  --force            Overwrite existing installation without confirmation
  --backup           Create backup of existing installation
  --dry-run          Show what would be done without doing it
  --source PATH      Custom source path
  --destination PATH Custom destination path
  --help, -h         Show this help message

Default Paths:
  Source:      ${DEFAULT_SOURCE}
  Destination: ${DEFAULT_DESTINATION}

Examples:
  $0                           # Interactive mode
  $0 --force                   # Overwrite without asking
  $0 --backup                  # Create backup first
  $0 --dry-run                 # Preview changes
  $0 --source /custom/path     # Use custom source

What This Script Does:
  1. Validates source directory exists
  2. Checks if destination exists (prompts for confirmation)
  3. Creates backup if --backup is specified
  4. Copies entire project directory
  5. Makes all .sh scripts executable (chmod +x)
  6. Verifies installation

Safety Features:
  - Confirmation required before overwriting (unless --force)
  - Backup option to preserve existing installation
  - Dry-run mode to preview changes
  - Validation of source and destination
  - Detailed logging of all actions

EOF
    exit 0
}

# =============================================================================
# Parse Command Line Arguments
# =============================================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE=true
            shift
            ;;
        --backup)
            BACKUP=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --source)
            SOURCE="$2"
            shift 2
            ;;
        --destination)
            DESTINATION="$2"
            shift 2
            ;;
        --help|-h)
            show_help
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# =============================================================================
# Display Configuration
# =============================================================================

print_header "Pentaho K3s Project Installation"

echo "Configuration:"
echo "  Source:      ${SOURCE}"
echo "  Destination: ${DESTINATION}"
echo "  Mode:        $([ "${DRY_RUN}" = "true" ] && echo "DRY RUN" || echo "LIVE")"
echo "  Force:       ${FORCE}"
echo "  Backup:      ${BACKUP}"
echo ""

# =============================================================================
# Validation
# =============================================================================

log_info "Validating paths..."

# Check if source exists
if [[ ! -d "${SOURCE}" ]]; then
    log_error "Source directory does not exist: ${SOURCE}"
    echo ""
    echo "Please check the path or use --source to specify a different location."
    exit 1
fi

log_success "Source directory found"

# Check if source looks like a Pentaho K3s project
REQUIRED_FILES=("deploy.sh" "destroy.sh" "manifests" "docker-build")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -e "${SOURCE}/${file}" ]]; then
        MISSING_FILES+=("${file}")
    fi
done

if [[ ${#MISSING_FILES[@]} -gt 0 ]]; then
    log_warning "Source directory may not be a valid Pentaho K3s project"
    log_warning "Missing: ${MISSING_FILES[*]}"
    echo ""
    read -r -p "Continue anyway? (y/N) " -n 1
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
fi

# Check if destination exists
DEST_EXISTS=false
if [[ -e "${DESTINATION}" ]]; then
    DEST_EXISTS=true
    log_warning "Destination already exists: ${DESTINATION}"

    if [[ "${FORCE}" == "false" ]] && [[ "${DRY_RUN}" == "false" ]]; then
        echo ""
        echo "Options:"
        echo "  1. Overwrite (will delete existing directory)"
        echo "  2. Cancel"
        echo ""
        read -r -p "Choose an option (1 or 2): " choice

        case $choice in
            1)
                log_info "Will overwrite existing installation"
                ;;
            2)
                echo "Cancelled."
                exit 0
                ;;
            *)
                log_error "Invalid choice"
                exit 1
                ;;
        esac
    fi
fi

echo ""

# =============================================================================
# Backup Existing Installation
# =============================================================================

if [[ "${BACKUP}" == "true" ]] && [[ "${DEST_EXISTS}" == "true" ]]; then
    print_header "Creating Backup"

    BACKUP_DIR="${DESTINATION}.backup-$(date +%Y%m%d-%H%M%S)"
    log_info "Backup location: ${BACKUP_DIR}"

    if [[ "${DRY_RUN}" == "true" ]]; then
        echo "Would create: ${BACKUP_DIR}"
    else
        if mv "${DESTINATION}" "${BACKUP_DIR}"; then
            log_success "Backup created: ${BACKUP_DIR}"
        else
            log_error "Failed to create backup"
            exit 1
        fi
    fi
    echo ""
fi

# =============================================================================
# Remove Existing Destination
# =============================================================================

if [[ "${DEST_EXISTS}" == "true" ]] && [[ "${BACKUP}" == "false" ]]; then
    print_header "Removing Existing Installation"

    if [[ "${DRY_RUN}" == "true" ]]; then
        echo "Would remove: ${DESTINATION}"
    else
        log_info "Removing: ${DESTINATION}"
        if rm -rf "${DESTINATION}"; then
            log_success "Removed existing installation"
        else
            log_error "Failed to remove existing installation"
            exit 1
        fi
    fi
    echo ""
fi

# =============================================================================
# Copy Project
# =============================================================================

print_header "Copying Project"

if [[ "${DRY_RUN}" == "true" ]]; then
    log_info "Would copy:"
    echo "  From: ${SOURCE}"
    echo "  To:   ${DESTINATION}"
    echo ""
    log_info "Would copy these items:"
    ls -la "${SOURCE}" | head -20
else
    log_info "Copying project files..."
    START_TIME=$(date +%s)

    if cp -r "${SOURCE}" "${DESTINATION}"; then
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        log_success "Project copied successfully (${DURATION}s)"
    else
        log_error "Failed to copy project"
        exit 1
    fi
fi

echo ""

# =============================================================================
# Make Scripts Executable
# =============================================================================

print_header "Making Scripts Executable"

if [[ "${DRY_RUN}" == "true" ]]; then
    log_info "Would make executable:"
    find "${SOURCE}" -type f -name "*.sh" -exec echo "  {}" \;
else
    log_info "Finding all .sh scripts..."

    # Find all .sh files and make them executable
    SCRIPT_COUNT=0
    while IFS= read -r script; do
        if chmod +x "${script}"; then
            log_success "Made executable: ${script#${DESTINATION}/}"
            ((SCRIPT_COUNT++))
        else
            log_warning "Failed to chmod: ${script}"
        fi
    done < <(find "${DESTINATION}" -type f -name "*.sh")

    if [[ ${SCRIPT_COUNT} -eq 0 ]]; then
        log_warning "No .sh scripts found"
    else
        log_success "Made ${SCRIPT_COUNT} script(s) executable"
    fi
fi

echo ""

# =============================================================================
# Verify Installation
# =============================================================================

if [[ "${DRY_RUN}" == "false" ]]; then
    print_header "Verifying Installation"

    VERIFICATION_PASSED=true

    # Check destination exists
    if [[ -d "${DESTINATION}" ]]; then
        log_success "Destination directory exists"
    else
        log_error "Destination directory not found"
        VERIFICATION_PASSED=false
    fi

    # Check key files exist
    for file in "${REQUIRED_FILES[@]}"; do
        if [[ -e "${DESTINATION}/${file}" ]]; then
            log_success "Found: ${file}"
        else
            log_error "Missing: ${file}"
            VERIFICATION_PASSED=false
        fi
    done

    # Check if key scripts are executable
    KEY_SCRIPTS=("deploy.sh" "destroy.sh" "scripts/health-check.sh" "scripts/backup-postgres.sh")
    for script in "${KEY_SCRIPTS[@]}"; do
        if [[ -f "${DESTINATION}/${script}" ]]; then
            if [[ -x "${DESTINATION}/${script}" ]]; then
                log_success "Executable: ${script}"
            else
                log_warning "Not executable: ${script}"
            fi
        fi
    done

    echo ""

    if [[ "${VERIFICATION_PASSED}" == "true" ]]; then
        log_success "Verification passed!"
    else
        log_error "Verification failed - some issues detected"
        exit 1
    fi
fi

# =============================================================================
# Summary
# =============================================================================

print_header "Installation Summary"

if [[ "${DRY_RUN}" == "true" ]]; then
    echo -e "${YELLOW}DRY RUN MODE - No changes were made${NC}"
    echo ""
    echo "To perform the actual installation, run without --dry-run:"
    echo "  $0"
else
    echo -e "${GREEN}✓ Installation completed successfully!${NC}"
    echo ""
    echo "Installation location: ${DESTINATION}"

    if [[ "${BACKUP}" == "true" ]]; then
        echo "Backup location: ${BACKUP_DIR}"
    fi

    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Navigate to the project:"
    echo "   cd ${DESTINATION}"
    echo ""
    echo "2. Review the documentation:"
    echo "   cat README.md"
    echo ""
    echo "3. Configure environment (if building Docker image):"
    echo "   cd docker-build"
    echo "   cp .env.example .env"
    echo "   nano .env"
    echo ""
    echo "4. Deploy to K3s:"
    echo "   ./deploy.sh"
    echo ""
    echo "For help with any script:"
    echo "   ./script-name.sh --help"
fi

echo ""
log_success "Done!"
