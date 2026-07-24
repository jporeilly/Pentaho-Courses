# Pentaho Upgrade & Patches

> **Note:**
>
> #### Pentaho Upgrade Installer
> 
> You can upgrade your Pentaho products from version 8.3 or later to version 10.1 with the Pentaho Upgrade Installer.
> 
> The upgrade installer checks your environment for version 8.3 or later Pentaho products, creates a backup of these products, then upgrades them to version 10.1. The Pentaho Upgrade Installer works for any Pentaho products you have installed on your server or workstations, including your Pentaho Server and your Pentaho client tools.
> 
> The Pentaho Upgrade Installer requires 22 GB of free space to perform the upgrade process.

> **Warning:** If you need to upgrade your Pentaho products from a version earlier than 8.3, such as 7.1 or higher, you must upgrade your products to version 8.3, then use the Pentaho Upgrade Installer to move from version 8.3 to 10.1.

::: tabs

### Checklist

> **Note:** Before you can run the Pentaho Upgrade Installer, you must also perform the following tasks:

* [x] Verify that your system components are current.

<div class="pcm-embed-card" data-href="https://docs.pentaho.com/pdia-10.2-install/components-reference" data-title="docs.pentaho.com"></div>

* [x] If you are upgrading an environment that includes the Pentaho Server, stop the server prior to performing backups and installation.

```bash
cd 
cd ~/[Pentaho Installation Directory]/server/pentaho-server
sh stop-pentaho.sh
```

1. Review your customizations. During the upgrade process, you can help the upgrade installer specify which items contain your customizations. See [Specify customized items to address after upgrading](https://docs.hitachivantara.com/r/HuHAFx8OjcQg31CW~6gISg/r2F5~x211KC0wwU0qcq6cQ) for details. Then, after upgrading your Pentaho products to 10.1, you can merge your previous customizations into post-upgrade versions of the Pentaho files. See the [Apply customizations](https://docs.hitachivantara.com/r/HuHAFx8OjcQg31CW~6gISg/S2d88cUzhPmuc8jUpi9NaA) post-upgrade task for instructions.

> **Warning:** The upgrade process does not retain the drivers for your Hadoop clusters. You will need to re-install your drivers after completing the upgrade process.

1. Note: The upgrade process does not retain the drivers for your Hadoop clusters. You will need to re-install your drivers after completing the upgrade process. See the [Install drivers for your Hadoop clusters](https://docs.hitachivantara.com/r/HuHAFx8OjcQg31CW~6gISg/UEFngjwGGT~SZRKXjCWeNQ) post-upgrade task for details.
2. If you are using plugins with your Pentaho products, review and back up your plugins to a separate directory structure.

> **Warning:** The upgrade process does not retain your plugins. You will need to re-apply your plugins after completing the upgrade process.

1.
2. See the [Apply your plugins](https://docs.hitachivantara.com/r/HuHAFx8OjcQg31CW~6gISg/pKp_UIrYWFitwgefW2h9ig) post-upgrade task for details.
3. If you are upgrading the Pentaho Server, verify that no users are logged on to the server.As a best practice, perform the upgrade process of the Pentaho Server during off-business hours to minimize the impact on your day-to-day operations.
4. Before installing the Pentaho Upgrade, verify that you have the most recent version of Java installed and that the JAVA\_HOME environment variable is set to that version of Java.

### Release

> **Note:** You can upgrade your Pentaho products from version 8.3 or later to version 9.4 using the Pentaho Upgrade Installer.
> 
> The upgrade installer checks your environment for version 8.3 or later Pentaho products, creates a backup of these products, then upgrades them to version 9.4.
> 
> The Pentaho Upgrade Installer works for any Pentaho products you have installed on your server or workstations, including your Pentaho Server and your Pentaho client tools.

> **Warning:** The Pentaho Upgrade Installer requires 22 GB of free space to perform the upgrade process.

Before you can run the Pentaho Upgrade Installer, you must also perform the following tasks:

* [ ] Verify that your system components are current.

<div class="pcm-embed-card" data-href="https://help.hitachivantara.com/Documentation/Pentaho/9.4/Setup/Components_Reference" data-title="help.hitachivantara.com"></div>

* [ ] If you are upgrading an environment that includes the Pentaho Server, stop the server prior to performing backups and installation.

```bash
cd 
cd ~/Pentaho/server/pentaho-server
sh stop-pentaho.sh
```

* [ ] Review any customizations.

During the upgrade process, you can help the upgrade installer specify which items contain your customizations.

:::

