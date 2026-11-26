# Overview

> **Note:**
>
> #### Machine Learning
> 
> The machine learning use case in Pentaho Data Integration addresses credit card fraud detection. Fraud is a costly business problem: organizations lose about 5% of their yearly revenue to fraud of all kinds\*.
> 
> The workshops take two approaches to fraud detection:
> 
> First, H2O AutoML trains and ranks several machine learning models, so you find a well-performing algorithm without extensive manual tuning.
> 
> Second, a supervised learning algorithm, a Gradient Boosting Machine trained with H2O in Python, learns the patterns of historical fraud cases and scores new transactions with a fraud probability.
> 
> A key focus of this use case is handling imbalanced datasets, which is essential since fraudulent transactions are rare compared to legitimate ones. The use case provides practical techniques for properly classifying data when dealing with this common real-world challenge, ensuring that machine learning models can effectively identify fraud without being overwhelmed by the volume of normal transactions. (The course's teaching data is about a quarter fraud, so its models learn quickly; real card data is far more imbalanced.)
> 
> \*Association of Certified Fraud Examiners (ACFE) "Occupational Fraud 2024: A Report to the Nations," published in March 2024

<div align="center">
<figure>
<img src="../_assets/images/ml-course-path.png" alt="The use case end to end. AutoML lab: four source files, three Stream lookups and feature engineering, then a Copy hop to tfo-H2O, which writes data/H2O.csv, and to the Python Executor step, which runs AutoML in h2o-env. H2O.csv goes to the AutoML notebook in JupyterLab, whose leaderboard ranks the models by AUC. GBM chosen leads to the Credit Card lab: train in Python, the gbm_fraud model, predict in Python, and a scored CSV, with the job running training and then prediction." width="800">
<figcaption>From four files to a scored CSV: AutoML picks the algorithm, a Python Executor step trains and runs it</figcaption>
</figure>
</div>

Read the diagram top to bottom. In the [AutoML](../03-automl/guide.md) workshop, Pentaho Data Integration joins the four files into one row per transaction, derives a zip code match flag and turns the flags into numbers, then sends every row both to `H2O.csv` and to a **Python Executor** step that runs H2O AutoML. A notebook in JupyterLab reads `H2O.csv` and runs the same search one cell at a time, ranking the models by AUC. The results point to a Gradient Boosting Machine (GBM), which the [Credit Card](../04-credit-card/guide.md) workshop trains with H2O in a **Python Executor** step and saves as `gbm_fraud`; a second transformation loads that model and writes a fraud probability for every transaction to a CSV file, and a job runs the two in order. The [capstone](../05-capstone-nightly-fraud-screening/guide.md) puts it to work: a nightly job that retrains the model behind a quality gate and queues the night's likely fraud for review.

<figure>

<figcaption class="pcm-video-caption">Walkthrough: coming soon</figcaption>

</figure>
