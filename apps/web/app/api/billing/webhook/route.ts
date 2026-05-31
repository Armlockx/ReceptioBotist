import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@receptio/db/index";

export async function POST(request: Request) {
  const body = await request.json();
  const event = body?.event;

  if (!event) {
    return NextResponse.json({ error: "Missing event" }, { status: 400 });
  }

  if (event === "plan.updated") {
    const tenantId = body?.tenant_id as string | undefined;
    const planCode = body?.plan_code as string | undefined;
    if (!tenantId || !planCode) {
      return NextResponse.json({ error: "Missing tenant_id or plan_code" }, { status: 400 });
    }

    const supabase = createServiceSupabaseClient();
    const { error } = await supabase
      .from("tenants")
      .update({ config: { plan_code: planCode, billing_provider: body?.provider ?? "stripe" } })
      .eq("id", tenantId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
