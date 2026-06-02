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
  metadata?: Record<string, unknown>;
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

const santoAngeloTenant = {
  name: "Burguer Santo Angelo",
  slug: "burguer-santo-angelo",
  niche_type: "hamburgueria" as const,
  config: {
    city: "Santo Angelo - RS",
    neighborhood: "Centro",
    address: "Rua Marechal Floriano, 1450 - Centro, Santo Angelo - RS",
    location_reference: "Proximo a Praca Leoni Ramos",
    phone: "(55) 3313-2020",
    whatsapp: "(55) 99610-4550",
    opening_hours: {
      monday_to_thursday: "18:00-23:00",
      friday_saturday: "18:00-00:00",
      sunday: "18:00-23:30"
    },
    delivery_radius_km: 7,
    average_delivery_time_min: 35,
    avg_preparation_time_min: 18,
    service_channels: ["balcao", "retirada", "delivery", "whatsapp"],
    accepted_payments: ["dinheiro", "pix", "credito", "debito", "vr-alimentacao"],
    social_instagram: "@burguersantoangelo",
    system_prompt:
      "Voce e atendente da Burguer Santo Angelo. Sempre responda com base no cardapio, horarios, endereco, taxa de entrega e regras da casa. Seja rapido, amigavel e objetivo."
  }
};

const santoAngeloKnowledge: Array<
  SeedKnowledge & { metadata?: Record<string, unknown> }
