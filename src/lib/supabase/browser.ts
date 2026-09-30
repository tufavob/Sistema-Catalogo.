import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

function getBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return browserClient;
}

export async function uploadProductImage(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `products/${crypto.randomUUID()}.${extension}`;

  const { error } = await getBrowserClient()
    .storage.from("products")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = getBrowserClient()
    .storage.from("products")
    .getPublicUrl(path);

  return data.publicUrl;
}
