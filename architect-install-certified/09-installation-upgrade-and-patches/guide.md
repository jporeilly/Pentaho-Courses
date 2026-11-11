# Pentaho Upgrade & Patches

> **Warning:**
>
> #### Workshop - Pentaho Upgrade & Patches
>
> You installed the base release, 11.0.0.0-237. Pentaho then issues service packs on a cycle, and you apply each one as it is released. Here you apply service pack 11.0.0.3-312 to the server and to the client tools, and put back what the service pack removes.
>
> **What you'll do**
>
> * Record what is installed, and back up your plugins and drivers
> * Apply the service pack to the Pentaho Server with the Pentaho Service Pack Installer
> * Read its reports, start the server and check the new version
> * Put back the plugin and the driver the service pack removed
> * Move the client tools to the same service pack
>
> **Prerequisites:**
>
> * The server from [Install Pentaho Server](../06-installation-archive-pentaho-server/guide.md), with the plugins from [Server Plugins](../07-installation-archive-server-plugins/guide.md)
> * The client tools from [Client Plugins](../10-installation-client-tools/guide.md), if you want to patch them too
> * From the Support Portal, the service pack's files: see step 1
> * 22 GB of free disk space
>
> **Estimated time:** 45 minutes

<figure>

<figcaption class="pcm-video-caption">Walkthrough: coming soon</figcaption>

</figure>

---

> **Note:**
>
> #### Patches and upgrades are different jobs
>
> A **service pack** stays inside a release: 11.0.0.0 to 11.0.0.3. It carries fixes and security updates, it is applied in place by the Pentaho Service Pack Installer, and it is routine work you do on Pentaho's release cycle. This workshop is that job.
>
> A **version upgrade** moves to another release, such as 10.2 to 11.0. It changes the repository, the configuration files and often the Java version, and it needs a plan and a test environment: see **Version Upgrades**, the last step.

:::: tabs

### 1. Before You Patch

> **Note:**
>
> #### Know what you have before you change it
>
> The service pack installer replaces the server's files with its own copy of the new build. What it knows as a product it carries forward; what you added yourself it does not. So the first job is a list of what is installed and a backup of what you added.

1. Download the service pack's files from the Support Portal. In the **11.0** downloads, **Utilities and Tools** holds the installer and its companions; save them in `~/Downloads/Utilities and Tools`:

| File | What it is |
| --- | --- |
| `pentaho-update-11.0.0.3-312.bin` | The Pentaho Service Pack Installer for Linux, about 950 MB |
| `installer-hash-files-11.0.0.3-312.zip` | The file hashes the installer compares your installation with. Do not extract it |
| `README-11.0.0.3-312.txt` | The installer's instructions and known issues |
| `SP-11.0.0.3-312-Fixes.txt` | The fixes in this service pack |

2. Read the README and skim the fixes list before you go on. The README names the manual steps a service pack needs, and they change from one service pack to the next:

```bash
cd ~/Downloads/'Utilities and Tools'
less README-11.0.0.3-312.txt
```

3. Check what is installed. The platform JAR carries the build number:

```bash
ls "$PENTAHO_SERVER/tomcat/webapps/pentaho/WEB-INF/lib" | grep '^pentaho-platform-core'
```

> **Success:** Checkpoint: `pentaho-platform-core-11.0.0.0-237.jar`.

4. List the server's plugins. Each plugin the Plugin Manager knows has a `pluginmeta.json` in its folder:

```bash
cd "$PENTAHO_SERVER/pentaho-solutions/system"
for f in */pluginmeta.json; do echo "$f: $(cat "$f")"; done
```

> **Success:** Checkpoint: one entry for each plugin, among them `analyzer`, `pentaho-interactive-reporting`, `dashboards` and the Semantic Model Editor's folder, if you installed them in **Server Plugins**.

5. List the JDBC drivers in Tomcat's `lib` folder, and note any you added yourself:

```bash
ls -1 "$TOMCAT_HOME/lib" | grep -Ei 'mysql|postgresql|ojdbc|mssql'
```

> **Success:** Checkpoint: `postgresql-42.5.6.jar`, the driver the archive ships, and `mysql-connector-j-9.0.0.jar` if you added it in **Install Pentaho Server**.

6. Back up the plugin folders to a directory outside the Pentaho installation:

```bash
mkdir -p ~/pentaho-backup/plugins-$(date +%F)
cd "$PENTAHO_SERVER/pentaho-solutions/system"
for f in */pluginmeta.json; do cp -a "$(dirname "$f")" ~/pentaho-backup/plugins-$(date +%F)/; done
du -sh ~/pentaho-backup/plugins-$(date +%F)
```

