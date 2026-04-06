# AI Engineering Portfolio — RAG, Agents, Multi-Agent Systems & Function Calling

A progressive AI engineering portfolio built with LangChain and Ollama — from understanding embeddings to RAG pipelines, multi-agent systems, and LLM function calling.

## How It Works

**RAG Pipeline (Steps 1–4):**
1. Documents (or PDF pages) are embedded into vectors using `nomic-embed-text`
2. User question is embedded using the same model
3. Cosine similarity finds the most relevant chunks
4. Top matching chunks are injected into the LLM prompt as context
5. `llama3.2` generates a grounded answer based only on the retrieved context

**Multi-Agent Systems (Steps 5–6):**
1. Multiple specialized agents (researcher, writer, reviewer, etc.) are defined with distinct system prompts
2. Agents are chained in a sequential pipeline, each passing output to the next
3. A manager agent can dynamically decide which agents to use based on the user's request

**Function Calling (Step 7):**
1. Available tools/functions are described in a schema and presented to the LLM
2. The LLM decides which tool to call and what parameters to pass based on the user's request
3. The chosen function is executed and its result is fed back to the LLM
4. The LLM generates a natural, friendly response using the function result

## Project Structure

```
├── 1-test-embeddings.js   # Understand how text becomes vectors
├── 2-test-search.js       # Build semantic search from scratch
├── 3-full-rag.js          # Full RAG pipeline with hardcoded knowledge base
├── 4-pdf-rag.js           # RAG over real PDF documents
├── 5-multi-agent.js       # Sequential multi-agent content pipeline
├── 6-manager-agent.js     # Hierarchical multi-agent system with manager
├── 7-function-calling.js  # LLM function calling with tool selection
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

### Step 5 — Sequential Multi-Agent Pipeline (`5-multi-agent.js`)
Three specialized agents — Researcher, Writer, and Reviewer — chained in a fixed sequential pipeline. Each agent has a focused system prompt and passes its output to the next. The Researcher gathers key facts, the Writer drafts a professional summary from those facts, and the Reviewer polishes the final output.

### Step 6 — Hierarchical Multi-Agent System (`6-manager-agent.js`)
A Manager agent that dynamically decides which worker agents to use and in what order based on the user's request. Five available workers (Researcher, Writer, Reviewer, Translator, Summarizer) can be composed into different pipelines. The Manager parses each request, selects the appropriate agents, and orchestrates execution — different requests produce different agent chains automatically.

### Step 7 — Function Calling (`7-function-calling.js`)
Demonstrates LLM function calling — the AI receives a set of tool definitions (weather lookup, BMI calculator, property search, currency converter, general knowledge) and autonomously decides which tool to invoke based on the user's natural language request. The LLM selects the right function, extracts parameters, the function executes, and the result is fed back to the LLM for a final human-friendly response.

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
- **Sequential agent pipeline** — chains multiple specialized agents for content generation
- **Hierarchical agent orchestration** — manager agent dynamically selects and orders worker agents
- **Function calling** — LLM autonomously selects and invokes the right tool for each request
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

# Run multi-agent systems
node 5-multi-agent.js      # Sequential pipeline
node 6-manager-agent.js    # Hierarchical with manager
node 7-function-calling.js # Function calling demo
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

**Sequential Multi-Agent Pipeline (Step 5):**
```
🔍 Agent 1 (Researcher) working...  ✅ done
✍️  Agent 2 (Writer) working...     ✅ done
🔎 Agent 3 (Reviewer) working...    ✅ done

✨ FINAL OUTPUT:
Developing a robust Node.js REST API requires attention to several key
aspects to ensure scalability, security, and maintainability...
```

**Hierarchical Manager Agent (Step 6):**
```
USER REQUEST: "Research and write about JWT authentication in web applications"
🧠 Manager decision → AGENTS: researcher, writer, reviewer

USER REQUEST: "Give me a quick bullet-point summary of Docker containerization"
🧠 Manager decision → AGENTS: researcher, summarizer, writer
```

**Function Calling (Step 7):**
```
👤 User: What's the weather like in Dhaka right now?
🧠 AI decided to call: getWeather
📥 Parameters: { city: 'Dhaka' }
⚙️  Function result: Weather in Dhaka: 32°C, Humid and partly cloudy, Humidity: 85%
🤖 Final Answer: Warm day in Dhaka! Humidity is 85%, stay hydrated.

👤 User: I weigh 70kg and I'm 175cm tall, what's my BMI?
🧠 AI decided to call: calculateBMI
📥 Parameters: { weight: '70', height: '175' }
⚙️  Function result: BMI: 22.9 — Category: Normal weight
🤖 Final Answer: Your BMI is 22.9, falling in the normal weight category.

👤 User: How much is 500 USD in Bangladeshi Taka?
🧠 AI decided to call: convertCurrency
📥 Parameters: { amount: '500', from: 'USD', to: 'BDT' }
⚙️  Function result: 500 USD = 55000.00 BDT
🤖 Final Answer: 500 USD converts to approximately 55,000 Bangladeshi Taka.
```
