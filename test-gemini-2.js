const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf-8');
const keyMatch = envLocal.match(/GOOGLE_AI_STUDIO_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : '';

async function test() {
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    console.log("Testing gemini-2.0-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Hello!");
    console.log("Response:", result.response.text());
  } catch(e) {
    console.error("Error gemini-2.0-flash:", e.message);
  }
}
test();
