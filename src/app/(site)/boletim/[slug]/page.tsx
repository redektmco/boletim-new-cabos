import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { BulletinView } from "@/components/bulletin/bulletin-view";
import { ShareActions } from "@/components/site/share-actions";
import { WhatsAppIcon } from "@/components/site/social-icons";
import { getPublishedBySlug, listPublished } from "@/lib/bulletins";
import { formatCopper, formatDateCompact, formatDateShort } from "@/lib/bulletin/format";
import { BIAS_LABEL } from "@/lib/bulletin/labels";
import { absoluteUrl, whatsappLink } from "@/lib/site";

export const revalidate = 300;

// Edições existentes são geradas no build; as novas, no primeiro acesso (e revalidadas ao salvar).
export async function generateStaticParams() {
  return (await listPublished()).map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/boletim/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedBySlug(slug);
  if (!data) return { title: "Edição não encontrada" };
  const { content } = data.bulletin;
  const title = `Boletim do Cobre — ${formatDateShort(content.referenceDate)}`;
  const description = `${content.headline} · Cobre ${formatCopper(content.copper.value)}/t · ${BIAS_LABEL[content.direction.bias]}`;
  return {
    title,
    description,
    alternates: { canonical: `/boletim/${slug}` },
    openGraph: { title, description, type: "article", url: `/boletim/${slug}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BulletinPage({ params }: PageProps<"/boletim/[slug]">) {
  const { slug } = await params;
  const data = await getPublishedBySlug(slug);
  if (!data) notFound();
  const { bulletin, newer, older, history } = data;
  const url = absoluteUrl(`/boletim/${bulletin.slug}`);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-4 sm:px-6 md:pt-8">
      <nav aria-label="Navegação" className="no-print mb-4 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-ink">
          Início
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/boletins" className="hover:text-ink">
          Edições
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink-2">{formatDateCompact(bulletin.referenceDate)}</span>
      </nav>

      {/* Marca e link só no PDF/impressão (o cabeçalho do site não é impresso) */}
      <div className="mb-4 hidden items-center justify-between print:flex">
        <Logo />
        <span className="text-xs text-muted">{url}</span>
      </div>

      <BulletinView
        content={bulletin.content}
        history={history}
        editionNumber={bulletin.editionNumber}
        actions={<ShareActions url={url} text={`Boletim do Cobre New Cabos (${formatDateShort(bulletin.referenceDate)}): ${bulletin.headline}`} />}
        clientCta={
          <a
            href={whatsappLink(`Olá! Li o Boletim do Cobre de ${formatDateShort(bulletin.referenceDate)} e gostaria de falar sobre um pedido.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-navy-800 transition-colors hover:bg-brand-amber"
          >
            <WhatsAppIcon className="size-5 text-[#25d366]" />
            Falar com o comercial
          </a>
        }
      />

      <nav aria-label="Outras edições" className="no-print mt-8 grid gap-3 sm:grid-cols-2">
        {older ? (
          <Link href={`/boletim/${older.slug}`} className="card group flex min-w-0 items-center gap-4 p-4 transition-shadow hover:shadow-[var(--shadow-lift)]">
            <ArrowLeft className="size-5 shrink-0 text-muted transition-transform group-hover:-translate-x-0.5" />
            <span className="min-w-0">
              <span className="eyebrow block">Edição anterior · {formatDateCompact(older.referenceDate)}</span>
              <span className="mt-1 block truncate font-medium text-ink">{older.headline}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {newer ? (
          <Link href={`/boletim/${newer.slug}`} className="card group flex min-w-0 items-center justify-end gap-4 p-4 text-right transition-shadow hover:shadow-[var(--shadow-lift)]">
            <span className="min-w-0">
              <span className="eyebrow block">Próxima edição · {formatDateCompact(newer.referenceDate)}</span>
              <span className="mt-1 block truncate font-medium text-ink">{newer.headline}</span>
            </span>
            <ArrowRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
