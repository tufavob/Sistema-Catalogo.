"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import type {
  Category,
  ProductInput,
  ProductStatus,
  ProductWithCategory,
} from "@/types/database";
import { createProduct, updateProduct } from "@/app/admin/actions";
import {
  isSupportedImageType,
  SUPABASE_STORAGE_BUCKET,
  uploadProductImage,
} from "@/lib/supabase/browser";
import { formatTitle, parseColors, parseImages } from "@/lib/utils";
import { CATEGORY_LABELS, FEATURED_CATEGORIES } from "@/lib/categories";
import { PhoneIcon } from "@/components/icons";

const BRAND_SUGGESTIONS = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "Huawei",
  "Motorola",
  "OPPO",
  "Vivo",
  "Realme",
  "OnePlus",
  "Google",
];

function categoryOrder(a: Category, b: Category): number {
  const indexA = FEATURED_CATEGORIES.indexOf(a.name);
  const indexB = FEATURED_CATEGORIES.indexOf(b.name);
  return (
    (indexA === -1 ? FEATURED_CATEGORIES.length : indexA) -
      (indexB === -1 ? FEATURED_CATEGORIES.length : indexB) ||
    a.name.localeCompare(b.name)
  );
}

type FormState = {
  title: string;
  brand: string;
  model: string;
  storage: string;
  color: string;
  price: string;
  stock: string;
  status: ProductStatus;
  description: string;
  category_id: string;
  image_url: string;
  color_galleries: string;
};

