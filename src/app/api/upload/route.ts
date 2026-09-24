import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Upload da imagem de capa (usado pelo editor). Com BLOB_READ_WRITE_TOKEN vai para o Vercel Blob;
 * sem ele, só em desenvolvimento, grava em public/uploads.
 */

const MAX_BYTES = 4 * 1024 * 1024;

const TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

type AcceptedType = keyof typeof TYPES;

function error(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

/** Confere a assinatura do arquivo (não confia só no tipo informado pelo navegador). */
function matchesSignature(type: AcceptedType, bytes: Uint8Array) {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  switch (type) {
    case "image/jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/png":
      return bytes[0] === 0x89 && ascii(1, 4) === "PNG";
    case "image/webp":
      return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
    case "image/avif":
      return ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12));
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return error("Sua sessão expirou. Entre novamente para enviar imagens.", 401);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return error("Envie a imagem no campo “file”.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return error("Nenhuma imagem recebida.", 400);
  if (!(file.type in TYPES)) return error("Formato não aceito. Use uma imagem JPG, PNG, WebP ou AVIF.", 415);
  if (file.size > MAX_BYTES) return error("A imagem tem mais de 4 MB. Reduza o tamanho e tente de novo.", 413);

  const type = file.type as AcceptedType;
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesSignature(type, bytes)) return error("O arquivo não parece ser uma imagem válida.", 415);

  const filename = `${randomUUID()}.${TYPES[type]}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`capas/${filename}`, Buffer.from(bytes), {
        access: "public",
        addRandomSuffix: true,
        contentType: type,
      });
      return Response.json({ url: blob.url });
    } catch (err) {
      console.error("[upload] Falha no Vercel Blob", err);
      return error("Não foi possível enviar a imagem para o armazenamento. Tente novamente.", 502);
    }
  }

  if (process.env.NODE_ENV === "production") {
    return error(
      "O envio de imagens não está configurado: conecte um Vercel Blob ao projeto (variável BLOB_READ_WRITE_TOKEN). Enquanto isso, cole o endereço de uma imagem.",
      503,
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return Response.json({ url: `/uploads/${filename}` });
}
