"use client";

import { clsx } from "clsx";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useController, useFieldArray, useFormContext, useFormState } from "react-hook-form";
import { toast } from "sonner";
import { CharCount, FieldError, inputClass } from "../ui/field";
import { IconSelectField, PressureField, TextField } from "./fields";
import { AddItemButton, EmptyList, ItemToolbar } from "./list-controls";
import { fieldId, type FormValues } from "./sections";

const MAX_NEWS = 8;
const MAX_FACTORS = 6;
const MAX_THERMOMETER = 10;

export function NewsSection() {
  const { control, getValues } = useFormContext<FormValues>();
  const { fields, append, remove, move, insert } = useFieldArray({ control, name: "news" });

  const removeItem = (index: number) => {
    const item = getValues(`news.${index}`);
    remove(index);
    toast("Notícia removida.", {
      action: {
        label: "Desfazer",
        onClick: () => {
          if (getValues("news").length >= MAX_NEWS) return;
          insert(index, item);
        },
      },
    });
  };

  return (
    <>
      {fields.length === 0 ? <EmptyList>Nenhuma notícia ainda. Adicione as principais notícias da semana.</EmptyList> : null}
      <ol className="space-y-4">
        {fields.map((item, index) => (
          <li key={item.id} className="rounded-2xl border border-line bg-wash p-3.5 sm:p-4">
            <ItemToolbar itemLabel={`notícia ${index + 1}`} index={index} count={fields.length} onMove={move} onRemove={() => removeItem(index)}>
              Notícia {index + 1}
            </ItemToolbar>
            <div className="mt-2 grid gap-4">
              <IconSelectField name={`news.${index}.icon`} label="Tema (ícone)" />
              <TextField name={`news.${index}.title`} label="Título" max={60} placeholder="Ex.: China reduz importações" />
              <TextField
                name={`news.${index}.text`}
                label="Texto"
                max={320}
                multiline
                rows={3}
                placeholder="Resumo em duas ou três frases: o que aconteceu e por que importa para o cobre."
              />
            </div>
          </li>
        ))}
      </ol>
      <AddItemButton
        label="Adicionar notícia"
        count={fields.length}
        max={MAX_NEWS}
        limitLabel={`Máximo de ${MAX_NEWS} notícias`}
        onClick={() => append({ icon: "cobre", title: "", text: "" })}
      />
    </>
  );
}

export function FactorsSection() {
  return (
    <div className="grid gap-5">
      <FactorList name="factorsUp" tone="up" />
      <FactorList name="factorsDown" tone="down" />
    </div>
  );
}

