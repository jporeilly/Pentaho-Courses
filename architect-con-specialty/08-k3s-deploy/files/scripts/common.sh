#!/bin/bash
# =============================================================================
# Common Functions and Variables for Pentaho K3s Scripts
# =============================================================================
# This file provides shared functionality used across all Pentaho K3s scripts.
# Source this file at the beginning of other scripts with:
#   source "$(dirname "$0")/common.sh"
# or:
#   source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
#
# Provides:
#   - Standardized color codes (terminal-aware)
#   - Common configuration variables
#   - Utility functions for logging and display
#   - Progress indicators
#   - Error handling helpers
# =============================================================================

# =============================================================================
# Configuration Variables
# =============================================================================
NAMESPACE="${NAMESPACE:-pentaho}"
MAX_POSTGRES_CONNECTIONS="${MAX_POSTGRES_CONNECTIONS:-50}"
MIN_CACHE_HIT_RATIO="${MIN_CACHE_HIT_RATIO:-90}"

# =============================================================================
# Color Definitions (Terminal-Aware)
# =============================================================================
# Only use colors if output is to a terminal
# This prevents ANSI codes in log files when output is redirected
if [[ -t 1 ]]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    CYAN='\033[0;36m'
    BOLD='\033[1m'
    NC='\033[0m'  # No Color
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
# Logging Functions
# =============================================================================

log_info() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" >&2
}

log_debug() {
    if [[ "${DEBUG:-false}" == "true" ]] || [[ "${VERBOSE:-false}" == "true" ]]; then
        echo -e "${BLUE}[DEBUG $(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" >&2
    fi
}

# =============================================================================
# Display Functions
# =============================================================================

print_header() {
    if [[ "${QUIET:-false}" != "true" ]]; then
        echo ""
        echo -e "${BOLD}${BLUE}=============================================="
        echo -e "  $1"
        echo -e "==============================================${NC}"
        echo ""
    fi
}

print_step() {
    if [[ "${QUIET:-false}" != "true" ]]; then
        echo -e "${YELLOW}$1${NC}"
    fi
}

print_success() {
    if [[ "${QUIET:-false}" != "true" ]]; then
        echo -e "${GREEN}✓${NC} $1"
    fi
}

print_error() {
    echo -e "${RED}✗${NC} $1" >&2
}

print_warning() {
    if [[ "${QUIET:-false}" != "true" ]]; then
        echo -e "${YELLOW}⚠${NC} $1"
    fi
}

print_info() {
    if [[ "${QUIET:-false}" != "true" ]]; then
        echo -e "${BLUE}ℹ${NC} $1"
    fi
}

# =============================================================================
# Progress Indicators
# =============================================================================

# Start a spinner for long-running operations
# Usage: start_spinner "Loading..."
#        ... long operation ...
#        stop_spinner $?
start_spinner() {
    local message="${1:-Working...}"

    # Don't show spinner if not a terminal or in quiet mode
    if [[ ! -t 1 ]] || [[ "${QUIET:-false}" == "true" ]]; then
        echo "$message"
        return
    fi

    # Start spinner in background
    {
        local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
        local i=0
        while true; do
            i=$(( (i+1) %10 ))
            printf "\r${CYAN}${spin:$i:1}${NC} %s" "$message"
            sleep 0.1
        done
    } &

    SPINNER_PID=$!
    disown
}

stop_spinner() {
    local exit_code=${1:-0}

    if [[ -n "${SPINNER_PID:-}" ]] && kill -0 "$SPINNER_PID" 2>/dev/null; then
        kill "$SPINNER_PID" 2>/dev/null
        wait "$SPINNER_PID" 2>/dev/null
    fi

    # Clear the spinner line
    if [[ -t 1 ]]; then
        printf "\r\033[K"
    fi

    unset SPINNER_PID
    return "$exit_code"
}

# Show progress dots for operations
# Usage: some_command & show_progress $!
show_progress() {
    local pid=$1
    local delay=1

    if [[ ! -t 1 ]] || [[ "${QUIET:-false}" == "true" ]]; then
        wait "$pid"
        return $?
    fi

    while kill -0 "$pid" 2>/dev/null; do
        echo -n "."
        sleep "$delay"
    done

    wait "$pid"
    local exit_code=$?
    echo ""
    return "$exit_code"
}

# =============================================================================
# Validation Functions
# =============================================================================

# Check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Check if a Kubernetes namespace exists
namespace_exists() {
    local ns="${1:-$NAMESPACE}"
    kubectl get namespace "$ns" &> /dev/null
}

# Check if a pod is running
pod_is_running() {
    local label="$1"
    local ns="${2:-$NAMESPACE}"
    local phase
    phase=$(kubectl get pod -l "$label" -n "$ns" -o jsonpath='{.items[0].status.phase}' 2>/dev/null)
    [[ "$phase" == "Running" ]]
}

# Check if a pod is ready
pod_is_ready() {
    local label="$1"
    local ns="${2:-$NAMESPACE}"
    local ready
    ready=$(kubectl get pod -l "$label" -n "$ns" -o jsonpath='{.items[0].status.containerStatuses[0].ready}' 2>/dev/null)
    [[ "$ready" == "true" ]]
}

# Get pod name by label
get_pod_name() {
    local label="$1"
    local ns="${2:-$NAMESPACE}"
    kubectl get pod -l "$label" -n "$ns" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null
}

# =============================================================================
# Retry Logic
# =============================================================================

