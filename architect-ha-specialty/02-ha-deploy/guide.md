# Deploy Pentaho in HA

> **Warning:**
>
> #### Workshop - Deploy Pentaho in HA
>
> Build the installation guide's cluster on virtual machines: a shared PostgreSQL repository on `db-01`, two Pentaho Server 11 nodes with the Jackrabbit cluster journal and clustered Quartz, and two HAProxy balancers that share a Keepalived virtual IP (VIP). Then prove that it fails over. The bundled guide was written for Pentaho 10.x; where 11.0 differs, this workshop gives the 11.0 value and says why.
>
> **What you'll do**
>
> * Set up the PostgreSQL repository on `db-01` with the archive's own scripts
> * Install Pentaho Server 11 on `pentaho-node-01` and `pentaho-node-02` and configure it for the cluster
> * Configure HAProxy with sticky sessions, and the Keepalived VIP, on `lb-01` and `lb-02`
> * Run the guide's cluster tests: the VIP, sticky sessions, node and balancer failover, journal replication and Quartz registration
>
> **Prerequisites:**
>
> * The [Overview of Pentaho HA](../01-ha-overview/guide.md)
> * Five Ubuntu 22.04 LTS hosts on one subnet, with `sudo`, for the roles in part 1
> * NTP or chrony running on every host
> * `pentaho-server-ee-11.0.0.0-237.zip` in your home folder on `db-01` and on both Pentaho nodes
>
> **Estimated time:** 120 minutes

:::: tabs

### 1. Plan the Cluster

> **Note:**
>
> #### Plan the Cluster
>
> Every address in this workshop is the guide's reference value (section 1.1). Use your own if your network differs, the same on every host.
>
> | Host              | Address      | Role                                                 |
> | ----------------- | ------------ | ---------------------------------------------------- |
> | `pentaho-node-01` | `10.0.1.10`  | Pentaho Server node 1                                |
> | `pentaho-node-02` | `10.0.1.11`  | Pentaho Server node 2                                |
> | `lb-01`           | `10.0.1.20`  | HAProxy, Keepalived `MASTER`                         |
> | `lb-02`           | `10.0.1.21`  | HAProxy, Keepalived `BACKUP`                         |
> | VIP               | `10.0.1.100` | The address clients use, held by one balancer        |
> | `db-01`           | `10.0.1.30`  | PostgreSQL: `jackrabbit`, `quartz`, `hibernate`      |

1. On each host, set the host name to its role. On the first Pentaho node, for example:

   ```bash
   sudo hostnamectl set-hostname pentaho-node-01
   ```

   Quartz builds each node's instance name from its host name, so the cluster test in part 6 shows which node is which.

2. Open the ports of the guide's section 1.3 between the hosts:

| Port            | Between                              | For                               |
| --------------- | ------------------------------------ | --------------------------------- |
| 8080/tcp        | balancers → Pentaho nodes            | Tomcat                            |
| 80/tcp, 443/tcp | clients → VIP                        | The HAProxy front end             |
| 5432/tcp        | Pentaho nodes → `db-01`              | PostgreSQL                        |
| IP protocol 112 | `lb-01` ↔ `lb-02`                    | VRRP, the Keepalived heartbeat    |
| 8888/tcp        | your admin address → balancers       | The HAProxy statistics page       |

3. On every host, check that the clock is synchronized. The cluster rules (guide section 1.2) require it: Quartz compares check-in times across nodes.

   ```bash
   timedatectl
   ```

> **Success:** Checkpoint: on every host, `System clock synchronized: yes` and `NTP service: active`.

### 2. Repository on db-01

> **Note:**
>
> #### Repository on db-01
>
> Run every command in this part on `db-01`. The repository must be running before any Pentaho node starts (guide section 1.2).

1. Install PostgreSQL, version 14 on Ubuntu 22.04:

   ```bash
   sudo apt update
   sudo apt install -y postgresql postgresql-contrib
   psql --version
   ```

> **Success:** Checkpoint: `psql (PostgreSQL) 14.` followed by the patch version.

2. Open `/etc/postgresql/14/main/pg_hba.conf` in a text editor with `sudo` (the guide uses `sudo nano`). Change `peer` to `md5` on the line `local all all peer`, and add the two Pentaho nodes at the end. Leave `local all postgres peer` as it is: the scripts in step 6 run through it.

   ```text
   local   all             all                                     md5
   host    all             all             10.0.1.10/32            md5
   host    all             all             10.0.1.11/32            md5
   ```

