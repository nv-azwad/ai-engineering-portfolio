import { OllamaEmbeddings, ChatOllama } from "@langchain/ollama";
import fs from "fs";
import path from "path";

console.log("PDF RAG Pipeline\n");

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434",
});

const llm = new ChatOllama({
  model: "llama3.2",
  baseUrl: "http://localhost:11434",
  temperature: 0.1,
});

// ============================================
// STEP 1: Load and chunk PDF
// ============================================
async function loadPDF(filePath) {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  
  const absolutePath = path.resolve(filePath);
  const loadingTask = getDocument(absolutePath);
  const pdfDoc = await loadingTask.promise;
  
  console.log("PDF loaded —", pdfDoc.numPages, "pages found");
  
  let fullText = "";
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(" ");
    fullText += pageText + "\n";
  }
  
  return fullText;
}

function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    const end = start + chunkSize;
    chunks.push({
      text: text.slice(start, end),
      chunkIndex: chunks.length,
    });
    start = end - overlap;
  }
  
  return chunks;
}

// ============================================
// STEP 2: Similarity search
// ============================================
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

// ============================================
// STEP 3: Build knowledge base from PDF
// ============================================
async function buildKnowledgeBase(pdfPath) {
  console.log("Loading PDF:", pdfPath);
  const text = await loadPDF(pdfPath);
  
  console.log("Chunking text...");
  const chunks = chunkText(text, 500, 50);
  console.log("Created", chunks.length, "chunks\n");
  
  console.log("Embedding chunks — this may take a minute...");
  const chunkEmbeddings = await Promise.all(
    chunks.map(chunk => embeddings.embedQuery(chunk.text))
  );
  
  console.log("Knowledge base ready!\n");
  return { chunks, chunkEmbeddings };
}

async function retrieveContext(question, chunks, chunkEmbeddings, topK = 5) {
  const questionEmbedding = await embeddings.embedQuery(question);
  
  const scores = chunkEmbeddings.map((emb, i) => ({
    text: chunks[i].text,
    score: cosineSimilarity(questionEmbedding, emb),
  }));

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topK).map(s => s.text).join("\n\n");
}

async function askQuestion(question, chunks, chunkEmbeddings) {
  const context = await retrieveContext(question, chunks, chunkEmbeddings);
  
  const prompt = `You are a helpful assistant.
Answer the question based ONLY on the context provided below.
If the answer is not in the context, say "I don't have that information."
Be concise and accurate.

Context:
${context}

Question: ${question}

Answer:`;

  const response = await llm.invoke(prompt);
  return response.content;
}

// ============================================
// STEP 4: Run it
// ============================================
const { chunks, chunkEmbeddings } = await buildKnowledgeBase("./my-document.pdf");

const questions = [
  "What is this document about?",
  "What technologies and programming languages were used?",
  "What was the main problem or challenge this project solved?",
  "What did the developer achieve or accomplish?",
  "What is Upcycle 4 Better?",
];

console.log("=".repeat(50));
console.log("PDF Q&A CHATBOT");
console.log("=".repeat(50));

for (const question of questions) {
  console.log("\n👤 Question:", question);
  console.log("🤖 Answer: (thinking...)\n");
  const answer = await askQuestion(question, chunks, chunkEmbeddings);
  console.log("🤖 Answer:", answer);
  console.log("-".repeat(40));
}