export function ProductFormModal({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: ProductWithCategory | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    title: product?.title ? formatTitle(product.title) : "",
    brand: product?.brand ? formatTitle(product.brand) : "",
    model: product?.model ? formatTitle(product.model) : "",
    storage: product?.storage ? formatTitle(product.storage) : "",
    color: product?.color ? formatTitle(product.color) : "",
    price: product ? String(product.price) : "",
    stock: product ? String(product.stock) : "1",
    status: product?.status ?? "available",
    description: product?.description ?? "",
    category_id:
      product?.category_id ??
      categories.find((category) => category.name === "iPhone")?.id ??
      categories[0]?.id ??
      "",
    image_url: product?.image_url ?? "",
    color_galleries:
      typeof product?.color_galleries === "string"
        ? product.color_galleries
        : product?.color_galleries
          ? JSON.stringify(product.color_galleries, null, 2)
          : "",
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [urlDraft, setUrlDraft] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function appendImages(urls: string[]) {
    if (urls.length === 0) return;
    const existing = parseImages(form.image_url);
    setField("image_url", [...existing, ...urls].join(", "));
    setPreviewFailed(false);
  }

  function removeImage(target: string) {
    const remaining = parseImages(form.image_url).filter(
      (url) => url !== target,
    );
    setField("image_url", remaining.join(", "));
    setPreviewFailed(false);
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      const urls: string[] = [];

      for (const file of files) {
        urls.push(await uploadProductImage(file));
      }

      appendImages(urls);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "No se pudo subir la imagen. Intenta nuevamente.",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    await uploadFiles(Array.from(event.target.files ?? []));
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files ?? []);
    const invalid = files.filter((file) => !isSupportedImageType(file));

    if (invalid.length > 0) {
      setUploadError(
        `Archivo no permitido: ${invalid.map((file) => file.name).join(", ")}. ` +
          "Usa JPG, PNG, WEBP, GIF o AVIF.",
      );
      if (files.length === invalid.length) return;
    }

    await uploadFiles(files.filter(isSupportedImageType));
  }

  function addUrlFromDraft() {
    const raw = urlDraft.trim();

    if (!raw) {
      setUploadError("Escribe la URL de la imagen.");
      return;
    }

    const candidates = raw
      .split(/[\n,]+/)
      .map((value) => value.trim())
      .filter(Boolean);

    const validCandidates = candidates.filter((value) =>
      /^https?:\/\//i.test(value),
    );
    const invalid = candidates.filter((value) => !/^https?:\/\//i.test(value));

    if (validCandidates.length === 0) {
      setUploadError(
        "Cada URL debe empezar con http:// o https:// (ej: https://ejemplo.com/foto.jpg).",
      );
      return;
    }

    if (invalid.length > 0) {
      setUploadError(`URL inválida ignorada: ${invalid.join(", ")}`);
    }

    const existing = parseImages(form.image_url);
    const unique = validCandidates.filter((value) => !existing.includes(value));

    if (unique.length === 0) {
      setUploadError("Esa URL ya está en la galería del producto.");
      return;
    }

    appendImages(unique);
    setUrlDraft("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const price = Number.parseFloat(form.price);
    const stock = Number.parseInt(form.stock || "0", 10);

    if (!Number.isFinite(price) || price < 0) {
      setFormError("Ingresa un precio válido.");
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      setFormError("Ingresa un stock válido.");
      return;
    }
    if (!form.title.trim() || !form.brand.trim() || !form.model.trim()) {
      setFormError("Título, marca y modelo son obligatorios.");
      return;
    }

    const cleanedColors = parseColors(form.color);
    const input: ProductInput = {
      title: formatTitle(form.title),
      brand: formatTitle(form.brand),
      model: formatTitle(form.model),
      storage: form.storage ? formatTitle(form.storage) : null,
      color: cleanedColors.length > 0 ? cleanedColors.join(", ") : null,
      price,
      stock,
      status: form.status,
      description: form.description || null,
      category_id: form.category_id || null,
      image_url: form.image_url || null,
      color_galleries: form.color_galleries.trim() || null,
    };

    setSaving(true);
    setFormError(null);

    const result = product
      ? await updateProduct(product.id, input)
      : await createProduct(input);

    setSaving(false);

    if (!result.ok) {
      setFormError(
        result.message ?? "Ocurrió un error al guardar el producto.",
      );
      return;
    }

    onSaved();
  }

  const previewUrl = parseImages(form.image_url)[0] ?? null;
  const imageCount = parseImages(form.image_url).length;
  const showPreview = Boolean(previewUrl) && !previewFailed;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-black uppercase tracking-wide text-zinc-900">
            {product ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-6 overflow-y-auto px-6 py-6"
        >
          {formError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {formError}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="field-title"
                className="mb-1.5 block text-sm font-semibold text-zinc-700"
              >
                Título
              </label>
              <input
                id="field-title"
                required
                value={form.title}
                onChange={(event) => setField("title", event.target.value)}
                placeholder="iPhone 14 Pro Max"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label
                htmlFor="field-brand"
                className="mb-1.5 block text-sm font-semibold text-zinc-700"
              >
                Marca
              </label>
              <input
                id="field-brand"
                list="brand-suggestions"
                required
                value={form.brand}
                onChange={(event) => setField("brand", event.target.value)}
                placeholder="Apple, Samsung, Xiaomi…"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <datalist id="brand-suggestions">
                {BRAND_SUGGESTIONS.map((brand) => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
            </div>

            <div>
              <label
                htmlFor="field-model"
                className="mb-1.5 block text-sm font-semibold text-zinc-700"
              >
                Modelo
              </label>
              <input
                id="field-model"
                required
                value={form.model}
                onChange={(event) => setField("model", event.target.value)}
                placeholder="A2650"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="field-storage"
                className="mb-1.5 block text-sm font-semibold text-zinc-700"
              >
                Almacenamiento
              </label>
              <input
                id="field-storage"
                value={form.storage}
                onChange={(event) => setField("storage", event.target.value)}
                placeholder="128GB"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label
                htmlFor="field-color"
                className="mb-1.5 block text-sm font-semibold text-zinc-700"
              >
                Color(es)
              </label>
              <input
                id="field-color"
                value={form.color}
                onChange={(event) => setField("color", event.target.value)}
                placeholder="Ej: Negro Mate, Titanio Natural, Blanco"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <p className="mt-1.5 text-xs leading-5 text-zinc-500">
                Si tienes varios colores, sepáralos por comas (ejemplo: Negro
                Mate, Titanio Natural, Azul Sierra)
              </p>
            </div>

            <div>
              <label
                htmlFor="field-price"
                className="mb-1.5 block text-sm font-semibold text-zinc-700"
              >
                Precio (S/)
              </label>
              <input
                id="field-price"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(event) => setField("price", event.target.value)}
                placeholder="2499"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label
                htmlFor="field-stock"
                className="mb-1.5 block text-sm font-semibold text-zinc-700"
              >
                Stock
              </label>
              <input
                id="field-stock"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                required
                value={form.stock}
                onChange={(event) => setField("stock", event.target.value)}
                placeholder="10"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label
                htmlFor="field-status"
                className="mb-1.5 block text-sm font-semibold text-zinc-700"
              >
                Estado
              </label>
              <select
                id="field-status"
                value={form.status}
                onChange={(event) =>
                  setField("status", event.target.value as ProductStatus)
                }
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="available">Disponible</option>
                <option value="out_of_stock">Agotado</option>
                <option value="promo">Promo</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="field-category"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-700"
              >
                Categoría del Producto
              </label>
              <select
                id="field-category"
                required
                value={form.category_id}
                onChange={(event) =>
                  setField("category_id", event.target.value)
                }
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-black focus:ring-2 focus:ring-zinc-200"
              >
                {categories.length === 0 ? (
                  <option value="">Sin categoría</option>
                ) : (
                  [...categories].sort(categoryOrder).map((category) => (
                    <option key={category.id} value={category.id}>
                      {CATEGORY_LABELS[category.name] ?? category.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 p-4">
            <p className="text-sm font-bold text-zinc-900">
              Imagen del producto
            </p>
            <div className="mt-3 flex flex-wrap items-start gap-4">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                {showPreview ? (
                  <img
                    src={previewUrl as string}
                    alt="Vista previa del producto"
                    className="h-full w-full object-cover"
                    onError={() => setPreviewFailed(true)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PhoneIcon className="h-8 w-8 text-zinc-300" />
                  </div>
                )}
                {imageCount > 0 ? (
                  <span className="absolute bottom-1 right-1 rounded-md bg-zinc-900/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {imageCount} foto{imageCount > 1 ? "s" : ""}
                  </span>
                ) : null}
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <div
                  role="tablist"
                  aria-label="Origen de las imágenes"
                  className="inline-flex rounded-xl border border-zinc-300 bg-zinc-100 p-1"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={imageTab === "upload"}
                    onClick={() => setImageTab("upload")}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                      imageTab === "upload"
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    Archivo local
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={imageTab === "url"}
                    onClick={() => setImageTab("url")}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                      imageTab === "url"
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    URL directa
                  </button>
                </div>

                {imageTab === "upload" ? (
                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`rounded-xl border-2 border-dashed px-4 py-5 text-center transition ${
                      isDragging
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-zinc-300 bg-zinc-50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <p className="text-xs leading-5 text-zinc-600">
                      Arrastra tus imágenes aquí o
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="mt-2 inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-60"
                    >
                      {uploading
                        ? "Subiendo imágenes…"
                        : "Seleccionar archivos"}
                    </button>
                    <p className="mt-2 text-[11px] leading-4 text-zinc-500">
                      JPG, PNG, WEBP, GIF o AVIF · máx. 5 MB por archivo. Se
                      guardan en el bucket público “{SUPABASE_STORAGE_BUCKET}”
                      de Supabase Storage.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        inputMode="url"
                        value={urlDraft}
                        onChange={(event) => setUrlDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addUrlFromDraft();
                          }
                        }}
                        placeholder="https://ejemplo.com/foto.jpg"
                        aria-label="URL de la imagen"
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                      <button
                        type="button"
                        onClick={addUrlFromDraft}
                        className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        Agregar
                      </button>
                    </div>
                    <p className="text-xs leading-5 text-zinc-500">
                      Pega una o varias URLs separadas por comas o saltos de
                      línea. Se agregan directo a la galería, sin pasar por
                      Storage.
                    </p>
                  </div>
                )}

                {uploadError ? (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium leading-5 text-red-700"
                  >
                    {uploadError}
                  </p>
                ) : null}

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Galería ({imageCount})
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {parseImages(form.image_url).map((url, position) => (
                      <li
                        key={url}
                        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5"
                      >
                        <span className="w-5 shrink-0 text-[11px] font-bold text-zinc-400">
                          {position + 1}
                        </span>
                        <img
                          src={url}
                          alt=""
                          loading="lazy"
                          className="h-8 w-8 shrink-0 rounded object-cover"
                          onError={(event) => {
                            event.currentTarget.style.visibility = "hidden";
                          }}
                        />
                        <span className="min-w-0 flex-1 truncate text-[11px] text-zinc-600">
                          {url}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          aria-label={`Quitar imagen ${position + 1}`}
                          className="shrink-0 rounded-md px-2 py-1 text-[11px] font-bold text-red-600 transition hover:bg-red-50"
                        >
                          Quitar
                        </button>
                      </li>
                    ))}
                  </ul>
                  {imageCount === 0 ? (
                    <p className="mt-2 text-xs text-zinc-500">
                      Sin imágenes todavía. Agrega al menos una para que el
                      producto se vea en el catálogo.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="field-description"
              className="mb-1.5 block text-sm font-semibold text-zinc-700"
            >
              Descripción
            </label>
            <textarea
              id="field-description"
              rows={3}
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
              placeholder="Estado, garantía, accesorios incluidos…"
              className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving
                ? "Guardando…"
                : product
                  ? "Guardar cambios"
                  : "Crear producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
