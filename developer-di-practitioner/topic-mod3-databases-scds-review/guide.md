# Review SCDs

> **Note:**
>
> #### **Overview**
> 
> A **slowly changing dimension** (SCD) is a dimension whose attributes change now and then, not on a schedule: a customer moves, an employee changes job, a product moves to another product line. A data warehouse has to decide what to do with the old value, because reports about the past may need it. Customers, geography and employees are typical examples.
> 
> The common approaches are numbered by type:
> 
> * **Type 0** - keep the original value
> * **Type 1** - overwrite the old value
> * **Type 2** - add a new row for each version
> * **Type 3** - add a column for the previous value
> * **Type 4** - keep history in a separate table
> * **Type 6** - combine types 1, 2 and 3 (1 + 2 + 3 = 6)
> 
> PDI's **Dimension lookup/update** step, in the next workshop, handles types 1 and 2, chosen field by field: **Update** and **Punch through** overwrite (type 1), and **Insert** adds a version (type 2).

Every tab uses the same example. Customer `1`, `Cust_1`, has been a `Corporate` customer since 2010-07-22. On 2012-05-17 they become a `Retail` customer. Each type records that change differently; values that change are in **bold**.

::: tabs

### Type 0

> **Note:** **Type 0 - the value never changes**
> 
> A type 0 attribute keeps the value it was first loaded with, and the change is ignored. A person's date of birth is one: once recorded, it doesn't change. Type 0 also suits attributes whose original value matters and whose later values don't, such as the date a customer first signed up.

**Before and after the change**

| CUSTOMER_ID | CUSTOMER_NAME | CUSTOMER_TYPE |
| ----------- | ------------- | ------------- |
| 1           | Cust_1        | Corporate     |

### Type 1

> **Note:** **Type 1 - overwrite with the new value**
> 
> The new value replaces the old one, and no history is kept. Type 1 is the easiest to maintain, and it suits corrections, such as a fixed spelling mistake or removed special characters, where the old value was never right.

**Before the change**

| CUSTOMER_ID | CUSTOMER_NAME | CUSTOMER_TYPE |
| ----------- | ------------- | ------------- |
| 1           | Cust_1        | Corporate     |

**After the change**

| CUSTOMER_ID | CUSTOMER_NAME | CUSTOMER_TYPE |
| ----------- | ------------- | ------------- |
| 1           | Cust_1        | **Retail**    |

### Type 2

> **Note:** **Type 2 - add a row for each version**
> 
> Every change adds a new row with a new surrogate key (here `TK`, the technical key), so the full history is kept. Each version carries the same natural key, `CUSTOMER_ID`, which ties them together.
> 
> Effective-date columns, here `START_DATE` and `END_DATE`, say when each version applied; the current version ends on a far-future date such as `9999-12-31`. Some designs add a current-row flag (`Y` on exactly one version) or, as here, a version number.
> 
> Type 2 makes the dimension grow with every change, and adding a new tracked attribute later is expensive, so choose its attributes carefully.

**Before the change**

| TK | CUSTOMER_ID | CUSTOMER_NAME | CUSTOMER_TYPE | START_DATE | END_DATE   | VERSION |
| -- | ----------- | ------------- | ------------- | ---------- | ---------- | ------- |
| 1  | 1           | Cust_1        | Corporate     | 2010-07-22 | 9999-12-31 | 1       |

**After the change**

| TK    | CUSTOMER_ID | CUSTOMER_NAME | CUSTOMER_TYPE | START_DATE     | END_DATE       | VERSION |
| ----- | ----------- | ------------- | ------------- | -------------- | -------------- | ------- |
| 1     | 1           | Cust_1        | Corporate     | 2010-07-22     | **2012-05-17** | 1       |
| **2** | 1           | Cust_1        | **Retail**    | **2012-05-17** | 9999-12-31     | **2**   |

The old version is closed on the day of the change, and the new one starts that day.

### Type 3

> **Note:** **Type 3 - add a column for the previous value**
> 
> The table holds the current value and the previous one in two columns. When the value changes, the current value moves to the "previous" column and the new value takes its place.
> 
> History is limited to the columns you create for it, usually one change back. It is the least often needed type.

**Before the change**

| CUSTOMER_ID | CUSTOMER_NAME | CUSTOMER_TYPE | PREVIOUS_TYPE |
| ----------- | ------------- | ------------- | ------------- |
| 1           | Cust_1        | Corporate     | Corporate     |

**After the change**

| CUSTOMER_ID | CUSTOMER_NAME | CUSTOMER_TYPE | PREVIOUS_TYPE |
| ----------- | ------------- | ------------- | ------------- |
| 1           | Cust_1        | **Retail**    | Corporate     |

### Type 4

> **Note:** **Type 4 - keep history in a separate table**
> 
> The dimension table holds only the current values, and a second table, such as `CUSTOMER_HISTORY`, holds every version with its effective dates. Queries about today read the small current table; queries about the past read the history.

**After the change: the current table**

| CUSTOMER_ID | CUSTOMER_NAME | CUSTOMER_TYPE |
| ----------- | ------------- | ------------- |
| 1           | Cust_1        | **Retail**    |

**After the change: the history table**

| CUSTOMER_ID | CUSTOMER_NAME | CUSTOMER_TYPE | START_DATE     | END_DATE       |
| ----------- | ------------- | ------------- | -------------- | -------------- |
| 1           | Cust_1        | Corporate     | 2010-07-22     | **2012-05-17** |
| 1           | Cust_1        | **Retail**    | **2012-05-17** | 9999-12-31     |

### Type 6

> **Note:** **Type 6 - combine types 1, 2 and 3**
> 
> Type 6 adds a row for each change, as type 2 does, and keeps two columns for the attribute:
> 
> * `CURRENT_TYPE`, today's value, overwritten on every version when it changes, as in type 1
> * `HISTORICAL_TYPE`, the value that applied during that version, as in type 3
> 
> plus `START_DATE` and `END_DATE` for each version's effective dates, and a current-row flag. Every version can then be reported both as it was and as it is now.

**Before the change**

| TK | CUSTOMER_ID | CURRENT_TYPE | HISTORICAL_TYPE | START_DATE | END_DATE   | CURRENT_FLAG |
| -- | ----------- | ------------ | --------------- | ---------- | ---------- | ------------ |
| 1  | 1           | Corporate    | Corporate       | 2010-07-22 | 9999-12-31 | Y            |

**After the change**

| TK    | CUSTOMER_ID | CURRENT_TYPE | HISTORICAL_TYPE | START_DATE     | END_DATE       | CURRENT_FLAG |
| ----- | ----------- | ------------ | --------------- | -------------- | -------------- | ------------ |
| 1     | 1           | **Retail**   | Corporate       | 2010-07-22     | **2012-05-17** | **N**        |
| **2** | 1           | **Retail**   | **Retail**      | **2012-05-17** | 9999-12-31     | **Y**        |

Version 1 still says what the customer *was* (`HISTORICAL_TYPE`), and now also what they *are* (`CURRENT_TYPE`).

:::
