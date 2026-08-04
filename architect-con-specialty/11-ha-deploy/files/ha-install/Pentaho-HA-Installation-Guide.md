Pentaho Server
High Availability Installation Guide
Ubuntu Linux 22.04 LTS  •  HAProxy Load Balancer  •  PostgreSQL Repository  •  Carte Clustering  •  Tray.io Integration
Version
Pentaho Server 10.x (Enterprise Edition)
Platform
Ubuntu Linux 22.04 LTS (Jammy)
Document Status
Reference / Installation Guide
Last Updated
March 2026
# 1. Architecture Overview
This guide provides step-by-step instructions for deploying Pentaho Server in a production-grade High Availability (HA) cluster on Ubuntu Linux 22.04 LTS. The architecture uses two Pentaho application nodes behind an HAProxy load balancer pair with Keepalived Virtual IP failover, a shared PostgreSQL repository, Jackrabbit JCR cluster journaling, and Quartz distributed scheduling. A dedicated section covers Carte clustering for PDI execution HA, and integration with Tray.io as an external workflow orchestrator.
## 1.1 HA Topology — Server Roles
The reference topology below uses the following server roles and IP addresses. Adjust to match your environment.
Role / Host
IP / Description
pentaho-node-01 (10.0.1.10)
Pentaho Server Node 1 — Tomcat + Pentaho WAR
pentaho-node-02 (10.0.1.11)
Pentaho Server Node 2 — identical config except unique Jackrabbit Cluster ID
lb-01 (10.0.1.20)
HAProxy primary load balancer + Keepalived MASTER
lb-02 (10.0.1.21)
HAProxy secondary load balancer + Keepalived BACKUP
VIP (10.0.1.100)
Keepalived Virtual IP — the client-facing address for all traffic
db-01 (10.0.1.30)
PostgreSQL 14 — Jackrabbit, Quartz, Hibernate; also hosts local FlexNet License Server
carte-master (10.0.1.40)
Carte master server — PDI execution orchestration
carte-slave-01 (10.0.1.41)
Carte slave worker node 1
carte-slave-02 (10.0.1.42)
Carte slave worker node 2
Figure 1 — Full HA Architecture: Clients → Keepalived VIP → HAProxy (lb-01/lb-02) → Pentaho Nodes → PostgreSQL + FlexNet Licensing + Carte Cluster. Tray.io calls the Carte REST API for event-driven ETL.
## 1.2 Key Architecture Rules
Before proceeding, understand these mandatory constraints for a working cluster:
All Pentaho application nodes must have IDENTICAL configuration files — the only permitted difference is the Jackrabbit Cluster ID (unique per node).
All nodes and load balancers must be NTP-synchronised. Mismatched system clocks corrupt Quartz execution timestamps.
Run exactly one Pentaho Server node per physical/virtual machine (or NIC). Running multiple nodes per machine provides no load balancing or failover benefit.
Only the pentaho and pentaho-style WARs are supported for cluster deployment. Do not cluster other WARs.
A single shared repository is mandatory — all nodes point to the same PostgreSQL instance.
Sticky sessions must be enabled on the load balancer. Pentaho sessions are not replicated between nodes.
The Pentaho Repository (PostgreSQL) must always be started BEFORE any Pentaho Server node.
## 1.3 Required Firewall Ports
Port
Protocol / Purpose
8080
TCP — Pentaho Tomcat HTTP — between load balancers and app nodes
80 / 443
TCP — HAProxy frontend — client-facing
5432
TCP — PostgreSQL — between app nodes and db-01
7070
TCP — FlexNet License Server — between app nodes and license server
9001
TCP — Carte master
9002
TCP — Carte slave-01
9003
TCP — Carte slave-02
112 (VRRP)
IP protocol 112 — Keepalived heartbeat between lb-01 and lb-02
8888
TCP — HAProxy stats page (restrict to admin IPs in production)
## 1.4 Prerequisites
Before starting, ensure the following prerequisites are met on all nodes:
Ubuntu 22.04 LTS installed on all servers with latest patches applied
Oracle OpenJDK 11 or 17 installed and JAVA_HOME set — Pentaho 10.2 is certified on both
NTP or chrony configured and synchronised on all servers
PostgreSQL 14+ installed and accessible on db-01
Firewall rules in place as per Section 1.3
One node per physical/virtual machine (or NIC)
Root or sudo access on all servers
Pentaho Enterprise Edition archive downloaded from the Hitachi Vantara Support Portal: https://support.pentaho.com
PostgreSQL JDBC driver downloaded from: https://jdbc.postgresql.org/download/
📎 Source: Pentaho Docs: Archive Installation Overview
📎 Source: Pentaho Docs: Set Up a Cluster (10.2)
# 2. PostgreSQL Repository Configuration  (db-01)
The shared PostgreSQL instance must be installed and running before any Pentaho application node is started. It hosts three databases required by Pentaho: Jackrabbit (JCR content repository), Quartz (job scheduler), and Hibernate (platform metadata). A fourth optional database, Pentaho Operations Mart, provides monitoring and audit data.
## 2.1 Install PostgreSQL 14 on db-01
sudo apt update &amp;&amp; sudo apt upgrade -y
# Install PostgreSQL 14 (available in Ubuntu 22.04 default repos)
sudo apt install -y postgresql postgresql-contrib
# Verify
psql --version
# Enable and start
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo systemctl status postgresql
📌 NOTE: To use PostgreSQL 15 (not in Ubuntu 22.04 default repos), add the official PostgreSQL APT repository: curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /usr/share/keyrings/postgresql.gpg and add the apt source before installing.
## 2.2 Configure Authentication (pg_hba.conf)
The default 'peer' authentication method blocks TCP connections from remote nodes. Edit pg_hba.conf to use md5 for all Pentaho connections.
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Find the 'local' line and change 'peer' to 'md5':
local   all             all                                     md5
# Add entries for both Pentaho app nodes (adjust IPs as needed):
host    all             all             10.0.1.10/32            md5
host    all             all             10.0.1.11/32            md5
# Restart to apply:
sudo systemctl restart postgresql
## 2.3 Configure Remote Listening (postgresql.conf)
sudo nano /etc/postgresql/14/main/postgresql.conf
# Allow connections on db-01's IP and localhost:
listen_addresses = '10.0.1.30,localhost'
# Recommended production tuning (adjust for your server RAM):
max_connections      = 200
shared_buffers       = 1GB
effective_cache_size = 3GB
work_mem             = 16MB
maintenance_work_mem = 256MB
# Restart to apply
sudo systemctl restart postgresql
## 2.4 Create Pentaho Databases and Users
Pentaho uses three separate database users for security separation: jcr_user for Jackrabbit, pentaho_user for Quartz, and hibuser for Hibernate.
sudo -u postgres psql
-- Jackrabbit (JCR content repository)
CREATE DATABASE jackrabbit ENCODING 'UTF8' TEMPLATE template0;
CREATE USER jcr_user WITH PASSWORD 'Str0ngPassw0rd!';
GRANT ALL PRIVILEGES ON DATABASE jackrabbit TO jcr_user;
-- Quartz (job scheduler)
CREATE DATABASE quartz ENCODING 'UTF8' TEMPLATE template0;
CREATE USER pentaho_user WITH PASSWORD 'Str0ngPassw0rd!';
GRANT ALL PRIVILEGES ON DATABASE quartz TO pentaho_user;
-- Hibernate (platform metadata and audit)
CREATE DATABASE hibernate ENCODING 'UTF8' TEMPLATE template0;
CREATE USER hibuser WITH PASSWORD 'Str0ngPassw0rd!';
GRANT ALL PRIVILEGES ON DATABASE hibernate TO hibuser;
-- Verify:
\l
\du
\q
⚠️  WARNING: Use TEMPLATE template0 when creating these databases to ensure a clean encoding baseline. The default template1 may carry local encoding settings that interfere with Pentaho's DDL scripts.
## 2.5 Run Pentaho DDL Initialisation Scripts
The Pentaho archive includes SQL scripts in the data/postgresql/ directory. Extract the archive on one node first (Section 3.4), then run these scripts. Run them exactly once — both nodes share the same database.
# Scripts are in the extracted archive:
cd /opt/pentaho/server/pentaho-server/data/postgresql/
# Optional: change passwords in the scripts before running
# (if you used different passwords in Section 2.4, update them here)
# Initialise Jackrabbit (JCR)
psql -h 10.0.1.30 -U jcr_user -d jackrabbit \
-f create_jcr_postgresql.sql
# Initialise Quartz
psql -h 10.0.1.30 -U pentaho_user -d quartz \
-f create_quartz_postgresql.sql
# Initialise Hibernate (repository)
psql -h 10.0.1.30 -U hibuser -d hibernate \
-f create_repository_postgresql.sql
# Optional: Pentaho Operations Mart (audit / monitoring)
psql -h 10.0.1.30 -U hibuser -d hibernate \
-f pentaho_mart_postgresql.sql
⚠️  WARNING: Run DDL scripts only ONCE from a single node. Do NOT run them again on node-02. Both nodes use the same shared database — re-running will destroy existing data.
📌 NOTE: Use ASCII character set when running these scripts. Do not use UTF-8 — text string length limitations may cause script failures.
📎 Source: Pentaho Docs: Use PostgreSQL as Repository Database
📎 Source: TenthPlanet: Clustering PBA with PostgreSQL
# 3. Pentaho Server Installation (Both Nodes)
Perform the following steps on pentaho-node-01 first, verify it works, then repeat identically on pentaho-node-02. Configuration files must be identical on both nodes except for the unique Jackrabbit cluster ID.
## 3.1 Install Java (JDK 11)
sudo apt update
sudo apt install -y openjdk-11-jdk
# Verify
java -version
# Set JAVA_HOME permanently in /etc/environment
echo 'JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64' | sudo tee -a /etc/environment
echo 'PATH=$PATH:$JAVA_HOME/bin' | sudo tee -a /etc/environment
source /etc/environment
echo $JAVA_HOME
📌 NOTE: Pentaho 10.2 is certified on Oracle OpenJDK and JRE versions 11 and 17. Both are supported. Do not use JDK 8 or JDK 21 — only 11 and 17 are supported.
📎 Source: Pentaho Academy: Prepare Environment (Pentaho 10)
## 3.2 Create Pentaho System User and Directory Structure
Pentaho recommends creating a dedicated pentaho system user and a specific directory layout. This isolates Pentaho files and makes permission management easier.
# Create a dedicated pentaho system user with home at /opt/pentaho
sudo useradd -m -d /opt/pentaho -s /bin/bash pentaho
sudo passwd pentaho
# Add to sudo for initial setup (can be removed post-install)
sudo usermod -aG sudo pentaho
# Create the Pentaho-recommended directory layout:
sudo mkdir -p /opt/pentaho/server
sudo mkdir -p /opt/pentaho/.pentaho
sudo mkdir -p /opt/pentaho/software/server
sudo mkdir -p /opt/pentaho/software/db_drivers
# Set ownership
sudo chown -R pentaho:pentaho /opt/pentaho
📎 Source: Pentaho Docs: Create Linux Directory Structure
## 3.3 Download and Extract Pentaho Server Archive
Download the Pentaho Enterprise Edition archive from the Hitachi Vantara Support Portal and copy it to the server. Use the jar utility (bundled with Java) to extract — it is more reliable than unzip for large Pentaho archives.
# Switch to pentaho user for all remaining steps
sudo su - pentaho
# Copy the archive to the software staging directory
cp ~/pentaho-server-ee-10.2.0.0-222.zip /opt/pentaho/software/server/
# Extract using the jar utility (recommended by Pentaho Academy)
cd /opt/pentaho/server
jar -xvf /opt/pentaho/software/server/pentaho-server-ee-10.2.0.0-222.zip
# Make ALL .sh scripts executable (critical step — scripts will fail otherwise)
find /opt/pentaho/server -iname "*.sh" -exec bash -c 'chmod +x "$0"' {} \;
# Verify the directory structure
ls /opt/pentaho/server/pentaho-server/
📎 Source: Pentaho Academy: Install Pentaho Server (10.x)
## 3.4 Install JDBC Drivers
Pentaho cannot redistribute PostgreSQL JDBC drivers due to licensing restrictions — you must download and install them manually. Remove any older bundled driver to avoid version conflicts.
# Download PostgreSQL JDBC 42.x driver
wget -O /opt/pentaho/software/db_drivers/postgresql-42.7.3.jar \
https://jdbc.postgresql.org/download/postgresql-42.7.3.jar
# Remove any older bundled PostgreSQL driver
rm -f /opt/pentaho/server/pentaho-server/tomcat/lib/postgresql-*.jar
# Copy to Tomcat lib directory (used by context.xml JNDI resources)
cp /opt/pentaho/software/db_drivers/postgresql-42.7.3.jar \
/opt/pentaho/server/pentaho-server/tomcat/lib/
# Also copy to jdbc-distribution
cp /opt/pentaho/software/db_drivers/postgresql-42.7.3.jar \
/opt/pentaho/server/pentaho-server/jdbc-distribution/
📎 Source: PostgreSQL JDBC Downloads
## 3.5 Configure JDBC/JNDI Data Sources (context.xml)
The context.xml file defines JNDI data sources that connect Pentaho to the PostgreSQL repository databases. Also add an Audit resource which uses the same Hibernate database.
nano /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/META-INF/context.xml
Replace the entire file contents with the following configuration:
&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;Context path="/pentaho" docbase="webapps/pentaho/"&gt;
&lt;!-- Jackrabbit JCR Repository --&gt;
&lt;Resource name="jdbc/jackrabbit"
auth="Container"
type="javax.sql.DataSource"
factory="org.apache.tomcat.jdbc.pool.DataSourceFactory"
driverClassName="org.postgresql.Driver"
url="jdbc:postgresql://10.0.1.30:5432/jackrabbit"
username="jcr_user"
password="Str0ngPassw0rd!"
initialSize="0"
maxActive="20"
maxIdle="5"
maxWait="10000"
validationQuery="select 1"/&gt;
&lt;!-- Hibernate (platform metadata) --&gt;
&lt;Resource name="jdbc/Hibernate"
auth="Container"
type="javax.sql.DataSource"
factory="org.apache.tomcat.jdbc.pool.DataSourceFactory"
driverClassName="org.postgresql.Driver"
url="jdbc:postgresql://10.0.1.30:5432/hibernate"
username="hibuser"
password="Str0ngPassw0rd!"
initialSize="0"
maxActive="20"
maxIdle="5"
maxWait="10000"
validationQuery="select 1"/&gt;
&lt;!-- Audit (uses Hibernate DB) --&gt;
&lt;Resource name="jdbc/Audit"
auth="Container"
type="javax.sql.DataSource"
factory="org.apache.tomcat.jdbc.pool.DataSourceFactory"
driverClassName="org.postgresql.Driver"
url="jdbc:postgresql://10.0.1.30:5432/hibernate"
username="hibuser"
password="Str0ngPassw0rd!"
initialSize="0"
maxActive="20"
maxIdle="5"
maxWait="10000"
validationQuery="select 1"/&gt;
&lt;!-- Quartz Scheduler --&gt;
&lt;Resource name="jdbc/Quartz"
auth="Container"
type="javax.sql.DataSource"
factory="org.apache.tomcat.jdbc.pool.DataSourceFactory"
driverClassName="org.postgresql.Driver"
url="jdbc:postgresql://10.0.1.30:5432/quartz"
username="pentaho_user"
password="Str0ngPassw0rd!"
initialSize="0"
maxActive="20"
maxIdle="5"
maxWait="10000"
validationQuery="select 1"/&gt;
&lt;/Context&gt;
📌 NOTE: The Audit resource is required by some Pentaho components. It points to the same Hibernate database as jdbc/Hibernate.
📎 Source: GitHub: Pentaho Server PostgreSQL context.xml reference
Figure 2 — Shared Repository Architecture: Both nodes share a single PostgreSQL instance via JDBC. Jackrabbit journal sync (CL_J_GLOBAL_REVISION table) keeps JCR content consistent. Quartz coordinates scheduled jobs via QRTZ5_SCHEDULER_STATE. Config files are identical on both nodes except the Jackrabbit Cluster ID.
## 3.6 Configure Jackrabbit repository.xml for PostgreSQL and Clustering
The repository.xml file controls Jackrabbit's persistence. It ships with commented-out blocks for multiple databases — you must enable the PostgreSQL blocks and comment out all others (MySQL, Oracle, MS SQL Server). The file is large; make a backup first.
# Make a backup before editing
cp /opt/pentaho/server/pentaho-server/pentaho-solutions/system/jackrabbit/repository.xml \
/opt/pentaho/server/pentaho-server/pentaho-solutions/system/jackrabbit/repository.xml.bak
nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/jackrabbit/repository.xml
In repository.xml, there are multiple sections each with database-specific blocks. Enable the PostgreSQL block and comment out all other database blocks in EACH of the following sections:
&lt;!-- ===== 1. REPOSITORY FileSystem ===== --&gt;
&lt;FileSystem class="org.apache.jackrabbit.core.fs.db.DbFileSystem"&gt;
&lt;param name="driver" value="javax.naming.InitialContext"/&gt;
&lt;param name="url" value="java:comp/env/jdbc/jackrabbit"/&gt;
&lt;param name="schema" value="postgresql"/&gt;
&lt;param name="schemaObjectPrefix" value="fs_repos_"/&gt;
&lt;/FileSystem&gt;
&lt;!-- ===== 2. WORKSPACE FileSystem ===== --&gt;
&lt;FileSystem class="org.apache.jackrabbit.core.fs.db.DbFileSystem"&gt;
&lt;param name="driver" value="javax.naming.InitialContext"/&gt;
&lt;param name="url" value="java:comp/env/jdbc/jackrabbit"/&gt;
&lt;param name="schema" value="postgresql"/&gt;
&lt;param name="schemaObjectPrefix" value="fs_ws_"/&gt;
&lt;/FileSystem&gt;
&lt;!-- ===== 3. WORKSPACE PersistenceManager ===== --&gt;
&lt;PersistenceManager
class="org.apache.jackrabbit.core.persistence.bundle.PostgreSQLPersistenceManager"&gt;
&lt;param name="driver" value="javax.naming.InitialContext"/&gt;
&lt;param name="url" value="java:comp/env/jdbc/jackrabbit"/&gt;
&lt;param name="schema" value="postgresql"/&gt;
&lt;param name="schemaObjectPrefix" value="${wsp.name}_pm_ws_"/&gt;
&lt;/PersistenceManager&gt;
&lt;!-- ===== 4. VERSIONING FileSystem ===== --&gt;
&lt;FileSystem class="org.apache.jackrabbit.core.fs.db.DbFileSystem"&gt;
&lt;param name="driver" value="javax.naming.InitialContext"/&gt;
&lt;param name="url" value="java:comp/env/jdbc/jackrabbit"/&gt;
&lt;param name="schema" value="postgresql"/&gt;
&lt;param name="schemaObjectPrefix" value="fs_ver_"/&gt;
&lt;/FileSystem&gt;
&lt;!-- ===== 5. VERSIONING PersistenceManager ===== --&gt;
&lt;PersistenceManager
class="org.apache.jackrabbit.core.persistence.bundle.PostgreSQLPersistenceManager"&gt;
&lt;param name="driver" value="javax.naming.InitialContext"/&gt;
&lt;param name="url" value="java:comp/env/jdbc/jackrabbit"/&gt;
&lt;param name="schema" value="postgresql"/&gt;
&lt;param name="schemaObjectPrefix" value="pm_ver_"/&gt;
&lt;/PersistenceManager&gt;
📌 NOTE: The schemaObjectPrefix values (fs_repos_, fs_ws_, pm_ws_, fs_ver_, pm_ver_) are critical — they namespace the Jackrabbit tables within the jackrabbit database. Do not change them.
📎 Source: Pentaho Docs: Modify Jackrabbit for PostgreSQL (archive install)
📎 Source: Apache Jackrabbit Configuration Reference
## 3.7 Configure Jackrabbit Cluster Journal
Add the Cluster Journal at the bottom of repository.xml, inside the &lt;Repository&gt; element. This is what synchronises content changes between nodes. Each node MUST have a unique Cluster ID.
&lt;!-- Cluster Journal — add at the bottom of &lt;Repository&gt;, before &lt;/Repository&gt; --&gt;
&lt;!-- NODE_1 on pentaho-node-01 | NODE_2 on pentaho-node-02              --&gt;
&lt;Cluster id="NODE_1"&gt;
&lt;Journal class="org.apache.jackrabbit.core.journal.DatabaseJournal"&gt;
&lt;param name="revision" value="${rep.home}/revision.log"/&gt;
&lt;param name="url" value="jdbc:postgresql://10.0.1.30:5432/jackrabbit"/&gt;
&lt;param name="driver" value="org.postgresql.Driver"/&gt;
&lt;param name="user" value="jcr_user"/&gt;
&lt;param name="password" value="Str0ngPassw0rd!"/&gt;
&lt;param name="databaseType" value="postgresql"/&gt;
&lt;param name="janitorEnabled" value="true"/&gt;
&lt;param name="janitorSleep" value="86400"/&gt;
&lt;param name="janitorFirstRunHourOfDay" value="3"/&gt;
&lt;/Journal&gt;
&lt;/Cluster&gt;
⚠️  WARNING: On pentaho-node-02, set id="NODE_2". Duplicate Cluster IDs WILL corrupt the JCR repository and cause unpredictable cluster behaviour.
📎 Source: Pentaho Docs: Set Up a Cluster — Jackrabbit Journal
## 3.8 Configure Hibernate Settings
Verify the Hibernate configuration files point to PostgreSQL. By default they are pre-configured for PostgreSQL — but the connection URL must be updated to point to your remote db-01 server, not localhost.
# Step 1: Confirm hibernate-settings.xml references postgresql
nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/hibernate/hibernate-settings.xml
# Ensure the &lt;config-file&gt; tag reads:
# &lt;config-file&gt;system/hibernate/postgresql.hibernate.cfg.xml&lt;/config-file&gt;
# Step 2: Update the connection URL in postgresql.hibernate.cfg.xml
nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/hibernate/postgresql.hibernate.cfg.xml
# Update these properties to point to db-01 (not localhost):
# &lt;property name="connection.url"&gt;jdbc:postgresql://10.0.1.30:5432/hibernate&lt;/property&gt;
# &lt;property name="connection.username"&gt;hibuser&lt;/property&gt;
# &lt;property name="connection.password"&gt;Str0ngPassw0rd!&lt;/property&gt;
Also update the Spring Security Hibernate properties — this controls security and user authentication database lookups:
nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/applicationContext-spring-security-hibernate.properties
# Set all four values:
jdbc.driver=org.postgresql.Driver
jdbc.url=jdbc:postgresql://10.0.1.30:5432/hibernate
jdbc.username=hibuser
jdbc.password=Str0ngPassw0rd!
hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
📎 Source: GitHub: firespring/pentaho-server — hibernate-settings.xml
## 3.9 Configure Quartz for Clustering
Edit quartz.properties to enable clustering. The instanceId must be AUTO so each node generates a unique runtime ID. Quartz will use this to coordinate which node runs each scheduled job.
nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/scheduler-plugin/quartz/quartz.properties
# 1. Dynamic instance ID (auto-generated per node at startup)
org.quartz.scheduler.instanceId = AUTO
# 2. Enable Quartz clustering
org.quartz.jobStore.isClustered = true
# 3. Cluster check-in interval (20 seconds)
org.quartz.jobStore.clusterCheckinInterval = 20000
# 4. PostgreSQL JDBC delegate class
org.quartz.jobStore.driverDelegateClass = org.quartz.impl.jdbcjobstore.PostgreSQLDelegate
# 5. Use JNDI data source (defined in context.xml)
org.quartz.dataSource.myDS.jndiURL = Quartz
# 6. Quartz table prefix (must match the DDL scripts)
org.quartz.jobStore.tablePrefix = QRTZ5_
# 7. Misfire threshold
org.quartz.jobStore.misfireThreshold = 60000
📌 NOTE: Setting org.quartz.jobStore.isClustered=true prevents duplicate job execution across nodes. Without this, both nodes will independently fire the same scheduled job.
📎 Source: Pentaho Docs: Set Up a Cluster — Quartz Configuration
## 3.10 Configure Base URL for Cluster
Set the fully-qualified server URL to the load balancer VIP — not the individual node IP. This ensures all internal Pentaho redirects, report links, and scheduled job callbacks route through the load balancer.
nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/server.properties
# Point to the VIP / load balancer:
fully-qualified-server-url=http://10.0.1.100:80/pentaho
## 3.11 Disable DSW Data Source Caching
When Pentaho Server is clustered and a new data source is created through the Data Source Wizard (DSW) in PUC, it is only visible on the cluster node where the user had their session. Disabling the domain ID cache forces all nodes to reload data sources from the database on each request, ensuring consistency.
nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/system.properties
# Disable the DSW domain ID cache:
enableDomainIdCache=false
📌 NOTE: Disabling this cache may slightly slow data source list loading as results are no longer cached. This is a necessary trade-off for cluster consistency.
## 3.12 Set PENTAHO_LICENSE_INFORMATION_PATH
Each node must have this environment variable set so Pentaho knows where to store and retrieve the license cache file. Set it in /etc/environment so it persists across reboots.
sudo nano /etc/environment
# Add this line:
PENTAHO_LICENSE_INFORMATION_PATH=/opt/pentaho/.elmLicInfo.plt
# Apply to current session:
source /etc/environment
env | grep PENTAHO_LICENSE_INFORMATION_PATH
📎 Source: Pentaho Docs: Set License Path Environment Variable on Linux
## 3.13 Adjust JVM Memory Settings
Edit the Tomcat startup script to increase JVM heap size. The default values (128m–768m) are far too low for production. Minimum recommended is 4GB, with 6GB as a practical ceiling for most workloads.
nano /opt/pentaho/server/pentaho-server/tomcat/scripts/ctl.sh
# In the start-pentaho section, update JAVA_OPTS:
export JAVA_OPTS="-Xms4096m -Xmx6144m \
-XX:MaxMetaspaceSize=512m \
-XX:+UseG1GC \
-Djava.awt.headless=true \
-Dsun.rmi.dgc.client.gcInterval=3600000 \
-Dsun.rmi.dgc.server.gcInterval=3600000"
📎 Source: Pentaho Docs: Increase Memory Limit on Linux
## 3.14 Create systemd Service
Create a systemd unit file to manage Pentaho Server as a system service on each node. This enables automatic startup on boot and standard systemctl management.
sudo nano /etc/systemd/system/pentaho.service
[Unit]
Description=Pentaho Server (BI Platform)
Documentation=https://docs.pentaho.com
After=network.target postgresql.service
Requires=network.target
[Service]
Type=forking
User=pentaho
Group=pentaho
WorkingDirectory=/opt/pentaho/server/pentaho-server
ExecStart=/opt/pentaho/server/pentaho-server/start-pentaho.sh
ExecStop=/opt/pentaho/server/pentaho-server/stop-pentaho.sh
Restart=on-failure
RestartSec=15
TimeoutStartSec=180
TimeoutStopSec=120
[Install]
WantedBy=multi-user.target
sudo systemctl daemon-reload
sudo systemctl enable pentaho
# Start node-01 first; wait for full startup before starting node-02
sudo systemctl start pentaho
# Monitor startup — look for 'Server startup in [N] milliseconds'
sudo journalctl -u pentaho -f
# OR watch the Tomcat log directly:
tail -f /opt/pentaho/server/pentaho-server/tomcat/logs/catalina.out
📌 NOTE: Pentaho Server takes approximately 60–120 seconds to start. Do NOT start node-02 until node-01 is fully running and confirmed healthy. Starting both nodes simultaneously before Jackrabbit initialises can corrupt the JCR repository.
📎 Source: Pentaho Docs: Create Startup Scripts on Linux
## 3.15 Repeat on Node 2
Repeat ALL steps in Section 3 on pentaho-node-02. The ONLY difference is in Section 3.7 — the Jackrabbit Cluster Journal ID must be NODE_2 instead of NODE_1.
⚠️  WARNING: Do NOT re-run the DDL scripts (Section 2.5) on node-02. The database is shared — running scripts a second time will drop and recreate tables, permanently destroying all existing repository data.
# 4. HAProxy Load Balancer Configuration
Two HAProxy instances (lb-01 and lb-02) are deployed for load balancer HA. Keepalived manages a Virtual IP (VIP) using VRRP — the MASTER holds the VIP and if it fails, the BACKUP promotes itself and claims the VIP within seconds, typically in under 3 seconds.
Figure 3 — HAProxy + Keepalived VIP Failover: lb-01 (MASTER, priority 110) holds the VIP. If HAProxy stops on lb-01, Keepalived detects it in ~6s and lb-02 (BACKUP, priority 100) claims the VIP. Sticky sessions ensure each user's requests always route to the same Pentaho node.
## 4.1 Install HAProxy and Keepalived
Run on BOTH lb-01 and lb-02:
sudo apt update
sudo apt install -y haproxy keepalived
# Verify
haproxy -v
keepalived --version
# Enable HAProxy on boot
sudo systemctl enable haproxy
## 4.2 Enable Non-Local IP Binding and IP Forwarding
HAProxy must be able to bind to the VIP address even when Keepalived hasn't yet assigned it (e.g., during failover). Enable non-local IP binding and IP forwarding on BOTH load balancer servers.
# On BOTH lb-01 and lb-02:
echo "net.ipv4.ip_nonlocal_bind = 1" | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.ip_forward = 1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
# Verify:
sysctl net.ipv4.ip_nonlocal_bind
sysctl net.ipv4.ip_forward
📎 Source: Kifarunix: Configure Highly Available HAProxy with Keepalived on Ubuntu
## 4.3 Configure HAProxy
The HAProxy configuration is identical on lb-01 and lb-02. The VIP is managed by Keepalived independently.
# Validate the config before applying:
sudo nano /etc/haproxy/haproxy.cfg
#---------------------------------------------------------------------
# Global settings
#---------------------------------------------------------------------
global
log         /dev/log local0
log         /dev/log local1 notice
chroot      /var/lib/haproxy
pidfile     /var/run/haproxy.pid
maxconn     50000
user        haproxy
group       haproxy
daemon
stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
stats timeout 30s
#---------------------------------------------------------------------
# Default settings
#---------------------------------------------------------------------
defaults
log         global
mode        http
option      httplog
option      dontlognull
option      redispatch
option      forwardfor
retries     3
timeout     connect     5s
timeout     client      300s
timeout     server      300s
timeout     check       5s
#---------------------------------------------------------------------
# HAProxy Statistics Page — restrict in production
# Access via http://10.0.1.100:8888/stats
#---------------------------------------------------------------------
listen stats
bind *:8888
stats enable
stats uri     /stats
stats realm   "Pentaho HA Statistics"
stats auth    admin:YourStatsPassw0rd!
stats refresh 5s
stats show-legends
stats show-node
#---------------------------------------------------------------------
# Frontend — client-facing entry point on port 80
#---------------------------------------------------------------------
frontend pentaho_front
bind *:80
default_backend pentaho_back
capture request header Host len 64
# To enable HTTPS (requires SSL cert):
# bind *:443 ssl crt /etc/haproxy/certs/pentaho.pem
# http-request set-header X-Forwarded-Proto https
# http-request redirect scheme https unless { ssl_fc }
#---------------------------------------------------------------------
# Backend — Pentaho application nodes with sticky sessions
#---------------------------------------------------------------------
backend pentaho_back
balance roundrobin
# Sticky sessions using Pentaho's JSESSIONID cookie.
# The 'prefix' option prefixes the existing JSESSIONID cookie value
# with the server name — no extra cookie is added to the browser.
# This is the recommended sticky session method for Java applications.
cookie JSESSIONID prefix nocache
# Active health checks every 5 seconds
# rise 2: mark UP after 2 successful checks
# fall 3: mark DOWN after 3 consecutive failures
option  httpchk GET /pentaho/Login
http-check expect status 200
server pentaho-node-01 10.0.1.10:8080 check inter 5000 rise 2 fall 3 cookie S1
server pentaho-node-02 10.0.1.11:8080 check inter 5000 rise 2 fall 3 cookie S2
# Validate the configuration syntax
sudo haproxy -f /etc/haproxy/haproxy.cfg -c
# Start HAProxy
sudo systemctl start haproxy
sudo systemctl status haproxy
📌 NOTE: The 'cookie JSESSIONID prefix nocache' directive is the key sticky session mechanism. It uses Pentaho's built-in JSESSIONID cookie without creating a separate cookie, ensuring the same backend node handles all requests within a user's session.
📎 Source: HAProxy Docs: Sticky Sessions (Load Balancing Affinity)
📎 Source: HAProxy Docs: Enable Sticky Sessions in HAProxy
## 4.4 Configure Keepalived on lb-01 (MASTER)
Keepalived uses VRRP to maintain a floating Virtual IP between the two load balancers. The MASTER holds the VIP at all times. If the MASTER's HAProxy process fails or the server becomes unreachable, the VIP transfers to the BACKUP.
sudo nano /etc/keepalived/keepalived.conf
# /etc/keepalived/keepalived.conf — lb-01 (MASTER)
global_defs {
router_id         LB_PRIMARY
enable_script_security
script_user       root
}
# Health check: verify HAProxy process is running
vrrp_script chk_haproxy {
script   "/usr/bin/killall -0 haproxy"
interval 2        # check every 2 seconds
weight   2        # +2 to priority when healthy
fall     3        # declare FAULT after 3 consecutive failures
rise     2        # recover after 2 successful checks
}
vrrp_instance VI_1 {
state             MASTER
interface         ens3      # ← replace with your NIC (ip addr show)
virtual_router_id 51        # must match EXACTLY on lb-01 AND lb-02
priority          110       # lb-01 has higher priority = MASTER
advert_int        1         # VRRP heartbeat every 1 second
authentication {
auth_type PASS
auth_pass Pent@h0VrrpKey  # must match lb-02
}
virtual_ipaddress {
10.0.1.100/24       # VIP — must be in same subnet as interface
}
track_script {
chk_haproxy
}
}
## 4.5 Configure Keepalived on lb-02 (BACKUP)
sudo nano /etc/keepalived/keepalived.conf
# /etc/keepalived/keepalived.conf — lb-02 (BACKUP)
global_defs {
router_id         LB_BACKUP
enable_script_security
script_user       root
}
vrrp_script chk_haproxy {
script   "/usr/bin/killall -0 haproxy"
interval 2
weight   2
fall     3
rise     2
}
vrrp_instance VI_1 {
state             BACKUP    # ← BACKUP on lb-02
interface         ens3      # ← replace with your NIC name
virtual_router_id 51        # must match lb-01
priority          100       # lower priority = BACKUP
advert_int        1
authentication {
auth_type PASS
auth_pass Pent@h0VrrpKey  # must match lb-01
}
virtual_ipaddress {
10.0.1.100/24
}
track_script {
chk_haproxy
}
}
# Enable and start Keepalived on BOTH lb-01 and lb-02
sudo systemctl enable keepalived
sudo systemctl start keepalived
sudo systemctl status keepalived
# Verify the VIP is assigned on lb-01:
ip addr show ens3
# Expected output includes: inet 10.0.1.100/24 scope global secondary ens3
📎 Source: DigitalOcean: Set Up Highly Available HAProxy with Keepalived
📎 Source: MangoHost: HAProxy + Keepalived on Ubuntu 24
📎 Source: Kifarunix: Highly Available HAProxy + Keepalived on Ubuntu
## 4.6 Verify Load Balancer
# Test access through the VIP:
curl -Is http://10.0.1.100/pentaho/Login | head -3
# Expected: HTTP/1.1 200 OK
# Test VIP failover — stop HAProxy on lb-01:
sudo systemctl stop haproxy    # on lb-01
# lb-02 takes over VIP within ~3 seconds
curl -Is http://10.0.1.100/pentaho/Login | head -3
# Should still succeed
# Restore lb-01:
sudo systemctl start haproxy   # on lb-01
# View HAProxy stats page:
# http://10.0.1.100:8888/stats  (both nodes should show green)
# 5. Starting and Verifying the Cluster
Follow this exact startup sequence to bring the cluster online correctly:
## 5.1 Cluster Startup Sequence
The startup order is critical. Follow this sequence exactly:
Start PostgreSQL on db-01:  sudo systemctl start postgresql
Start HAProxy on both lb-01 and lb-02:  sudo systemctl start haproxy
Start Keepalived on both lb-01 and lb-02:  sudo systemctl start keepalived
Start FlexNet License Server on lic-01 (if local):  sudo systemctl start flexnetls-pentaho
Start Pentaho Server on pentaho-node-01:  sudo systemctl start pentaho
Wait for node-01 to fully start — watch catalina.out for 'Server startup in [N] milliseconds'
Start Pentaho Server on pentaho-node-02:  sudo systemctl start pentaho
Verify the load balancer can reach both nodes (check HAProxy stats page)
Access Pentaho Server through the VIP: http://10.0.1.100/pentaho
Sign in and confirm full functionality end-to-end
## 5.2 Cluster Verification Tests
#### Test 1: VIP and Load Balancer Connectivity
# Should return HTTP 200 through the VIP
curl -Is http://10.0.1.100/pentaho/Login | head -3
# Expected: HTTP/1.1 200 OK
# Direct node health checks:
curl -Is http://10.0.1.10:8080/pentaho/Login | head -1   # node-01
curl -Is http://10.0.1.11:8080/pentaho/Login | head -1   # node-02
#### Test 2: Sticky Session Routing
# Use saved cookies across multiple requests — all must hit the same backend
curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
http://10.0.1.100/pentaho/ -I | grep -i "x-haproxy" 2&gt;/dev/null || true
# Make 5 requests reusing the cookie — each should return 200 from same node
for i in {1..5}; do
curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
http://10.0.1.100/pentaho/ -o /dev/null -w "Request $i: %{http_code}\n"
done
#### Test 3: Node Failover
# Stop Pentaho on node-01, verify traffic routes to node-02
sudo systemctl stop pentaho   # on node-01
curl -Is http://10.0.1.100/pentaho/Login | head -3
# Should still return HTTP 200 from node-02
# Restore node-01
sudo systemctl start pentaho
#### Test 4: Load Balancer VIP Failover
# Stop HAProxy on lb-01 — Keepalived should move VIP to lb-02
sudo systemctl stop haproxy   # on lb-01
sleep 3
curl -Is http://10.0.1.100/pentaho/Login | head -3
# Should succeed via lb-02
# Restore lb-01
sudo systemctl start haproxy   # on lb-01
ip addr show ens3   # VIP should transfer back to lb-01
#### Test 5: Jackrabbit Journal Replication
Log in to Pentaho directly on node-01 (http://10.0.1.10:8080/pentaho), create a test folder or report, then access node-02 directly (http://10.0.1.11:8080/pentaho) and verify the content is visible. This confirms the Jackrabbit cluster journal is replicating correctly between nodes.
#### Test 6: Quartz Cluster Registration
# Confirm both nodes are registering heartbeats in the Quartz scheduler state table
psql -h 10.0.1.30 -U pentaho_user -d quartz \
-c "SELECT INSTANCE_NAME, LAST_CHECKIN_TIME, CHECKIN_INTERVAL \
FROM QRTZ5_SCHEDULER_STATE;"
# Both pentaho-node-01 and pentaho-node-02 should appear
# 6. Carte Cluster Configuration for PDI Execution HA
Carte is PDI's lightweight web server for remote execution of transformations and jobs. A Carte cluster enables distributed and parallel execution across multiple nodes. There are two types of Carte clusters — Static and Dynamic.
Cluster Type
Description
Static
Fixed schema with pre-defined master + slave nodes at design time. Best for stable, smaller environments.
Dynamic
Slave nodes register with master at runtime. Master monitors slaves every 30 seconds. Best for cloud environments where nodes scale in/out.
Figure 4 — Carte PDI Cluster: The master distributes transformation steps in parallel across slave nodes. Slaves register with the master every 30 seconds. repositories.xml enables repository content access on each node.
## 6.1 Install PDI / Carte on Each Server
Perform the following on carte-master, carte-slave-01, and carte-slave-02:
# Create installation directory
sudo mkdir -p /opt/pentaho/design-tools
sudo useradd -m -d /opt/pentaho -s /bin/bash pentaho
sudo chown -R pentaho:pentaho /opt/pentaho
# As pentaho user — extract PDI client archive
sudo su - pentaho
cd /opt/pentaho/design-tools
unzip ~/pdi-ee-client-10.x.x.x-xxx-dist.zip
ls data-integration/
## 6.2 Copy JDBC Drivers and Plugins
# On each Carte node — copy JDBC drivers from the Pentaho Server
scp pentaho@10.0.1.10:/opt/pentaho/server/pentaho-server/tomcat/lib/postgresql-42.7.0.jar \
/opt/pentaho/design-tools/data-integration/lib/
## 6.3 Obfuscate Cluster Passwords
Carte uses a username/password for the cluster API. It is best practice to obfuscate passwords using the encr utility supplied with PDI:
cd /opt/pentaho/design-tools/data-integration
# Obfuscate the cluster password 'cluster'
./encr.sh -carte cluster
# Output example: OBF:1uh21vn01vnn1vv11vv31vnn1vn21ugg
# Use this obfuscated value in config files
## 6.4 Configure the Carte Master Server
On carte-master (10.0.1.40), create the master configuration file:
nano /opt/pentaho/design-tools/data-integration/carte-master-config.xml
&lt;slave_config&gt;
&lt;slaveserver&gt;
&lt;name&gt;CarteMaster&lt;/name&gt;
&lt;hostname&gt;10.0.1.40&lt;/hostname&gt;
&lt;port&gt;9001&lt;/port&gt;
&lt;username&gt;cluster&lt;/username&gt;
&lt;password&gt;OBF:1uh21vn01vnn1vv11vv31vnn1vn21ugg&lt;/password&gt;
&lt;master&gt;Y&lt;/master&gt;
&lt;/slaveserver&gt;
&lt;!-- Optional: log cleanup settings --&gt;
&lt;max_log_lines&gt;0&lt;/max_log_lines&gt;
&lt;max_log_timeout_minutes&gt;0&lt;/max_log_timeout_minutes&gt;
&lt;object_timeout_minutes&gt;240&lt;/object_timeout_minutes&gt;
&lt;/slave_config&gt;
## 6.5 Configure Carte Slave Servers
#### carte-slave-01 (10.0.1.41)
nano /opt/pentaho/design-tools/data-integration/carte-slave-config.xml
&lt;slave_config&gt;
&lt;!-- Define the master this slave reports to --&gt;
&lt;masters&gt;
&lt;slaveserver&gt;
&lt;name&gt;CarteMaster&lt;/name&gt;
&lt;hostname&gt;10.0.1.40&lt;/hostname&gt;
&lt;port&gt;9001&lt;/port&gt;
&lt;username&gt;cluster&lt;/username&gt;
&lt;password&gt;OBF:1uh21vn01vnn1vv11vv31vnn1vn21ugg&lt;/password&gt;
&lt;master&gt;Y&lt;/master&gt;
&lt;/slaveserver&gt;
&lt;/masters&gt;
&lt;report_to_masters&gt;Y&lt;/report_to_masters&gt;
&lt;!-- This slave's identity — MUST be unique in the cluster --&gt;
&lt;slaveserver&gt;
&lt;name&gt;CarteSlaveOne&lt;/name&gt;
&lt;hostname&gt;10.0.1.41&lt;/hostname&gt;
&lt;port&gt;9002&lt;/port&gt;
&lt;username&gt;cluster&lt;/username&gt;
&lt;password&gt;OBF:1uh21vn01vnn1vv11vv31vnn1vn21ugg&lt;/password&gt;
&lt;master&gt;N&lt;/master&gt;
&lt;!-- Inherit Kettle properties from master --&gt;
&lt;get_properties_from_master&gt;CarteMaster&lt;/get_properties_from_master&gt;
&lt;override_existing_properties&gt;Y&lt;/override_existing_properties&gt;
&lt;/slaveserver&gt;
&lt;/slave_config&gt;
#### carte-slave-02 (10.0.1.42)
Copy the slave config from carte-slave-01 and change the name and hostname:
&lt;!-- Change these two lines on carte-slave-02 --&gt;
&lt;name&gt;CarteSlaveTwo&lt;/name&gt;
&lt;hostname&gt;10.0.1.42&lt;/hostname&gt;
## 6.6 Copy Repository Configuration to Carte Nodes
Each Carte slave needs the repositories.xml file to connect to the Pentaho Repository:
# Copy repositories.xml from the workstation .kettle directory to each Carte node
scp ~/.kettle/repositories.xml pentaho@10.0.1.40:/opt/pentaho/.kettle/
scp ~/.kettle/repositories.xml pentaho@10.0.1.41:/opt/pentaho/.kettle/
scp ~/.kettle/repositories.xml pentaho@10.0.1.42:/opt/pentaho/.kettle/
## 6.7 Start Carte Servers
# On carte-master:
cd /opt/pentaho/design-tools/data-integration
./carte.sh carte-master-config.xml &amp;
# On carte-slave-01:
./carte.sh carte-slave-config.xml &amp;
# On carte-slave-02:
./carte.sh carte-slave-config.xml &amp;
## 6.8 Create systemd Services for Carte
Create a systemd unit file on each Carte server for automatic startup:
sudo nano /etc/systemd/system/carte.service
[Unit]
Description=Pentaho Carte Server
After=network.target
[Service]
Type=simple
User=pentaho
WorkingDirectory=/opt/pentaho/design-tools/data-integration
ExecStart=/opt/pentaho/design-tools/data-integration/carte.sh carte-master-config.xml
Restart=on-failure
RestartSec=10
[Install]
WantedBy=multi-user.target
sudo systemctl daemon-reload
sudo systemctl enable carte
sudo systemctl start carte
## 6.9 Configure Proxy Trusting Filter (for Pentaho Server as Master)
If you want the Pentaho Server to act as the load balancer / master in a dynamic Carte cluster, you must configure the proxy trusting filter. Stop both Pentaho Server and the remote Carte server first:
# Edit web.xml on each Pentaho Server node
nano /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/WEB-INF/web.xml
# In the Proxy Trusting Filter section, add Carte server IPs:
&lt;init-param&gt;
&lt;param-name&gt;TrustedIpAddrs&lt;/param-name&gt;
&lt;param-value&gt;10.0.1.40,10.0.1.41,10.0.1.42&lt;/param-value&gt;
&lt;/init-param&gt;
# Uncomment the proxy trusting filter-mapping:
&lt;!-- begin trust --&gt;
&lt;filter-mapping&gt;
&lt;filter-name&gt;ProxyTrustingFilter&lt;/filter-name&gt;
&lt;url-pattern&gt;/*&lt;/url-pattern&gt;
&lt;/filter-mapping&gt;
&lt;!-- end trust --&gt;
On each Carte slave startup script, add the trust flag:
# Edit carte.sh (or your systemd ExecStart)
# Add this JVM option:
OPT="$OPT -Dpentaho.repository.client.attemptTrust=true"
## 6.10 Configure Cluster Schema in Spoon
Open Spoon (PDI client) and connect to the Pentaho Repository.
In Explorer View, select the Slave tab and click New.
Add each Carte server (master and slaves) with their hostname, port, username, and password.
Mark CarteMaster as 'Is the master: checked'. All slaves are unchecked.
Right-click on Kettle cluster schemas in Explorer View and select New.
Set Schema name (e.g., 'HA_Carte_Cluster'), set the starting port, and add the master plus slave servers to the schema.
Check Dynamic cluster for cloud-style environments where slaves come and go.
Save the cluster schema to the repository.
📌 NOTE: For a static cluster, assign the cluster schema to individual transformation steps by right-clicking a step, selecting Clusters, and choosing the schema. For a dynamic cluster, PDI automatically distributes work across all registered slaves.
# 7. Tray.io Integration with Pentaho Carte
Tray.io is a cloud-based iPaaS (Integration Platform as a Service) that allows you to build automated workflows connecting hundreds of services. Since there is no native Pentaho connector in Tray.io, integration is achieved through the Tray.io HTTP Client connector, which calls the Pentaho Carte REST API to trigger and monitor PDI transformations and jobs.
## 7.1 Overview: How It Works
The integration pattern is as follows:
Tray.io acts as an external orchestrator that triggers PDI jobs or transformations via the Carte REST API.
Carte exposes REST endpoints for running jobs, checking status, and retrieving logs.
Tray.io workflows can be triggered on a schedule, by a webhook, or by an event in another connected system (e.g., Salesforce, Slack, or a database event).
Tray.io monitors job execution by polling the Carte API for status and acts on the result (e.g., send a Slack notification on completion, or write a record to a CRM).
Figure 5 — Tray.io ↔ Carte Integration Flow: Tray.io triggers ETL execution via the Carte REST API through the On-Premises Agent. The workflow parses the XML response, polls for completion, and fires a notification on finish.
## 7.2 Pentaho Carte REST API Endpoints
The Carte server exposes the following REST endpoints relevant to Tray.io integration:
Endpoint
Description
GET /kettle/runJob/
Run a job from the repository by path and level
GET /kettle/runTrans/
Run a transformation from the repository
GET /kettle/jobStatus/
Check the status of a running job by name and ID
GET /kettle/transStatus/
Check the status of a running transformation
GET /kettle/stopJob/
Stop a running job
GET /kettle/pauseJob/
Pause a running job
GET /kettle/serverStatus/
Get the Carte server health status
#### Example: Run a Job
# Run a job stored in the repository:
GET http://10.0.1.40:9001/kettle/runJob/?job=/path/to/MyJob.kjb&amp;level=Basic
# Headers:
Authorization: Basic Y2x1c3RlcjpjbHVzdGVy   # Base64 of 'cluster:cluster'
Content-Type: application/json
## 7.3 Setting Up the Tray.io Workflow
The following steps describe creating a Tray.io workflow that triggers a Pentaho job on a schedule and sends a Slack notification on completion.
### Step 1: Create a New Workflow in Tray.io
Log in to Tray.io at https://app.tray.io
Navigate to your project and click New Workflow.
Name the workflow (e.g., 'Pentaho ETL Trigger — Daily Load').
Select the Scheduler trigger type for scheduled execution, or Webhook for event-driven.
### Step 2: Configure the Scheduler Trigger (for Scheduled Jobs)
Click on the Scheduler trigger step.
Set the schedule (e.g., Daily at 02:00 UTC).
For event-driven execution, use the Webhook trigger instead and copy the Public URL to use in the triggering system.
### Step 3: Add HTTP Client Connector to Call Carte
Since Tray.io does not have a native Pentaho connector, use the HTTP Client connector:
Click the + button below the trigger to add a step.
Search for and select HTTP Client.
Set the operation to GET.
Set the URL to your Carte endpoint, e.g.:
http://10.0.1.40:9001/kettle/runJob/?job=/path/to/MyJob.kjb&amp;level=Basic
Under Headers, add the Authorization header:
Header Name:  Authorization
Header Value: Basic Y2x1c3RlcjpjbHVzdGVy
# (Base64 encoding of cluster:cluster — replace with your credentials)
In the Authentication section, create a Generic Service Authentication with your Carte credentials rather than hard-coding them.
📌 NOTE: Never hard-code credentials directly in the Tray.io properties panel. Always use the $.auth method with a properly configured Generic Service Authentication to ensure credentials are stored securely and never appear in logs.
### Step 4: Parse the Carte Response
Carte returns an XML response with the job execution ID and status. Use Tray.io's Script connector or the built-in data mapping to extract the relevant values:
&lt;!-- Example Carte response after runJob --&gt;
&lt;webresult&gt;
&lt;result&gt;OK&lt;/result&gt;
&lt;message&gt;Job started&lt;/message&gt;
&lt;id&gt;a1b2c3d4-1234-5678-abcd-ef1234567890&lt;/id&gt;
&lt;/webresult&gt;
Add a Script (JavaScript) step after the HTTP Client.
Parse the XML response body and extract the job ID:
// Tray.io Custom JS step — parse Carte XML response
const body = $.steps['http-client-1'].body;
// Use a simple regex to extract job ID from XML
const idMatch = body.match(/&lt;id&gt;(.*?)&lt;\/id&gt;/);
const jobId = idMatch ? idMatch[1] : null;
return { jobId };
### Step 5: Poll for Job Completion
Add a loop to poll job status until it completes or fails:
Add another HTTP Client step calling the jobStatus endpoint:
GET http://10.0.1.40:9001/kettle/jobStatus/?name=MyJob&amp;id=&lt;jobId from previous step&gt;
Add a Delay step (e.g., 10-second wait) between polls.
Add a Boolean condition step to check the status field in the response.
Loop until status is 'Finished' or 'Stopped'.
### Step 6: Add Notification on Completion
After the loop exits, add a Slack connector step (or email/JIRA/etc.).
Configure a success message, e.g., 'Pentaho ETL job completed successfully'.
Add an error branch to send an alert if the job status is 'Error'.
## 7.4 Webhook-Triggered Integration Pattern
For event-driven integration (e.g., trigger a PDI job when a new file appears in S3 or a record is created in Salesforce):
In Tray.io, create a workflow with a Webhook trigger.
Copy the Workflow Public URL from the trigger settings.
In the source system (e.g., Salesforce, S3, or your application), configure outbound webhooks to POST to the Tray.io Workflow Public URL.
In Tray.io, extract the relevant payload data from the webhook trigger output.
Pass extracted parameters as query parameters or request body to the Carte API call.
# Example: Trigger a Carte job with parameters from the Tray.io webhook payload
GET http://10.0.1.40:9001/kettle/runJob/?job=/ETL/LoadCustomer.kjb&amp;level=Basic
&amp;CUSTOMER_ID=&lt;extracted from webhook&gt;
&amp;LOAD_DATE=&lt;extracted from webhook&gt;
## 7.5 Tray.io On-Premises Agent (for Private Network Carte)
If your Carte servers are on a private network not accessible from the Tray.io cloud, use the Tray.io On-Premises Agent. The agent creates a secure outbound tunnel from your private network to Tray.io without requiring inbound firewall rules or exposing your Carte servers to the internet.
Install the Tray.io On-Premises Agent on a Linux server within your network that can reach the Carte servers.
The agent connects outbound to Tray.io's infrastructure over HTTPS.
Configure the HTTP Client connector in Tray.io to route requests through the on-premises agent.
Use private IP addresses (e.g., 10.0.1.40:9001) in the HTTP Client URL — the agent resolves them locally.
## 7.6 Security Considerations for Tray.io Integration
Store Carte credentials in Tray.io Generic Service Authentication, not as plain text values in step properties.
Enable SSL/TLS on the Carte server (Jetty JKS keystore) and use HTTPS endpoints in Tray.io.
Consider implementing a lightweight reverse proxy (e.g., Nginx) in front of Carte to handle SSL termination and add an additional authentication layer.
Restrict Carte access to the Tray.io On-Premises Agent's IP address using firewall rules if not using the on-premises agent.
Use Tray.io environment variables for all sensitive values (passwords, tokens, IPs).
# 8. Post-Installation Tasks and Operations
## 8.1 Pentaho License Server Setup
Pentaho 10.x uses a FlexNet-based License Server (not .lic files) to validate entitlements. You must have a valid entitlement verified by either the Hitachi Vantara cloud license server or a local license server installed behind your firewall. For HA deployments on an isolated network, install a local license server.
### 8.1.1 Option A — Cloud License Server (Internet-accessible environments)
If your Pentaho Server nodes have outbound internet access, no local license server is needed. The Pentaho Server contacts the Hitachi Vantara cloud license server automatically to validate entitlements. Ensure port 443 (HTTPS) is open outbound from pentaho-node-01 and pentaho-node-02.
### 8.1.2 Option B — Local License Server (Air-gapped / firewall environments)
For environments without internet access, install the local license server (FlexNet Embedded) on a dedicated host or on one of the existing servers. The local license server requires minimal resources and can share a server with Pentaho.
#### Local License Server Requirements
CPU: 2GHz, 2 cores minimum
RAM: 4 GB
Storage: 200 MB
JAVA_HOME must be set
Port 7070 must be open for communication between Pentaho nodes and the license server
Cannot be deployed in a Docker container
#### Install the Local License Server on Ubuntu
# Download from the Hitachi Vantara Support Portal:
# Support Portal &gt; Pentaho &gt; Download &gt; Pentaho 10.2 GA Release
# &gt; Utilities and Tools / Local License Server
# File: enterprise-local-license-server-10.2.0.0-&lt;build_version&gt;.tar.gz
# Set permissions and extract
chmod 777 enterprise-local-license-server-10.2.0.0-&lt;build_version&gt;.tar.gz
tar -xvzf enterprise-local-license-server-10.2.0.0-&lt;build_version&gt;.tar.gz -C /opt/flexnet
# Navigate to the server directory
cd /opt/flexnet/enterprise-local-license-server/server
# Install as a systemd service
# Answer 'y' if installing on a VM (uses VM UUID as hostid)
# Answer 'n' if installing on physical hardware
sudo ./install-systemd.sh
# Start the license server service
sudo systemctl start flexnetls-pentaho
sudo systemctl enable flexnetls-pentaho
#### Change the Default Admin Password
cd /opt/flexnet/enterprise-local-license-server/enterprise
# Default credentials: admin / Password!01
# Change the password immediately:
./flexnetlsadmin.sh \
-server http://10.0.1.30:7070/api/1.0/instances/~ \
-authorize admin Password!01 \
-users -edit admin NewSecurePassword!
#### Verify License Server Status
# Check systemd service status
sudo systemctl -l status flexnetls-pentaho
# Check FlexNet server status
./flexnetlsadmin.sh \
-authorize admin &lt;password&gt; \
-server http://10.0.1.30:7070/api/1.0/instances/~ \
-status
#### Activate Licenses
Use the Activation ID emailed to you by Hitachi Vantara when you purchased Pentaho:
./flexnetlsadmin.sh \
-authorize admin &lt;password&gt; \
-server http://10.0.1.30:7070/api/1.0/instances/~ \
-activate -id &lt;activation_id&gt; \
-count &lt;number_of_entitlements_to_activate&gt;
# Verify activated licenses
./flexnetlsadmin.sh \
-authorize admin &lt;password&gt; \
-server http://10.0.1.30:7070/api/1.0/instances/~ \
-licenses -verbose
📌 NOTE: If the license server cannot reach the Hitachi Vantara back office URL (internet-restricted environments), use the offline activation method. See: https://docs.pentaho.com/install/10.2-install/pentaho-installation-overview-cp/acquire-and-install-enterprise-licenses/install-and-manage-a-local-license-server
### 8.1.3 Configure Pentaho Nodes to Use the License Server
Each Pentaho Server node must be configured with the PENTAHO_LICENSE_INFORMATION_PATH environment variable so it knows where to store/retrieve the license information file. Do this on both pentaho-node-01 and pentaho-node-02:
# Edit /etc/environment on each Pentaho node
sudo nano /etc/environment
# Add this line (path must be accessible to the pentaho user):
PENTAHO_LICENSE_INFORMATION_PATH=/home/pentaho/.elmLicInfo.plt
# Apply the change
source /etc/environment
# Verify
env | grep PENTAHO_LICENSE_INFORMATION_PATH
### 8.1.4 Install Licenses via the Pentaho User Console (PUC)
Once the license server is running and the nodes are configured, install licenses through PUC:
Access the Pentaho User Console at http://10.0.1.100/pentaho
Sign in with admin credentials (default: admin / password — change immediately).
Navigate to Administration &gt; License Management.
Connect to the local license server URL: http://10.0.1.30:7070/api/1.0/instances/~
Select and install the activated licenses for each Pentaho component.
📌 NOTE: For HA environments, consider deploying a redundant license server to prevent any single point of failure on the licensing layer. See Revenera License Server Failover documentation for details.
## 8.2 Default Credentials — Change Immediately
⚠️  WARNING: All default credentials below must be changed before production use. Leaving them as defaults is a critical security risk.
System / Account
Default Credential
Pentaho PUC admin user
admin / password
Pentaho PUC (alt default)
admin / admin
HAProxy stats page
admin / YourStatsPassw0rd!
Keepalived VRRP
Pent@h0VrrpKey
Carte cluster user
cluster / cluster
FlexNet License Server
admin / Password!01
PostgreSQL jcr_user
Str0ngPassw0rd!
PostgreSQL pentaho_user
Str0ngPassw0rd!
PostgreSQL hibuser
Str0ngPassw0rd!
## 8.3 Useful Operations Commands
#### Cluster and Service Status
# Pentaho node health
sudo systemctl status pentaho                            # on each node
curl -Is http://10.0.1.10:8080/pentaho/Login | head -1  # node-01
curl -Is http://10.0.1.11:8080/pentaho/Login | head -1  # node-02
# Check through VIP
curl -Is http://10.0.1.100/pentaho/Login | head -1
# HAProxy status and stats
sudo systemctl status haproxy
echo "show stat" | sudo socat stdio /run/haproxy/admin.sock
# Keepalived VIP status (lb-01 should hold VIP)
ip addr show ens3 | grep 10.0.1.100
# Carte health
curl http://cluster:cluster@10.0.1.40:9001/kettle/serverStatus/
# FlexNet License Server status
cd /opt/flexnet/enterprise-local-license-server/enterprise
./flexnetlsadmin.sh -authorize admin &lt;password&gt; \
-server http://10.0.1.30:7070/api/1.0/instances/~ -status
#### Database Checks
# PostgreSQL connectivity from app nodes
psql -h 10.0.1.30 -U hibuser -d hibernate -c "SELECT version();"
psql -h 10.0.1.30 -U pentaho_user -d quartz -c "SELECT version();"
# Check Quartz cluster registration (both nodes must appear)
psql -h 10.0.1.30 -U pentaho_user -d quartz \
-c "SELECT INSTANCE_NAME, LAST_CHECKIN_TIME FROM QRTZ5_SCHEDULER_STATE;"
# Check Jackrabbit journal replication
psql -h 10.0.1.30 -U jcr_user -d jackrabbit \
-c "SELECT * FROM CL_J_GLOBAL_REVISION ORDER BY REVISION_ID DESC LIMIT 5;"
#### Log File Locations
Component
Log Path
Pentaho Server (Tomcat startup)
...pentaho-server/tomcat/logs/catalina.out
Pentaho Platform
...pentaho-server/tomcat/logs/pentaho.log
HAProxy
sudo journalctl -u haproxy  or  /var/log/haproxy.log
Keepalived
sudo journalctl -u keepalived -f
Carte
sudo journalctl -u carte -f
FlexNet License Server
sudo journalctl -u flexnetls-pentaho -f
PostgreSQL
sudo journalctl -u postgresql  or  /var/log/postgresql/
## 8.4 Common Issues and Troubleshooting
#### Pentaho fails to start — 'Cannot connect to repository'
Verify PostgreSQL is running on db-01: sudo systemctl status postgresql
Test connectivity from the Pentaho node: psql -h 10.0.1.30 -U hibuser -d hibernate -c 'SELECT 1;'
Check pg_hba.conf has entries for 10.0.1.10/32 and 10.0.1.11/32
Confirm the JDBC URL in context.xml matches your db-01 hostname/port exactly
Verify JAVA_HOME is set: echo $JAVA_HOME
#### User sessions lost when switching between cluster nodes
Confirm 'cookie JSESSIONID prefix nocache' is in the HAProxy backend section
Verify HAProxy health checks show both nodes as UP (green on stats page)
Confirm fully-qualified-server-url in server.properties points to the VIP, not a node IP
Verify sticky session test (Section 5.2 Test 2) shows consistent routing
#### Content not visible on node-02 / Jackrabbit not replicating
Check repository.xml Cluster ID — node-01 must be NODE_1, node-02 must be NODE_2
Verify the Cluster Journal block in repository.xml has correct PostgreSQL IP/port
Check the jackrabbit journal table: SELECT * FROM CL_J_GLOBAL_REVISION LIMIT 5
Restart node-02 — on first startup after fix it replays the full journal to sync
Ensure the repository.xml PostgreSQL blocks are uncommented and all other DB blocks are commented out
#### Duplicate Quartz jobs executing on both nodes
Confirm org.quartz.jobStore.isClustered=true in quartz.properties on BOTH nodes
Confirm org.quartz.scheduler.instanceId=AUTO (not a hardcoded static value)
Verify both nodes appear in QRTZ5_SCHEDULER_STATE table in PostgreSQL
Restart both nodes in sequence: node-01 first, then node-02
#### VIP not assigned after Keepalived restart
Verify virtual_router_id matches on both lb-01 and lb-02 (must be identical)
Verify auth_pass matches on both servers
Confirm IP protocol 112 (VRRP) is not blocked by the firewall between lb-01 and lb-02
Run: sudo journalctl -u keepalived -n 50 to inspect recent Keepalived logs
## 8.5 Complete Source and Documentation References
Official Pentaho Documentation
Topic
URL
Archive Installation Overview
https://docs.pentaho.com/install/pentaho-installation-overview-cp/archive-installation
Prepare Linux Environment (10.2)
https://docs.pentaho.com/install/10.2-install/pentaho-installation-overview-cp/archive-installation/archive-installation-process/prepare-your-linux-environment-for-an-archive-install
Create Linux Directory Structure
https://docs.pentaho.com/install/10.2-install/pentaho-installation-overview-cp/archive-installation/archive-installation-process/prepare-your-linux-environment-for-an-archive-install/create-linux-directory-structure-archive-only-6-30-2020
Configure PostgreSQL as Repository
https://help.pentaho.com/Documentation/8.0/Setup/Installation/Archive/PostgreSQL_Repository
Modify Jackrabbit for PostgreSQL
https://docs.pentaho.com/install/pentaho-installation-overview-cp/archive-installation/archive-installation-process/use-postgresql-as-your-repository-database-archive-installation/configure-postgresql-pentaho-repositorydatabase/step-3-modify-jackrabbit-info-postgresql-archive
Set Up a Cluster (10.2)
https://docs.pentaho.com/pdia-admin/10.2-admin/manage-the-pentaho-system/manage-the-pentaho-server/set-up-a-cluster
Pentaho Configuration Reference
https://docs.pentaho.com/install/pentaho-configuration
Increase Memory on Linux
https://docs.pentaho.com/install/9.3-install/pentaho-configuration/tasks-to-be-performed-by-an-it-administrator/configure-the-pentaho-server/increase-the-pentaho-server-memory-limit/increase-pentaho-server-memory-limit-for-installations-on-linux
Create Startup Scripts on Linux
https://docs.pentaho.com/install/10.2-install/pentaho-configuration/tasks-to-be-performed-by-an-it-administrator/configure-the-pentaho-server/create-scripts-for-automatic-stop-and-start-of-the-pentaho-server-and-repository-on-linux
Acquire and Install Enterprise Licenses
https://docs.pentaho.com/install/pentaho-installation-overview-cp/acquire-and-install-enterprise-licenses
Install Local License Server on Linux
https://docs.pentaho.com/install/10.2-install/pentaho-installation-overview-cp/acquire-and-install-enterprise-licenses/install-and-manage-a-local-license-server/install-a-local-license-server-linux
Carte Cluster Setup (10.2)
https://docs.pentaho.com/pdia-data-integration/10.2-data-integration/advanced-topics-pentaho-data-integration-overview/use-carte-clusters/set-up-a-carte-cluster
Carte REST API Reference
https://help.pentaho.com/Documentation/8.1/Products/Data_Integration/Carte_Clusters
Use Carte Clusters
https://help.pentaho.com/Documentation/8.0/Products/Data_Integration/Carte_Clusters
Community Resources and Third-Party Guides
Topic / Source
URL
Pentaho Academy: Pentaho 10 Installation
https://academy.pentaho.com/pentaho-10-installation
Pentaho Academy: Prepare Environment (10.x)
https://academy.pentaho.com/installation-of-pentaho-10/installation/archive-installation/prepare-environment
Pentaho Academy: Install Pentaho Server (10.x)
https://academy.pentaho.com/installation-of-pentaho-10/installation/archive-installation/install-pentaho-server
TenthPlanet: Clustering PBA with PostgreSQL
https://blog.tenthplanet.in/clustering-and-loadbalancing-pba-with-standalone-postgres-and-apache-web-service/
Tech Spaghetti: Working with Pentaho Carte
https://tech-spaghetti.com/2023/12/02/working-with-pentaho-carte-server/
GitHub: Pentaho Server PostgreSQL config reference
https://github.com/firespring/pentaho-server
GitHub: doc-com/Pentaho-Server context.xml
https://github.com/doc-com/Pentaho-Server
Apache Jackrabbit Configuration Reference
https://jackrabbit.apache.org/jcr/jackrabbit-configuration.html
HAProxy Official Documentation
https://www.haproxy.org/
HAProxy: Sticky Sessions Guide
https://www.haproxy.com/blog/enable-sticky-sessions-in-haproxy
HAProxy: Load Balancing Affinity Explained
https://www.haproxy.com/blog/load-balancing-affinity-persistence-sticky-sessions-what-you-need-to-know
Keepalived Official Documentation
https://keepalived.org/manpage.html
Kifarunix: HA HAProxy + Keepalived on Ubuntu
https://kifarunix.com/configure-highly-available-haproxy-with-keepalived-on-ubuntu/
DigitalOcean: HAProxy + Keepalived Tutorial
https://www.digitalocean.com/community/tutorials/how-to-set-up-highly-available-haproxy-servers-with-keepalived-and-reserved-ips-on-ubuntu-14-04
MangoHost: HAProxy + Keepalived on Ubuntu 24
https://mangohost.net/blog/setting-up-highly-available-haproxy-servers-with-keepalived-and-reserved-ips-on-ubuntu-24/
PostgreSQL JDBC Driver Downloads
https://jdbc.postgresql.org/download/
Pentaho Support Portal
https://support.pentaho.com
Tray.io HTTP Client Connector Docs
https://docs.tray.ai/connectors/core/http-client
Tray.io Webhook Trigger Docs
https://tray.ai/documentation/connectors/triggers/webhook-trigger/
Tray.io On-Premises Agent / Connector Hub
https://tray.io/connectors