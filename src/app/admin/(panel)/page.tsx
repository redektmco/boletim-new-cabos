import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FilePlus, Keyboard, Newspaper, PencilLine, Plus, Rocket } from "lucide-react";
import { BulletinList, type BulletinListRow } from "@/components/admin/bulletin-list";
import { buttonClass } from "@/components/admin/ui/button";
import { requireUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/admin/format";
import { formatDateShort } from "@/lib/bulletin/format";
import { listAllForAdmin } from "@/lib/bulletins";

export const metadata: Metadata = {
  title: "Edições",
};

export default async function AdminHomePage() {
  const user = await requireUser();
  const all = await listAllForAdmin();

  const rows: BulletinListRow[] = all.map((b) => ({
    id: b.id,
    slug: b.slug,
    status: b.status,
    dateLabel: formatDateShort(b.referenceDate),
    headline: b.headline,
    bias: b.bias ?? null,
    updatedLabel: formatDateTime(b.updatedAt),
  }));

  const lastPublished = all.find((b) => b.status === "published");
  const drafts = all.filter((b) => b.status === "draft");
  // rascunho mais recente que a última publicada = edição da semana em andamento
  const inProgress = drafts.find((d) => !lastPublished || d.referenceDate >= lastPublished.referenceDate);
  const firstName = user.name.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">Olá, {firstName}</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">Edições do boletim</h1>
          <p className="mt-1.5 text-[0.9375rem] text-ink-2">
            {lastPublished ? (
              <>
                Última publicada: <strong className="font-semibold text-ink">{formatDateShort(lastPublished.referenceDate)}</strong>
              </>
            ) : (
              "Nenhuma edição publicada ainda"
            )}
            {" · "}
            {drafts.length === 0 ? "nenhum rascunho" : drafts.length === 1 ? "1 rascunho" : `${drafts.length} rascunhos`}
          </p>
        </div>
        <Link href="/admin/boletins/novo" className={buttonClass({ variant: "primary", size: "lg", className: "w-full sm:w-auto" })}>
          <Plus className="size-5" aria-hidden="true" />
          Nova edição
        </Link>
      </div>

      {inProgress ? (
        <Link
          href={`/admin/boletins/${inProgress.id}`}
          className="group mt-6 flex items-center gap-4 rounded-[var(--radius-card)] border border-[#f5d77a] bg-[#fffbeb] p-4 transition-shadow hover:shadow-[var(--shadow-lift)] sm:p-5"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-amber text-navy-900">
            <PencilLine className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink">
              Rascunho em andamento: edição de {formatDateShort(inProgress.referenceDate)}
            </span>
            <span className="mt-0.5 block truncate text-sm text-ink-2">
              {inProgress.headline ? `“${inProgress.headline}”` : "Continue de onde parou."}
            </span>
          </span>
          <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-navy-800 sm:inline-flex">
            Continuar editando
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </Link>
      ) : null}

      <WeeklyFlow />

      <section className="mt-8" aria-labelledby="lista-edicoes">
        <h2 id="lista-edicoes" className="sr-only">
          Todas as edições
        </h2>
        {rows.length === 0 ? <EmptyState /> : <BulletinList rows={rows} />}
      </section>
    </div>
  );
}

function WeeklyFlow() {
  const steps = [
    {
      icon: FilePlus,
      title: "Crie a edição",
      text: "Clique em “Nova edição”. Ela já vem preenchida com a semana passada — os valores atuais viram “semana anterior”.",
    },
    {
      icon: PencilLine,
      title: "Atualize e revise",
      text: "Digite cobre, dólar e estoques, escreva a manchete e revise notícias e textos. A pré-visualização mostra o resultado na hora.",
    },
    {
      icon: Rocket,
      title: "Publique",
      text: "Clique em “Publicar”. O boletim entra no site e fica pronto para enviar aos clientes no WhatsApp.",
    },
  ];
  return (
    <section aria-labelledby="como-publicar" className="mt-6 card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="como-publicar" className="section-title text-base">
          Como publicar o boletim da semana
        </h2>
        <p className="hidden items-center gap-1.5 text-xs text-muted sm:inline-flex">
          <Keyboard className="size-3.5" aria-hidden="true" />
          Dica: no editor, <kbd className="rounded border border-line-strong bg-wash px-1 font-sans">Ctrl</kbd>+
          <kbd className="rounded border border-line-strong bg-wash px-1 font-sans">S</kbd> salva a qualquer momento.
        </p>
      </div>
      <ol className="mt-4 grid gap-4 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="flex gap-3">
            <span className="relative grid size-10 shrink-0 place-items-center rounded-2xl bg-navy-50 text-navy-800">
              <Icon className="size-5" aria-hidden="true" />
              <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-navy-800 text-[0.6875rem] font-bold text-white">
                {i + 1}
              </span>
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-ink">{title}</h3>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-2">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-navy-50 text-navy-800">
        <Newspaper className="size-7" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold text-navy-800">Nenhuma edição ainda</h3>
      <p className="mt-1.5 max-w-sm text-[0.9375rem] text-ink-2">
        Crie a primeira edição do Boletim do Cobre. Você pode salvar como rascunho e publicar quando estiver pronta.
      </p>
      <Link href="/admin/boletins/novo" className={buttonClass({ variant: "primary", className: "mt-6" })}>
        <Plus className="size-4" aria-hidden="true" />
        Criar primeira edição
      </Link>
    </div>
  );
}
