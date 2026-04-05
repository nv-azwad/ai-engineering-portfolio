# RAG Pipeline — From Embeddings to PDF Q&A

A progressive RAG (Retrieval-Augmented Generation) pipeline built with LangChain and Ollama — from understanding embeddings to querying real PDF documents with AI.

## How It Works

1. Documents (or PDF pages) are embedded into vectors using `nomic-embed-text`
2. User question is embedded using the same model
3. Cosine similarity finds the most relevant chunks
4. Top matching chunks are injected into the LLM prompt as context
5. `llama3.2` generates a grounded answer based only on the retrieved context

## Project Structure

```
├── 1-test-embeddings.js   # Understand how text becomes vectors
├── 2-test-search.js       # Build semantic search from scratch
├── 3-full-rag.js          # Full RAG pipeline with hardcoded knowledge base
├── 4-pdf-rag.js           # RAG over real PDF documents
├── package.json
└── README.md
```

### Step 1 — Embeddings (`1-test-embeddings.js`)
Embeds sentences and compares their vector representations. Shows how semantically similar texts produce similar numbers, while unrelated texts produce different ones.

### Step 2 — Vector Search (`2-test-search.js`)
Implements cosine similarity search over a small knowledge base. Given a question, finds the most relevant document by meaning — not keywords.

### Step 3 — Full RAG (`3-full-rag.js`)
Complete RAG chatbot for a property management knowledge base. Retrieves context via vector search, injects it into a prompt, and generates natural language answers. Includes hallucination prevention — the model only answers from provided context.

### Step 4 — PDF RAG (`4-pdf-rag.js`)
The real deal. Loads any PDF, chunks it into overlapping segments, embeds all chunks, and answers questions about the document. Tested on a 68-page internship report — accurately extracted technologies, accomplishments, and project details.

## Tech Stack

- **LangChain** — AI orchestration framework
- **Ollama** — Local LLM inference (no API keys needed)
- **nomic-embed-text** — Embedding model for converting text to vectors
- **llama3.2** — Language model for generating answers
- **pdfjs-dist** — PDF text extraction
- **Node.js / JavaScript** — Runtime

## Key Features

- **Semantic search** — finds relevant documents by meaning, not keyword matching
- **PDF ingestion** — reads and chunks real PDF documents with overlapping segments
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

# Run each step progressively
node 1-test-embeddings.js   # See how embeddings work
node 2-test-search.js       # See semantic search in action
node 3-full-rag.js          # Run the full RAG chatbot

# Run PDF RAG (place your PDF as my-document.pdf)
node 4-pdf-rag.js
```

## Example Output

**Hardcoded knowledge base (Step 3):**
```
👤 Resident: How can my friend visit me?
🤖 Assistant: Your friend will need to register at the guardhouse and show
   a valid ID. You can also pre-register them using the CubeXHome mobile
   app up to 48 hours in advance.
```

**PDF RAG (Step 4):**
```
👤 Question: What technologies and programming languages were used?
🤖 Answer: Node.js with Express, Next.js with TypeScript, PostgreSQL,
   JWT authentication, Tailwind CSS, Python, OpenCV, and neural networks.

👤 Question: What did the developer achieve or accomplish?
🤖 Answer: Developed a donation tracking system with reward system,
   implemented backend-first methodology, designed database schema,
   API architecture, and component hierarchy ensuring scalability,
   security, and user experience.
```
