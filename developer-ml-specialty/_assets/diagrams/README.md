# Course diagrams

The Developer - ML Specialty course's diagrams are hand-laid
SVG, drawn with the shared kit every course uses,
[`scripts/diagram-kit.mjs`](../../../../scripts/diagram-kit.mjs): panels
with a colored title strip, same-size boxes with a Lucide icon in a white
disc, and arrows with their labels in white pills. Icons come from the
app's own `lucide-react` package, so they match the icons in the guide.
The diagrams name the course's own files, steps, folders, environment
variables and settings, and draw only what the lessons and the lab files
state.

* Each diagram is `<name>.svg.mjs`, ending in `d.write(import.meta.url)`.
  Run it from this folder, and it writes `<name>.svg` and renders
  `../images/<name>.png` at twice its size through headless Chrome or
  Edge:

  ```bash
  # Rebuild one diagram: writes ml-course-path.svg and ../images/ml-course-path.png.
  node ml-course-path.svg.mjs
  ```

* Each script's header comment lists the facts it draws, and the lessons
  (and lab files) they come from. Change a fact in a lesson, and change
  the diagram too.
* Every diagram is 800 wide, so its figure's `width` is `800`. Edit the
  `.svg.mjs`, run it, and commit the script, the `.svg` and the `.png`
  together.
* `train-then-predict` draws the job's hops in Spoon's own colors (grey
  unconditional, green on success, red on failure) with a small helper
  in the script, since the kit's arrows are all slate.

Color by role: blue a tool you use or a source you read (Spoon,
JupyterLab, the CSV inputs, the job's START), violet an engine or a step
that transforms or runs code (the feature steps, the Python Executor
steps, the Python in `h2o-env`, the hosted runtime), teal a join or a
model (Stream lookups, H2O's engine, the leaderboard's GBM, the training
step), green a store or a write (`H2O.csv`, the `gbm_fraud` model,
**Predict Fraud**, the job's Success), amber the browser (Colab), red a
reject or a failure (**Abort job**, the Python setup check), slate a
supporting service or the machine (the job, your machine), stone
something not involved (none yet), and white a result (the scored CSV).
Keep one icon per thing across the diagrams:

| Icon | Stands for |
| --- | --- |
| `files` | the four source files, together |
| `file-input` | a CSV file input step |
| `merge` | Stream lookup |
| `calculator` | Formula and Select values: feature engineering |
| `file-output` | Text file output (`tfo-H2O`, **Predict Fraud**) |
| `code` | a Python Executor step |
| `brain-circuit` | training a model (`py-train_gbm`) |
| `save` | the saved model, `train_model_output/gbm_fraud` |
| `file-text` | the scored CSV, `credit_card_fraud_<HHmmss>.csv` |
| `globe` | the browser |
| `notebook-pen` | the AutoML notebook (JupyterLab or Colab) |
| `cloud` | Colab's hosted runtime, the cloud |
| `list-ordered` | a job (`jb_fraud_main_job.kjb`) |
| `play` | a job's START |
| `shuffle` | a job entry that runs a transformation, a transformation |
| `circle-check` | a job's Success |
| `octagon-x` | Abort job |
| `workflow` | Spoon, Pentaho Data Integration |
| `monitor` | your machine |
| `square-terminal` | the Python in the `h2o-env` virtual environment |
| `cpu` | H2O's engine, a Java process |
| `notebook-pen` | JupyterLab |
| `triangle-alert` | a troubleshooting check |

| Diagram | Page |
| --- | --- |
| `ml-course-path` | Overview: the whole use case, from the four files through `H2O.csv` and H2O AutoML to the GBM trained and run in Python Executor steps |
| `ml-runtimes` | Prerequisite Tasks: where the code runs (Spoon's Java process, the Python in `h2o-env`, H2O's engine, JupyterLab, Colab's hosted runtime) |
| `capstone-nightly-screening` | Capstone: the suggested shape (training with its quality gate, then screening into the review queue, from one nightly job) |
| `train-then-predict` | Credit Card: the job, and its two transformations sharing the saved GBM model |
