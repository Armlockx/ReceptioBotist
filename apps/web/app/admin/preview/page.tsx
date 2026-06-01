"use client";

import { useState } from "react";
import { AdminNav } from "../_components/admin-nav";
import { useTenantOptions } from "../_components/tenant-select";

export default function PreviewPage() {
  const { tenants, loading, error } = useTenantOptions();
  const [tenantId, setTenantId] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const selectedTenant = tenants.find((tenant) => tenant.id === tenantId);
  const tenantKey = selectedTenant?.tenant_key ?? "";

  async function handleTest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tenantKey) return;
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
    <main className="page card stack">
      <AdminNav />
      <h1>Preview do Bot</h1>
      <p className="muted">Teste fluxo real com header de tenant e payload de mensagem.</p>
      <form className="stack" onSubmit={handleTest}>
        <select
          className="select"
          value={tenantId}
          onChange={(event) => setTenantId(event.target.value)}
          disabled={loading}
        >
          <option value="">{loading ? "Carregando tenants..." : "Selecione o tenant para preview"}</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name} ({tenant.slug})
            </option>
          ))}
        </select>
        {selectedTenant ? (
          <p className="muted">
            Tenant Key em uso: <span className="mono">{selectedTenant.tenant_key}</span>
          </p>
        ) : null}
        {error ? <p className="result-error">{error}</p> : null}
        <textarea className="textarea" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Pergunta de teste" rows={4} />
        <button className="button" type="submit" disabled={!tenantKey || !message.trim()}>
          Testar resposta
        </button>
      </form>
      <h3 className="section-title">Resposta</h3>
      <div className="card">
        <p>{reply}</p>
      </div>
    </main>
  );
}
