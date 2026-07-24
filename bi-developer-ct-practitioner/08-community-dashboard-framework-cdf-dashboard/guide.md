# CDF Dashboard

> **Warning:**
>
> #### Workshop - CDF Dashboard
>
> The Community Dashboard Framework (CDF) is a code-first framework: you build dashboards directly with HTML, CSS, and JavaScript while CDF manages the dashboard and component lifecycles for you. Every CDF dashboard starts from two mandatory files — an XCDF descriptor that registers the dashboard inside Pentaho, and an HTML template where the components are rendered.
>
> This hands-on workshop builds on that foundation. You'll author the XCDF root descriptor, point it at an HTML template, and see how CDF uses Asynchronous Module Definition (AMD) through RequireJS to load modular, namespace-protected code. This is the foundation that the Community Dashboard Editor (CDE) builds on, so the concepts you learn here apply whether you hand-code dashboards or design them visually.
>
> In this workshop, you create your first CDF dashboard from scratch and view it in the Pentaho User Console.
>
> **What you'll do**
>
> * Understand the two mandatory files every CDF dashboard needs — XCDF and HTML
> * Author an XCDF descriptor and learn what each of its elements does
> * Create the HTML template that the dashboard renders into
> * Understand how CDF uses AMD and RequireJS for modular dashboard code
> * Open and view your dashboard in the Pentaho User Console (PUC)
>
> **Prerequisites:** Basic HTML, CSS, and JavaScript; completion of the *Overview of Community Dashboard Framework* lab; a running Pentaho Server with access to the Pentaho User Console
>
> **Estimated time:** 30 minutes

> **Note:**
>
> #### Asynchronous Module Definition (AMD)
>
> Asynchronous Module Definition (AMD) has modernized CDF's functionality. AMD is a JavaScript specification that provides an API for creating modular code with managed dependencies. Its key benefits include:
>
> 1. Asynchronous loading of interdependent modules
> 2. Logical organization of code into smaller, focused files
> 3. Better code structure and maintainability
>
> CDF implements AMD through RequireJS, a JavaScript module loader that offers several advantages:
>
> * **Namespace Protection**: By isolating code into modules, RequireJS prevents global namespace pollution, reducing the risk of function or variable name conflicts
> * **Organized Code Structure**: Developers can arrange code across multiple folders and files
> * **Smart Loading**: RequireJS handles asynchronous loading of dependencies while maintaining proper execution order
>
> These workshops demonstrate RequireJS integration with CDF. While this approach also simplifies dashboard embedding in third-party applications (covered later), our current focus is on basic dashboard creation.

> **Note:**
>
> #### The two mandatory files
>
> To build a CDF dashboard, you need to create two main files that are mandatory:
>
> * **XCDF**: This is the main file that identifies the dashboard as a CDF dashboard type inside Pentaho, and where the general settings are. For instance, we can set the name, template, and style for our dashboards. This file is written using the XML syntax.
> * **HTML**: This is the template file with HTML content where the components will be rendered.

***

Before you start, make sure the Pentaho Server is running:

> **Note:**
>
> #### Windows (PowerShell)
>
> ```powershell
> cd \
> cd Pentaho/server/pentaho-server/
> ./start-pentaho.bat
> ```

> **Note:**
>
> #### Linux
>
> ```bash
> cd
> cd Pentaho/server/pentaho-server/
> ./start-pentaho.sh
> ```

<button data-launch="puc">Open Pentaho User Console</button>

***

Follow the guide below to author the two mandatory files for your first dashboard:

:::: tabs

### 1. XCDF

> **Note:**
>
> XCDF is the main file, where the root element and the following child elements are defined:

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
| `<title>` | This corresponds to the title displayed in the Pentaho User Console (PUC). |
| `<author>` | This is the author of the file that will be displayed inside the user console. |
| `<description>` | This is the description displayed in the PUC and on the browser. |
| `<icon>` | This is the icon to be displayed. |
| `<template>` | The HTML template file the components render into. |
| `<style>` | The dashboard style (e.g. `clean`). |
| `<require>` | Whether the dashboard uses RequireJS / AMD module loading. |

> **Note:** Setting `<require>true</require>` opts the dashboard into the RequireJS / AMD approach described above.

### 2. HTML

> **Note:**
>
> The HTML file is the template referenced by the `<template>` element in the XCDF. It holds the HTML content into which the dashboard's components are rendered.

Create a file named `myFirstDashboard.html` containing an element for each component to render into:

```html
<div id="myFirstComponent"></div>
```

> **Note:** The `id` of each element is the anchor that a CDF component's `htmlObject` property targets. The dashboard's JavaScript binds components to these placeholders when the dashboard's lifecycle runs.

::::

***

<button data-launch="puc">Open Pentaho User Console</button>

With both files saved into the same folder of the Pentaho repository, open the **Pentaho User Console** and browse to the dashboard's `.xcdf` file. Double-click it to render your first CDF dashboard.

> **Success:** Your first CDF dashboard renders in the Pentaho User Console from the two mandatory files — the XCDF descriptor and the HTML template.

