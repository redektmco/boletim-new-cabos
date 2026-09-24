"use client";

import { clsx } from "clsx";
import { ExternalLink, LogOut, Newspaper, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/(panel)/actions";
import { Logo } from "@/components/brand/logo";

type PanelHeaderProps = {
  user: { name: string; role: "admin" | "editor" };
};

export function PanelHeader({ user }: PanelHeaderProps) {
  const pathname = usePathname();
  const nav = [
    { href: "/admin", label: "Edições", icon: Newspaper, active: pathname === "/admin" || pathname.startsWith("/admin/boletins") },
    user.role === "admin"
      ? { href: "/admin/usuarios", label: "Usuários", icon: Users, active: pathname.startsWith("/admin/usuarios") }
      : null,
    { href: "/admin/conta", label: "Minha conta", shortLabel: "Conta", icon: UserRound, active: pathname.startsWith("/admin/conta") },
  ].filter((item) => item !== null);

  return (
    <header className="no-print bg-navy-900 text-white">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6">
        <Link href="/admin" className="flex shrink-0 items-center gap-3" aria-label="Painel do Boletim do Cobre — edições">
          <Logo tone="light" />
          <span className="hidden border-l border-white/20 pl-3 text-[0.6875rem] leading-tight font-semibold tracking-[0.12em] text-white/60 uppercase sm:block">
            Painel do
            <br />
            Boletim
          </span>
        </Link>

        <nav aria-label="Painel" className="ml-4 hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:inline-flex"
          >
            Ver site
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
          <span className="hidden max-w-48 truncate border-l border-white/15 pl-3 text-sm text-white/80 sm:block" title={user.name}>
            {user.name}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sair
            </button>
          </form>
        </div>
      </div>

      <nav aria-label="Painel" className="border-t border-white/10 md:hidden">
        <div className="mx-auto flex max-w-[1600px] gap-1 px-2 py-1.5">
          {nav.map((item) => (
            <NavLink key={item.href} {...item} compact />
          ))}
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  label,
  shortLabel,
  icon: Icon,
  active,
  compact,
}: {
  href: string;
  label: string;
  shortLabel?: string;
  icon: typeof Newspaper;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full text-sm font-medium transition-colors",
        compact ? "flex-1 justify-center px-2 py-1.5" : "px-3.5 py-2",
        active ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/8 hover:text-white",
      )}
    >
      <Icon className={clsx("size-4 shrink-0", active ? "text-brand-amber" : "")} aria-hidden="true" />
      {compact && shortLabel ? shortLabel : label}
    </Link>
  );
}
