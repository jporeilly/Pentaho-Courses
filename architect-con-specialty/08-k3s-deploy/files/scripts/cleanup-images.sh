#!/bin/bash
# =============================================================================
# Docker and K3s Image Cleanup Script
# =============================================================================
# Purges Docker images and K3s containerd cache
#
# This script removes:
#   - Docker images (Pentaho and/or all)
#   - Docker build cache
#   - K3s containerd images
#   - K3s containerd cache
#   - Dangling/unused images
#
# Usage:
#   ./scripts/cleanup-images.sh [OPTIONS]
#
# Options:
#   --docker-only      Only clean Docker (skip K3s)
#   --k3s-only         Only clean K3s (skip Docker)
#   --pentaho-only     Only remove Pentaho images (not all)
#   --all              Remove all images (dangerous!)
#   --prune            Deep clean - remove all unused images
#   --dry-run          Show what would be deleted without deleting
#   --force            Skip confirmation prompts
#   --help, -h         Show this help message
#
# Examples:
#   ./scripts/cleanup-images.sh                    # Interactive mode
#   ./scripts/cleanup-images.sh --pentaho-only     # Only Pentaho images
#   ./scripts/cleanup-images.sh --all --force      # Remove everything
#   ./scripts/cleanup-images.sh --dry-run          # Preview changes
#
# =============================================================================

set -euo pipefail

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# =============================================================================
# Configuration
# =============================================================================

DOCKER_ONLY=false
K3S_ONLY=false
PENTAHO_ONLY=false
ALL_IMAGES=false
PRUNE=false
DRY_RUN=false
FORCE=false

PENTAHO_IMAGE_PATTERN="pentaho"
K3S_IMAGE_PATTERN="pentaho/pentaho-server"

# =============================================================================
# Parse Command Line Arguments
# =============================================================================

show_help() {
    cat << EOF
Docker and K3s Image Cleanup Script

Usage: $0 [OPTIONS]

Options:
  --docker-only      Only clean Docker (skip K3s)
  --k3s-only         Only clean K3s (skip Docker)
  --pentaho-only     Only remove Pentaho images (default)
  --all              Remove ALL images (use with caution!)
  --prune            Deep clean - remove all unused images and build cache
  --dry-run          Show what would be deleted without deleting
  --force            Skip confirmation prompts
  --help, -h         Show this help message

Examples:
  $0                           # Interactive, Pentaho only
  $0 --pentaho-only            # Remove only Pentaho images
  $0 --all --force             # Remove ALL images without confirmation
  $0 --docker-only --prune     # Deep clean Docker only
  $0 --dry-run                 # Preview what would be deleted

Safety:
  - By default, only Pentaho images are removed
  - Confirmations are required unless --force is used
  - Use --dry-run to preview changes safely
  - Use --all with extreme caution (removes ALL images)

EOF
    exit 0
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --docker-only)
            DOCKER_ONLY=true
            shift
            ;;
        --k3s-only)
            K3S_ONLY=true
            shift
            ;;
        --pentaho-only)
            PENTAHO_ONLY=true
            shift
            ;;
        --all)
            ALL_IMAGES=true
            shift
            ;;
        --prune)
            PRUNE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
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

# Default to Pentaho only if neither --pentaho-only nor --all specified
if [[ "${PENTAHO_ONLY}" == "false" ]] && [[ "${ALL_IMAGES}" == "false" ]]; then
    PENTAHO_ONLY=true
fi

# Validate conflicting options
if [[ "${DOCKER_ONLY}" == "true" ]] && [[ "${K3S_ONLY}" == "true" ]]; then
    log_error "Cannot use both --docker-only and --k3s-only"
    exit 1
fi

if [[ "${PENTAHO_ONLY}" == "true" ]] && [[ "${ALL_IMAGES}" == "true" ]]; then
    log_error "Cannot use both --pentaho-only and --all"
    exit 1
fi

# =============================================================================
# Display Configuration
# =============================================================================

print_header "Docker and K3s Image Cleanup"

echo "Configuration:"
echo "  Docker cleanup:    $([ "${DOCKER_ONLY}" = "true" ] || [ "${K3S_ONLY}" = "false" ] && echo "Yes" || echo "No")"
echo "  K3s cleanup:       $([ "${K3S_ONLY}" = "true" ] || [ "${DOCKER_ONLY}" = "false" ] && echo "Yes" || echo "No")"
echo "  Target:            $([ "${PENTAHO_ONLY}" = "true" ] && echo "Pentaho images only" || echo "ALL images")"
echo "  Deep clean:        $([ "${PRUNE}" = "true" ] && echo "Yes" || echo "No")"
echo "  Mode:              $([ "${DRY_RUN}" = "true" ] && echo "DRY RUN (no changes)" || echo "LIVE (will delete)")"
echo ""

# =============================================================================
# Safety Confirmation
# =============================================================================

