import { NextResponse } from "next/server";
import { listConversations } from "@receptio/db/index";

type Context = {
  params: Promise<{ tenantId: string }>;
};

export async function GET(_: Request, context: Context) {
  const { tenantId } = await context.params;
  const conversations = await listConversations(tenantId, 100);
  return NextResponse.json({ conversations });
}
