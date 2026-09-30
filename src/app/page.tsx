import { Suspense } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Hero } from "@/components/Hero";
import { Catalog } from "@/components/Catalog";
import { CatalogSkeleton } from "@/components/CatalogSkeleton";
import { Reveal } from "@/components/motion/Reveal";
import type { Category, ProductWithCategory } from "@/types/database";

export const dynamic = "force-dynamic";

async function fetchCategories(): Promise<Category[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from("categories")
      .select("id, name, slug, created_at")
      .order("name");

    if (error) {
      console.error("Error al cargar categorías:", error.message);
      return [];
    }

    return (data ?? []) as unknown as Category[];
  } catch (error) {
    console.error("Error al inicializar el cliente de Supabase:", error);
    return [];
  }
}

async function fetchProducts(): Promise<ProductWithCategory[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from("products")
      .select(
        "id, title, brand, model, storage, color, price, stock, status, image_url, description, category_id, created_at, categories(id, name, slug)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar productos:", error.message);
      return [];
    }

    return (data ?? []) as unknown as ProductWithCategory[];
  } catch (error) {
    console.error("Error al inicializar el cliente de Supabase:", error);
    return [];
  }
}

async function CatalogSection() {
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);

  return <Catalog products={products} categories={categories} />;
}

export default function HomePage() {
  return (
    <>
      <Hero />

      <section
        id="catalogo"
        className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 pb-4 pt-8 sm:px-6 sm:pt-10"
        aria-labelledby="catalogo-titulo"
      >
        <Reveal>
          <h2
            id="catalogo-titulo"
            className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl"
          >
            Nuestro catálogo
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Celulares, accesorios, ropa y perfumes con pedido directo por
            WhatsApp.
          </p>
        </Reveal>
      </section>

      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogSection />
      </Suspense>
    </>
  );
}