3. Open `/etc/postgresql/14/main/postgresql.conf` the same way and set these values (guide section 2.3), then restart PostgreSQL:

| Setting                | Value                     |
| ---------------------- | ------------------------- |
| `listen_addresses`     | `'10.0.1.30,localhost'`   |
| `max_connections`      | `200`                     |
| `shared_buffers`       | `1GB`                     |
| `effective_cache_size` | `3GB`                     |
| `work_mem`             | `16MB`                    |
| `maintenance_work_mem` | `256MB`                   |

   ```bash
   sudo systemctl restart postgresql
   ```

4. Extract the five repository scripts from the archive:

   ```bash
   sudo apt install -y unzip
   unzip -j ~/pentaho-server-ee-11.0.0.0-237.zip 'pentaho-server/data/postgresql/create_*' 'pentaho-server/data/postgresql/pentaho_logging_postgresql.sql' 'pentaho-server/data/postgresql/pentaho_mart_postgresql.sql' -d /tmp/pentaho-ddl
   ls /tmp/pentaho-ddl
   ```

> **Success:** Checkpoint: 5 files: `create_jcr_postgresql.sql`, `create_quartz_postgresql.sql`, `create_repository_postgresql.sql`, `pentaho_logging_postgresql.sql` and `pentaho_mart_postgresql.sql`.

5. Read how the first script starts:

   ```bash
   head -12 /tmp/pentaho-ddl/create_jcr_postgresql.sql
   ```

> **Warning:** these scripts don't expect the users and databases of the guide's section 2.4: they create their own, with the password `password`. The JCR and repository scripts first drop their database and user if they exist; the Quartz script creates its user and database when they are missing. The Quartz, logging and mart scripts then reconnect as `pentaho_user` or `hibuser` to create their tables. Run them as `postgres`, as below, instead of the guide's sections 2.4 and 2.5. For other passwords, change `PASSWORD 'password'` in the three `create_` scripts first, and use the same values in `context.xml` in part 3.

6. Run the scripts in this order. When `psql` asks for the password of `pentaho_user` or `hibuser`, enter `password`.

   ```bash
   cd /tmp/pentaho-ddl
   sudo -u postgres psql -f create_jcr_postgresql.sql
   sudo -u postgres psql -f create_quartz_postgresql.sql
   sudo -u postgres psql -f create_repository_postgresql.sql
   sudo -u postgres psql -f pentaho_logging_postgresql.sql
   sudo -u postgres psql -f pentaho_mart_postgresql.sql
   sudo -u postgres psql -c "\l"
   ```

> **Success:** Checkpoint: `\l` lists `hibernate` owned by `hibuser`, `jackrabbit` owned by `jcr_user`, and `quartz` owned by `pentaho_user`. Run the scripts only this once: both nodes share these databases (guide section 2.5).

### 3. Pentaho Server on Node 1

> **Note:**
>
> #### Pentaho Server on Node 1
>
> Run every command in this part on `pentaho-node-01`. The 11.0 archive ships already set up for a PostgreSQL repository through Tomcat's JNDI data sources, so several of the guide's edits for 10.x shrink to one line.

1. Install Java 21. Pentaho 11 runs on Java 21; the guide's JDK 11 is the 10.x requirement.

   ```bash
   sudo apt update
   sudo apt install -y openjdk-21-jdk
   java -version
   echo 'JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64' | sudo tee -a /etc/environment
   ```

> **Success:** Checkpoint: `java -version` prints `openjdk version "21.` followed by the update number.

Don't add the guide's second line, `PATH=$PATH:$JAVA_HOME/bin`, to `/etc/environment`: that file doesn't expand variables, so the next sign-in would set `PATH` to that literal text. `java` is already on the path.

2. Create the `pentaho` user and the directory layout (guide section 3.2). `passwd` asks you to choose the user's password.

   ```bash
   sudo useradd -m -d /opt/pentaho -s /bin/bash pentaho
   sudo passwd pentaho
   sudo usermod -aG sudo pentaho
   sudo mkdir -p /opt/pentaho/server /opt/pentaho/.pentaho /opt/pentaho/software/server /opt/pentaho/software/db_drivers
   sudo cp ~/pentaho-server-ee-11.0.0.0-237.zip /opt/pentaho/software/server/
   sudo chown -R pentaho:pentaho /opt/pentaho
   ```

