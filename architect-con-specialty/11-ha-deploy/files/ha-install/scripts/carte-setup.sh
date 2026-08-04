#!/usr/bin/env bash
# carte-setup - implements section 6 of the bundled HA guide.
# DRAFT: seeded with the guide's core commands; review before running.
set -euo pipefail

echo ">> Guide 6: carte-config on each app node - master + slaves,"
echo "   credentials, and the cluster schema the PDI jobs target"
