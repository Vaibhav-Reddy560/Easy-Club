const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf-8');
const keyMatch = envLocal.match(/GOOGLE_AI_STUDIO_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : '';

async function test() {
  console.log("Using API Key length:", apiKey.length);
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey);
    const data = await response.json();
    if (data.models) {
      console.log("Available models:");
      data.models.map(m => console.log(m.name));
    } else {
      console.log(data);
    }
  } catch(e) {
    console.error("Error:", e.message);
  }
}
test();
