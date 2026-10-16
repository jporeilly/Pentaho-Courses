# Overview

<div class="pcm-intro">

Reading and writing is rarely enough. Most pipelines need to transform data in flight: combining streams (joins, merges), looking up values, or reaching for scripting (Formula, Modified JavaScript Value) when SQL alone can't do the job.

</div>

**What You'll Learn**

* How to stack streams, and how to find what changed between two versions of the same data
* Four ways to join streams, and when each fits
* How to add values from a database table to each row
* When to calculate with **Formula** and when to write a script

> **Note:**
>
> #### **Overview**
>
> *Enrichment* adds to each row what it doesn't carry itself: a product's name next to its code, a customer's region next to an order, a flag that says whether a value changed since yesterday. The data comes from another stream, a database table or a calculation.
>
> This module covers the four ways PDI does it:
>
> | Topic | Steps | What they do |
> | --- | --- | --- |
> | [Merge](../topic-mod4-merge-review/guide.md) | Append streams, Merge rows (diff), Synchronize after merge | Stack streams with the same layout; compare two versions and apply the differences |
> | [Joins](../topic-mod4-joins-review/guide.md) | Database join, Join rows, Merge join, XML join | Combine rows from two sources on a key or a condition |
> | [Lookups](../topic-mod4-lookups-review/guide.md) | Database lookup, Stream lookup | Add fields from a reference set to each row |
> | [Scripting](../topic-mod4-scripting-review/guide.md) | Formula, Modified JavaScript value | Calculate what the other steps can't |
