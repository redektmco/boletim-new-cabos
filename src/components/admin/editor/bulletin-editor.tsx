"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { clsx } from "clsx";
import {
  ArrowLeft,
  ChevronsDownUp,
  ChevronsUpDown,
  CircleCheck,
  CopyPlus,
  Ellipsis,
  ExternalLink,
  EyeOff,
  Rocket,
  Save,
  Sparkles,
  Trash,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState, useTransition, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { FormProvider, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { deleteBulletinAction, saveBulletinAction, setBulletinStatusAction } from "@/app/admin/(panel)/boletins/actions";
import { savedLabel } from "@/lib/admin/format";
import { zodErrorPtBR } from "@/lib/admin/zod";
import { formatDateShort } from "@/lib/bulletin/format";
import { bulletinContentSchema, type BulletinContent, type BulletinStatus } from "@/lib/bulletin/schema";
import type { HistoryPoint } from "@/lib/bulletin/types";
import { Button, buttonClass, Spinner } from "../ui/button";
import { useConfirm } from "../ui/confirm";
import { Menu, type MenuItem } from "../ui/menu";
import { StatusBadge } from "../ui/status-badge";
import { LivePreview } from "./live-preview";
import { SectionCard } from "./section-card";
import { IdentificationSection } from "./section-identification";
import { FactorsSection, NewsSection, ThermometerSection } from "./section-lists";
import { QuoteSection, StocksSection } from "./section-quotes";
import { DirectionSection, MessagesSection, ReadingSection, SourcesSection } from "./section-texts";
import { ALL_SECTION_IDS, fieldId, SECTIONS, sectionsWithErrors, type FormValues, type SectionId } from "./sections";

export type BulletinEditorProps = {
  /** Ausente em uma edição nova (ainda não salva). */
  bulletinId?: number;
  initialStatus: BulletinStatus;
  initialSlug?: string;
  /** ISO da última gravação. */
  initialUpdatedAt?: string;
  initialValues: FormValues;
  history: HistoryPoint[];
  /** Edição usada como ponto de partida (nova edição / duplicar). */
  basedOn?: { referenceDate: string; duplicate: boolean } | null;
  /** Rascunho mais recente já existente, para evitar duas edições da mesma semana. */
  existingDraft?: { id: number; referenceDate: string } | null;
};

type PendingKind = "save" | "publish" | "unpublish" | "delete";

export function BulletinEditor({
  bulletinId,
  initialStatus,
  initialSlug,
  initialUpdatedAt,
  initialValues,
  history,
  basedOn,
  existingDraft,
}: BulletinEditorProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const methods = useForm<FormValues, unknown, BulletinContent>({
    resolver: zodResolver(bulletinContentSchema, { error: zodErrorPtBR }),
    defaultValues: initialValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
  });
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { isDirty, errors },
  } = methods;
  const watchedDate = useWatch({ control, name: "referenceDate" });

  const [id, setId] = useState(bulletinId);
  const [status, setStatus] = useState<BulletinStatus>(initialStatus);
  const [slug, setSlug] = useState(initialSlug);
  const [savedAt, setSavedAt] = useState(initialUpdatedAt);
  const [openSections, setOpenSections] = useState<Set<SectionId>>(() => new Set(ALL_SECTION_IDS));
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [pendingKind, setPendingKind] = useState<PendingKind | null>(null);
  const [isPending, startTransition] = useTransition();

  const busy = isPending || pendingKind !== null;
  const published = status === "published";
  const errorSections = sectionsWithErrors(errors);
  const dateShort = formatDateShort(watchedDate || initialValues.referenceDate);
  const siteUrl = slug ? `/boletim/${slug}` : null;

  // ---------------------------------------------------------------------------
  // Navegação entre seções e foco no primeiro erro
  // ---------------------------------------------------------------------------

  const openAndScrollTo = (sectionIds: SectionId[], targetId?: string) => {
    flushSync(() => {
      setTab("edit");
      setOpenSections((prev) => new Set([...prev, ...sectionIds]));
    });
    const target = (targetId && document.getElementById(targetId)) || document.getElementById(`secao-${sectionIds[0]}`);
    if (!target) return;
    if (targetId && target.id === targetId) target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: "smooth", block: targetId ? "center" : "start" });
  };

  const onInvalid = (formErrors: FieldErrors<FormValues>) => {
    const broken = sectionsWithErrors(formErrors);
    const path = firstErrorPath(formErrors);
    toast.error("Revise os campos destacados", {
      description: broken.length
        ? `Há campos a corrigir em: ${broken.map((s) => SECTIONS.find((d) => d.id === s)?.short).join(", ")}.`
        : undefined,
    });
    if (broken.length) openAndScrollTo(broken, path ? fieldId(path) : undefined);
  };

  const toggleAll = () => {
    setOpenSections((prev) => (prev.size === ALL_SECTION_IDS.length ? new Set() : new Set(ALL_SECTION_IDS)));
  };

  // ---------------------------------------------------------------------------
  // Salvar / publicar / despublicar / excluir
  // ---------------------------------------------------------------------------

  const persist = (target: BulletinStatus, kind: "save" | "publish") => {
    if (busy) return;
    void handleSubmit(async (data) => {
      if (kind === "publish" && !published) {
        const ok = await confirm({
          title: "Publicar esta edição?",
          description: (
            <>
              A edição de <strong className="font-semibold text-ink">{formatDateShort(data.referenceDate)}</strong> ficará
              visível no site para todos e pronta para ser compartilhada com os clientes.
            </>
          ),
          confirmLabel: "Publicar agora",
          tone: "success",
        });
        if (!ok) return;
      }
      const snapshot = getValues();
      setPendingKind(kind);
      startTransition(async () => {
        const result = await saveBulletinAction({ id, status: target, content: data });
        setPendingKind(null);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        const saved = result.bulletin;
        // Os valores salvos passam a ser a referência de "sem alterações".
        reset(snapshot, { keepValues: true });
        setId(saved.id);
        setStatus(saved.status);
        setSlug(saved.slug);
        setSavedAt(saved.updatedAt);

        if (kind === "publish" && !published) {
          toast.success("Edição publicada! Já está no site.", {
            action: { label: "Ver no site", onClick: () => window.open(`/boletim/${saved.slug}`, "_blank", "noopener") },
          });
        } else if (saved.status === "published") {
          toast.success("Alterações salvas e publicadas no site.");
        } else {
          toast.success("Rascunho salvo.");
        }
        if (!id) router.replace(`/admin/boletins/${saved.id}`);
      });
    }, onInvalid)();
  };

  const unpublish = async () => {
    if (!id || busy) return;
    const ok = await confirm({
      title: "Despublicar esta edição?",
      description: "Ela sai do site na hora, mas continua salva aqui como rascunho. Alterações não salvas continuam no formulário.",
      confirmLabel: "Despublicar",
      tone: "danger",
    });
    if (!ok) return;
    setPendingKind("unpublish");
    startTransition(async () => {
      const result = await setBulletinStatusAction({ id, status: "draft" });
      setPendingKind(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setStatus(result.bulletin.status);
      setSlug(result.bulletin.slug);
      toast.success("Edição despublicada. Ela voltou a ser rascunho.");
    });
  };

  const remove = async () => {
    if (!id || busy) return;
    const ok = await confirm({
      title: "Excluir esta edição?",
      description: published
        ? "Ela está publicada e sairá do site. Esta ação não pode ser desfeita."
        : "O rascunho será apagado. Esta ação não pode ser desfeita.",
      confirmLabel: "Excluir edição",
      tone: "danger",
    });
    if (!ok) return;
    setPendingKind("delete");
    startTransition(async () => {
      const result = await deleteBulletinAction({ id });
      if (!result.ok) {
        setPendingKind(null);
        toast.error(result.error);
        return;
      }
      reset(getValues(), { keepValues: true });
      toast.success("Edição excluída.");
      router.push("/admin");
    });
  };

  // ---------------------------------------------------------------------------
  // Atalho Ctrl/Cmd+S e aviso ao sair com alterações não salvas
  // ---------------------------------------------------------------------------

  const onShortcutSave = useEffectEvent(() => persist(published ? "published" : "draft", "save"));

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onShortcutSave();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const onGuardedLinkClick = useEffectEvent((e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const anchor = (e.target as Element | null)?.closest?.("a[href]");
    if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
    e.preventDefault();
    e.stopPropagation();
    void confirm({
      title: "Sair sem salvar?",
      description: "Você tem alterações não salvas nesta edição. Se sair agora, elas serão perdidas.",
      confirmLabel: "Sair sem salvar",
      cancelLabel: "Continuar editando",
      tone: "danger",
    }).then((ok) => {
      if (!ok) return;
      reset(getValues(), { keepValues: true });
      router.push(`${url.pathname}${url.search}${url.hash}`);
    });
  });

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const onClick = (e: MouseEvent) => onGuardedLinkClick(e);
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [isDirty]);

  // ---------------------------------------------------------------------------

  const saveLabel = published ? "Salvar e atualizar" : "Salvar rascunho";
  const shortcut = "Atalho: Ctrl+S";

  const menuItems: (MenuItem | null)[] = [
    published && siteUrl ? { label: "Ver no site", icon: <ExternalLink />, href: siteUrl, external: true } : null,
    id ? { label: "Duplicar como nova edição", icon: <CopyPlus />, href: `/admin/boletins/novo?de=${id}` } : null,
    published ? { label: "Despublicar", icon: <EyeOff />, onSelect: unpublish } : null,
    id ? { label: "Excluir edição", icon: <Trash />, onSelect: remove, tone: "danger" } : null,
  ];
  const hasMenu = menuItems.some(Boolean);

  const sectionContent: Record<SectionId, ReactNode> = {
    identificacao: <IdentificationSection history={history} currentSlug={slug} />,
    cobre: <QuoteSection metric="copper" />,
    dolar: <QuoteSection metric="dollar" />,
    estoques: <StocksSection />,
    direcao: <DirectionSection />,
    noticias: <NewsSection />,
    expectativa: <FactorsSection />,
    leitura: <ReadingSection />,
    termometro: <ThermometerSection />,
    mensagens: <MessagesSection />,
    fontes: <SourcesSection />,
  };

  return (
    <FormProvider {...methods}>
      <div className="relative flex flex-1 flex-col lg:h-[calc(100dvh-4rem)] lg:min-h-[32rem] lg:flex-none lg:overflow-hidden">
        {/* Barra superior */}
        <div className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur lg:static">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 px-4 py-2.5 sm:px-6">
            <Link
              href="/admin"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full py-1 pr-2 text-sm font-medium text-ink-2 hover:text-ink"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Edições
            </Link>
            <span className="hidden h-8 w-px bg-line sm:block" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate font-display text-base font-bold text-navy-800 sm:text-lg">
                  {id ? (
                    <>
                      <span className="hidden sm:inline">Edição de </span>
                      {dateShort}
                    </>
                  ) : (
                    "Nova edição"
                  )}
                </h1>
                {id ? (
                  <StatusBadge status={status} />
                ) : (
                  <span className="inline-flex shrink-0 items-center rounded-full bg-flat-bg px-2.5 py-0.5 text-xs font-semibold text-flat-ink ring-1 ring-flat-line ring-inset">
                    Não salva
                  </span>
                )}
              </div>
              <SaveState busy={busy} dirty={isDirty} savedAt={savedAt} />
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              {published && siteUrl ? (
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass({ variant: "ghost", size: "md", className: "hidden xl:inline-flex" })}
                >
                  <ExternalLink className="size-4" aria-hidden="true" />
                  Ver no site
                </a>
              ) : null}
              {hasMenu ? (
                <Menu
                  label="Mais ações da edição"
                  items={menuItems}
                  triggerClassName={buttonClass({ variant: "secondary", size: "icon", className: "size-10" })}
                >
                  {pendingKind === "unpublish" || pendingKind === "delete" ? (
                    <Spinner className="size-4" />
                  ) : (
                    <Ellipsis className="size-4" aria-hidden="true" />
                  )}
                </Menu>
              ) : null}
              {published ? (
                <Button
                  variant="primary"
                  onClick={() => persist("published", "save")}
                  loading={pendingKind === "save"}
                  disabled={busy}
                  icon={<Save className="size-4" aria-hidden="true" />}
                  title={shortcut}
                  className="flex-1 sm:flex-none"
                >
                  {saveLabel}
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => persist("draft", "save")}
                    loading={pendingKind === "save"}
                    disabled={busy}
                    icon={<Save className="size-4" aria-hidden="true" />}
                    title={shortcut}
                    className="flex-1 sm:flex-none"
                  >
                    <span className="sm:hidden">Salvar</span>
                    <span className="hidden sm:inline">{saveLabel}</span>
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => persist("published", "publish")}
                    loading={pendingKind === "publish"}
                    disabled={busy}
                    icon={<Rocket className="size-4" aria-hidden="true" />}
                    className="flex-1 sm:flex-none"
                  >
                    Publicar
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Abas no celular/tablet */}
          <div className="px-4 pb-2.5 sm:px-6 lg:hidden">
            <div role="tablist" aria-label="Modo do editor" className="grid grid-cols-2 gap-1 rounded-2xl bg-canvas p-1">
              {(
                [
                  ["edit", "Editar"],
                  ["preview", "Pré-visualizar"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  id={`aba-${value}`}
                  aria-selected={tab === value}
                  aria-controls={value === "edit" ? "painel-formulario" : "painel-preview"}
                  onClick={() => setTab(value)}
                  className={clsx(
                    "rounded-xl py-2 text-sm font-semibold transition-colors",
                    tab === value ? "bg-white text-navy-800 shadow-xs" : "text-ink-2 hover:text-ink",
                  )}
                >
                  {label}
                  {value === "edit" && errorSections.length ? (
                    <span className="ml-1.5 inline-block size-2 rounded-full bg-up align-middle" aria-label="(com erros)" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Formulário */}
          <div
            id="painel-formulario"
            className={clsx(
              "relative min-w-0 lg:w-[520px] lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-line xl:w-[580px]",
              tab === "preview" && "hidden lg:block",
            )}
          >
            <form onSubmit={(e) => e.preventDefault()} noValidate className="flex flex-col gap-4 p-4 sm:p-6" aria-label="Conteúdo da edição">
              {!id && basedOn ? <BasedOnNotice basedOn={basedOn} /> : null}
              {!id && existingDraft ? <ExistingDraftNotice draft={existingDraft} /> : null}

              <nav
                aria-label="Seções do formulário"
                className="z-10 -mx-4 flex items-center gap-2 bg-canvas/95 px-4 py-1.5 backdrop-blur sm:-mx-6 sm:px-6 lg:sticky lg:top-0"
              >
                <ol className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-1 pr-6 [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] [scrollbar-width:none]">
                  {SECTIONS.map((section, index) => {
                    const hasError = errorSections.includes(section.id);
                    return (
                      <li key={section.id} className="shrink-0">
                        <button
                          type="button"
                          onClick={() => openAndScrollTo([section.id])}
                          className={clsx(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ring-1 transition-colors ring-inset",
                            hasError
                              ? "bg-up-bg text-up-ink ring-up-line"
                              : "bg-white text-ink-2 ring-line hover:text-ink hover:ring-line-strong",
                          )}
                        >
                          <span className="tabular-nums opacity-70">{index + 1}</span>
                          {section.short}
                          {hasError ? <span className="sr-only"> (com erros)</span> : null}
                        </button>
                      </li>
                    );
                  })}
                </ol>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-muted ring-1 ring-line ring-inset transition-colors hover:bg-white hover:text-ink"
                  aria-label={openSections.size === ALL_SECTION_IDS.length ? "Recolher todas as seções" : "Expandir todas as seções"}
                  title={openSections.size === ALL_SECTION_IDS.length ? "Recolher todas" : "Expandir todas"}
                >
                  {openSections.size === ALL_SECTION_IDS.length ? (
                    <ChevronsDownUp className="size-4" aria-hidden="true" />
                  ) : (
                    <ChevronsUpDown className="size-4" aria-hidden="true" />
                  )}
                </button>
              </nav>

              {SECTIONS.map((section, index) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  number={index + 1}
                  open={openSections.has(section.id)}
                  hasError={errorSections.includes(section.id)}
                  onToggle={() =>
                    setOpenSections((prev) => {
                      const next = new Set(prev);
                      if (next.has(section.id)) next.delete(section.id);
                      else next.add(section.id);
                      return next;
                    })
                  }
                >
                  {sectionContent[section.id]}
                </SectionCard>
              ))}

              <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="min-w-0">
                  <p className="font-display font-bold text-navy-800">{published ? "Tudo certo?" : "Pronto para publicar?"}</p>
                  <p className="text-sm text-ink-2">
                    {published
                      ? "Salve para atualizar a edição no site."
                      : "Confira a pré-visualização e publique. Se preferir, salve o rascunho e termine depois."}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant={published ? "primary" : "secondary"}
                    onClick={() => persist(published ? "published" : "draft", "save")}
                    disabled={busy}
                    icon={<Save className="size-4" aria-hidden="true" />}
                    className="flex-1 sm:flex-none"
                  >
                    {published ? "Salvar e atualizar" : "Salvar"}
                  </Button>
                  {!published ? (
                    <Button
                      variant="primary"
                      onClick={() => persist("published", "publish")}
                      disabled={busy}
                      icon={<Rocket className="size-4" aria-hidden="true" />}
                      className="flex-1 sm:flex-none"
                    >
                      Publicar
                    </Button>
                  ) : null}
                </div>
              </div>
            </form>
          </div>

          {/* Pré-visualização */}
          <div id="painel-preview" className={clsx("relative flex min-w-0 flex-1 lg:overflow-y-auto", tab === "edit" && "hidden lg:flex")}>
            <LivePreview history={history} draft={!published} className="flex min-h-full w-full" />
          </div>
        </div>
      </div>
    </FormProvider>
  );
}

function SaveState({ busy, dirty, savedAt }: { busy: boolean; dirty: boolean; savedAt?: string }) {
  let content: ReactNode;
  if (busy) {
    content = (
      <>
        <Spinner className="size-3" /> Salvando…
      </>
    );
  } else if (dirty) {
    content = (
      <>
        <span className="size-2 rounded-full bg-brand-amber" aria-hidden="true" /> Alterações não salvas
      </>
    );
  } else if (savedAt) {
    content = (
      <>
        <CircleCheck className="size-3.5 text-down" aria-hidden="true" /> {savedLabel(savedAt)}
      </>
    );
  } else {
    content = "Ainda não salva";
  }
  return (
    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted" role="status" aria-live="polite">
      {content}
    </p>
  );
}

function BasedOnNotice({ basedOn }: { basedOn: { referenceDate: string; duplicate: boolean } }) {
  return (
    <div className="flex gap-3 rounded-[var(--radius-card)] border border-brand-blue/25 bg-[#eef5ff] p-4 text-sm leading-relaxed text-ink-2">
      <Sparkles className="mt-0.5 size-5 shrink-0 text-brand-blue" aria-hidden="true" />
      <p>
        <strong className="font-semibold text-ink">
          {basedOn.duplicate ? "Cópia" : "Pré-preenchida a partir"} da edição de {formatDateShort(basedOn.referenceDate)}.
        </strong>{" "}
        Os valores de cobre, dólar e estoques dessa edição já estão como “semana anterior”. Atualize os valores atuais,
        escreva a manchete e revise notícias, fatores e textos.
      </p>
    </div>
  );
}

function ExistingDraftNotice({ draft }: { draft: { id: number; referenceDate: string } }) {
  return (
    <div className="flex gap-3 rounded-[var(--radius-card)] border border-[#f5d77a] bg-[#fffbeb] p-4 text-sm leading-relaxed text-ink-2">
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-[#b7791f]" aria-hidden="true" />
      <p>
        Já existe um rascunho da edição de <strong className="font-semibold text-ink">{formatDateShort(draft.referenceDate)}</strong>.{" "}
        <Link href={`/admin/boletins/${draft.id}`} className="font-semibold text-navy-700 underline underline-offset-4">
          Continuar editando esse rascunho
        </Link>{" "}
        para não criar duas edições da mesma semana.
      </p>
    </div>
  );
}

/** Caminho ("news.1.title") do primeiro erro, na ordem das seções do formulário. */
function firstErrorPath(errors: FieldErrors<FormValues>): string | null {
  for (const section of SECTIONS) {
    for (const field of section.fields) {
      const found = findLeaf(errors[field], field);
      if (found) return found;
    }
  }
  return null;
}

function findLeaf(node: unknown, path: string): string | null {
  if (!node || typeof node !== "object") return null;
  const record = node as Record<string, unknown>;
  if (typeof record.type === "string" && typeof record.message === "string") return path;
  for (const key of Object.keys(record)) {
    if (key === "ref" || key === "root") continue;
    const found = findLeaf(record[key], `${path}.${key}`);
    if (found) return found;
  }
  return null;
}
