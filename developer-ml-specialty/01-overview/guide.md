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
> Then the model goes into production: Pentaho Data Integration measures it against the outcomes the fraud team confirms, chooses the threshold that costs least, retrains it only when it drifts, serves it from a long-running H2O scoring service, and scores orders as they arrive from Kafka.
> 
> A key focus of this use case is handling imbalanced datasets, which is essential since fraudulent transactions are rare compared to legitimate ones. The use case provides practical techniques for properly classifying data when dealing with this common real-world challenge, ensuring that machine learning models can effectively identify fraud without being overwhelmed by the volume of normal transactions. (In the course's data, as in real card data, about one order in a hundred is fraud.)
> 
> \*Association of Certified Fraud Examiners (ACFE) "Occupational Fraud 2024: A Report to the Nations," published in March 2024

### The story <!-- no-step -->

Juniper & Vale is a direct retailer of homewares. It takes orders by phone and on its website, and ships them from one warehouse. Every fraudulent order costs it twice: the goods are gone, and weeks later the card's bank takes the money back as a chargeback, with a fee on top. Today a small fraud team checks orders by hand against a few rules, and most fraud is only found when the chargebacks arrive.

You are the data engineer who runs Juniper & Vale's Pentaho Data Integration pipelines, and the fraud team has asked you to bring machine learning into them. Each workshop is the next thing they ask for:

| Workshop | What the fraud team asks | What you build |
| --- | --- | --- |
| [AutoML](../03-automl/guide.md) | Can a model tell fraud from genuine orders in our history, and which kind? | A training set from four files, and H2O AutoML's ranking of models |
| [Credit Card](../04-credit-card/guide.md) | Score this week's orders before they ship, and tell us why | A job that trains a GBM on the history and scores the week into MySQL |
| [Monitoring and Tuning](../05-monitoring-and-tuning/guide.md) | Is the model still good, and is 0.5 the right line? | The confirmed outcomes, the cost of each threshold, and a job that retrains only when needed |
| [Scoring as a Service](../06-scoring-as-a-service/guide.md) | Screen orders twice a day, before they are packed | A long-running H2O scoring service that Pentaho Data Integration calls |
| [Real-time Scoring](../07-real-time-scoring/guide.md) | Screen each order the moment it is placed | A Kafka consumer that scores every batch of orders as it arrives |
| [Capstone](../08-capstone-nightly-fraud-screening/guide.md) | Every night: retrain safely, and queue the likely fraud | The nightly job, built by you from an outline |

### The data <!-- no-step -->

Juniper & Vale's order system numbers its transactions in the order they happen. The history the models learn from holds 200,000 of them, each with the customer's details, the order's details and the fraud team's verdict; the AutoML workshop samples its first 50,000 customers. Every later set is new data, in files of its own: Credit Card scores this week's 10,000 orders (200,001 to 210,000), and Monitoring and Tuning receives their outcomes a month later; Scoring as a Service screens tonight's 2,000 (210,001 to 212,000); Real-time Scoring receives 500 more live; the capstone has a history and new orders of its own. No order is ever scored by a model that learned from it, as in production.

The data is synthetic, made to behave like a real retailer's. About one order in a hundred is fraud. Ages, order values and order times follow realistic spreads: most customers are between 25 and 60, most baskets are under 100 dollars, and few orders come in at night. And fraud shows in combinations of signals rather than any one of them: a first order shipped to another address, a late-night web order, a large basket from a new customer. So the models score like real fraud models: they rank orders well, with an AUC around 0.9, but at any threshold they flag several genuine orders for every fraud they catch, and they miss many. Choosing that threshold is a business decision, and [Monitoring and Tuning](../05-monitoring-and-tuning/guide.md) makes it.

<div align="center">
<figure>
<img src="../_assets/images/ml-course-path.png" alt="The use case end to end. AutoML lab: four files, three Stream lookups and feature engineering; tfo-H2O writes H2O.csv for the AutoML notebook, whose leaderboard ranks the models by AUCPR, and a Python Executor step runs AutoML. GBM chosen leads to the Credit Card lab: train, the gbm_fraud model, predict, and the scores with a reason in a CSV file and MySQL. The scores feed ML in Production: Monitoring and Tuning, Scoring as a Service and Real-time Scoring." width="800">
<figcaption>From four files to production: AutoML picks the algorithm, Python Executor steps train and run it, PDI keeps it working</figcaption>
</figure>
</div>

Read the diagram top to bottom. In the [AutoML](../03-automl/guide.md) workshop, Pentaho Data Integration joins the four files into one row per transaction, derives a zip code match flag and turns the flags into numbers, then sends every row both to `H2O.csv` and to a **Python Executor** step that runs H2O AutoML. A notebook in JupyterLab reads `H2O.csv` and runs the same search one cell at a time, ranking the models by AUCPR. The results point to a Gradient Boosting Machine (GBM), which the [Credit Card](../04-credit-card/guide.md) workshop trains with H2O in a **Python Executor** step and saves as `gbm_fraud`; a second transformation loads that model and writes a fraud probability, and the reason for it, for every transaction to a CSV file and to MySQL; a job runs the two in order, and both make their features with one shared sub-transformation. The ML in Production workshops take it from there: [Monitoring and Tuning](../05-monitoring-and-tuning/guide.md) measures the model against confirmed outcomes, prices each threshold and retrains only when recall falls; [Scoring as a Service](../06-scoring-as-a-service/guide.md) keeps the model in a running H2O server that Pentaho Data Integration calls; and [Real-time Scoring](../07-real-time-scoring/guide.md) scores orders from Kafka as they arrive. The [capstone](../08-capstone-nightly-fraud-screening/guide.md) puts it to work: a nightly job that retrains the model behind a quality gate and queues the night's likely fraud for review.

<figure>

<figcaption class="pcm-video-caption">Walkthrough: coming soon</figcaption>

</figure>
