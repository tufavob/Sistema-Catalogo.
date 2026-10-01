import { Suspense } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Hero } from "@/components/Hero";
import { Catalog } from "@/components/Catalog";
import { CatalogSkeleton } from "@/components/CatalogSkeleton";
import { ProductErrorBoundary } from "@/components/ProductErrorBoundary";
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

    if (!Array.isArray(data)) {
      console.error("La consulta de categorías no devolvió un arreglo.");
      return [];
    }

    return data as unknown as Category[];
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
        "id, title, brand, model, storage, color, price, stock, status, image_url, color_galleries, description, category_id, created_at, categories(id, name, slug)",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar productos:", error.message);
      return [];
    }

    if (!Array.isArray(data)) {
      console.error("La consulta de productos no devolvió un arreglo.");
      return [];
    }

    return data.filter(
      (row) => row !== null && typeof row === "object",
    ) as unknown as ProductWithCategory[];
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

  return (
    <ProductErrorBoundary>
      <Catalog products={products} categories={categories} />
    </ProductErrorBoundary>
  );
}

function CatalogUnavailable() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 sm:pb-16">
      <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
        <h3 className="text-base font-bold text-zinc-900">
          No pudimos cargar el catálogo
        </h3>
        <p className="mt-1.5 max-w-sm text-sm text-zinc-600">
          Intenta recargar la página. Si el problema continúa, escríbenos por
          WhatsApp.
        </p>
      </div>
    </section>
  );
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
