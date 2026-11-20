# Concept Editor

> **Warning:**
>
> #### Workshop - Concept Editor
>
> Define formatting once and reuse it. You create five concepts in the Concept Editor, a hierarchy of number, currency, ID, hidden and date formats, apply them to the OrderStarCustomer business columns, publish the domain, and check the result in an Interactive Report.
>
> **What you'll do**
>
> * Create the concepts Number, USCurrency, ID, Hidden and Date, each inheriting from its parent
> * Give them masks, a text alignment and the **Hidden For the User?** flag
> * Set the parent concept of business columns in the Orders, Customers and Products categories
> * Publish the domain to the Pentaho Server
> * Check the formatting in an Interactive Report, and see what the Hidden flag does there
>
> **Prerequisites:**
>
> * The [OrderStarCustomer](../07-properties-orderstarcustomer/guide.md) workshop, or `OrderStarCustomer.xmi` from **Lab Files** below
> * The Pentaho Server running (see [Before You Start](../00-before-you-start/guide.md))
>
> **Estimated time:** 60 minutes

<figure>

<figcaption class="pcm-video-caption">Walkthrough: coming soon</figcaption>

</figure>

<div align="center">
<figure>
<img src="../_assets/images/concept_editor_concept_editor.png" alt="The Concept Editor with the concept tree Base, Number, USCurrency, ID, Hidden and Date; Number is selected, with Text Alignment Right and the mask #,##0" width="800">
<figcaption>What you build: five concepts below Base</figcaption>
</figure>
</div>

:::: tabs

### 1. Define Concepts

> **Note:**
>
> #### Define Concepts
>
> A concept is a reusable bundle of properties. A concept starts from its parent's properties and adds or overrides its own, and every business column whose parent concept it is takes them all. A new concept's parent is the concept selected when you create it.

1. Start the Metadata Editor with the **Open Metadata Editor** button below, or from PowerShell:

```powershell
Set-Location C:\Pentaho\design-tools\metadata-editor
.\metadata-editor.bat
```

<button data-launch="metadata-editor">Open Metadata Editor</button>

2. Make sure the Pentaho Server is running: you publish to it in part 3, and the HSQLDB sample data runs with it, on port `9001`. On a lab VM it starts with the machine. On your own machine, start it as [Before You Start](../00-before-you-start/guide.md) describes (its repository database first), and wait until **http://localhost:8080/pentaho** shows the sign-in page:

```powershell
C:\Pentaho\server\pentaho-server\start-pentaho.bat
```

3. Select **File > Open** (`Ctrl+O`), select **OrderStarCustomer** in the **Select a Domain** dialog, and select **OK**. Starting from the Lab Files instead? Select **File > Import from XMI File** (`Ctrl+I`), open `OrderStarCustomer.xmi` from `C:\Workshop-ME-Practitioner\04-concepts\09-concepts-concept-editor`, and in the **Save Model** dialog enter `OrderStarCustomer` and select **OK**.
4. Select **Tools > Concept Editor**.
5. Under **Concepts**, select **Base**, then select the green plus icon above the tree, ![The green plus icon](../_assets/images/add-concept-button.png).
6. In the **New Concept** dialog, enter `Number` and select **OK**.

<div align="center">
<figure>
<img src="../_assets/images/concept_editor_new_concept.png" alt="The New Concept dialog: Enter the name of the new concept. The parent concept of the new concept will be the concept currently selected. The name Number is entered" width="549">
<figcaption>The new concept's parent is the selected one</figcaption>
</figure>
</div>

7. Select **Number**. To the right of **Available**, select the green plus icon. The **Add New Property** dialog opens.
8. Keep **Add a pre-defined property** selected, select **Miscellaneous > Mask for Number or Date**, and select **OK**.

<div align="center">
<figure>
<img src="../_assets/images/concept_editor_add_mask_property.png" alt="The Add New Property dialog with Add a pre-defined property selected and Mask for Number or Date highlighted under Miscellaneous" width="501">
<figcaption>Add the mask property to the concept</figcaption>
</figure>
</div>

9. In the **Available** pane, select **Formatting > Text Alignment**. In **Settings**, select the **Override** icon to the right of **Text Alignment** and set **Alignment Type** to `Right`.
10. Select **Miscellaneous > Mask for Number or Date** and set **Value** to `#,##0`.

<div align="center">
<figure>
<img src="../_assets/images/concept_editor_set_text_alignment_and_mask.png" alt="The Number concept in the Concept Editor: Text Alignment with Alignment Type Right, and Mask for Number or Date with the value #,##0" width="800">
<figcaption>Number: right-aligned, with a thousands separator</figcaption>
</figure>
</div>

