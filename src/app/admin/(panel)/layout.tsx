import type { Metadata } from "next";
import { Toaster } from "sonner";
import { DemoModeBanner } from "@/components/admin/demo-mode-banner";
import { PanelHeader } from "@/components/admin/panel-header";
import { ConfirmProvider } from "@/components/admin/ui/confirm";
import { requireUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/db/config";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireUser();

  return (
    <ConfirmProvider>
      <PanelHeader user={{ name: user.name, role: user.role }} />
      {isDemoMode() ? <DemoModeBanner /> : null}
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      <Toaster richColors position="top-center" closeButton toastOptions={{ duration: 5000 }} />
    </ConfirmProvider>
  );
}
