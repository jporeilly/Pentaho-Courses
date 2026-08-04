#!/bin/bash
# =============================================================================
# Helm Installation Script
# =============================================================================
# This script checks if Helm is installed and installs it if needed
#
# Usage:
#   ./install-helm.sh              # Interactive installation
#   ./install-helm.sh --auto       # Automatic installation (no prompts)
#   ./install-helm.sh --check      # Check only (don't install)
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
AUTO_INSTALL=false
CHECK_ONLY=false

for arg in "$@"; do
    case $arg in
        --auto)
            AUTO_INSTALL=true
            shift
            ;;
        --check)
            CHECK_ONLY=true
            shift
            ;;
        -h|--help)
            echo "Helm Installation Script"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --auto         Automatic installation (no prompts)"
            echo "  --check        Check only (don't install)"
            echo "  -h, --help     Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0             Interactive installation"
            echo "  $0 --auto      Automatic installation"
            echo "  $0 --check     Check if Helm is installed"
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
# Helm Installation Function
# =============================================================================

install_helm() {
    print_header "Installing Helm"

    # Check for required tools
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed"
        echo "Please install curl and try again: sudo apt-get install curl"
        exit 1
    fi

    if ! command -v tar &> /dev/null; then
        print_error "tar is required but not installed"
        echo "Please install tar and try again: sudo apt-get install tar"
        exit 1
    fi

    # Detect OS and architecture
    OS="$(uname -s)"
    ARCH="$(uname -m)"

    case "$OS" in
        Linux*)
            OS_TYPE="linux"
            ;;
        Darwin*)
            OS_TYPE="darwin"
            ;;
        *)
            print_error "Unsupported operating system: $OS"
            echo "Supported: Linux, macOS"
            exit 1
            ;;
    esac

    case "$ARCH" in
        x86_64)
            ARCH_TYPE="amd64"
            ;;
        aarch64|arm64)
            ARCH_TYPE="arm64"
            ;;
        i386|i686)
            ARCH_TYPE="386"
            ;;
        armv7l)
            ARCH_TYPE="arm"
            ;;
        *)
            print_error "Unsupported architecture: $ARCH"
            echo "Supported: x86_64, aarch64, arm64, i386, armv7l"
            exit 1
            ;;
    esac

    print_success "Detected platform: $OS_TYPE-$ARCH_TYPE"

    # Get latest Helm version
    print_info "Fetching latest Helm version from GitHub..."
    HELM_VERSION=$(curl -sL https://api.github.com/repos/helm/helm/releases/latest 2>/dev/null | grep '"tag_name"' | cut -d'"' -f4)

    if [ -z "$HELM_VERSION" ]; then
        print_warning "Failed to fetch latest version from GitHub"
        echo "Falling back to known stable version: v3.14.0"
        HELM_VERSION="v3.14.0"
    else
        print_success "Latest version: $HELM_VERSION"
    fi

    # Construct download URL
    HELM_URL="https://get.helm.sh/helm-${HELM_VERSION}-${OS_TYPE}-${ARCH_TYPE}.tar.gz"
    print_info "Download URL: $HELM_URL"

    # Create temporary directory
    TMP_DIR=$(mktemp -d)
    print_info "Working directory: $TMP_DIR"

    # Download Helm
    echo ""
    print_info "Downloading Helm $HELM_VERSION..."
    if ! curl -L --progress-bar "$HELM_URL" -o "$TMP_DIR/helm.tar.gz"; then
        print_error "Failed to download Helm"
        echo "Please check your internet connection and try again"
        rm -rf "$TMP_DIR"
        exit 1
    fi
    print_success "Download completed"

    # Verify download
    if [ ! -f "$TMP_DIR/helm.tar.gz" ] || [ ! -s "$TMP_DIR/helm.tar.gz" ]; then
        print_error "Downloaded file is missing or empty"
        rm -rf "$TMP_DIR"
        exit 1
    fi

    # Extract archive
    print_info "Extracting archive..."
    if ! tar -xzf "$TMP_DIR/helm.tar.gz" -C "$TMP_DIR"; then
        print_error "Failed to extract Helm archive"
        echo "The downloaded file may be corrupted"
        rm -rf "$TMP_DIR"
        exit 1
    fi
    print_success "Extraction completed"

    # Verify extracted binary exists
    if [ ! -f "$TMP_DIR/${OS_TYPE}-${ARCH_TYPE}/helm" ]; then
        print_error "Helm binary not found in extracted archive"
        echo "Expected location: $TMP_DIR/${OS_TYPE}-${ARCH_TYPE}/helm"
        rm -rf "$TMP_DIR"
        exit 1
    fi

    # Check if /usr/local/bin exists
    if [ ! -d "/usr/local/bin" ]; then
        print_warning "/usr/local/bin does not exist"
        print_info "Creating /usr/local/bin directory..."
        if sudo mkdir -p /usr/local/bin; then
            print_success "Directory created"
        else
            print_error "Failed to create /usr/local/bin"
            rm -rf "$TMP_DIR"
            exit 1
        fi
    fi

    # Install binary
    print_info "Installing Helm to /usr/local/bin/helm..."

    if [ -w "/usr/local/bin" ]; then
        # Can write to /usr/local/bin without sudo
        if mv "$TMP_DIR/${OS_TYPE}-${ARCH_TYPE}/helm" /usr/local/bin/helm; then
            chmod +x /usr/local/bin/helm
            print_success "Helm binary installed (without sudo)"
        else
            print_error "Failed to install Helm binary"
            rm -rf "$TMP_DIR"
            exit 1
        fi
    else
        # Need sudo for installation
        print_info "Root privileges required to install to /usr/local/bin"
        if sudo mv "$TMP_DIR/${OS_TYPE}-${ARCH_TYPE}/helm" /usr/local/bin/helm; then
            sudo chmod +x /usr/local/bin/helm
            print_success "Helm binary installed (with sudo)"
        else
            print_error "Failed to install Helm binary"
            rm -rf "$TMP_DIR"
            exit 1
        fi
    fi

    # Cleanup temporary files
    print_info "Cleaning up..."
    rm -rf "$TMP_DIR"
    print_success "Cleanup completed"

    echo ""
    # Verify installation
    if command -v helm &> /dev/null; then
        INSTALLED_VERSION=$(helm version --short 2>/dev/null)
        print_success "Helm installed successfully!"
        echo ""
        echo "Installed version: $INSTALLED_VERSION"
        echo "Location: $(which helm)"
        echo ""
        return 0
    else
        print_error "Helm installation verification failed"
        echo ""
        echo "The binary was installed but cannot be found in PATH"
        echo "You may need to:"
        echo "  1. Add /usr/local/bin to your PATH"
        echo "  2. Restart your shell"
        echo "  3. Run: export PATH=/usr/local/bin:\$PATH"
        return 1
    fi
}

