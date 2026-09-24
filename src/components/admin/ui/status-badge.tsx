import { clsx } from "clsx";
import type { BulletinStatus } from "@/lib/bulletin/schema";

export const STATUS_LABEL: Record<BulletinStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
};

export function StatusBadge({ status, className }: { status: BulletinStatus; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap",
        status === "published" ? "bg-down-bg text-down-ink ring-down-line" : "bg-[#fff8e1] text-[#8a5a00] ring-[#f5d77a]",
        className,
      )}
    >
      <span
        className={clsx("size-1.5 rounded-full", status === "published" ? "bg-down" : "bg-brand-amber")}
        aria-hidden="true"
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function RoleBadge({ role }: { role: "admin" | "editor" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap",
        role === "admin" ? "bg-navy-50 text-navy-800 ring-navy-100" : "bg-flat-bg text-flat-ink ring-flat-line",
      )}
    >
      {role === "admin" ? "Administrador" : "Editor"}
    </span>
  );
}
