# Review Parameters

<div class="pcm-intro">

Make pipelines configurable without editing them. Parameters are passed in at runtime; variables resolve from the environment or kettle.properties — together they're how you ship the same .ktr to dev, staging, and prod.

</div>

> **Note:** Both variables and parameters in Pentaho Data Integration enable you to create a more dynamic and reusable pipeline.
> 
> Variables are often used within transformations and jobs for storing values, while parameters are mainly used in jobs to pass dynamic values to transformations.
> 
> Let's expand on that ..
> 
> Think of a parameter as a local variable .. They are reusable inputs that apply only to the specific transformation or job, they are defined in. When defining a parameter, you can assign it a default value to use or you can dynamically fetch it.
> 
> Variables are used to store values that can be used across multiple jobs and transformations. They can be defined at different levels of scope, such as global or local. So, for example, suppose you have multiple transformations that read data from different CSV files and write it to a database. You can define a variable for the database connection string and use it across all of these transformations.

<div class="pcm-embed-card" data-href="https://www.loom.com/share/6f73339cdead464f8ee2a5bebd233e99?hideEmbedTopBar=true&amp;hide_owner=true&amp;hide_share=true&amp;hide_title=true" data-title="Dynamic Configuration of Variables and Parameters in Transformations" data-description="In this demonstration, I showed you how to recognize configuration properties that allow the use of parameters and variables in our transformations. We focused on using variables to control the output file's extension and delimiter, and I demonstrated how to override a variable with a parameter. You saw how to access the Run Options dialog to view and modify in-memory values without changing the Kettle.Properties file. I encourage you to practice using these techniques to dynamically change the execution of your transformations. Remember, testing various values for parameters and variables can enhance your workflow without altering definitions or property files." data-thumb="../_assets/embeds/2d94cd73b9b2.png"></div>

#### Workshops

::: tabs

### Parameters

> **Note:** In Pentaho Data Integration (PDI), parameters are variables that allow you to make your ETL (Extract, Transform, Load) processes more dynamic and reusable. They can be used to pass values into your transformations or jobs, making it easier to customize and control the behavior of your data integration processes.

**parameters**

### Variables

> **Note:** Variables can be used throughout Pentaho Data Integration, including in transformation steps and job entries. You define variables by setting them with the Set Variable step in a transformation or by setting them in the kettle.properties file in the directory.

**variables**

:::

