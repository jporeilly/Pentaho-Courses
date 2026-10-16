# Run Configurations

> **Warning:**
>
> #### Workshop - Run Configurations
> 
> A run configuration decides *where* a transformation runs: on this machine, on a Carte server, or across a Carte cluster.\
> In this guided demonstration you start three Carte servers on this machine, register them in Spoon, and run the Hello World transformation on one of them, then across all three.
> 
> **What you'll do**
> 
> * Start a master and two slave Carte servers
> * Register them in Spoon as slave servers
> * Run a transformation on one server with a run configuration
> * Define a cluster schema and run a step across the cluster
> 
> **Prerequisites:** [Review Scalability](../topic-mod5-scalability-review/guide.md); `tr_hello_world.ktr` from [Hello World](../03-mod2-hello-world/guide.md)
> 
> **Estimated time:** 20 minutes

<figure>

![The Hello World transformation that runs on the servers](../_assets/images/hello-world-tr-2.png)

<div align="center">
<figcaption><em>The transformation you run on the servers</em></figcaption>
</div>
</figure>

:::: tabs

### 1. Master & Slave nodes

> **Note:** Each server (node) is a Carte instance, in one of two roles:
> 
> * **Master**: coordinates a clustered run. It hands each node its share of the work and collects the progress and results.
> * **Slave**: runs the jobs and transformations, or parts of them, that it is sent.
> 
> Here all three run on this machine, on different ports. In production each is a separate server.

**Master Node**

> **Note:** Each Carte instance runs in its own terminal and keeps it busy, so you need three terminals.

1. In a terminal start the master on port 12000:

::: tabs

### Windows (PowerShell)

```powershell
Set-Location C:\Pentaho\design-tools\data-integration
.\Carte.bat localhost 12000
```

### macOS / Linux

```bash
cd ~/Pentaho/design-tools/data-integration
./carte.sh localhost 12000
```

:::

<figure><img src="../_assets/images/master-node.png" alt="Master node - port 12000"><figcaption><p>Master node - port 12000</p></figcaption></figure>

**Slave Nodes**

1. In a new terminal start Slave A on port 12100:

::: tabs

### Windows (PowerShell)

```powershell
Set-Location C:\Pentaho\design-tools\data-integration
.\Carte.bat localhost 12100
```

### macOS / Linux

```bash
cd ~/Pentaho/design-tools/data-integration
./carte.sh localhost 12100
```

:::

<figure><img src="../_assets/images/run-slave-a.png" alt="Slave node A - port 12100"><figcaption><p>Slave node A - port 12100</p></figcaption></figure>

2. In a new terminal start Slave B on port 12200:

::: tabs

### Windows (PowerShell)

```powershell
Set-Location C:\Pentaho\design-tools\data-integration
.\Carte.bat localhost 12200
```

### macOS / Linux

```bash
cd ~/Pentaho/design-tools/data-integration
./carte.sh localhost 12200
```

:::

<figure><img src="../_assets/images/run-slave-b.png" alt="Slave node B - port 12200"><figcaption><p>Slave node B - port 12200</p></figcaption></figure>

> **Warning:** You now have 3 terminals, each running a Carte instance. Keep them open until the end of the workshop: closing a terminal stops its server.

### 2. Configure Nodes

1. Open the tr\_hello\_world transformation (from [Hello World](../03-mod2-hello-world/guide.md), or its solution `tr_hello_world.ktr`).
2. Select the **View** tab.
3. Right-click **Slave server** and select **New**.

<figure><img src="../_assets/images/configure-nodes.png" alt="Configure Nodes" width="375"><figcaption><p>Configure Nodes</p></figcaption></figure>