3. Switch to the `pentaho` user and extract the archive with `jar`, as the guide does (section 3.3). `jar` doesn't keep file permissions, so make the scripts executable afterward.

   ```bash
   sudo su - pentaho
   cd /opt/pentaho/server
   jar -xvf /opt/pentaho/software/server/pentaho-server-ee-11.0.0.0-237.zip
   find /opt/pentaho/server -iname "*.sh" -exec bash -c 'chmod +x "$0"' {} \;
   ls /opt/pentaho/server
   ```

> **Success:** Checkpoint: `/opt/pentaho/server` holds `jdbc-distribution`, `license-installer` and `pentaho-server`.

The guide's section 3.4 downloads a newer PostgreSQL driver. It is optional on 11.0: the archive already ships `tomcat/lib/postgresql-42.5.6.jar`.

4. Point the server's data sources at `db-01` (guide section 3.5). The archive's `context.xml` defines every repository resource against `localhost:5432`, with the users and the password the scripts created, so changing the address is enough. Keep the file instead of replacing it as the guide does: it also defines `jdbc/PDI_Operations_Mart`, `jdbc/pentaho_operations_mart` and `jdbc/live_logging_info`.

   ```bash
   cd /opt/pentaho/server/pentaho-server
   sed -i 's#localhost:5432#10.0.1.30:5432#g' tomcat/webapps/pentaho/META-INF/context.xml
   grep -c "10.0.1.30:5432" tomcat/webapps/pentaho/META-INF/context.xml
   ```

> **Success:** Checkpoint: `7`, one line for each resource that uses the repository:
>
> | Resource                       | Database                                   | User           |
> | ------------------------------ | ------------------------------------------ | -------------- |
> | `jdbc/Hibernate`               | `hibernate`                                | `hibuser`      |
> | `jdbc/Audit`                   | `hibernate`                                | `hibuser`      |
> | `jdbc/Quartz`                  | `quartz`                                   | `pentaho_user` |
> | `jdbc/PDI_Operations_Mart`     | `hibernate`                                | `hibuser`      |
> | `jdbc/pentaho_operations_mart` | `hibernate`                                | `hibuser`      |
> | `jdbc/live_logging_info`       | `hibernate`, schema `pentaho_dilogs`       | `hibuser`      |
> | `jdbc/jackrabbit`              | `jackrabbit`                               | `jcr_user`     |

5. Give this node its Jackrabbit cluster ID (guide sections 3.6 and 3.7). In 11.0, `repository.xml` already uses the PostgreSQL blocks and already has an active cluster journal, `<Cluster id="node1">`, which reaches the database through `jdbc/jackrabbit`. Only the ID changes.

   ```bash
   sed -i 's#<Cluster id="node1">#<Cluster id="NODE_1">#' pentaho-solutions/system/jackrabbit/repository.xml
   grep -A8 "<Cluster" pentaho-solutions/system/jackrabbit/repository.xml
   ```

> **Success:** Checkpoint: `<Cluster id="NODE_1">`, then a `DatabaseJournal` with `url` `java:comp/env/jdbc/jackrabbit`, `schema` `postgresql` and `schemaObjectPrefix` `cl_j_`.

6. Switch Spring Security's Hibernate settings to PostgreSQL (guide section 3.8). The archive keeps a PostgreSQL copy of the file under `dialects`:

   ```bash
   cp pentaho-solutions/system/dialects/postgresql/applicationContext-spring-security-hibernate.properties pentaho-solutions/system/
   cat pentaho-solutions/system/applicationContext-spring-security-hibernate.properties
   ```

> **Success:** Checkpoint: `jdbc.driver=org.postgresql.Driver`, `jdbc.url=java:comp/env/jdbc/Hibernate` and `hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect`.

`hibernate-settings.xml` already names `system/hibernate/postgresql.hibernate.cfg.xml`, and that file takes its connection from `jdbc/Hibernate`, so the guide's edit of `connection.url` has no counterpart in 11.0.

7. Open `pentaho-solutions/system/scheduler-plugin/quartz/quartz.properties` in a text editor and make Quartz clustered (guide section 3.9). Change the first two values, add the third line, and keep the rest:

