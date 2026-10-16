# Daily Sales Pipeline - step diagrams

One diagram per transformation and job in the reference solution. Every
step is coloured by what it does (see the legend), carries its step type
in bold and, left-aligned under it, the settings that matter. Mermaid
renders in GitHub and VS Code; the course guide shows the source.

Parameters on every file: `WORKSHOP_HOME`, `SALES_DATE`, `OUTPUT_PATH`
(defaults `C:/Workshop-DI-Practitioner/capstone`, `20260101`,
`${WORKSHOP_HOME}/out`). Database connection `capstone`: `127.0.0.1:3306`,
database `sampledata`, user `pentaho_admin`, defined inside each file.

## Legend

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Segoe UI, Helvetica, Arial, sans-serif","fontSize":"13px","lineColor":"#64748b","clusterBkg":"#fafaf9","clusterBorder":"#d6d3d1","edgeLabelBackground":"#ffffff"},"flowchart":{"curve":"basis","nodeSpacing":34,"rankSpacing":44,"padding":10,"htmlLabels":true}}}%%
flowchart LR
  classDef input fill:#dbeafe,stroke:#1d4ed8,color:#1e3a8a,text-align:left,rx:6,ry:6
  classDef check fill:#fef3c7,stroke:#b45309,color:#78350f,text-align:left
  classDef enrich fill:#ede9fe,stroke:#6d28d9,color:#3b0764,text-align:left,rx:6,ry:6
  classDef dim fill:#ccfbf1,stroke:#0f766e,color:#134e4a,text-align:left,rx:6,ry:6
  classDef output fill:#dcfce7,stroke:#15803d,color:#14532d,text-align:left,rx:6,ry:6
  classDef reject fill:#fee2e2,stroke:#b91c1c,color:#7f1d1d,text-align:left,rx:6,ry:6
  classDef log fill:#f3f4f6,stroke:#6b7280,color:#374151,text-align:left,rx:6,ry:6,stroke-dasharray:4 3
  classDef job fill:#e0f2fe,stroke:#0369a1,color:#0c4a6e,text-align:left
  I["<b>Read</b><br/>Text File Input, JSON Input,<br/>Table Input, Get System Info"]:::input
  C{"<b>Validate</b><br/>Filter Rows"}:::check
  E["<b>Enrich / shape</b><br/>Stream Lookup, Merge Join, Formula,<br/>Sort rows, Group by, Select values"]:::enrich
  D["<b>Dimension</b><br/>Dimension Lookup/Update"]:::dim
  O["<b>Write</b><br/>Table Output, Text File Output,<br/>Excel Writer"]:::output
  R["<b>Rejects</b><br/>the rows a check turned away"]:::reject
  L["<b>Log</b><br/>Write to Log, counts only"]:::log
  J(["<b>Job entry</b><br/>START, Success, Transformation, Job"]):::job
  I --> C --> E --> D --> O
  C -.-> R
  O -.-> L
