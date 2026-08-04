#!/bin/bash
# =============================================================================
# Pentaho K3s Health Check Script
# =============================================================================
# Quick health check for Pentaho deployment
#
# Checks:
#   - Pod status (running and ready)
#   - Database connectivity
#   - Pentaho web application responsiveness
#   - Resource usage
#
# Usage: ./scripts/health-check.sh
#
# Exit codes:
#   0 - All checks passed
#   1 - One or more checks failed
# =============================================================================

set -euo pipefail

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

FAILED=0
PORT_FORWARD_PID=""

# Cleanup function for port-forward
cleanup_port_forward() {
    if [[ -n "${PORT_FORWARD_PID}" ]] && kill -0 "${PORT_FORWARD_PID}" 2>/dev/null; then
        log_debug "Cleaning up port-forward (PID: ${PORT_FORWARD_PID})"
        kill "${PORT_FORWARD_PID}" 2>/dev/null || true
        wait "${PORT_FORWARD_PID}" 2>/dev/null || true
    fi
}

# Register cleanup
register_cleanup cleanup_port_forward

echo -e "${BLUE}=============================================="
echo -e "  Pentaho K3s Health Check"
echo -e "==============================================${NC}\n"

# Check if namespace exists
echo -e "${YELLOW}Checking namespace...${NC}"
if kubectl get namespace $NAMESPACE &> /dev/null; then
    echo -e "${GREEN}✓ Namespace '$NAMESPACE' exists${NC}\n"
else
    echo -e "${RED}✗ Namespace '$NAMESPACE' not found${NC}\n"
    exit 1
fi

# Check pod status
echo -e "${YELLOW}Checking pod status...${NC}"
POSTGRES_READY=$(kubectl get pods -n $NAMESPACE -l app=postgres -o jsonpath='{.items[0].status.containerStatuses[0].ready}' 2>/dev/null || echo "false")
PENTAHO_READY=$(kubectl get pods -n $NAMESPACE -l app=pentaho-server -o jsonpath='{.items[0].status.containerStatuses[0].ready}' 2>/dev/null || echo "false")

if [ "$POSTGRES_READY" == "true" ]; then
    echo -e "${GREEN}✓ PostgreSQL pod is running and ready${NC}"
else
    echo -e "${RED}✗ PostgreSQL pod is not ready${NC}"
    FAILED=1
fi

if [ "$PENTAHO_READY" == "true" ]; then
    echo -e "${GREEN}✓ Pentaho Server pod is running and ready${NC}\n"
else
    echo -e "${RED}✗ Pentaho Server pod is not ready${NC}\n"
    FAILED=1
fi

# Check services
echo -e "${YELLOW}Checking services...${NC}"
if kubectl get svc postgres -n $NAMESPACE &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL service exists${NC}"
else
    echo -e "${RED}✗ PostgreSQL service not found${NC}"
    FAILED=1
fi

if kubectl get svc pentaho-server -n $NAMESPACE &> /dev/null; then
    echo -e "${GREEN}✓ Pentaho Server service exists${NC}\n"
else
    echo -e "${RED}✗ Pentaho Server service not found${NC}\n"
    FAILED=1
fi

# Check database connectivity
echo -e "${YELLOW}Checking database connectivity...${NC}"
if kubectl exec -n $NAMESPACE deployment/postgres -- psql -U postgres -c "SELECT 1" &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL is responding${NC}"

    # Check specific databases
    for db in jackrabbit quartz hibernate; do
        if kubectl exec -n $NAMESPACE deployment/postgres -- psql -U postgres -lqt | cut -d \| -f 1 | grep -qw $db; then
            echo -e "${GREEN}✓ Database '$db' exists${NC}"
        else
            echo -e "${RED}✗ Database '$db' not found${NC}"
            FAILED=1
        fi
    done
    echo ""
else
    echo -e "${RED}✗ Cannot connect to PostgreSQL${NC}\n"
    FAILED=1
fi

# Check Pentaho web application
echo -e "${YELLOW}Checking Pentaho web application...${NC}"

# Find an available port for port-forward
LOCAL_PORT=$(find_available_port 8080)
if [[ -z "${LOCAL_PORT}" ]]; then
    echo -e "${YELLOW}⚠ Cannot find available port for testing - skipping web application check${NC}\n"
else
    # Start port-forward in background
    kubectl port-forward -n "${NAMESPACE}" svc/pentaho-server "${LOCAL_PORT}":8080 > /dev/null 2>&1 &
    PORT_FORWARD_PID=$!

    # Wait for port-forward to be ready (with timeout)
    READY=false
    for i in {1..10}; do
        if lsof -i ":${LOCAL_PORT}" &> /dev/null || netstat -tuln 2>/dev/null | grep -q ":${LOCAL_PORT} "; then
            READY=true
            break
        fi
        sleep 0.5
    done

    if [[ "${READY}" == "false" ]]; then
        echo -e "${YELLOW}⚠ Port-forward did not start in time - skipping web application check${NC}\n"
        FAILED=1
    else
        # Test HTTP endpoint
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${LOCAL_PORT}/pentaho/Login" 2>/dev/null || echo "000")

        if [[ "${HTTP_CODE}" == "200" ]]; then
            echo -e "${GREEN}✓ Pentaho login page is accessible (HTTP ${HTTP_CODE})${NC}\n"
        else
            echo -e "${RED}✗ Pentaho login page returned HTTP ${HTTP_CODE}${NC}\n"
            FAILED=1
        fi
    fi

    # Cleanup is handled by cleanup_port_forward function
fi

# Show resource usage
echo -e "${YELLOW}Resource usage:${NC}"
kubectl top pods -n $NAMESPACE 2>/dev/null || echo -e "${YELLOW}(Metrics server not available)${NC}"
echo ""

# Summary
echo -e "${BLUE}=============================================="
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}  ✓ All health checks passed!"
    echo -e "${BLUE}==============================================${NC}\n"
    echo -e "Access Pentaho at: ${GREEN}http://localhost:8080/pentaho${NC}"
    echo -e "Port-forward command: ${BLUE}kubectl port-forward -n pentaho svc/pentaho-server 8080:8080${NC}\n"
    exit 0
else
    echo -e "${RED}  ✗ Some health checks failed"
    echo -e "${BLUE}==============================================${NC}\n"
    echo -e "Run for details: ${YELLOW}kubectl get all -n pentaho${NC}"
    echo -e "Check logs: ${YELLOW}kubectl logs -n pentaho deployment/pentaho-server${NC}\n"
    exit 1
fi