| Property                                     | 11.0 archive                                     | Set to      |
| -------------------------------------------- | ------------------------------------------------ | ----------- |
| `org.quartz.scheduler.instanceId`            | `1`                                              | **`AUTO`**  |
| `org.quartz.jobStore.isClustered`            | `false`                                          | **`true`**  |
| `org.quartz.jobStore.clusterCheckinInterval` | not in the file                                  | **`20000`** |
| `org.quartz.jobStore.driverDelegateClass`    | `org.quartz.impl.jdbcjobstore.PostgreSQLDelegate` | keep        |
| `org.quartz.dataSource.myDS.jndiURL`         | `Quartz`                                         | keep        |
| `org.quartz.jobStore.tablePrefix`            | `QRTZ6_`                                         | keep        |
| `org.quartz.jobStore.misfireThreshold`       | `60000`                                          | keep        |

Keep `QRTZ6_`: the guide's `QRTZ5_` is the 10.x prefix, which the 11.0 file still shows in a comment. `create_quartz_postgresql.sql` created `QRTZ6_` tables.

8. Set the server's own address to the VIP (guide section 3.10), turn the Data Source Wizard's domain cache off (section 3.11), and raise the initial heap to the guide's 4 GB (section 3.13). In 11.0 the heap is set in `start-pentaho.sh`, as `-Xms2048m -Xmx6144m`; there is no `tomcat/scripts/ctl.sh`.

   ```bash
   sed -i 's#^fully-qualified-server-url=.*#fully-qualified-server-url=http://10.0.1.100:80/pentaho#' pentaho-solutions/system/server.properties
   sed -i 's/^# enableDomainIdCache = false/enableDomainIdCache = false/' pentaho-solutions/system/system.properties
   sed -i 's/-Xms2048m -Xmx6144m/-Xms4096m -Xmx6144m/' start-pentaho.sh
   grep -h -E "^fully-qualified-server-url|^enableDomainIdCache|-Xms" pentaho-solutions/system/server.properties pentaho-solutions/system/system.properties start-pentaho.sh
   grep -E "^org.quartz.(scheduler.instanceId|jobStore.isClustered|jobStore.clusterCheckinInterval)" pentaho-solutions/system/scheduler-plugin/quartz/quartz.properties
   ```

> **Success:** Checkpoint: `fully-qualified-server-url=http://10.0.1.100:80/pentaho`, `enableDomainIdCache = false`, and a `CATALINA_OPTS` line that starts `-Xms4096m -Xmx6144m`. The last command shows your Quartz edits: `instanceId = AUTO`, `isClustered = true` and `clusterCheckinInterval = 20000`.

9. Set the license path (guide section 3.12):

   ```bash
   echo 'PENTAHO_LICENSE_INFORMATION_PATH=/opt/pentaho/.elmLicInfo.plt' | sudo tee -a /etc/environment
   ```

10. Create the service (guide section 3.14). The unit is the guide's.

    ```bash
    sudo tee /etc/systemd/system/pentaho.service > /dev/null <<'EOF'
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
    EOF
    sudo systemctl daemon-reload
    sudo systemctl enable pentaho
    ```

11. Start the server and follow Tomcat's log until it reports that it has started, then press `Ctrl+C` to stop following:

    ```bash
    sudo systemctl start pentaho
    tail -f /opt/pentaho/server/pentaho-server/tomcat/logs/catalina.out
    ```

> **Under the hood:**
>
> #### Every write goes through the cluster journal
>
> With a `<Cluster>` element, Jackrabbit writes each change to the content repository as a record in a journal: tables with the prefix `cl_j_` in the `jackrabbit` database, shared by both nodes. Each record carries the ID of the node that wrote it. A node regularly reads the records it hasn't seen yet and applies the ones another node wrote, which keeps its caches and search index in step; `cl_j_global_revision` holds the number of the newest record.
>
> **Why it matters:** this is why the ID must differ per node (guide section 3.7). Two nodes with one ID would each take the other's changes for their own and skip them, and serve different content from the same database.

12. Ask the node for its sign-in page:

    ```bash
    curl -Is http://10.0.1.10:8080/pentaho/Login | head -1
    ```

> **Success:** Checkpoint: the log ended with a line containing `Server startup in`, and `curl` prints a status line with `200`.

