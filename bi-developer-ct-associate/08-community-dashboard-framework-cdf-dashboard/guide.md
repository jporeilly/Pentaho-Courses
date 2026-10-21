# CDF Dashboard

> **Warning:**
>
> #### Workshop - CDF Dashboard
>
> The Community Dashboard Framework (CDF) is a code-first framework: you build dashboards with HTML, CSS and JavaScript, and CDF manages the dashboard and component lifecycles. Every CDF dashboard starts from two files, an XCDF descriptor that registers the dashboard in Pentaho and an HTML template that the components render into. In this workshop you author both, upload them, and open your first CDF dashboard in the Pentaho User Console.
>
> **What you'll do**
>
> * Author an XCDF descriptor and learn what each of its elements does
> * Create the HTML template that the dashboard renders into
> * Upload both files to the Pentaho repository
> * Open the dashboard in the Pentaho User Console (PUC)
>
> **Prerequisites:** [Overview of Community Dashboard Framework](../07-community-dashboard-framework/guide.md); basic HTML, CSS and JavaScript; a text editor; a running Pentaho Server
>
> **Estimated time:** 30 minutes

A CDF dashboard needs two files:

* **XCDF** - the main file. It identifies the dashboard as a CDF dashboard inside Pentaho and holds its general settings, such as the title, the template and the style. It is written in XML.
* **HTML** - the template file, with the HTML content that the components render into.

CDF loads its code with Asynchronous Module Definition (AMD), a JavaScript specification for modular code with managed dependencies. AMD loads interdependent modules asynchronously and organizes code into smaller, focused files. CDF implements AMD through RequireJS, a JavaScript module loader that:

* keeps each module's code out of the global namespace, so function and variable names don't collide;
* lets you arrange the code across several folders and files;
* loads the dependencies asynchronously, in the right order.

The same approach makes a dashboard easier to embed in another application, which a later topic covers. This workshop builds the dashboard itself.

***

:::: tabs

### 1. XCDF

> **Note:**
>
> #### The XCDF descriptor
>
> The XCDF file is the main file. Its root element is `cdf`, with these child elements:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<cdf>
  <title>My first dashboard!</title>
  <author>My Name</author>
  <description>My first dashboard!</description>
  <icon></icon>
  <template>myFirstDashboard.html</template>
  <style>clean</style>
  <require>true</require>
</cdf>
```

| Element | Description |
| --- | --- |
| `<title>` | The title displayed in the Pentaho User Console (PUC). |
| `<author>` | The author of the file, displayed in the PUC. |
| `<description>` | The description displayed in the PUC and in the browser. |
| `<icon>` | The icon to display. |
| `<template>` | The HTML template file the components render into. |
| `<style>` | The dashboard style, for example `clean`. |
| `<require>` | Whether the dashboard uses RequireJS (AMD) module loading. `true` opts the dashboard into the approach described above. |

1. In a text editor, paste the listing above and save it as `myFirstDashboard.xcdf`.

> **Under the hood:**
>
> #### Opening the .xcdf runs CDF's renderer
>
> The CDF plugin reads three elements: template, the HTML to render;
> style, mantle when it is left out; and require, false when it is left
> out. It picks a wrapper page named after them,
> template-dashboard-clean-require.html for this dashboard, and writes
> your template into it inside <div id="dashboardContent">.
>
> The wrapper decides what reaches the page head. A RequireJS dashboard
> gets only webcontext.js and a requirejs.config call that carries the
> dashboard's context; a legacy one gets a script and stylesheet tag for
> each kind of component CDF finds in your HTML.
>
> **Why it matters:** the XCDF is a small set of switches. Changing the
> style or turning require on changes the whole page around your
> template without touching the template itself.

### 2. HTML

> **Note:**
>
> #### The HTML template
>
> The HTML file is the template that the `<template>` element names. It holds the HTML that the dashboard's components render into.

1. In the same folder as `myFirstDashboard.xcdf`, create `myFirstDashboard.html` with a heading and one element for a component to render into:

```html
<h2>My first dashboard!</h2>
<div id="myFirstComponent"></div>
```

The `id` of each element is the anchor that a CDF component's `htmlObject` property targets. The dashboard's JavaScript binds the components to these placeholders when the dashboard's lifecycle runs.

> **Under the hood:**
>
> #### htmlObject is an element id, nothing more
>
> When a component renders, CDF looks up the element whose id equals its
> htmlObject and draws inside it: a table, an SVG chart, a select box.
> Nothing else in the template is CDF-specific, which is what lets the
> page's design and the components that fill it be worked on separately.
>
> **Why it matters:** a web designer can own the template while a
> developer owns the components; the element ids are the only contract
> between them.

### 3. Upload and Open

> **Note:**
>
> #### Upload and open the dashboard
>
> Upload both files to the same folder of the Pentaho repository and let CDF render the dashboard.

1. Make sure the Pentaho Server is running. On a lab VM it already is; on your own machine start it as in [Before You Start](../00-before-you-start/guide.md):

```powershell
C:\Pentaho\server\pentaho-server\start-pentaho.bat
```

It takes a few minutes; the console is ready when http://localhost:8080/pentaho opens the login page.

2. Open the Pentaho User Console (PUC) with the button below and sign in as `admin`.

<button data-launch="puc">Open Pentaho User Console</button>

3. Select **Browse Files**. Under **Folders**, expand **Public** and select **CTools-Dashboard**. If it isn't there, select **Public**, select **New Folder...** under **Folder Actions**, and create it.
4. Under **Folder Actions**, select **New Folder...**, enter `CDF` and select **OK**.
5. Select **CDF**. Under **Folder Actions**, select **Upload...**. Select **Browse...**, choose `myFirstDashboard.xcdf`, and select **OK**.
6. Upload `myFirstDashboard.html` to the same folder the same way.
7. If the files are not listed under **Files** yet, select the **Refresh** icon beside **Folders**.
8. Under **Files**, double-click **myFirstDashboard**, the XCDF file, not the HTML template.

> **Success:** Checkpoint: the dashboard opens in a new tab and shows the heading **My first dashboard!**. The `myFirstComponent` element is empty: no component renders into it yet.

9. Close the dashboard's tab.

::::

## Lab Files

_No bundled files for this lab._