7. Check the free disk space. The installer backs up the whole installation before it changes it, and needs 22 GB:

```bash
df -h /
```

8. Check Java. The installer wants `JAVA_HOME`; this course set `PENTAHO_JAVA_HOME` in **Prepare Environment**, so point `JAVA_HOME` at the same Java for this terminal:

```bash
export JAVA_HOME=$PENTAHO_JAVA_HOME
echo $JAVA_HOME
"$JAVA_HOME/bin/java" -version
```

> **Success:** Checkpoint: `/usr/lib/jvm/java-21-openjdk-amd64`, and an OpenJDK 21 version.

9. Check that no users are logged on, then stop the server. As a best practice, patch outside business hours.

```bash
sudo systemctl stop pentaho-server
curl -I http://localhost:8080/pentaho/ | head -n 1
```

If you did not create the service, stop the server with `./stop-pentaho.sh` in `$PENTAHO_SERVER` instead.

> **Success:** Checkpoint: `curl` reports that it failed to connect to `localhost` port `8080`: nothing listens there any more.

### 2. Apply the Service Pack

> **Note:**
>
> #### The Pentaho Service Pack Installer
>
> The installer checks the folder you give it for Pentaho products, backs them up, then replaces them with the service pack's build. It runs as a wizard (`-i gui`), in the terminal (`-i console`) or with no questions (`-i silent`). This workshop uses the silent mode, the one you can repeat on every server.

<div class="pcm-embed-card" data-href="https://docs.pentaho.com/install/pentaho-upgrade-cp" data-title="Pentaho upgrade | Pentaho Documentation"></div>

1. Make the installer executable and look at its options:

```bash
cd ~/Downloads/'Utilities and Tools'
chmod +x pentaho-update-11.0.0.3-312.bin
./pentaho-update-11.0.0.3-312.bin -help
```

> **Success:** Checkpoint: the usage text, with `-i [gui | console | silent]` and `-D<name>=<value>`.

2. Run the installer on the server's folder, `/opt/pentaho/server`. In the same terminal as step 8 of the previous tab, so that `JAVA_HOME` is set:

```bash
cd ~/Downloads/'Utilities and Tools'
./pentaho-update-11.0.0.3-312.bin -i silent -DEULA=true \
  -DUSER_INSTALL_DIR=/opt/pentaho/server \
  -DHASH_FILE_ZIP="$HOME/Downloads/Utilities and Tools/installer-hash-files-11.0.0.3-312.zip"
echo "exit code: $?"
```

It prints nothing while it works. On the course's VM it took about four minutes, two of them for the backup.

> **Success:** Checkpoint: `exit code: 0`.

Any other exit code means that nothing was applied. The reason is in the installer's log, which the next step finds.

> **Under the hood:**
>
> #### The installer backs up everything under the folder you name
>
> `-DUSER_INSTALL_DIR` is the root the installer scans for products, and the root it backs up, whole, before it changes anything. Give it `/opt/pentaho` and it also finds the 1.1 GB server archive you staged in `/opt/pentaho/software`, stops with `This file is too large to back up`, and ends with exit code `255` having changed nothing. `/opt/pentaho/server` holds the products and nothing else.
>
> **Why it matters:** keep downloads and staging files outside the folder your products are installed in, and always read the exit code. A silent installer that fails is silent about that too: the reason is in its log.

3. Look at what the installer left. It writes its reports beside the products, and its backup under your home folder:

```bash
ls /opt/pentaho/server/Pentaho__Installation /opt/pentaho/server/Pentaho__Installation/Logs
ls -lh ~/.pentaho/backups
```

> **Success:** Checkpoint: `preInstallConfigReport.txt`, `postInstallConfigReport.txt`, a `white_list.csv` and the `Logs` folder with `install.log` and `error.log`; and in `~/.pentaho/backups` a ZIP of about 950 MB named after the version it replaced, `11.0.0.0-237-<date>.zip`.

4. Check which products it found, and that it logged no errors:

```bash
grep "Match found for component" /opt/pentaho/server/Pentaho__Installation/Logs/install.log | sed 's/.*Match found for component //' | sort -u
wc -l /opt/pentaho/server/Pentaho__Installation/Logs/error.log
```

> **Success:** Checkpoint: `Analyzer`, `Dashboards`, `Interactive Reporting`, `JDBC Distribution`, `License Installer` and `Server`, and `0` lines in `error.log`.

