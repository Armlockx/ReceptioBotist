import { createServiceSupabaseClient } from "./client";

type SeedTemplate = {
  niche_type: "hamburgueria" | "hotel" | "pet_shop" | "agro_parts" | "services";
  display_name: string;
  system_prompt: string;
  default_tone: string;
  categories: string[];
};

type SeedKnowledge = {
  niche_type: SeedTemplate["niche_type"];
  category: string;
  title: string;
  content: string;
};

const templates: SeedTemplate[] = [
  {
    niche_type: "hamburgueria",
    display_name: "Template Hamburgueria",
    system_prompt:
      "Você é um atendente de hamburgueria. Priorize cardápio, preços, horários e delivery com respostas objetivas.",
    default_tone: "amigavel",
    categories: ["faq", "cardapio", "delivery", "alergenicos"]
  },
  {
    niche_type: "hotel",
    display_name: "Template Hotel",
    system_prompt:
      "Você é recepcionista de hotel. Explique tipos de quarto, regras de check-in/checkout, café da manhã e políticas.",
    default_tone: "profissional",
    categories: ["faq", "quartos", "amenities", "politicas"]
  },
  {
    niche_type: "pet_shop",
    display_name: "Template Pet Shop",
    system_prompt:
      "Você atende clientes de pet shop e banho/tosa. Dê clareza sobre serviços, preços e agendamento.",
    default_tone: "acolhedor",
    categories: ["faq", "servicos", "produtos", "agenda"]
  },
  {
    niche_type: "agro_parts",
    display_name: "Template Peças Agrícolas",
    system_prompt:
      "Você atende uma loja de peças agrícolas. Priorize compatibilidade, disponibilidade e prazo de entrega.",
    default_tone: "tecnico",
    categories: ["faq", "pecas", "compatibilidade", "estoque"]
  },
  {
    niche_type: "services",
    display_name: "Template Prestador de Serviços",
    system_prompt:
      "Você atende um prestador de serviços local. Esclareça escopo, preços, área atendida e prazos.",
    default_tone: "consultivo",
    categories: ["faq", "servicos", "precos", "cobertura"]
  }
];

const mockKnowledge: SeedKnowledge[] = [
  {
    niche_type: "hamburgueria",
    category: "cardapio",
    title: "Combo da Casa",
    content: "Pão brioche, burger 160g, cheddar, bacon e fritas. Valor R$34,90."
  },
  {
    niche_type: "hamburgueria",
    category: "delivery",
    title: "Raio de entrega",
    content: "Entregamos em raio de 7km. Taxa varia entre R$5,00 e R$12,00."
  },
  {
    niche_type: "hotel",
    category: "quartos",
    title: "Quarto Standard",
    content: "Acomoda 2 adultos, cama queen, café incluso e wifi."
  },
  {
    niche_type: "hotel",
    category: "politicas",
    title: "Check-in e checkout",
    content: "Check-in a partir de 14h e checkout até 12h."
  },
  {
    niche_type: "pet_shop",
    category: "servicos",
    title: "Banho P",
    content: "Banho para porte pequeno custa R$55,00 com hidratação simples."
  },
  {
    niche_type: "pet_shop",
    category: "agenda",
    title: "Agendamento",
    content: "Atendimento de segunda a sábado, das 9h às 18h."
  },
  {
    niche_type: "agro_parts",
    category: "pecas",
    title: "Filtro de óleo MF 4290",
    content: "Código AG4290-FO2, disponível para pronta entrega."
  },
  {
    niche_type: "agro_parts",
    category: "compatibilidade",
    title: "Compatibilidade de filtro",
    content: "Filtro AG4290-FO2 é compatível com MF 4290 e MF 4283."
  },
  {
    niche_type: "services",
    category: "servicos",
    title: "Instalação residencial",
    content: "Instalação elétrica residencial com visita técnica inclusa."
  },
  {
    niche_type: "services",
    category: "cobertura",
    title: "Área atendida",
    content: "Atendemos toda a cidade e municípios vizinhos em até 30km."
  }
];

async function run() {
  const supabase = createServiceSupabaseClient();

  const { error } = await supabase.from("niche_templates").upsert(templates, {
    onConflict: "niche_type"
  });

  if (error) {
    throw error;
  }

  const { data: demoTenants, error: tenantError } = await supabase
    .from("tenants")
    .upsert(
      templates.map((template) => ({
        name: `Demo ${template.display_name}`,
        slug: `demo-${template.niche_type}`,
        niche_type: template.niche_type,
        config: { system_prompt: template.system_prompt, seed: true }
      })),
      { onConflict: "slug" }
    )
    .select("id,niche_type");

  if (tenantError) {
    throw tenantError;
  }

  const rows =
    demoTenants?.flatMap((tenant) =>
      mockKnowledge
        .filter((item) => item.niche_type === tenant.niche_type)
        .map((item) => ({
          tenant_id: tenant.id,
          category: item.category,
          title: item.title,
          content: item.content,
          metadata: { source: "mock_seed" }
        }))
    ) ?? [];

  if (rows.length > 0) {
    const { error: knowledgeError } = await supabase
      .from("knowledge_items")
      .upsert(rows, { onConflict: "tenant_id,title" });

    if (knowledgeError) {
      throw knowledgeError;
    }
  }

  // eslint-disable-next-line no-console
  console.log("Seed concluido: templates + tenants demo + knowledge mock");
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
