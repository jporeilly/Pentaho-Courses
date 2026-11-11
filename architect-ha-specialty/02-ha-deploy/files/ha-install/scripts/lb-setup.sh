#!/usr/bin/env bash
# lb-setup - implements section 4 of the bundled HA guide.
# DRAFT: seeded with the guide's core commands; review before running.
set -euo pipefail

sudo apt update
sudo apt install -y haproxy keepalived

echo ">> Guide 4: haproxy.cfg - frontend on the VIP, backend both app nodes,"
echo "   cookie-based sticky sessions, health checks, stats page (admin-only)"
echo ">> Guide 4: keepalived.conf - VRRP MASTER/BACKUP, the virtual IP"
sudo systemctl enable --now haproxy keepalived
