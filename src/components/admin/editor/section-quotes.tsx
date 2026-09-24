"use client";

import { X } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { labelClass } from "../ui/field";
import { DecimalField, TextField } from "./fields";
import { AddItemButton, EmptyList } from "./list-controls";
import type { FormValues } from "./sections";
import { VariationHint } from "./variation-hint";

const QUOTE_CONFIG = {
  copper: {
    decimals: 2,
    unit: "US$/t",
    placeholder: "14.529,00",
    valueHint: "Cotação de fechamento na data de referência. Pode digitar com ou sem ponto: 14.529,00 ou 14529,00.",
  },
  dollar: {
    decimals: 4,
    unit: "R$",
    placeholder: "5,3421",
    valueHint: "Dólar comercial na data de referência, com até 4 casas decimais.",
  },
} as const;

const MAX_AVERAGES = 3;

export function QuoteSection({ metric }: { metric: "copper" | "dollar" }) {
  const config = QUOTE_CONFIG[metric];
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <DecimalField
          name={`${metric}.value`}
          label="Valor atual"
          decimals={config.decimals}
          unit={config.unit}
          placeholder={config.placeholder}
          hint={config.valueHint}
        />
        <DecimalField
          name={`${metric}.previous`}
          label="Semana anterior"
          decimals={config.decimals}
          unit={config.unit}
          nullable
          optional
          hint="Já vem preenchido com o valor da última edição."
        />
      </div>
      <VariationHint metric={metric} />
      <AveragesEditor metric={metric} />
      <TextField name={`${metric}.source`} label="Fonte" max={120} optional />
    </>
  );
}

function AveragesEditor({ metric }: { metric: "copper" | "dollar" }) {
  const { control, getValues } = useFormContext<FormValues>();
  const { fields, append, remove, insert } = useFieldArray({ control, name: `${metric}.averages` });
  const config = QUOTE_CONFIG[metric];

  const removeRow = (index: number) => {
    const item = getValues(`${metric}.averages.${index}`);
    remove(index);
    toast("Média removida.", {
      action: {
        label: "Desfazer",
        onClick: () => {
          if (!item || (getValues(`${metric}.averages`) ?? []).length >= MAX_AVERAGES) return;
          insert(index, item);
        },
      },
    });
  };

  return (
    <fieldset className="min-w-0">
      <legend className={labelClass}>
        Médias de referência <span className="font-normal text-muted">(opcional, até 3)</span>
      </legend>
      <p className="mt-0.5 text-[0.8125rem] text-muted">Aparecem no quadro abaixo da cotação (ex.: média da semana, do mês atual e do mês anterior).</p>
      <div className="mt-3 space-y-3">
        {fields.length === 0 ? <EmptyList>Nenhuma média adicionada.</EmptyList> : null}
        {fields.map((item, index) => (
          <div key={item.id} className="relative rounded-2xl border border-line bg-wash p-3 pr-11 sm:p-4 sm:pr-12">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField name={`${metric}.averages.${index}.label`} label="Rótulo" max={40} placeholder="Mês atual" />
              <TextField name={`${metric}.averages.${index}.note`} label="Observação" max={40} placeholder="Ex.: setembro" />
              <DecimalField
                name={`${metric}.averages.${index}.value`}
                label="Valor"
                decimals={config.decimals}
                unit={config.unit}
                placeholder={config.placeholder}
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="absolute top-2 right-2 grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-up-bg hover:text-up-ink"
              aria-label={`Remover média ${index + 1}`}
              title="Remover"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        <AddItemButton
          label="Adicionar média"
          count={fields.length}
          max={MAX_AVERAGES}
          limitLabel="Máximo de 3 médias"
          onClick={() => append({ label: "", note: "", value: undefined as unknown as number })}
        />
      </div>
    </fieldset>
  );
}

export function StocksSection() {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <DecimalField
          name="stocks.value"
          label="Estoque atual"
          decimals={0}
          unit="t"
          placeholder="155.575"
          hint="Em toneladas, na data de referência."
        />
        <DecimalField
          name="stocks.previous"
          label="Estoque anterior"
          decimals={0}
          unit="t"
          nullable
          optional
          hint="Já vem preenchido com o valor da última edição."
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="stocks.previousDate" label="Data do estoque anterior" type="date" optional />
      </div>
      <VariationHint metric="stocks" />
      <p className="-mt-2 text-[0.8125rem] text-muted">
        Para estoques, a leitura é invertida: estoque subindo alivia o preço (verde); caindo, pressiona (vermelho).
      </p>
      <TextField name="stocks.source" label="Fonte" max={120} optional />
    </>
  );
}
