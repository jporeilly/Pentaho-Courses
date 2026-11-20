# Components

<div class="pcm-intro">

The Pentaho **Metadata Editor (PME)** bridges the gap between raw database structures and business-friendly data models. It builds a **metadata domain** — a logical map of your database that speaks the language of business — stored in a central repository and consumed by reporting and analysis tools. The domain has two layers: a **physical layer** holding the technical database definitions, and a **business model layer** giving an abstracted, business-oriented view of that data.

</div>

> **Note:**
>
> #### Metadata Editor
>
> The Pentaho Metadata Editor (PME) is a tool that bridges the gap between raw database structures and business-friendly data models. At its core, PME helps organizations create metadata domains that transform complex database architectures into intuitive business models.
>
> When you create a metadata model in PME, you're essentially building a logical map of your database that speaks the language of business. This model is stored in a central repository, giving administrators several valuable capabilities:
>
> First, they can translate technical database terminology into clear, business-friendly language that makes sense to end users. This makes reporting and analysis more accessible to non-technical staff.
>
> Second, when database changes occur at the technical level, the metadata layer acts as a buffer, minimizing disruption to business users and reducing maintenance costs.

<div align="center">
<figure>
<img src="../_assets/images/domain-purpose.png" alt="Two columns followed from the database to a report: CUSTOMER_W_TER's CUSTOMERNAME becomes the business column Customer Name in the category Customers, which the report user picks; ORDERFACT's PRICEEACH becomes Price Sold, aggregation Sum and concept USCurrency, which arrives summed. Underneath, what the domain adds: business names per locale, formats from concepts, security (suzy sees EMEA customers only), and a buffer against database change" width="800">
<figcaption>What a domain does between the database and a report</figcaption>
</figure>
</div>

**Read the diagram.** Each row follows one column. The database knows `CUSTOMERNAME` in a table called `CUSTOMER_W_TER`; the report user never sees either name. The domain gives the column a business name and puts it in a category, and for a number it also decides how it is summed and formatted. The panel underneath is what the rest of this course builds: names in [Properties](../07-properties-orderstarcustomer/guide.md), formats in [Concepts](../09-concepts-concept-editor/guide.md), and security in [Row-Level Security](../11-security-and-data-access-row-level-security/guide.md).

<div align="center">
<figure>
<img src="../_assets/images/components.png" alt="The Metadata Editor with the SteelWheels domain open: the tree shows the SampleData connection and its tables, then the Human Resources, Inventory and Orders business models, and the graphical view draws the Orders model's five tables" width="800">
<figcaption>A domain in the Metadata Editor: the physical layer above, the business models below</figcaption>
</figure>
</div>

> **Note:**
>
> The tool also enhances data governance through security controls that precisely manage user access to specific data elements in reports. Additionally, PME streamlines report maintenance by establishing consistent formatting rules for text, dates, and numbers across the organization.
>
> For global organizations, PME supports localization, automatically adjusting how information is presented based on users' regional settings.
>
> The metadata domain created by PME consists of two key components: the physical layer, which contains the technical database structure definitions, and the business model layer, which provides an abstracted, business-oriented view of that data. Together, these layers create a comprehensive framework that makes complex data structures more accessible and manageable.
>
> The primary purpose of PME is to create a semantic layer that makes complex database structures more accessible to business users while maintaining data consistency and security across the organization.
