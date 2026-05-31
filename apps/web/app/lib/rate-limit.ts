import { Redis } from "@upstash/redis";

type RateResult = { allowed: boolean; remaining: number };

function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

const memoryStore = new Map<string, { count: number; expiresAt: number; value?: string }>();

export async function checkTenantRateLimit(tenantKey: string): Promise<RateResult> {
  const redis = getRedisClient();
  const key = `rl:${tenantKey}:${new Date().toISOString().slice(0, 16)}`;
  const limit = 30;

  if (redis) {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, 60);
    }
    return { allowed: current <= limit, remaining: Math.max(0, limit - current) };
  }

  const now = Date.now();
  const existing = memoryStore.get(key);
  if (!existing || existing.expiresAt < now) {
    memoryStore.set(key, { count: 1, expiresAt: now + 60_000 });
    return { allowed: true, remaining: limit - 1 };
  }
  existing.count += 1;
  return { allowed: existing.count <= limit, remaining: Math.max(0, limit - existing.count) };
}

function normalizeQuestion(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function getFaqCachedResponse(tenantId: string, question: string) {
  const redis = getRedisClient();
  const normalized = normalizeQuestion(question);
  const key = `faq:${tenantId}:${normalized}`;

  if (redis) {
    const value = await redis.get<string>(key);
    return value ?? null;
  }

  const fromMemory = memoryStore.get(key);
  if (!fromMemory || !fromMemory.value || fromMemory.expiresAt < Date.now()) {
    return null;
  }
  return fromMemory.value;
}

export async function setFaqCachedResponse(tenantId: string, question: string, answer: string) {
  const redis = getRedisClient();
  const normalized = normalizeQuestion(question);
  const key = `faq:${tenantId}:${normalized}`;

  if (redis) {
    await redis.set(key, answer, { ex: 1800 });
    return;
  }

  memoryStore.set(key, {
    count: 0,
    value: answer,
    expiresAt: Date.now() + 1_800_000
  });
}
