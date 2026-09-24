<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Boletim do Cobre — New Cabos

Site público + painel para a New Cabos publicar o boletim semanal do cobre (LME, dólar, estoques).
Todo o texto visível é em português (pt-BR).

- **Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind v4, Drizzle ORM + libSQL
  (arquivo SQLite local em dev, Turso em produção), zod 4, react-hook-form, jose.
- **Contrato do boletim:** `src/lib/bulletin/schema.ts` (zod). O conteúdo é salvo como JSON na
  tabela `bulletins` (`src/lib/db/schema.ts`); `referenceDate` e `headline` são copiados para colunas.
- **Visual do boletim:** `src/components/bulletin/bulletin-view.tsx` é usado tanto na página pública
  quanto no preview do editor. Usa container queries (`@container`, `@3xl:` etc.), não breakpoints
  de viewport — mantenha assim para o preview funcionar em qualquer largura.
- **Dados:** `src/lib/bulletins.ts` (server-only) concentra consultas e mutações e chama
  `revalidatePath` após salvar. Páginas públicas usam ISR (`revalidate = 300`).
- **Auth:** `src/lib/auth/session.ts` — cookie JWT assinado; toda página/Server Action do painel
  deve chamar `requireUser()` / `requireAdmin()` (não confie só em layout).
- **Cores:** pressão de alta no preço = vermelho (`up`), de baixa = verde (`down`), neutro = cinza
  (`flat`); sempre com seta + rótulo, nunca só cor.

Comandos: `npm run setup` (migra + dados de exemplo), `npm run dev`, `npm run typecheck`,
`npm run lint`, `npm run db:generate` (após mudar o schema), `npm run test:e2e`.
