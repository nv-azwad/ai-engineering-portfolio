import { OllamaEmbeddings, ChatOllama } from "@langchain/ollama";

console.log("Building full RAG pipeline...\n");

// ============================================
// STEP 1: Set up embedding model
// ============================================
const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434",
});

// ============================================
// STEP 2: Set up LLM
// ============================================
const llm = new ChatOllama({
  model: "llama3.2",
  baseUrl: "http://localhost:11434",
  temperature: 0.1,
});

// ============================================
// STEP 3: Knowledge base
// ============================================
const documents = [
  { text: "Visitors must register at the guardhouse and show a valid ID before entering the property.", page: 1 },
  { text: "Monthly maintenance fees are due on the 1st of every month. Late payments incur a 10% penalty.", page: 2 },
  { text: "The swimming pool is open from 7am to 10pm daily. Children under 12 must be accompanied by an adult.", page: 3 },
  { text: "Residents can pre-register visitors using the CubeXHome mobile app up to 48 hours in advance.", page: 4 },
  { text: "Parking spaces are allocated per unit. Visitor parking is available at Level B2.", page: 5 },
  { text: "Noise must be kept to a minimum between 11pm and 7am. Parties require advance approval from management.", page: 6 },
  { text: "The gym is open 24 hours for residents. Each unit receives 2 access cards. Replacement cards cost RM50.", page: 7 },
  { text: "Pets are allowed but must be registered with management. Dogs must be on leash in common areas.", page: 8 },
];

// ============================================
// STEP 4: Embed all documents
// ============================================
console.log("Loading", documents.length, "documents into knowledge base...");
const docEmbeddings = await Promise.all(
  documents.map(doc => embeddings.embedQuery(doc.text))
);
console.log("Knowledge base ready!\n");

// ============================================
// STEP 5: Similarity search function
// ============================================
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

async function retrieveContext(question, topK = 3) {
  const questionEmbedding = await embeddings.embedQuery(question);
  
  const scores = docEmbeddings.map((docEmb, i) => ({
    text: documents[i].text,
    score: cosineSimilarity(questionEmbedding, docEmb),
  }));

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topK).map(s => s.text).join("\n\n");
}

// ============================================
// STEP 6: RAG answer function
// ============================================
async function askQuestion(question) {
  // Retrieve relevant context
  const context = await retrieveContext(question);
  
  // Build prompt with context
  const prompt = `You are a helpful property management assistant for CubeXHome.
Answer the resident's question based ONLY on the context provided below.
If the answer is not in the context, say "I don't have that information in the property rules."
Keep your answer concise and friendly.

Context from property rules:
${context}

Resident's question: ${question}

Answer:`;

  // Get AI response
  const response = await llm.invoke(prompt);
  return response.content;
}

// ============================================
// STEP 7: Test it!
// ============================================
const questions = [
  "How can my friend visit me?",
  "What time does the pool close?",
  "I want to have a birthday party, is that allowed?",
  "Can I bring my dog to the common area?",
  "What happens if I pay maintenance fees late?",
  "Is there a tennis court?",
];

console.log("=".repeat(50));
console.log("RAG CHATBOT — CubeXHome Property Assistant");
console.log("=".repeat(50));

for (const question of questions) {
  console.log("\n👤 Resident:", question);
  console.log("🤖 Assistant: (thinking...)\n");
  
  const answer = await askQuestion(question);
  console.log("🤖 Assistant:", answer);
  console.log("-".repeat(40));
}