11. Select **Number** and select the green plus icon above **Concepts**. In **New Concept**, enter `USCurrency` and select **OK**.
12. Select **USCurrency**, then select **Miscellaneous > Mask for Number or Date**. The mask it inherited from Number is grayed out.
13. Select the **Override** icon to the right of **Mask for Number or Date** and set **Value** to `$#,##0.00;($#,##0.00)`.

<div align="center">
<figure>
<img src="../_assets/images/concept_editor_set_currency_mask.png" alt="The USCurrency concept under Number: the inherited Text Alignment Right is grayed out, and the overridden Mask for Number or Date is $#,##0.00;($#,##0.00)" width="800">
<figcaption>USCurrency overrides only the mask</figcaption>
</figure>
</div>

14. Select **Number**, create the concept `ID` the same way, override its **Mask for Number or Date**, and set **Value** to `#`.

<div align="center">
<figure>
<img src="../_assets/images/concept_editor_id_concept.png" alt="The ID concept under Number, with Mask for Number or Date selected in Available: the inherited Text Alignment Right is grayed out, and the overridden mask Value is #" width="800">
<figcaption>ID: a number with no thousands separator</figcaption>
</figure>
</div>

15. Select **ID** and create the concept `Hidden`.
16. Select **Hidden** and the green plus icon to the right of **Available**. In **Add New Property**, select **Miscellaneous > Hidden For the User?** and select **OK**.

<div align="center">
<figure>
<img src="../_assets/images/concept_editor.png" alt="The Add New Property dialog with Hidden For the User? highlighted under Miscellaneous" width="500">
<figcaption>Add Hidden For the User? to the Hidden concept</figcaption>
</figure>
</div>

17. Select **Miscellaneous > Hidden For the User?** and select the **Hidden For the User?** check box in **Settings**.

<div align="center">
<figure>
<img src="../_assets/images/concept_editor_set_number_mask_and_hidden.png" alt="The Hidden concept under ID with the Hidden For the User? check box selected and the inherited mask # grayed out" width="800">
<figcaption>Hidden: inherits the ID mask and hides the column</figcaption>
</figure>
</div>

18. Select **Base** and create the concept `Date`. Add **Miscellaneous > Mask for Number or Date** to it, as in steps 7 and 8, and set **Value** to `MM-dd-yyyy`.

<div align="center">
<figure>
<img src="../_assets/images/concept_editor_set_mask_for_date.png" alt="The Date concept directly under Base, with the inherited Text Alignment Left grayed out and the Mask for Number or Date MM-dd-yyyy" width="800">
<figcaption>Date: a child of Base, not of Number</figcaption>
</figure>
</div>

> **Success:** Checkpoint: the **Concepts** tree reads **Base**, with **Number** and **Date** below it; **USCurrency** and **ID** below **Number**; and **Hidden** below **ID**. Their own settings:
>
> | Concept | Parent | Own settings |
> | --- | --- | --- |
> | Number | Base | **Text Alignment** `Right`, **Mask for Number or Date** `#,##0` |
> | USCurrency | Number | **Mask for Number or Date** `$#,##0.00;($#,##0.00)` |
> | ID | Number | **Mask for Number or Date** `#` |
> | Hidden | ID | **Hidden For the User?** selected |
> | Date | Base | **Mask for Number or Date** `MM-dd-yyyy` |

19. Select **OK** to close the Concept Editor, then save the domain (`Ctrl+S`).

> **Under the hood:**
>
> #### Concepts inherit down a chain
>
> Hidden's parent is ID, ID's is Number and Number's is Base, and the
> engine resolves a column's properties by walking that chain: each
> concept starts from its parent's properties and adds its own. A column
> whose parent concept is Hidden therefore gets the # mask from ID, the
> alignment from Number, the font from Base, and Hidden For the User?
> from Hidden itself.
>
> A column's own overrides still win over anything a concept supplies,
> and a concept's properties win over what the column inherits from its
> physical column.
>
> **Why it matters:** change a mask on Number and every column under
> Number, USCurrency, ID and Hidden follows, unless it overrides that
> property itself.

<div align="center">
<figure>
<img src="../_assets/images/concept-chain.png" alt="The concept tree: Base, with its font and Text Alignment Left, passes its properties to Number and Date; Number adds Text Alignment Right and the mask #,##0 and passes them to USCurrency and ID, which each override the mask; ID passes them to Hidden, which adds Hidden For the User?. Below, a business column takes a property from its own override, then its parent concept chain, then its physical column" width="800">
<figcaption>Five concepts below Base, and where a column's property comes from</figcaption>
</figure>
</div>

