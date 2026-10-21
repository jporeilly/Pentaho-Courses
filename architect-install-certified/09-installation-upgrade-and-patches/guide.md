# Pentaho Upgrade & Patches

> **Warning:**
>
> #### Workshop - Pentaho Upgrade & Patches
>
> Prepare a Pentaho installation for an upgrade: check the components, stop the server, and take stock of your customizations, plugins and drivers before the Pentaho Upgrade Installer runs.
>
> **What you'll do**
>
> * Check your system components against the Components Reference
> * Stop the Pentaho Server before you back it up
> * Review your customizations, and back up your plugins
> * Check for logged-on users and for the Java version
>
> **Prerequisites:** An installed Pentaho Server and client tools, such as the ones from [Install Pentaho Server](../06-installation-archive-pentaho-server/guide.md) and [Client Plugins](../10-installation-client-tools/guide.md)
>
> **Estimated time:** 15 minutes

---

> **Note:**
>
> #### Pentaho Upgrade Installer
>
> The Pentaho Upgrade Installer upgrades Pentaho products from version 8.3 or later to version 10.1. It checks your environment for version 8.3 or later products, backs them up, then upgrades them: the Pentaho Server and the client tools, on servers and workstations alike. It needs 22 GB of free space.
>
> To upgrade from a version earlier than 8.3, such as 7.1, first upgrade to 8.3, then use the Upgrade Installer from 8.3 to 10.1.
>
> The version paths here, 8.3 or later to 10.1, are the ones documented for the 10.1 Upgrade Installer. Before you plan an upgrade to Pentaho 11.0, check the 11.0 upgrade documentation for the versions it upgrades from. The practices below hold either way: back up first, stop the server, review your customizations, and reapply your plugins and Hadoop drivers.

## Before You Upgrade

1. Check that your system components are current, against the Components Reference:

<div class="pcm-embed-card" data-href="https://docs.pentaho.com/install/pdia-11.0-installation/components-reference" data-title="Components reference | Pentaho Documentation"></div>

2. If the environment includes the Pentaho Server, stop the server before you take backups and install:

```bash
cd "$PENTAHO_SERVER"
./stop-pentaho.sh
```

3. Check that the server has stopped (it can take a few seconds):

```bash
curl -I http://localhost:8080/pentaho/ | head -n 1
```

> **Success:** Checkpoint: `curl` reports that it failed to connect to `localhost` port `8080`: nothing listens there any more.

4. Review your customizations. During the upgrade, you can tell the Upgrade Installer which items hold your customizations: see [Specify customized items to address after upgrading](https://docs.hitachivantara.com/r/HuHAFx8OjcQg31CW~6gISg/r2F5~x211KC0wwU0qcq6cQ). After the upgrade, you merge your earlier customizations into the new versions of the Pentaho files: see the [Apply customizations](https://docs.hitachivantara.com/r/HuHAFx8OjcQg31CW~6gISg/S2d88cUzhPmuc8jUpi9NaA) post-upgrade task.

> **Warning:** The upgrade does not keep the drivers for your Hadoop clusters: you reinstall them after the upgrade. See the [Install drivers for your Hadoop clusters](https://docs.hitachivantara.com/r/HuHAFx8OjcQg31CW~6gISg/UEFngjwGGT~SZRKXjCWeNQ) post-upgrade task.

5. If you use plugins with your Pentaho products, review them and back them up to a separate directory structure. List the plugins the server's Plugin Manager installed (the file exists once it has installed one):

```bash
cat "$PENTAHO_SERVER/pentaho-solutions/system/plugin-manifest.json"
```

> **Success:** Checkpoint: a JSON list of the plugins, each with its `pluginName`, `pluginId` and `version`, such as the `Analyzer Plugin EE` you installed in [Server Plugins](../07-installation-archive-server-plugins/guide.md).

6. Copy the folders of those plugins, under `pentaho-solutions/system`, to a directory outside the Pentaho installation. The upgrade does not keep your plugins: you reapply them after the upgrade. See the [Apply your plugins](https://docs.hitachivantara.com/r/HuHAFx8OjcQg31CW~6gISg/pKp_UIrYWFitwgefW2h9ig) post-upgrade task.

> **Under the hood:**
>
> #### Plugins live inside the product folders an upgrade replaces
>
> The Plugin Manager unpacks each server plugin into its own folder under `pentaho-solutions/system`, and each PDI client plugin under `data-integration/plugins`, and lists what it installed in a `plugin-manifest.json` in each place. Both folders are part of the installation that the upgrade replaces, and the upgrade does not keep your plugins.
>
> **Why it matters:** the two manifests are your list of what to reinstall, with the versions you had. Keep a copy with your backup, then reinstall the plugins from the Plugin Manager after the upgrade.

7. If you are upgrading the Pentaho Server, check that no users are logged on. As a best practice, upgrade the server outside business hours, to limit the impact on day-to-day work.
8. Before you install the upgrade, check that the most recent supported version of Java is installed, and that `JAVA_HOME` (and `PENTAHO_JAVA_HOME`, where you set it) points to it:

```bash
java -version
echo $JAVA_HOME $PENTAHO_JAVA_HOME
```

## Lab Files

_No bundled files for this lab._
