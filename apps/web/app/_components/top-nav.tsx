"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopNav() {
  const pathname = usePathname();
  const isDemo = pathname.startsWith("/demo");

  return (
    <header className="top-nav-wrap">
      <nav className="top-nav page">
        <Link className="brand-link" href="/">
          ReceptioBotist
        </Link>
        <div className="top-nav-actions">
          <Link className={`demo-link${isDemo ? " is-active" : ""}`} href="/demo">
            Demo
          </Link>
        </div>
      </nav>
    </header>
  );
}