if [[ "${FORCE}" == "false" ]] && [[ "${DRY_RUN}" == "false" ]]; then
    print_warning "This operation will DELETE images!"

    if [[ "${ALL_IMAGES}" == "true" ]]; then
        echo -e "${RED}WARNING: You are about to delete ALL images!${NC}"
        echo "This includes system images and will require re-downloading everything."
    fi

    echo ""
    read -r -p "Are you sure you want to continue? (y/N) " -n 1
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
    echo ""
fi

# =============================================================================
# Docker Cleanup
# =============================================================================

if [[ "${K3S_ONLY}" == "false" ]]; then
    print_header "Docker Cleanup"

    # Check if Docker is available
    if ! command_exists docker; then
        log_warning "Docker not found - skipping Docker cleanup"
    else
        # List current images
        print_step "Current Docker images:"
        docker images
        echo ""

        # Remove Pentaho images
        if [[ "${PENTAHO_ONLY}" == "true" ]]; then
            print_step "Removing Pentaho Docker images..."

            PENTAHO_IMAGES=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep -i "${PENTAHO_IMAGE_PATTERN}" || true)

            if [[ -z "${PENTAHO_IMAGES}" ]]; then
                print_info "No Pentaho images found in Docker"
            else
                IMAGE_COUNT=$(echo "${PENTAHO_IMAGES}" | wc -l)
                log_info "Found ${IMAGE_COUNT} Pentaho image(s)"

                if [[ "${DRY_RUN}" == "true" ]]; then
                    echo "Would remove:"
                    echo "${PENTAHO_IMAGES}"
                else
                    echo "${PENTAHO_IMAGES}" | while read -r image; do
                        log_info "Removing: ${image}"
                        docker rmi "${image}" || log_warning "Failed to remove ${image}"
                    done
                    print_success "Pentaho images removed from Docker"
                fi
            fi
        fi

        # Remove ALL images
        if [[ "${ALL_IMAGES}" == "true" ]]; then
            print_step "Removing ALL Docker images..."

            ALL_IMAGE_IDS=$(docker images -q)

            if [[ -z "${ALL_IMAGE_IDS}" ]]; then
                print_info "No Docker images found"
            else
                IMAGE_COUNT=$(echo "${ALL_IMAGE_IDS}" | wc -l)
                log_warning "Found ${IMAGE_COUNT} image(s) to remove"

                if [[ "${DRY_RUN}" == "true" ]]; then
                    echo "Would remove all images:"
                    docker images
                else
                    docker rmi -f ${ALL_IMAGE_IDS} || log_warning "Some images could not be removed"
                    print_success "All Docker images removed"
                fi
            fi
        fi

        # Remove dangling images
        print_step "Removing dangling Docker images..."
        DANGLING=$(docker images -f "dangling=true" -q)

        if [[ -z "${DANGLING}" ]]; then
            print_info "No dangling images found"
        else
            if [[ "${DRY_RUN}" == "true" ]]; then
                echo "Would remove $(echo "${DANGLING}" | wc -l) dangling image(s)"
            else
                docker rmi ${DANGLING} || log_warning "Some dangling images could not be removed"
                print_success "Dangling images removed"
            fi
        fi

        # Prune Docker system
        if [[ "${PRUNE}" == "true" ]]; then
            print_step "Pruning Docker system (unused images, containers, networks, build cache)..."

            if [[ "${DRY_RUN}" == "true" ]]; then
                docker system df
                echo ""
                echo "Would run: docker system prune -a --volumes"
            else
                if [[ "${FORCE}" == "true" ]]; then
                    docker system prune -a --volumes -f
                else
                    docker system prune -a --volumes
                fi
                print_success "Docker system pruned"
            fi
        fi

        # Show remaining images
        echo ""
        print_step "Remaining Docker images:"
        docker images
        echo ""

        # Show disk usage
        print_step "Docker disk usage:"
        docker system df
        echo ""
    fi
fi

# =============================================================================
# K3s Cleanup
# =============================================================================