```

Hop labels: **true / false** out of a Filter Rows, **success / failure**
out of a job entry. A dotted hop is a second input to a step (a lookup
or join), not the main flow.

Two PDI habits the diagrams rely on:

- A step with two outgoing hops **distributes** rows between them by
  default (round robin). Where one row must reach two outputs the steps
  are chained, so nothing needs the Copy data movement setting.
- Merge Join needs **both** inputs sorted on the join key; the Table
  Input queries carry the `ORDER BY`, so no Sort rows is needed there.

## stage_orders.ktr

Reads the day's sales, keeps the rows a fact can use, stages them, and
writes the rest to an audit file. 40 in, 37 staged, 3 rejected.

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Segoe UI, Helvetica, Arial, sans-serif","fontSize":"13px","lineColor":"#64748b","clusterBkg":"#fafaf9","clusterBorder":"#d6d3d1","edgeLabelBackground":"#ffffff"},"flowchart":{"curve":"basis","nodeSpacing":34,"rankSpacing":44,"padding":10,"htmlLabels":true}}}%%
flowchart LR
  classDef input fill:#dbeafe,stroke:#1d4ed8,color:#1e3a8a,text-align:left,rx:6,ry:6
  classDef check fill:#fef3c7,stroke:#b45309,color:#78350f,text-align:left
  classDef enrich fill:#ede9fe,stroke:#6d28d9,color:#3b0764,text-align:left,rx:6,ry:6
  classDef output fill:#dcfce7,stroke:#15803d,color:#14532d,text-align:left,rx:6,ry:6
  classDef reject fill:#fee2e2,stroke:#b91c1c,color:#7f1d1d,text-align:left,rx:6,ry:6
  classDef log fill:#f3f4f6,stroke:#6b7280,color:#374151,text-align:left,rx:6,ry:6,stroke-dasharray:4 3
  A["<b>Text File Input</b><br/>file: data/sales_${SALES_DATE}.csv<br/>header row, comma<br/>qty Integer; unit_price 10,2; discount_pct 5,2<br/>order_date Date yyyy-MM-dd"]:::input
  B{"<b>Filter Rows</b><br/>customer_id and product_id present<br/>qty > 0, unit_price > 0<br/>discount_pct 0 to 100"}:::check
  subgraph keep ["Good rows"]
    direction LR
    C["<b>Table Output</b><br/>connection: capstone<br/>table: stg_orders<br/>truncate table: yes"]:::output
    D["<b>Group by</b><br/>no group field<br/>valid_rows = N(order_id)<br/>always give back a result row"]:::enrich
    E["<b>Write to Log</b><br/>Basic logging<br/>Valid rows loaded for ${SALES_DATE}:<br/>field valid_rows"]:::log
    C --> D --> E
  end
  subgraph audit ["Rejected rows"]
    direction LR
    F["<b>Text File Output</b><br/>file: out/rejected_${SALES_DATE}.csv<br/>header row, comma"]:::reject
    G["<b>Group by</b><br/>no group field<br/>rejected_rows = N(order_id)<br/>always give back a result row"]:::enrich
    H["<b>Write to Log</b><br/>Basic logging<br/>Rejected rows for ${SALES_DATE}:<br/>field rejected_rows"]:::log
    F --> G --> H
  end
  A --> B
  B -->|true| C
  B -->|false| F
```

## stage_customers.ktr

20 customers from the JSON feed into a staging table.

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Segoe UI, Helvetica, Arial, sans-serif","fontSize":"13px","lineColor":"#64748b","clusterBkg":"#fafaf9","clusterBorder":"#d6d3d1","edgeLabelBackground":"#ffffff"},"flowchart":{"curve":"basis","nodeSpacing":34,"rankSpacing":44,"padding":10,"htmlLabels":true}}}%%
flowchart LR
  classDef input fill:#dbeafe,stroke:#1d4ed8,color:#1e3a8a,text-align:left,rx:6,ry:6
  classDef enrich fill:#ede9fe,stroke:#6d28d9,color:#3b0764,text-align:left,rx:6,ry:6
  classDef output fill:#dcfce7,stroke:#15803d,color:#14532d,text-align:left,rx:6,ry:6
  classDef log fill:#f3f4f6,stroke:#6b7280,color:#374151,text-align:left,rx:6,ry:6,stroke-dasharray:4 3
  A["<b>JSON Input</b><br/>file: data/customers.json<br/>id $.customers[\*].id<br/>name $.customers[\*].name<br/>email $.customers[\*].email<br/>region_code $.customers[\*].region_code<br/>joined_date $.customers[\*].joined_date, Date yyyy-MM-dd"]:::input
  B["<b>Table Output</b><br/>connection: capstone<br/>table: stg_customers<br/>truncate table: yes"]:::output
  C["<b>Group by</b><br/>no group field<br/>customers_staged = N(id)<br/>always give back a result row"]:::enrich
  D["<b>Write to Log</b><br/>Basic logging<br/>Customers staged:<br/>field customers_staged"]:::log
  A --> B --> C --> D
```

## stage_products.ktr

13 products from the catalogue CSV into a staging table.

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Segoe UI, Helvetica, Arial, sans-serif","fontSize":"13px","lineColor":"#64748b","clusterBkg":"#fafaf9","clusterBorder":"#d6d3d1","edgeLabelBackground":"#ffffff"},"flowchart":{"curve":"basis","nodeSpacing":34,"rankSpacing":44,"padding":10,"htmlLabels":true}}}%%
flowchart LR
  classDef input fill:#dbeafe,stroke:#1d4ed8,color:#1e3a8a,text-align:left,rx:6,ry:6
  classDef enrich fill:#ede9fe,stroke:#6d28d9,color:#3b0764,text-align:left,rx:6,ry:6
  classDef output fill:#dcfce7,stroke:#15803d,color:#14532d,text-align:left,rx:6,ry:6
  classDef log fill:#f3f4f6,stroke:#6b7280,color:#374151,text-align:left,rx:6,ry:6,stroke-dasharray:4 3
  A["<b>Text File Input</b><br/>file: data/products.csv<br/>header row, comma<br/>cost Number 10,2"]:::input
  B["<b>Table Output</b><br/>connection: capstone<br/>table: stg_products<br/>truncate table: yes"]:::output
  C["<b>Group by</b><br/>no group field<br/>products_staged = N(id)<br/>always give back a result row"]:::enrich
  D["<b>Write to Log</b><br/>Basic logging<br/>Products staged:<br/>field products_staged"]:::log
  A --> B --> C --> D
```

