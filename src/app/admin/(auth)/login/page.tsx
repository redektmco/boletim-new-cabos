import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ChartLine, Clock, Send } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "@/components/admin/login-form";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Entrar",
};

const HIGHLIGHTS = [
  { icon: Clock, text: "Nova edição já vem preenchida com os dados da semana anterior." },
  { icon: ChartLine, text: "Pré-visualização ao vivo, igual ao que o cliente vê." },
  { icon: Send, text: "Publicou, está no site — pronto para enviar no WhatsApp." },
];

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/admin");

  return (
    <main className="grid min-h-dvh flex-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="copper-wires relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex xl:p-14">
        <Logo tone="light" />
        <div className="max-w-md">
          <p className="text-xs font-semibold tracking-[0.16em] text-copper-300 uppercase">Painel editorial</p>
          <h1 className="mt-3 font-display text-4xl leading-tight font-bold tracking-tight text-balance">
            Boletim do Cobre
          </h1>
          <p className="mt-4 text-white/75">
            Atualize os números, revise os textos e publique a edição da semana em poucos minutos.
          </p>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-white/85">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/10 text-brand-amber ring-1 ring-white/15">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="pt-1.5">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/50">New Cabos · Cabos de energia fotovoltaica</p>
      </aside>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <Logo />
            <span className="border-l border-line pl-3 text-[0.6875rem] leading-tight font-semibold tracking-[0.12em] text-muted uppercase">
              Boletim
              <br />
              do Cobre
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-navy-800">Entrar no painel</h2>
          <p className="mt-1.5 text-[0.9375rem] text-ink-2">Use o e-mail e a senha cadastrados para você.</p>
          <div className="mt-8">
            <LoginForm />
          </div>
          <p className="mt-8 text-sm text-muted">
            Esqueceu a senha? Peça a um administrador do painel para redefini-la.
          </p>
          <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Voltar ao site
          </Link>
        </div>
      </div>
    </main>
  );
}
