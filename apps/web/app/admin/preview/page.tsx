"use client";

import { useState } from "react";

export default function PreviewPage() {
  const [tenantKey, setTenantKey] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  async function handleTest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/v1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-key": tenantKey
      },
      body: JSON.stringify({
        message,
        metadata: { channel: "admin_preview" }
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setReply(`Erro: ${data.error}`);
      return;
    }
    setReply(data.reply);
  }

  return (
    <main style={{ margin: "2rem", fontFamily: "sans-serif", maxWidth: 720 }}>
      <h1>Preview do Bot</h1>
      <form onSubmit={handleTest} style={{ display: "grid", gap: "0.75rem" }}>
        <input value={tenantKey} onChange={(e) => setTenantKey(e.target.value)} placeholder="Tenant Key" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Pergunta de teste" rows={4} />
        <button type="submit">Testar resposta</button>
      </form>
      <h3>Resposta</h3>
      <p>{reply}</p>
    </main>
  );
}
