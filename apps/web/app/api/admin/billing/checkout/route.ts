import { NextResponse } from "next/server";
import { z } from "zod";

const checkoutSchema = z.object({
  tenant_id: z.string().uuid(),
  plan_code: z.enum(["starter", "pro", "business"]),
  provider: z.enum(["stripe", "asaas"]).default("stripe")
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = checkoutSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  // Placeholder de integração para fase 2: Stripe/Asaas.
  const checkoutUrl = `https://billing.example.com/checkout?tenant=${parsed.data.tenant_id}&plan=${parsed.data.plan_code}&provider=${parsed.data.provider}`;
  return NextResponse.json({ checkout_url: checkoutUrl });
}
