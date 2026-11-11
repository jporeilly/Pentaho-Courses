# Carte Cluster for Pentaho Data Integration Execution HA

> **Warning:**
>
> #### Workshop - Carte Cluster for Pentaho Data Integration Execution HA
>
> Give Pentaho Data Integration execution its own high availability with the installation guide's section 6: a Carte master and two Carte slave servers, with the slaves registering themselves with the master. Then define the same servers and a clustering schema in Spoon, ready for clustered transformations.
>
> **What you'll do**
>
> * Install the Pentaho Data Integration client on `carte-master`, `carte-slave-01` and `carte-slave-02`
> * Obfuscate the cluster password with `encr.sh`
> * Configure the master and its two slaves, and run each as a service
> * Check that both slaves have registered with the master
> * Define the slave servers and a clustering schema in Spoon, and assign a step to it
>
> **Prerequisites:**
>
> * [Deploy Pentaho in HA](../11-ha-deploy/guide.md): the same subnet and conventions
> * Three more Ubuntu 22.04 LTS hosts with `sudo`: `carte-master` (`10.0.1.40`), `carte-slave-01` (`10.0.1.41`) and `carte-slave-02` (`10.0.1.42`), the guide's reference addresses, with ports 9001 and 9002 open between them
> * `pdi-ee-client-11.0.0.0-237.zip` in your home folder on each of the three hosts
> * Spoon on a workstation that can reach the three hosts
>
> **Estimated time:** 45 minutes

:::: tabs

### 1. Install Pentaho Data Integration on the Carte Hosts

> **Note:**
>
> #### Install Pentaho Data Integration on the Carte Hosts
>
> Carte is the small web server in the Pentaho Data Integration client that runs transformations and jobs for remote callers. Run every command in this part on all three Carte hosts.

1. Install Java 21, the Java of Pentaho 11, and `unzip`:

   ```bash
   sudo apt update
   sudo apt install -y openjdk-21-jdk unzip
   ```

2. Create the `pentaho` user and its tools folder, and copy the archive in (guide section 6.1):

   ```bash
   sudo useradd -m -d /opt/pentaho -s /bin/bash pentaho
   sudo mkdir -p /opt/pentaho/design-tools
   sudo cp ~/pdi-ee-client-11.0.0.0-237.zip /opt/pentaho/
   sudo chown -R pentaho:pentaho /opt/pentaho
   ```

3. Switch to the `pentaho` user and extract the Pentaho Data Integration client:

   ```bash
   sudo su - pentaho
   cd /opt/pentaho/design-tools
   unzip -q ~/pdi-ee-client-11.0.0.0-237.zip
   chmod +x data-integration/*.sh
   ls data-integration/carte.sh data-integration/encr.sh data-integration/lib/postgresql-42.5.6.jar
   ```

> **Success:** Checkpoint: the three paths are listed. The 11.0 client ships its own PostgreSQL driver, so the guide's section 6.2, which copies one from the Pentaho Server, isn't needed.

4. Type `exit` to return to your own user.

### 2. Configure and Start Carte

> **Note:**
>
> #### Configure and Start Carte
>
> Each server reads one XML file. The master's describes itself; a slave's names the master it reports to, and then itself. All three use the user `cluster` (guide section 6.3); change its password before production (section 8.2).

1. On `carte-master`, obfuscate the password `cluster`:

   ```bash
   sudo -u pentaho /opt/pentaho/design-tools/data-integration/encr.sh -carte cluster
   ```

> **Success:** Checkpoint: `OBF:1v8w1uh21z7k1ym71z7i1ugo1v9q`. Use this value, not the example in the guide's section 6.3, wherever the files below have `<password>`.

2. On `carte-master`, create the master's configuration as the `pentaho` user, for example with `sudo -u pentaho nano /opt/pentaho/design-tools/data-integration/carte-master-config.xml`, and paste the guide's master configuration (section 6.4):

   ```xml
   <slave_config>
     <slaveserver>
       <name>CarteMaster</name>
       <hostname>10.0.1.40</hostname>
       <port>9001</port>
       <username>cluster</username>
       <password>OBF:1v8w1uh21z7k1ym71z7i1ugo1v9q</password>
       <master>Y</master>
     </slaveserver>
     <max_log_lines>0</max_log_lines>
     <max_log_timeout_minutes>0</max_log_timeout_minutes>
     <object_timeout_minutes>240</object_timeout_minutes>
   </slave_config>
   ```

