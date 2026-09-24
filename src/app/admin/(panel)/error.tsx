"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { buttonClass } from "@/components/admin/ui/button";

export default function PanelError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-20 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-up-bg text-up">
        <TriangleAlert className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-4 font-display text-xl font-bold text-navy-800">Algo deu errado</h1>
      <p className="mt-1.5 text-ink-2">Não foi possível carregar esta página. Tente de novo em instantes.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => retry()} className={buttonClass({ variant: "primary" })}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Tentar novamente
        </button>
        <Link href="/admin" className={buttonClass({ variant: "secondary" })}>
          Voltar para as edições
        </Link>
      </div>
    </div>
  );
}
