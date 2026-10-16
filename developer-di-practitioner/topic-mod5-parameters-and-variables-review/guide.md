# Review Parameters

<div class="pcm-intro">

Make pipelines configurable without editing them. Parameters are passed in at runtime; variables resolve from the environment or kettle.properties. Together they're how you ship the same .ktr to dev, staging, and prod.

</div>

**What You'll Learn**

* The difference between a named parameter and a variable
* Where variables come from, and how far they reach
* When to use `${}` substitution, and when a `?` marker

> **Note:** Variables and parameters both let one transformation or job behave differently from run to run, without editing it.
>
> A **named parameter** belongs to one transformation or job. It is declared there, with a default value and a description, and whoever runs it (Spoon, Pan, Kitchen, or a job entry) can pass a different value for that run.
>
> A **variable** is a name with a value, set outside the file: in `kettle.properties`, by a **Set variables** step in an earlier transformation of a job, or by the environment. Variables reach every transformation and job that runs in that scope. A database host, used by every transformation, is a typical variable.
>
> At run time a parameter becomes a variable too, so steps read both the same way, as `${NAME}`. When a parameter and a variable share a name, the parameter wins.

<div class="pcm-embed-card" data-href="https://www.loom.com/share/6f73339cdead464f8ee2a5bebd233e99?hideEmbedTopBar=true&amp;hide_owner=true&amp;hide_share=true&amp;hide_title=true" data-title="Dynamic Configuration of Variables and Parameters in Transformations" data-description="In this demonstration, I showed you how to recognize configuration properties that allow the use of parameters and variables in our transformations. We focused on using variables to control the output file's extension and delimiter, and I demonstrated how to override a variable with a parameter. You saw how to access the Run Options dialog to view and modify in-memory values without changing the Kettle.Properties file. I encourage you to practice using these techniques to dynamically change the execution of your transformations. Remember, testing various values for parameters and variables can enhance your workflow without altering definitions or property files." data-thumb="../_assets/embeds/2d94cd73b9b2.png"></div>

#### Workshops

::: tabs

### Parameters

> **Note:** **Named parameters and `${}` substitution**
>
> A parameter's value replaces `${NAME}` in a step's settings, including the text of a SQL query, before the step runs. It suits configuration you control: a status, a date, a schema name.
>
> Workshop: [Parameters](../34-mod5-parameters/guide.md).

### Values from the data

> **Note:** **`?` markers**
>
> When the values come from the data, pass them to a query as `?` markers instead. The database driver binds them as values, so a value can't change the statement.
>
> Workshop: [Parameters SQL](../35-mod5-parameters-sql/guide.md).

### Variables

> **Note:** **Variables**
>
> Set variables in `kettle.properties` (**Edit > Edit the kettle.properties file**) for values every run on a machine shares, or with **Set variables** in a job's first transformation for values the rest of the job uses. Read them anywhere a setting shows the `$` icon, or into the stream with **Get variables**.
>
> See [Kettle Variables](../02-mod1-kettle-variables/guide.md) in Module 1.

:::