5. Check the new version:

```bash
ls "$PENTAHO_SERVER/tomcat/webapps/pentaho/WEB-INF/lib" | grep '^pentaho-platform-core'
```

> **Success:** Checkpoint: `pentaho-platform-core-11.0.0.3-312.jar`.

6. Start the server and check that it answers:

```bash
sudo systemctl start pentaho-server
tail -f "$TOMCAT_HOME/logs/catalina."*.log
```

When the log reaches `Server startup in [...] milliseconds`, press `Ctrl+C`, then:

```bash
curl -I http://localhost:8080/pentaho/ | head -n 1
```

> **Success:** Checkpoint: `HTTP/1.1 401`, as before the service pack. Log in to the User Console: your license, your repository content and your data connections are all there.

On the course's VM the patched server took about a minute and a half to start.

> **Under the hood:**
>
> #### What the service pack keeps, and what it leaves you to merge
>
> The repository is in PostgreSQL and the license is in your home folder, so the installer never touches them. Inside the server folder it keeps the settings it recognizes, such as the PostgreSQL connections in `context.xml`. Where a file you may have edited also changed in the service pack, it keeps yours and puts the new version beside it as `<file>.merge.post_upgrade`: here `start-pentaho.sh`, `start-pentaho-debug.sh` and `set-pentaho-env.sh`. `postInstallConfigReport.txt` lists them.
>
> **Why it matters:** the server runs with your old scripts, so a fix that the service pack made to a script reaches you only when you merge it. Read the report after every service pack.

### 3. Put Back What It Removed

> **Note:**
>
> #### Products are carried forward; your additions are not
>
> The installer knows six products: the Server, Analyzer, Dashboards, Interactive Reporting, the JDBC Distribution tool and the License Installer. Those it replaces with the service pack's build. Everything else in the server folder comes from its own copy of the server, which is why a plugin or a driver that you added is gone afterwards.

| Item | After the service pack |
| --- | --- |
| Analyzer, Interactive Reporting, Dashboard Designer | Kept, and now `11.0.0.3-312` |
| Pipeline Designer, the Scheduler, the Plugin Manager (shipped with the server) | Kept, and updated |
| Semantic Model Editor (installed from the Plugin Manager) | Removed |
| A JDBC driver you copied into `tomcat/lib` | Removed |
| The PostgreSQL driver the archive ships | Replaced by a newer one |
| Repository, license, `context.xml` connections, the systemd service | Kept |

1. List the plugins again and compare the list with the one from before the service pack:

```bash
cd "$PENTAHO_SERVER/pentaho-solutions/system"
for f in */pluginmeta.json; do echo "$f: $(cat "$f")"; done
```

> **Success:** Checkpoint: the analytic plugins now show `"pluginVersionName":"11.0.0.3-312"`. The Semantic Model Editor's folder is no longer in the list.

2. Log in to the modern User Console and select **Plugin Manager**:

<div class="pcm-embed-card" data-href="http://localhost:8080/pentaho/content/login/web/index.html" data-title="Pentaho User Console: new login"></div>

> **Success:** Checkpoint: **Latest Version** now shows `11.0.0.3-312`, the server's own version, and **Semantic Model Editor (SME)** has an **Install** button again.

3. Install Semantic Model Editor the way you did in **Server Plugins**: select its row, select the latest version in **Select the plugin version**, and select **Install**.
4. If you had added a JDBC driver, copy it back from the staging folder:

```bash
sudo cp /opt/pentaho/software/db-drivers/mysql-connector-j-9.0.0.jar "$TOMCAT_HOME/lib/"
sudo chown pentaho:pentaho "$TOMCAT_HOME/lib/mysql-connector-j-9.0.0.jar"
ls -1 "$TOMCAT_HOME/lib" | grep -Ei 'mysql|postgresql'
```

> **Success:** Checkpoint: `mysql-connector-j-9.0.0.jar` and `postgresql-42.7.11.jar`, the newer PostgreSQL driver the service pack brought.

5. Restart the server, once, for both:

```bash
sudo systemctl restart pentaho-server
```

6. Log in to the modern User Console again.

> **Success:** Checkpoint: **Semantic Model Editor** is back in the left panel, and the Plugin Manager shows it under **Installed Version**.

To go back to the release you had, the installer can restore its backup: its wizard offers **Restore** beside **Upgrade**, and the documentation lists the `-DRESTORE` and `-DBACKUP_ZIP` properties for a silent run. This workshop does not run a restore. Keep the ZIP in `~/.pentaho/backups` until you are satisfied with the patched server, then delete it: it is as large as the installation.

