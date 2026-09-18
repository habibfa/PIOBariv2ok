const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const chatApi = `
  app.post("/api/chat-ai", async (req, res) => {
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
  });
`;

if (!code.includes('/api/chat-ai')) {
  code = code.replace('  app.post("/api/soap-ai"', chatApi + '\n  app.post("/api/soap-ai"');
  fs.writeFileSync('server.ts', code);
  console.log("Added /api/chat-ai endpoint.");
} else {
  console.log("Endpoint already exists.");
}
