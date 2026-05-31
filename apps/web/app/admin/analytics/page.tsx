"use client";

import { useState } from "react";

type Summary = {
  requests: number;
  total_tokens: number;
  cost_estimated: number;
  average_latency_ms: number;
  errors_count: number;
  errors_429: number;
};

export default function AnalyticsPage() {
  const [tenantId, setTenantId] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [dailyUsage, setDailyUsage] = useState<
    Array<{ usage_date: string; requests_count: number; total_tokens: number; cost_estimated: number }>
  >([]);

  async function loadAnalytics() {
    const response = await fetch(`/api/admin/analytics/${tenantId}`);
    const data = await response.json();
    if (response.ok) {
      setSummary(data.summary);
      setDailyUsage(data.daily_usage ?? []);
    }
  }

  return (
    <main style={{ margin: "2rem", fontFamily: "sans-serif" }}>
      <h1>Dashboard IA</h1>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input value={tenantId} onChange={(e) => setTenantId(e.target.value)} placeholder="Tenant ID" />
        <button type="button" onClick={loadAnalytics}>
          Carregar
        </button>
      </div>

      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
          <div>Requisições: {summary.requests}</div>
          <div>Tokens: {summary.total_tokens}</div>
          <div>Custo estimado: US$ {summary.cost_estimated.toFixed(4)}</div>
          <div>Latência média: {summary.average_latency_ms} ms</div>
          <div>Erros totais: {summary.errors_count}</div>
          <div>Erros 429: {summary.errors_429}</div>
        </div>
      )}

      <h2 style={{ marginTop: "1rem" }}>Uso diário</h2>
      <ul>
        {dailyUsage.map((row) => (
          <li key={row.usage_date}>
            {row.usage_date}: {row.requests_count} req, {row.total_tokens} tokens, US$ {Number(row.cost_estimated).toFixed(4)}
          </li>
        ))}
      </ul>
    </main>
  );
}