Read the top of the diagram left to right: each arrow runs from a parent concept to a child, and each box names only what that concept adds or overrides. Date hangs directly from Base, so it takes Base's left alignment, not Number's right one. The bottom row is the order in which a business column looks for a property: its own override first, then its parent concept and every concept above it, and only then its physical column. Employee Number sets nothing itself, so the chain from Hidden up to Base supplies all of its properties, and Hidden For the User? flags it as a column report users should not see.

### 2. Apply Concepts

> **Note:**
>
> #### Apply Concepts
>
> Set a business column's parent concept from the business view: right-click the column and select **Set Parent Concept**. The column then shows its concept in the tree's **Parent Concept** column.

1. Expand **Business Models > OrderStarCustomer > Business View > Orders**.
2. Right-click **Order Number** and select **Set Parent Concept**.

<div align="center">
<figure>
<img src="../_assets/images/concept_editor_set_parent_concept_id.png" alt="The context menu of the Order Number column with Edit, Move Up, Move Down, Set Parent Concept and Clear Parent Concept" width="473">
<figcaption>Set Parent Concept, on a column's context menu</figcaption>
</figure>
</div>

3. In the **Select a Parent Concept** dialog, select **ID** and select **OK**.

<div align="center">
<figure>
<img src="../_assets/images/concept_editor_select_id_concept.png" alt="The Select a Parent Concept dialog listing Base, Date, Hidden, ID, Number and USCurrency, with ID selected" width="263">
<figcaption>Pick the concept</figcaption>
</figure>
</div>

4. Set the parent concept of these columns the same way:

| Category | Column | Parent concept |
| --- | --- | --- |
| Orders | Quantity Ordered | Number |
| Orders | Price Sold | USCurrency |
| Orders | Total Price | USCurrency |
| Orders | Order Date | Date |
| Orders | Required Date | Date |
| Orders | Shipped Date | Date |
| Orders | Total | USCurrency |
| Customers | Employee Number | Hidden |
| Products | Buy Price | USCurrency |
| Products | MSRP | USCurrency |

Every other column keeps **Base**.

<div align="center">
<figure>
<img src="../_assets/images/concept_editor_set_orders_concepts.png" alt="The Orders category with its parent concepts: Order Number on ID; Quantity Ordered on Number; Price Sold, Total Price and Total on USCurrency; the three dates on Date; Status and Comments on Base" width="438">
<figcaption>The Orders category's concepts</figcaption>
</figure>
</div>

> **Success:** Checkpoint: in **Orders**, only **Status** and **Comments** still show **Base**. In **Customers**, **Employee Number** shows **Hidden**; in **Products**, **Buy Price** and **MSRP** show **USCurrency**.

<div align="center">
<figure>
<img src="../_assets/images/concept_editor_hidden_concept.png" alt="The Customers category with every column on Base except Employee Number, on Hidden; Contact Name, the calculated column, shows no concept" width="364">
<figcaption>Customers: Employee Number on the Hidden concept</figcaption>
</figure>
</div>

<div align="center">
<figure>
<img src="../_assets/images/concept_editor_2.png" alt="The Products category with Product Code and the descriptive columns on Base, and Buy Price and MSRP on USCurrency" width="364">
<figcaption>Products: the two prices are currency</figcaption>
</figure>
</div>

5. Save the domain (`Ctrl+S`).

### 3. Publish

> **Note:**
>
> #### Publish the Domain
>
> Publish the domain so that Interactive Reports can use the concepts. The server must be running.

1. Select **File > Publish To Server**.
2. In the **Publish To Server** dialog, set:

| Setting | Value |
| --- | --- |
| **Web Publish URL** | `http://localhost:8080/pentaho/plugin/data-access/api/metadata/import` |
| **Server Userid** | `admin` |
| **Server Password** | `password` |
| **Domain Name** | `OrdersStarCustomer` |

The editor fills in the **Web Publish URL** and proposes the model's name, `OrderStarCustomer`, as **Domain Name**: replace it with `OrdersStarCustomer`.

<div align="center">
<figure>
<img src="../_assets/images/concept_editor_publish_dialog.png" alt="The Publish To Server dialog: Web Publish URL http://localhost:8080/pentaho/plugin/data-access/api/metadata/import, Server Userid admin, a masked Server Password and the Domain Name OrdersStarCustomer" width="588">
<figcaption>Ready to publish</figcaption>
</figure>
</div>

3. Select **OK**.

<div align="center">
<figure>
<img src="../_assets/images/concept_editor_publish_ordersstarcustomer.png" alt="The Action Successful message over the Publish To Server dialog: File - OrdersStarCustomer: Successfully saved to the server; the Web Publish URL, Server Userid admin and the masked password show above it" width="800">
<figcaption>Published as OrdersStarCustomer</figcaption>
</figure>
</div>

