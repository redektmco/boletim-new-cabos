import { clsx } from "clsx";
import { LoaderCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dark" | "success";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand-blue text-white shadow-sm hover:bg-navy-700 disabled:bg-brand-blue/60",
  secondary: "border border-line-strong bg-white text-ink shadow-xs hover:border-navy-600/40 hover:bg-navy-50 disabled:text-muted",
  ghost: "text-ink-2 hover:bg-navy-50 hover:text-ink disabled:text-muted/60",
  danger: "bg-up text-white shadow-sm hover:bg-up-ink disabled:bg-up/60",
  dark: "bg-navy-800 text-white shadow-sm hover:bg-navy-700 disabled:bg-navy-800/60",
  success: "bg-down text-white shadow-sm hover:bg-down-ink disabled:bg-down/60",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-[0.8125rem]",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2 px-5 text-[0.9375rem]",
  icon: "size-9 justify-center",
};

export function buttonClass({
  variant = "secondary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return clsx(
    "inline-flex shrink-0 items-center justify-center rounded-full font-semibold whitespace-nowrap transition-colors select-none disabled:cursor-not-allowed",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({ variant, size, loading, icon, className, children, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner className="size-4" /> : icon}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle className={clsx("animate-spin", className)} aria-hidden="true" />;
}