### 4. Pentaho Server on Node 2

> **Note:**
>
> #### Pentaho Server on Node 2
>
> `pentaho-node-02` gets the same configuration, with one difference: its cluster ID. Start it only after node 1 has fully started (guide section 3.14).

1. On `pentaho-node-02`, repeat steps 1 to 10 of part 3, except step 5, the cluster ID. Don't run the repository scripts again: both nodes share the databases, and the JCR, Quartz and repository scripts start by dropping the databases or tables they create (guide section 3.15).
2. In step 5's place, give this node the ID `NODE_2`:

    ```bash
    cd /opt/pentaho/server/pentaho-server
    sed -i 's#<Cluster id="node1">#<Cluster id="NODE_2">#' pentaho-solutions/system/jackrabbit/repository.xml
    grep "<Cluster" pentaho-solutions/system/jackrabbit/repository.xml
    ```

> **Success:** Checkpoint: `<Cluster id="NODE_2">`.

3. Start the server, follow the log until `Server startup in`, and press `Ctrl+C`. Then ask for the sign-in page:

    ```bash
    sudo systemctl start pentaho
    tail -f /opt/pentaho/server/pentaho-server/tomcat/logs/catalina.out
    curl -Is http://10.0.1.11:8080/pentaho/Login | head -1
    ```

> **Success:** Checkpoint: a status line with `200`.

### 5. Load Balancers

> **Note:**
>
> #### Load Balancers
>
> Both balancers run the same HAProxy configuration. Keepalived gives the VIP to `lb-01`, and moves it to `lb-02` when `lb-01` stops sending its VRRP heartbeat.

1. On `lb-01` and `lb-02`, install HAProxy and Keepalived, and let HAProxy bind to the VIP before it arrives (guide sections 4.1 and 4.2):

   ```bash
   sudo apt update
   sudo apt install -y haproxy keepalived
   echo "net.ipv4.ip_nonlocal_bind = 1" | sudo tee -a /etc/sysctl.conf
   echo "net.ipv4.ip_forward = 1" | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

> **Success:** Checkpoint: `sysctl -p` prints `net.ipv4.ip_nonlocal_bind = 1` and `net.ipv4.ip_forward = 1`.

2. On both balancers, open `/etc/haproxy/haproxy.cfg` in a text editor with `sudo` and replace its content with the guide's configuration (section 4.3). The statistics page's password is yours to choose: replace `<stats-password>`.

   ```text
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

   listen stats
       bind *:8888
       stats enable
       stats uri     /stats
       stats realm   "Pentaho HA Statistics"
       stats auth    admin:<stats-password>
       stats refresh 5s
       stats show-legends
       stats show-node

   frontend pentaho_front
       bind *:80
       default_backend pentaho_back
       capture request header Host len 64

   backend pentaho_back
       balance roundrobin
       cookie JSESSIONID prefix nocache
       option  httpchk GET /pentaho/Login
       http-check expect status 200
       server pentaho-node-01 10.0.1.10:8080 check inter 5000 rise 2 fall 3 cookie S1
       server pentaho-node-02 10.0.1.11:8080 check inter 5000 rise 2 fall 3 cookie S2
   ```

3. On both balancers, check the configuration and restart HAProxy:

   ```bash
   sudo haproxy -f /etc/haproxy/haproxy.cfg -c
   sudo systemctl restart haproxy
   ```

> **Success:** Checkpoint: `Configuration file is valid`.

4. On each balancer, create `/etc/keepalived/keepalived.conf` in a text editor with `sudo` (guide sections 4.4 and 4.5). Replace `ens3` with the interface that carries the balancer's address (`ip addr show` lists them), and `<vrrp-key>` with a key of your own, the same on both; VRRP uses its first 8 characters. The two files differ in three values:

| Setting     | `lb-01`      | `lb-02`     |
| ----------- | ------------ | ----------- |
| `router_id` | `LB_PRIMARY` | `LB_BACKUP` |
| `state`     | `MASTER`     | `BACKUP`    |
| `priority`  | `110`        | `100`       |

The file for `lb-01`; on `lb-02`, change the three values above:

   ```text
   global_defs {
       router_id         LB_PRIMARY
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
       state             MASTER
       interface         ens3
       virtual_router_id 51
       priority          110
       advert_int        1
       authentication {
           auth_type PASS
           auth_pass <vrrp-key>
       }
       virtual_ipaddress {
           10.0.1.100/24
       }
       track_script {
           chk_haproxy
       }
   }
   ```

5. On both balancers, start Keepalived. Then, on `lb-01`, look for the VIP:

   ```bash
   sudo systemctl enable keepalived
   sudo systemctl start keepalived
   ip addr show ens3
   ```

> **Success:** Checkpoint: on `lb-01`, the interface has a second address, `inet 10.0.1.100/24`. On `lb-02`, `ip addr show ens3` shows no such address.

### 6. Verify the Cluster

> **Note:**
>
> #### Verify the Cluster
>
> These are the guide's tests (section 5.2). Run the `curl` commands from any host on the subnet, and each `systemctl` command on the host it names.

1. Test 1: ask for the sign-in page through the VIP, and from each node directly. Then open `http://10.0.1.100:8888/stats` in a browser and sign in as `admin` with your statistics password.

   ```bash
   curl -Is http://10.0.1.100/pentaho/Login | head -1
   curl -Is http://10.0.1.10:8080/pentaho/Login | head -1
   curl -Is http://10.0.1.11:8080/pentaho/Login | head -1
   ```

