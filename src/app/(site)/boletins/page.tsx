import type { Metadata } from "next";
import { EditionsBrowser } from "@/components/site/editions-browser";
import { listPublished } from "@/lib/bulletins";
import { toSummary } from "@/lib/bulletin/summary";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Todas as edições",
  description: "Arquivo com todas as edições do Boletim do Cobre da New Cabos.",
  alternates: { canonical: "/boletins" },
};

export default async function EditionsPage() {
  const editions = (await listPublished()).map(toSummary);
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 md:pt-16">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <p className="eyebrow">Arquivo</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">Todas as edições</h1>
        <p className="mt-4 text-ink-2">
          {editions.length} {editions.length === 1 ? "edição publicada" : "edições publicadas"}. Filtre pela leitura do mercado
          em cada semana.
        </p>
      </div>
      <EditionsBrowser editions={editions} />
    </div>
  );
}
