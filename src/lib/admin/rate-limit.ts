import "server-only";

/**
 * Limitador de tentativas em memória (janela fixa). Suficiente para um painel com poucos usuários;
 * em ambiente serverless cada instância tem a sua contagem, então é uma proteção "melhor esforço".
 */

type Bucket = { count: number; resetAt: number };

const globalStore = globalThis as unknown as { __ncRateLimit?: Map<string, Bucket> };
// Sobrevive aos recarregamentos do `next dev`.
const buckets = (globalStore.__ncRateLimit ??= new Map<string, Bucket>());

function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimiter = {
  /** Se ainda há tentativas disponíveis para a chave (não conta uma tentativa). */
  check(key: string): { ok: true } | { ok: false; retryAfterMs: number };
  /** Registra uma tentativa (ex.: senha errada). */
  hit(key: string): void;
  /** Zera a contagem (ex.: login bem-sucedido). */
  reset(key: string): void;
};

export function createRateLimiter({ name, limit, windowMs }: { name: string; limit: number; windowMs: number }): RateLimiter {
  const k = (key: string) => `${name}:${key}`;
  return {
    check(key) {
      const now = Date.now();
      const bucket = buckets.get(k(key));
      if (!bucket || bucket.resetAt <= now) return { ok: true };
      if (bucket.count < limit) return { ok: true };
      return { ok: false, retryAfterMs: bucket.resetAt - now };
    },
    hit(key) {
      const now = Date.now();
      sweep(now);
      const bucket = buckets.get(k(key));
      if (!bucket || bucket.resetAt <= now) {
        buckets.set(k(key), { count: 1, resetAt: now + windowMs });
      } else {
        bucket.count += 1;
      }
    },
    reset(key) {
      buckets.delete(k(key));
    },
  };
}

const TEN_MINUTES = 10 * 60 * 1000;

/** 5 tentativas erradas por e-mail + IP a cada 10 minutos. */
export const loginLimiter = createRateLimiter({ name: "login", limit: 5, windowMs: TEN_MINUTES });
/** Teto por IP, para quem tenta vários e-mails diferentes. */
export const loginIpLimiter = createRateLimiter({ name: "login-ip", limit: 30, windowMs: TEN_MINUTES });
/** Troca de senha na página "Minha conta" (senha atual errada). */
export const passwordChangeLimiter = createRateLimiter({ name: "password-change", limit: 5, windowMs: TEN_MINUTES });

export function minutesUntil(ms: number) {
  return Math.max(1, Math.ceil(ms / 60000));
}
