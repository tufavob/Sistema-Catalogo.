const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51916196809";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppLink(
  product: {
    id: string | number;
    title: string;
    storage?: string | null;
    color?: string | null;
    price: number;
  },
  productUrl?: string,
): string {
  const url =
    productUrl ||
    (SITE_URL ? `${SITE_URL.replace(/\/$/, "")}#producto-${product.id}` : "");

  const mobileEmoji = "\uD83D\uDCF1";
  const storageEmoji = "\uD83D\uDCBE";
  const colorEmoji = "\uD83C\uDFA8";
  const linkEmoji = "\uD83D\uDD17";

  const lines = [
    "Hola Northumbria, estoy interesado en el siguiente producto:",
    "",
    `${mobileEmoji} *${product.title}*`,
    product.storage ? `${storageEmoji} Capacidad: ${product.storage}` : null,
    product.color ? `${colorEmoji} Color: ${product.color}` : null,
    `💰 Precio: S/ ${product.price.toLocaleString("es-PE", {
      minimumFractionDigits: 2,
    })}`,
    url ? `${linkEmoji} Ver en tienda: ${url}` : null,
    "",
    "¿Sigue disponible para realizar la compra?",
  ].filter((line): line is string => Boolean(line));

  const text = lines.join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
