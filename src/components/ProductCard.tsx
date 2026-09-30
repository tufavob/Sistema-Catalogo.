"use client";

import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Product, ProductStatus } from "@/types/database";
import { buildProductWhatsAppLink } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";
import { formatTitle, parseColors, parseImages, parseVariants } from "@/lib/utils";
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

export function ProductCard({ product }: { product: Product }) {
  const images = parseImages(product.image_url);
  const colors = parseColors(product.color);
  const storages = parseVariants(product.storage);

  const cardRef = useRef<HTMLElement>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const [selectedStorage, setSelectedStorage] = useState(storages[0] ?? "");

  const isOutOfStock = product.status === "out_of_stock";
  const currentImage = images[imageIndex] ?? images[0] ?? null;
  const showImage = Boolean(currentImage) && !imageFailed;
  const status = CARD_STATUS[product.status];
  const title = formatTitle(product.title);

  const productLinkData = {
    id: product.id,
    title,
    storage: selectedStorage || (product.storage ? formatTitle(product.storage) : null),
    color: selectedColor || null,
    price: product.price,
  };
  const whatsappUrl = buildProductWhatsAppLink(productLinkData);

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;

    const card = cardRef.current;
    if (!card) return;

    const bounds = card.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

    card.style.setProperty("--tilt-x", `${(-offsetY * 4).toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${(offsetX * 5).toFixed(2)}deg`);
    card.style.setProperty("--glow-x", `${((offsetX + 0.5) * 100).toFixed(1)}%`);
    card.style.setProperty("--glow-y", `${((offsetY + 0.5) * 100).toFixed(1)}%`);
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
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
        {showImage ? (
          <img
            src={currentImage as string}
            alt={title}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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

        {images.length > 1 ? (
          <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5">
            {images.map((image, position) => (
              <button
                key={image}
                type="button"
                onClick={() => {
                  setImageFailed(false);
                  setImageIndex(position);
                }}
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

        {colors.length > 1 ? (
          <VariantPicker
            label="Color"
            options={colors}
            selected={selectedColor}
            onSelect={(color) => {
              setSelectedColor(color);
              const colorIndex = colors.indexOf(color);
              if (images.length > 1 && colorIndex >= 0) {
                setImageFailed(false);
                setImageIndex(Math.min(colorIndex, images.length - 1));
              }
            }}
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
              `${window.location.origin}${window.location.pathname}#producto-${product.id}`
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
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
        {selected ? `: ${selected}` : ""}
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
