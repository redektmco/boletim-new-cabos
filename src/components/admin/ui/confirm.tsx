"use client";

import { clsx } from "clsx";
import { CircleAlert, Rocket, TriangleAlert } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Button } from "./button";
import { Dialog } from "./dialog";

export type ConfirmOptions = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger" | "success";
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** Confirmação em janela própria: `if (await confirm({ title: "Excluir?" })) { … }`. */
export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm precisa estar dentro de <ConfirmProvider>.");
  return confirm;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((next) => {
    resolver.current?.(false);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setOptions(next);
      setOpen(true);
    });
  }, []);

  const settle = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOpen(false);
  };

  const tone = options?.tone ?? "primary";
  const Icon = tone === "danger" ? TriangleAlert : tone === "success" ? Rocket : CircleAlert;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={open}
        onClose={() => settle(false)}
        title={options?.title ?? ""}
        description={options?.description}
        icon={
          <span
            className={clsx(
              "grid size-11 place-items-center rounded-2xl",
              tone === "danger" && "bg-up-bg text-up",
              tone === "success" && "bg-down-bg text-down",
              tone === "primary" && "bg-navy-50 text-navy-700",
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => settle(false)} data-autofocus>
              {options?.cancelLabel ?? "Cancelar"}
            </Button>
            <Button variant={tone} onClick={() => settle(true)}>
              {options?.confirmLabel ?? "Confirmar"}
            </Button>
          </>
        }
      />
    </ConfirmContext.Provider>
  );
}