<table><thead><tr><th width="253">Option</th><th>Description</th></tr></thead><tbody><tr><td><strong>Server name</strong></td><td>The name of the slave server.</td></tr><tr><td><strong>Hostname or IP address</strong></td><td>The address of the device to be used as a slave.</td></tr><tr><td><strong>Port (empty is port 80)</strong></td><td>Defines the port you are for communicating with the remote server. If you leave the port blank, 80 is used.</td></tr><tr><td><strong>Web App Name (required for Pentaho Server)</strong></td><td>Leave this blank if you are setting up a Carte server. This field is used for connecting to the Pentaho server.</td></tr><tr><td><strong>User name</strong></td><td>Enter the user name for accessing the remote server.</td></tr><tr><td><strong>Password</strong></td><td>Enter the password for accessing the remote server. A Carte server started as above accepts the user name <code>cluster</code> and password <code>cluster</code>.</td></tr><tr><td><strong>Is the master</strong></td><td>Enables this server as the master server in any clustered executions of the transformation.</td></tr></tbody></table>

Below are the proxy tab options:

<table><thead><tr><th width="255">Option</th><th>Description</th></tr></thead><tbody><tr><td><strong>Proxy server hostname</strong></td><td>Sets the host name for the proxy server you are using.</td></tr><tr><td><strong>The proxy server port</strong></td><td>Sets the port number used for communicating with the proxy.</td></tr><tr><td><strong>Ignore proxy for hosts: regexp | separated</strong></td><td>Specify the server(s) for which the proxy should not be active. This option supports specifying multiple servers using regular expressions. You can also add multiple servers and expressions separated by the ' | ' character.</td></tr></tbody></table>

**Master Node**

1. Enter the following settings to configure the Master node:

<figure><img src="../_assets/images/master-dialog.png" alt="Master Node"><figcaption><p>Master Node</p></figcaption></figure>

**Slave Nodes**

1. Enter the following settings to configure the Slave node A:

<figure><img src="../_assets/images/slave-a-dialog.png" alt="Slave Node A"><figcaption><p>Slave Node A</p></figcaption></figure>

2. Enter the following settings to configure the Slave node B:

<figure><img src="../_assets/images/slave-b-dialog.png" alt="Slave Node B"><figcaption><p>Slave Node B</p></figcaption></figure>

> **Success:** Checkpoint: the **View** tab lists three slave servers, Master, Slave A and Slave B.

### 3. Run configurations

> **Note:** With three servers running, create run configurations that send the transformation to a particular server.
> 
> Light work, such as loading a small file or filtering a few rows, runs well on your own machine with the default configuration, **Pentaho local**. Heavier work can run on a server dedicated to it, with the same Pentaho engine; that is what a run configuration pointing at a Carte server does.

<figure><img src="../_assets/images/hello-world-tr-2.png" alt="Tr_hello_world"><figcaption><p>tr_hello_world</p></figcaption></figure>

::: tabs

### 3.1 Nodes

> **Note:** Pentaho local is the default run configuration. It runs transformations with the Pentaho engine on your local machine. You cannot edit this default configuration.

1. Ensure you have configured the Nodes.

<figure><img src="../_assets/images/list-slave-nodes.png" alt="Slave Nodes"><figcaption><p>Slave Nodes</p></figcaption></figure>

2. To create a run configuration, right-click the **Run configurations** folder in the **View** tab and select **New**.

<figure><img src="../_assets/images/run-config.png" alt="Run configuration"><figcaption><p>Run configuration</p></figcaption></figure>

3. Enter the details below, with the **Pentaho** engine selected.

<figure><img src="../_assets/images/master-config.png" alt="Master - Run configuration"><figcaption><p>Master - Run configuration</p></figcaption></figure>

4. Run the transformation, and in **Run Options** select the **Master** run configuration.

<figure><img src="../_assets/images/run-master.png" alt="Run configuration - Master"><figcaption><p>Run configuration - Master</p></figcaption></figure>

> **Success:** Checkpoint: the transformation runs on the master node, and Spoon shows its step metrics, fetched from the server.

<figure><img src="../_assets/images/run-master-result.png" alt="Run configuration - Master"><figcaption><p>Run configuration - Master</p></figcaption></figure>

