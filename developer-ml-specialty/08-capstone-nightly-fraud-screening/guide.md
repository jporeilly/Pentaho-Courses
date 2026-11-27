# Capstone: Nightly Fraud Screening

> **Capstone Project — bring it all together.**

You're Juniper & Vale's data engineer, as in the workshops. The fraud
team liked the model, and now they want it every night. Each evening a
file of the day's new orders arrives. Before the orders ship, the team
wants a review queue: the orders the model thinks are most likely
fraud, highest first, so their investigators start at the top. And they
want the model retrained every night on the latest history, with one
safeguard: a model that turns out weaker than they can trust must never
screen a single order.

The history and tonight's orders are in your workshop folder. The
pipelines are yours to build.

> **Objectives:**
>
> - Engineer the features from raw orders once, in a sub-transformation that training and scoring both run through a **Mapping** step, so the model sees the same thing both times.
> - Train an H2O GBM in a **Python Executor** step, measure it on rows it never saw, and save it.
> - Stop the night's run when the model falls below a quality bar.
> - Score every new order and write a review queue at a business threshold, highest first.
> - Run it all from one job that Kitchen can run every night.
> - Produce something portfolio-worthy ("I built this for my Specialty course accreditation").
>
> **Estimated time:** 3 hours for a clean, well-named solution. Re-shape and revisit as you'd like.

---

> **Warning:**
>
> #### Required for your course accreditation: eight checks on your own folders
>
> The course accreditation is issued only when all eight of these checks
> pass. They read your workshop folder, so save (or copy) your work into
> exactly these places **before you take the exam**:
>
> | # | What must be there | Where |
> | --- | --- | --- |
> | 1 | Your job, `jb_nightly_screening.kjb`, running your transformations, `screen_orders.ktr` among them | `C:\Workshop-ML-Specialty\capstone\solution\` |
> | 2 | Your training transformation, `train_fraud_model.ktr`, saving the model with `h2o.save_model` | `C:\Workshop-ML-Specialty\capstone\solution\` |
> | 3 | The same `train_fraud_model.ktr`, with an **Abort** step for the quality gate | `C:\Workshop-ML-Specialty\capstone\solution\` |
> | 4 | The same `train_fraud_model.ktr`, making its features with a **Mapping** step | `C:\Workshop-ML-Specialty\capstone\solution\` |
> | 5 | Your scoring transformation, `screen_orders.ktr`, loading the model with `h2o.load_model` | `C:\Workshop-ML-Specialty\capstone\solution\` |
> | 6 | The same `screen_orders.ktr`, making its features with a **Mapping** step | `C:\Workshop-ML-Specialty\capstone\solution\` |
> | 7 | Your review queue, `fraud_review_queue.csv`, from your last run, with its `fraud_probability` column | `C:\Workshop-ML-Specialty\capstone\out\` |
> | 8 | Your `README.md`: how to run the job, schedule it, and read its results | `C:\Workshop-ML-Specialty\capstone\solution\` |
>
> Your `solution\` folder starts with a **blank** transformation or job
> for each file named below: build each one and save it. A blank file
> passes no check. Select **Run checks** under **Verification checks**
> to see where you stand.

## Inputs

Download the files from **Lab Files** at the bottom of this page, or
use the copies the installer put in `C:\Workshop-ML-Specialty\capstone\data\`.

| File | What it is |
| ---- | ---------- |
| `history.csv` | 50,000 past orders, each with its outcome: `reported_as_fraud_historic` is `Y` or `N`. About one in a hundred is fraud |
| `new_orders.csv` | Tonight's 2,000 orders, the same columns without the outcome. The model has never seen them |

Both files have a header line and these columns, in the raw form the
order system writes them:

| Column | What it holds |
| ------ | ------------- |
| `transaction_id`, `customer_id` | The order and its customer |
| `order_dollar_amount`, `num_items`, `age` | The order's value, its item count, and the customer's age |
| `first_time_customer`, `web_order` | `Y` or `N` |
| `total_transactions_to_date`, `hour_of_day` | The customer's history, and when the order came in |
| `customer_billing_zip`, `ship_to_zip` | The two zip codes |

The model needs the eight features the workshops used, as numbers. One
of them is not a column here yet, and the flags are letters.

---

## Required behavior

Build the screening in four stages. Each maps to a part of the course,
so you can look back at the workshop that taught it.

### 1. Features, made once *(AutoML, Credit Card)*

From the raw columns, make the eight features the workshops used:
`first_time_customer`, `order_dollar_amount`, `num_items`, `age`,
`web_order`, `total_transactions_to_date`, `hour_of_day` and
`billing_shipping_zip_equal` (the two zip codes are the same), with the
flags as `1` and `0`. Make them in one place, `features.ktr`, a
sub-transformation that starts with a **Mapping input specification**
step and ends with a **Mapping output specification** step. Both
transformations run it through a **Mapping** step, so they cannot make
the features differently. The outcome in the history becomes `1` and
`0` in the training transformation itself: scoring has no outcome.

### 2. Train, measure, save, gate *(Credit Card)*

`train_fraud_model.ktr` reads `data\history.csv`, trains an H2O GBM in
a **Python Executor** step on part of the rows, measures its AUC on the
rows it held back, and saves the model in `capstone\out\model\`. When
that validation AUC is below `0.85`, the transformation aborts, with a
message that says why.

### 3. Score and queue *(Credit Card)*

`screen_orders.ktr` reads `data\new_orders.csv`, loads the saved model
in a **Python Executor** step, and gives every order its fraud
probability. It writes two files to `capstone\out\`, each with a header
line:

- `screened_orders.csv`: every order, with at least `transaction_id`,
  `customer_id`, `order_dollar_amount` and `fraud_probability`.
- `fraud_review_queue.csv`: the same columns for the orders whose
  probability is `0.15` or more, highest first. The fraud team chose
  `0.15`, not `0.5`, the cheapest threshold in
  [Monitoring and Tuning](../05-monitoring-and-tuning/guide.md): a missed
  fraud costs them more than a review.

### 4. One job, every night *(Credit Card)*

`jb_nightly_screening.kjb` runs `train_fraud_model.ktr` and then, only
if it succeeded, `screen_orders.ktr`. If either fails, the job ends in
failure. Keep the three files in `capstone\solution\` and write a
`README.md` that says how to run the job with Kitchen, how to schedule
it to run every night, and what to open in the morning.

---

## Suggested shape

<div align="center">
<figure>
<img src="../_assets/images/capstone-nightly-screening.png" alt="Top, train_fraud_model.ktr: history.csv, the features from features.ktr through a Mapping step, an H2O GBM trained in a Python Executor and saved in the out folder, and a quality gate below a validation AUC of 0.85. Bottom, jb_nightly_screening.kjb runs screen_orders.ktr only when training passed: new_orders.csv, the same features.ktr, every order scored, all to screened_orders.csv and those at 0.15 or more to fraud_review_queue.csv, highest first" width="800">
<figcaption>Retrain, gate, then screen: one job, every night</figcaption>
</figure>
</div>

Read the diagram top to bottom. The top panel is training: the raw
history becomes features, H2O learns from most of it and is measured on
the rest, and the model is saved only to be used if it passes the gate.
The bottom panel runs only after that: tonight's orders become the same
features, the saved model scores them, and every order is written, with
the flagged ones queued for review.

```text
C:\Workshop-ML-Specialty\capstone\
├── data\                           history.csv, new_orders.csv
├── solution\
│   ├── jb_nightly_screening.kjb    the job
│   ├── features.ktr                the features, made once
│   ├── train_fraud_model.ktr       features (Mapping), training, the gate
│   ├── screen_orders.ktr           features (Mapping), scoring, the queue
│   └── README.md
└── out\
    ├── model\                      the saved H2O model
    ├── screened_orders.csv
    └── fraud_review_queue.csv
