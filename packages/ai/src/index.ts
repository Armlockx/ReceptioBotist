import Groq from "groq-sdk";
import type { NicheType } from "@receptio/shared/index";

export type ChatTurn = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatContextInput = {
  nicheType: NicheType;
  basePrompt: string;
  history: ChatTurn[];
  userMessage: string;
  ragSnippets: string[];
};

const modelByTier = {
  default: "llama-3.1-8b-instant",
  advanced: "llama-3.3-70b-versatile"
} as const;

export function createGroqClient(apiKey = process.env.GROQ_API_KEY) {
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY");
  }

  return new Groq({ apiKey });
}

export function resolveGroqApiKey(tenantEncryptedKey?: string | null) {
  if (tenantEncryptedKey && tenantEncryptedKey.length > 0) {
    return tenantEncryptedKey;
  }
  return process.env.GROQ_API_KEY ?? "";
}

export function buildPromptPayload(input: ChatContextInput): ChatTurn[] {
  const ragContext =
    input.ragSnippets.length > 0
      ? `Contexto de base de conhecimento:\n${input.ragSnippets.join("\n---\n")}`
      : "Sem contexto extra de base de conhecimento.";

  return [
    {
      role: "system",
      content: `${input.basePrompt}\nNicho: ${input.nicheType}\n${ragContext}`
    },
    ...input.history,
    {
      role: "user",
      content: input.userMessage
    }
  ];
}

export async function runGroqChatCompletion(input: ChatContextInput) {
  const client = createGroqClient();
  const messages = buildPromptPayload(input);

  const response = await client.chat.completions.create({
    model: modelByTier.default,
    messages
  });

  return {
    reply: response.choices[0]?.message?.content ?? "",
    usage: response.usage
  };
}

export function pickWindowedHistory(
  history: ChatTurn[],
  windowSize = 10
): ChatTurn[] {
  return history.slice(Math.max(0, history.length - windowSize));
}
