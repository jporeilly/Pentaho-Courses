# Tray.io Integration with Pentaho Carte

> **Warning:**
>
> #### Workshop - Tray.io -> Carte REST
>
> * Build a Tray.io workflow that triggers a Pentaho job through the Carte REST API
> * Pass webhook payload values into the job as parameters and monitor completion
>
> **Prerequisites:** The Carte cluster lab; a Tray.io account (app.tray.io).
>
> **Estimated time:** 45 minutes

> **Note:** Draft scaffold from the HA installation guide - the full
> guide ships in this lab's files; the step-by-step prose is still
> being authored against it.

Tray.io is a cloud iPaaS with no native Pentaho connector - the
integration uses Tray.io's **HTTP Client** connector against the Carte
REST API (guide section 7):

1. In Tray.io: **New Workflow** (e.g. "Pentaho ETL Trigger - Daily
   Load"), scheduled or webhook-triggered.
2. Add an HTTP Client step calling Carte - triggering a job with
   parameters extracted from the webhook payload:

   ```
   GET http://<carte-host>:9001/kettle/runJob/?job=/ETL/LoadCustomer.kjb&level=Basic
       &CUSTOMER_ID=<from webhook>&LOAD_DATE=<from webhook>
   ```

3. Poll `/kettle/jobStatus/` for completion and branch the workflow
   (the guide's example sends a Slack notification).

> **Note:** Point Tray.io at the Carte endpoint through your edge -
> in the HA topology that is the balancer/VIP path guide section 7
> describes, with Carte credentials kept in Tray.io's authentication
> store, never inline.
