# Tray.io Integration with Pentaho Carte

> **Warning:**
>
> #### Workshop - Tray.io Integration with Pentaho Carte
>
> Drive Pentaho Data Integration from Tray.io, a cloud integration platform with no Pentaho connector. A Tray.io workflow calls the Carte REST API with its HTTP Client connector to start a job, polls for the job's status, and sends a notification when it ends (installation guide section 7).
>
> **What you'll do**
>
> * Call the Carte endpoints with `curl` before you build anything in Tray.io
> * Create a Tray.io workflow with a scheduled trigger
> * Start a job from an HTTP Client step, with the Carte credentials in an authentication instead of the step
> * Read the job ID from Carte's answer and poll the job's status until it ends
> * Trigger the same call from a webhook, passing values from its payload as job parameters
>
> **Prerequisites:**
>
> * [Carte Cluster for Pentaho Data Integration Execution HA](../12-carte-cluster/guide.md): the Carte master on `10.0.1.40:9001`
> * A Tray.io account, at `app.tray.io`
> * A way for Tray.io to reach Carte: the Tray.io On-Premises Agent on a host that can reach the master, or an address published through your network edge (guide sections 7.5 and 7.6)
> * A Pentaho Data Integration job for Carte to run. The guide's examples use `/ETL/LoadCustomer.kjb`, with the parameters `CUSTOMER_ID` and `LOAD_DATE`; wherever the steps show that path, name or those parameters, use your own job's.
>
> **Estimated time:** 45 minutes

:::: tabs

### 1. Call Carte from the Command Line

> **Note:**
>
> #### Call Carte from the Command Line
>
> Tray.io makes the same HTTP calls you make here. The endpoints the integration uses (guide section 7.2):
>
> | Endpoint                   | Does                                          |
> | -------------------------- | --------------------------------------------- |
> | `GET /kettle/runJob/`      | Runs a job from the repository, by path and log level |
> | `GET /kettle/runTrans/`    | Runs a transformation from the repository     |
> | `GET /kettle/jobStatus/`   | Returns a job's status, by name and ID        |
> | `GET /kettle/transStatus/` | Returns a transformation's status             |
> | `GET /kettle/stopJob/`     | Stops a running job                           |
> | `GET /kettle/pauseJob/`    | Pauses a running job                          |
> | `GET /kettle/serverStatus/`| Returns the server's status                   |

1. From a host that can reach the master, check that Carte answers:

   ```bash
   curl -s -u cluster:cluster "http://10.0.1.40:9001/kettle/serverStatus/?xml=Y" | grep statusdesc
   ```

> **Success:** Checkpoint: `<statusdesc>Online</statusdesc>`.

2. Start the job, at the log level `Basic`:

   ```bash
   curl -s -u cluster:cluster "http://10.0.1.40:9001/kettle/runJob/?job=/ETL/LoadCustomer.kjb&level=Basic"
   ```

> **Success:** Checkpoint: a `<webresult>` whose `<result>` is `OK`, with the job's `<id>`, as in the guide's example response (section 7.3, step 4).

3. Ask for the job's status. Replace `<id>` with the ID from the previous step; `name` is the job's name, without the path or `.kjb`. `xml=Y` makes Carte answer in XML instead of an HTML page.

   ```bash
   curl -s -u cluster:cluster "http://10.0.1.40:9001/kettle/jobStatus/?name=LoadCustomer&id=<id>&xml=Y" | grep status_desc
   ```

> **Under the hood:**
>
> #### Carte starts the job and answers at once
>
> `runJob` loads the job, starts it on its own thread inside Carte, and returns the job's ID while the job is still running. Carte keeps the job, with its log and result, under its name and that ID, which is what `jobStatus` looks up. Nothing waits on the open HTTP connection.
>
> **Why it matters:** a load that runs for an hour never holds an HTTP call open for an hour, so no timeout in Tray.io, a proxy or the agent can cut it off. The price is that the caller must poll, which is why the workflow in the next part loops on `jobStatus`.

4. Run the status query again until the job ends.

> **Success:** Checkpoint: `<status_desc>` reads `Running` while the job runs, then `Finished`, or `Finished (with errors)` if a job entry failed.

### 2. Build the Scheduled Workflow

> **Note:**
>
> #### Build the Scheduled Workflow
>
> This part follows the guide's section 7.3. The Tray.io labels are the guide's; Tray.io's interface may word them a little differently.

1. Sign in at `https://app.tray.io`, open your project and select **New Workflow**. Name it `Pentaho ETL Trigger — Daily Load`, the guide's example.
2. Select the **Scheduler** trigger and set its schedule, for example daily at 02:00 UTC.
3. Select the **+** button below the trigger, search for **HTTP Client** and select it. Set the operation to **GET** and the URL to:

   ```text
   http://10.0.1.40:9001/kettle/runJob/?job=/ETL/LoadCustomer.kjb&level=Basic
   ```

   Behind the On-Premises Agent, the private address works as it is: the agent resolves it inside your network (guide section 7.5).