5. Take a look at the Master Terminal.

<figure><img src="../_assets/images/terminal-master.png" alt="Master Terminal"><figcaption><p>Master Terminal</p></figcaption></figure>

> **Under the hood:**
>
> #### Spoon shipped the XML over HTTP; Carte ran the same engine
>
> Selecting the *Master* run configuration changed where, not what.
> Spoon serialized the transformation to its XML, posted it to the
> Carte instance on port 12000 at `/kettle/registerTrans`, then called
> `/kettle/prepareExec` and `/kettle/startExec`. Carte — a small Jetty
> web server wrapped around exactly the engine you have been running
> locally — parsed the XML, allocated the same threads and row sets,
> and ran it. The Step Metrics you watched arrived because Spoon then
> polled `/kettle/transStatus` every few seconds.
>
> Nothing was installed on the node and nothing was compiled. The
> terminal shows the same log lines you would see in Spoon because it
> *is* the same code.
>
> **Why it matters:** "deploy to the server" is an HTTP call with a
> file in it. Pentaho Server's scheduler, Kitchen on a cron box and
> this dialog all drive the same API, so what runs in the run dialog is
> what runs in production.

> **Tip:** Create run configurations for Slave A and Slave B the same way, and run the transformation on each.

### 3.2 Cluster schema

> **Note:** A cluster schema is a named set of slave servers, one of which is the master. The master is also a Carte instance; it coordinates the work across the others.

> **Note:** The workflow in a clustered Pentaho transformation is as follows:
> 
> • The job entry or the transformation connects to the cluster master node, which is responsible for coordinating the execution of the transformation steps on the cluster slave nodes.
> 
> • The master node sends the transformation metadata and the cluster schema to the slave nodes, and assigns each step to one or more nodes based on the cluster schema.
> 
> • The slave nodes execute the assigned steps and exchange data with each other using sockets or shared files, depending on the partitioning method and the clustering plugin used.
> 
> • The master node monitors the progress and status of the slave nodes, and collects logging information and performance metrics from them.
> 
> • The master node reports the outcome of the transformation execution to the job entry or the transformation that initiated it.

**Cluster Schema**

1. To create a cluster schema, right-click the **Kettle cluster schemas** folder in the **View** tab and select **New**.

<figure><img src="../_assets/images/kettle-schema.png" alt="Kettle cluster schema"><figcaption><p>Kettle cluster schema</p></figcaption></figure>

2. Enter the following configuration details.

<figure><img src="../_assets/images/cluster-schema.png" alt="Pentaho Cluster schema"><figcaption><p>Pentaho Cluster schema</p></figcaption></figure>

<table><thead><tr><th width="197">Option</th><th>Description</th></tr></thead><tbody><tr><td><strong>Schema name</strong></td><td>The name of the clustering schema</td></tr><tr><td><strong>Port</strong></td><td>Specify the port from which to start numbering ports for the slave servers. Each additional clustered step executing on a slave server will consume an additional port.<br>Note: To avoid networking problems, make sure no other networking protocols are in the same range.</td></tr><tr><td><strong>Sockets buffer size</strong></td><td>The internal buffer size to use</td></tr><tr><td><strong>Sockets flush interval rows</strong></td><td>The number of rows after which the internal buffer is sent completely over the network and emptied.</td></tr><tr><td><strong>Sockets data compressed?</strong></td><td>When enabled, all data is compressed using the Gzip compression algorithm to minimize network traffic</td></tr><tr><td><strong>Dynamic cluster</strong></td><td>If checked, a master Carte server will perform failover operations, and you must define the master as a slave server in the field below. If unchecked, Spoon will act as the master server, and you must define the available Carte slaves in the field below.</td></tr><tr><td><strong>Slave Servers</strong></td><td>A list of the servers to be used in the cluster. You must have one master server and any number of slave servers. To add servers to the cluster, click Select slave servers to select from the list of available slave servers.</td></tr></tbody></table>

