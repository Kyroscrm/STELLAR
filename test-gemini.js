const { GoogleGenerativeAI } = require('@google/generative-ai');

// Using API key method
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function run() {
  const prompt = "Hello, Gemini!";
  const result = await model.generateContent(prompt);
  console.log(result.response.text());
}

run();