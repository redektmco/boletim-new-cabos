import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { site, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./social-icons";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/boletins", label: "Edições" },
  { href: "/#historico", label: "Histórico" },
  { href: site.links.website, label: "New Cabos", external: true },
];

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-line/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Boletim do Cobre — início">
          <Logo />
          <span className="hidden border-l border-line pl-3 text-[0.6875rem] leading-tight font-semibold tracking-[0.12em] text-muted uppercase sm:block">
            Boletim
            <br />
            do Cobre
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-3 py-2 text-sm text-ink-2 transition-colors hover:bg-canvas hover:text-ink"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm text-ink-2 transition-colors hover:bg-canvas hover:text-ink"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <a
          href={whatsappLink("Olá! Vi o Boletim do Cobre e gostaria de falar com o comercial da New Cabos.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-700"
        >
          <WhatsAppIcon className="size-4" />
          <span className="hidden sm:inline">Falar com o comercial</span>
          <span className="sm:hidden">Comercial</span>
        </a>
      </div>
    </header>
  );
}
