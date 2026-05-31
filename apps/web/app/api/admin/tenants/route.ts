import { NextResponse } from "next/server";
import { createTenantWithTemplate } from "@receptio/db/index";
import { nicheTypeSchema } from "@receptio/shared/index";
import { z } from "zod";

const createTenantSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  niche_type: nicheTypeSchema
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = createTenantSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const tenant = await createTenantWithTemplate({
    name: parsed.data.name,
    slug: parsed.data.slug,
    nicheType: parsed.data.niche_type
  });

  return NextResponse.json({ tenant }, { status: 201 });
}