> = [
  {
    niche_type: "hamburgueria",
    category: "cardapio",
    title: "Santo Angelo Smash",
    content:
      "Dois burgers smash de 90g, cheddar cremoso, cebola caramelizada, picles e molho da casa no pao brioche. Valor R$ 29,90.",
    metadata: {
      price: "R$ 29,90",
      section: "burgers",
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80"
    }
  },
  {
    niche_type: "hamburgueria",
    category: "cardapio",
    title: "Missioneiro Bacon",
    content:
      "Burger artesanal 160g, queijo prato, bacon crocante, maionese de alho assado e alface. Valor R$ 34,90.",
    metadata: {
      price: "R$ 34,90",
      section: "burgers",
      image:
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80"
    }
  },
  {
    niche_type: "hamburgueria",
    category: "cardapio",
    title: "X-Salada Gaucho",
    content:
      "Burger 140g, queijo, alface, tomate, cebola roxa e maionese verde. Valor R$ 26,90.",
    metadata: {
      price: "R$ 26,90",
      section: "burgers",
      image:
        "https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=1200&q=80"
    }
  },
  {
    niche_type: "hamburgueria",
    category: "cardapio",
    title: "Duplo Pampa Cheddar",
    content:
      "Dois burgers 120g, cheddar em dobro e cebola crispy no pao australiano. Valor R$ 39,90.",
    metadata: {
      price: "R$ 39,90",
      section: "burgers",
      image:
        "https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?auto=format&fit=crop&w=1200&q=80"
    }
  },
  {
    niche_type: "hamburgueria",
    category: "cardapio",
    title: "Chicken Crocante",
    content:
      "File de frango empanado, molho honey mustard, queijo e alface americana. Valor R$ 31,90.",
    metadata: {
      price: "R$ 31,90",
      section: "burgers",
      image:
        "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=1200&q=80"
    }
  },
  {
    niche_type: "hamburgueria",
    category: "cardapio",
    title: "Veggie Missiones",
    content:
      "Burger de grao-de-bico com legumes, queijo, tomate e molho de ervas. Valor R$ 30,90.",
    metadata: {
      price: "R$ 30,90",
      section: "burgers",
      image:
        "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=1200&q=80"
    }
  },
  {
    niche_type: "hamburgueria",
    category: "cardapio",
    title: "Fritas Fronteira",
    content:
      "Porcao media de fritas sequinhas com sal de parrilla. Valor R$ 16,90.",
    metadata: {
      price: "R$ 16,90",
      section: "acompanhamentos",
      image:
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80"
    }
  },
  {
    niche_type: "hamburgueria",
    category: "cardapio",
    title: "Fritas Cheddar e Bacon",
    content:
      "Porcao grande de fritas com cheddar cremoso e bacon crocante. Valor R$ 24,90.",
    metadata: {
      price: "R$ 24,90",
      section: "acompanhamentos",
      image:
        "https://images.unsplash.com/photo-1541599188778-cdc73298e8d2?auto=format&fit=crop&w=1200&q=80"
    }
  },
  {
    niche_type: "hamburgueria",
    category: "cardapio",
    title: "Onion Rings",
    content:
      "Aneis de cebola empanados e sequinhos. Valor R$ 18,90.",
    metadata: {
      price: "R$ 18,90",
      section: "acompanhamentos",
      image:
        "https://images.unsplash.com/photo-1639744210637-c3f5a4c90f42?auto=format&fit=crop&w=1200&q=80"
    }
  },
  {
    niche_type: "hamburgueria",
    category: "cardapio",
    title: "Combo Praca Pinheiro",
    content:
      "Santo Angelo Smash + fritas medias + refri lata 350ml. Valor R$ 42,90.",
    metadata: {
      price: "R$ 42,90",
      section: "combos",
      image:
        "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=1200&q=80"
    }
  },
  {
    niche_type: "hamburgueria",
    category: "cardapio",
    title: "Combo Familia Missioneira",
    content:
      "2 burgers Missioneiro Bacon + 1 fritas grande + 2 refrigerantes 600ml. Valor R$ 94,90.",
    metadata: {
      price: "R$ 94,90",
      section: "combos"
    }
  },
  {
    niche_type: "hamburgueria",
    category: "cardapio",
    title: "Refrigerante Lata",
    content:
      "Coca-Cola, Guarana ou Sprite lata 350ml. Valor R$ 6,50.",
    metadata: {
      price: "R$ 6,50",
      section: "bebidas"
    }
  },
  {
    niche_type: "hamburgueria",
    category: "cardapio",
    title: "Agua com e sem gas",
    content:
      "Agua mineral 500ml com ou sem gas. Valor R$ 4,50.",
    metadata: {
      price: "R$ 4,50",
      section: "bebidas"
    }
  },
  {
    niche_type: "hamburgueria",
    category: "cardapio",
    title: "Milkshake de Ovomaltine",
    content:
      "Milkshake 400ml artesanal com Ovomaltine. Valor R$ 18,90.",
    metadata: {
      price: "R$ 18,90",
      section: "sobremesas"
    }
  },
  {
    niche_type: "hamburgueria",
    category: "horario",
    title: "Horario de funcionamento",
    content:
      "Segunda a quinta das 18h as 23h, sexta e sabado das 18h a 00h, domingo das 18h as 23h30."
  },
  {
    niche_type: "hamburgueria",
    category: "endereco",
    title: "Endereco da loja",
    content:
      "Rua Marechal Floriano, 1450, Centro, Santo Angelo - RS. Referencia: proximo a Praca Leoni Ramos."
  },
  {
    niche_type: "hamburgueria",
    category: "contato",
    title: "Contatos oficiais",
    content:
      "Telefone fixo (55) 3313-2020, WhatsApp (55) 99610-4550, Instagram @burguersantoangelo."
  },
  {
    niche_type: "hamburgueria",
    category: "delivery",
    title: "Regras de delivery",
    content:
      "Entregamos em ate 7 km. Prazo medio entre 30 e 45 minutos. Taxa de R$ 6,00 a R$ 14,00 conforme distancia."
  },
  {
    niche_type: "hamburgueria",
    category: "pagamento",
    title: "Formas de pagamento",
    content:
      "Aceitamos dinheiro, PIX, cartao de credito, cartao de debito e VR alimentacao."
  },
  {
    niche_type: "hamburgueria",
    category: "retirada",
    title: "Pedido para retirada",
    content:
      "Pedidos para retirada ficam prontos em media de 15 a 20 minutos e podem ser pagos antecipadamente por PIX."
  },
  {
    niche_type: "hamburgueria",
    category: "alergenicos",
    title: "Informacoes de alergicos",
    content:
      "Itens podem conter gluten, lactose e ovos. Temos opcoes sem queijo e pao sem gluten sob consulta previa."
  },
  {
    niche_type: "hamburgueria",
    category: "promocoes",
    title: "Promocoes da semana",
    content:
      "Terca do Smash: Santo Angelo Smash por R$ 24,90. Quinta do Combo: 10% off no Combo Praca Pinheiro."
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

  const { data: santoTenant, error: santoTenantError } = await supabase
    .from("tenants")
    .upsert(santoAngeloTenant, { onConflict: "slug" })
    .select("id")
    .single();

  if (santoTenantError) {
    throw santoTenantError;
  }

  const santoRows = santoAngeloKnowledge.map((item) => ({
    tenant_id: santoTenant.id,
    category: item.category,
    title: item.title,
    content: item.content,
    metadata: {
      source: "santo_angelo_seed",
      ...(item.metadata ?? {})
    }
  }));

  if (santoRows.length > 0) {
    const { error: santoKnowledgeError } = await supabase
      .from("knowledge_items")
      .upsert(santoRows, { onConflict: "tenant_id,title" });

    if (santoKnowledgeError) {
      throw santoKnowledgeError;
    }
  }

  // eslint-disable-next-line no-console
  console.log("Seed concluido: templates + tenants demo + tenant burguer-santo-angelo");
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
