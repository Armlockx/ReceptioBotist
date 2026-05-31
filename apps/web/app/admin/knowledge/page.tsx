"use client";

import { useState } from "react";

export default function KnowledgePage() {
  const [tenantId, setTenantId] = useState("");
  const [category, setCategory] = useState("faq");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: tenantId,
        category,
        title,
        content
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setResult(`Erro: ${data.error}`);
      return;
    }
    setResult(`Item criado: ${data.item.id}`);
  }

  return (
    <main style={{ margin: "2rem", fontFamily: "sans-serif", maxWidth: 720 }}>
      <h1>CRUD da Knowledge Base</h1>
      <form onSubmit={handleCreate} style={{ display: "grid", gap: "0.75rem" }}>
        <input value={tenantId} onChange={(e) => setTenantId(e.target.value)} placeholder="Tenant ID" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Categoria" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Conteúdo" rows={6} />
        <button type="submit">Criar Item</button>
      </form>
      <p>{result}</p>
    </main>
  );
}
