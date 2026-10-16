# Connecting to Database

> **Warning:**
>
> #### Workshop - Connecting to Database
> 
> Create a reusable MySQL connection to the Steel Wheels `sampledata` database.
> 
> **What you’ll do**
> 
> * Check the database is reachable (optional: Adminer on a lab VM, or DBeaver)
> * Install the MySQL JDBC driver, if PDI doesn't have it yet
> * Create, test, share and explore a PDI database connection
> 
> **Prerequisites**
> 
> * PDI (Spoon) installed and working
> * A running **MySQL** `sampledata` database on port `3306` - on a lab
>   VM the course's lab kit starts it at sign-in. **Not** the
>   HSQLDB/Hypersonic `sampledata` bundled with Pentaho, which is
>   read-only and can't serve the CRUID workshops that follow
> * Basic understanding of schemas, tables and logins
> 
> **Estimated time:** 30 minutes

:::: tabs

### 1. Check the Database

> **Note:**
>
> #### **Check the database first**
> 
> This part is optional. Confirming the database answers, outside PDI, means a failed **Test** later is a PDI setting, not the database.

> **Warning:** Use the course's MySQL `sampledata`, not Pentaho's bundled sample database, which has no writable user.
>
> On a lab VM it is already running: the guide's lab kit started it at sign-in, and the environment panel on [Before You Start](../00-before-you-start/guide.md) shows it. On your own machine, Before You Start's setup tabs bring it up on `3306`, with Steel Wheels loaded and the `pentaho_admin` login used below.

::: tabs

### Adminer (lab VM)

The lab VM comes with **Adminer**, a database browser that runs beside MySQL.

1. Open <http://127.0.0.1:8050> in a browser.
2. Log in with **System** `MySQL`, **Server** `sampledata-mysql`, **Username** `pentaho_admin`, **Password** `password` and **Database** `sampledata`.
3. Select **SQL command**, run the query below, and select **Execute**:

```sql
select * from CUSTOMERS
where COUNTRY = 'USA' and CITY = 'NYC';
```

> **Success:** Checkpoint: 5 customers, from `Land of Toys Inc.` to `Microscale Inc.`.

### DBeaver

DBeaver Community Edition ships with most drivers, which makes it a quick connectivity check on your own machine.

1. Launch DBeaver and select **MySQL**.

<figure><img src="../_assets/images/mysql.png" alt="DBeaver's new connection dialog with MySQL selected"><figcaption><p>Choose MySQL</p></figcaption></figure>

2. Configure the connection: **Host** `localhost`, **Port** `3306`, **Database** `sampledata`, **Username** `pentaho_admin`, **Password** `password`.

<figure><img src="../_assets/images/configure-x26-test-mysql-connection-sampledata.png" alt="Configure &#x26; Test MySQL connection - sampledata"><figcaption><p>Configure &#x26; Test MySQL connection - sampledata</p></figcaption></figure>

> **Warning:** DBeaver may offer to download the MySQL driver; accept it.
> 
> If the test fails with a public key error, set the driver property `allowPublicKeyRetrieval` to `true`.

<figure><img src="../_assets/images/image-56.png" alt="Enable: allowPublicKeyRetrieval"><figcaption><p>Enable: allowPublicKeyRetrieval</p></figcaption></figure>

3. Test the connection.

<figure><img src="../_assets/images/test-connection-2.png" alt="Test connection"><figcaption><p>Test connection</p></figcaption></figure>

4. Expand **Databases > sampledata > Tables**.

<figure><img src="../_assets/images/customer-data.png" alt="Customer Data"><figcaption><p>Customer Data</p></figcaption></figure>

5. Open a SQL window and run a test query:

```sql
select * from CUSTOMERS
where COUNTRY = 'USA' and CITY = 'NYC';
```

<figure><img src="../_assets/images/sql-query-nyc-customers.png" alt="DBeaver showing the five New York customers"><figcaption><p>The NYC customers</p></figcaption></figure>

> **Success:** Checkpoint: 5 customers, from `Land of Toys Inc.` to `Microscale Inc.`.

:::

### 2. JDBC Driver

