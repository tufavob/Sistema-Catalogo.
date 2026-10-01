import { createBrowserClient } from "@supabase/ssr";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_STORAGE_BUCKET,
  SUPABASE_URL,
} from "@/lib/supabase/env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

function getBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return browserClient;
}

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;

  const byType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };

  return byType[file.type] ?? "png";
}

function validateFile(file: File): void {
  if (file.type && !ACCEPTED_TYPES.includes(file.type)) {
    throw new Error(
      `Formato no permitido (${file.type}). Usa JPG, PNG, WEBP, GIF o AVIF.`,
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `"${file.name}" supera los 5 MB. Optimiza la imagen e inténtalo de nuevo.`,
    );
  }
}

export async function uploadProductImage(file: File): Promise<string> {
  validateFile(file);

  const path = `${crypto.randomUUID()}.${extensionFor(file)}`;

  try {
    const { error } = await getBrowserClient()
      .storage.from(SUPABASE_STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = getBrowserClient()
      .storage.from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(path);

    if (!data?.publicUrl) {
      throw new Error("Supabase no devolvió una URL pública para la imagen.");
    }

    return data.publicUrl;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    const isPolicy =
      /bucket|policy|permission|not found|row-level|access denied|403|404/i.test(
        reason,
      );

    throw new Error(
      isPolicy
        ? `No se pudo subir a Supabase Storage (${reason}). ` +
            `Asegúrate de que el bucket '${SUPABASE_STORAGE_BUCKET}' exista, sea público ` +
            `y que tu usuario tenga permisos de escritura.`
        : `No se pudo subir la imagen: ${reason}`,
    );
  }
}

export function isSupportedImageType(file: File): boolean {
  return !file.type || ACCEPTED_TYPES.includes(file.type);
}

export { SUPABASE_STORAGE_BUCKET };
