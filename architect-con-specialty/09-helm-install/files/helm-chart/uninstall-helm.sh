#!/bin/bash
# =============================================================================
# Helm Uninstall Script
# =============================================================================
# This script uninstalls Helm from your system
#
# Usage:
#   ./uninstall-helm.sh              # Interactive uninstall
#   ./uninstall-helm.sh --force      # Force uninstall (no prompts)
#   ./uninstall-helm.sh --keep-data  # Uninstall but keep Helm data
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
FORCE=false
KEEP_DATA=false

for arg in "$@"; do
    case $arg in
        --force)
            FORCE=true
            shift
            ;;
        --keep-data)
            KEEP_DATA=true
            shift
            ;;
        -h|--help)
            echo "Helm Uninstall Script"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --force        Force uninstall (no prompts)"
            echo "  --keep-data    Keep Helm configuration and cache"
            echo "  -h, --help     Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0             Interactive uninstall"
            echo "  $0 --force     Force uninstall"
            echo ""
            echo "What gets removed:"
            echo "  1. Helm binary (/usr/local/bin/helm)"
            echo "  2. Helm config (~/.config/helm/) [optional]"
            echo "  3. Helm cache (~/.cache/helm/) [optional]"
            echo "  4. Helm data (~/.local/share/helm/) [optional]"
            echo ""
            echo "Note: This does NOT uninstall Helm releases or charts."
            echo "      To uninstall deployed charts, use: helm uninstall <release-name>"
            exit 0
            ;;
    esac
done

# Functions
print_header() {
    echo -e "${BLUE}===============================================================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}===============================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# =============================================================================
# Main Script
# =============================================================================

print_header "Helm Uninstall"

# Check if Helm is installed
if ! command -v helm &> /dev/null; then
    print_warning "Helm is not installed"
    echo ""
    echo "Nothing to uninstall."
    exit 0
fi

# Get Helm info
HELM_VERSION=$(helm version --short 2>/dev/null)
HELM_PATH=$(which helm)

echo ""
print_info "Found Helm installation:"
echo "  Version: $HELM_VERSION"
echo "  Location: $HELM_PATH"
echo ""

# List Helm data directories
HELM_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}/helm"
HELM_CACHE_HOME="${XDG_CACHE_HOME:-$HOME/.cache}/helm"
HELM_DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}/helm"

echo "Helm data directories:"
if [ -d "$HELM_CONFIG_HOME" ]; then
    SIZE=$(du -sh "$HELM_CONFIG_HOME" 2>/dev/null | cut -f1)
    echo "  Config: $HELM_CONFIG_HOME ($SIZE)"
else
    echo "  Config: $HELM_CONFIG_HOME (not found)"
fi

if [ -d "$HELM_CACHE_HOME" ]; then
    SIZE=$(du -sh "$HELM_CACHE_HOME" 2>/dev/null | cut -f1)
    echo "  Cache:  $HELM_CACHE_HOME ($SIZE)"
else
    echo "  Cache:  $HELM_CACHE_HOME (not found)"
fi

if [ -d "$HELM_DATA_HOME" ]; then
    SIZE=$(du -sh "$HELM_DATA_HOME" 2>/dev/null | cut -f1)
    echo "  Data:   $HELM_DATA_HOME ($SIZE)"
else
    echo "  Data:   $HELM_DATA_HOME (not found)"
fi

echo ""

# Check for deployed releases
print_info "Checking for deployed Helm releases..."
echo ""

RELEASES=$(helm list --all-namespaces 2>/dev/null || true)
if [ -n "$RELEASES" ] && [ "$(echo "$RELEASES" | wc -l)" -gt 1 ]; then
    print_warning "Found deployed Helm releases:"
    echo ""
    helm list --all-namespaces
    echo ""
    echo "⚠️  These releases will NOT be removed by uninstalling Helm."
    echo "    To remove them first:"
    echo ""
    while IFS= read -r line; do
        # Skip header line
        if [[ "$line" =~ ^NAME ]]; then
            continue
        fi
        RELEASE_NAME=$(echo "$line" | awk '{print $1}')
        NAMESPACE=$(echo "$line" | awk '{print $2}')
        if [ -n "$RELEASE_NAME" ] && [ -n "$NAMESPACE" ]; then
            echo "      helm uninstall $RELEASE_NAME -n $NAMESPACE"
        fi
    done <<< "$RELEASES"
    echo ""
else
    print_success "No deployed Helm releases found"
fi

