"use client";

import { useMemo } from "react";
import type { Category, ProductWithCategory } from "@/types/database";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { useStore } from "@/components/store/StoreProvider";
import { PhoneIcon } from "@/components/icons";
import { FEATURED_CATEGORIES } from "@/lib/categories";

const ALL_LABEL = "Todos";

type CatalogProps = {
  products: ProductWithCategory[];
  categories: Category[];
};

export function Catalog({ products, categories }: CatalogProps) {
  const { query, category, setCategory } = useStore();

  const categoryNames = useMemo(() => {
    const extra = categories.map((item) => item.name).filter(Boolean);
    return Array.from(new Set<string>([...FEATURED_CATEGORIES, ...extra]));
  }, [categories]);

  const search = query.trim().toLowerCase();

  const visibleProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory =
          category === "all" || product.categories?.name === category;

        if (!matchesCategory) return false;
        if (!search) return true;

        return [
          product.title,
          product.brand,
          product.model,
          product.storage,
          product.description,
        ].some((field) => (field ?? "").toLowerCase().includes(search));
      }),
    [products, category, search],
  );

  const isEmpty = products.length === 0;
  const isFilterEmpty = !isEmpty && visibleProducts.length === 0;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 sm:pb-16">
      <Reveal y={16}>
        <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
          {[ALL_LABEL, ...categoryNames].map((name) => {
            const isActive =
              name === ALL_LABEL ? category === "all" : category === name;

            return (
              <button
                key={name}
                type="button"
                onClick={() => setCategory(name === ALL_LABEL ? "all" : name)}
                aria-pressed={isActive}
                className={`chip ${isActive ? "chip-active" : "chip-idle"}`}
              >
                {name}
              </button>
            );
          })}

          <span className="ml-auto hidden shrink-0 pl-3 text-xs text-zinc-600 lg:block">
            {visibleProducts.length}{" "}
            {visibleProducts.length === 1 ? "producto" : "productos"}
          </span>
        </div>
      </Reveal>

      <div className="min-h-[600px]">
        {isEmpty ? (
          <Reveal>
            <EmptyState
              title="Catálogo en camino"
              description="Aún no tenemos productos publicados. Vuelve pronto para ver la colección de celulares y accesorios Northumbria."
            />
          </Reveal>
        ) : isFilterEmpty ? (
          <Reveal>
            <EmptyState
              title="Sin resultados"
              description="No encontramos productos para esta búsqueda. Prueba con otro término o cambia de categoría."
            />
          </Reveal>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {visibleProducts.map((product, index) => (
              <Reveal key={product.id} delay={Math.min(index, 7) * 70}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
        <PhoneIcon className="h-6 w-6 text-zinc-400" />
      </span>
      <h3 className="mt-4 text-base font-bold text-zinc-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-zinc-600">{description}</p>
    </div>
  );
}
