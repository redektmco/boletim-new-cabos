import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { buttonClass } from "@/components/admin/ui/button";

export default function BulletinNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-20 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-navy-50 text-navy-800">
        <SearchX className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-4 font-display text-xl font-bold text-navy-800">Edição não encontrada</h1>
      <p className="mt-1.5 text-ink-2">Ela pode ter sido excluída ou o endereço está incorreto.</p>
      <Link href="/admin" className={buttonClass({ variant: "primary", className: "mt-6" })}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para as edições
      </Link>
    </div>
  );
}
