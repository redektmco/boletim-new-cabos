"use client";

import { clsx } from "clsx";
import { CopyPlus, Ellipsis, ExternalLink, EyeOff, Pencil, Rocket, Trash } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteBulletinAction, setBulletinStatusAction } from "@/app/admin/(panel)/boletins/actions";
import { BiasPill } from "@/components/bulletin/pressure";
import type { Bias, BulletinStatus } from "@/lib/bulletin/schema";
import { buttonClass, Spinner } from "./ui/button";
import { useConfirm } from "./ui/confirm";
import { Menu } from "./ui/menu";
import { StatusBadge } from "./ui/status-badge";

export type BulletinListRow = {
  id: number;
  slug: string;
  status: BulletinStatus;
  dateLabel: string;
  headline: string;
  bias: Bias | null;
  updatedLabel: string;
};

export function BulletinList({ rows }: { rows: BulletinListRow[] }) {
  return (
    <div className="card">
      <div
        className="hidden grid-cols-[7.5rem_minmax(0,1fr)_9.5rem_7.5rem_9.5rem_8.5rem] gap-4 border-b border-line px-5 py-3 text-[0.6875rem] font-semibold tracking-[0.12em] text-muted uppercase lg:grid"
        aria-hidden="true"
      >
        <span>Data</span>
        <span>Manchete</span>
        <span>Viés</span>
        <span>Status</span>
        <span>Atualizado</span>
        <span className="text-right">Ações</span>
      </div>
      <ul className="divide-y divide-line" aria-label="Edições">
        {rows.map((row) => (
          <BulletinRowItem key={row.id} row={row} />
        ))}
      </ul>
    </div>
  );
}

function BulletinRowItem({ row }: { row: BulletinListRow }) {
  const confirm = useConfirm();
  const [pending, startTransition] = useTransition();
  const published = row.status === "published";

  const togglePublish = async () => {
    const ok = await confirm(
      published
        ? {
            title: `Despublicar a edição de ${row.dateLabel}?`,
            description: "Ela sai do site na hora, mas continua salva aqui como rascunho.",
            confirmLabel: "Despublicar",
            tone: "danger",
          }
        : {
            title: `Publicar a edição de ${row.dateLabel}?`,
            description: "Ela fica visível no site para todos e pode ser compartilhada com os clientes.",
            confirmLabel: "Publicar agora",
            tone: "success",
          },
    );
    if (!ok) return;
    startTransition(async () => {
      const result = await setBulletinStatusAction({ id: row.id, status: published ? "draft" : "published" });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (result.bulletin.status === "published") {
        toast.success("Edição publicada! Já está no site.", {
          action: { label: "Ver no site", onClick: () => window.open(`/boletim/${result.bulletin.slug}`, "_blank", "noopener") },
        });
      } else {
        toast.success("Edição despublicada. Ela voltou a ser rascunho.");
      }
    });
  };

  const remove = async () => {
    const ok = await confirm({
      title: `Excluir a edição de ${row.dateLabel}?`,
      description: published
        ? "Ela está publicada e sairá do site. Esta ação não pode ser desfeita."
        : "O rascunho será apagado. Esta ação não pode ser desfeita.",
      confirmLabel: "Excluir edição",
      tone: "danger",
    });
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteBulletinAction({ id: row.id });
      if (!result.ok) toast.error(result.error);
      else toast.success("Edição excluída.");
    });
  };

  return (
    <li
      className={clsx(
        "grid gap-x-4 gap-y-2 px-4 py-4 transition-opacity sm:px-5 lg:grid-cols-[7.5rem_minmax(0,1fr)_9.5rem_7.5rem_9.5rem_8.5rem] lg:items-center",
        pending && "pointer-events-none opacity-60",
      )}
      aria-busy={pending || undefined}
    >
      <div className="flex items-center justify-between gap-3 lg:block">
        <p className="font-display font-bold text-navy-800 tabular-nums">{row.dateLabel}</p>
        <div className="flex items-center gap-2 lg:hidden">
          <StatusBadge status={row.status} />
        </div>
      </div>
      <div className="min-w-0">
        <Link
          href={`/admin/boletins/${row.id}`}
          className="line-clamp-2 font-medium text-ink decoration-line-strong underline-offset-4 hover:text-navy-700 hover:underline"
        >
          {row.headline || <span className="text-muted italic">Sem manchete</span>}
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:contents">
        <div>{row.bias ? <BiasPill bias={row.bias} size="sm" /> : <span className="text-sm text-muted">—</span>}</div>
        <div className="hidden lg:block">
          <StatusBadge status={row.status} />
        </div>
        <p className="text-xs text-muted lg:text-sm">
          <span className="lg:hidden">Atualizado em </span>
          {row.updatedLabel}
        </p>
      </div>
      <div className="flex items-center gap-2 pt-1 lg:justify-end lg:pt-0">
        <Link
          href={`/admin/boletins/${row.id}`}
          className={buttonClass({ variant: "secondary", size: "sm" })}
          aria-label={`Editar edição de ${row.dateLabel}`}
        >
          <Pencil className="size-3.5" aria-hidden="true" />
          Editar
        </Link>
        {published ? (
          <a
            href={`/boletim/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass({ variant: "ghost", size: "sm", className: "lg:hidden" })}
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
            Ver no site
          </a>
        ) : null}
        {pending ? (
          <span className="grid size-8 place-items-center text-muted">
            <Spinner className="size-4" />
          </span>
        ) : (
          <Menu
            label={`Mais ações para a edição de ${row.dateLabel}`}
            triggerClassName={buttonClass({ variant: "ghost", size: "icon", className: "size-8" })}
            items={[
              published && {
                label: "Ver no site",
                icon: <ExternalLink />,
                href: `/boletim/${row.slug}`,
                external: true,
              },
              {
                label: "Duplicar como nova edição",
                icon: <CopyPlus />,
                href: `/admin/boletins/novo?de=${row.id}`,
              },
              published
                ? { label: "Despublicar", icon: <EyeOff />, onSelect: togglePublish }
                : { label: "Publicar", icon: <Rocket />, onSelect: togglePublish },
              { label: "Excluir", icon: <Trash />, onSelect: remove, tone: "danger" },
            ]}
          >
            <Ellipsis className="size-4" aria-hidden="true" />
          </Menu>
        )}
      </div>
    </li>
  );
}
