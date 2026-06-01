"use client";

import { useState } from "react";
import { AdminNav } from "../_components/admin-nav";

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
    <main className="page card stack">
      <AdminNav />
      <h1>Onboarding de estabelecimento</h1>
      <p className="muted">Crie um tenant com template inicial por nicho.</p>
      <form className="stack" onSubmit={handleCreateTenant}>
        <input
          className="input"
          placeholder="Nome do estabelecimento"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input className="input" placeholder="Slug (ex: acme-hotel)" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <select className="select" value={niche} onChange={(e) => setNiche(e.target.value as (typeof niches)[number])}>
          {niches.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
        <button className="button" type="submit">
          Criar tenant com template
        </button>
      </form>
      {result ? <p className={result.startsWith("Erro:") ? "result-error" : "result-success"}>{result}</p> : null}
    </main>
  );
}
