# Overview

<div class="pcm-intro">

An archive installation unpacks the Pentaho Server, already deployed in Tomcat 10, onto a Linux machine you prepare yourself. This module takes you through it end to end: the machine, the repository database, the server, its plugins and the client tools, then hardening and upgrades.

</div>

**What You'll Learn**

* **When to choose an archive installation** - and who it suits.
* **What you end up with** - a licensed Pentaho Server on Tomcat 10, with its repository on PostgreSQL 17.
* **The plan** - six steps, each one a lab in this module or the next.

## Why an Archive Installation

Choose the archive installation when you:

* Don't already run Tomcat and want an opinionated, faster setup.
* Need a straightforward path to migrate content from an existing Pentaho environment.

> **Note:** The archive ships Pentaho 11 already deployed in Tomcat 10, which makes setup faster than deploying Pentaho into an application server yourself.

## What You'll Achieve

* The Pentaho Server running on Tomcat 10
* The Pentaho Repository configured on PostgreSQL 17
* The server plugins installed
* The client tools installed
* Licenses applied and validated

## Who Is This For

* Administrators who want a quick, supported Tomcat and Pentaho setup
* Teams migrating content from earlier Pentaho versions or from evaluation installs

## Prerequisites

* Ubuntu 24.04 LTS, with `sudo` access
* Java 21 (OpenJDK) installed and `PENTAHO_JAVA_HOME` set
* A supported database for the Pentaho Repository (PostgreSQL recommended)
* The supported versions, checked in the Components Reference:

<div class="pcm-embed-card" data-href="https://docs.pentaho.com/install/pdia-11.0-installation/components-reference" data-title="Components reference | Pentaho Documentation"></div>

> **Danger:** Uninstall any evaluation version of Pentaho before you start.

## The Plan

| Step | What you do | Lab |
| --- | --- | --- |
| 1. Prepare your environment | Create the `pentaho` installation user and the directory layout. Install Java 21 and set `PENTAHO_JAVA_HOME`. Install and configure PostgreSQL for the Pentaho Repository. | [Prepare Environment](../05-installation-archive-prepare-environment/guide.md) |
| 2. Install the Pentaho Server | Unpack the archive under `/opt/pentaho`. Create the repository databases and check the server's connections to them. Start the server and check its logs. | [Install Pentaho Server](../06-installation-archive-pentaho-server/guide.md) |
| 3. Install the server plugins | Add the reporting and visualization plugins your users need, Semantic Model Editor (SME) for data modeling, and Pipeline Designer, Scheduler and Carte for building and running pipelines. Restart and check each one. | [Server Plugins](../07-installation-archive-server-plugins/guide.md) |
| 4. Install the client tools | Install PDI, Report Designer (PRD), Metadata Editor (PME), Schema Workbench (PSW) or the other client tools your team uses. | [Client Plugins](../10-installation-client-tools/guide.md) |
| 5. Start the server and apply licenses | Start the Pentaho Server, open the User Console (PUC), check that it works, and apply your licenses in the License Manager. | [Install Pentaho Server](../06-installation-archive-pentaho-server/guide.md), its **Start Server** and **License Manager** tabs |
| 6. Harden the installation (recommended) | Secure credentials, restrict access and tune performance for production. | [Post Installation Tasks](../08-installation-post-installation/guide.md) |

> **Note:** Migrating content? Plan your repository upgrade or restore, and test it, before you open the system to users.
