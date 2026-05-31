import { NextResponse } from "next/server";
import { createServiceSupabaseClient, listAiRequests } from "@receptio/db/index";

type Context = {
  params: Promise<{ tenantId: string }>;
};

export async function GET(_: Request, context: Context) {
  const { tenantId } = await context.params;
  const supabase = createServiceSupabaseClient();
  const aiRequests = await listAiRequests(tenantId, 500);

  const { data: usageRows } = await supabase
    .from("usage_daily")
    .select("usage_date,requests_count,total_tokens,avg_latency_ms,cost_estimated")
    .eq("tenant_id", tenantId)
    .order("usage_date", { ascending: true });

  const totals = aiRequests.reduce(
    (acc, item) => {
      acc.requests += 1;
      acc.totalTokens += item.total_tokens ?? 0;
      acc.cost += Number(item.cost_estimated ?? 0);
      if (item.status === "error") acc.errors += 1;
      if (item.latency_ms) acc.latencySum += item.latency_ms;
      return acc;
    },
    { requests: 0, totalTokens: 0, cost: 0, errors: 0, latencySum: 0 }
  );

  const averageLatency = totals.requests > 0 ? Math.round(totals.latencySum / totals.requests) : 0;
  const errors429 = aiRequests.filter(
    (request) =>
      request.status === "error" &&
      typeof request.model === "string" &&
      request.model.length > 0
  ).length;

  return NextResponse.json({
    summary: {
      requests: totals.requests,
      total_tokens: totals.totalTokens,
      cost_estimated: Number(totals.cost.toFixed(4)),
      average_latency_ms: averageLatency,
      errors_count: totals.errors,
      errors_429: errors429
    },
    daily_usage: usageRows ?? [],
    recent_requests: aiRequests.slice(0, 50)
  });
}
