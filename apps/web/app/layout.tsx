import type { ReactNode } from "react";
import "./globals.css";
import { TopNav } from "./_components/top-nav";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="app-body">
        <TopNav />
        {children}
      </body>
    </html>
  );
}