> **Success:** Checkpoint: an **Action Successful** message reads `File - OrdersStarCustomer: Successfully saved to the server`.

4. Select **OK**.

### 4. Interactive Report

> **Note:**
>
> #### Check the Concepts in a Report
>
> Interactive Reports applies a column's mask and alignment as it shows the fields. It does not apply **Hidden For the User?** on Pentaho 11.0.0.3, and this section shows what that means.

1. Open the Pentaho User Console with the button below and log in as `admin` (password `password`).

<button data-launch="puc">Open Pentaho User Console</button>

2. On the **Home** perspective, select **Create New > Interactive Report**.
3. In the **Select Data Source** dialog, select **OrderStarCustomer** and select **OK**.

<div align="center">
<figure>
<img src="../_assets/images/concept_editor_data_source_ordersstarcustomer.png" alt="The Select Data Source dialog with OrderStarCustomer selected, between Inventory and Orders" width="734">
<figcaption>The data source carries the model's name</figcaption>
</figure>
</div>

> **Success:** Checkpoint: the list shows **OrderStarCustomer**, not **OrdersStarCustomer**: **Select Data Source** lists business models, and the domain you published holds a model named OrderStarCustomer.

4. On the **Data** tab, expand **Customers**. It still lists **Employee Number**, though its parent concept is Hidden.

> **Under the hood:**
>
> #### The Hidden flag stays in the domain
>
> The domain you published carries **Hidden For the User?** on Employee
> Number, but Pentaho Server 11.0.0.3 does not pass the flag to
> Interactive Reports: the model it sends marks every column as visible,
> while the masks and alignments from the same concepts arrive and apply.
> So the flag records your intent in the domain, and Interactive Reports
> ignores it.
>
> **Why it matters:** to keep a column from report users in Interactive
> Reports, restrict its Metadata Security. The
> [Row-Level Security](../11-security-and-data-access-row-level-security/guide.md)
> workshop does that for Credit Limit, and `suzy` no longer sees it.

5. On the **Data** tab, double-click **Contact Name**, **Order Date**, **Quantity Ordered**, **Price Sold** and **Total**, in that order. Each one becomes a column of the report.

> **Success:** Checkpoint: **Price Sold** and **Total** show as dollar amounts with two decimals, such as `$325.87`, and the numbers are right-aligned. **Contact Name** reads last name, then first name, such as `Ferguson, Peter`.

6. Double-click **Required Date** and compare it with **Order Date**. **Order Date** reads like `04-29-2003`, the Date concept's mask; **Required Date** reads like `2003-05-08 00:00:00.0`, though it has the same concept.

<div align="center">
<figure>
<img src="../_assets/images/concept_editor_test_interactive_report.png" alt="An Interactive Report on OrderStarCustomer with the columns Contact Name, Order Date, Quantity Ordered, Price Sold, Total and Required Date; the first row reads Ferguson, Peter, 04-29-2003, 29, $325.87, $9,450.23 and 2003-05-08 00:00:00.0. The Data tab lists the Orders, Customers and Products categories" width="800">
<figcaption>The concepts at work: the masked Order Date beside the unmasked Required Date</figcaption>
</figure>
</div>

> **Under the hood:**
>
> #### A mask needs a matching data type
>
> Masks are applied by the reporting tool as Java format patterns:
> MM-dd-yyyy for dates, $#,##0.00;($#,##0.00) for numbers. In this model
> Order Date's data type is Date and Required Date's is String, so the
> Date concept's mask finds a date in one and only text in the other.
> The SQL is the same either way.
>
> **Why it matters:** a concept can only format what the data type lets
> it. When a mask seems to do nothing, check the column's **Data Type**
> before the mask.

7. Close the **Interactive Report** tab. You don't need to save the report.

::::

## Lab Files

Click a file to download. Every file is also on disk in this workshop's folder, `C:\Workshop-ME-Practitioner\04-concepts\09-concepts-concept-editor`: load a domain into Metadata Editor with **File > Import from XMI File**.

The starting domain, the result of the [OrderStarCustomer](../07-properties-orderstarcustomer/guide.md) workshop:

[OrderStarCustomer.xmi](./files/OrderStarCustomer.xmi)

### Solution <!-- no-step -->

The finished domain, with this workshop's concepts applied. Open it in Metadata Editor alongside your own to compare, or publish it to see the expected result.

Also on disk at `C:\Workshop-ME-Practitioner\04-concepts\09-concepts-concept-editor\solution`.

[OrderStarCustomer-concepts.xmi](./files/solution/OrderStarCustomer-concepts.xmi)
