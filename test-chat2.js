fetch("http://localhost:3000/api/chat-ai", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "sakit gigi obat apa?", history: [] })
}).then(async r => {
  console.log("Status:", r.status);
  const text = await r.text();
  console.log("Response text:", text);
}).catch(console.error)
