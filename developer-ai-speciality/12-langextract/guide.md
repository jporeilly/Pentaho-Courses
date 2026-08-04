# LangExtract

> **Success:** LangExtract lets PDI turn free-form text into structured rows.
> 
> Use it when regex rules are too brittle and full model training is too heavy.
> 
> Each extraction includes source offsets, so you can trace values back to the original text.

![Pipeline architecture](../_assets/images/langextract-pipeline-architecture.png)

**Before you start**

Complete the **Start the LangExtract service** section further down this page.

This page assumes:

* the LangExtract API is running on `http://localhost:8765`
* Ollama is available locally
* the API endpoint is `POST /extract`

**Choose an integration pattern**

Use one pattern per transformation.

**Recommended: REST service**

Best for reusable and production-ready pipelines.

Flow:

`PDI input → REST Client → JSON Input → transform → output`

**Optional: Shell step**

Best for quick local experiments.

Use it only when you do not need a shared service.

**Local Ollama backend**

Use this when data must stay on-premises.

This is already covered - the bundled service you start below uses your local Ollama.

> **Note:** This page uses the REST service pattern throughout.

**API contract**&#x20;

**Request**

```json
{
  "text": "source text",
  "prompt": "what to extract",
  "examples": [
    {
      "text": "example text",
      "extractions": [
        {
          "extraction_class": "field_name",
          "extraction_text": "example value"
        }
      ]
    }
  ],
  "model_id": "llama3.1:8b",
  "max_char_buffer": 1200,
  "overlap": 100,
  "extraction_passes": 2
}
```

**Response**

```json
{
  "extractions": [
    {
      "class": "field_name",
      "text": "value found",
      "start": 0,
      "end": 10
    }
  ]
}
```

> **Warning:** The endpoint is `POST /extract`.
> 
> Parse response fields as `class`, `text`, `start`, and `end`.

***

## Start the LangExtract service

The service ships with this lab: [app.py](./files/langextract-service/app.py) [requirements.txt](./files/langextract-service/requirements.txt)

It wraps Google's `langextract` library behind the REST contract above, using your **local Ollama** as the backend - lab data never leaves the machine.

**One-time setup** - copy it out of the guide's content folder (course updates re-sync that folder, so run from your own copy):

**Windows (PowerShell)**

```powershell
Copy-Item "$env:APPDATA\com.pentaho.content-manager\content\12-langextract\files\langextract-service" "$env:USERPROFILE\langextract-service" -Recurse
cd $env:USERPROFILE\langextract-service
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
```

**macOS / Linux** (lab VMs have the service pre-installed)

```bash
cp -r ~/.local/share/com.pentaho.content-manager/content/12-langextract/files/langextract-service ~/langextract-service
cd ~/langextract-service
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
```

**Start it** (keep this terminal open while you work through the module):

**Windows (PowerShell)**

```powershell
cd $env:USERPROFILE\langextract-service
.\.venv\Scripts\python -m uvicorn app:app --host 0.0.0.0 --port 8765
```

**macOS / Linux**

```bash
cd ~/langextract-service
.venv/bin/python -m uvicorn app:app --host 0.0.0.0 --port 8765
```

**Verify:**

```bash
curl http://localhost:8765/health
```

> **Note:** Ollama must be running with the course model pulled (the environment panel on the first page checks both). The service reads `LX_MODEL_URL` and `LX_DEFAULT_MODEL` if you need to point it elsewhere.

***

## Workshops

* **Support Tickets** — extract structured fields from free-form support tickets.
* **Clinical Notes** — extract entities from unstructured clinical notes.
* **Contract Documents** — pull key terms from contract text.

***

## Troubleshooting

> **Warning:** Common issues:
>
> * **Connection refused on `8765`**\
>   Start the LangExtract API and verify `curl http://localhost:8765/docs`.
> * **Empty extractions**\
>   Tighten the prompt and improve few-shot examples.
> * **Wrong JSON paths**\
>   Parse `class`, `text`, `start`, and `end`.
> * **Weak long-document recall**\
>   Increase `extraction_passes` or add `overlap`.
> * **Too many duplicates**\
>   Deduplicate before final load.