# Retry a command with exponential backoff
# Usage: retry 5 kubectl get pods
retry() {
    local max_attempts=$1
    shift
    local attempt=1
    local delay=1

    while [[ $attempt -le $max_attempts ]]; do
        if "$@"; then
            return 0
        fi

        if [[ $attempt -lt $max_attempts ]]; then
            log_debug "Attempt $attempt/$max_attempts failed. Retrying in ${delay}s..."
            sleep "$delay"
            delay=$((delay * 2))
        fi

        attempt=$((attempt + 1))
    done

    log_error "Command failed after $max_attempts attempts: $*"
    return 1
}

# Wait for a condition with timeout
# Usage: wait_for "pod_is_ready app=postgres" 60 "PostgreSQL to be ready"
wait_for() {
    local condition="$1"
    local timeout="${2:-60}"
    local description="${3:-condition}"
    local elapsed=0
    local interval=2

    log_info "Waiting for $description (timeout: ${timeout}s)..."

    while [[ $elapsed -lt $timeout ]]; do
        if eval "$condition"; then
            print_success "$description"
            return 0
        fi

        sleep "$interval"
        elapsed=$((elapsed + interval))

        if [[ $((elapsed % 10)) -eq 0 ]] && [[ "${VERBOSE:-false}" == "true" ]]; then
            log_debug "Still waiting... (${elapsed}s/${timeout}s)"
        fi
    done

    print_error "Timeout waiting for $description after ${timeout}s"
    return 1
}

# =============================================================================
# Cleanup Handlers
# =============================================================================

# Register cleanup function to run on exit
# Usage: register_cleanup my_cleanup_function
declare -a CLEANUP_FUNCTIONS=()

register_cleanup() {
    CLEANUP_FUNCTIONS+=("$1")
}

run_cleanup() {
    for cleanup_func in "${CLEANUP_FUNCTIONS[@]}"; do
        log_debug "Running cleanup: $cleanup_func"
        eval "$cleanup_func" || true
    done
}

# Set up trap for cleanup on exit
trap run_cleanup EXIT INT TERM

# =============================================================================
# Port Management
# =============================================================================

# Check if a port is in use
port_is_available() {
    local port=$1
    ! lsof -i ":$port" &> /dev/null && ! netstat -tuln 2>/dev/null | grep -q ":$port "
}

# Find an available port starting from a base port
find_available_port() {
    local base_port=${1:-8080}
    local max_attempts=${2:-10}
    local port=$base_port

    for ((i=0; i<max_attempts; i++)); do
        if port_is_available "$port"; then
            echo "$port"
            return 0
        fi
        port=$((base_port + i + 1))
    done

    return 1
}

# =============================================================================
# JSON Output Support
# =============================================================================

# Initialize JSON output
json_output_init() {
    if [[ "${JSON_OUTPUT:-false}" == "true" ]]; then
        echo "{"
        echo "  \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\","
        echo "  \"script\": \"$(basename "$0")\","
    fi
}

# Add JSON field
json_output_field() {
    if [[ "${JSON_OUTPUT:-false}" == "true" ]]; then
        local key="$1"
        local value="$2"
        local comma="${3:-,}"
        echo "  \"$key\": \"$value\"$comma"
    fi
}

# Close JSON output
json_output_close() {
    if [[ "${JSON_OUTPUT:-false}" == "true" ]]; then
        echo "}"
    fi
}

# =============================================================================
# Kubernetes Helper Functions
# =============================================================================

# Get node IP
get_node_ip() {
    kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}' 2>/dev/null
}

# Get service endpoint
get_service_endpoint() {
    local service="$1"
    local ns="${2:-$NAMESPACE}"
    local port="${3:-}"

    local cluster_ip
    cluster_ip=$(kubectl get svc "$service" -n "$ns" -o jsonpath='{.spec.clusterIP}' 2>/dev/null)

    if [[ -n "$port" ]]; then
        echo "${cluster_ip}:${port}"
    else
        echo "$cluster_ip"
    fi
}

# Check if metrics-server is available
metrics_available() {
    kubectl top nodes &> /dev/null
}

# =============================================================================
# Database Helper Functions
# =============================================================================

# Execute SQL command in PostgreSQL pod
pg_exec() {
    local sql="$1"
    local database="${2:-postgres}"
    local user="${3:-postgres}"
    local ns="${4:-$NAMESPACE}"

    local pod
    pod=$(get_pod_name "app=postgres" "$ns")

    if [[ -z "$pod" ]]; then
        log_error "PostgreSQL pod not found"
        return 1
    fi

    kubectl exec "$pod" -n "$ns" -- psql -U "$user" -d "$database" -t -c "$sql" 2>/dev/null
}

# Check if PostgreSQL database exists
pg_database_exists() {
    local database="$1"
    local ns="${2:-$NAMESPACE}"

    local result
    result=$(pg_exec "SELECT 1 FROM pg_database WHERE datname='$database'" "postgres" "postgres" "$ns" | tr -d ' \n')
    [[ "$result" == "1" ]]
}

# =============================================================================
# Version Detection
# =============================================================================

# Get Kubernetes server version
k8s_version() {
    kubectl version --short 2>/dev/null | grep "Server Version" | awk '{print $3}'
}

# Get K3s version
k3s_version() {
    k3s --version 2>/dev/null | head -n 1 | awk '{print $3}'
}

# =============================================================================
# Initialization
# =============================================================================

# Export all functions so they can be used by sourcing scripts
export -f log_info log_success log_warning log_error log_debug
export -f print_header print_step print_success print_error print_warning print_info
export -f start_spinner stop_spinner show_progress
export -f command_exists namespace_exists pod_is_running pod_is_ready get_pod_name
export -f retry wait_for
export -f register_cleanup run_cleanup
export -f port_is_available find_available_port
export -f json_output_init json_output_field json_output_close
export -f get_node_ip get_service_endpoint metrics_available
export -f pg_exec pg_database_exists
export -f k8s_version k3s_version
