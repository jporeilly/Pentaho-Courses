# Overview of Localization

<div class="pcm-intro">

Global organisations need analytics that speak their users' language — presenting cubes, dimensions, and measures in familiar terms across linguistic and cultural boundaries. Mondrian supports this through **dynamic schema processing**: a single schema definition is **tokenized**, and tokens are replaced at runtime with translated text drawn from Java property files, based on each user's locale.

</div>

> **Note:**
>
> #### One schema, many languages
>
> Rather than maintaining a separate schema per language, you keep **one** schema whose user-facing captions and descriptions are **tokens**. Mondrian's dynamic schema processor substitutes the right translation at connection time. This separates language-specific labels from schema structure — translations can be maintained by non-technical staff in simple property files, and the structure stays in one place.

## How it works

:::: tabs

### 1. Tokenize the schema

> **Note:**
>
> #### Tokenization pattern
>
> Replace user-facing attribute values (captions, descriptions, all-member captions) with tokens of the form:
>
> `%{classicmodels.[component].[element].[property]}`
>
> - **component** — the schema layer: `schema`, `dimension`, `hierarchy`, `measures`
> - **element** — the specific object: `customers`, `products`, `territory`…
> - **property** — the attribute: `caption` or `description`

```xml
<Dimension name="CUSTOMERS" caption="%{dimension.customers.caption}">
  <Hierarchy name="Customers"
             caption="%{hierarchy.customers.caption}"
             allMemberCaption="%{hierarchy.customers.allmember}">
    <Level name="Territory" caption="%{level.territory.caption}" .../>
  </Hierarchy>
</Dimension>
```

### 2. Provide translations

> **Note:**
>
> #### Java property files
>
> Each token maps to translated text in a locale-specific **Java property file** — `MondrianMessages_en.properties`, `MondrianMessages_fr.properties`, and so on. These live on the server under `.../WEB-INF/classes/com/pentaho/messages/`. Java's standard localization framework picks the file matching the user's locale (falling back to the base bundle).

### 3. Configure Mondrian

> **Note:**
>
> #### Dynamic schema processing
>
> Two settings activate runtime substitution:
>
> - **`mondrian.rolap.localePropFile`** in `mondrian.properties` points to the message bundle (`com.pentaho.messages.MondrianMessages`, without the language suffix).
> - The published data source declares a **`DynamicSchemaProcessor`** (Mondrian's token-replacement class) and **`UseContentChecksum`** (so Pentaho Analyzer detects schema changes and refreshes its cache).

::::

> **Note:** Put this into practice in the **FR Localization** workshop, where you tokenize the Classic Models schema, deploy English and French property files, configure `mondrian.properties`, and verify automatic translation in Pentaho Analyzer.
