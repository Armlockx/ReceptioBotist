import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@receptio/db/index";
import { z } from "zod";

const createKnowledgeSchema = z.object({
  tenant_id: z.string().uuid(),
  category: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1)
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = createKnowledgeSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("knowledge_items")
    .insert({
      tenant_id: parsed.data.tenant_id,
      category: parsed.data.category,
      title: parsed.data.title,
      content: parsed.data.content
    })
    .select("id,category,title,content")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}
