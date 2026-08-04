#!/usr/bin/env bash
# node-setup - implements section 3 of the bundled HA guide.
# DRAFT: seeded with the guide's core commands; review before running.
set -euo pipefail

sudo apt update
sudo apt install -y openjdk-11-jdk

echo ">> Guide 3.2: pentaho system user + /opt/pentaho layout"
echo ">> Guide 3.3: extract the EE archive (staged by you - licensed)"
echo ">> Guide 3.4: PostgreSQL JDBC driver into tomcat/lib"
echo ">> Guide 3.5: context.xml JNDI data sources -> db-01"
echo ">> Guide 3.6-3.7: Jackrabbit PostgreSQL + cluster journal, unique rep.cluster.id"
echo ">> Guide 3.8: hibernate-settings -> postgresql"
echo ">> Guide 3.9: quartz.properties - instanceId AUTO, isClustered true, 20s check-in"
echo ">> Guide 3.10: fully-qualified-server-url = the VIP"
echo ">> Guide 3.11: disable DSW data source caching"
