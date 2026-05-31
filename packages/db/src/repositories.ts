import { randomUUID } from "crypto";
import { createServiceSupabaseClient } from "./client";
import type { NicheType } from "@receptio/shared/index";

export async function getTenantByKey(tenantKey: string) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id,name,niche_type,config,groq_api_key_encrypted")
    .eq("tenant_key", tenantKey)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function ensureConversation(tenantId: string, sessionId: string) {
  const supabase = createServiceSupabaseClient();
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ tenant_id: tenantId, session_id: sessionId })
    .select("id")
    .single();

  if (error) throw error;
  return created.id;
}

export async function listRecentConversationMessages(
  conversationId: string,
  limit = 10
) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("messages")
    .select("role,content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return [...(data ?? [])].reverse();
}

export async function logMessage(params: {
  conversationId: string;
  role: "system" | "user" | "assistant";
  content: string;
  tokensIn?: number;
  tokensOut?: number;
}) {
  const supabase = createServiceSupabaseClient();
  const { error } = await supabase.from("messages").insert({
    conversation_id: params.conversationId,
    role: params.role,
    content: params.content,
    tokens_in: params.tokensIn ?? null,
    tokens_out: params.tokensOut ?? null
  });
  if (error) throw error;
}

export async function logAiRequest(params: {
  tenantId: string;
  conversationId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  status: "ok" | "error";
  error?: string;
  costEstimated: number;
}) {
  const supabase = createServiceSupabaseClient();
  const { error } = await supabase.from("ai_requests").insert({
    tenant_id: params.tenantId,
    conversation_id: params.conversationId,
    model: params.model,
    prompt_tokens: params.promptTokens,
    completion_tokens: params.completionTokens,
    total_tokens: params.totalTokens,
    latency_ms: params.latencyMs,
    status: params.status,
    error: params.error ?? null,
    cost_estimated: params.costEstimated
  });
  if (error) throw error;
}

export async function getRagSnippets(tenantId: string, query: string, limit = 3) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("knowledge_items")
    .select("title,content")
    .eq("tenant_id", tenantId)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((item) => `${item.title}: ${item.content}`);
}

export async function createTenantWithTemplate(params: {
  name: string;
  slug: string;
  nicheType: NicheType;
}) {
  const supabase = createServiceSupabaseClient();
  const tenantKey = randomUUID().replaceAll("-", "");

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({
      name: params.name,
      slug: params.slug,
      niche_type: params.nicheType,
      tenant_key: tenantKey
    })
    .select("id,name,slug,tenant_key,niche_type")
    .single();

  if (tenantError) throw tenantError;

  const { data: template, error: templateError } = await supabase
    .from("niche_templates")
    .select("system_prompt,categories")
    .eq("niche_type", params.nicheType)
    .single();

  if (templateError) throw templateError;

  const seedRows = (template.categories as string[]).map((category) => ({
    tenant_id: tenant.id,
    category,
    title: `${category} inicial`,
    content: `Conteudo inicial de ${category} para ${params.name}.`,
    metadata: { source: "template_seed" }
  }));

  if (seedRows.length > 0) {
    const { error: seedError } = await supabase.from("knowledge_items").insert(seedRows);
    if (seedError) throw seedError;
  }

  return tenant;
}

export async function listConversations(tenantId: string, limit = 50) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("id,session_id,status,created_at,updated_at")
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listMessages(conversationId: string) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id,role,content,created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listAiRequests(tenantId: string, limit = 100) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("ai_requests")
    .select("id,model,total_tokens,latency_ms,status,cost_estimated,created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function upsertUsageDaily(params: {
  tenantId: string;
  requestsCount: number;
  totalTokens: number;
  avgLatencyMs: number;
  costEstimated: number;
}) {
  const supabase = createServiceSupabaseClient();
  const usageDate = new Date().toISOString().slice(0, 10);

  const { data: current } = await supabase
    .from("usage_daily")
    .select("requests_count,total_tokens,cost_estimated")
    .eq("tenant_id", params.tenantId)
    .eq("usage_date", usageDate)
    .maybeSingle();

  const { error } = await supabase.from("usage_daily").upsert(
    {
      tenant_id: params.tenantId,
      usage_date: usageDate,
      requests_count: (current?.requests_count ?? 0) + params.requestsCount,
      total_tokens: (current?.total_tokens ?? 0) + params.totalTokens,
      avg_latency_ms: params.avgLatencyMs,
      cost_estimated: Number(current?.cost_estimated ?? 0) + params.costEstimated
    },
    { onConflict: "tenant_id,usage_date" }
  );

  if (error) throw error;
}
