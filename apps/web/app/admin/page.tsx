import Link from "next/link";
import { AdminNav } from "./_components/admin-nav";

const sections = [
  { href: "/admin/onboarding", title: "Onboarding de Tenant" },
  { href: "/admin/knowledge", title: "CRUD Knowledge Base" },
  { href: "/admin/conversations", title: "Conversas e Mensagens" },
  { href: "/admin/analytics", title: "Dashboard de Uso IA" },
  { href: "/admin/preview", title: "Preview do Bot" },
  { href: "/admin/billing", title: "Planos e Billing" }
] as const;

export default function AdminHomePage() {
  return (
    <main className="page card stack">
      <AdminNav />
      <h1>Painel Admin ReceptioBotist</h1>
      <p className="muted">Área operacional do SaaS multi-tenant.</p>
      <ul className="nav-grid">
        {sections.map((section) => (
          <li className="card" key={section.href}>
            <Link href={section.href}>{section.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