## maintain_dim_region.ktr

The Type 2 dimension. 5 regions the first time; change a `manager_email`
in `regions.csv` and run again to see a version 2 row appear with
`valid_from` set to the run date. The main job's Create tables entry
creates `dim_region` when it is missing; in Spoon the step's SQL button
does the same.

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Segoe UI, Helvetica, Arial, sans-serif","fontSize":"13px","lineColor":"#64748b","clusterBkg":"#fafaf9","clusterBorder":"#d6d3d1","edgeLabelBackground":"#ffffff"},"flowchart":{"curve":"basis","nodeSpacing":34,"rankSpacing":44,"padding":10,"htmlLabels":true}}}%%
flowchart LR
  classDef input fill:#dbeafe,stroke:#1d4ed8,color:#1e3a8a,text-align:left,rx:6,ry:6
  classDef enrich fill:#ede9fe,stroke:#6d28d9,color:#3b0764,text-align:left,rx:6,ry:6
  classDef dim fill:#ccfbf1,stroke:#0f766e,color:#134e4a,text-align:left,rx:6,ry:6
  classDef log fill:#f3f4f6,stroke:#6b7280,color:#374151,text-align:left,rx:6,ry:6,stroke-dasharray:4 3
  A["<b>Text File Input</b><br/>file: data/regions.csv<br/>header row, comma<br/>code, name, manager_email"]:::input
  B["<b>Get System Info</b><br/>load_date = system date (start of transformation)"]:::input
  C["<b>Dimension Lookup/Update</b><br/>connection: capstone, table: dim_region<br/>update the dimension: yes<br/>key: code = code<br/>technical key: region_sk, version field: version<br/>stream datefield: load_date<br/>date range: valid_from, valid_to<br/>fields: name, manager_email, type Insert"]:::dim
  D["<b>Group by</b><br/>no group field<br/>regions = N(code)<br/>always give back a result row"]:::enrich
  E["<b>Write to Log</b><br/>Basic logging<br/>dim_region rows processed:<br/>field regions"]:::log
  A --> B --> C --> D --> E
