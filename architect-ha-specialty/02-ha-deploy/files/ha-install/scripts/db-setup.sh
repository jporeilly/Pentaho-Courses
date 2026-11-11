#!/usr/bin/env bash
# db-setup - implements section 2 of the bundled HA guide.
# DRAFT: seeded with the guide's core commands; review before running.
set -euo pipefail

sudo apt update
sudo apt install -y postgresql-14 postgresql-client-14
sudo systemctl enable --now postgresql

echo ">> Guide 2.2: pg_hba.conf - local md5 + entries for both app nodes"
echo ">> Guide 2.3: postgresql.conf - listen_addresses for db-01's IP"
echo ">> Guide 2.4: create the five databases and users"
echo ">> Guide 2.5: run the DDL scripts (jcr, quartz, repository, logging, mart)"
echo "   (see the bundled guide for the exact SQL and paths)"
