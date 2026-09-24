import { Spinner } from "@/components/admin/ui/button";

export default function PanelLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24" role="status">
      <Spinner className="size-6 text-navy-700" />
      <span className="ml-3 text-sm text-ink-2">Carregando…</span>
    </div>
  );
}
