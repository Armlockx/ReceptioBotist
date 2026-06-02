import { NextResponse } from "next/server";
import {
  ensureConversation,
  getRagSnippets,
  getTenantByKey,
  listRecentConversationMessages,
  logAiRequest,
  logMessage,
  upsertUsageDaily
} from "@receptio/db/index";
import {
  createGroqClient,
  buildPromptPayload,
  pickWindowedHistory,
  resolveGroqApiKey
} from "@receptio/ai/index";
import { chatRequestSchema } from "@receptio/shared/index";
import { checkTenantRateLimit, getFaqCachedResponse, setFaqCachedResponse } from "../../../lib/rate-limit";

const FALLBACK_MODEL = "llama-3.1-8b-instant";
const LOCATION_FALLBACK_REPLY =
  "Nao encontrei o endereco cadastrado neste momento. Posso te encaminhar para atendimento humano?";

function estimateCostUsd(promptTokens: number, completionTokens: number) {
  const inputPerMillion = 0.05;
  const outputPerMillion = 0.08;
  return (promptTokens / 1_000_000) * inputPerMillion + (completionTokens / 1_000_000) * outputPerMillion;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isLocationQuestion(question: string) {
  const normalized = normalizeText(question);
  return [
    "onde fica",
    "endereco",
    "localizacao",
    "como chegar",
    "cidade",
    "bairro",
    "gps",
    "rota",
    "mapa"
  ].some((keyword) => normalized.includes(keyword));
}

function canCacheAnswer(answer: string) {
  const normalized = normalizeText(answer);
  if (
    normalized.includes("[insira") ||
    normalized.includes("nao sei") ||
    normalized.includes("nao encontrei essa informacao")
  ) {
    return false;
  }

  if (
    normalized.includes("provavelmente") ||
    normalized.includes("talvez") ||
    normalized.includes("acho que")
  ) {
    return false;
  }

  return true;
}

export async function POST(request: Request) {
  const tenantKey = request.headers.get("x-tenant-key");
  if (!tenantKey) {
    return NextResponse.json({ error: "Missing x-tenant-key" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const limit = await checkTenantRateLimit(tenantKey);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const tenant = await getTenantByKey(tenantKey);
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const sessionId = parsed.data.session_id ?? crypto.randomUUID();
  const conversationId = await ensureConversation(tenant.id, sessionId);
  await logMessage({
    conversationId,
    role: "user",
    content: parsed.data.message
  });

  const faqCached = await getFaqCachedResponse(tenant.id, parsed.data.message);
  if (faqCached) {
    await logMessage({
      conversationId,
      role: "assistant",
      content: faqCached
    });

    return NextResponse.json({
      reply: faqCached,
      session_id: sessionId,
      cached: true,
      usage: { tokens_in: 0, tokens_out: 0, latency_ms: 0 }
    });
  }

  const history = await listRecentConversationMessages(conversationId, 10);
  const ragSnippets = await getRagSnippets(tenant.id, parsed.data.message, 3);
  const isLocationIntent = isLocationQuestion(parsed.data.message);
  if (isLocationIntent && ragSnippets.length === 0) {
    await logMessage({
      conversationId,
      role: "assistant",
      content: LOCATION_FALLBACK_REPLY
    });

    return NextResponse.json({
      reply: LOCATION_FALLBACK_REPLY,
      session_id: sessionId,
      usage: { tokens_in: 0, tokens_out: 0, latency_ms: 0 }
    });
  }
  const messages = buildPromptPayload({
    nicheType: tenant.niche_type,
    basePrompt:
      typeof tenant.config?.system_prompt === "string"
        ? `${tenant.config.system_prompt}\nUse somente informacoes explicitas do contexto fornecido. Se a informacao nao estiver no contexto, diga exatamente: 'Nao encontrei essa informacao no cadastro deste estabelecimento.' Nunca invente endereco, telefone, horario, bairro, numero ou ponto de referencia.`
        : "Voce e um recepcionista virtual util e objetivo. Use somente informacoes explicitas do contexto fornecido. Se a informacao nao estiver no contexto, diga exatamente: 'Nao encontrei essa informacao no cadastro deste estabelecimento.' Nunca invente endereco, telefone, horario, bairro, numero ou ponto de referencia.",
    history: pickWindowedHistory(
      history.map((item) => ({
        role: item.role,
        content: item.content
      })),
      10
    ),
    userMessage: parsed.data.message,
    ragSnippets
  });

  const startedAt = Date.now();

  try {
    const groqKey = resolveGroqApiKey(tenant.groq_api_key_encrypted);
    const groq = createGroqClient(groqKey);
    const completion = await groq.chat.completions.create({
      model: FALLBACK_MODEL,
      messages
    });
    const latencyMs = Date.now() - startedAt;
    const reply = completion.choices[0]?.message?.content ?? "Não consegui gerar resposta no momento.";
    const promptTokens = completion.usage?.prompt_tokens ?? 0;
    const completionTokens = completion.usage?.completion_tokens ?? 0;
    const totalTokens = completion.usage?.total_tokens ?? promptTokens + completionTokens;
    const costEstimated = estimateCostUsd(promptTokens, completionTokens);

    await logMessage({
      conversationId,
      role: "assistant",
      content: reply,
      tokensIn: promptTokens,
      tokensOut: completionTokens
    });
    await logAiRequest({
      tenantId: tenant.id,
      conversationId,
      model: FALLBACK_MODEL,
      promptTokens,
      completionTokens,
      totalTokens,
      latencyMs,
      status: "ok",
      costEstimated
    });
    await upsertUsageDaily({
      tenantId: tenant.id,
      requestsCount: 1,
      totalTokens,
      avgLatencyMs: latencyMs,
      costEstimated
    });

    if (canCacheAnswer(reply)) {
      await setFaqCachedResponse(tenant.id, parsed.data.message, reply);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await fetch(`${appUrl}/api/webhooks/conversation.started`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: tenant.id,
        conversation_id: conversationId,
        session_id: sessionId,
        channel: parsed.data.metadata?.channel ?? "unknown"
      })
    }).catch(() => undefined);
    await fetch(`${appUrl}/api/webhooks/message.received`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: tenant.id,
        conversation_id: conversationId,
        message: parsed.data.message,
        reply
      })
    }).catch(() => undefined);

    return NextResponse.json({
      reply,
      session_id: sessionId,
      usage: {
        tokens_in: promptTokens,
        tokens_out: completionTokens,
        latency_ms: latencyMs
      }
    });
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : "Unknown error";

    await logAiRequest({
      tenantId: tenant.id,
      conversationId,
      model: FALLBACK_MODEL,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      latencyMs,
      status: "error",
      error: message,
      costEstimated: 0
    });

    return NextResponse.json({ error: "AI provider failed", detail: message }, { status: 502 });
  }
}