3. On `carte-slave-01`, create `/opt/pentaho/design-tools/data-integration/carte-slave-config.xml` the same way, with the guide's slave configuration (section 6.5):

   ```xml
   <slave_config>
     <masters>
       <slaveserver>
         <name>CarteMaster</name>
         <hostname>10.0.1.40</hostname>
         <port>9001</port>
         <username>cluster</username>
         <password>OBF:1v8w1uh21z7k1ym71z7i1ugo1v9q</password>
         <master>Y</master>
       </slaveserver>
     </masters>
     <report_to_masters>Y</report_to_masters>
     <slaveserver>
       <name>CarteSlaveOne</name>
       <hostname>10.0.1.41</hostname>
       <port>9002</port>
       <username>cluster</username>
       <password>OBF:1v8w1uh21z7k1ym71z7i1ugo1v9q</password>
       <master>N</master>
       <get_properties_from_master>CarteMaster</get_properties_from_master>
       <override_existing_properties>Y</override_existing_properties>
     </slaveserver>
   </slave_config>
   ```

4. On `carte-slave-02`, create the same file with two values changed: `<name>CarteSlaveTwo</name>` and `<hostname>10.0.1.42</hostname>`. The port stays `9002`, as section 6.5 has it; the guide's port table (section 1.3) lists `9003` for this slave, which works too, since it is a different host.

5. On each host, create the Carte service (guide section 6.8). On `carte-master` the unit starts `carte-master-config.xml`:

   ```bash
   sudo tee /etc/systemd/system/carte.service > /dev/null <<'EOF'
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
   EOF
   ```

   On both slaves, create the same unit with `carte-slave-config.xml` at the end of `ExecStart`. The guide's unit names `carte-master-config.xml` on every host; a slave started with it would be a second master.

