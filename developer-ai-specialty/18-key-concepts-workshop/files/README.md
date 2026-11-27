# Key Concepts scripts

Five Python scripts for the Key Concepts Workshop of the AI Pipelines course. Each one explores an idea behind LLM pipelines (prompts, tokenization, embeddings, search and transformers) against a local Ollama server, prints what it finds and saves its charts to a timestamped folder.

## Requirements

- Windows 11 with Python 3.12 or later
- Ollama running on `http://localhost:11434`, with the embedding model pulled:

  ```powershell
  ollama pull nomic-embed-text
  ```

  A chat model such as `llama3.2:3b` cannot produce embeddings on current Ollama releases, so the scripts call `nomic-embed-text`.
- The libraries in `requirements.txt`: matplotlib, numpy, ollama, pandas, scikit-learn, seaborn and tiktoken.

## Set up

In PowerShell, from the folder that holds these files (on a lab machine, `C:\Workshop-AI-Specialty\02-ai-pipelines\18-key-concepts-workshop`):

```powershell
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
```

## Run

Run each script with the environment's Python, from the same folder:

```powershell
.\.venv\Scripts\python prompt.py
.\.venv\Scripts\python tokenization.py
.\.venv\Scripts\python embedding.py
.\.venv\Scripts\python search.py
.\.venv\Scripts\python transformers.py
```

Every script except `tokenization.py` first asks whether to use a different Ollama server; press `Enter` to keep `http://localhost:11434`. `tokenization.py` uses no Ollama, but `tiktoken` downloads its vocabulary files on the first run, so that run needs an internet connection.

## The scripts

| Script | What it shows | Output folder |
| --- | --- | --- |
| `prompt.py` | One prompt's embedding: its statistics, and the cosine similarity of four related questions | `embedding_visualizations` |
| `tokenization.py` | How `tiktoken` splits text into tokens, and three encodings compared | `tokenization_analysis` |
| `embedding.py` | Topic clustering with t-SNE, similarity heatmaps and a small semantic search | `embedding_analysis` |
| `search.py` | Keyword search and vector search side by side on the same documents | `search_analysis` |
| `transformers.py` | The stages of a transformer, with a token-to-token similarity heatmap | `transformer_analysis` |

The workshop guide walks through each script and what its output means.
