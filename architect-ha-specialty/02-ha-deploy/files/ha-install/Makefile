# Pentaho HA install driver - each target implements a section of the
# bundled Pentaho-HA-Installation-Guide.md. Draft scaffold: the
# scripts echo the guide's steps; harden against your environment
# before production use.
GUIDE = Pentaho-HA-Installation-Guide.md

.PHONY: help db-setup node-setup lb-setup carte-setup verify

help:
	@echo "Pentaho HA install targets (guide section in brackets):"
	@echo "  make db-setup     [2] PostgreSQL 14 repository on db-01"
	@echo "  make node-setup   [3] Pentaho Server on THIS app node"
	@echo "  make lb-setup     [4] HAProxy + Keepalived on THIS balancer"
	@echo "  make carte-setup  [6] Carte cluster on THIS app node"
	@echo "  make verify       [5] start order + failover checks"

db-setup:
	bash scripts/db-setup.sh

node-setup:
	bash scripts/node-setup.sh

lb-setup:
	bash scripts/lb-setup.sh

carte-setup:
	bash scripts/carte-setup.sh

verify:
	bash scripts/verify.sh
