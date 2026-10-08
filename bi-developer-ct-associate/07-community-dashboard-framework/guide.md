# Overview of Community Dashboard Framework

<div class="pcm-intro">

The **Community Dashboard Framework (CDF)** is a **code-first** dashboard framework. You build dashboards directly with **HTML, CSS, and JavaScript** — no Java required — and CDF manages the **dashboard and component lifecycles** for you. It's the foundation that the **Community Dashboard Editor (CDE)** builds on: CDE offers a faster, graphical path, but it ultimately relies on CDF under the hood, so understanding CDF's core concepts makes you more effective with both tools.

</div>

> **Note:**
>
> #### What this workshop covers
>
> Community dashboards can be built using either the Community Dashboards Framework (CDF) or the Community Dashboard Editor (CDE). While CDE offers a faster development path, it ultimately relies on CDF under the hood. Understanding CDF's core concepts is essential even when using CDE, as it enables better utilization of both tools.
>
> We're going to cover these concepts:
>
> - Dashboard and component lifecycle
> - Essential CDF API methods and functions
> - Component configuration and query parameters
> - Interactive filtering and component event handling
> - Internationalization features:
>   - Language localization
>   - Regional number formatting
>   - Date formatting based on user settings

> **Note:**
>
> #### By the end of this workshop
>
> You will understand:
>
> - The complete dashboard lifecycle
> - Available CDF API methods and their usage
> - How to create interactive, globally accessible dashboards

## Why CDF

CDF lets BA developers quickly and easily create dynamic dashboards. Users can explore and understand large amounts of data using a variety of charts, tables, and other components, and then **drill down** to the exact data they want. The framework creates dashboards leveraging web technologies such as **JavaScript, CSS, and HTML**, allowing the dashboard designer to control the whole dashboard lifecycle without resorting to Java coding.

CDF has five main advantages:

- Based on **open source** technology
- Uses popular web technologies, such as **Ajax, HTML, and CSS3**
- Manages the **components' lifecycles** and the interactions between them
- **Separates** the HTML design from the component definition
- Allows for **extensibility**

## The two mandatory files

To build a CDF dashboard, you create two main files:

| File | Role |
| --- | --- |
| **XCDF** | The main file that identifies the dashboard as a CDF dashboard type inside Pentaho, and where the general settings live (name, template, style). Written in XML syntax. |
| **HTML** | The template file with HTML content where the components are rendered. |

The `.xcdf` file is the root descriptor. It references the HTML template that the dashboard renders:

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
| `<author>` | The author of the file, displayed inside the user console. |
| `<description>` | The description displayed in the PUC and in the browser. |
| `<icon>` | The icon to be displayed. |
| `<template>` | The HTML template file the components render into. |
| `<style>` | The dashboard style (e.g. `clean`). |
| `<require>` | Whether the dashboard uses RequireJS / AMD module loading. |

## Modular code with AMD and RequireJS

Asynchronous Module Definition (**AMD**) has modernized CDF's functionality. AMD is a JavaScript specification that provides an API for creating modular code with managed dependencies. Its key benefits include:

- **Asynchronous loading** of interdependent modules
- **Logical organization** of code into smaller, focused files
- Better code structure and maintainability

CDF implements AMD through **RequireJS**, a JavaScript module loader that offers several advantages:

- **Namespace protection** — by isolating code into modules, RequireJS prevents global namespace pollution, reducing the risk of function or variable name conflicts.
- **Organized code structure** — developers can arrange code across multiple folders and files.
- **Smart loading** — RequireJS handles asynchronous loading of dependencies while maintaining proper execution order.

> **Note:** Setting `<require>true</require>` in the `.xcdf` file opts the dashboard into the RequireJS / AMD approach. This same structure also makes it easier to embed dashboards in third-party applications, covered later in the workshop.

## Where CDF sits in CTools

CDF is one of three main components of **Pentaho CTools** (Community Tools), an open-source data visualization toolkit that integrates with the Pentaho Business Intelligence Suite:

| Tool | Role |
| --- | --- |
| **CCC** (Community Chart Components) | Interactive JavaScript charting capabilities. |
| **CDE** (Community Dashboard Editor) | A visual, grid-based dashboard design environment. |
| **CDF** (Community Dashboard Framework) | The underlying dashboard structure, lifecycle, and data connections. |

Whereas CDF is a development framework directed at users with JavaScript and HTML skills, **CDE** is a graphical dashboard editor that provides access to the CDF components through a layout grid — enabling users to create dashboards without extensive JavaScript or HTML expertise.

Continue to **CDF Dashboard** to build your first dashboard from the two mandatory files.
