"use client";

import { useState } from "react";
import { AdminNav } from "../_components/admin-nav";
import { TenantSelect } from "../_components/tenant-select";

type PlanCode = "starter" | "pro" | "business";

export default function BillingPage() {
  const [tenantId, setTenantId] = useState("");
  const [planCode, setPlanCode] = useState<PlanCode>("starter");
  const [provider, setProvider] = useState<"stripe" | "asaas">("stripe");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [byokResult, setByokResult] = useState("");

  async function handleCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: tenantId,
        plan_code: planCode,
        provider
      })
    });
    const data = await response.json();
    if (response.ok) {
      setCheckoutUrl(data.checkout_url);
    }
  }

  async function handleByok(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/tenants/byok", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: tenantId,
        groq_api_key: groqKey
      })
    });
    const data = await response.json();
    if (response.ok) {
      setByokResult("Chave Groq salva para o tenant.");
    } else {
      setByokResult(`Erro: ${data.error}`);
    }
  }

  return (
    <main className="page card stack">
      <AdminNav />
      <h1>Planos e Billing</h1>
      <p className="muted">Checkout multi-provedor e BYOK por tenant.</p>
      <form className="stack" onSubmit={handleCheckout}>
        <TenantSelect value={tenantId} onChange={setTenantId} placeholder="Selecione o tenant para billing" />
        <select className="select" value={planCode} onChange={(e) => setPlanCode(e.target.value as PlanCode)}>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="business">Business</option>
        </select>
        <select className="select" value={provider} onChange={(e) => setProvider(e.target.value as "stripe" | "asaas")}>
          <option value="stripe">Stripe</option>
          <option value="asaas">Asaas</option>
        </select>
        <button className="button" type="submit" disabled={!tenantId}>
          Gerar checkout
        </button>
      </form>
      {checkoutUrl ? (
        <p className="result-success">
          URL de checkout: <a href={checkoutUrl}>{checkoutUrl}</a>
        </p>
      ) : null}

      <h2 className="section-title">BYOK Groq</h2>
      <form className="stack" onSubmit={handleByok}>
        <input
          className="input mono"
          value={groqKey}
          onChange={(e) => setGroqKey(e.target.value)}
          placeholder="gsk_..."
        />
        <button className="button" type="submit" disabled={!tenantId || !groqKey}>
          Salvar chave por tenant
        </button>
      </form>
      {byokResult ? <p className={byokResult.startsWith("Erro:") ? "result-error" : "result-success"}>{byokResult}</p> : null}
    </main>
  );
}
