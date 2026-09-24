"use client";

import { TriangleAlert } from "lucide-react";
import { useWatch } from "react-hook-form";
import { formatDateLong, formatDateShort } from "@/lib/bulletin/format";
import type { HistoryPoint } from "@/lib/bulletin/types";
import { CoverImageField } from "./cover-image-field";
import { TextField } from "./fields";
import type { FormValues } from "./sections";

export function IdentificationSection({ history, currentSlug }: { history: HistoryPoint[]; currentSlug?: string }) {
  const referenceDate = useWatch<FormValues, "referenceDate">({ name: "referenceDate" });
  const clash = referenceDate ? history.find((h) => h.referenceDate === referenceDate && h.slug !== currentSlug) : undefined;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="referenceDate"
          label="Data de referência"
          type="date"
          hint={
            clash ? (
              <span className="flex items-start gap-1.5 text-copper-700">
                <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                Já existe outra edição com a data {formatDateShort(clash.referenceDate)}. Confira se não é a mesma semana.
              </span>
            ) : referenceDate ? (
              `Dados de ${formatDateLong(referenceDate)}. Define o endereço da edição no site.`
            ) : (
              "Dia das cotações usadas nesta edição."
            )
          }
        />
      </div>
      <TextField
        name="headline"
        label="Manchete"
        max={140}
        multiline
        rows={2}
        placeholder="Ex.: Cobre sobe com estoques em queda e dólar firme"
        hint="Frase curta que resume a semana. Aparece nos cards e no WhatsApp."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="title" label="Título" max={80} hint="Nome do boletim no topo da página." />
        <TextField name="subtitle" label="Subtítulo" max={80} optional />
      </div>
      <TextField
        name="intro"
        label="Texto de abertura"
        max={280}
        multiline
        rows={3}
        optional
        hint="Uma ou duas frases abaixo da manchete."
      />
      <CoverImageField />
    </>
  );
}