> **Note:**
>
> #### **Download JDBC Driver**
> 
> PDI does not ship all JDBC drivers, and **PDI 11 does not include the
> MySQL driver this course needs**. Without it, the **Test** in the next
> part fails. On a workshop VM it may already be there: look for
> `mysql-connector-j-*.jar` in the folder below, or check the **MySQL
> JDBC driver** row in Before You Start's environment panel.

<div class="pcm-embed-card" data-href="https://docs.pentaho.com/install/jdbc-drivers-reference" data-title="JDBC drivers reference | Pentaho" data-thumb="../_assets/embeds/1c4d9f7d98fc.png"></div>

1. Download the MySQL driver, `mysql-connector-j-8.4.0.jar`, from Maven Central: <https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.4.0/mysql-connector-j-8.4.0.jar>. In PowerShell this downloads it straight into PDI's `lib` folder (step 2):

```powershell
Invoke-WebRequest https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.4.0/mysql-connector-j-8.4.0.jar -OutFile C:\Pentaho\design-tools\data-integration\lib\mysql-connector-j-8.4.0.jar
```

For another database, find its driver here:

<div class="pcm-embed-card" data-href="https://dbschema.com/databases.html" data-title="DbSchema Supported Databases" data-description="Explore all SQL and NoSQL databases supported by DbSchema. Visually design schemas, create ER diagrams, synchronize changes, and document your database — for any database engine." data-thumb="../_assets/embeds/6c6ef7a1bcc8.png"></div>

2. If you downloaded it some other way, copy the driver JAR into your PDI install:

::: tabs

### Windows

`C:\Pentaho\design-tools\data-integration\lib\`

### macOS / Linux

`~/Pentaho/design-tools/data-integration/lib/`

:::

3. Restart Spoon.

> **Note:** If your install uses `lib/jdbc/`, place the JAR there instead.

### 3. Data Integration

> **Note:**
>
> #### **Pentaho Data Integration Connection**
> 
> Create the connection once.\
> Reuse it in steps like **Table input**, **Table output**, and **Database lookup**.
> 
> In this lab, you connect to the Steel Wheels `sampledata` database (MySQL).

**Define a database connection (MySQL)**

1. In Spoon, create a transformation and save it as `tr_connect_database.ktr` in the lab folder, `C:\Workshop-DI-Practitioner\03-data-sources\02-databases\12-mod3-connecting-to-database`.
2. Select **File > New > Database Connection**. The **Database Connection** dialog opens.

<figure><img src="../_assets/images/file-new-database-connection.png" alt="The File menu with New and Database Connection highlighted"><figcaption><p>File &gt; New &gt; Database Connection</p></figcaption></figure>

3. Enter these details:

   | Setting | Value |
   | --- | --- |
   | **Connection name** | `MySQL:sampledata` |
   | **Connection type** | MySQL |
   | **Access** | Native (JDBC) |
   | **Host name** | `localhost` |
   | **Database name** | `sampledata` |
   | **Port number** | `3306` |
   | **Username** | `pentaho_admin` |
   | **Password** | `password` |

> **Warning:** Use the MySQL driver. A MariaDB driver newer than 2.7.x can fail with a **fetch size** error against this database.

<figure><img src="../_assets/images/mysql-sampledata.png" alt="The Database Connection dialog filled in for MySQL:sampledata"><figcaption><p>The MySQL:sampledata connection</p></figcaption></figure>

4. Select **Test**.

> **Success:** Checkpoint: Spoon reports that the connection to `sampledata` is OK.

> **Under the hood:**
>
> #### Test opened a real JDBC connection, and every step will open its own
>
> Spoon assembled a JDBC URL from the fields you filled in —
> `jdbc:mysql://localhost:3306/sampledata` — loaded the MySQL driver
> from `lib/`, opened a connection, checked it and closed it again.
> The connection you saved is *metadata*: the recipe, not a live
> socket.
>
> At run time each step that uses it — **Table input**, **Table
> output**, **Database lookup** — opens its own physical connection
> from that recipe, with its own transaction. That is what lets a
> reader and a writer on the same database run concurrently on
> separate threads; it is also why a failed **Table output** doesn't
> roll back anything another step did. (**Transformation properties >
> Miscellaneous > Make the transformation database transactional**
> puts them all on one connection when you need all-or-nothing.)
>
> **Why it matters:** connections are cheap to define and reuse, but
> every database step is a client of your database. Ten database steps
> is ten sessions — size connection pools accordingly.

