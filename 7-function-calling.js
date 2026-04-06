import { ChatOllama } from "@langchain/ollama";

console.log("LLM Function Calling Demo\n");

const llm = new ChatOllama({
  model: "llama3.2",
  baseUrl: "http://localhost:11434",
  temperature: 0,
});

// ============================================
// STEP 1: Define your tools/functions
// These are the actions the AI can choose to take
// ============================================
const tools = [
  {
    name: "getWeather",
    description: "Get the current weather for a city",
    parameters: {
      city: "string - the name of the city",
    }
  },
  {
    name: "calculateBMI",
    description: "Calculate BMI given weight in kg and height in cm",
    parameters: {
      weight: "number - weight in kilograms",
      height: "number - height in centimeters",
    }
  },
  {
    name: "searchProperty",
    description: "Search for a property unit by unit number in CubeXHome",
    parameters: {
      unitNumber: "string - the unit number to search for",
    }
  },
  {
    name: "convertCurrency",
    description: "Convert an amount from one currency to another",
    parameters: {
      amount: "number - the amount to convert",
      from: "string - source currency code e.g. USD",
      to: "string - target currency code e.g. BDT",
    }
  },
  {
    name: "getAnswer",
    description: "Answer a general knowledge question directly without using any tool, for example let's say a capital of a country",
    parameters: {
      answer: "string - the direct answer to the question",
    }
  }
];

// ============================================
// STEP 2: Define actual function implementations
// This is what actually runs when AI picks a function
// ============================================
const functionImplementations = {
  getWeather: ({ city }) => {
    // In real life this would call a weather API
    const weatherData = {
      "Dhaka": { temp: 32, condition: "Humid and partly cloudy", humidity: 85 },
      "London": { temp: 12, condition: "Overcast with light rain", humidity: 78 },
      "Kuala Lumpur": { temp: 30, condition: "Sunny with afternoon thunderstorms", humidity: 80 },
      "default": { temp: 25, condition: "Partly cloudy", humidity: 70 },
    };
    const data = weatherData[city] || weatherData["default"];
    return `Weather in ${city}: ${data.temp}°C, ${data.condition}, Humidity: ${data.humidity}%`;
  },

  calculateBMI: ({ weight, height }) => {
    const heightM = height / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);
    let category = "";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal weight";
    else if (bmi < 30) category = "Overweight";
    else category = "Obese";
    return `BMI: ${bmi} — Category: ${category}`;
  },

  searchProperty: ({ unitNumber }) => {
    // Simulated CubeXHome database
    const properties = {
      "A-101": { resident: "Ahmad Fariz", status: "Occupied", maintenance: "Paid" },
      "B-205": { resident: "Siti Nurhaliza", status: "Occupied", maintenance: "Overdue" },
      "C-310": { resident: "James Wong", status: "Vacant", maintenance: "N/A" },
    };
    const unit = properties[unitNumber];
    if (!unit) return `Unit ${unitNumber} not found in database`;
    return `Unit ${unitNumber}: Resident: ${unit.resident}, Status: ${unit.status}, Maintenance: ${unit.maintenance}`;
  },

  convertCurrency: ({ amount, from, to }) => {
    // Simplified rates
    const rates = {
      "USD_BDT": 110,
      "USD_MYR": 4.7,
      "MYR_BDT": 23.4,
      "BDT_USD": 0.0091,
    };
    const key = `${from}_${to}`;
    const rate = rates[key];
    if (!rate) return `Conversion rate for ${from} to ${to} not available`;
    const converted = (amount * rate).toFixed(2);
    return `${amount} ${from} = ${converted} ${to}`;
  },

  getAnswer: ({ answer }) => answer,
};

// ============================================
// STEP 3: The function calling engine
// AI decides which function to call
// ============================================
async function callWithTools(userMessage) {
  console.log("👤 User:", userMessage);
  
  // Ask AI to decide which function to call
  const decisionPrompt = `You are a helpful assistant with access to these tools:

${tools.map(t => `- ${t.name}: ${t.description}
  Parameters: ${JSON.stringify(t.parameters)}`).join("\n")}

User message: "${userMessage}"

Decide which tool to use and what parameters to pass.
Respond in this EXACT JSON format with no other text:
{
  "tool": "toolName",
  "parameters": {
    "param1": "value1"
  },
  "reasoning": "one sentence explaining why you chose this tool"
}`;

  const decisionResponse = await llm.invoke(decisionPrompt);
  
  // Parse AI decision
  let decision;
  try {
    const jsonMatch = decisionResponse.content.match(/\{[\s\S]*\}/);
    decision = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.log("❌ Could not parse AI decision\n");
    return;
  }
  
  console.log(`🧠 AI decided to call: ${decision.tool}`);
  console.log(`💭 Reasoning: ${decision.reasoning}`);
  console.log(`📥 Parameters:`, decision.parameters);
  
  // Execute the actual function
  const functionResult = functionImplementations[decision.tool](decision.parameters);
  console.log(`⚙️  Function result: ${functionResult}`);
  
  // Ask AI to generate final answer using the result
  const finalPrompt = `The user asked: "${userMessage}"
You called the ${decision.tool} function and got this result: "${functionResult}"
Now give a natural, friendly response to the user based on this result.
Keep it concise — 1-2 sentences maximum.`;

  const finalResponse = await llm.invoke(finalPrompt);
  console.log(`🤖 Final Answer: ${finalResponse.content}`);
  console.log("─".repeat(50) + "\n");
}

// ============================================
// STEP 4: Test with different requests
// Watch how AI picks different functions each time
// ============================================
const testRequests = [
  "What's the weather like in Dhaka right now?",
  "I weigh 70kg and I'm 175cm tall, what's my BMI?",
  "Can you look up unit B-205 in the property system?",
  "How much is 500 USD in Bangladeshi Taka?",
  "What is the capital city of Malaysia?",
];

console.log("=".repeat(50));
console.log("FUNCTION CALLING DEMO");
console.log("AI picks the right tool for each request");
console.log("=".repeat(50) + "\n");

for (const request of testRequests) {
  await callWithTools(request);
}