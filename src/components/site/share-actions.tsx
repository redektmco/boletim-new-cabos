"use client";

import { Check, Link2, Printer } from "lucide-react";
import { useState } from "react";
import { LinkedInIcon, WhatsAppIcon } from "./social-icons";

const button =
  "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-white";

export function ShareActions({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copie o link do boletim:", url);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${button} bg-[#25d366] text-[#063b1c] hover:bg-[#3ee07a]`}
      >
        <WhatsAppIcon className="size-4" />
        Enviar no WhatsApp
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${button} bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20`}
        aria-label="Compartilhar no LinkedIn"
      >
        <LinkedInIcon className="size-4" />
        <span className="hidden sm:inline">LinkedIn</span>
      </a>
      <button type="button" onClick={copy} className={`${button} bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20`}>
        {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
        {copied ? "Link copiado" : "Copiar link"}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className={`${button} bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20`}
      >
        <Printer className="size-4" />
        <span className="hidden sm:inline">Imprimir / PDF</span>
      </button>
    </div>
  );
}
