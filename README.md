# Boletim do Cobre — New Cabos

Site do boletim semanal da [New Cabos](https://www.newcabos.com.br) (cabos fotovoltaicos, Sorocaba-SP) com o
preço do cobre na LME, dólar, estoques e **o que isso significa para o preço dos cabos** — em formato de painel,
de leitura rápida, com um **editor online** para a equipe publicar cada edição sem depender de designer ou
desenvolvedor.

| Página | O que tem |
| --- | --- |
| `/` | Última edição em destaque, edições recentes, gráfico histórico interativo e arquivo com filtros |
| `/boletim/2026-09-18` | A edição completa em formato de painel + botões de WhatsApp, LinkedIn, copiar link e PDF |
| `/boletins` | Todas as edições, filtráveis por viés (alta, lateral, baixa) e ano |
| `/admin` | Painel da equipe: criar, editar com pré-visualização ao vivo, publicar, gerenciar usuários |

## Por que um editor estruturado (e não um blog comum)

O boletim tem **sempre a mesma estrutura** (cotações, variações, notícias, fatores de alta/baixa, termômetro,
recado ao cliente). Por isso, em vez de um editor de texto livre, o painel é um **formulário guiado**:

- **O colaborador digita números, o sistema faz as contas.** Variação semanal, cores de alta/baixa,
  minigráficos e o balanço do termômetro são calculados automaticamente. (No boletim de 18/09 em imagem, a
  variação dos estoques aparecia como +8,72%; o valor correto, 234.475 t → 255.100 t, é +8,80% — esse tipo de
  erro deixa de existir.)
- **Nova edição já vem preenchida** a partir da anterior: os valores da semana passada viram "anteriores",
  a data avança uma semana e os textos ficam como ponto de partida.
- **O visual é sempre consistente** e fica bom no celular, no computador, impresso/PDF e na prévia do WhatsApp
  (imagem gerada automaticamente com os números da edição).
- **Os dados viram histórico.** Como cada edição é estruturada, o site monta gráficos de cobre, dólar e
  estoques ao longo das semanas — algo impossível com imagens soltas.

Alternativas avaliadas:

| Opção | Prós | Contras para este caso |
| --- | --- | --- |
| Blog (WordPress, Ghost, Medium) | Pronto, conhecido | Texto livre: sem cálculos, sem gráficos, visual depende de quem escreve; continuaria sendo "imagem colada no post" |
| CMS headless (Sanity, Payload, Strapi) | Painel pronto, campos estruturados | Mais uma plataforma/conta para manter; pré-visualização do painel exige integração; custo e curva de aprendizado desnecessários para um único tipo de conteúdo |
| CMS em Git (Keystatic, Decap, TinaCMS) | Sem banco de dados | Cada editor precisa de conta no GitHub; cada publicação espera um novo deploy |
| Planilha/Notion como fonte | Familiar | Frágil (qualquer coluna renomeada quebra o site), sem controle de rascunho/publicação e sem login próprio |
| **App próprio com editor estruturado (escolhido)** | Formulário exatamente no formato do boletim, pré-visualização idêntica ao site, cálculos automáticos, histórico, login próprio | Código a manter (pequeno, tipado e com testes) |

## Fluxo semanal do colaborador

1. Acesse `/admin` e entre com seu e-mail e senha.
2. Clique em **Nova edição** — ela já vem preenchida com a edição anterior.
3. Atualize a data, a manchete e os valores (cobre, dólar, estoques e médias). As variações aparecem na hora.
4. Revise notícias, fatores de alta/baixa, termômetro, impacto no preço e o recado aos clientes.
5. Confira a **pré-visualização** ao lado (modo computador ou celular) e clique em **Publicar**.
6. Na página publicada, use **Enviar no WhatsApp** para mandar o link aos clientes — a prévia mostra a manchete
   e os números da semana.

Rascunhos não aparecem no site. Uma edição publicada pode ser corrigida a qualquer momento (o link não muda) ou
despublicada.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- Tailwind CSS 4 — identidade New Cabos (azul-marinho `#012759`, amarelo/laranja do raio, cobre como destaque)
- [Drizzle ORM](https://orm.drizzle.team) + [libSQL](https://turso.tech/libsql): arquivo SQLite local no
  desenvolvimento, [Turso](https://turso.tech) em produção (plano gratuito atende com folga)
- zod (validação única para editor, servidor e banco), react-hook-form, jose (sessão), Vercel Blob (imagens de capa)
- Playwright (testes ponta a ponta)

```
src/
  app/
    (site)/            páginas públicas (home, /boletins, /boletim/[slug], imagens de compartilhamento)
    admin/             painel da equipe (login, edições, editor, usuários, conta)
    api/upload/        upload de imagem de capa
  components/
    bulletin/          visual do boletim (usado no site E na pré-visualização do editor)
    site/              cabeçalho, rodapé, cards, gráfico histórico
    admin/             formulário do editor e componentes do painel
  lib/
    bulletin/          schema zod do boletim, formatação pt-BR, cálculos, valores padrão
    bulletins.ts       consultas e gravações no banco (+ revalidação das páginas)
    auth/              senhas (scrypt) e sessão (cookie assinado)
    db/                schema do banco (Drizzle)
drizzle/               migrações SQL
scripts/               migrar, popular dados de exemplo, criar usuário
e2e/                   testes Playwright
```

## Rodando localmente

Requisitos: Node.js 20.9+.

```bash
npm install
cp .env.example .env.local        # ajuste SESSION_SECRET e ADMIN_PASSWORD
npm run setup                      # cria o banco local, o primeiro admin e carrega as edições de exemplo
npm run dev                        # http://localhost:3000  (painel em /admin)
```

`npm run setup` carrega a edição real de **18/09/2026** (transcrita do boletim em imagem) e 8 semanas
anteriores **fictícias** só para os gráficos terem histórico. Para carregar apenas a edição real:
`npm run db:migrate && npm run db:seed -- --only-real`. Para apagar tudo: exclua `data/boletim.db`.

| Comando | Para quê |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build de produção (aplica as migrações antes) |
| `npm run typecheck` / `npm run lint` | Checagens |
| `npm run test:e2e` | Testes Playwright (sobem um servidor próprio com banco `data/e2e.db`) |
| `npm run db:generate` | Gera migração após alterar `src/lib/db/schema.ts` |
| `npm run user:create -- --email x@newcabos.com.br --name "Nome" --password "..." [--admin]` | Cria usuário ou redefine senha |

## Publicando (Vercel + Turso)

O `vercel.json` já força o preset Next.js. O build (`npm run build`) aplica as migrações antes de compilar.

1. **Importe o repositório na [Vercel](https://vercel.com/new)** e defina *Settings → Git → Production Branch* = `master`.
2. **Banco (Turso):** em *Storage → Create Database → Turso Cloud*, crie o banco (região `us-east-1`, a mesma das
   funções da Vercel) e conecte ao projeto **sem prefixo** — ficam `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN`, que o
   app já reconhece. Com prefixo, crie manualmente `DATABASE_URL` e `DATABASE_AUTH_TOKEN` com os valores.
3. **Imagens de capa:** um *Blob store* conectado ao projeto (cria `BLOB_READ_WRITE_TOKEN`).
4. **Variáveis de ambiente** (*Settings → Environment Variables*):
   - `SESSION_SECRET` — gere com `openssl rand -base64 32`
   - `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` — primeiro administrador
   - `NEXT_PUBLIC_SITE_URL` — opcional; sem ela, usa o domínio de produção da Vercel
   - `NEXT_PUBLIC_WHATSAPP` — opcional; WhatsApp comercial com DDI, só dígitos (padrão `5515996099494`)
5. **Deploy.** No primeiro build com o banco vazio, o sistema cria o administrador e já publica a edição de
   18/09/2026. Depois, troque a senha em `/admin/conta` (a variável `ADMIN_PASSWORD` só é usada nesse primeiro build).
6. **Domínio (opcional):** em *Settings → Domains*, adicione `boletim.newcabos.com.br` e crie o CNAME indicado no DNS
   da New Cabos. Por padrão, a Vercel exige login nos endereços `*.vercel.app` do projeto (*Deployment Protection*);
   com domínio próprio o site fica público, ou desative a proteção para liberar o `*.vercel.app`.

**Modo demonstração:** se o projeto for publicado na Vercel sem banco configurado, o build não falha — ele cria um
banco temporário com a edição real e o histórico fictício, que vai junto no deploy em modo somente leitura. O site
mostra uma faixa "Versão de demonstração" e o painel não salva. Basta conectar o Turso e fazer o redeploy.

## Personalização rápida

- **Contatos, WhatsApp, links:** `src/lib/site.ts`
- **Cores e fontes:** `src/app/globals.css` (tokens `navy-*`, `copper-*`, `up`/`down`/`flat`) e `src/app/layout.tsx`
- **Logotipo:** `src/components/brand/logo.tsx` (redesenhado em SVG; troque pelo arquivo oficial se preferir)
- **Campos do boletim:** `src/lib/bulletin/schema.ts` — o editor, o banco e a página usam esse contrato

## Leitura das cores

Para quem compra cabo, cobre e dólar em alta encarecem a matéria-prima; estoques em alta aliviam. Por isso as
variações são coloridas pelo **efeito no preço**: vermelho = pressão de alta, verde = pressão de baixa,
cinza = neutro — sempre acompanhadas de seta e rótulo, nunca só pela cor.

## Ideias para próximas etapas

- Envio automático da edição por e-mail/WhatsApp para uma lista de clientes
- Preenchimento automático das cotações (LME/dólar) por API, deixando para a equipe só os textos
- Página "assine o boletim" com captura de contatos para o comercial
