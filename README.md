# RAG Pipeline — Property Management Q&A

A Retrieval-Augmented Generation (RAG) pipeline built with LangChain and Ollama that answers property management questions based on a knowledge base of property rules.

Built as a learning project to understand how RAG works from the ground up — starting from raw embeddings, to vector search, to a full question-answering pipeline.

## How It Works

![RAG Flow](https://img.shields.io/badge/RAG-Pipeline-blue)

1. Documents are embedded into vectors using the `nomic-embed-text` model
2. User question is embedded using the same model
3. Cosine similarity finds the most relevant documents
4. Top 3 matching chunks are injected into the LLM prompt as context
5. `llama3.2` generates a grounded, accurate answer based only on the provided context

## Project Structure

```
rag-learning/
├── 1-test-embeddings.js   # Step 1: Understand how text becomes vectors
├── 2-test-search.js       # Step 2: Build semantic search from scratch
├── 3-full-rag.js          # Step 3: Complete RAG pipeline with LLM
├── package.json
└── README.md
```

**`1-test-embeddings.js`** — Embeds sentences and compares their vector representations to show how semantically similar texts produce similar numbers.

**`2-test-search.js`** — Implements cosine similarity search over a small knowledge base of property rules. Given a question, finds the most relevant document by meaning (not keywords).

**`3-full-rag.js`** — The full pipeline. Retrieves relevant context via vector search, injects it into a prompt, and uses `llama3.2` to generate a natural language answer. Includes hallucination prevention — the model only answers from the provided context.

## Tech Stack

- **LangChain** — AI orchestration framework
- **Ollama** — Local LLM inference (no API keys needed)
- **nomic-embed-text** — Embedding model for converting text to vectors
- **llama3.2** — Language model for generating answers
- **Node.js / JavaScript** — Runtime

## Key Features

- **Semantic search** — finds relevant documents by meaning, not keyword matching
- **Hallucination prevention** — answers are grounded in retrieved context only
- **Graceful fallback** — handles out-of-context queries ("I don't have that information")
- **Fully local** — runs entirely on your machine, no API keys or cloud services required

## Setup

```bash
# Install dependencies
npm install

# Pull the required Ollama models
ollama pull nomic-embed-text
ollama pull llama3.2

# Run each step
node 1-test-embeddings.js   # See how embeddings work
node 2-test-search.js       # See semantic search in action
node 3-full-rag.js          # Run the full RAG chatbot
```

## Example Output

```
👤 Resident: How can my friend visit me?
🤖 Assistant: Your friend will need to register at the guardhouse and show
   a valid ID. You can also pre-register them using the CubeXHome mobile
   app up to 48 hours in advance.

👤 Resident: Is there a tennis court?
🤖 Assistant: I don't have that information in the property rules.
```
