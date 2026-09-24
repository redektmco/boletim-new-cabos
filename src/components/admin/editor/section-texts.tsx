"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { labelClass } from "../ui/field";
import { BiasField, TextField } from "./fields";
import { AddItemButton, EmptyList, ItemToolbar } from "./list-controls";
import type { FormValues } from "./sections";

const MAX_SOURCES = 8;

export function DirectionSection() {
  return (
    <>
      <BiasField
        name="direction.bias"
        label="Viés do mercado"
        hint="Aparece em destaque no resumo da semana, com seta e cor (alta = vermelho, baixa = verde)."
      />
      <TextField
        name="direction.summary"
        label="Resumo"
        max={220}
        multiline
        rows={3}
        optional
        placeholder="Ex.: Oferta apertada e estoques baixos sustentam o preço, apesar da demanda chinesa mais fraca."
      />
    </>
  );
}

export function ReadingSection() {
  return (
    <>
      <BiasField name="reading.bias" label="Viés na nossa leitura" />
      <TextField
        name="reading.text"
        label="Texto"
        max={500}
        multiline
        rows={4}
        optional
        placeholder="O que a New Cabos enxerga para as próximas semanas."
      />
    </>
  );
}

export function MessagesSection() {
  return (
    <>
      <TextField
        name="priceImpact"
        label="Impacto no preço"
        max={600}
        multiline
        rows={4}
        optional
        hint="Como o cenário afeta o custo da matéria-prima e o preço do cabo."
      />
      <TextField
        name="clientMessage"
        label="Mensagem para os clientes"
        max={600}
        multiline
        rows={4}
        optional
        hint="Orientação direta para quem compra (ex.: vale antecipar pedidos?). Aparece no bloco “O que isso significa para você”."
      />
    </>
  );
}

export function SourcesSection() {
  const { control, getValues } = useFormContext<FormValues>();
  const { fields, append, remove, move, insert } = useFieldArray({ control, name: "sources" });

  const removeItem = (index: number) => {
    const item = getValues(`sources.${index}`);
    remove(index);
    toast("Fonte removida.", {
      action: {
        label: "Desfazer",
        onClick: () => {
          if (getValues("sources").length >= MAX_SOURCES) return;
          insert(index, item);
        },
      },
    });
  };

  return (
    <>
      <fieldset className="min-w-0">
        <legend className={labelClass}>Fontes</legend>
        <p className="mt-0.5 text-[0.8125rem] text-muted">Aparecem no rodapé do boletim, com link quando houver endereço.</p>
        <div className="mt-3 space-y-3">
          {fields.length === 0 ? <EmptyList>Nenhuma fonte adicionada.</EmptyList> : null}
          <ol className="space-y-3">
            {fields.map((item, index) => (
              <li key={item.id} className="rounded-2xl border border-line bg-wash p-3.5">
                <ItemToolbar itemLabel={`fonte ${index + 1}`} index={index} count={fields.length} onMove={move} onRemove={() => removeItem(index)}>
                  Fonte {index + 1}
                </ItemToolbar>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <TextField name={`sources.${index}.name`} label="Nome" max={80} placeholder="Ex.: LME" />
                  <TextField name={`sources.${index}.url`} label="Endereço (link)" type="url" optional placeholder="https://…" />
                </div>
              </li>
            ))}
          </ol>
          <AddItemButton
            label="Adicionar fonte"
            count={fields.length}
            max={MAX_SOURCES}
            limitLabel={`Máximo de ${MAX_SOURCES} fontes`}
            onClick={() => append({ name: "", url: "" })}
          />
        </div>
      </fieldset>

      <fieldset className="min-w-0 border-t border-line pt-5">
        <legend className="sr-only">Autoria</legend>
        <p className={labelClass} aria-hidden="true">
          Elaborado por
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <TextField name="author.name" label="Nome" max={80} />
          <TextField name="author.role" label="Cargo ou área" max={80} optional placeholder="Ex.: Comercial New Cabos" />
        </div>
      </fieldset>
    </>
  );
}
