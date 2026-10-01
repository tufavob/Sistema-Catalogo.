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
  let authError: string | null = null;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(input);
    authError = error ? readableAuthError(error.message) : null;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return {
      error: "No se pudo conectar con el servidor. Inténtalo de nuevo.",
    };
  }

  if (authError) {
    return { error: authError };
  }

  redirect("/admin");
}

export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }

  redirect("/admin/login");
}

async function requireSupabase() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    return supabase;
  } catch (error) {
    console.error("Error al verificar la sesión:", error);
    return null;
  }
}

export async function listProducts(): Promise<{
  products: ProductWithCategory[];
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, title, brand, model, storage, color, price, stock, status, image_url, color_galleries, description, category_id, created_at, categories(id, name, slug)",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al listar productos:", error.message);
      return { products: [] };
    }

    return { products: (data ?? []) as unknown as ProductWithCategory[] };
  } catch (error) {
    console.error("Error al listar productos:", error);
    return { products: [] };
  }
}

export async function createProduct(
  input: ProductInput,
): Promise<ActionResult> {
  try {
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
      color_galleries: input.color_galleries?.trim() || null,
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true };
  } catch (error) {
    console.error("Error al crear el producto:", error);
    return {
      ok: false,
      message: "No se pudo crear el producto. Inténtalo de nuevo.",
    };
  }
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<ActionResult> {
  try {
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
        color_galleries: input.color_galleries?.trim() || null,
      })
      .eq("id", id);

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true };
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    return {
      ok: false,
      message: "No se pudo actualizar el producto. Inténtalo de nuevo.",
    };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireSupabase();
    if (!supabase) {
      return { ok: false, message: "No autorizado. Inicia sesión nuevamente." };
    }

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true };
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    return {
      ok: false,
      message: "No se pudo eliminar el producto. Inténtalo de nuevo.",
    };
  }
}
