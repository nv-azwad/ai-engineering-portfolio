import { OllamaEmbeddings } from "@langchain/ollama";

console.log("Testing vector search...\n");

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434",
});

// Our knowledge base
const documents = [
  { text: "Visitors must register at the guardhouse and show a valid ID before entering the property.", page: 1 },
  { text: "Monthly maintenance fees are due on the 1st of every month. Late payments incur a 10% penalty.", page: 2 },
  { text: "The swimming pool is open from 7am to 10pm daily. Children under 12 must be accompanied by an adult.", page: 3 },
  { text: "Residents can pre-register visitors using the CubeXHome mobile app up to 48 hours in advance.", page: 4 },
  { text: "Parking spaces are allocated per unit. Visitor parking is available at Level B2.", page: 5 },
  { text: "Noise must be kept to a minimum between 11pm and 7am. Parties require advance approval from management.", page: 6 },
];

// Helper function — calculate similarity between two vectors
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

// Step 1: Embed all documents
console.log("Embedding", documents.length, "documents...");
const docEmbeddings = await Promise.all(
  documents.map(doc => embeddings.embedQuery(doc.text))
);
console.log("Done!\n");

// Step 2: Search by meaning
async function search(question, topK = 1) {
  const questionEmbedding = await embeddings.embedQuery(question);
  
  const scores = docEmbeddings.map((docEmb, i) => ({
    document: documents[i],
    score: cosineSimilarity(questionEmbedding, docEmb),
  }));

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topK);
}

// Step 3: Run test queries
const queries = [
  "How do guests get into the building?",
  "When can I use the pool?",
  "Where do visitors park their car?",
  "Can I have a party in my unit?",
];

for (const query of queries) {
  console.log("Question:", query);
  const results = await search(query, 1);
  console.log("Most relevant document found:");
  console.log("→", results[0].document.text);
  console.log("Similarity score:", results[0].score.toFixed(4));
  console.log("Page:", results[0].document.page);
  console.log("---");
}