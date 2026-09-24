import type { Metadata } from "next";
import { BulletinEditor } from "@/components/admin/editor/bulletin-editor";
import { requireUser } from "@/lib/auth/session";
import { emptyBulletin, nextBulletinFrom } from "@/lib/bulletin/defaults";
import type { BulletinContentInput } from "@/lib/bulletin/schema";
import { getBulletinById, getHistoryForAdmin, getLatestBulletin, listAllForAdmin } from "@/lib/bulletins";

export const metadata: Metadata = {
  title: "Nova edição",
};

export default async function NewBulletinPage({ searchParams }: PageProps<"/admin/boletins/novo">) {
  const user = await requireUser();
  const { de } = await searchParams;

  // ?de=<id> duplica uma edição específica; sem ele, parte da edição mais recente.
  const sourceId = typeof de === "string" && /^\d+$/.test(de) ? Number(de) : null;
  const source = (sourceId ? await getBulletinById(sourceId) : null) ?? (await getLatestBulletin());

  const initialValues: BulletinContentInput = source ? nextBulletinFrom(source.content) : emptyBulletin();
  if (!initialValues.author?.name?.trim()) {
    initialValues.author = { ...initialValues.author, name: user.name };
  }

  const [history, all] = await Promise.all([getHistoryForAdmin(), listAllForAdmin()]);
  const lastPublished = all.find((b) => b.status === "published");
  const draft = all.find((b) => b.status === "draft" && (!lastPublished || b.referenceDate >= lastPublished.referenceDate));

  return (
    <BulletinEditor
      key={source ? `de-${source.id}` : "vazio"}
      initialStatus="draft"
      initialValues={initialValues}
      history={history}
      basedOn={source ? { referenceDate: source.referenceDate, duplicate: sourceId === source.id } : null}
      existingDraft={draft ? { id: draft.id, referenceDate: draft.referenceDate } : null}
    />
  );
}
