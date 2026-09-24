import { TriangleAlert } from "lucide-react";

/** Faixa exibida no painel quando o site roda sem banco gravável (modo demonstração). */
export function DemoModeBanner() {
  return (
    <div role="status" className="border-b border-[#f5d77a] bg-[#fffbeb] px-4 py-2.5 text-center text-sm text-[#7a5200] sm:px-6">
      <span className="inline-flex items-start gap-2 text-left">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          <strong className="font-semibold">Modo demonstração:</strong> conecte o banco de dados (Turso) na Vercel para salvar
          alterações.
        </span>
      </span>
    </div>
  );
}
