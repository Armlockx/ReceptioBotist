import { NextResponse } from "next/server";
import { listMessages } from "@receptio/db/index";

type Context = {
  params: Promise<{ conversationId: string }>;
};

export async function GET(_: Request, context: Context) {
  const { conversationId } = await context.params;
  const messages = await listMessages(conversationId);
  return NextResponse.json({ messages });
}
