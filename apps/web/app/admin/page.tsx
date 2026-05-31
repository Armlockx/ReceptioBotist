import Link from "next/link";

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
    <main style={{ margin: "2rem", fontFamily: "sans-serif" }}>
      <h1>Painel Admin ReceptioBotist</h1>
      <p>Área operacional do SaaS multi-tenant.</p>
      <ul>
        {sections.map((section) => (
          <li key={section.href}>
            <Link href={section.href}>{section.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
