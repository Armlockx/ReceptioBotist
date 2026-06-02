import Link from "next/link";
import {
  getTenantBySlug,
  listKnowledgeItemsByTenant
} from "@receptio/db/index";

const fallbackImage =
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80";

type MenuItem = {
  name: string;
  price: string;
  description: string;
  image: string;
  section: string;
};

export default async function DemoPage() {
  const tenant = await getTenantBySlug("burguer-santo-angelo");
  const knowledge = await listKnowledgeItemsByTenant(tenant.id);

  const menuItems: MenuItem[] = knowledge
    .filter((item) => item.category === "cardapio")
    .map((item) => {
      const metadata =
        item.metadata && typeof item.metadata === "object"
          ? (item.metadata as Record<string, unknown>)
          : {};

      return {
        name: item.title,
        price:
          typeof metadata.price === "string" ? metadata.price : "Consulte",
        description: item.content,
        image:
          typeof metadata.image === "string" ? metadata.image : fallbackImage,
        section:
          typeof metadata.section === "string" ? metadata.section : "geral"
      };
    });

  const details = knowledge.filter((item) =>
    ["horario", "endereco", "contato", "delivery", "pagamento"].includes(
      item.category
    )
  );

  const config =
    tenant.config && typeof tenant.config === "object"
      ? (tenant.config as Record<string, unknown>)
      : {};

  const city =
    typeof config.city === "string" ? config.city : "Santo Angelo - RS";
  const opening =
    typeof config.opening_hours === "object" && config.opening_hours
      ? "Seg-Qui 18h-23h | Sex-Sab 18h-00h | Dom 18h-23h30"
      : "Consulte nossos horarios";
  const deliveryRadius =
    typeof config.delivery_radius_km === "number"
      ? `${config.delivery_radius_km} km`
      : "7 km";

  return (
    <main className="landing">
      <section className="hero">
        <h1>{tenant.name}</h1>
        <p>
          Tenant real conectado ao banco com contexto completo de atendimento:
          cardapio, horarios, endereco, delivery, pagamentos e perguntas
          frequentes para o chat AI.
        </p>
        <div className="hero-badges">
          <span className="hero-badge">{city}</span>
          <span className="hero-badge">{opening}</span>
          <span className="hero-badge">Delivery em ate {deliveryRadius}</span>
        </div>
      </section>

      <section className="menu-grid" aria-label="Cardapio de burgers e fritas">
        {menuItems.map((item) => (
          <article className="menu-card" key={item.name}>
            <img alt={item.name} src={item.image} loading="lazy" />
            <div className="menu-content">
              <div className="menu-title-line">
                <h2 className="menu-title">{item.name}</h2>
                <span className="menu-price">{item.price}</span>
              </div>
              <p className="menu-desc">{item.description}</p>
              <small className="muted">Categoria: {item.section}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="card stack">
        <h2 className="section-title">Informacoes do estabelecimento</h2>
        <ul className="list">
          {details.map((item) => (
            <li key={item.id}>
              <strong>{item.title}:</strong> {item.content}
            </li>
          ))}
        </ul>
      </section>

      <section className="demo-cta">
        <div>
          <strong>Quer testar o atendimento com IA agora?</strong>
          <p>
            Use o Preview e passe a tenant key abaixo para simular pedidos,
            horarios, ingredientes e entregas deste estabelecimento.
          </p>
          <p className="mono">tenant_key: {tenant.tenant_key}</p>
        </div>
        <Link className="demo-cta-button" href="/admin/preview">
          Abrir chat AI demo
        </Link>
      </section>
    </main>
  );
}
