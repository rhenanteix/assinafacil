import { prepareSignatureImage } from "@/lib/signature/image";
import { v2 as cloudinary } from "cloudinary";
import { verifiedUserId } from "@/lib/auth";
import { signatureAccess } from "@/lib/prisma/signatures";
import { captureServerEvent } from "@/lib/posthog-server";
import { failure, sameOrigin } from "@/lib/utils/http";
export const runtime = "nodejs";
const limit = 3 * 1024 * 1024;

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const userId = await verifiedUserId();
  if (!userId) return failure("Entre com um e-mail confirmado para adicionar imagens.", 401);
  const { pro, owned } = await signatureAccess(userId);
  if (!pro && !owned.length) return failure("Fotos e logos são recursos premium.", 403);
  if (!process.env.CLOUDINARY_URL) return failure("O serviço de imagens ainda não está configurado.", 503);
  if (Number(request.headers.get("content-length")) > limit + 16384) return failure("A imagem pode ter até 3 MB.", 413);
  const body = await request.formData().catch(() => null);
  const file = body?.get("file");
  if (!(file instanceof File) || !file.size || file.size > limit) return failure("Envie uma imagem de até 3 MB.", 400);
  const bytes = Buffer.from(await file.arrayBuffer());
  const png = bytes.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"));
  const jpeg = bytes.subarray(0, 3).equals(Buffer.from("ffd8ff", "hex"));
  const webp = bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (!png && !jpeg && !webp) return failure("Use uma imagem PNG, JPEG ou WebP.", 400);
  const kind = body?.get("kind");
  if (kind !== "photo" && kind !== "logo" && kind !== "banner" && kind !== "selos" && kind !== "galeria") return failure("Tipo de imagem inválido.", 400);
  try {
    const prepared = await prepareSignatureImage(bytes, kind);
    const transform = kind === "banner" ? [{ width: 600, height: 200, crop: "limit" }] : [{ width: 256, height: 256, crop: "limit" }];
    const url = await new Promise<string>((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        resource_type: "image", folder: "assinafacil", allowed_formats: ["png", "jpg", "jpeg", "webp"],
        transformation: transform, format: "png",
      }, (error, result) => {
        if (error || !result) reject(error ?? new Error("Upload sem retorno."));
        else resolve(result.secure_url);
      }).end(prepared);
    });
    await captureServerEvent({
      distinctId: userId,
      event: "signature_image_uploaded",
      properties: { image_type: kind },
    });
    return Response.json({ url });
  } catch { return failure("Falha no envio. Tente novamente.", 502); }
}
