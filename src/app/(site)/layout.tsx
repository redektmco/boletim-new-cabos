import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { isDemoMode } from "@/lib/db/config";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {isDemoMode() ? (
        <p className="no-print bg-brand-amber px-4 py-2 text-center text-sm font-medium text-navy-900">
          Versão de demonstração: as edições anteriores a 18/09/2026 usam dados fictícios.
        </p>
      ) : null}
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
