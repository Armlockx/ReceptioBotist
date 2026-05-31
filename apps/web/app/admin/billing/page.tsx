"use client";

import { useState } from "react";

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
    <main style={{ margin: "2rem", fontFamily: "sans-serif", maxWidth: 620 }}>
      <h1>Planos e Billing</h1>
      <p>Fase 2: checkout e integração Stripe/Asaas via webhook.</p>
      <form onSubmit={handleCheckout} style={{ display: "grid", gap: "0.75rem" }}>
        <input value={tenantId} onChange={(e) => setTenantId(e.target.value)} placeholder="Tenant ID" />
        <select value={planCode} onChange={(e) => setPlanCode(e.target.value as PlanCode)}>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="business">Business</option>
        </select>
        <select value={provider} onChange={(e) => setProvider(e.target.value as "stripe" | "asaas")}>
          <option value="stripe">Stripe</option>
          <option value="asaas">Asaas</option>
        </select>
        <button type="submit">Gerar checkout</button>
      </form>
      {checkoutUrl ? (
        <p>
          URL de checkout: <a href={checkoutUrl}>{checkoutUrl}</a>
        </p>
      ) : null}

      <h2>BYOK Groq</h2>
      <form onSubmit={handleByok} style={{ display: "grid", gap: "0.75rem" }}>
        <input
          value={groqKey}
          onChange={(e) => setGroqKey(e.target.value)}
          placeholder="gsk_..."
        />
        <button type="submit">Salvar chave por tenant</button>
      </form>
      <p>{byokResult}</p>
    </main>
  );
}
