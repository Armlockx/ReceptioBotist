import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@receptio/db/index";

type Context = {
  params: Promise<{ tenantId: string }>;
};

export async function GET(_: Request, context: Context) {
  const { tenantId } = await context.params;
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("knowledge_items")
    .select("id,category,title,content,created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ items: data ?? [] });
}
