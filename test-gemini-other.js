const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf-8');
const keyMatch = envLocal.match(/GOOGLE_AI_STUDIO_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : '';

async function testModel(modelName) {
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello!");
    console.log(`Success ${modelName}:`, result.response.text().trim());
  } catch(e) {
    console.error(`Error ${modelName}:`, e.message);
  }
}

async function run() {
  await testModel("gemini-3.5-flash");
  await testModel("gemini-2.5-flash");
  await testModel("gemini-flash-latest");
}
run();
