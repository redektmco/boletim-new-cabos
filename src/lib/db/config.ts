/**
 * Resolve a conexão com o banco (sem "server-only": também é usado pelos scripts).
 *
 * - DATABASE_URL (ou TURSO_DATABASE_URL, criado pela integração Turso da Vercel) → banco configurado.
 * - Sem nenhum dos dois, usa o arquivo local data/boletim.db. Na Vercel isso liga o **modo demonstração**:
 *   o build cria e popula o arquivo, que vai junto no deploy e é lido em modo somente leitura.
 */
export function resolveDatabase() {
  const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined;
  if (url) return { url, authToken, demo: false };
  return { url: "file:./data/boletim.db", authToken: undefined, demo: Boolean(process.env.VERCEL) };
}

export function isDemoMode() {
  return resolveDatabase().demo;
}

export const DEMO_MODE_MESSAGE =
  "Modo demonstração: o banco de dados de produção (Turso) ainda não foi configurado, então não é possível salvar. " +
  "Veja o README, seção “Publicando”.";
