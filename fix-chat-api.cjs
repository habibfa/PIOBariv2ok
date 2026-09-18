const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldChatApi = `  app.post("/api/chat-ai", async (req, res) => {
    try {
      const { message, history } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let systemPrompt = "Anda adalah Asisten Apoteker Klinis yang ahli dan ringkas. Berikan jawaban yang tepat, medis, dan berbasis bukti.";
      let prompt = \`Konteks Percakapan Sebelumnya: \${JSON.stringify(history)}\\n\\nPertanyaan Pengguna: \${message}\\n\\nJawaban:\`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2
        }
      });
      
      res.json({ reply: response.text });
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: "Gagal memproses pertanyaan AI." });
    }
  });`;

const newChatApi = `  app.post("/api/chat-ai", async (req, res) => {
    try {
      const { message, history } = req.body;
      const ai = getAIClient();
      if (!ai) {
        return res.json({ reply: "Sistem AI tidak terhubung (GEMINI_API_KEY tidak ditemukan). Harap tambahkan API Key di pengaturan." });
      }
      
      let systemPrompt = "Anda adalah Asisten Apoteker Klinis yang ahli dan ringkas. Berikan jawaban yang tepat, medis, dan berbasis bukti.";
      let prompt = \`Konteks Percakapan Sebelumnya: \${JSON.stringify(history)}\\n\\nPertanyaan Pengguna: \${message}\\n\\nJawaban:\`;
      
      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2
          }
        });
      } catch (err) {
        console.warn("gemini-2.5-flash failed, trying fallback to gemini-1.5-flash", err);
        response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2
          }
        });
      }
      
      res.json({ reply: response.text });
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: "Gagal memproses pertanyaan AI." });
    }
  });`;

if (code.includes(oldChatApi)) {
  code = code.replace(oldChatApi, newChatApi);
  fs.writeFileSync('server.ts', code);
  console.log("Fixed /api/chat-ai endpoint.");
} else {
  console.log("oldChatApi not found! Trying regex or manual replace...");
  // Let's just find the block.
  const startIdx = code.indexOf('app.post("/api/chat-ai"');
  const endIdx = code.indexOf('app.post("/api/soap-ai"');
  if (startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + newChatApi + '\n  ' + code.substring(endIdx);
    fs.writeFileSync('server.ts', code);
    console.log("Fixed /api/chat-ai endpoint via substring.");
  } else {
    console.log("Could not find blocks.");
  }
}
