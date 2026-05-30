const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf-8');
const keyMatch = envLocal.match(/GOOGLE_AI_STUDIO_KEY=(.*)/) || envLocal.match(/GEMINI_API_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : '';

async function test() {
  console.log("Using API Key length:", apiKey.length);
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello, are you working?");
    console.log("Response:", result.response.text());
  } catch(e) {
    console.error("Error:", e.message);
  }
}
test();