3. Create a run configuration for the cluster: right-click **Run configurations**, select **New**, and enter the details below, with the **Pentaho** engine selected.

<figure><img src="../_assets/images/clustered-dialog.png" alt="Clustered - Run configuration"><figcaption><p>Clustered - Run configuration</p></figcaption></figure>

> **Note:** The logs can be kept on this machine. **Show transformations** opens the transformations generated for each node, which shows how the work was split.

### 3.3 Clustered

> **Note:** A Carte cluster consists of two or more Carte slave servers and a Carte master server. A Carte server is a lightweight web service that can execute jobs and transformations remotely. A Carte cluster can speed up the processing of transformations by distributing the work across multiple Carte slave nodes, while the Carte master node tracks the progress. A Carte cluster can be static or dynamic. A static Carte cluster has a fixed schema that specifies the nodes in advance. A dynamic Carte cluster allows you to add or remove nodes at runtime.
> 

1. Right-click the **Hello World** step and select **Clusters...**.

<figure><img src="../_assets/images/clusters.png" alt="Clusters"><figcaption><p>Clusters</p></figcaption></figure>

2. Select the `Pentaho` cluster schema.

<figure><img src="../_assets/images/pentaho-cluster.png" alt="Pentaho - Cluster schema"><figcaption><p>Pentaho - Cluster schema</p></figcaption></figure>

> **Note:** Notice that the step will indicate the number of Slave nodes it will be executed on.

<figure><img src="../_assets/images/clustered-slave-nodes.png" alt="The Hello World step marked with the number of slave nodes it runs on"><figcaption><p>The step shows its slave-node count</p></figcaption></figure>

3. Run the transformation with the **Clustered** run configuration.

<figure><img src="../_assets/images/clustered-run-configuration.png" alt="Run configuration - Clustered"><figcaption><p>Run configuration - Clustered</p></figcaption></figure>

> **Note:** Spoon opens a set of tabs for each node, with the transformation generated for it and its metrics.

4. Look at the tabs (the example below is for Slave A).

<figure><img src="../_assets/images/metadata-trans-slave-a.png" alt="The transformation generated for Slave A"><figcaption><p>Metadata transformation: Slave A</p></figcaption></figure>

> **Note:** Here you can see that the records are streamed from Slave node A back to the Master node.

<figure><img src="../_assets/images/metrics-slave-a.png" alt="Metrics - Slave A"><figcaption><p>Metrics - Slave A</p></figcaption></figure>

> **Note:** The metrics indicate that Slave Node A ingested the records.

<figure><img src="../_assets/images/logs-slave-a.png" alt="Logs - Slave A"><figcaption><p>Logs - Slave A</p></figcaption></figure>

> **Note:** The Logs indicate Slave A successfully read the transformation metadata dispatched from the Master node and executed the step, streaming the resulting dataset back to the Master node.

> **Under the hood:**
>
> #### The engine rewrote your transformation into one per node
>
> Marking a step as clustered told the master to split the
> transformation before running it. For each slave it generated a
> **metadata transformation** — the extra tabs you saw — containing
> only the clustered step plus **Socket reader** and **Socket writer**
> steps inserted at the boundaries where rows must cross machines. The
> master's own copy got the non-clustered steps and the matching
> socket ends. Each slave received its slice over HTTP exactly as in
> the previous tab, and rows then flowed between nodes over TCP on
> ports allocated from the cluster schema's base port.
>
> The generated transformations are ordinary transformations: the Logs
> tab on Slave A is that node running its slice, and its metrics are
> its socket writer sending rows back to the master.
>
> **Why it matters:** you scaled a step across two machines by
> right-clicking it. The partitioning, the network plumbing and the
> reassembly were generated, and the original `.ktr` is unchanged —
> remove the cluster assignment and it runs locally again.

:::

::::

## Lab Files

_No bundled files for this lab._
