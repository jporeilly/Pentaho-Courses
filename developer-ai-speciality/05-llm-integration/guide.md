# LLM Integration

> **Success:**
>
> #### Overview - LLM
> 
> These workshops establish a repeatable architectural pattern: PDI acts as the orchestration layer, while a locally-hosted LLM (served via Ollama) handles the "intelligent" processing that rule-based ETL cannot do well. The six use cases covered - Sentiment Analysis, Data Quality, Data Enrichment, Named Entity Recognition, Text Summarization and Multi-staged - all share the same fundamental skeleton. Once you understand it once, you can adapt it to virtually any AI-enrichment task.

::: tabs

### Request

> **Note:** Everything hinges on making a clean POST request to Ollama's `/api/generate` endpoint at `http://localhost:11434`. This is a local REST API, so there's no external dependency, no API key, and no network latency.

The request payload structure is:

```json
{
  "model": "llama3.2:3b",
  "prompt": "Your instruction here...",
  "stream": false,
  "format": "json",
  "keep_alive": "30m",
  "options": {
    "temperature": 0.1,
    "num_predict": 300,
    "num_ctx": 2048,
    "num_thread": 0
  }
}
```

> **Note:** **Parameters:**
> 
> **`model`** — Which Ollama model to invoke. The workshops use `llama3.2:3b` as the default: compact enough to run on CPU-only hardware but capable enough for structured tasks. You can scale up to `llama3.1:8b` for harder problems at the cost of speed.
> 
> **`stream: false`** — This is critical for PDI. Streaming sends tokens incrementally, which is great for chat UIs but useless in an ETL row-by-row context. Setting this to `false` tells Ollama to generate the entire response, then return it as one complete JSON object — which is what PDI needs to write into a field.
> 
> **`format: "json"`** — Forces the model's output to be valid JSON. Without this, the model might add conversational preamble, markdown fences, or explanations around its JSON answer, all of which break downstream parsing.
> 
> **`keep_alive`** — This is the single biggest performance optimization for batch processing. By default Ollama unloads the model from memory after each request. Reloading takes 10–30 seconds depending on model size and disk speed. Setting `keep_alive: "30m"` keeps the model resident in RAM across all rows in a batch run, turning a multi-hour job into a fraction of that time.
> 
> **`temperature: 0.1`** — Controls randomness. Values near 0 produce near-deterministic output, meaning the same review will produce the same sentiment classification on repeated runs. This is essential for reproducible ETL — you don't want results changing every time the pipeline runs.
> 
> **`num_predict: 300`** — Caps the maximum tokens generated. This prevents runaway generation, protects processing time, and avoids unexpectedly large response payloads overwhelming downstream steps.

### Response

> **Note:** When PDI's REST Client step receives the Ollama response, it comes back as a single JSON object with two categories of fields: the **content fields** that contain the actual result, and the **performance/telemetry fields** that tell you how the inference went.
> 
> The `response` field is a *string containing JSON*, not a nested object - which is why the pipeline requires two separate JSON Input steps: one to extract `$.response` from the Ollama wrapper, and a second to parse the actual model output into structured fields.

The response payload structure is:

```json
{
  "model": "llama3.2:3b",
  "response": "{\"sentiment\":\"positive\",\"score\":0.9}",
  "done": true,
  "done_reason": "stop",
  "total_duration": 3131161470,
  "prompt_eval_count": 64,
  "eval_count": 18
}
```

