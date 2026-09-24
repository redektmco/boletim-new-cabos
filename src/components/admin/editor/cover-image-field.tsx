"use client";

import { clsx } from "clsx";
import { ImagePlus, Link2, Trash, Upload } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { useController, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Button, Spinner } from "../ui/button";
import { describedBy, FieldError, inputClass, labelClass } from "../ui/field";
import { fieldId, type FormValues } from "./sections";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 4 * 1024 * 1024;

/** Imagem de capa: envio pelo /api/upload (arrastar ou escolher arquivo) ou endereço colado. */
export function CoverImageField() {
  const { control } = useFormContext<FormValues>();
  const {
    field: { ref, value, onChange, onBlur },
    fieldState,
  } = useController({ control, name: "coverImageUrl" });
  const id = fieldId("coverImageUrl");
  const url = typeof value === "string" ? value : "";
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [broken, setBroken] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const error = fieldState.error?.message;
  const hint = "Opcional. Foto de fundo do cabeçalho — JPG, PNG, WebP ou AVIF de até 4 MB, de preferência horizontal. Sem imagem, o site usa o fundo padrão com fios de cobre.";

  const upload = async (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Formato não aceito. Use uma imagem JPG, PNG, WebP ou AVIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("A imagem tem mais de 4 MB. Reduza o tamanho e tente de novo.");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Não foi possível enviar a imagem. Tente novamente.");
        return;
      }
      onChange(data.url);
      setBroken(null);
      toast.success("Imagem de capa enviada.");
    } catch {
      toast.error("Sem conexão com o servidor. Verifique sua internet e tente de novo.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void upload(file);
  };

  return (
    <div>
      <p className={clsx(labelClass, "mb-1.5")} id={`${id}-label`}>
        Imagem de capa <span className="font-normal text-muted">(opcional)</span>
      </p>

      {url ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-wash">
          <div className="relative aspect-[3/1] bg-navy-900">
            {broken === url ? (
              <div className="absolute inset-0 grid place-items-center p-4 text-center text-sm text-white/80">
                Não foi possível carregar esta imagem. Confira o endereço.
              </div>
            ) : (
              // Endereço pode ser de qualquer domínio (colado pela pessoa), por isso <img> simples.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="Prévia da imagem de capa" className="absolute inset-0 size-full object-cover" onError={() => setBroken(url)} />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 p-3">
            <p className="min-w-0 flex-1 truncate text-xs text-muted" title={url}>
              {url}
            </p>
            <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()} loading={uploading} icon={<Upload className="size-3.5" aria-hidden="true" />}>
              Trocar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onChange("")}
              icon={<Trash className="size-3.5" aria-hidden="true" />}
              className="text-up-ink hover:bg-up-bg hover:text-up-ink"
            >
              Remover
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={clsx(
            "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors",
            dragging ? "border-brand-blue bg-brand-blue/5" : "border-line-strong bg-wash",
          )}
        >
          {uploading ? (
            <>
              <Spinner className="size-6 text-brand-blue" />
              <p className="text-sm font-medium text-ink-2">Enviando imagem…</p>
            </>
          ) : (
            <>
              <span className="grid size-10 place-items-center rounded-full bg-white text-navy-700 shadow-xs">
                <ImagePlus className="size-5" aria-hidden="true" />
              </span>
              <p className="text-sm text-ink-2">
                Arraste uma imagem para cá ou{" "}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="font-semibold text-brand-blue underline-offset-4 hover:underline"
                >
                  escolha um arquivo
                </button>
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />

      <div className="mt-2">
        {showUrlInput || (url && !url.startsWith("/uploads/") && !url.includes("blob.vercel-storage.com")) ? (
          <div>
            <label htmlFor={id} className="mb-1 block text-xs font-medium text-ink-2">
              Endereço da imagem
            </label>
            <input
              id={id}
              ref={ref}
              type="url"
              inputMode="url"
              value={url}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              placeholder="https://…"
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy(id, { error, hint })}
              className={inputClass}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-2 hover:text-ink"
          >
            <Link2 className="size-3.5" aria-hidden="true" />
            Ou colar o endereço de uma imagem
          </button>
        )}
      </div>
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
      <p id={`${id}-hint`} className="mt-1.5 text-[0.8125rem] leading-snug text-muted">
        {hint}
      </p>
    </div>
  );
}
