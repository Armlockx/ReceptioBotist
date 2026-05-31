"use client";

import { useState } from "react";

const niches = ["hamburgueria", "hotel", "pet_shop", "agro_parts", "services"] as const;

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [niche, setNiche] = useState<(typeof niches)[number]>("hamburgueria");
  const [result, setResult] = useState<string>("");

  async function handleCreateTenant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult("Criando...");
    const response = await fetch("/api/admin/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        niche_type: niche
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setResult(`Erro: ${data.error}`);
      return;
    }
    setResult(`Tenant criado. Chave: ${data.tenant.tenant_key}`);
  }

  return (
    <main style={{ margin: "2rem", fontFamily: "sans-serif", maxWidth: 520 }}>
      <h1>Onboarding de estabelecimento</h1>
      <form onSubmit={handleCreateTenant} style={{ display: "grid", gap: "0.75rem" }}>
        <input placeholder="Nome do estabelecimento" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Slug (ex: acme-hotel)" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <select value={niche} onChange={(e) => setNiche(e.target.value as (typeof niches)[number])}>
          {niches.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
        <button type="submit">Criar tenant com template</button>
      </form>
      <p>{result}</p>
    </main>
  );
}