# Confirm uninstall
if [ "$FORCE" = false ]; then
    echo ""
    print_warning "This will remove:"
    echo "  1. Helm binary: $HELM_PATH"
    if [ "$KEEP_DATA" = false ]; then
        echo "  2. Helm config: $HELM_CONFIG_HOME"
        echo "  3. Helm cache: $HELM_CACHE_HOME"
        echo "  4. Helm data: $HELM_DATA_HOME"
    fi
    echo ""
    read -p "Are you sure you want to uninstall Helm? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Uninstall cancelled"
        exit 0
    fi
fi

# =============================================================================
# Uninstall Process
# =============================================================================

print_header "Uninstalling Helm"

# Remove Helm binary
print_info "Removing Helm binary..."
if [ -w "$(dirname "$HELM_PATH")" ]; then
    # Can remove without sudo
    if rm -f "$HELM_PATH"; then
        print_success "Helm binary removed: $HELM_PATH"
    else
        print_error "Failed to remove Helm binary"
        exit 1
    fi
else
    # Need sudo
    print_info "Root privileges required to remove $HELM_PATH"
    if sudo rm -f "$HELM_PATH"; then
        print_success "Helm binary removed: $HELM_PATH"
    else
        print_error "Failed to remove Helm binary"
        exit 1
    fi
fi

# Remove Helm data directories
if [ "$KEEP_DATA" = false ]; then
    # Remove config
    if [ -d "$HELM_CONFIG_HOME" ]; then
        print_info "Removing Helm config directory..."
        if rm -rf "$HELM_CONFIG_HOME"; then
            print_success "Helm config removed: $HELM_CONFIG_HOME"
        else
            print_warning "Failed to remove Helm config directory"
        fi
    fi

    # Remove cache
    if [ -d "$HELM_CACHE_HOME" ]; then
        print_info "Removing Helm cache directory..."
        if rm -rf "$HELM_CACHE_HOME"; then
            print_success "Helm cache removed: $HELM_CACHE_HOME"
        else
            print_warning "Failed to remove Helm cache directory"
        fi
    fi

    # Remove data
    if [ -d "$HELM_DATA_HOME" ]; then
        print_info "Removing Helm data directory..."
        if rm -rf "$HELM_DATA_HOME"; then
            print_success "Helm data removed: $HELM_DATA_HOME"
        else
            print_warning "Failed to remove Helm data directory"
        fi
    fi
else
    print_info "Keeping Helm data directories (--keep-data specified)"
fi

# Verify removal
echo ""

# Clear shell command cache first
hash -r 2>/dev/null || true

# Now verify removal
if ! command -v helm &> /dev/null; then
    print_header "Uninstall Complete"
    echo ""
    print_success "Helm has been successfully uninstalled"
    echo ""

    if [ "$KEEP_DATA" = false ]; then
        echo "Removed:"
        echo "  ✓ Helm binary"
        echo "  ✓ Helm config"
        echo "  ✓ Helm cache"
        echo "  ✓ Helm data"
    else
        echo "Removed:"
        echo "  ✓ Helm binary"
        echo ""
        echo "Kept (--keep-data):"
        echo "  • Helm config: $HELM_CONFIG_HOME"
        echo "  • Helm cache: $HELM_CACHE_HOME"
        echo "  • Helm data: $HELM_DATA_HOME"
    fi

    echo ""
    print_info "Note: If you still see 'helm' in a different terminal,"
    print_info "      run 'hash -r' or start a new terminal session."
    echo ""
    echo "To reinstall Helm, run: ./install-helm.sh"
    echo ""
else
    print_warning "Shell cache refresh may be needed"
    echo ""

    # Check if binary actually exists
    if [ ! -f "/usr/local/bin/helm" ]; then
        print_success "Helm binary was successfully removed"
        echo ""
        echo "The 'helm' command is still cached in your current shell."
        echo ""
        echo "To refresh your shell, run one of these:"
        echo "  1. hash -r           (refresh command cache)"
        echo "  2. Start a new terminal"
        echo "  3. source ~/.bashrc  (reload shell config)"
        echo ""
        print_info "Verify: Run 'hash -r' then 'which helm' (should show nothing)"
        echo ""
        echo "To reinstall Helm, run: ./install-helm.sh"
        echo ""
    else
        print_error "Uninstall verification failed"
        echo ""
        echo "Helm binary still exists. This might mean:"
        echo "  1. Helm is installed in multiple locations"
        echo "  2. Removal permissions were insufficient"
        echo ""
        echo "Check: which -a helm"
        which -a helm 2>/dev/null || true
        echo ""
        echo "Manually remove: sudo rm -f /usr/local/bin/helm"
        exit 1
    fi
fi

exit 0