::: tabs

### 1. Share Connection

> **Note:** **Share Database Connection**
> 
> Share the connection so other transformations can reuse it.

1. Select **OK** to save the connection and close the dialog.
2. In the **View** tab, expand **Database connections**, right-click `MySQL:sampledata` and select **Share**. Its name turns bold.

<figure><img src="../_assets/images/share-database-connection.png" alt="The connection's right-click menu with Share"><figcaption><p>Share the connection</p></figcaption></figure>

> **Note:** A shared connection appears in every transformation and job you open in this Spoon. **Stop sharing** on the same menu reverses it.

> **Under the hood:**
>
> #### Share moved the definition into `shared.xml`
>
> An ordinary connection lives inside the transformation's own XML -
> open the `.ktr` in a text editor and you will find a `<connection>`
> block with the host, port and an encrypted password. **Share**
> writes that definition to `shared.xml` in your `.kettle` folder,
> beside `kettle.properties`, and from then on every transformation
> and job you open in this Spoon sees it in the **View** tree.
>
> It also changes what Spoon saves: a transformation you create that
> uses a shared connection is saved *without* the `<connection>`
> block, because `shared.xml` holds it. That file runs anywhere the
> same `shared.xml` exists - this machine, or a server you copy
> `shared.xml` to - and fails with a missing connection anywhere else.
> A repository shares connections between machines for real.
>
> **Why it matters:** one definition, reused by every workshop that
> follows, and the password never typed again. When a file must run
> on its own somewhere else, keep its connection unshared, or ship
> `shared.xml` with it.

### 2. Explore Database

> **Note:** **Explore the database**
> 
> Use the **Database Explorer** to browse tables, preview rows and run SQL.

1. In the **View** tab, expand **Database connections**.
2. Right-click `MySQL:sampledata` and select **Explore**. Right-clicking a table in the explorer offers:

| Menu item | What it does |
| --- | --- |
| **Preview first 100 rows of [table]** | Shows the table's first 100 rows |
| **Preview first ... rows of [table]** | Asks how many rows, then shows them |
| **Number of rows of [table]** | Counts the rows |
| **Show layout of [table]** | Lists the columns and their types |
| **Generate DDL** | Shows the `CREATE TABLE` statement for the table |
| **Generate DDL for other connection** | The same, in another connection's SQL dialect |
| **Open SQL for [table]** | Opens a `SELECT` for the table in the SQL editor |
| **Truncate table [table]** | Deletes every row in the table |

3. In the **Database Explorer**, expand `MySQL:sampledata` > **Tables**.

<figure><img src="../_assets/images/db-explorer.png" alt="The Database Explorer listing the sampledata tables" width="375"><figcaption><p>The sampledata tables</p></figcaption></figure>

4. Right-click `CUSTOMERS` and select **Preview first 100 rows of [CUSTOMERS]**. Look over the customer data, then close the preview.
5. Right-click `CUSTOMERS` again and select **Open SQL for [CUSTOMERS]**. The SQL editor opens with a `SELECT`.

<figure><img src="../_assets/images/sql.png" alt="The SQL editor with a SELECT on CUSTOMERS" width="375"><figcaption><p>The generated SELECT</p></figcaption></figure>

6. Select **Execute**.

<figure><img src="../_assets/images/execute-sql-statement.png" alt="The results of the SELECT on CUSTOMERS"><figcaption><p>The query's results</p></figcaption></figure>

> **Success:** Checkpoint: you can preview `CUSTOMERS` and execute SQL in Database Explorer.

:::

::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

### Solution <!-- no-step -->

The finished transformation for this lab: it holds just the `MySQL:sampledata` connection, embedded, so it works without your shared one. Open it to compare your connection settings.

Also on disk at `C:\Workshop-DI-Practitioner\03-data-sources\02-databases\12-mod3-connecting-to-database\solution`.

[tr_connect_database.ktr](./files/tr_connect_database.ktr) <button data-launch="spoon" data-path="files/tr_connect_database.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_connect_database.ktr">View graph</button>
