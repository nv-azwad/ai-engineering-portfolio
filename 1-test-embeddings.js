import { OllamaEmbeddings } from "@langchain/ollama";

console.log("Testing embeddings...\n");

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434",
});

const text1 = "Visitors must show their QR code at the gate";
const text2 = "Guests need to scan their code to enter";
const text3 = "The stock market crashed today";

const embedding1 = await embeddings.embedQuery(text1);
const embedding2 = await embeddings.embedQuery(text2);
const embedding3 = await embeddings.embedQuery(text3);

console.log("Text 1:", text1);
console.log("Embedding length:", embedding1.length, "numbers");
console.log("First 5 numbers:", embedding1.slice(0, 5));

console.log("\nText 2:", text2);
console.log("First 5 numbers:", embedding2.slice(0, 5));

console.log("\nText 3:", text3);
console.log("First 5 numbers:", embedding3.slice(0, 5));

console.log("\n--- Notice ---");
console.log("Text 1 and Text 2 mean similar things — their numbers should be close");
console.log("Text 3 means something totally different — its numbers will be very different");