const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  try {
    const r1 = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello"
    });
    console.log("2.5-flash OK:", r1.text);
  } catch (e) {
    console.error("2.5-flash failed:", e.message);
  }
  
  try {
    const r2 = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Hello"
    });
    console.log("1.5-flash OK:", r2.text);
  } catch (e) {
    console.error("1.5-flash failed:", e.message);
  }
}

run();
