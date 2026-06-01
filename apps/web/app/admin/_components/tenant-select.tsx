"use client";

import { useEffect, useState } from "react";

export type TenantOption = {
  id: string;
  name: string;
  slug: string;
  tenant_key: string;
  niche_type: string;
};

type TenantSelectProps = {
  value: string;
  onChange: (tenantId: string) => void;
  placeholder?: string;
  className?: string;
};

export function useTenantOptions() {
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTenants() {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/tenants");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Falha ao carregar tenants");
        }

        if (!cancelled) {
          setTenants(data.tenants ?? []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Falha ao carregar tenants");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTenants();

    return () => {
      cancelled = true;
    };
  }, []);

  return { tenants, loading, error };
}

export function TenantSelect({
  value,
  onChange,
  placeholder = "Selecione um tenant",
  className = "select"
}: TenantSelectProps) {
  const { tenants, loading, error } = useTenantOptions();

  return (
    <div className="stack">
      <select
        className={className}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading}
      >
        <option value="">{loading ? "Carregando tenants..." : placeholder}</option>
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name} ({tenant.slug})
          </option>
        ))}
      </select>
      {error ? <p className="result-error">{error}</p> : null}
    </div>
  );
}
