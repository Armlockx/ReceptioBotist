import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@receptio/db/index";
import { z } from "zod";

const byokSchema = z.object({
  tenant_id: z.string().uuid(),
  groq_api_key: z.string().min(20)
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = byokSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase
    .from("tenants")
    .update({ groq_api_key_encrypted: parsed.data.groq_api_key })
    .eq("id", parsed.data.tenant_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
