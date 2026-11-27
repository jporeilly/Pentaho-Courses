# Overview

<div class="pcm-intro">

A Large Language Model (LLM) answers from what it learned in training. It has never read your product manuals or your returns policy, and it does not know what changed last week. Retrieval-Augmented Generation (RAG) closes that gap: before the model answers, the pipeline finds the passages of your own documents that match the question and puts them in the prompt. This module builds both halves of a RAG pipeline in Pentaho Data Integration, on a local Ollama and PostgreSQL with pgvector.

</div>

<div align="center">
<figure>
<img src="../_assets/images/19-two-pipelines.png" alt="Two pipelines that meet at the vector store. Ingest, when the documents change: Get File Names, Read Unstructured Document, AI Segmentation (300 tokens, overlap 30), Text to Vector and Vector Writer. Query, for every question: CSV file input, Text to Vector with the same model, Vector Search, Modified JavaScript value for the prompt, and AI Chat answering from the passages only, citing them. Both embed with nomic-embed-text; Vector Writer loads kb_chunks in pgvector and Vector Search reads it" width="800">
<figcaption>Load once, ask many times: the two pipelines of a RAG system</figcaption>
</figure>
</div>

**What You'll Learn**

* What RAG is, and why grounding, freshness and citations make it worth the extra steps
* The two pipelines: the one that loads the knowledge base and the one that answers questions
* How documents are split into chunks, and what chunk size and overlap change
* What an embedding is, how similarity is scored, and why one embedding model serves both pipelines
* What the pgvector lab kit provides, and what the Vector Writer step creates in it

:::: tabs

### 1. What RAG Is

> **Note:**
>
> #### Answer from Your Documents, Not from Memory
>
> RAG is a pattern, not a product: retrieve the relevant text, then generate the answer from it. The model still writes the answer, but it writes it from passages the pipeline chose and handed to it.

Ask a model that has never seen the Larkspur Home Appliances documents "How long is the motor of the FreshSpin washing machine covered?" and it either says it does not know or, worse, writes a plausible warranty term. Give it the warranty policy's passage first, and it answers "10 years, parts only" and can say where that came from.

RAG brings three things a model alone cannot:

| Benefit | What it means | In this module |
| --- | --- | --- |
| **Grounding** | The answer comes from text you control, so the model has less room to invent one | The instruction tells AI Chat to answer only from the passages it is given |
| **Freshness** | Updating the knowledge is a reload of the documents, not a retraining of the model | Re-run the load after a document changes; the same rows are updated in place |
| **Citations** | Each passage carries the name of the document it came from, so every answer can name its sources | Every answer lists the file names it used |

RAG also gives an honest way to say "I don't know". When none of the retrieved passages hold the answer, the instruction tells the model to say so instead of guessing. Answer Questions includes two questions the documents cannot answer, to show it.

### 2. Two Pipelines

> **Note:**
>
> #### Load Once, Ask Many Times
>
> A RAG system is two pipelines that meet at the vector store. The ingest pipeline runs when the documents change; the query pipeline runs for every question.

**Ingest: build the knowledge base** ([Build the Knowledge Base](../20-rag-knowledge-base/guide.md))

| Stage | What happens | Step |
| --- | --- | --- |
| Documents | List the files to load | **Get File Names** |
| Text | Extract the text of each PDF, Word or text file | **Read Unstructured Document** |
| Chunks | Split each text into passages of a few hundred tokens | **AI Segmentation** |
| Embeddings | Turn each chunk into a vector of 768 numbers | **Text to Vector** |
| Vector store | Write the vector, the chunk text and its source to a table | **Vector Writer** |

**Query: answer a question** ([Answer Questions](../21-rag-answer-questions/guide.md))

| Stage | What happens | Step |
| --- | --- | --- |
| Question | One row per question | **CSV file input** |
| Embedding | Turn the question into a vector, with the same model | **Text to Vector** |
| Similarity search | Find the chunks whose vectors are closest to the question's | **Vector Search** |
| Prompt with context | Put the passages and their sources in front of the question | **Modified JavaScript value** |
| Answer | Answer from the passages only, and cite them | **AI Chat** |

> **Under the hood:**
>
> #### The model never searches: the pipeline searches, then the model reads
>
> **Vector Search** returns the chunks and **AI Chat** only sees the text the pipeline puts in its prompt. Retrieval is a database query, so it is fast, repeatable and inspectable: the same question returns the same passages every time, and you can read them before the model does.
>
> **Why it matters:** when an answer is wrong, you can tell which half failed. If the right passage was not retrieved, tune the chunks or the search; if it was retrieved and the answer is still wrong, tune the instruction or the model.

[Evaluate the Answers](../27-rag-evaluation/guide.md) then measures both halves on a fixed set of questions: whether the search found the right document, and whether the answers are correct and stay within the passages. [Catalog Duplicates and Enrichment](../30-catalog-duplicates/guide.md) uses the same embeddings and vector search for another job: finding the products in a catalog that are the same item written differently.

