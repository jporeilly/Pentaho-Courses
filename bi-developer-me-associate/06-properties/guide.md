# Overview of Properties

<div class="pcm-intro">

In the Pentaho Metadata Editor, **properties** are the descriptive metadata attached to your data objects. They control how data is formatted, secured, and presented — letting users and applications interact with the model consistently. This page is your **reference** for what properties are, why some are mandatory, and how each one is structured as a simple key/value pair.

</div>

> **Note:**
>
> #### Properties
>
> The Pentaho Metadata Editor allows you to define and manage properties that describe your data model. These properties serve as metadata — descriptive information about your data objects — enabling users and applications to interact with data more effectively through consistent formatting, security rules, and custom attributes.
>
> **Required Properties**
>
> All physical objects (like tables) and many business objects have **mandatory properties** that are automatically created and cannot be deleted. These exist for a critical reason: they prevent users from accidentally removing properties that are essential for SQL generation to work properly. For example, a physical table must always have a "Target Table" property defined; without it, the SQL generator would fail and produce errors. Think of required properties as safeguards that maintain system integrity.
>
> **How Properties work?**
>
> A property consists of two parts: an identifier (a key) and a value. Together, these form a collection — essentially a map of attributes assigned to specific business objects like business columns or business tables.

<div align="center">
<figure>
<img src="../_assets/images/props_property_editor.png" alt="Physical Table Properties for CUSTOMER W TER with CUSTOMERNAME selected: the Available pane groups the properties under General, Formatting, Model Descriptors, Calculation and Miscellaneous, and Settings shows the Name CUSTOMERNAME" width="800">
<figcaption>Property Editor</figcaption>
</figure>
</div>

<div align="center">
<figure>
<img src="../_assets/images/property-map.png" alt="Physical column PRICEEACH sets every property: Name PRICEEACH, Formula PRICEEACH, Data Type Numeric, Default Aggregation None, no optional aggregations. Business column Price Sold stores only its overrides, Name Price Sold, Default Aggregation Sum and Optional Aggregations Average, Minimum, Maximum, and inherits Formula PRICEEACH and Data Type Numeric. Below, physical table ORDERFACT's required property Target Table ORDERFACT" width="800">
<figcaption>One column's properties, as the OrderStarCustomer workshop leaves them</figcaption>
</figure>
</div>

**Read the diagram.** Each box is one property: its key on top, its value underneath. The physical column on the left has a value for every key. The business column on the right stores only the keys you change, shown in teal; for every other key it reads its physical column's value, shown in grey. That is why renaming `PRICEEACH` to `Price Sold` leaves the formula alone. The required property sits on the physical table: `Target Table` is the table name the SQL uses, so the editor will not let you delete it. You set these exact values in [OrderStarCustomer](../07-properties-orderstarcustomer/guide.md), parts 4 and 5.
