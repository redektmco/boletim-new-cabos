import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Painel",
    template: "%s | Painel do Boletim do Cobre",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