6. Start the master, then the two slaves:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable carte
   sudo systemctl start carte
   ```

> **Under the hood:**
>
> #### Each slave announces itself to the master
>
> With `<report_to_masters>Y</report_to_masters>`, a slave contacts every master in its `<masters>` list when it starts and registers its own `<slaveserver>` details. The master keeps that list and checks the slaves it holds; the guide's section 6 puts that at every 30 seconds. `get_properties_from_master` copies the master's Kettle variables to the slave, and `override_existing_properties` lets them replace the slave's own.
>
> **Why it matters:** a dynamic clustering schema needs to know only the master: in the words of Spoon's **Dynamic cluster** option, it "gets the list of slave servers from the first master slave server it can contact". Slaves can then join and leave without editing a schema.

7. From any host on the subnet, check that the master is online, then ask it which slaves have registered:

   ```bash
   curl -s -u cluster:cluster "http://10.0.1.40:9001/kettle/serverStatus/?xml=Y" | grep statusdesc
   curl -s -u cluster:cluster http://10.0.1.40:9001/kettle/getSlaves/ | grep "<name>"
   ```

> **Success:** Checkpoint: `<statusdesc>Online</statusdesc>`, then a `<name>` line each for `CarteSlaveOne` and `CarteSlaveTwo`.

### 3. Define the Cluster in Spoon

> **Note:**
>
> #### Define the Cluster in Spoon
>
> Spoon needs the servers and a clustering schema before a step can run on the cluster. You define them on the **View** tab of a transformation (guide section 6.10).

1. On your workstation, start Spoon from a terminal:

::: tabs

### Windows (PowerShell)

```powershell
Set-Location C:\Pentaho\design-tools\data-integration
.\spoon.bat
```

### macOS / Linux

```bash
cd ~/Pentaho/design-tools/data-integration
./spoon.sh
```

:::

2. Select **File > New > Transformation** (`Ctrl+N`).
3. On the **View** tab, right-click **Slave server** and select **New...**. The **Slave Server dialog** opens.
4. On the **Service** tab, set **Server name** to `CarteMaster`, **Hostname or IP address** to `10.0.1.40`, **Port (empty is port 80)** to `9001`, **Username** to `cluster` and **Password** to `cluster`. Select **Is the master**, then select **OK**.
5. Add the two slaves the same way, with **Is the master** cleared:

| Server name     | Hostname or IP address | Port (empty is port 80) | Username  | Password  | Is the master |
| --------------- | ---------------------- | ----------------------- | --------- | --------- | ------------- |
| `CarteMaster`   | `10.0.1.40`            | `9001`                  | `cluster` | `cluster` | selected      |
| `CarteSlaveOne` | `10.0.1.41`            | `9002`                  | `cluster` | `cluster` | cleared       |
| `CarteSlaveTwo` | `10.0.1.42`            | `9002`                  | `cluster` | `cluster` | cleared       |

> **Success:** Checkpoint: **Slave server** on the **View** tab lists `CarteMaster`, `CarteSlaveOne` and `CarteSlaveTwo`.

6. Right-click **Kettle cluster schemas** and select **New...**. The **Clustering schema dialog** opens.
7. Set **Schema name** to `HA_Carte_Cluster`, the guide's example. Leave **Port**, the first of the ports the servers use to pass rows to one another, as it is, and leave **Dynamic cluster** cleared: this cluster's servers are fixed.
8. Next to **Slave servers**, select **Select slave servers**. In **Select the servers**, select `CarteMaster`, `CarteSlaveOne` and `CarteSlaveTwo`, and select **OK**.

> **Success:** Checkpoint: the **Slave servers** grid lists the three servers by **Name** and **Service URL**, and **Master?** marks `CarteMaster` only.

9. Select **OK** to close the **Clustering schema dialog**. **Kettle cluster schemas** on the **View** tab now lists `HA_Carte_Cluster`.
10. On the **Design** tab, open the **Input** folder and drag **Generate Rows** onto the canvas.
11. Right-click **Generate Rows** and select **Clusters...**. In **Cluster schema**, select `HA_Carte_Cluster` and select **OK**.

> **Under the hood:**
>
> #### A clustered transformation is split into one for the master and one per slave
>
> When you run a transformation that has clustered steps, Pentaho Data Integration splits it. The clustered steps go into a slave transformation that runs on each slave server, and the rest into a master transformation on the master. Rows cross between them over sockets, starting at the schema's **Port**, which is what **Sockets buffer size**, **Sockets flush interval (rows)** and **Sockets data compressed?** tune.
>
> **Why it matters:** the cluster spreads the rows of one transformation across machines, and a slave that stops can be left out of a dynamic schema. It is the Pentaho Data Integration counterpart of the server cluster in the previous workshop.

12. On the **View** tab, right-click `HA_Carte_Cluster` and select **Monitor all slave servers**.

> **Success:** Checkpoint: **Generate Rows** is marked as clustered on the canvas, and Spoon opens a monitoring tab for each of the three servers.

::::

## Troubleshooting <!-- no-step -->

<details>
<summary>getSlaves lists no slave</summary>

Check each slave's log: `sudo journalctl -u carte -n 50`. A slave must reach `10.0.1.40:9001`, and its `<masters>` entry must carry the master's user and obfuscated password. Restart the slave after a fix: `sudo systemctl restart carte`.

</details>

<details>
<summary>curl returns 401</summary>

The user or password doesn't match the server's configuration file. The file holds the obfuscated value; `curl` and Spoon send the plain password, `cluster`.

</details>

<details>
<summary>Your jobs live in the Pentaho Repository</summary>

Each Carte server then needs your `repositories.xml`: copy it from the `.kettle` folder of your workstation to `/opt/pentaho/.kettle/` on each Carte host (guide section 6.6). For the Pentaho Server itself to act as the master, see the proxy trusting filter in section 6.9.

</details>

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches Pentaho Data Integration with the file loaded. If Pentaho Data Integration is already running, the path is copied to your clipboard — switch to Pentaho Data Integration and press `Ctrl+O`, `Ctrl+V`, `Enter`.

_No bundled files for this lab._ It follows section 6 of the installation guide, `Pentaho-HA-Installation-Guide.md`, in the **Lab Files** of [Deploy Pentaho in HA](../11-ha-deploy/guide.md).

### Solution <!-- no-step -->

The configuration files in part 2 and the Spoon definitions in part 3 are the finished cluster.