> **Note:**
>
> #### Content Fields
> 
> **`model`** — Confirms which model actually processed the request. This is useful as a sanity check, especially in pipelines where the model name is injected via a PDI variable. If you're getting unexpected results, checking this field confirms whether the right model was used.
> 
> **`created_at`** — The UTC timestamp of when the response was generated. Useful for logging and auditing, particularly if you're persisting results to a database and need to track when the enrichment was applied.
> 
> **`response`** — This is the only field you actually care about for downstream processing. It contains the LLM's generated output as a string. Importantly, even when you pass `"format": "json"` in the request, Ollama still wraps the model's JSON output inside this string field rather than embedding it as a native JSON object. That's why the pipeline needs a JSON Input step to extract `$.response` first, then a second parsing pass to read the actual model output.
> 
> **`done`** — A boolean that signals whether generation completed. When `true`, the response is complete. When `false`, the model was interrupted or is still streaming (which shouldn't happen in PDI since you set `stream: false`, but worth checking during error handling).
> 
> **`done_reason`** — Explains *why* generation stopped. The value `"stop"` means the model reached a natural conclusion — it finished what it was saying. Other possible values include `"length"` (generation was cut off because it hit the `num_predict` token limit) and `"load"` (model was freshly loaded). If you see `"length"` in production, it means your responses are being truncated and you need to increase `num_predict`.

> **Note:**
>
> #### Performance / Telemetry Fields
> 
> All duration values are expressed in **nanoseconds**, so divide by 1,000,000,000 to get seconds.
> 
> **`total_duration`** — The wall-clock time for the entire request from when Ollama received it to when it returned the response. This is what you'd use to track end-to-end latency per record. In the sentiment analysis example, this was \~3.1 seconds for a short review.
> 
> **`load_duration`** — How long it took to load the model into memory before inference began. When `keep_alive` is working correctly and the model is already resident in RAM, this value drops to near zero for subsequent requests. If you see `load_duration` remaining high across all rows, it means the model is being reloaded on every request, which is a sign your `keep_alive` setting isn't being applied.
> 
> **`prompt_eval_count`** — The number of tokens in your input prompt. This is the tokenized length of everything you sent to the model. Monitoring this field is important for prompt optimization — the workshops show how cutting prompt length by 50% cuts processing time proportionally. If `prompt_eval_count` is unexpectedly high, your prompt likely has verbose instructions that can be trimmed.
> 
> **`prompt_eval_duration`** — How long the model spent processing (encoding) your prompt before it started generating the response. This is the "reading the question" phase. It's typically much shorter than `eval_duration`.
> 
> **`eval_count`** — The number of tokens in the generated response. This is your output token count. If this number is hitting your `num_predict` ceiling (e.g., exactly 300 when you set `num_predict: 300`), that's a strong signal that your responses are being truncated and you need to raise the limit or shorten your expected output schema.
> 
> **`eval_duration`** — How long the model spent actually generating the response tokens. This is almost always the dominant cost in `total_duration`. On CPU-only hardware, token generation speed is the bottleneck — typically the workshops see about 2.1 seconds of generation time for an 18-token response, which gives you a rough tokens-per-second figure for capacity planning.
> 
> **`context`** — An array of integers representing the internal token IDs that make up the conversation state. This is the model's "memory" of the exchange encoded as token references. For single-turn ETL tasks you can completely ignore this field. It only becomes relevant if you're building multi-turn conversation pipelines where you want to pass context back to the model in subsequent requests to maintain continuity.

### Prompt

> **Note:**
>
> #### Anatomy of a Good Prompt
> 
> The prompt is the only interface between your ETL data and the LLM. PDI handles reading, routing, and writing data - but the quality of what the model returns is entirely determined by how well you wrote the prompt. A vague prompt produces unpredictable output that breaks your JSON parser. A well-engineered prompt produces the same structured response every time, making the downstream pipeline reliable.

Using the sentiment analysis workshop as a concrete example, here's the prompt that gets constructed inside the Modified JavaScript Value step for each row:

```json
Analyze sentiment: "This laptop exceeded my expectations! Fast performance, 
great battery life, and the display is stunning. Worth every penny."

JSON format:
{
  "sentiment": "positive/negative/neutral",
  "score": -1.0 to 1.0,
  "confidence": 0-100,
  "key_phrases": ["phrase1", "phrase2"],
  "summary": "one sentence"
}
```

And the PDI JavaScript that builds it:

```javascript
var prompt_text = "Analyze sentiment: \"" + review_text + "\"\n" +
                  "JSON format:\n" +
                  "{\n" +
                  "  \"sentiment\": \"positive/negative/neutral\",\n" +
                  "  \"score\": -1.0 to 1.0,\n" +
                  "  \"confidence\": 0-100,\n" +
                  "  \"key_phrases\": [\"phrase1\", \"phrase2\"],\n" +
                  "  \"summary\": \"one sentence\"\n" +
                  "}";
```

> **Note:** Every element of this prompt is doing specific work.
> 
> The instruction is a verb, not a question.\*\* "Analyze sentiment" is a direct command. Phrasing it as "Can you tell me the sentiment of this review?" wastes tokens and invites a conversational response rather than structured output.
> 
> The data is clearly delimited.\*\* Wrapping the review text in quotes separates it visually and semantically from the instruction. Without this, the model can conflate the instruction with the data, especially for reviews that contain imperative language.
> 
> The schema is shown, not described.\*\* Rather than writing "return a JSON object with a field called sentiment that can be positive, negative, or neutral", the prompt shows the exact JSON structure. The model pattern-matches against the example and fills in the values, which is far more reliable than parsing a verbal description of what you want.
> 
> Value constraints are embedded inline.\*\* Specifying `-1.0 to 1.0` for score and `0-100` for confidence directly in the schema means you don't need a separate instruction section. The model sees the range at the exact point where it needs to apply it.

***

**The Cost of Verbosity**

> **Note:** The Data Quality workshop makes this concrete. Here's the verbose version of a data cleaning prompt:

```
Please clean and standardize the following customer record. 
For the name field, convert to Title Case format (e.g. John Smith).
For the email field, validate the format and mark as INVALID if malformed.
For the phone field, standardize to the format +1-555-123-4567.
For the address field, capitalize properly and use Street, City, State ZIP format.
For the company name, use proper business name formatting.

Customer data:
Name: john smith
Email: john@company
Phone: 555.123.4567
Address: 123 main st apt 5, new york, ny
Company: acme corp

Return your answer as JSON.
```

````xml
And the optimized version that produces identical results:
```
Clean this data. Return JSON: {"name":"Title Case","email":"valid@format",
"phone":"+1-555-123-4567","address":"St,City,ST ZIP","company_name":"Proper Name"}
Name:john smith
Email:john@company
Phone:555.123.4567
Addr:123 main st apt 5, new york, ny
Co:acme corp
````

> **Note:** The verbose version uses roughly 120 tokens. The optimized version uses around 60. On a batch of 1,000 records running on CPU-only hardware at 23 seconds per record, that difference compounds into real time savings. The model doesn't need to be spoken to politely - it needs to be spoken to precisely.

### Gotchas

**Gotcha 1: `${VARIABLE}` syntax doesn't work inside JavaScript strings.**

> **Note:** This is the most common failure mode in the workshops and it produces a completely silent error. When you write:

```javascript
// WRONG
var payload = JSON.stringify({
    "model": "${MODEL_NAME}"
});
```

> **Note:** PDI does not substitute the variable. The string `${MODEL_NAME}` is sent literally to Ollama, which either returns a 400 Bad Request or — worse — tries to find a model named `${MODEL_NAME}` and fails silently. The correct approach is always `getVariable()`:

```javascript
// CORRECT
var model_name = getVariable("MODEL_NAME", "llama3.2:3b");
var payload = JSON.stringify({
    "model": model_name
});
```

The `${PARAM}` syntax only works in XML-based step configuration fields, not in JavaScript code blocks.

***

**Gotcha 2: The model adds text around your JSON even with `format: "json"`.**

> **Note:** Even when you set `"format": "json"` in the Ollama request, some models — particularly on certain prompts — will wrap their JSON in markdown code fences or add a sentence before it:

````
Sure! Here is the sentiment analysis result:
```json
{"sentiment": "positive", "score": 0.9, "confidence": 85}
````

> **Note:** If your JSON Input step tries to parse the full `response` field directly, it will fail because the surrounding text makes it invalid JSON. The defensive fix used in the workshops is to scan for the first `{` and last `}` in the response string and extract only that substring:

```javascript
var jsonStart = fullResponse.indexOf("{");
var jsonEnd   = fullResponse.lastIndexOf("}") + 1;

if (jsonStart >= 0 && jsonEnd > jsonStart) {
    var jsonStr = fullResponse.substring(jsonStart, jsonEnd);
    var data = JSON.parse(jsonStr);
}
```

> **Note:** This makes your parser robust to model verbosity regardless of which model or version you're running.

***

**Gotcha 3: Silent truncation when `num_predict` is too low.**

> **Note:** If the model's response hits the `num_predict` token ceiling mid-generation, Ollama stops and returns whatever was generated so far. The `done_reason` field will say `"length"` instead of `"stop"`, but if you're not logging that field, you'll never know.
> 
> The symptom is malformed JSON arriving at your parser - the object opens but never closes - which your error handler catches and routes to the failure path. The fix is to monitor `eval_count` in your output and raise `num_predict` if it consistently hits the ceiling.

***

**Gotcha 4: Asking for too many fields degrades accuracy.**

> **Note:** It's tempting to extract everything you might ever want in a single prompt. The NER workshop covers 10 entity types (PERSON, ORGANIZATION, LOCATION, DATE, PRODUCT, MONEY, CONTACT, ID, TECHNOLOGY, POSITION) simultaneously.
> 
> This works for NER because entity classification is a well-defined task. But for analytical prompts - asking for sentiment, tone, intent, key phrases, competitive mentions, urgency, and a summary all at once - models tend to fill in fields speculatively rather than accurately. If accuracy matters more than throughput, it's worth splitting complex prompts into focused single-purpose calls, even at the cost of additional API round trips.

***

**Gotcha 5: Not escaping special characters in the source data.**

> **Note:** When review text or customer data contains quotes, backslashes, or newlines, they can break your JavaScript string concatenation and produce a malformed JSON payload before it even reaches Ollama. A review like `"Best product I've ever bought — 5 stars!"` is fine, but one containing `"He said \"amazing\" and I agree"` will break the string if not handled. The fix is to sanitize input text before embedding it in the prompt:

```javascript
var safe_text = review_text.replace(/\\/g, "\\\\")
                            .replace(/"/g, '\\"')
                            .replace(/\n/g, " ")
                            .replace(/\r/g, "");

var prompt_text = "Analyze sentiment: \"" + safe_text + "\"\n" + ...
```

> **Note:** This is especially important for free-text fields pulled from customer-facing systems where you have no control over what users type.

:::

***

## Workshops

This module includes six hands-on use cases, each a self-contained workshop that reuses the same PDI-as-orchestration pattern with a locally-hosted LLM:

* **Sentiment Analysis** — classify customer reviews as positive / negative / neutral with scored JSON output.
* **Data Quality** — clean and standardise messy customer records.
* **Data Enrichment** — augment records with LLM-inferred attributes.
* **Named Entity Recognition** — extract people, organisations, and locations from free text.
* **Text Summarization** — condense long text into one-line summaries.
* **Multi-staged** — chain several LLM calls, each stage building on the last.
