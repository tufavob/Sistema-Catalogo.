import type { ProductStatus } from "@/types/database";

export const STATUS_LABEL: Record<ProductStatus, string> = {
  available: "Disponible",
  out_of_stock: "Agotado",
  promo: "Promo",
};

const STATUS_STYLES: Record<string, string> = {
  // Disponible (Verde)
  available: "bg-emerald-100 text-emerald-800 border-emerald-200",
  disponible: "bg-emerald-100 text-emerald-800 border-emerald-200",

  // Agotado (Rojo)
  out_of_stock: "bg-rose-100 text-rose-800 border-rose-200",
  agotado: "bg-rose-100 text-rose-800 border-rose-200",

  // Promoción / Promo (Amarillo)
  promo: "bg-amber-100 text-amber-800 border-amber-200",
  promocion: "bg-amber-100 text-amber-800 border-amber-200",
  "promoción": "bg-amber-100 text-amber-800 border-amber-200",
};

export function getStatusBadgeClass(status: string): string {
  const normalized = (status || "").toLowerCase();
  return STATUS_STYLES[normalized] ?? STATUS_STYLES.available;
}