# =============================================================================
# Main Script
# =============================================================================

print_header "Helm Installation Check"

# Check if Helm is already installed
if command -v helm &> /dev/null; then
    HELM_VERSION=$(helm version --short 2>/dev/null)
    HELM_PATH=$(which helm)

    print_success "Helm is already installed"
    echo ""
    echo "Version: $HELM_VERSION"
    echo "Location: $HELM_PATH"
    echo ""

    # Check Helm version
    HELM_MAJOR_VERSION=$(echo "$HELM_VERSION" | grep -oP 'v\K[0-9]+' | head -1)

    if [ -z "$HELM_MAJOR_VERSION" ]; then
        print_warning "Could not determine Helm major version"
        HELM_MAJOR_VERSION=0
    fi

    if [ "$HELM_MAJOR_VERSION" -ge 3 ]; then
        print_success "Helm version is 3.x or higher (recommended)"

        if [ "$CHECK_ONLY" = true ]; then
            exit 0
        fi

        echo ""
        echo "Helm is properly installed and ready to use!"
        echo ""
        echo "Next steps:"
        echo "  1. Verify: helm version"
        echo "  2. List repos: helm repo list"
        echo "  3. Search charts: helm search repo"
        echo ""
        exit 0
    else
        print_warning "Helm version 2.x detected (outdated)"
        echo ""
        echo "Helm 2.x is deprecated and no longer supported."
        echo "Helm 3.x is required for this deployment."
        echo ""

        if [ "$CHECK_ONLY" = true ]; then
            print_error "Helm upgrade required"
            exit 1
        fi

        if [ "$AUTO_INSTALL" = true ]; then
            UPGRADE="y"
        else
            read -p "Would you like to upgrade to Helm 3.x now? (y/N) " -n 1 -r UPGRADE
            echo ""
        fi

        if [[ $UPGRADE =~ ^[Yy]$ ]]; then
            echo ""
            print_info "Upgrading Helm..."
            # Remove old version first
            print_info "Removing old Helm version..."
            sudo rm -f "$HELM_PATH"
            install_helm
        else
            echo ""
            print_warning "Helm 2.x will not work with this deployment"
            echo "Please upgrade manually: https://helm.sh/docs/intro/install/"
            exit 1
        fi
    fi
else
    print_warning "Helm is not installed"
    echo ""

    if [ "$CHECK_ONLY" = true ]; then
        print_error "Helm not found"
        echo ""
        echo "To install Helm, run: $0"
        exit 1
    fi

    echo "Helm is the package manager for Kubernetes."
    echo "It is required to deploy applications using Helm charts."
    echo ""
    echo "This script will:"
    echo "  1. Download the latest Helm 3.x release"
    echo "  2. Install it to /usr/local/bin/helm"
    echo "  3. Verify the installation"
    echo ""

    if [ "$AUTO_INSTALL" = true ]; then
        INSTALL="y"
    else
        read -p "Would you like to install Helm now? (y/N) " -n 1 -r INSTALL
        echo ""
    fi

    if [[ $INSTALL =~ ^[Yy]$ ]]; then
        echo ""
        install_helm

        echo ""
        print_header "Installation Complete"
        echo ""
        echo "Helm is now installed and ready to use!"
        echo ""
        echo "Useful commands:"
        echo "  helm version              # Show Helm version"
        echo "  helm repo add             # Add a chart repository"
        echo "  helm repo update          # Update repository cache"
        echo "  helm search repo          # Search for charts"
        echo "  helm install              # Install a chart"
        echo "  helm list                 # List deployed releases"
        echo ""
        echo "Documentation: https://helm.sh/docs/"
        echo ""
    else
        echo ""
        print_info "Installation cancelled"
        echo ""
        echo "To install Helm manually:"
        echo "  1. Visit: https://helm.sh/docs/intro/install/"
        echo "  2. Or run this script again: $0"
        echo ""
        exit 1
    fi
fi

exit 0
