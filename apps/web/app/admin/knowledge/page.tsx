"use client";

import { useState } from "react";
import { AdminNav } from "../_components/admin-nav";
import { TenantSelect } from "../_components/tenant-select";

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
    <main className="page card stack">
      <AdminNav />
      <h1>CRUD da Knowledge Base</h1>
      <p className="muted">Gerencie itens de FAQ, políticas e respostas canônicas.</p>
      <form className="stack" onSubmit={handleCreate}>
        <TenantSelect value={tenantId} onChange={setTenantId} placeholder="Selecione o tenant para criar item" />
        <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Categoria" />
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" />
        <textarea className="textarea" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Conteúdo" rows={6} />
        <button className="button" type="submit" disabled={!tenantId}>
          Criar Item
        </button>
      </form>
      {result ? <p className={result.startsWith("Erro:") ? "result-error" : "result-success"}>{result}</p> : null}
    </main>
  );
}
