# Overview of Localization

<div class="pcm-intro">

Global organizations need analytics that speak their users' language — presenting cubes, dimensions, and measures in familiar terms across linguistic and cultural boundaries. Mondrian supports this through **dynamic schema processing**: a single schema definition is **tokenized**, and tokens are replaced at runtime with translated text drawn from Java property files, based on each user's locale.

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
> - **component** — the schema layer: `schema`, `cube`, `dimension`, `hierarchy`, `measures`
> - **element** — the specific object: `customers`, `products`, `territory`…
> - **property** — the attribute: `caption` or `description`

```xml
<Dimension name="CUSTOMERS" caption="%{classicmodels.dimension.customers.caption}">
  <Hierarchy name="Customers"
             caption="%{classicmodels.hierarchy.customers.caption}"
             allMemberCaption="%{classicmodels.dimension.customers.allmember.caption}">
    <Level name="Territory" caption="%{classicmodels.dimension.customers.territory.caption}" .../>
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
> #### What a dynamic schema processor is
>
> A dynamic schema processor is a Java class that Mondrian runs on a schema's XML **before** it parses it. It receives the schema's text and the connection's properties, and hands back the text Mondrian actually builds the cubes from. The published catalog names the class in its **`DynamicSchemaProcessor`** parameter; any class that implements `mondrian.spi.DynamicSchemaProcessor` will do.
>
> For localization the class is Mondrian's own **`mondrian.i18n.LocalizingDynamicSchemaProcessor`**. It finds every `%{...}` token and writes in its place the text the token's key has in a Java message bundle:
>
> - **Which bundle:** the one `mondrian.rolap.localePropFile` names in `mondrian.properties`, given without its language suffix: `com.pentaho.messages.MondrianMessages`.
> - **Which language:** the connection's `Locale` property. The User Console passes the language of your session; a connection with no `Locale` gets the server's default.
> - **A key with no translation** stays as the token, so a typo shows on screen instead of stopping the cube from loading.

<div align="center">
<figure>
<img src="../_assets/images/schema-processor.png" alt="On each connection request: Analyzer opens a connection whose Locale is the session's, fr; the Classic Models catalog's parameters name the DynamicSchemaProcessor; the schema processor swaps each %{...} token for its text in the fr bundle, read from MondrianMessages_en.properties and MondrianMessages_fr.properties in WEB-INF\classes\com\pentaho\messages, found through mondrian.rolap.localePropFile; Mondrian parses the French text and caches it under that text. One token, caption=&quot;%{classicmodels.dimension.customers.territory.caption}&quot;, becomes caption=&quot;Territoire&quot; in a French session and caption=&quot;Territory&quot; in an English one" width="800">
<figcaption>What the dynamic schema processor does on each connection request</figcaption>
</figure>
</div>

> **Under the hood:**
>
> #### One published file, one cached schema per language
>
> Mondrian runs the processor on every connection request, before it looks in its schema cache. When a processor is named, Mondrian files the schema in its cache under the **processed text**, not the catalog's name, so the French text and the English text become two cached schemas built from the one file you published. **`UseContentChecksum=true`**, the second parameter Pentaho sets for localization, makes Mondrian find a cached schema by an MD5 checksum of that text, so every connection that produces the same text shares one schema.
>
> **Why it matters:** adding a language takes one more properties file, not another schema, and each language is processed and cached on its own.

The four pieces live in different places, and only one of them is lost when you publish again:

| Piece | Where it lives | Survives a publish from Schema Workbench? |
| --- | --- | --- |
| The `%{...}` tokens | The schema XML | Yes: they are in the file you publish |
| `MondrianMessages_*.properties` | `WEB-INF\classes\com\pentaho\messages` on the server | Yes |
| `mondrian.rolap.localePropFile` | `mondrian.properties`, read when the server starts | Yes |
| `DynamicSchemaProcessor` and `UseContentChecksum` | The published catalog's parameters, set in the User Console under **Manage Data Sources** | **No:** publishing stores `Provider`, `DataSource` and `EnableXmla` only, so add both again after every publish |

The processor hook is general: a class of your own can rewrite the schema per connection, for example to give each customer on a shared server its own version of a cube. This course uses only the localizing processor.

::::

> **Note:** Put this into practice in the **FR Localization** workshop, where you tokenize the Classic Models schema, deploy English and French property files, configure `mondrian.properties`, and verify automatic translation in Pentaho Analyzer.
