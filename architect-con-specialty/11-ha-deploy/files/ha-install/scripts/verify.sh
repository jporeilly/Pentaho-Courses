#!/usr/bin/env bash
# verify - implements section 5 of the bundled HA guide.
# DRAFT: seeded with the guide's core commands; review before running.
set -euo pipefail

echo ">> Guide 5: start order - db-01, app nodes, balancers"
echo ">> curl the VIP: expect the Pentaho login via HAProxy"
echo ">> failover: stop haproxy on lb-01 -> VIP moves to lb-02"
echo ">> stop app-01 tomcat -> balancer drains to app-02, session survives"
