# Components

<div class="pcm-intro">

Before you build anything in Pentaho Data Integration (PDI), you need to know your way around Spoon. This module gets you set up: perspectives, options, and the kettle.properties file that drives variables across every transformation. By the time you finish, you'll feel at home in the design tool.

</div>

Understanding the architecture and components of Pentaho Data Integration (PDI) is fundamental to becoming an effective Pentaho developer and administrator. This section will familiarize you with the building blocks that make up the Pentaho Data Integration ecosystem and how they work together to deliver enterprise-grade data integration capabilities.

**What You'll Learn**

Pentaho Data Integration operates on a **client-server architecture** that separates design-time activities from runtime execution and administration. In this section, you'll explore:

* **Enterprise Components**: The server-side infrastructure that handles execution, security, content management, and scheduling
* **Client Tools**: The desktop applications used to design, test, and deploy your data integration solutions
* **Configuration Framework**: The KETTLE configuration files that control system behaviour and store critical settings
* **Repository Management**: How PDI manages versioning, collaboration, and content organization
* **Database Connectivity**: The process of integrating JDBC drivers to connect to various data sources

![Pentaho Enterprise](../_assets/images/psi-workflow-2.svg)

---

Browse to learn about the components:

:::: tabs

### 1. Components

<div data-full-width="true"><figure><img src="../_assets/images/architecture.png" alt=""><figcaption><p>Pentaho Client / Server Architecture</p></figcaption></figure></div>

::: tabs

### 1. Data Integration

> **Note:**
>
> #### **Data Integration**
>
> **Spoon**
>
> Graphical modelling environment for developing, testing, debugging and monitoring jobs and transformations.
>
> **Designer**
>
> Drag & Drop 'objects' to design your pipelines and workflows.
>
> **Scheduler**
>
> Connects to Quartz scheduler on server. Jobs and transformations must be uploaded to Repository.
>
> **Engine**
>
> Kettle and Spark engines available to execute jobs and transformations.
>
> **Repository Browser**
>
> Connects to Apache Jackrabbit content Repository, pointing to a supported database:
>
> * PostgreSQL
> * MSSQL Server
> * Oracle
> * MySQL
> * MariaDB
>
> **DB Explorer**
>
> Database Explorer that enables you to conduct minimal database operations.

<div class="pcm-embed-card" data-href="https://docs.pentaho.com/pdia-data-integration" data-title="Pentaho Data Integration 11.0 | Pentaho" data-thumb="../_assets/embeds/df6e513be97b.png"></div>

### 2. Pentaho Server

> **Note:**
>
> #### **Pentaho Server**
>
> The Pentaho Server hosts Pentaho-created and user-created content. It is a core component for executing data integration transformations and jobs using the Pentaho Data Integration (PDI) Engine. It allows you to manage users and roles (default security) or integrate security to your existing security provider such as LDAP or Active Directory.

The primary functions of the Pentaho Server are:

<table data-header-hidden><thead><tr><th width="225"></th><th></th></tr></thead><tbody><tr><td><strong>Execution</strong></td><td>Executes ETL jobs and transformations using the Pentaho Data Integration engine</td></tr><tr><td><strong>Security</strong></td><td>Allows you to manage users and roles (default security) or integrate security to your existing security provider such as LDAP or Active Directory</td></tr><tr><td><strong>Content Management</strong></td><td>Provides a centralized repository that allows you to manage your ETL jobs and transformations. This includes full revision history on content and features such as sharing and locking for collaborative development environments.</td></tr><tr><td><strong>Scheduling & Monitoring</strong></td><td>Provides the services allowing you to schedule and monitor activities on the Data Integration Server from within the Spoon design environment (Quartz).</td></tr></tbody></table>

<div class="pcm-embed-card" data-href="https://docs.pentaho.com/install/components-reference" data-title="Components reference | Pentaho" data-thumb="../_assets/embeds/99d6d0253453.png"></div>

### 3. Carte

