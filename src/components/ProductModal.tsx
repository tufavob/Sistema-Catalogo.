"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/types/database";
import { formatPrice } from "@/lib/format";
import { buildProductWhatsAppLink } from "@/lib/whatsapp";
import {
  formatTitle,
  parseColorGalleries,
  parseColors,
  parseImages,
  parseVariants,
} from "@/lib/utils";
import { colorNameOf, resolveColorImages } from "@/lib/product-gallery";
import { CloseIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";

const STATUS_VIEW: Record<
  Product["status"],
  { label: string; className: string; dotClassName: string }
> = {
  available: {
    label: "Disponible",
    className: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
  },
  promo: {
    label: "Oferta",
    className: "border-amber-500/25 bg-amber-50 text-amber-800",
    dotClassName: "bg-amber-500",
  },
  out_of_stock: {
    label: "Agotado",
    className: "border-rose-500/25 bg-rose-50 text-rose-700",
    dotClassName: "bg-rose-500",
  },
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const ARROW_CLASS =
  "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-md backdrop-blur transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900";

export function ProductModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const gallery = parseImages(product.image_url);
  const colors = parseColors(product.color);
  const storages = parseVariants(product.storage);
  const colorGalleries = parseColorGalleries(product.color_galleries);

  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const [selectedStorage, setSelectedStorage] = useState(storages[0] ?? "");

  const activeImages = resolveColorImages(
    selectedColor,
    colors,
    colorGalleries,
    gallery,
  );
  const currentImage = activeImages[imageIndex] || activeImages[0] || null;
  const showImage = Boolean(currentImage) && !imageFailed;
  const showNavigation = activeImages.length > 1 && showImage;
  const status = STATUS_VIEW[product.status];
  const isOutOfStock = product.status === "out_of_stock";
  const title = formatTitle(product.title);
  const selectedColorName = colorNameOf(selectedColor);

  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    return () => restoreFocusRef.current?.focus?.();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const totalImages = activeImages.length;

  function goToImage(next: number) {
    if (totalImages === 0) return;

    setImageFailed(false);
    setImageIndex(((next % totalImages) + totalImages) % totalImages);
  }

  function handleColorSelect(color: string) {
    if (color === selectedColor) return;

    setSelectedColor(color);
    setImageIndex(0);
    setImageFailed(false);
  }

  const whatsappUrl = buildProductWhatsAppLink({
    id: product.id,
    title,
    storage: selectedStorage || null,
    color: selectedColorName || null,
    price: product.price,
  });

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-zinc-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[88vh] sm:rounded-2xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle del producto"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm backdrop-blur transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] overflow-y-auto md:grid-cols-2 md:grid-rows-1 md:overflow-hidden">
          <div className="relative aspect-square bg-zinc-100 md:aspect-auto md:h-full md:min-h-0">
            {showImage ? (
              <img
                src={currentImage as string}
                alt={`${title} — ${selectedColorName || "imagen del producto"}`}
                draggable={false}
                onError={() => setImageFailed(true)}
                className="h-full w-full select-none object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
                <PhoneIcon className="h-12 w-12 text-zinc-300" />
              </div>
            )}

            {showNavigation ? (
              <>
                <button
                  type="button"
                  onClick={() => goToImage(imageIndex - 1)}
                  aria-label="Imagen anterior"
                  className={`${ARROW_CLASS} left-2`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 6l-6 6 6 6"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => goToImage(imageIndex + 1)}
                  aria-label="Imagen siguiente"
                  className={`${ARROW_CLASS} right-2`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 6l6 6-6 6"
                    />
                  </svg>
                </button>

                <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-zinc-950/60 px-2.5 py-1.5 backdrop-blur">
                  <span className="mr-1 text-[11px] font-semibold tabular-nums text-white">
                    {imageIndex + 1}/{activeImages.length}
                  </span>
                  {activeImages.map((image, position) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => goToImage(position)}
                      aria-label={`Ver imagen ${position + 1}`}
                      aria-pressed={imageIndex === position}
                      className="-m-1 p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <span
                        className={`block h-1.5 rounded-full transition-all ${
                          imageIndex === position
                            ? "w-4 bg-white"
                            : "w-1.5 bg-white/50 hover:bg-white/80"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-5 md:overflow-y-auto md:p-6">
            <div>
              <span className={`badge ${status.className}`}>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`}
                  aria-hidden="true"
                />
                {status.label}
              </span>

              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                {product.brand}
                {product.model ? ` · ${formatTitle(product.model)}` : null}
              </p>

              <h2
                id="product-modal-title"
                className="mt-1 text-xl font-black leading-tight text-zinc-900 sm:text-2xl"
              >
                {title}
              </h2>

              {product.storage ? (
                <span className="badge mt-3 border-zinc-200 bg-zinc-100 text-zinc-700">
                  {selectedStorage || formatTitle(product.storage)}
                </span>
              ) : null}
            </div>

            <p className="text-2xl font-black text-zinc-900">
              {formatPrice(product.price)}
            </p>

            {colors.length > 1 ? (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  <span>Color:</span>
                  <span>{selectedColorName}</span>
                </p>
                <div
                  role="group"
                  aria-label="Seleccionar color"
                  className="flex flex-wrap gap-2"
                >
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      aria-pressed={selectedColor === color}
                      className={`variant ${selectedColor === color ? "variant-active" : "variant-idle"}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {storages.length > 1 ? (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <span>Capacidad:</span>
                  <span className="text-zinc-700">{selectedStorage}</span>
                </p>
                <div
                  role="group"
                  aria-label="Seleccionar capacidad"
                  className="flex flex-wrap gap-2"
                >
                  {storages.map((storage) => (
                    <button
                      key={storage}
                      type="button"
                      onClick={() => setSelectedStorage(storage)}
                      aria-pressed={selectedStorage === storage}
                      className={`variant ${selectedStorage === storage ? "variant-active" : "variant-idle"}`}
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {product.description ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Descripción
                </h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-700">
                  {product.description}
                </p>
              </div>
            ) : null}

            <div className="mt-auto pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => {
                  const url = buildProductWhatsAppLink(
                    {
                      id: product.id,
                      title,
                      storage: selectedStorage || null,
                      color: selectedColorName || null,
                      price: product.price,
                    },
                    `${window.location.origin}${window.location.pathname}#producto-${product.id}`,
                  );
                  window.open(url, "_blank", "noopener,noreferrer");
                  event.preventDefault();
                }}
                aria-label={
                  isOutOfStock
                    ? `Consultar disponibilidad de ${title} por WhatsApp`
                    : `Pedir ${title} por WhatsApp`
                }
                className="btn btn-whatsapp text-sm"
              >
                <WhatsAppIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {isOutOfStock
                    ? "Consultar por WhatsApp"
                    : "Pedir por WhatsApp"}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