if [[ "${DOCKER_ONLY}" == "false" ]]; then
    print_header "K3s Cleanup"

    # Check if K3s is available
    if ! command_exists k3s; then
        log_warning "K3s not found - skipping K3s cleanup"
    else
        # List current images
        print_step "Current K3s containerd images:"
        sudo k3s ctr images ls | head -20
        echo "... (showing first 20)"
        echo ""

        # Count total images
        TOTAL_K3S_IMAGES=$(sudo k3s ctr images ls -q | wc -l)
        log_info "Total images in K3s: ${TOTAL_K3S_IMAGES}"
        echo ""

        # Remove Pentaho images
        if [[ "${PENTAHO_ONLY}" == "true" ]]; then
            print_step "Removing Pentaho images from K3s..."

            PENTAHO_K3S_IMAGES=$(sudo k3s ctr images ls -q | grep -i "${K3S_IMAGE_PATTERN}" || true)

            if [[ -z "${PENTAHO_K3S_IMAGES}" ]]; then
                print_info "No Pentaho images found in K3s"
            else
                IMAGE_COUNT=$(echo "${PENTAHO_K3S_IMAGES}" | wc -l)
                log_info "Found ${IMAGE_COUNT} Pentaho image(s) in K3s"

                if [[ "${DRY_RUN}" == "true" ]]; then
                    echo "Would remove:"
                    echo "${PENTAHO_K3S_IMAGES}"
                else
                    echo "${PENTAHO_K3S_IMAGES}" | while read -r image; do
                        log_info "Removing: ${image}"
                        sudo k3s ctr images rm "${image}" 2>/dev/null || log_warning "Failed to remove ${image}"
                    done
                    print_success "Pentaho images removed from K3s"
                fi
            fi
        fi

        # Remove ALL K3s images
        if [[ "${ALL_IMAGES}" == "true" ]]; then
            print_step "Removing ALL images from K3s..."
            log_error "WARNING: This will remove system images and break K3s!"
            log_error "K3s will need to re-download all images including CoreDNS, Traefik, etc."

            if [[ "${FORCE}" == "false" ]]; then
                echo ""
                read -r -p "Are you ABSOLUTELY sure? Type 'DELETE ALL' to confirm: " confirmation

                if [[ "${confirmation}" != "DELETE ALL" ]]; then
                    log_warning "K3s cleanup cancelled"
                else
                    ALL_K3S_IMAGES=$(sudo k3s ctr images ls -q)
                    IMAGE_COUNT=$(echo "${ALL_K3S_IMAGES}" | wc -l)

                    if [[ "${DRY_RUN}" == "true" ]]; then
                        echo "Would remove all ${IMAGE_COUNT} K3s images"
                    else
                        echo "${ALL_K3S_IMAGES}" | while read -r image; do
                            sudo k3s ctr images rm "${image}" 2>/dev/null || true
                        done
                        print_success "All K3s images removed"
                        log_warning "K3s will re-download system images on next pod creation"
                    fi
                fi
            fi
        fi

        # Clean K3s image cache
        if [[ "${PRUNE}" == "true" ]]; then
            print_step "Cleaning K3s containerd content store..."

            if [[ "${DRY_RUN}" == "true" ]]; then
                echo "Would clean K3s content store at /var/lib/rancher/k3s/agent/containerd"
            else
                log_info "Stopping K3s temporarily..."
                sudo systemctl stop k3s || log_warning "Could not stop K3s"

                log_info "Cleaning content database..."
                # Remove unused content
                sudo rm -rf /var/lib/rancher/k3s/agent/containerd/io.containerd.content.v1.content/blobs/* || true

                log_info "Starting K3s..."
                sudo systemctl start k3s || log_error "Failed to restart K3s"

                # Wait for K3s to be ready
                if wait_for "kubectl get nodes &>/dev/null" 30 "K3s to be ready"; then
                    print_success "K3s restarted successfully"
                else
                    log_error "K3s did not start properly - check with: sudo systemctl status k3s"
                fi
            fi
        fi

        # Show remaining images
        echo ""
        print_step "Remaining K3s images:"
        sudo k3s ctr images ls | head -20
        echo "... (showing first 20)"

        REMAINING_IMAGES=$(sudo k3s ctr images ls -q | wc -l)
        log_info "Total remaining images: ${REMAINING_IMAGES}"
        echo ""

        # Show disk usage
        print_step "K3s storage usage:"
        sudo du -sh /var/lib/rancher/k3s/agent/containerd 2>/dev/null || log_info "Could not check disk usage"
        echo ""
    fi
fi

# =============================================================================
# Summary
# =============================================================================

print_header "Cleanup Summary"

if [[ "${DRY_RUN}" == "true" ]]; then
    print_warning "DRY RUN MODE - No changes were made"
    echo "Run without --dry-run to actually delete images"
else
    print_success "Cleanup completed!"
fi

echo ""
echo "Next steps:"

if [[ "${PENTAHO_ONLY}" == "true" ]]; then
    echo "  1. Rebuild Pentaho image:"
    echo "     cd docker-build && ./build.sh"
    echo ""
    echo "  2. Load into K3s:"
    echo "     docker save pentaho/pentaho-server:11.0.0.0-237 | sudo k3s ctr images import -"
    echo ""
fi

if [[ "${ALL_IMAGES}" == "true" ]] || [[ "${PRUNE}" == "true" ]]; then
    echo "  1. Verify K3s is healthy:"
    echo "     ./scripts/verify-k3s.sh"
    echo ""
    echo "  2. Check system pods:"
    echo "     kubectl get pods -A"
    echo ""
fi

echo "  3. Check remaining disk usage:"
echo "     docker system df"
echo "     sudo du -sh /var/lib/rancher/k3s/agent/containerd"
echo ""

log_success "Done!"
