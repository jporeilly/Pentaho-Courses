# Onboarding to a table

> Metadata Injection

> **Warning:**
>
> #### Workshop - Onboarding to a Table
> 
> Onboarding a new file into a table usually means a new transformation: the same CSV input, select and table output, with a different field list. **Metadata injection** builds that transformation once, as a template with no fields, and fills the field list in at run time from data. Here you load `customers.txt` both ways and get the same table.
> 
> **What you'll do**
> 
> * Load `customers.txt` into a table with an ordinary transformation
> * Turn it into a template that knows no fields
> * Describe the fields, renames and removals in Data grids
> * Inject them with **ETL metadata injection** and run the result
> 
> **Prerequisites:** **[Writing to a Database](../14-mod3-writing-to-a-database/guide.md)** (Table output) and the `MySQL:sampledata` connection from **[Database Connections](../12-mod3-connecting-to-database/guide.md)**.
> 
> **Estimated time:** 30 minutes

```text
injector (metadata_inject_step.ktr)              template (metadata_inject_template.ktr)
  dg-metadata _fields  --+                         csvi-mdi       CSV file input, no fields
  dg-rename            --+--> ETL metadata  --->     |
  dg_remove_name       --+    injection             sv-mdi        Select values, empty
  gr-filename -> sfvc  --+    (fills the            |
                              template, runs it)   to-metadata_injection_customers   Table output
```

:::: tabs

### 1. The target table

1. Download `create_metadata_injection_customers.sql` from **Lab Files** (it is also in the lab folder).
2. Run it in DBeaver, connected to `sampledata` as `pentaho_admin`.

It creates `METADATA_INJECTION_CUSTOMERS` with the columns the load produces: `customers.txt`'s fields, with `id` renamed to `key_id` and `stateCode` removed.

### 2. Load it by hand first

Build the ordinary version, so you know what the template has to become.

1. Create a transformation and save it as `tr_onboard_customers_by_hand.ktr` in the lab folder (next to the `data` folder).
2. **CSV file input** (`csvi-customers`): **Filename** `${Internal.Entry.Current.Directory}/data/customers.txt`, **Delimiter** `;`, then **Get Fields**.
3. **Select values** (`sv-customers`): on **Select && Alter**, add `id` with **Rename to** `key_id`, and tick **Include unspecified fields, ordered by name**. On **Remove**, add `stateCode`.
4. **Table output** (`to-customers`): connection `MySQL:sampledata`, target table `METADATA_INJECTION_CUSTOMERS`, tick **Truncate table**.
5. Run it: **Table output** writes 100 rows.

Every one of those settings is metadata: a file name, ten field definitions, one rename, one removal. That list is what injection supplies.

### 3. Make the template

1. Save the transformation as `metadata_inject_template.ktr` and rename the steps `csvi-mdi`, `sv-mdi` and `to-metadata_injection_customers`.
2. In `csvi-mdi`, clear **Filename** and delete every field.
3. In `sv-mdi`, delete the rename and the removal.
4. Leave `to-metadata_injection_customers` as it is.

The template can no longer run on its own: it has no file and no fields. It is a shape waiting for metadata.

### 4. Describe the metadata in Data grids

Create a new transformation, `metadata_inject_step.ktr`, in the same folder, with these steps:

1. **Data grid** `dg-metadata _fields`, fields `name`, `type`, `format`, `length`, `precision`, `currency`, `decimal`, `group`, `trimtype` (all String), one row per column of the file:

| name        | type   | format       | length | trimtype |
| ----------- | ------ | ------------ | ------ | -------- |
| `id`        | String |              | 3      | left     |
| `name`      | String |              | 10     | none     |
| `firstname` | String |              | 13     | none     |
| `zip`       | String |              | 5      | left     |
| `city`      | String |              | 8      | none     |
| `birthdate` | Date   | `yyyy/MM/dd` | 10     | none     |
| `street`    | String |              | 11     | none     |
| `housenr`   | String |              | 3      | left     |
| `stateCode` | String |              | 9      | none     |
| `state`     | String |              | 30     | none     |

2. **Data grid** `dg-rename`, fields `name` and `rename`, one row: `id`, `key_id`.
3. **Data grid** `dg_remove_name`, field `remove_name`, one row: `stateCode`.
4. **Generate rows** `gr-filename` (1 row, one String field `filename`), then **Set field value to a constant** `sfvc-path_filename` setting `filename` to `${Internal.Entry.Current.Directory}/data/customers.txt`.

