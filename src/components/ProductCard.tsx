"use client";

import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Product, ProductStatus } from "@/types/database";
import { buildProductWhatsAppLink } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";
import {
  formatTitle,
  parseColors,
  parseImages,
  parseVariants,
} from "@/lib/utils";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons";

const CARD_STATUS: Record<
  ProductStatus,
  { label: string; badgeClassName: string; dotClassName: string }
> = {
  available: {
    label: "Disponible",
    badgeClassName: "badge-available",
    dotClassName: "bg-emerald-500",
  },
  promo: {
    label: "Oferta",
    badgeClassName: "badge-promo",
    dotClassName: "bg-amber-500",
  },
  out_of_stock: {
    label: "Agotado",
    badgeClassName: "badge-sold-out",
    dotClassName: "bg-rose-500",
  },
};

const SWIPE_THRESHOLD = 40;

const ARROW_CLASS =
  "absolute top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-zinc-900 opacity-100 shadow-sm backdrop-blur transition hover:bg-white focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100";

export function ProductCard({ product }: { product: Product }) {
  const images = parseImages(product.image_url);
  const colors = parseColors(product.color);
  const storages = parseVariants(product.storage);

  const cardRef = useRef<HTMLElement>(null);
  const swipeRef = useRef<{ x: number; y: number; pointerId: number } | null>(
    null,
  );
  const [imageIndex, setImageIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const [selectedStorage, setSelectedStorage] = useState(storages[0] ?? "");

  const isOutOfStock = product.status === "out_of_stock";
  const currentImage = images[imageIndex] ?? images[0] ?? null;
  const showImage = Boolean(currentImage) && !imageFailed;
  const canBrowse = images.length > 1 && showImage;
  const showArrows = images.length >= 3 && showImage;
  const status = CARD_STATUS[product.status];
  const title = formatTitle(product.title);

  const productLinkData = {
    id: product.id,
    title,
    storage:
      selectedStorage ||
      (product.storage ? formatTitle(product.storage) : null),
    color: selectedColor || null,
    price: product.price,
  };
  const whatsappUrl = buildProductWhatsAppLink(productLinkData);

  function goToImage(next: number) {
    const total = images.length;
    if (total === 0) return;
    const wrapped = ((next % total) + total) % total;
    setImageFailed(false);
    setImageIndex(wrapped);
  }

  function handleColorSelect(color: string) {
    setSelectedColor(color);
    const colorIndex = colors.indexOf(color);
    if (images.length > 1 && colorIndex >= 0) {
      goToImage(Math.min(colorIndex, images.length - 1));
    }
  }

  function handleMediaPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!canBrowse || !event.isPrimary) return;
    if ((event.target as HTMLElement).closest("button")) return;

    swipeRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleMediaPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const start = swipeRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    swipeRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (
      Math.abs(deltaX) < SWIPE_THRESHOLD ||
      Math.abs(deltaX) <= Math.abs(deltaY)
    ) {
      return;
    }

    goToImage(imageIndex + (deltaX < 0 ? 1 : -1));
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;

    const card = cardRef.current;
    if (!card) return;

    const bounds = card.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

    card.style.setProperty("--tilt-x", `${(-offsetY * 4).toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${(offsetX * 5).toFixed(2)}deg`);
    card.style.setProperty(
      "--glow-x",
      `${((offsetX + 0.5) * 100).toFixed(1)}%`,
    );
    card.style.setProperty(
      "--glow-y",
      `${((offsetY + 0.5) * 100).toFixed(1)}%`,
    );
  }

  function handlePointerLeave() {
    const card = cardRef.current;
    if (!card) return;

    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <article
      ref={cardRef}
      id={`producto-${product.id}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="card group"
    >
      <div
        className="relative aspect-[4/5] touch-pan-y overflow-hidden bg-zinc-100"
        onPointerDown={handleMediaPointerDown}
        onPointerUp={handleMediaPointerUp}
        onPointerCancel={handleMediaPointerUp}
      >
        {showImage ? (
          <img
            src={currentImage as string}
            alt={title}
            loading="lazy"
            draggable={false}
            onError={() => setImageFailed(true)}
            className="pointer-events-none h-full w-full select-none object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
            <PhoneIcon className="h-10 w-10 text-zinc-300 sm:h-14 sm:w-14" />
          </div>
        )}

        <div aria-hidden="true" className="card-glare" />

        <span
          className={`badge absolute left-2.5 top-2.5 z-10 ${status.badgeClassName}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`}
            aria-hidden="true"
          />
          {status.label}
        </span>

        {showArrows ? (
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
                className="h-3.5 w-3.5"
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
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 6l6 6-6 6"
                />
              </svg>
            </button>
          </>
        ) : null}

        {images.length > 1 ? (
          <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5">
            {images.map((image, position) => (
              <button
                key={image}
                type="button"
                onClick={() => goToImage(position)}
                aria-label={`Ver imagen ${position + 1}`}
                aria-pressed={imageIndex === position}
                className="-m-1.5 p-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all ${
                    imageIndex === position
                      ? "w-4 bg-zinc-950/80"
                      : "w-1.5 bg-zinc-950/30 hover:bg-zinc-950/50"
                  }`}
                />
              </button>
            ))}
          </div>
        ) : null}

        {showArrows ? (
          <span className="absolute bottom-2.5 right-2.5 z-10 rounded-full bg-zinc-950/60 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white backdrop-blur">
            {imageIndex + 1}/{images.length}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-2.5 sm:p-4">
        <div>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-zinc-900 sm:text-base">
            {title}
          </h3>
          <p className="mt-1 truncate text-[11px] text-zinc-500 sm:text-xs">
            {product.brand}
            {product.model ? ` · ${formatTitle(product.model)}` : null}
          </p>
        </div>

        {storages.length > 1 ? (
          <VariantPicker
            label="Capacidad"
            options={storages}
            selected={selectedStorage}
            onSelect={setSelectedStorage}
          />
        ) : null}

        {colors.length > 0 ? (
          <VariantPicker
            accent
            label="Color"
            options={colors}
            selected={selectedColor}
            onSelect={handleColorSelect}
          />
        ) : null}

        <p className="mt-auto pt-1 text-base font-bold text-zinc-900 sm:text-lg">
          {formatPrice(product.price)}
        </p>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => {
            const url = buildProductWhatsAppLink(
              productLinkData,
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
          className="btn btn-whatsapp mt-0.5 text-xs sm:text-sm"
        >
          <WhatsAppIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {isOutOfStock ? "Consultar" : "Pedir por WhatsApp"}
          </span>
        </a>
      </div>
    </article>
  );
}

function VariantPicker({
  label,
  options,
  selected,
  onSelect,
  accent = false,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  accent?: boolean;
}) {
  return (
    <div>
      <p
        className={`mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider sm:text-xs ${
          accent ? "text-zinc-900" : "text-zinc-500"
        }`}
      >
        <span>{label}:</span>
        {selected ? (
          <span className={accent ? "text-amber-500" : undefined}>
            {selected}
          </span>
        ) : null}
      </p>
      <div
        role="group"
        aria-label={`Seleccionar ${label.toLowerCase()}`}
        className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1"
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            aria-pressed={selected === option}
            className={`variant ${selected === option ? "variant-active" : "variant-idle"}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
