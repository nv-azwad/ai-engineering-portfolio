import { ChatOllama } from "@langchain/ollama";

console.log("Hierarchical Multi-Agent System\n");

const llm = new ChatOllama({
  model: "llama3.2",
  baseUrl: "http://localhost:11434",
  temperature: 0.7,
});

// ============================================
// WORKER AGENTS
// ============================================
async function researcherAgent(topic) {
  console.log("🔍 Researcher Agent activated...");
  const response = await llm.invoke(`You are a research specialist.
List exactly 5 key facts about: ${topic}
Format as numbered list. Facts only, no opinions.`);
  return response.content;
}

async function writerAgent(topic, research) {
  console.log("✍️  Writer Agent activated...");
  const response = await llm.invoke(`You are a professional writer.
Write a 2-paragraph summary about "${topic}" using ONLY these facts:
${research}
No new information. Professional tone.`);
  return response.content;
}

async function reviewerAgent(summary) {
  console.log("🔎 Reviewer Agent activated...");
  const response = await llm.invoke(`You are a senior editor.
Improve this summary — fix grammar, improve flow, make opening engaging.
Return ONLY the improved version, no commentary.
Summary: ${summary}`);
  return response.content;
}

async function translatorAgent(content, language) {
  console.log(`🌐 Translator Agent activated — translating to ${language}...`);
  const response = await llm.invoke(`You are a professional translator.
Translate this content to ${language}.
Preserve the professional tone.
Return ONLY the translation, no commentary.
Content: ${content}`);
  return response.content;
}

async function summarizerAgent(content) {
  console.log("📊 Summarizer Agent activated...");
  const response = await llm.invoke(`You are a summarization specialist.
Create a 3-bullet-point executive summary of this content.
Each bullet must be one clear sentence.
Content: ${content}`);
  return response.content;
}

// ============================================
// MANAGER AGENT
// Decides which agents to use based on the task
// ============================================
async function managerAgent(userRequest) {
  console.log("🧠 Manager Agent analyzing request...\n");
  
  const response = await llm.invoke(`You are a project manager AI.
Analyze this request and decide which agents are needed.

Available agents:
- researcher: gathers facts about a topic
- writer: writes professional content from facts  
- reviewer: improves and polishes written content
- translator: translates content to another language
- summarizer: creates bullet-point executive summary

User request: "${userRequest}"

Respond in this EXACT format with no other text:
TOPIC: [the main topic]
AGENTS: [comma-separated list of agents needed in order]
LANGUAGE: [language name if translation needed, otherwise "none"]`);

  const text = response.content;
  console.log("Manager decision:\n" + text + "\n");
  
  // Parse manager's decision
  const topicMatch = text.match(/TOPIC:\s*(.+)/);
  const agentsMatch = text.match(/AGENTS:\s*(.+)/);
  const languageMatch = text.match(/LANGUAGE:\s*(.+)/);
  
  return {
    topic: topicMatch ? topicMatch[1].trim() : userRequest,
    agents: agentsMatch ? agentsMatch[1].split(",").map(a => a.trim()) : ["researcher", "writer", "reviewer"],
    language: languageMatch ? languageMatch[1].trim() : "none",
  };
}

// ============================================
// ORCHESTRATOR
// Runs the pipeline based on manager's decision
// ============================================
async function runSystem(userRequest) {
  console.log("=".repeat(50));
  console.log("USER REQUEST:", userRequest);
  console.log("=".repeat(50) + "\n");

  // Manager decides the plan
  const plan = await managerAgent(userRequest);
  
  console.log("=".repeat(50));
  console.log("EXECUTING PLAN");
  console.log("Agents:", plan.agents.join(" → "));
  console.log("=".repeat(50) + "\n");

  // Execute agents in the order manager decided
  let context = { topic: plan.topic };
  
  for (const agent of plan.agents) {
    console.log(`\n--- Running: ${agent.toUpperCase()} ---`);
    
    switch(agent.toLowerCase().trim()) {
      case "researcher":
        context.research = await researcherAgent(context.topic);
        console.log("Output preview:", context.research.slice(0, 100) + "...\n");
        break;
        
      case "writer":
        context.draft = await writerAgent(context.topic, context.research || "No research provided");
        console.log("Output preview:", context.draft.slice(0, 100) + "...\n");
        break;
        
      case "reviewer":
        context.final = await reviewerAgent(context.draft || context.research);
        console.log("Output preview:", context.final.slice(0, 100) + "...\n");
        break;
        
      case "translator":
        const toTranslate = context.final || context.draft || context.research;
        context.translated = await translatorAgent(toTranslate, plan.language);
        console.log("Output preview:", context.translated.slice(0, 100) + "...\n");
        break;
        
      case "summarizer":
        const toSummarize = context.final || context.draft || context.research;
        context.summary = await summarizerAgent(toSummarize);
        console.log("Output preview:", context.summary.slice(0, 100) + "...\n");
        break;
    }
  }

  // Final output
  console.log("\n" + "=".repeat(50));
  console.log("✨ FINAL OUTPUT");
  console.log("=".repeat(50));
  
  const finalOutput = context.translated || 
                      context.summary || 
                      context.final || 
                      context.draft || 
                      context.research;
  console.log(finalOutput);
  
  return context;
}

// ============================================
// TEST WITH 3 DIFFERENT REQUESTS
// Notice how manager picks different agents each time
// ============================================

// Request 1 — Standard research and write
await runSystem("Research and write about JWT authentication in web applications");

console.log("\n" + "🔄".repeat(25) + "\n");

// Request 2 — Just a quick summary needed
await runSystem("Give me a quick bullet-point summary of Docker containerization");

console.log("\n" + "🔄".repeat(25) + "\n");

// Request 3 — Research, write, and summarize
await runSystem("Research PostgreSQL best practices and give me an executive summary");