> **Note:** `trimtype` `left` strips the leading space the file has before numbers (` 13520`). The bundled solution's grid also carries currency, decimal and group symbols for the numeric columns; they make no difference to String fields.

### 5. Inject and run

1. Drag **ETL metadata injection** onto the canvas and hop all four sources into it (the three grids and `sfvc-path_filename`).
2. On the **File** tab, choose **Use a file for the transformation template** and enter `${Internal.Entry.Current.Directory}/metadata_inject_template.ktr`.
3. On the **Inject Metadata** tab, the template's steps are listed with every setting that can be injected. Map each **Target injection step key** to a **Source step** and **Source field**:

| Target step | Target key        | Source step           | Source field  |
| ----------- | ----------------- | --------------------- | ------------- |
| `csvi-mdi`  | `FILENAME`        | `sfvc-path_filename`  | `filename`    |
| `csvi-mdi`  | `FIELD_NAME`      | `dg-metadata _fields` | `name`        |
| `csvi-mdi`  | `FIELD_TYPE`      | `dg-metadata _fields` | `type`        |
| `csvi-mdi`  | `FIELD_FORMAT`    | `dg-metadata _fields` | `format`      |
| `csvi-mdi`  | `FIELD_LENGTH`    | `dg-metadata _fields` | `length`      |
| `csvi-mdi`  | `FIELD_PRECISION` | `dg-metadata _fields` | `precision`   |
| `csvi-mdi`  | `FIELD_CURRENCY`  | `dg-metadata _fields` | `currency`    |
| `csvi-mdi`  | `FIELD_DECIMAL`   | `dg-metadata _fields` | `decimal`     |
| `csvi-mdi`  | `FIELD_GROUP`     | `dg-metadata _fields` | `group`       |
| `csvi-mdi`  | `FIELD_TRIM_TYPE` | `dg-metadata _fields` | `trimtype`    |
| `sv-mdi`    | `META_NAME`       | `dg-rename`           | `name`        |
| `sv-mdi`    | `META_RENAME`     | `dg-rename`           | `rename`      |
| `sv-mdi`    | `REMOVE_NAME`     | `dg_remove_name`      | `remove_name` |

4. On the **Options** tab, leave **Run resulting transformation** ticked.
5. Run `metadata_inject_step.ktr`. The template's Table output writes 100 rows, and the table holds exactly what the hand-built version wrote.

> **Under the hood:**
>
> #### Injection edits the template in memory, then runs the edited copy
>
> ETL metadata injection waits for all its source steps to finish,
> loads the template, and writes the incoming values into the template
> steps' settings: each `dg-metadata _fields` row becomes one field of
> the CSV file input, the single `filename` row becomes its file name,
> and so on. Then it runs that modified copy. The template file on
> disk is never changed.
>
> To see what it built, set **Optional target file (ktr after
> injection)** on the **Options** tab: the filled-in transformation is
> saved there, and opening it shows the same steps as your hand-built
> version.
>
> **Why it matters:** onboarding the next file is now data, not
> development. A new feed means new rows in the grids (or in a table
> or spreadsheet they are read from), and the same template loads it.

::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

[data/customers.txt](./files/data/customers.txt)

[create_metadata_injection_customers.sql](./files/create_metadata_injection_customers.sql)

### Solution <!-- no-step -->

The finished transformations for this lab. Run `metadata_inject_step.ktr` (it loads the template itself) or `tr_onboard_customers_by_hand.ktr`: either writes the same 100 rows to `METADATA_INJECTION_CUSTOMERS`.

Also on disk at `C:\Workshop-DI-Practitioner\05-enterprise-solution\02-metadata-injection\31-mod5-onboarding-to-a-table\solution`.

[metadata_inject_step.ktr](./files/metadata_inject_step.ktr) <button data-launch="spoon" data-path="files/metadata_inject_step.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/metadata_inject_step.ktr">View graph</button>

[metadata_inject_template.ktr](./files/metadata_inject_template.ktr) <button data-launch="spoon" data-path="files/metadata_inject_template.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/metadata_inject_template.ktr">View graph</button>

[tr_onboard_customers_by_hand.ktr](./files/tr_onboard_customers_by_hand.ktr) <button data-launch="spoon" data-path="files/tr_onboard_customers_by_hand.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_onboard_customers_by_hand.ktr">View graph</button>