> **Note:**
>
> #### **Carte Server**
>
> The Pentaho DI Carte Server is a vital component within the Pentaho data integration suite, designed to facilitate robust data processing operations. It serves as a stand-alone web server and execution environment that allows for the remote execution of ETL (Extract, Transform, Load) tasks, making it a cornerstone for managing data workflows efficiently.

<figure><img src="../_assets/images/carte.png" alt=""><figcaption><p>Carte Server</p></figcaption></figure>

> **Note:** **Simplicity and Efficiency**
>
> Carte stands out for its straightforward and user-friendly setup, paired with a highly efficient operation that conserves resources. This makes it the ideal choice for organizations seeking to enhance their data integration workflows efficiently and with minimal operational burden.
>
> **Remote Execution Flexibility**
>
> With Carte, executing ETL tasks remotely becomes effortless, allowing for versatile data integration management from any location. Serving as a powerful remote ETL server, Carte can handle jobs and transformations from afar, broadening the capabilities of data integration strategies.
>
> **Seamless Integration Capabilities**
>
> Featuring an extensive array of built-in connectors, Carte excels in smoothly integrating with a multitude of sources and destinations, including databases and data warehouses. This capability facilitates straightforward data extraction, transformation, and loading processes across various platforms.
>
> **Built for Scalability**
>
> Carte is designed to grow with your needs, enabling deployment in multiple configurations such as Kubernetes, Docker, and cloud-based solutions. Its lightweight design ensures consistent performance, even as data demands increase.
>
> **Intuitive Web Interface**
>
> The Carte web interface offers a clean and efficient way to oversee jobs and transformations. Users gain access to real-time task updates, status reports, and comprehensive execution logs, all through a user-friendly dashboard.

<div class="pcm-embed-card" data-href="https://docs.pentaho.com/pdia-data-integration/advanced-topics-pentaho-data-integration-overview/use-carte-clusters" data-title="Use Carte Clusters | Pentaho" data-thumb="../_assets/embeds/b2bee0a6a9e0.png"></div>

### 4. REST APIs

> **Note:**
>
> #### **PDI REST APIs**
>
> You can use PDI's command line tools to execute PDI content from outside of Spoon. Typically, you would use these tools in the context of creating a script or a Cron job to run the job or transformation based on some condition outside of the realm of Pentaho software.

> **Note:** **Pan**
>
> A standalone command line process that can be used to execute transformations and jobs you created in Spoon. The data transformation engine Pan reads data from and writes data to various data sources. Pan also allows you to manipulate data.
>
> ```
> ./pan.sh /file:/home/[pentaho_user]/[path]/[transformation].ktr  /level:[Log Level]
> ```

> **Note:** **Kitchen**
>
> A standalone command line process that can be used to execute jobs. The program that executes the jobs designed in the Spoon graphical interface, either in XML or in a database repository. Jobs are usually scheduled to run in batch mode at regular intervals.
>
> ```
> ./kitchen.sh /file:/home/[pentaho_user]/[path]/[job].kjb  /level:[Log level]
> ```

<div class="pcm-embed-card" data-href="https://docs.pentaho.com/pentaho-rest-api/carte-apis-carte-server" data-title="View external resource"></div>

:::

### 2. PDI UI

> **Note:** **User Interface**
>
> Within the UI, you can author, edit, run, and debug transformations and jobs. You can also enter license keys, add data connections, and define security (default options - Pentaho or LDAP).
>
> The Welcome page contains useful links to documentation, community links for getting involved in the Pentaho Data Integration project, and links to blogs from some of the top contributors to the Pentaho Data Integration project.

<figure><img src="../_assets/images/spoon-welcome.png" alt=""><figcaption><p>Welcome page</p></figcaption></figure>

> **Note:** There are a few different ways to start PDI. The method that you should use depends on the way you installed Pentaho Data Integration (PDI).