4. In the step's **Authentication** section, create a **Generic Service Authentication** with your Carte user and password. Under **Headers**, add `Authorization` and take its value from the authentication with `$.auth`, as the guide's note says, instead of typing `Basic` and the encoded credentials into the step.

> **Under the hood:**
>
> #### Basic authentication only encodes the password
>
> Carte uses HTTP Basic authentication. The `Authorization` header is `Basic` followed by `user:password` in Base64, an encoding anyone can reverse. A value typed into a step's properties is stored with the workflow and can appear in its logs; an authentication keeps it in Tray.io's credential store.
>
> **Why it matters:** over `http://` the header crosses every network between Tray.io and Carte readable. The guide's section 7.6 adds TLS on Carte, or a reverse proxy in front of it, and a firewall rule that admits only the agent's address.

5. Run the workflow once from the builder, and open the HTTP Client step's output.

> **Success:** Checkpoint: the response body is Carte's `<webresult>`, with `<result>OK</result>` and an `<id>`.

6. After the HTTP Client step, add a **Script** step, and enter the guide's JavaScript to read the job ID from the response:

   ```javascript
   const body = $.steps['http-client-1'].body;
   const idMatch = body.match(/<id>(.*?)<\/id>/);
   const jobId = idMatch ? idMatch[1] : null;
   return { jobId };
   ```

7. Add the poll (guide section 7.3, step 5): a second **HTTP Client** step that calls `jobStatus` with the job's name and the `jobId` from the script, with `&xml=Y` at the end; a **Delay** step of 10 seconds; and a **Boolean condition** step on the status. Loop until the status is `Finished` or `Stopped`.
8. After the loop, add a **Slack** connector step, or email or Jira, with a success message such as `Pentaho ETL job completed successfully`, and an error branch for a status that reports errors.
9. Run the workflow again.

> **Success:** Checkpoint: the script step outputs a `jobId`, the loop repeats its status call until Carte reports `Finished`, and the notification arrives. Carte's `jobStatus` for that ID shows the same status.

### 3. Trigger from a Webhook

> **Note:**
>
> #### Trigger from a Webhook
>
> A webhook trigger starts the workflow when another system posts to it, and its payload can feed the job's parameters (guide section 7.4).

1. Create a workflow with the **Webhook** trigger, and copy the **Public URL** from the trigger's settings.
2. Add the HTTP Client step and the authentication as in part 2. In the URL, add the job's parameters, with values taken from the webhook payload:

   ```text
   http://10.0.1.40:9001/kettle/runJob/?job=/ETL/LoadCustomer.kjb&level=Basic&CUSTOMER_ID=<from the payload>&LOAD_DATE=<from the payload>
   ```

   `runJob` sets each URL parameter other than `job` and `level` on the job: as a parameter when the job declares one of that name, otherwise as a variable.

3. In the source system (for example Salesforce, Amazon S3 or your own application), configure an outbound webhook that posts to the Public URL. To test without it, post to the URL yourself with `curl`, with a JSON body that carries the two values under the names your mapping in step 2 reads.

> **Success:** Checkpoint: each post starts one run of the workflow, and its HTTP Client step's response carries a new job `<id>`. `jobStatus` for that ID shows the run.

::::

## Troubleshooting <!-- no-step -->

<details>
<summary>runJob answers with a result other than OK</summary>

Read the `<message>`. `runJob` loads the job from the repository Carte is configured with, so the job's path must exist there, and Carte needs the repository settings of the guide's section 6.6. Test with `curl` until it answers `OK` before you change the workflow.

</details>

<details>
<summary>Tray.io can't reach Carte</summary>

Tray.io runs in the cloud and Carte on a private network. Route the call through the On-Premises Agent (guide section 7.5), and check that the agent's host reaches `10.0.1.40:9001` with the `curl` commands in part 1.

</details>

<details>
<summary>jobStatus says the job doesn't exist</summary>

`name` must be the job's own name, without the path or `.kjb`, and `id` the exact `<id>` that `runJob` returned.

</details>

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches Pentaho Data Integration with the file loaded. If Pentaho Data Integration is already running, the path is copied to your clipboard — switch to Pentaho Data Integration and press `Ctrl+O`, `Ctrl+V`, `Enter`.

_No bundled files for this lab._ It follows section 7 of the installation guide, `Pentaho-HA-Installation-Guide.md`, in the **Lab Files** of [Deploy Pentaho in HA](../11-ha-deploy/guide.md).

### Solution <!-- no-step -->

The workflows in parts 2 and 3 are the finished integration; they run the job you name in them.
