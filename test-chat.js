fetch("http://localhost:3000/api/chat-ai", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "Hello", history: [] })
}).then(r => r.json().then(j => console.log(r.status, j))).catch(console.error)
