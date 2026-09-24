import { DEMO_MODE_MESSAGE } from "@/lib/db/config";

/** Retorno padrão das Server Actions do painel: nunca lançam erro para o navegador. */
export type ActionResult<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string };

export const GENERIC_ERROR = "Algo deu errado. Tente novamente em instantes.";

export const READ_ONLY_DB_ERROR =
  "O banco de dados está em modo somente leitura (modo demonstração). Conecte o banco de dados (Turso) na Vercel para salvar alterações.";

/**
 * Mensagem que pode ir para a tela a partir de um erro capturado numa Server Action.
 * Erros lançados de propósito pela camada de dados (ex.: modo demonstração, "Edição não encontrada.")
 * são mostrados como vieram; erros técnicos do banco/driver/zod viram a mensagem genérica.
 */
export function userFacingError(error: unknown, fallback = GENERIC_ERROR): string {
  if (!(error instanceof Error) || !error.message) return fallback;
  if (error.message === DEMO_MODE_MESSAGE) return DEMO_MODE_MESSAGE;
  const text = `${error.name} ${error.message}`;
  if (/SQLITE_READONLY|readonly database|read-only/i.test(text)) return READ_ONLY_DB_ERROR;
  const technical =
    typeof (error as { code?: unknown }).code === "string" ||
    /SQLITE|Libsql|ZodError|ECONN|ETIMEDOUT|fetch failed|constraint|syntax error|no such (table|column)|undefined|null/i.test(text) ||
    error.message.length > 300;
  return technical ? fallback : error.message;
}
