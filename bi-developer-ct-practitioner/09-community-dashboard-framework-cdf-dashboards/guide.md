# CDF Dashboards

> **Warning:**
>
> #### Workshop - CDF Dashboards
>
> The **Community Dashboard Framework (CDF)** is the code-first foundation beneath every CTools dashboard. Where the Community Dashboard Editor (CDE) hands you a graphical grid, CDF asks you to assemble a dashboard the way a web developer would — from two plain files that you author and upload yourself: an **XCDF** descriptor and an **HTML** template. Working at this level demystifies what CDE generates behind the scenes and gives you full control over markup, styling, and the RequireJS module loading that modern CDF relies on.
>
> In this hands-on workshop you'll build a CDF dashboard by hand, directly in the Pentaho User Console. You'll create the `.xcdf` file that registers the dashboard inside Pentaho, author the HTML template the components render into, wire the two together, opt into RequireJS / AMD module loading, and preview the result. Along the way you'll see exactly how the `<template>` element binds the descriptor to its markup and how CDF locates each component's render target by `htmlObject` id.
>
> By the end of this workshop you'll be comfortable creating, editing, and previewing CDF dashboards from raw files — the skill that lets you read, debug, and extend any CDE dashboard, since CDE ultimately produces the same artefacts.
>
> **What you'll do**
>
> * Create the two mandatory CDF files — an XCDF descriptor and an HTML template
> * Understand how each XCDF element (`title`, `template`, `style`, `require`) drives the dashboard
> * Author an HTML template with the `htmlObject` containers that components render into
> * Opt the dashboard into RequireJS / AMD module loading via `<require>true</require>`
> * Upload, register, and preview the dashboard in the Pentaho User Console
>
> **Prerequisites:** Pentaho Business Analytics Server with CTools installed; completion of the **Overview of Community Dashboard Framework** workshop; basic HTML / CSS / JavaScript familiarity
>
> **Estimated time:** 30 minutes

***

Before you begin, start the Pentaho Server and open the Pentaho User Console.

> **Note:**
>
> #### Linux
>
> ```bash
> cd
> cd /opt/pentaho/server/pentaho-server/
> sudo ./start-pentaho.sh
> ```

<button data-launch="puc">Open Pentaho User Console</button>

***

A CDF dashboard is built from **two mandatory files**:

| File | Role |
| --- | --- |
| **XCDF** | The main descriptor that identifies the file as a CDF dashboard inside Pentaho, and where the general settings live (title, template, style). Written in XML. |
| **HTML** | The template file whose markup the components render into. |

Follow the guide below to build a CDF dashboard from these two files:

:::: tabs

### 1. XCDF

> **Note:**
>
> #### The XCDF descriptor
>
> The `.xcdf` file is the root of the dashboard. It identifies the file to Pentaho as a CDF dashboard and points — via its `<template>` element — at the HTML file that holds the markup. This is the file you see in the PUC browser; double-clicking it is what renders the dashboard.

Create a file named `myFirstDashboard.xcdf` with the following content:

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

The root element is `<cdf>`, with the following child elements:

| Element | Description |
| --- | --- |
| `<title>` | The title displayed in the Pentaho User Console (PUC). |
| `<author>` | The author of the file, displayed inside the user console. |
| `<description>` | The description displayed in the PUC and in the browser. |
| `<icon>` | The icon to be displayed. |
| `<template>` | The HTML template file the components render into — here, `myFirstDashboard.html`. |
| `<style>` | The dashboard style applied to the template (e.g. `clean`). |
| `<require>` | Whether the dashboard uses RequireJS / AMD module loading. |

> **Note:** The `<template>` value is a **relative reference** to the HTML file in the same repository folder. Keep the `.xcdf` and its `.html` template together so Pentaho can resolve the template.

### 2. HTML

> **Note:**
>
> #### The HTML template
>
> The HTML file is the template the dashboard renders. It supplies the markup layout and, critically, the container elements that components target by id. Each component declares an `htmlObject` that must match the `id` of an element in this template — that is how CDF knows **where** on the page to render each component.

Create a file named `myFirstDashboard.html` alongside the XCDF descriptor. Start with a simple layout that exposes a single render target:

```html
<div class="dashboard">
  <h2>My First Dashboard</h2>
  <div id="panel_1"></div>
</div>
```

> **Note:** The `id="panel_1"` element is the **htmlObject** a component will render into. When you add components later, set each component's `htmlObject` property to the matching id (`panel_1`).

### 3. RequireJS

> **Note:**
>
> #### Opting into AMD
>
> Setting `<require>true</require>` in the XCDF descriptor opts the dashboard into the RequireJS / AMD approach. CDF then loads its modules — and your components — through RequireJS, which isolates code into modules, prevents global namespace pollution, and manages dependency load order for you.

With `<require>true</require>` set, component logic is wrapped in a RequireJS module so its dependencies load asynchronously and in the correct order:

```js
require([
  'cdf/Dashboard.Clean'
], function(Dashboard) {
  var dashboard = new Dashboard();
  dashboard.init();
});
```

> **Note:** This same module structure is what later makes it straightforward to **embed** a CDF dashboard inside a third-party application — the dashboard's dependencies are declared explicitly rather than relying on globals.

### 4. Upload & Preview

> **Note:**
>
> #### Upload and preview the dashboard
>
> With both files authored, upload them to the Pentaho repository and let CDF render the dashboard.

1. In the Pentaho User Console, browse to the folder where the dashboard should live.
2. Upload both files together: `myFirstDashboard.xcdf` and `myFirstDashboard.html`.
3. Double-click `myFirstDashboard.xcdf` to open and render the dashboard.

<button data-launch="puc">Open Pentaho User Console</button>

> **Success:** Your CDF dashboard renders in the Pentaho User Console, driven by the XCDF descriptor and its HTML template.

> **Note:** Because the `<template>` element resolves relative to the `.xcdf` file, the two files must be uploaded to the **same folder**. If the dashboard renders blank, confirm the template filename in the XCDF matches the uploaded HTML file exactly.

> **Warning:** Edits to either file take effect on the next render — re-open the `.xcdf` (or refresh the browser) after each change to see your updates.

::::