/** Lista de frases (fatores de alta/baixa). Usa um único campo com o array inteiro. */
function FactorList({ name, tone }: { name: "factorsUp" | "factorsDown"; tone: "up" | "down" }) {
  const { control, getValues } = useFormContext<FormValues>();
  const { field } = useController({ control, name });
  const { errors } = useFormState({ control, name });
  const items = Array.isArray(field.value) ? (field.value as string[]) : [];
  const itemErrors = errors[name] as unknown as ({ message?: string } | undefined)[] | undefined;
  const up = tone === "up";
  const title = up ? "Fatores de alta" : "Fatores de baixa";
  const singular = up ? "fator de alta" : "fator de baixa";

  const set = (next: string[]) => field.onChange(next);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    set(next);
  };
  const removeAt = (index: number) => {
    const removed = items[index];
    set(items.filter((_, i) => i !== index));
    toast("Fator removido.", {
      action: {
        label: "Desfazer",
        onClick: () => {
          const current = getValues(name) ?? [];
          if (current.length >= MAX_FACTORS) return;
          const next = [...current];
          next.splice(index, 0, removed);
          field.onChange(next);
        },
      },
    });
  };

  return (
    <fieldset
      className={clsx("min-w-0 rounded-2xl p-3.5 ring-1 ring-inset sm:p-4", up ? "bg-up-bg/50 ring-up-line/70" : "bg-down-bg/50 ring-down-line/70")}
    >
      <legend className="sr-only">{title}</legend>
      <p className={clsx("flex items-center gap-2 font-display text-sm font-bold uppercase", up ? "text-up-ink" : "text-down-ink")} aria-hidden="true">
        <span className={clsx("grid size-6 place-items-center rounded-full text-white", up ? "bg-up" : "bg-down")}>
          {up ? <ArrowUp className="size-3.5" strokeWidth={2.5} /> : <ArrowDown className="size-3.5" strokeWidth={2.5} />}
        </span>
        {title}
      </p>
      <p className="mt-1 text-[0.8125rem] text-ink-2">
        {up ? "O que pode fazer o preço do cobre subir." : "O que pode fazer o preço do cobre cair."}
      </p>
      {items.length === 0 ? <p className="mt-3 text-sm text-muted">Nenhum fator listado.</p> : null}
      <ol className="mt-3 space-y-3">
        {items.map((text, index) => {
          const id = fieldId(`${name}.${index}`);
          const error = itemErrors?.[index]?.message;
          return (
            <li key={index} className="rounded-xl bg-white p-2.5 shadow-xs ring-1 ring-line">
              <ItemToolbar itemLabel={`${singular} ${index + 1}`} index={index} count={items.length} onMove={move} onRemove={() => removeAt(index)}>
                <label htmlFor={id}>
                  {up ? "Alta" : "Baixa"} {index + 1}
                </label>
              </ItemToolbar>
              <textarea
                id={id}
                rows={2}
                value={text}
                onChange={(e) => set(items.map((v, i) => (i === index ? e.target.value : v)))}
                onBlur={field.onBlur}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                placeholder={up ? "Ex.: Estoques da LME em queda" : "Ex.: Demanda chinesa mais fraca"}
                className={clsx(inputClass, "field-sizing-content mt-1 resize-y leading-relaxed")}
              />
              <div className="mt-1 flex items-start justify-between gap-3">
                <div className="min-w-0">{error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}</div>
                <CharCount value={text} max={140} />
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-3">
        <AddItemButton
          label={`Adicionar ${singular}`}
          count={items.length}
          max={MAX_FACTORS}
          limitLabel={`Máximo de ${MAX_FACTORS} fatores`}
          onClick={() => set([...items, ""])}
        />
      </div>
    </fieldset>
  );
}

export function ThermometerSection() {
  const { control, getValues } = useFormContext<FormValues>();
  const { fields, append, remove, move, insert } = useFieldArray({ control, name: "thermometer" });

  const removeItem = (index: number) => {
    const item = getValues(`thermometer.${index}`);
    remove(index);
    toast("Indicador removido.", {
      action: {
        label: "Desfazer",
        onClick: () => {
          if (getValues("thermometer").length >= MAX_THERMOMETER) return;
          insert(index, item);
        },
      },
    });
  };

  return (
    <>
      {fields.length === 0 ? <EmptyList>Nenhum indicador. Adicione os fatores que você acompanha.</EmptyList> : null}
      <ol className="space-y-4">
        {fields.map((item, index) => (
          <li key={item.id} className="rounded-2xl border border-line bg-wash p-3.5 sm:p-4">
            <ItemToolbar
              itemLabel={`indicador ${index + 1}`}
              index={index}
              count={fields.length}
              onMove={move}
              onRemove={() => removeItem(index)}
            >
              Indicador {index + 1}
            </ItemToolbar>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <TextField name={`thermometer.${index}.indicator`} label="Indicador" max={40} placeholder="Ex.: Demanda China" />
              <IconSelectField name={`thermometer.${index}.icon`} label="Ícone" />
              <TextField name={`thermometer.${index}.situation`} label="Situação" max={40} placeholder="Ex.: Enfraquecendo" />
              <PressureField name={`thermometer.${index}.impact`} label="Impacto no preço" />
            </div>
          </li>
        ))}
      </ol>
      <AddItemButton
        label="Adicionar indicador"
        count={fields.length}
        max={MAX_THERMOMETER}
        limitLabel={`Máximo de ${MAX_THERMOMETER} indicadores`}
        onClick={() => append({ icon: "outro", indicator: "", situation: "", impact: "neutro" })}
      />
    </>
  );
}
