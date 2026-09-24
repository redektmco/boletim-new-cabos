import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BulletinEditor } from "@/components/admin/editor/bulletin-editor";
import { requireUser } from "@/lib/auth/session";
import { formatDateShort } from "@/lib/bulletin/format";
import { getBulletinById, getHistoryForAdmin } from "@/lib/bulletins";

async function loadBulletin(rawId: string) {
  if (!/^\d+$/.test(rawId)) return null;
  return getBulletinById(Number(rawId));
}

export async function generateMetadata({ params }: PageProps<"/admin/boletins/[id]">): Promise<Metadata> {
  await requireUser();
  const { id } = await params;
  const bulletin = await loadBulletin(id);
  return { title: bulletin ? `Edição de ${formatDateShort(bulletin.referenceDate)}` : "Edição não encontrada" };
}

export default async function EditBulletinPage({ params }: PageProps<"/admin/boletins/[id]">) {
  await requireUser();
  const { id } = await params;
  const bulletin = await loadBulletin(id);
  if (!bulletin) notFound();
  const history = await getHistoryForAdmin();

  return (
    <BulletinEditor
      key={bulletin.id}
      bulletinId={bulletin.id}
      initialStatus={bulletin.status}
      initialSlug={bulletin.slug}
      initialUpdatedAt={bulletin.updatedAt.toISOString()}
      initialValues={bulletin.content}
      history={history}
    />
  );
}