> **Success:** Checkpoint: three status lines with `200`, and the statistics page shows `pentaho-node-01` and `pentaho-node-02` up in `pentaho_back`.

2. Test 2: send five requests with one cookie jar, then read the session cookie HAProxy returned:

   ```bash
   rm -f /tmp/cookies.txt
   for i in 1 2 3 4 5; do
     curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt http://10.0.1.100/pentaho/Login -o /dev/null -w "Request $i: %{http_code}\n"
   done
   grep JSESSIONID /tmp/cookies.txt
   ```

> **Under the hood:**
>
> #### HAProxy pins each session by prefixing Pentaho's own cookie
>
> `cookie JSESSIONID prefix nocache` adds no cookie of HAProxy's own. When Tomcat sets `JSESSIONID`, HAProxy puts the server's `cookie` value, `S1` or `S2`, and a `~` in front of it on the way out. On the way in, it reads the prefix, sends the request to that server, and strips the prefix, so Tomcat sees the session ID it issued. `nocache` asks caches between the client and HAProxy not to store a response that sets the cookie.
>
> **Why it matters:** Pentaho doesn't copy sessions between nodes (guide section 1.2), so every request of a session must reach the node that holds it. When that node fails, `option redispatch` sends the request to the other one, where the user signs in again.

3. Test 3: on `pentaho-node-01`, stop the server. Then, from any host, ask for the sign-in page through the VIP:

   ```bash
   sudo systemctl stop pentaho
   ```

   ```bash
   curl -Is http://10.0.1.100/pentaho/Login | head -1
   ```

> **Success:** Checkpoint: test 2 printed `Request 1: 200` to `Request 5: 200`, and the cookie's value began with `S1~` or `S2~`. With node 1 stopped, the VIP still answers with `200`, from node 2.

4. On `pentaho-node-01`, start the server again: `sudo systemctl start pentaho`.

> **Warning:** with the guide's Keepalived values, stopping only HAProxy on `lb-01` does not move the VIP (the guide's test 4 expects that it does). The check adds its `weight` of 2 while HAProxy runs: `lb-01` has 112 and `lb-02` 102. When HAProxy stops on `lb-01`, it drops to 110, still above 102, so it keeps the VIP. The next test stops all of `lb-01`'s VRRP instead.

5. Test 4: on `lb-01`, stop Keepalived. Then, on `lb-02`, look for the VIP, and ask for the sign-in page through it:

   ```bash
   sudo systemctl stop keepalived
   ```

   ```bash
   ip addr show ens3
   curl -Is http://10.0.1.100/pentaho/Login | head -1
   ```

> **Success:** Checkpoint: within a few seconds, `lb-02` holds `inet 10.0.1.100/24`, and the VIP answers with `200`.

6. On `lb-01`, start Keepalived again: `sudo systemctl start keepalived`. With the higher priority, `lb-01` takes the VIP back.
7. Test 5: open `http://10.0.1.10:8080/pentaho` (node 1, not the VIP) and sign in as `admin`. Select **Browse Files**, select the **Public** folder, and under **Folder Actions** select **New Folder...**. Set **Name** to `ha-test` and select **OK**.
8. Open `http://10.0.1.11:8080/pentaho` (node 2), sign in, select **Browse Files** and select the **Public** folder.