<table><thead><tr><th width="255">OS: Windows / Unix</th><th>Action</th></tr></thead><tbody><tr><td>spoon.bat / spoon.sh</td><td>Starts Spoon</td></tr><tr><td>kichen.bat / kitchen.sh</td><td>Command Line for Jobs</td></tr><tr><td>pan.bat / pan.sh</td><td>Command Line for Transformations</td></tr></tbody></table>

**Launch Data Integration**

1. Run the following command `(Linux):`

```bash
cd
cd ~/Scripts
sh pentaho--platform.sh
```

[configuring-pdi-ui](https://academy.pentaho.com/pentaho-data-integration/data-integration/components/configuring-pdi-ui)

### 3. Configuration Files

> **Note:** **Configuration Files**
>
> The default Pentaho Data Integration (PDI) HOME directory is the user's home directory. Here is located in the .kettle folder, are the main PDI configuration files.
>
> * Windows C:{user}.kettle
> * Linux based operating systems ($HOME/.kettle)
>
> The directory may change depending on the user who is logged on. Thus, the configuration files that control the behaviour of PDI jobs and transformations are different from user to user.
>
> This also applies when running PDI from the Pentaho BI Platform. When you set the KETTLE\_HOME variable, the PDI jobs and transformations can be run without being affected by the user who is logged on. KETTLE\_HOME is used to change the location of the files normally in \[user home].kettle

<table><thead><tr><th width="257">File</th><th>Description</th></tr></thead><tbody><tr><td>kettle.properties</td><td>main configuration file with global variables</td></tr><tr><td>shared.xml</td><td>list of shared artefacts</td></tr><tr><td>db.cache</td><td>database cache for metadata</td></tr><tr><td>repositories.xml</td><td>list of repositories</td></tr><tr><td>.spoonrc</td><td>settings for the UI</td></tr><tr><td>.languageChoice</td><td>language settings</td></tr></tbody></table>

::: tabs

### 3.1 kettle.properties

> **Note:** **kettle.properties**
>
> The kettle.properties file is where you will find all the global variables for KETTLE. You can also set global variables that can be used in Transformations and Jobs. For example, you can define database connections, paths to files, or variables that can be used as parameters in your solution.

The kettle.properties can be edited using a Text Editor or via the Toolbar, select:

<div align="center"><figure><img src="../_assets/images/kettle-edit.png" alt=""><figcaption><p>kettle.properties</p></figcaption></figure></div>

[kettle-variables](https://academy.pentaho.com/pentaho-data-integration/data-integration/components/kettle-variables)

### 3.2 shared.xml

> **Note:** **shared.xml**
>
> A variety of objects can now be placed in a shared objects file on the local machine. The default location for the shared objects file is:
>
> $HOME/.kettle/shared.xml
>
> Objects that can be shared using this method include:
>
> * Database connections
> * Steps
> * Slave servers
> * Partition schemas
> * Cluster schemas
>
> The location of the shared objects file is configurable on the "Miscellaneous" tab of the Transformation > Settings dialog.

1. To share one of these objects, simply right-click on the object in the tree control on the left and choose share.

<figure><img src="../_assets/images/share-connection.png" alt=""><figcaption><p>Shared Object - Connection</p></figcaption></figure>

> **Note:** **Bold Type** indicates the Object is shared.

### 3.3 repositories.xml

> **Note:** **repositories.xml**
>
> A variety of objects can now be placed in a shared objects file on the local machine. The default location for the shared objects file is:
>
> $HOME/.kettle/repositories.xml

```xml
<repositories>
<repository>
<id>PentahoEnterpriseRepository</id>
<name>Pentaho</name>
<description/>
<is_default>false</is_default>
<repository_location_url>http://localhost:8080/pentaho</repository_location_url>
<version_comment_mandatory>N</version_comment_mandatory>
</repository>
</repositories>
```

### 3.4 .spoonrc

> **Note:** **.spoonrc**
>
> Used to store preferences and program state of Spoon. Other Kettle programs do not use this file.
>
> * General settings and defaults
> * User interface settings
> * The last opened transformation/job
>
> The default location for the shared objects file is:
>
> $HOME/.kettle/.spoonrc

```
#Kettle Properties file
#Sat Dec 16 22:49:28 GMT 2023
AskAboutReplacingDatabases=N
AutoCollapseCoreObjectsTree=Y
AutoSave=N
AutoSplit=N
BackgroundColorB=255
BackgroundColorG=255
BackgroundColorR=255
CustomParameterMergeJoinSortWarning=Y
CustomParameterMergeRowsSortWarning=Y
CustomParameterSetVariableUsageWarning=Y
...
```

> **Note:** These options are set from the main menu: Tools -> Options

:::

### 4. JDBC

> **Note:** **Adding JDBC Drivers**
>
> The PDI & Pentaho Server needs the appropriate driver to connect to the database that stores your data. Your database administrator, Chief Intelligence Officer, or IT manager should be able to provide the appropriate driver. If not, you can download drivers from your database vendor's website.
>
> The [Components Reference](https://help.hitachivantara.com/Documentation/Pentaho/9.0/Setup/Components_Reference) contains a list of drivers.
>
> Once you have the correct driver, copy it to the following directories:
>
> * Pentaho Server: /pentaho/server/pentaho-server/tomcat/lib/
> * PDI client: data-integration/lib

> **Danger:** You must restart the PDI client for the driver to take effect.
>
> There should be only one driver for your database in the directory. Ensure that there are no other versions of the same vendor's driver in this directory. If there are, back up the old driver files and remove them to avoid version conflicts.

### 5. Repository

> **Note:** **Pentaho Repository**
>
> The Pentaho+ platform implements its repository using [**Apache Jackrabbit**](http://jackrabbit.apache.org), a fully conforming implementation of the content repository for Java technology API (JCR, specified in JSR 170 and JSR 283)
>
> Apache Jackrabbit needs two pieces of information to set up a runtime content repository instance:
>
> * Repository home directoryThe filesystem path of the directory containing the content repository accessed by the runtime instance of Jackrabbit. This directory usually contains all the repository content, search indexes, internal configuration, and other persistent information managed within the content repository. Note that this is not absolutely required and some persistence managers and other Jackrabbit components may well be configured to access files and even other resources (like remote databases) outside the repository home directory. A designated repository home directory is however always needed even if some components choose to not use it. Jackrabbit will automatically fill in the repository home directory with all the required files and subdirectories when the repository is first instantiated.
> * Repository configuration file
>   The filesystem path of the repository configuration XML file. This file specifies the class names and properties of the various Jackrabbit components used to manage and access the content repository. Jackrabbit parses this configuration file and instantiates the specified components when the runtime content repository instance is created.

> **Note:** [**Hibernate**](https://hibernate.org/) is a Java framework which is used to store the Java objects in the relational database system. It is an open-source, lightweight, ORM (Object Relational Mapping) tool.

> **Note:** [**Quartz**](http://www.quartz-scheduler.org/) is an open source job-scheduling framework written entirely in Java and designed for use in both *J2SE* and *J2EE* applications.

---

> **Note:** **Versioning & Comments (Dev only)**
>
> Pentaho Data Integration (PDI) can track versions and comments for jobs, transformations, and connection information when you save them. You can turn version control and comment tracking on or off by modifying their related statements in the repository.spring.properties text file.
>
> By default, version control and comment tracking are disabled (set to false). Best Practice: manage your ETL workflows with a 3rd party content management tool, e.g. Github; only uploading the production version into the Repository.

1. Exit from the PDI client (also called Spoon).
2. Stop the Pentaho Server.
3. Edit repository.spring.properties file.

```bash
cd
cd ~/Pentaho/server/pentaho-server/pentaho-solution/systems
nano repository.spring.properties
```

4. Edit the versioningEnabled and versionCommentsEnabled statements:

```
versioningEnabled=true versionCommentsEnabled=true
```

::::

