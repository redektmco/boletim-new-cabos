"use server";

import { z } from "zod";
import { getCurrentUser, requireUser } from "@/lib/auth/session";
import { userFacingError, type ActionResult } from "@/lib/admin/result";
import { describeIssues, zodErrorPtBR } from "@/lib/admin/zod";
import { bulletinContentSchema, bulletinStatusSchema, type BulletinStatus } from "@/lib/bulletin/schema";
import { createBulletin, deleteBulletin, getBulletinById, setBulletinStatus, updateBulletin } from "@/lib/bulletins";

export type SavedBulletin = {
  id: number;
  slug: string;
  status: BulletinStatus;
  updatedAt: string;
};

const idSchema = z.number().int().positive();

const SESSION_EXPIRED =
  "Sua sessão expirou. Entre novamente no painel em outra aba e depois clique em salvar aqui — nada do que você digitou foi perdido.";

const saveInputSchema = z.object({
  id: idSchema.optional(),
  status: bulletinStatusSchema,
  content: z.unknown(),
});

function toSaved(row: { id: number; slug: string; status: BulletinStatus; updatedAt: Date }): SavedBulletin {
  return { id: row.id, slug: row.slug, status: row.status, updatedAt: row.updatedAt.toISOString() };
}

/** Cria (sem id) ou atualiza uma edição com o conteúdo do editor. */
export async function saveBulletinAction(input: {
  id?: number;
  status: BulletinStatus;
  content: unknown;
}): Promise<ActionResult<{ bulletin: SavedBulletin }>> {
  // Sessão expirada no meio da edição: avisa em vez de redirecionar, para não perder o que foi digitado.
  if (!(await getCurrentUser())) return { ok: false, error: SESSION_EXPIRED };
  const user = await requireUser();

  const parsedInput = saveInputSchema.safeParse(input);
  if (!parsedInput.success) return { ok: false, error: "Requisição inválida. Recarregue a página e tente novamente." };
  const { id, status } = parsedInput.data;

  const content = bulletinContentSchema.safeParse(parsedInput.data.content, { error: zodErrorPtBR });
  if (!content.success) return { ok: false, error: describeIssues(content.error) };

  try {
    if (id) {
      const current = await getBulletinById(id);
      if (!current) return { ok: false, error: "Esta edição não existe mais. Ela pode ter sido excluída." };
      const row = await updateBulletin(id, content.data, status, user.id);
      return { ok: true, bulletin: toSaved(row) };
    }
    const row = await createBulletin(content.data, status, user.id);
    return { ok: true, bulletin: toSaved(row) };
  } catch (error) {
    console.error("[admin] Falha ao salvar edição", error);
    return { ok: false, error: userFacingError(error, "Não foi possível salvar a edição. Tente novamente.") };
  }
}

export async function setBulletinStatusAction(input: {
  id: number;
  status: BulletinStatus;
}): Promise<ActionResult<{ bulletin: SavedBulletin }>> {
  const user = await requireUser();
  const parsed = z.object({ id: idSchema, status: bulletinStatusSchema }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Requisição inválida." };

  try {
    const current = await getBulletinById(parsed.data.id);
    if (!current) return { ok: false, error: "Esta edição não existe mais. Ela pode ter sido excluída." };
    const valid = bulletinContentSchema.safeParse(current.content, { error: zodErrorPtBR });
    if (!valid.success) {
      return { ok: false, error: `Abra a edição e corrija antes de publicar — ${describeIssues(valid.error)}` };
    }
    const row = await setBulletinStatus(parsed.data.id, parsed.data.status, user.id);
    return { ok: true, bulletin: toSaved(row) };
  } catch (error) {
    console.error("[admin] Falha ao alterar status", error);
    return { ok: false, error: userFacingError(error) };
  }
}

export async function deleteBulletinAction(input: { id: number }): Promise<ActionResult> {
  await requireUser();
  const parsed = z.object({ id: idSchema }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Requisição inválida." };

  try {
    const current = await getBulletinById(parsed.data.id);
    if (!current) return { ok: false, error: "Esta edição já foi excluída." };
    await deleteBulletin(parsed.data.id);
    return { ok: true };
  } catch (error) {
    console.error("[admin] Falha ao excluir edição", error);
    return { ok: false, error: userFacingError(error) };
  }
}
