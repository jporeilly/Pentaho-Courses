# Environment Variables Reference

> **Note:**
>
> Reference material from the course manual (Appendix C).

## Appendix B – Charts

## Environmental Variables

Environment variables are basically variables whose values depend on the environment in which they are being used. For example, an environment variable can return to the application using it as a description of the current operating system or the complete path where the application is being executed.

In Pentaho Report Designer (PRD) there exists a series of predefined environment variables that will help us interact with the Pentaho Server that is running them. Making use of these variables, we can modify the behavior and content of our reports.

<div align="center">
<figure>
<img src="../_assets/images/refc-01.png" alt="Report preview: the heading Welcome Designer above a green horizontal rule, and Again: Hello World! in bold blue below it" width="534">
<figcaption>The finished report as Report Designer previews it, for the user Designer</figcaption>
</figure>
</div>

* Create a new report.
* In the Page Header section, add a Label.
* Configure the Label:
Attributes.value =      =CONCATENATE("Welcome "; ["env::username"])

## Attributes.style-class =      =["env::username"]

## Style.family (font) = 16

## Style.bold = true

<div align="center">
<figure>
<img src="../_assets/images/refc-02.png" alt="Edit Expression dialog, Formula tab: the CONCATENATE function with two text arguments, &quot;Welcome&quot; and the env::username field" width="461">
<figcaption>CONCATENATE joins Welcome and the env::username variable</figcaption>
</figure>
</div>

* In the Page Header, add a Horizontal Rule
* Configure the Horizontal Rule:
## Attributes.style-class =    =["env::username"]

## Style.stroke = solid, 2.0

* In the Report Header section, add a Label.
* Configure the Label:
Attributes.value = Again: Hello World!

## Attributes.style-class =    =["env::username"]

## Style sheet

PRD uses CSS3 to implement stylesheets, which allows, among other things, correct integration with the most popular web browsers.

The stylesheets' code in PRD is stored in an XML file with the extension .prptstyle. This file can be created, exported, and modified from the PRD UI using the Style Definition Editor. Also, this file can be embedded in our report or linked to it.

Using stylesheets in PRD will make the design of the final presentation of our reports easier and will save us a lot of manual configuration time, in addition to separating the presentation logic from the report logic. That is, we can create our stylesheets once and then apply them to all of our reports. If, for example, our company changes its logo, colors, font face, and so on, we don't have to modify each and every report. We modify only the CSS assigned to the reports.

* To create a stylesheet, select **Extras > Style Definition Editor**.

<div align="center">
<figure>
<img src="../_assets/images/refc-03.png" alt="The Report Designer Extras menu open, with Style Definition Editor highlighted below Migrate Report and Anonymize report" width="372">
<figcaption>The Style Definition Editor is on the Extras menu</figcaption>
</figure>
</div>

* Select **Add Style-Rule** and configure a Rule:
## Rule =   horizontal-line[style-class="Designer"]

## Style.text-color= #339900

<div align="center">
<figure>
<img src="../_assets/images/refc-04.png" alt="Style Definition Editor: a rule for horizontal lines whose style-class is Designer, with text-color set to #339900" width="453">
<figcaption>The Designer rule gives horizontal lines the green text-color #339900</figcaption>
</figure>
</div>

The CSS rule says that it will apply the style (green color) to all the horizontal lines that have the value Designer in their Attributes.style-class.

Note: Designer is the default user used when previewing reports in PRD.

* Select **Add Style-Rule** and configure another Rule:
## Rule= horizontal-line[style-class="admin"]

## Style.text-color= #f02929

The CSS rule says that it will apply the style (red color) to all the horizontal lines that have the value Admin in their Attributes.style-class.

Note: Remember that Admin is the name of a Pentaho Server user.

* Select **Add Style-Rule** and configure another Rule:
## Rule= report-header label[style-class="Designer"]

## Style.font-size= 18

## Style.bold= true

The CSS Rule says that it will apply the style (large and bold font) to all the labels in the Report Header section that have the value Designer in their Attributes.style-class.

* Select **Add Style-Rule** and configure another Rule:
## Rule= report-header label[style-class="admin"]

## Style.italics= true

The CSS Rule says that it will apply the style (italic) to all the labels in the Report Header section that have the value Admin in their Attributes.style-class.

* Save the file. To do so, select **File > Save As...** and name it `styles.prptstyle`.
## Report

* On our report, open the **Structure** tab and select **Master Report**.

<div align="center">
<figure>
<img src="../_assets/images/refc-05.png" alt="Structure tab tree with Master Report selected at the top, above Page Header, Report Header, a group, Report Footer, Page Footer and Watermark" width="166">
<figcaption>Master Report holds the attributes that apply to the whole report</figcaption>
</figure>
</div>

* Configure the following:
## Attributes.style-sheet-reference

<div align="center">
<figure>
<img src="../_assets/images/refc-06.jpeg" alt="A small button labeled with an ellipsis (...)" width="25">
<figcaption>The ellipsis button that opens the property editor</figcaption>
</figure>
</div>

Select the **...** button in the style-sheet-reference value.

Search for your styles.prptstyle file and embed.

<div align="center">
<figure>
<img src="../_assets/images/refc-07.png" alt="Edit Property dialog: Source set to a styles.prptstyle file, with Embed in Report selected rather than Link To" width="536">
<figcaption>Embed in Report stores the stylesheet inside the report file</figcaption>
</figure>
</div>

To try out the style sheets you created, run them in Report Designer, whose default user is Designer, and on the Pentaho Server, signed in as Admin.

Then, on one hand, preview the report in PRD.

On the other hand, publish the report (PDF) to the Pentaho Server, in the same folder where we published previous reports. When asked if you want to execute the report now, select **Yes**.

<div align="center">
<figure>
<img src="../_assets/images/refc-01.png" alt="Report preview in Report Designer: the heading Welcome Designer above a green horizontal rule, and Again: Hello World! in bold blue" width="534">
<figcaption>Previewed in Report Designer as Designer: green rule, large bold label</figcaption>
</figure>
</div>

<div align="center">
<figure>
<img src="../_assets/images/refc-09.png" alt="The published report run as admin: the heading Welcome admin above a red horizontal rule, and Again: Hello World! in italics" width="482">
<figcaption>Run on the server as admin: red rule, italic label</figcaption>
</figure>
</div>

## Configuration directories

On first launch, Report Designer creates a `.pentaho` directory in the
user's home directory with these subdirectories:

| Directory | Purpose |
| --- | --- |
| `caches` | Cached fonts — speeds up report rendering. |
| `classic-engine` | Low-level options saved by the Pentaho Reporting engine. |
| `report-designer` | Pentaho-supplied samples and content, plus user preferences for the interface. |
| `report-design-wizard` | Default Report Design Wizard templates. |
| `simple-jndi` | A properties file with JNDI connection details — by default, the HSQLDB sample database. |

## Configuration files

Global options live under `/pentaho/design-tools/report-designer/resources/`.
Don't change these without guidance from Pentaho documentation or support:

| File | Purpose |
| --- | --- |
| `report-designer.properties` | Options for the Report Designer client tool (not report options). |
| `classic-engine.properties` | Global report rendering options for reports generated locally; some can be overridden per report. |
