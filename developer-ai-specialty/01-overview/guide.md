# Overview of a Prompt

> **Note:**
>
> #### Overview of typical LLM Use case - Chatbot
>
> Ever wondered whats happening under the hood when you chat with an LLM ..
>
> Here's the big picture - four stages every time you hit send:

<figure><img src="../_assets/images/chatbot_diagram.png" alt=""><figcaption><p>Under the hood with a Chatbot</p></figcaption></figure>

> **Note:** 
>
> **Tokenisation** is just the model chopping your message up into manageable pieces. Not always whole words — sometimes syllables or punctuation get their own token. It's a standardisation step before any real processing happens.
>
> **Embedding** is where it gets interesting. Each token gets mapped to a point in a vast mathematical space, where meaning is encoded as position. Words with similar meanings literally end up close together — that's how the model "knows" that *dog* and *cat* are more related than *dog* and *bicycle*.
>
> **Neural network processing** is the heavy lifting. Your tokens flow through layer after layer of the transformer, with each layer building a richer understanding. Early layers catch basic patterns; deeper layers grasp context, nuance, and intent. The attention mechanism is what lets the model link words that are far apart in a sentence — deciding which parts of your prompt are most relevant to each other.
>
> **Generation** is where the output is built up one token at a time. The model doesn't write the whole sentence in one go — it predicts the single most probable next token, appends it, then repeats. That's why LLMs can feel like they're "thinking out loud."

---

> **Note:** Ready to try these ideas in code? The **Key Concepts
> Workshop** is next - it runs a small script for each concept
> against your local Ollama.
