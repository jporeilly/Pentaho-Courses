# Overview of Concepts

<div class="pcm-intro">

When you build a metadata domain, you're creating a framework that lets end users and applications consistently enhance their data through formatting, security rules, and custom properties. **Concepts** are the reusable building blocks that make this possible — bundles of metadata properties you define once and apply everywhere through inheritance.

</div>

> **Note:**
>
> #### What is a Concept?
>
> A **concept** is a bundle of metadata properties you attach to business objects (such as database tables or columns). Instead of defining properties individually each time, you package them together as reusable concepts — currency formats, number formats, text formats, and so on. Concepts can be organised in a **hierarchy where child concepts inherit properties from parents**, so you define metadata once at a higher level and have it apply automatically to everything below — avoiding repetition and ensuring consistency.

<figure><img src="../_assets/images/concepts_overview.png" alt=""><figcaption></figcaption></figure>

## The Base Concept

At the foundation sits the **Base concept**, which automatically serves as the parent to all physical columns in your metadata model. Think of it as a safety net: it establishes baseline metadata properties that apply everywhere by default — for example, a currency mask of `$#,##0.00;($#,##0.00)`. You can update, add, or remove properties on the Base concept, and you can remove it as the parent for specific columns, but you **cannot delete it** from the concept list.

## Three levels of Concepts

| Level | Where the properties come from |
| --- | --- |
| **Self-concepts** | Properties applied directly to the object in the editor. |
| **Parent concepts** | Properties inherited from a parent concept set at the business view level. |
| **Inherited concepts** | Properties inherited from other concepts higher up in the hierarchy. |

Together these create a flexible, reusable system for managing metadata across your data landscape.

## Concept tools

:::: tabs

### Concept Editor

> **Note:**
>
> #### Concept Editor
>
> **Parent concepts** are independent hierarchies of concepts that can be assigned to one or more business objects through the navigation tree. Before you can assign a parent concept, you must first create one. The **Concept Editor** lets you build concepts to use as parent concepts — isolating them, naming them, then associating the named concept with one or more business objects for flexibility and good concept management. You can also define concepts that **build upon other concepts**: by nesting concepts this way, you minimise the number of properties you repeatedly define and create a clean inheritance hierarchy.

### Default Concept

> **Note:**
>
> #### Default Concept
>
> The **Default Concept** is the default set of properties assigned to objects, used mainly for formatting (for example, a default currency mask of `$#,##0.00;($#,##0.00)`). Every model contains a default concept called **Base**, applied as the parent to all physical columns created under a connection. Its purpose is to provide legitimate values for common metadata properties that may not be set elsewhere in your hierarchy. You can update, add, and delete properties on the Default Concept and remove it as the parent for any physical columns, but you cannot delete it from the list of concepts in the Concept Editor.

::::
