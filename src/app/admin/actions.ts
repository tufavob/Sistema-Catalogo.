"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProductInput, ProductWithCategory } from "@/types/database";

export type ActionResult = {
  ok: boolean;
  message?: string;
};

function readableAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  return message;
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword(input);

  if (error) {
    return { error: readableAuthError(error.message) };
  }

  redirect("/admin");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

async function requireSupabase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return supabase;
}

export async function listProducts(): Promise<{
  products: ProductWithCategory[];
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, title, brand, model, storage, color, price, stock, status, image_url, description, category_id, created_at, categories(id, name, slug)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al listar productos:", error.message);
    return { products: [] };
  }

  return { products: (data ?? []) as unknown as ProductWithCategory[] };
}

export async function createProduct(
  input: ProductInput
): Promise<ActionResult> {
  const supabase = await requireSupabase();
  if (!supabase) {
    return { ok: false, message: "No autorizado. Inicia sesión nuevamente." };
  }

  const { error } = await supabase.from("products").insert({
    title: input.title.trim(),
    brand: input.brand.trim(),
    model: input.model.trim(),
    storage: input.storage?.trim() || null,
    color: input.color?.trim() || null,
    price: input.price,
    stock: input.stock,
    status: input.status,
    description: input.description?.trim() || null,
    category_id: input.category_id || null,
    image_url: input.image_url?.trim() || null,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<ActionResult> {
  const supabase = await requireSupabase();
  if (!supabase) {
    return { ok: false, message: "No autorizado. Inicia sesión nuevamente." };
  }

  const { error } = await supabase
    .from("products")
    .update({
      title: input.title.trim(),
      brand: input.brand.trim(),
      model: input.model.trim(),
      storage: input.storage?.trim() || null,
      color: input.color?.trim() || null,
      price: input.price,
      stock: input.stock,
      status: input.status,
      description: input.description?.trim() || null,
      category_id: input.category_id || null,
      image_url: input.image_url?.trim() || null,
    })
    .eq("id", id);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = await requireSupabase();
  if (!supabase) {
    return { ok: false, message: "No autorizado. Inicia sesión nuevamente." };
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}