### 3. Chunks

> **Note:**
>
> #### Passages Small Enough to Match, Large Enough to Answer
>
> A whole manual is too long to put in every prompt, and one vector for a whole manual blurs every topic in it into one point. So each document is split into chunks, and each chunk gets its own vector.

**AI Segmentation** splits a text field into one row per chunk and numbers the chunks of each document from `0` in its `index` field. Three settings decide what a chunk is:

| Setting | What it controls | In Build the Knowledge Base |
| --- | --- | --- |
| **Max Segment size** | The largest chunk. With the Ollama provider, the step estimates tokens at about 4 characters each | `300` tokens, about 1,200 characters |
| **Max Overlap size** | How much of the end of one chunk is repeated at the start of the next | `30` tokens, about 10% |
| **Split strategy** | Where the step prefers to cut | `Split by Recursion (Paragraph > Line > Sentence > Word)` |

The recursive strategy cuts at a paragraph break when it can, then at a line break, then between sentences, and only as a last resort between words. A chunk therefore tends to hold whole paragraphs, such as one error code and its fix.

**Size is a trade-off.** Small chunks match a question precisely, but may cut an answer in two. Large chunks keep an answer whole, but a vector that averages several topics matches each of them less well, and every retrieved chunk fills the model's context window. A few hundred tokens with about 10% overlap is a common starting point. The overlap means a sentence that falls on a boundary appears whole in at least one chunk.

### 4. Embeddings and Similarity

> **Note:**
>
> #### Text Becomes a Point in Space
>
> An embedding model turns a piece of text into a vector: a list of numbers in which texts with similar meanings end up close together. `nomic-embed-text`, the model this module uses, returns 768 numbers for any text.

"My dishwasher shows error E2" and "E2 - Water does not drain" share only one word, yet their vectors are close, because the model places text by meaning, not by spelling. That is why vector search finds a passage a keyword search would miss.

**Cosine similarity** measures how closely two vectors point the same way: `1` for the same direction, `0` for unrelated, `-1` for opposite. **Vector Search** turns it into a score from 0 to 1:

```text
score = (1 + cosine similarity) / 2
```

So a score of `0.75` means a cosine similarity of `0.5`, and the **Min score** setting drops every match below it. Scores of related and unrelated passages can be close together with a small model, which is why Answer Questions lets you change **Min score** and the number of results and see what each change does.

> **Warning:**
>
> #### Load and query with the same embedding model
>
> A vector only means something next to vectors from the same model. Vectors from `nomic-embed-text` and from another model are not comparable, even when both have 768 dimensions, and a model with another dimension cannot be searched at all. Build the Knowledge Base and Answer Questions both use **Text to Vector** with `nomic-embed-text` on Ollama. To change the model, reload the whole table with the new one.

### 5. pgvector and the Lab Kit

> **Note:**
>
> #### PostgreSQL That Stores and Searches Vectors
>
> pgvector is a PostgreSQL extension that adds a `vector` column type, distance operators and vector indexes. The course runs it in a Podman container, from the PGVector lab kit.

**Vector Writer** and **Vector Search** support seven vector stores: PGVector, Qdrant, Milvus, Pinecone, Chroma, OpenSearch and AlloyDB. Vector Writer creates the collection on demand and either upserts or inserts. **Text to Vector** embeds with OpenAI, Azure OpenAI, AWS Bedrock, Google Gemini or Ollama. The labs use pgvector and Ollama; another store or provider changes the step's connection settings, not the shape of the pipeline.

| Setting | Value |
| --- | --- |
| Container | `pcm-pgvector` (image `docker.io/pgvector/pgvector:pg17`) |
| Host and port | `localhost:5433` (port 5432 belongs to the Pentaho Server repository's PostgreSQL) |
| Database | `genai` |
| User and password | `genai` / `genai` |
| Start script | `C:\PGVector\run-podman-pgvector.ps1` |

The transformations read these values from the parameters `PG_HOST`, `PG_PORT`, `PG_DATABASE`, `PG_USER` and `PG_PASSWORD`.

**Vector Writer** with the PGVector store creates the `vector` extension and its table on the first run, when the table is missing. For a table named `kb_chunks` with dimension 768 it has four columns:

| Column | Type | Holds |
| --- | --- | --- |
| `embedding_id` | `uuid`, primary key | The record ID. An ID that is not a UUID becomes a name-based UUID, the same one every time |
| `embedding` | `vector(768)` | The chunk's embedding |
| `text` | `text` | The chunk itself, which Vector Search returns and the prompt quotes |
| `metadata` | `json` | The source file name, the chunk number and the other metadata keys |

To look inside it, open `psql` in the container from PowerShell:

```powershell
podman exec -it pcm-pgvector psql -U genai -d genai
```

The step creates no search index. On a few dozen chunks a full scan is instant; on a large table you add a Hierarchical Navigable Small World (HNSW) index yourself, as Build the Knowledge Base shows.

::::
