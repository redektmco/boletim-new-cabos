"use client";

import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import { useController, useFormContext, type FieldPath } from "react-hook-form";
import type { ReactNode } from "react";
import { MovementIcon } from "@/components/bulletin/pressure";
import { TopicIcon } from "@/components/bulletin/topic-icon";
import { BIAS_SHORT, TOPIC_LABEL } from "@/lib/bulletin/labels";
import { topicIconSchema, type Bias, type Pressure, type TopicIcon as TopicIconName } from "@/lib/bulletin/schema";
import { CharCount, describedBy, FieldShell, inputClass, labelClass } from "../ui/field";
import { DecimalInput } from "./decimal-input";
import { fieldId, type FormValues } from "./sections";
import { Segmented, type SegmentedOption } from "../ui/segmented";

type Name = FieldPath<FormValues>;

type TextFieldProps = {
  name: Name;
  label: ReactNode;
  hint?: ReactNode;
  max?: number;
  placeholder?: string;
  optional?: boolean;
  multiline?: boolean;
  rows?: number;
  type?: "text" | "date" | "url";
  className?: string;
};

export function TextField({
  name,
  label,
  hint,
  max,
  placeholder,
  optional,
  multiline,
  rows = 3,
  type = "text",
  className,
}: TextFieldProps) {
  const { control } = useFormContext<FormValues>();
  const {
    field: { ref, value: rawValue, onChange, onBlur },
    fieldState,
  } = useController({ control, name });
  const id = fieldId(name);
  const value = typeof rawValue === "string" ? rawValue : "";
  const error = fieldState.error?.message;
  const common = {
    id,
    name,
    ref,
    value,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
    onBlur,
    placeholder,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy(id, { error, hint }),
  } as const;

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      className={className}
      aside={max ? <CharCount value={value} max={max} /> : null}
    >
      {multiline ? (
        <textarea {...common} rows={rows} className={clsx(inputClass, "field-sizing-content resize-y leading-relaxed")} />
      ) : (
        <input {...common} type={type} className={inputClass} />
      )}
    </FieldShell>
  );
}

type DecimalFieldProps = {
  name: Name;
  label: ReactNode;
  hint?: ReactNode;
  decimals: number;
  unit?: string;
  nullable?: boolean;
  optional?: boolean;
  placeholder?: string;
  className?: string;
};

export function DecimalField({ name, label, hint, decimals, unit, nullable, optional, placeholder, className }: DecimalFieldProps) {
  const { control } = useFormContext<FormValues>();
  const {
    field: { ref, value, onChange, onBlur },
    fieldState,
  } = useController({ control, name });
  const id = fieldId(name);
  const error = fieldState.error?.message;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <div className="relative">
        <DecimalInput
          id={id}
          name={name}
          ref={ref}
          value={value as number | null | undefined}
          onChange={onChange}
          onBlur={onBlur}
          decimals={decimals}
          nullable={nullable}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { error, hint })}
          className={clsx(inputClass, "font-medium tabular-nums", unit && "pr-16")}
        />
        {unit ? (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-muted" aria-hidden="true">
            {unit}
          </span>
        ) : null}
      </div>
    </FieldShell>
  );
}

const BIAS_OPTIONS: SegmentedOption<Bias>[] = [
  { value: "alta", label: BIAS_SHORT.alta, tone: "up", icon: <MovementIcon movement="up" className="size-3.5" /> },
  { value: "lateral", label: BIAS_SHORT.lateral, tone: "flat", icon: <MovementIcon movement="flat" className="size-3.5" /> },
  { value: "baixa", label: BIAS_SHORT.baixa, tone: "down", icon: <MovementIcon movement="down" className="size-3.5" /> },
];

const PRESSURE_OPTIONS: SegmentedOption<Pressure>[] = [
  { value: "alta", label: "Alta", tone: "up", icon: <MovementIcon movement="up" className="size-3.5" /> },
  { value: "neutro", label: "Neutro", tone: "flat", icon: <MovementIcon movement="flat" className="size-3.5" /> },
  { value: "baixa", label: "Baixa", tone: "down", icon: <MovementIcon movement="down" className="size-3.5" /> },
];

export function BiasField({ name, label, hint }: { name: Name; label: string; hint?: ReactNode }) {
  const { control } = useFormContext<FormValues>();
  const { field, fieldState } = useController({ control, name });
  const id = fieldId(name);
  return (
    <div>
      <p id={`${id}-label`} className={clsx(labelClass, "mb-1.5")}>
        {label}
      </p>
      <Segmented
        id={id}
        labelledBy={`${id}-label`}
        value={field.value as Bias}
        onChange={field.onChange}
        options={BIAS_OPTIONS}
        invalid={!!fieldState.error}
        className="w-full sm:w-auto"
      />
      {hint ? <p className="mt-1.5 text-[0.8125rem] leading-snug text-muted">{hint}</p> : null}
    </div>
  );
}

export function PressureField({ name, label }: { name: Name; label: string }) {
  const { control } = useFormContext<FormValues>();
  const { field } = useController({ control, name });
  const id = fieldId(name);
  return (
    <div>
      <p id={`${id}-label`} className={clsx(labelClass, "mb-1.5")}>
        {label}
      </p>
      <Segmented
        id={id}
        labelledBy={`${id}-label`}
        value={field.value as Pressure}
        onChange={field.onChange}
        options={PRESSURE_OPTIONS}
        size="sm"
        className="w-full"
      />
    </div>
  );
}

const ICON_OPTIONS = topicIconSchema.options;

/** Seletor de ícone: o ícone escolhido aparece ao lado do nome do tema. */
export function IconSelectField({ name, label = "Ícone" }: { name: Name; label?: string }) {
  const { control } = useFormContext<FormValues>();
  const {
    field: { ref, value: rawValue, onChange, onBlur },
  } = useController({ control, name });
  const id = fieldId(name);
  const value = (rawValue as TopicIconName | undefined) ?? "outro";
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={clsx(labelClass, "mb-1.5")}>
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-2 my-auto grid size-7 place-items-center rounded-full bg-navy-800 text-white">
          <TopicIcon name={value} className="size-3.5" />
        </span>
        <select
          id={id}
          name={name}
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={clsx(inputClass, "appearance-none truncate pr-9 pl-11")}
        >
          {ICON_OPTIONS.map((icon) => (
            <option key={icon} value={icon}>
              {TOPIC_LABEL[icon]}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-muted" aria-hidden="true" />
      </div>
    </div>
  );
}
