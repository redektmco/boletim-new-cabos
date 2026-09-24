import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { site, whatsappLink } from "@/lib/site";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "./social-icons";

export function SiteFooter() {
  return (
    <footer className="no-print mt-20 bg-navy-950 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="copper-wires relative -translate-y-10 overflow-hidden rounded-[var(--radius-card)] px-6 py-10 md:flex md:items-center md:justify-between md:gap-10 md:px-10">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.16em] text-copper-300 uppercase">Planejando a próxima compra?</p>
            <h2 className="mt-3 font-display text-2xl leading-tight font-bold md:text-3xl">
              Fale com o time comercial e garanta os cabos do seu projeto no melhor momento.
            </h2>
          </div>
          <a
            href={whatsappLink("Olá! Vi o Boletim do Cobre e gostaria de um orçamento de cabos fotovoltaicos.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-navy-800 transition-colors hover:bg-brand-amber md:mt-0"
          >
            <WhatsAppIcon className="size-5 text-[#25d366]" />
            Pedir orçamento
          </a>
        </div>

        <div className="grid gap-10 pb-10 md:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Indústria de cabos solares fotovoltaicos em Sorocaba-SP. O Boletim do Cobre resume toda semana o que move o
              preço da nossa principal matéria-prima.
            </p>
            <div className="mt-5 flex gap-2">
              <a href={site.links.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram da New Cabos" className="grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                <InstagramIcon className="size-4" />
              </a>
              <a href={site.links.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook da New Cabos" className="grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                <FacebookIcon className="size-4" />
              </a>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp da New Cabos" className="grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                <WhatsAppIcon className="size-4" />
              </a>
            </div>
          </div>

          <FooterColumn title="Boletim">
            <li><Link href="/" className="hover:text-white">Última edição</Link></li>
            <li><Link href="/boletins" className="hover:text-white">Todas as edições</Link></li>
            <li><Link href="/#historico" className="hover:text-white">Histórico de preços</Link></li>
          </FooterColumn>

          <FooterColumn title="New Cabos">
            <li><a href={site.links.website} target="_blank" rel="noopener noreferrer" className="hover:text-white">Site institucional</a></li>
            <li><a href={`${site.links.website}/sobre`} target="_blank" rel="noopener noreferrer" className="hover:text-white">Sobre a empresa</a></li>
            <li><Link href="/admin" className="hover:text-white">Área do colaborador</Link></li>
          </FooterColumn>

          <FooterColumn title="Contato">
            <li className="flex gap-2"><Phone className="mt-0.5 size-4 shrink-0 text-white/40" aria-hidden="true" />{site.phones.join(" · ")}</li>
            <li className="flex gap-2"><Mail className="mt-0.5 size-4 shrink-0 text-white/40" aria-hidden="true" /><a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></li>
            <li className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-white/40" aria-hidden="true" />{site.address}</li>
          </FooterColumn>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-white/40 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} New Cabos Ltda. Todos os direitos reservados.</p>
          <p>Conteúdo informativo. Não constitui recomendação de investimento.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold tracking-[0.14em] text-white/40 uppercase">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm text-white/70">{children}</ul>
    </div>
  );
}
