import { ChatOllama } from "@langchain/ollama";

console.log("Multi-Agent Content Pipeline\n");

// ============================================
// SETUP — One LLM, multiple agent personalities
// via different system prompts
// ============================================
const llm = new ChatOllama({
  model: "llama3.2",
  baseUrl: "http://localhost:11434",
  temperature: 0.7,
});

// ============================================
// AGENT 1 — RESEARCHER
// Job: Find and list key facts about a topic
// ============================================
async function researcherAgent(topic) {
  console.log("🔍 Agent 1 (Researcher) working...");
  
  const prompt = `You are a research specialist. Your ONLY job is to identify 
and list the most important facts about a given topic in software development.

Rules:
- List exactly 5 key facts
- Each fact must be specific and informative
- No opinions, just facts
- Do not expand acronyms unless you are certain of their meaning
- Format as a numbered list

Topic: ${topic}

Key Facts:`;

  const response = await llm.invoke(prompt);
  console.log("✅ Researcher done\n");
  return response.content;
}

// ============================================
// AGENT 2 — WRITER
// Job: Take research facts and write a summary
// ============================================
async function writerAgent(topic, research) {
  console.log("✍️  Agent 2 (Writer) working...");
  
  const prompt = `You are a professional content writer. Your ONLY job is to 
write a clear, engaging summary based on provided research facts.

Rules:
- Write exactly 2 paragraphs
- Use all the provided facts naturally
- Write for a professional audience
- Do not add facts not provided in the research

Topic: ${topic}

Research Facts:
${research}

Professional Summary:`;

  const response = await llm.invoke(prompt);
  console.log("✅ Writer done\n");
  return response.content;
}

// ============================================
// AGENT 3 — REVIEWER
// Job: Review and improve the written summary
// ============================================
async function reviewerAgent(topic, summary) {
  console.log("🔎 Agent 3 (Reviewer) working...");
  
  const prompt = `You are a senior editor and quality reviewer. Your ONLY job 
is to review a summary and provide an improved version.

Rules:
- Fix any grammar or clarity issues
- Make the opening sentence more engaging
- Ensure the summary flows naturally
- Keep the same length — do not add new facts
- Return ONLY the improved summary, no commentary

Topic: ${topic}

Original Summary:
${summary}

Improved Summary:`;

  const response = await llm.invoke(prompt);
  console.log("✅ Reviewer done\n");
  return response.content;
}

// ============================================
// ORCHESTRATOR — Runs all agents in sequence
// ============================================
async function runPipeline(topic) {
  console.log("=".repeat(50));
  console.log("MULTI-AGENT PIPELINE STARTING");
  console.log("Topic:", topic);
  console.log("=".repeat(50) + "\n");

  // Step 1: Research
  const research = await researcherAgent(topic);
  console.log("📋 Research Output:");
  console.log(research);
  console.log("-".repeat(40) + "\n");

  // Step 2: Write (uses research output)
  const draft = await writerAgent(topic, research);
  console.log("📝 Draft Output:");
  console.log(draft);
  console.log("-".repeat(40) + "\n");

  // Step 3: Review (uses draft output)
  const final = await reviewerAgent(topic, draft);
  console.log("=".repeat(50));
  console.log("✨ FINAL OUTPUT (after all 3 agents):");
  console.log("=".repeat(50));
  console.log(final);
  
  return { research, draft, final };
}

// ============================================
// RUN IT — Try with topics relevant to your work
// ============================================
await runPipeline("Node.js REST API development best practices");