```

## build_fact.ktr

Joins the staged orders to customers and products, calculates the money
fields, picks up the region's dimension key, and writes the fact twice:
the CSV the accreditation checks, then the table. 37 rows, 0 unmatched
with the shipped data.

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Segoe UI, Helvetica, Arial, sans-serif","fontSize":"13px","lineColor":"#64748b","clusterBkg":"#fafaf9","clusterBorder":"#d6d3d1","edgeLabelBackground":"#ffffff"},"flowchart":{"curve":"basis","nodeSpacing":34,"rankSpacing":44,"padding":10,"htmlLabels":true}}}%%
flowchart TB
  classDef input fill:#dbeafe,stroke:#1d4ed8,color:#1e3a8a,text-align:left,rx:6,ry:6
  classDef check fill:#fef3c7,stroke:#b45309,color:#78350f,text-align:left
  classDef enrich fill:#ede9fe,stroke:#6d28d9,color:#3b0764,text-align:left,rx:6,ry:6
  classDef dim fill:#ccfbf1,stroke:#0f766e,color:#134e4a,text-align:left,rx:6,ry:6
  classDef output fill:#dcfce7,stroke:#15803d,color:#14532d,text-align:left,rx:6,ry:6
  classDef reject fill:#fee2e2,stroke:#b91c1c,color:#7f1d1d,text-align:left,rx:6,ry:6
  classDef log fill:#f3f4f6,stroke:#6b7280,color:#374151,text-align:left,rx:6,ry:6,stroke-dasharray:4 3
  subgraph read ["Read the staging tables"]
    direction LR
    A["<b>Table Input</b><br/>connection: capstone<br/>SELECT order_id, order_date, customer_id,<br/>product_id, qty, unit_price, discount_pct<br/>FROM stg_orders ORDER BY product_id"]:::input
    L1["<b>Table Input</b><br/>connection: capstone<br/>SELECT id, name, region_code<br/>FROM stg_customers"]:::input
    L2["<b>Table Input</b><br/>connection: capstone<br/>SELECT id, name AS product_name,<br/>category, cost<br/>FROM stg_products ORDER BY id"]:::input
  end
  subgraph enrich ["Enrich"]
    direction LR
    B["<b>Stream Lookup</b><br/>lookup step: the customers Table Input<br/>key: customer_id = id<br/>returns: name as customer_name, region_code"]:::enrich
    C["<b>Merge Join</b><br/>join type: INNER<br/>first step: orders, key product_id<br/>second step: products, key id<br/>brings: product_name, category, cost"]:::enrich
    D{"<b>Filter Rows</b><br/>customer_name IS NOT NULL<br/>AND product_name IS NOT NULL"}:::check
    B --> C --> D
  end
  subgraph calc ["Calculate"]
    direction LR
    E["<b>Formula</b><br/>revenue = INT([qty]\*[unit_price]\*(1-[discount_pct]/100)\*100+0.5)/100<br/>(exact decimals, rounded half-up to the cent)<br/>gross_margin = [revenue]-[qty]\*[cost]<br/>both BigNumber 12,2"]:::enrich
    F["<b>Dimension Lookup/Update</b><br/>connection: capstone, table: dim_region<br/>update the dimension: no (lookup only)<br/>key: region_code = code<br/>stream datefield: order_date<br/>returns: region_sk, name as region_name"]:::dim
    G["<b>Select values</b><br/>column order for the fact<br/>precision 2 on revenue, gross_margin"]:::enrich
    E --> F --> G
  end
  subgraph write ["Write"]
    direction LR
    H["<b>Text File Output</b><br/>file: out/fact_sales.csv<br/>header row, comma"]:::output
    I["<b>Table Output</b><br/>connection: capstone<br/>table: fact_sales<br/>truncate table: yes"]:::output
    J["<b>Group by</b><br/>no group field<br/>fact_rows = N(order_id)<br/>always give back a result row"]:::enrich
    K["<b>Write to Log</b><br/>Basic logging<br/>fact_sales rows for ${SALES_DATE}:<br/>field fact_rows"]:::log
    H --> I --> J --> K
  end
  R["<b>Text File Output</b><br/>file: out/rejected_unmatched_${SALES_DATE}.csv<br/>header row, comma"]:::reject
  A --> B
  L1 -. lookup .-> B
  L2 -. second input .-> C
  D -->|true| E
  D -->|false| R
  G --> H
```

## write_summary.ktr

One line per region from the fact CSV, into the workbook. 5 rows.

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Segoe UI, Helvetica, Arial, sans-serif","fontSize":"13px","lineColor":"#64748b","clusterBkg":"#fafaf9","clusterBorder":"#d6d3d1","edgeLabelBackground":"#ffffff"},"flowchart":{"curve":"basis","nodeSpacing":34,"rankSpacing":44,"padding":10,"htmlLabels":true}}}%%
flowchart LR
  classDef input fill:#dbeafe,stroke:#1d4ed8,color:#1e3a8a,text-align:left,rx:6,ry:6
  classDef enrich fill:#ede9fe,stroke:#6d28d9,color:#3b0764,text-align:left,rx:6,ry:6
  classDef output fill:#dcfce7,stroke:#15803d,color:#14532d,text-align:left,rx:6,ry:6
  A["<b>Text File Input</b><br/>file: out/fact_sales.csv<br/>header row, comma<br/>revenue, gross_margin BigNumber 12,2"]:::input
  B["<b>Sort rows</b><br/>region_name ascending"]:::enrich
  C["<b>Group by</b><br/>group field: region_name<br/>revenue = SUM(revenue)<br/>gross_margin = SUM(gross_margin)<br/>orders = N(order_id)"]:::enrich
  D["<b>Microsoft Excel Writer</b><br/>file: out/sales_summary_${SALES_DATE}.xlsx<br/>sheet: By region<br/>header row: yes, append: no"]:::output
  A --> B --> C --> D
