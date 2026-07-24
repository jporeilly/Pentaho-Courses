# Archive Installation

#### Overview

Choose the Archive installation when you:

* Don’t already run Tomcat and want an opinionated, faster setup.
* Need a straightforward path to migrate content from an existing Pentaho environment.

> **Note:** Archive installation ships Pentaho v11 on Tomcat 10 as a snapshot, speeding setup versus a manual app‑server install.

#### What you’ll achieve

* Pentaho Server running on Tomcat 10
* A configured Pentaho Repository (database) - PostgreSQL 17.7
* Server plugins installed
* Client tools installed
* Licenses applied and validated

#### Who is this for?

* Admins who want a quick, supported Tomcat + Pentaho setup
* Teams migrating content from previous Pentaho versions or evaluation installs

#### Prerequisites

* Ubuntu 24.04 LTS with sudo access
* Java 21 (OpenJDK) installed and `PENTAHO_JAVA_HOME` set
* Access to a supported database for the Pentaho Repository (PostgreSQL recommended)
* Verify supported versions: [Components Reference](https://docs.pentaho.com/install/pdia-11.0-installation/components-reference)

> **Danger:** Uninstall any evaluation versions of Pentaho before proceeding.

**Step 1.** **Prepare your environment**

* Create a dedicated installation user `pentaho` and directory layout.
* Install and validate Java 21; set `PENTAHO_JAVA_HOME`.
* Install and configure your Pentaho Repository database (PostgreSQL recommended).

Go to: [Prepare Environment](/pentaho-11-installation-en/installation/archive-installation/prepare-environment.md)





**Step 2.** **Install Pentaho Server (Archive)**

* Download and unpack the archive under `/opt/pentaho`.
* Configure Repository connectivity and Tomcat.
* Start the server and verify logs.

Go to: [Install Pentaho Server](/pentaho-11-installation-en/installation/archive-installation/install-pentaho-server.md)





**Step 3.** **Install server plugins**

* Add reporting/visualization plugins required by your use cases.
* Add Semantic Model Editor (SME) for data modeling.
* Add Pipeline Designer (PPD), Scheduler and Carte for creating and deploying automated data pipelines.
* Restart and validate.

Go to: [Server Plugins](/pentaho-11-installation-en/installation/archive-installation/install-pentaho-server/server-plugins.md)





**Step 4.** **Install client tools**

* Install PDI, PRD, PME, PSW or other client tools used by your team.

Go to: [Install Client Tools](/pentaho-11-installation-en/installation/archive-installation/install-client-tools.md)





**Step 5.** **Start the Pentaho Server and apply licenses**

* Start Pentaho, access PUC, and validate basic functionality.
* Apply licenses via the License Manager.

See: “Start Server” and “License Manager” in [Install Pentaho Server](/pentaho-11-installation-en/installation/archive-installation/install-pentaho-server.md)





**Step 6.** **Post‑installation hardening (recommended)**

* Secure credentials, restrict access, and tune performance for production.

Go to: [Post Installation Tasks](/pentaho-11-installation-en/installation/post-installation-tasks.md)

> **Note:** Migrating content? Plan your repository upgrade/restore and test before opening the system to end users.

***
