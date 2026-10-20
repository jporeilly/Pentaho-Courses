# Overview

<div class="pcm-intro">

Every Pentaho Data Integration pipeline starts and ends at a data source. This module's workshops cover the ones you'll meet most: flat files (text, JSON, XML and Excel), relational databases (create, read, update, insert and delete, plus slowly changing dimensions) and object storage (MinIO, which speaks the Amazon S3 protocol). The last two tabs below introduce big-data platforms and notebooks, which Pentaho Data Integration also works with.

</div>

### Choose a data source

Use this page to find your way, then open the section you need.

> **Note:**
>
> #### What “data source” means in Pentaho Data Integration
> 
> In practice, a data source is either:
> 
> * A file format you parse (CSV, Excel, JSON, XML).
> * A service you connect to (a DB, object store, cluster, or API).

:::: tabs

### Flat Files

> **Note:**
>
> #### Flat files
> 
> Flat files are how data most often arrives: CSV, other delimited text, fixed-width, JSON, XML or Excel.
> 
> Start here: [Flat Files](../topic-mod3-flat-files-review/guide.md).

<div align="center">
<figure>
<img src="../_assets/images/flat-files-2.png" alt="Flat file types: structured, unstructured, semi-structured, and metadata" width="800">
<figcaption>Kinds of flat file</figcaption>
</figure>
</div>

::: tabs

### Structured

> **Note:**
>
> #### Structured
> 
> Structured data follows a predefined model of tables, rows and columns, so it is easy to validate and query. Examples: SQL databases and well-formed CSV files.

### Unstructured

> **Note:**
>
> #### Unstructured
> 
> Unstructured data has no consistent schema - PDFs, images, video, free-form text. Using it usually takes parsing, extraction or machine learning.

### Semi-structured

> **Note:**
>
> #### Semi-structured
> 
> Semi-structured data has a loose schema: tags or keys describe the fields and their hierarchy. JSON and XML are the common formats.

### Metadata

> **Note:**
>
> #### Metadata
> 
> Metadata is data about data: header rows, schemas and data dictionaries.

:::

### Databases

> **Note:**
>
> #### Databases
> 
> Pentaho Data Integration connects to relational databases through JDBC drivers, one for each kind of database.
> 
> Start here: [Databases](../topic-mod3-databases-review/guide.md).

<div align="center">
<figure>
<img src="../_assets/images/database-connection.png" alt="The Database Connection dialog on its General page: the connection types with Oracle selected, and its Native (JDBC), OCI and JNDI access methods" width="800">
<figcaption>Database connections</figcaption>
</figure>
</div>

### Storage

> **Note:**
>
> #### Storage
> 
> Storage sources are cloud or network file stores, such as Amazon S3, Azure Blob Storage and Google Cloud Storage. Pentaho Data Integration reaches them through a VFS (virtual file system) connection, so the same steps read and write files on any of them.
> 
> Start here: [Storage](../topic-mod3-storage-review/guide.md).

<div align="center">
<figure>
<img src="../_assets/images/storage-types-overview.png" alt="Storage types Pentaho Data Integration can reach through VFS connections" width="800">
<figcaption>Storage types</figcaption>
</figure>
</div>

### Big Data

> **Note:**
>
> #### Big Data
> 
> Big data sources need distributed compute: Hadoop (HDFS, Hive, HBase), Spark, NoSQL stores and Kafka. Pentaho Data Integration has dedicated steps and adapters for these platforms, so it can transform data where it lives. This course has no workshop on them; the Pentaho documentation covers each one.

<div align="center">
<figure>
<img src="../_assets/images/types-of-big-data.png" alt="Types of big data: structured, unstructured, semi-structured, geospatial, machine or operational logging, and open-source data" width="720">
<figcaption>Types of big data</figcaption>
</figure>
</div>

### Jupyter Notebook

> **Note:**
>
> #### Jupyter Notebook
> 
> Jupyter is a web-based notebook that mixes code, charts and narrative text, which suits exploratory analysis and prototyping. In a typical setup the notebook does the advanced analysis and Pentaho Data Integration runs the production pipelines and schedules around it.

<div align="center">
<figure>
<img src="../_assets/images/jupyter-notebook.png" alt="Jupyter Notebook" width="800">
<figcaption>Jupyter Notebook</figcaption>
</figure>
</div>

::::

