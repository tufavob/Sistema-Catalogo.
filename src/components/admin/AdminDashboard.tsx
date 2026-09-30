"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Category, ProductWithCategory } from "@/types/database";
import { deleteProduct, listProducts } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";
import { formatTitle } from "@/lib/utils";
import ProductThumb from "@/components/admin/ProductThumb";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const CURATED_CATEGORIES = ["iPhone", "Accesorios", "Ropa", "Perfumes"];

export function AdminDashboard({
  initialProducts,
  categories,
}: {
  initialProducts: ProductWithCategory[];
  categories: Category[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ProductWithCategory | null>(null);
  const [deleting, setDeleting] = useState<ProductWithCategory | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        (product.categories?.name ?? "Sin categoría").toLowerCase() ===
          selectedCategory.toLowerCase();

      const matchesSearch =
        !query ||
        product.title.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.model.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const refresh = useCallback(async () => {
    const result = await listProducts();
    setProducts(result.products);
  }, []);

  function handleModalClose() {
    setCreating(false);
    setEditing(null);
  }

  function handleSaved() {
    void refresh();
    setCreating(false);
    setEditing(null);
    setNotice("Producto guardado correctamente.");
  }

  async function handleDelete() {
    if (!deleting) return;

    setDeletingBusy(true);
    const result = await deleteProduct(deleting.id);
    setDeletingBusy(false);

    if (!result.ok) {
      setNotice(result.message ?? "No se pudo eliminar el producto.");
      setDeleting(null);
      return;
    }

    void refresh();
    setDeleting(null);
    setNotice("Producto eliminado correctamente.");
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">
          Productos
          <span className="ml-2 align-middle text-base font-bold text-zinc-400">
            ({products.length})
          </span>
        </h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
        >
          ➕ Agregar Nuevo Producto
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Buscar por título, marca o modelo…"
          className="w-full max-w-xs rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="all">Todas las categorías</option>
          {Array.from(
            new Set([
              ...CURATED_CATEGORIES,
              ...categories.map((category) => category.name),
            ])
          ).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
          <option value="Sin categoría">Sin categoría</option>
        </select>
        {filteredProducts.length !== products.length ? (
          <span className="text-sm font-medium text-zinc-500">
            {filteredProducts.length} de {products.length} productos
          </span>
        ) : null}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {products.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <p className="text-lg font-bold text-zinc-900">Sin productos aún</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Usa el botón &quot;Agregar Nuevo Producto&quot; para publicar tu primer
              equipo en el catálogo.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <p className="text-lg font-bold text-zinc-900">
              Sin resultados para el filtro
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Prueba con otra búsqueda o categoría.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3 font-semibold">Imagen</th>
                  <th className="px-5 py-3 font-semibold">Marca / Modelo</th>
                  <th className="px-5 py-3 font-semibold">Especificaciones</th>
                  <th className="px-5 py-3 font-semibold">Precio (S/)</th>
                  <th className="px-5 py-3 font-semibold">Stock</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="transition hover:bg-zinc-50">
                    <td className="px-5 py-3">
                      <ProductThumb src={product.image_url} alt={product.title} />
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-bold text-zinc-900">
                        {formatTitle(product.brand)}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatTitle(product.title)}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-zinc-600">
                      {[product.storage, product.color]
                        .filter(Boolean)
                        .map((value) => formatTitle(value as string))
                        .join(" · ") || "—"}
                    </td>
                    <td className="px-5 py-3 font-semibold text-zinc-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-5 py-3 text-zinc-600">
                      <span
                        className={
                          product.stock === 0 ? "font-semibold text-red-600" : ""
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(product)}
                          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-100"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(product)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(creating || editing) ? (
        <ProductFormModal
          product={editing}
          categories={categories}
          onClose={handleModalClose}
          onSaved={handleSaved}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar producto"
        message={
          deleting
            ? `¿Seguro que deseas eliminar "${deleting.title}"? Esta acción no se puede deshacer.`
            : ""
        }
        busy={deletingBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      {notice ? (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[80] rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-lg"
        >
          {notice}
        </div>
      ) : null}
    </>
  );
}