```

Every `.ktr` and the `.kjb` above are waiting for you in `solution\` as
blank files, with no steps or entries: the names are given, what goes in
them is yours. The `README.md` you create. If
`C:\Workshop-ML-Specialty\` has no `capstone` folder, create
`capstone\data\`, `capstone\solution\` and `capstone\out\` yourself.

---

## Hints for the tricky bits

- **Y and N.** Set a flag field's **Type** to **Boolean** in **CSV file input**, and it reads `Y`/`N`; a **Select values** step's **Meta-data** tab then turns the Boolean into a Number, as the AutoML workshop's `sv-change_to_numbers` does.
- **One feature is a comparison.** The AutoML workshop's **Formula** step makes `billing_shipping_zip_equal` from the two zip codes.
- **The same features twice.** The model learns from columns by name. A difference between training and scoring fails silently, with scores that look plausible and are wrong: that is why both run `features.ktr`. The Credit Card workshop's `tr_features.ktr` takes exactly these raw columns, and shows the **Mapping input specification**, **Mapping output specification** and **Mapping** settings.
- **Finding features.ktr.** In the **Mapping** step, name the file with `${Internal.Entry.Current.Directory}/features.ktr`: it is in the same `solution\` folder.
- **The folders beside solution\\.** `${Internal.Transformation.Filename.Directory}` is `solution\`; `data\` and `out\` are its siblings, so a step's file name can start `${Internal.Transformation.Filename.Directory}/../out/`. In a Python script the variable arrives as a `file:///` URL: the Credit Card workshop's `local_path` turns it into a path.
- **Exact file names.** The checks look for `fraud_review_queue.csv` by that name. Clear **Include time in filename?** in **Text file output**: the Credit Card workshop selected it, and it adds the time to the name.
- **The outcome is a class.** H2O trains a classifier only when the target is a factor: `asfactor()`.
- **The gate.** Leave the AUC as a Python `float`, not a formatted string as in the Credit Card workshop, and map it to **BigNumber** in **Variables to fields**. A **Filter rows** step can then compare it with `0.85` and send the rows below it to an **Abort** step. In the **Abort** step, choose **Abort and log as an error**, so the transformation fails and the job takes its red hop.
- **What the gate protects.** The script saves the model before the gate sees its AUC, so a rejected model is still on disk. The job is what keeps it from screening orders: run `screen_orders.ktr` only from the job.
- **Highest first.** **Sort rows** sorts descending when **Ascending** is `N`.
- **Prove the gate.** Raise the bar to `0.999` for one run: the job must end in failure, and `screen_orders.ktr` must not run. Then put it back.
- **Every night.** Kitchen runs a job from the command line; Windows Task Scheduler runs a command on a schedule, as in [Monitoring and Tuning](../05-monitoring-and-tuning/guide.md).