```

## stage_all.kjb

The three stagings in parallel. The parent job moves on only when all
three have finished; one failure fails the sub-job, which the parent's
failure hop catches. Running them one after another in the main job is
just as valid.

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Segoe UI, Helvetica, Arial, sans-serif","fontSize":"13px","lineColor":"#64748b","clusterBkg":"#fafaf9","clusterBorder":"#d6d3d1","edgeLabelBackground":"#ffffff"},"flowchart":{"curve":"basis","nodeSpacing":34,"rankSpacing":44,"padding":10,"htmlLabels":true}}}%%
flowchart LR
  classDef job fill:#e0f2fe,stroke:#0369a1,color:#0c4a6e,text-align:left
  classDef tr fill:#ede9fe,stroke:#6d28d9,color:#3b0764,text-align:left,rx:6,ry:6
  classDef fail fill:#fee2e2,stroke:#b91c1c,color:#7f1d1d,text-align:left,rx:6,ry:6
  S(["<b>START</b><br/>run next entries in parallel: yes"]):::job
  O["<b>Transformation</b><br/>stage_orders.ktr<br/>pass parameter values: yes"]:::tr
  C["<b>Transformation</b><br/>stage_customers.ktr<br/>pass parameter values: yes"]:::tr
  P["<b>Transformation</b><br/>stage_products.ktr<br/>pass parameter values: yes"]:::tr
  X["<b>Abort job</b><br/>message: a staging step failed"]:::fail
  S --> O
  S --> C
  S --> P
  O -->|failure| X
  C -->|failure| X
  P -->|failure| X
```

## daily_sales_pipeline.kjb

The orchestrator. Every Transformation entry has **Pass parameter values
to sub transformation** ticked, and the job declares the same three
parameters with the same defaults, so
`Kitchen.bat -file=daily_sales_pipeline.kjb "-param:SALES_DATE=20260101"`
reaches every step. The dimension runs before the fact so the fact can
carry `region_sk`.

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Segoe UI, Helvetica, Arial, sans-serif","fontSize":"13px","lineColor":"#64748b","clusterBkg":"#fafaf9","clusterBorder":"#d6d3d1","edgeLabelBackground":"#ffffff"},"flowchart":{"curve":"basis","nodeSpacing":34,"rankSpacing":44,"padding":10,"htmlLabels":true}}}%%
flowchart TB
  classDef job fill:#e0f2fe,stroke:#0369a1,color:#0c4a6e,text-align:left
  classDef tr fill:#ede9fe,stroke:#6d28d9,color:#3b0764,text-align:left,rx:6,ry:6
  classDef check fill:#fef3c7,stroke:#b45309,color:#78350f,text-align:left
  classDef fail fill:#fee2e2,stroke:#b91c1c,color:#7f1d1d,text-align:left,rx:6,ry:6
  classDef opt fill:#f3f4f6,stroke:#6b7280,color:#374151,text-align:left,rx:6,ry:6,stroke-dasharray:4 3
  S(["<b>START</b>"]):::job
  V["<b>Set variables</b> (optional)<br/>values from kettle.properties"]:::opt
  F{"<b>Checks if files exist</b><br/>data/sales_${SALES_DATE}.csv<br/>data/customers.json<br/>data/products.csv<br/>data/regions.csv"}:::check
  DDL["<b>SQL</b> Create tables<br/>connection: capstone<br/>drop and create stg_orders, stg_customers, stg_products<br/>create dim_region, fact_sales if missing"]:::job
  J1["<b>Job</b><br/>stage_all.kjb<br/>pass parameter values: yes"]:::job
  T1["<b>Transformation</b><br/>maintain_dim_region.ktr<br/>pass parameter values: yes"]:::tr
  T2["<b>Transformation</b><br/>build_fact.ktr<br/>pass parameter values: yes"]:::tr
  T3["<b>Transformation</b><br/>write_summary.ktr<br/>pass parameter values: yes"]:::tr
  A["<b>Copy Files</b> (optional)<br/>source: data/sales_${SALES_DATE}.csv<br/>target: pvfs://MinIO/archive/sales/"]:::opt
  OK(["<b>Success</b>"]):::job
  M["<b>Mail</b><br/>to: ops (SMTP a placeholder)<br/>subject: Daily sales pipeline FAILED ${SALES_DATE}"]:::fail
  X["<b>Abort job</b>"]:::fail
  S --> V --> F
  F -->|success| DDL
  DDL -->|success| J1
  J1 -->|success| T1
  T1 -->|success| T2
  T2 -->|success| T3
  T3 -->|success| A --> OK
  F -->|failure| M
  DDL -->|failure| M
  J1 -->|failure| M
  T1 -->|failure| M
  T2 -->|failure| M
  T3 -->|failure| M
  M --> X
```