### 4. Patch the Client Tools

> **Note:**
>
> #### This service pack patches the client tools from their own archives
>
> The README says that the installer also covers the client tools. For 11.0.0.3-312 it does not: it carries no client tools, and pointed at `~/Pentaho/design-tools` it stops with `Found version UNKNOWN` and exit code `255`, having changed nothing. The service pack's client tools are separate archives, which you unpack the way you unpacked the originals.

1. Download the service pack's client tool archives from the Support Portal's 11.0.0.3 downloads, and save them in `~/Downloads/Service Pack 11.0.0.3`:

```bash
ls -1 ~/Downloads/'Service Pack 11.0.0.3'
```

> **Success:** Checkpoint: `pad-ee-11.0.0.3-312.zip`, `pdi-ee-client-11.0.0.3-312.zip`, `pme-ee-11.0.0.3-312.zip`, `prd-ee-11.0.0.3-312.zip` and `psw-ee-11.0.0.3-312.zip`.

2. Close every client tool. Then keep the old tools under another name, and unpack the new ones in their place:

```bash
cd ~/Pentaho
mv design-tools design-tools-11.0.0.0-237
mkdir design-tools && cd design-tools
for z in ~/Downloads/'Service Pack 11.0.0.3'/*.zip; do unzip -q "$z"; done
find . -iname "*.sh" -exec chmod +x {} \;
ls
```

> **Success:** Checkpoint: `aggregation-designer`, `data-integration`, `jdbc-distribution`, `license-installer`, `metadata-editor`, `report-designer` and `schema-workbench`.

3. Check the new version of Pentaho Data Integration:

```bash
ls ~/Pentaho/design-tools/data-integration/lib | grep '^kettle-core'
```

> **Success:** Checkpoint: `kettle-core-11.0.0.3-312.jar`.

4. Start Spoon and reinstall the plugins you had, from **Tools > Plugin Manager**, as in [Enterprise Plugins](../11-installation-client-tools-ee-plugins/guide.md). Choose the version that matches the client. Your list is in the old folder:

```bash
cd ~/Pentaho/design-tools-11.0.0.0-237/data-integration/plugins
for f in */pluginmeta.json; do echo "$f: $(cat "$f")"; done
```

5. If a client tool used a JDBC driver you added, copy the JAR from the old tool's `lib` folder to the new one.
6. When the new tools do everything the old ones did, remove the old folder:

```bash
rm -rf ~/Pentaho/design-tools-11.0.0.0-237
```

> **Under the hood:**
>
> #### Your Pentaho Data Integration settings are not in the tool's folder
>
> Spoon keeps `kettle.properties`, its shared connections and its other settings in `~/.kettle`, in your home folder. Replacing `data-integration` leaves them alone, and the new Spoon reads them when it starts. What does live in the tool's folder is what you put there: plugins in `plugins`, and drivers in `lib`.
>
> **Why it matters:** a client tool is patched by replacing it, so keep the old folder until the new one is proven, and treat anything you add to a tool's folder as something to add again after every service pack.

### 5. Version Upgrades

> **Note:**
>
> #### An upgrade is a project
>
> A version upgrade is not routine maintenance. Plan it with **Pentaho Professional Services** or your Pentaho partner: they assess your customizations, rehearse the upgrade on a copy of your environment, and schedule the cut-over.

What to know before that conversation:

* The **Pentaho Upgrade Installer** upgrades products from version 8.3 or later. From an earlier version, such as 7.1, you first upgrade to 8.3, then run the Upgrade Installer from there. Those are the paths documented for the 10.1 Upgrade Installer (8.3 or later, to 10.1): before you plan an upgrade to 11.0, check its documentation for the versions it upgrades from.
* It checks your environment, backs up your products, then upgrades the Pentaho Server and the client tools. It needs 22 GB of free space.
* The upgrade does not keep your plugins. You back them up to a separate directory structure before the upgrade, and reapply them afterwards.
* The upgrade does not keep the drivers for your Hadoop clusters either: you reinstall them after the upgrade.
* You tell the installer which items hold your customizations, and merge them into the new versions of the Pentaho files afterwards.
* Check the Components Reference for the Java version, the databases and the operating systems the new release supports, before you plan anything else:

<div class="pcm-embed-card" data-href="https://docs.pentaho.com/install/pdia-11.0-installation/components-reference" data-title="Components reference | Pentaho Documentation"></div>

::::

## Lab Files

_No bundled files for this lab._