> **Success:** Checkpoint: node 2 lists `ha-test`, which node 1 created: the journal carried it across.

9. Test 6: on `db-01`, read the scheduler's cluster state. Enter `password` when `psql` asks.

   ```bash
   psql -h localhost -U pentaho_user -d quartz -c "SELECT instance_name, last_checkin_time, checkin_interval FROM qrtz6_scheduler_state;"
   ```

> **Under the hood:**
>
> #### Quartz shares out triggers through row locks in the database
>
> A clustered Quartz node writes a check-in row to `qrtz6_scheduler_state` every `clusterCheckinInterval`, 20 seconds. To fire a trigger, a node first takes the row `TRIGGER_ACCESS` in `qrtz6_locks` with `SELECT ... FOR UPDATE`, so only one node at a time acquires triggers, and each trigger fires on one node. When a node misses its check-ins, another node recovers the jobs it was running.
>
> **Why it matters:** a schedule fires once for the whole cluster, not once per node. And the check-in times are compared across nodes, which is why every clock must be synchronized.

10. Run the query again after 20 seconds.

> **Success:** Checkpoint: 2 rows, one per node. Each `instance_name` starts with the node's host name, `pentaho-node-01` or `pentaho-node-02`, followed by digits, because `instanceId` is `AUTO`; `checkin_interval` is `20000`. The second query shows a larger `last_checkin_time` for both.

::::

## Troubleshooting <!-- no-step -->

<details>
<summary>A node fails to start with repository or connection errors</summary>

From the node, test the database: `psql -h 10.0.1.30 -U hibuser -d hibernate -c "SELECT 1;"` (install `postgresql-client` first). If it fails, check the `host` lines in `db-01`'s `pg_hba.conf` and `listen_addresses` in `postgresql.conf`, and that `context.xml` has `10.0.1.30:5432` (guide section 8.4).

</details>

<details>
<summary>Users lose their session between requests</summary>

Check that `cookie JSESSIONID prefix nocache` is in the `backend` section of `haproxy.cfg` on both balancers, that the statistics page shows both nodes up, and that `fully-qualified-server-url` is the VIP, not a node address.

</details>

<details>
<summary>Content created on one node doesn't appear on the other</summary>

Check the cluster IDs: `grep "<Cluster" pentaho-solutions/system/jackrabbit/repository.xml` must show `NODE_1` on node 1 and `NODE_2` on node 2. Then restart node 2: at start, a node replays the journal records it hasn't seen.

</details>

<details>
<summary>Scheduled jobs run on both nodes</summary>

`quartz.properties` must have `isClustered = true` and `instanceId = AUTO` on both nodes, and `qrtz6_scheduler_state` must show two rows. Restart node 1, then node 2.

</details>

<details>
<summary>No balancer holds the VIP</summary>

`virtual_router_id` and `auth_pass` must match on both balancers, and IP protocol 112 must pass between them. Read Keepalived's log: `sudo journalctl -u keepalived -n 50`.

</details>

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches Pentaho Data Integration with the file loaded. If Pentaho Data Integration is already running, the path is copied to your clipboard — switch to Pentaho Data Integration and press `Ctrl+O`, `Ctrl+V`, `Enter`.

The installation guide this workshop follows, with the full reference topology, configurations and operations commands:

[Pentaho-HA-Installation-Guide.md](./files/ha-install/Pentaho-HA-Installation-Guide.md)

A map of the guide by role: `make help` lists which section each target covers. Each script installs its role's packages, where it has any, and prints the guide's steps for that role. `node-setup.sh` installs `openjdk-11-jdk`, the 10.x Java; this workshop installs Java 21 instead.

[Makefile](./files/ha-install/Makefile)

[db-setup.sh](./files/ha-install/scripts/db-setup.sh)

[node-setup.sh](./files/ha-install/scripts/node-setup.sh)

[lb-setup.sh](./files/ha-install/scripts/lb-setup.sh)

[verify.sh](./files/ha-install/scripts/verify.sh)

### Solution <!-- no-step -->

The installation guide is the reference solution: its sections 2 to 5 build the cluster this workshop describes, with the 11.0 differences given in the steps above.
