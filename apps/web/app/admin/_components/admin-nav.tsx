"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Visao geral" },
  { href: "/admin/onboarding", label: "Onboarding" },
  { href: "/admin/knowledge", label: "Knowledge Base" },
  { href: "/admin/conversations", label: "Conversas" },
  { href: "/admin/analytics", label: "Analytics IA" },
  { href: "/admin/preview", label: "Preview do Bot" },
  { href: "/admin/billing", label: "Billing" }
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav">
      {adminLinks.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            className={`admin-nav-link${isActive ? " is-active" : ""}`}
            href={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