---

## Lab Files

Click a file to download. Put both in `C:\Workshop-ML-Specialty\capstone\data\`
before you start, if the installer has not already. Beyond these and the
blank files in `solution\`, nothing in the capstone is supplied: the
pipelines are yours to build.

[history.csv](./files/history.csv)

[new_orders.csv](./files/new_orders.csv)

---

## Verification checks

> **Warning:** These eight checks decide your course accreditation, and
> they look only in `C:\Workshop-ML-Specialty\capstone\`: in
> `solution\` your `jb_nightly_screening.kjb` running
> `screen_orders.ktr`, your `train_fraud_model.ktr` with
> `h2o.save_model`, an **Abort** step and a **Mapping** step, your
> `screen_orders.ktr` with `h2o.load_model` and a **Mapping** step, and
> your `README.md`; and in `out\` your
> `fraud_review_queue.csv` with its `fraud_probability` column. Save
> your work there before you take the exam.

After a successful run of the job, select **Run checks** below to
confirm each file landed where expected. The checks confirm that the
files exist and hold the parts named above. Check the results yourself:
your model's settings are your own, so the exact figures vary, but a
correct solution always passes these tests.

| Test | How to see it | A correct solution shows |
| ---- | ------------- | ------------------------ |
| The model is good enough | The job's log | A validation AUC of `0.85` or more; the workshops' settings give about `0.90` |
| Every order scored | `screened_orders.csv` | A header line and 2,000 orders |
| The queue is the threshold | `fraud_review_queue.csv` | Only probabilities of `0.15` or more, the highest first: roughly 15 to 40 orders, one or two in a hundred |
| The gate stops the night | A run with the bar at `0.999` | The job ends in failure at the **Abort** step, and the time stamp of `screened_orders.csv` does not change |

One correct solution queued 27 of the 2,000 orders, with `0.9278`
at the top; 9 of the night's 15 frauds were among them.

> **Under the hood:**
>
> #### Why the queue holds false alarms, and still misses fraud
>
> At a threshold of `0.5` the model flags an order only when fraud is
> its better guess, and with fraud this rare that is a handful of
> orders a night. At `0.15` it also flags orders it is unsure about, so
> the analysts review more genuine orders, and catch more of the fraud.
> Even then, some fraud looks like an ordinary order and stays out of
> the queue.
>
> **Why it matters:** the threshold is a business decision, not a
> property of the model. The same model, with the same AUC, gives a
> short queue of near-certain fraud at a high threshold and a longer
> queue that misses less at a low one. `0.15` is where a review at 25
> and a missed fraud at 200 balance; the fraud team chooses the trade,
> and the job carries it out every night.

---

## Deliverables

Your `solution\` folder and your `out\` folder, under
`C:\Workshop-ML-Specialty\capstone\`:

1. `jb_nightly_screening.kjb` — the job: training, then screening only on success
2. `features.ktr` — the eight features from the raw columns, made once
3. `train_fraud_model.ktr` — the features (through `features.ktr`), the model, its validation AUC, and the gate
4. `screen_orders.ktr` — the same features (through the same `features.ktr`), the scores, and the two files
5. `README.md` — how to run the job, schedule it every night, and read its results
6. `out\fraud_review_queue.csv` and `out\screened_orders.csv` — from your last run

> **Warning:** Save into `capstone\solution\`, not into the course
> folder. Course content is refreshed from the repository on every
> launch, so anything you leave there will be overwritten. Reinstalling
> or upgrading the course never touches `capstone\solution\` or
> `capstone\out\`, and only puts back a blank file you have deleted.

This becomes a portfolio piece: name things clearly, keep the folder
tidy, and be ready to explain why the queue uses `0.15` and what the
gate protects.

---

## Build outline and hints <!-- no-step -->

One section per file, in the order you build them. Each says what the
file must do, what it reads and writes, which requirement it meets, and
what a correct run shows. The hints name a step or a technique; the
settings are yours to work out. Each file starts blank in `solution\`:
open it in Spoon (**File > Open**), build it and save it.

:::: tabs

### 1. Prepare

**Must do:** check that `h2o-env` is ready, and that the two data files
are in `capstone\data\`.

**Reads:** nothing yet.
**Meets:** every requirement.

```powershell
powershell -ExecutionPolicy Bypass -File C:\ML\setup-ml.ps1 -Status
Get-ChildItem C:\Workshop-ML-Specialty\capstone\data
```

> **Success:** Checkpoint: the kit ends with `Machine Learning setup is complete.`, and `data\` lists `history.csv` and `new_orders.csv`.

### 2. features.ktr

**Must do:** take a raw order from the calling transformation, add
`billing_shipping_zip_equal`, turn the three flags into `1` and `0`, and
hand every field back.

**Reads:** the rows of the transformation that calls it.
**Meets:** requirement 1.

**Hints:** **Mapping input specification** (with **Include unspecified
fields, ordered by name** selected, so every other field passes through), **Formula**,
**Select values** (**Meta-data** tab), **Mapping output specification**.

> **Success:** Checkpoint: the file opens in Spoon with four steps in a row. It does not run on its own: the next two files call it.

### 3. train_fraud_model.ktr

**Must do:** make the features through `features.ktr`, turn the outcome
into a number, train and measure an H2O GBM, save it in `out\model\`,
and abort below a validation AUC of `0.85`.

**Reads:** `data\history.csv`.
**Writes:** `out\model\`.
**Meets:** requirements 1 and 2.

**Hints:** **CSV file input**, **Mapping**, **Select values**,
**Python Executor** (**All rows**, **Variables to fields**), **Filter
rows**, **Abort**, and a **Write to log** step for the model's figures.

> **Success:** Checkpoint: run it on its own: the log shows a validation AUC of about `0.90`, and `out\model\` holds the model.

### 4. screen_orders.ktr

**Must do:** make the same eight features through `features.ktr`, load the model, score every
order, and write the two files.

**Reads:** `data\new_orders.csv`, `out\model\`.
**Writes:** `out\screened_orders.csv`, `out\fraud_review_queue.csv`.
**Meets:** requirements 1 and 3.

**Hints:** the first steps of `train_fraud_model.ktr`, without the
outcome: the same **Mapping** step, on the same `features.ktr`;
**Python Executor** (**Frame to fields**); **Text file output**;
**Filter rows**; **Sort rows**.

> **Success:** Checkpoint: run it on its own after a training run: `screened_orders.csv` holds 2,000 orders, and the queue starts with a probability of about `0.93`.

### 5. jb_nightly_screening.kjb

**Must do:** run the training transformation, then the scoring one only
on success, and end in failure if either fails.

**Meets:** requirement 4.

**Hints:** two **Transformation** entries, as in the Credit Card
workshop's `jb_fraud_main_job.kjb`; green and red hops.

To look at the results, show the first lines of each file:

```powershell
Get-Content C:\Workshop-ML-Specialty\capstone\out\fraud_review_queue.csv -TotalCount 5
(Get-Content C:\Workshop-ML-Specialty\capstone\out\screened_orders.csv).Count
```

> **Success:** Checkpoint: every test under **Verification checks** passes, including the gate test. The second command prints `2001`: the header line and 2,000 orders.

### 6. README.md

**Must do:** say how to run the job with Kitchen, how to schedule it
every night, and what to open in the morning.

**Meets:** requirement 4.

> **Success:** Checkpoint: all eight checks under **Verification checks** pass.

::::

---

> **Tip:** When every check passes, your screening job is the course's last deliverable. To look back at how any piece works, every workshop is still in the sidebar: [AutoML](../03-automl/guide.md) for the features, [Credit Card](../04-credit-card/guide.md) for training, scoring, the shared features and the job, and [Monitoring and Tuning](../05-monitoring-and-tuning/guide.md) for the threshold and the schedule. Taking it further, the night's queue could come from the [scoring service](../06-scoring-as-a-service/guide.md), or each order could be screened [as it arrives](../07-real-time-scoring/guide.md).
