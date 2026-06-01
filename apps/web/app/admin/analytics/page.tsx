"use client";

import { useState } from "react";
import { AdminNav } from "../_components/admin-nav";
import { TenantSelect } from "../_components/tenant-select";

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
    <main className="page card stack">
      <AdminNav />
      <h1>Dashboard IA</h1>
      <p className="muted">Métricas de tráfego, custo e estabilidade por tenant.</p>
      <div className="row">
        <TenantSelect value={tenantId} onChange={setTenantId} placeholder="Selecione o tenant para analytics" />
        <button className="button" type="button" onClick={loadAnalytics} disabled={!tenantId}>
          Carregar
        </button>
      </div>

      {summary && (
        <div className="kpi-grid">
          <div className="kpi">
            Requisições
            <strong>{summary.requests}</strong>
          </div>
          <div className="kpi">
            Tokens
            <strong>{summary.total_tokens}</strong>
          </div>
          <div className="kpi">
            Custo estimado
            <strong>US$ {summary.cost_estimated.toFixed(4)}</strong>
          </div>
          <div className="kpi">
            Latência média
            <strong>{summary.average_latency_ms} ms</strong>
          </div>
          <div className="kpi">
            Erros totais
            <strong>{summary.errors_count}</strong>
          </div>
          <div className="kpi">
            Erros 429
            <strong>{summary.errors_429}</strong>
          </div>
        </div>
      )}

      <h2 className="section-title">Uso diário</h2>
      <ul className="list">
        {dailyUsage.map((row) => (
          <li key={row.usage_date}>
            <span className="mono">{row.usage_date}</span>: {row.requests_count} req, {row.total_tokens} tokens, US${" "}
            {Number(row.cost_estimated).toFixed(4)}
          </li>
        ))}
      </ul>
    </main>
  );
}
