"use client";

import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import {
  BadgeCheckIcon,
  ShieldCheckIcon,
  TruckIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const heroMessage =
  "Hola, me gustaría pedir información sobre el catálogo de celulares Northumbria.";

const TRUST_BADGES = [
  {
    icon: ShieldCheckIcon,
    title: "Garantía",
    detail: "Cubierta en cada compra",
  },
  { icon: BadgeCheckIcon, title: "Equipos", detail: "100% verificados" },
  { icon: TruckIcon, title: "Envíos", detail: "Seguimiento asegurado" },
];

const HIGHLIGHTS = [
  "Envíos a todo el Perú",
  "Equipos 100% verificados",
  "Garantía en cada compra",
  "Pago por transferencia",
  "Pedidos directos por WhatsApp",
];

export function Hero() {
  const cardRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;

    const card = cardRef.current;
    if (!card) return;

    const bounds = card.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);

    const cta = ctaRef.current;
    if (cta) {
      cta.style.setProperty("--pull-x", `${((x - 50) / 50) * 7}px`);
      cta.style.setProperty("--pull-y", `${((y - 50) / 50) * 5}px`);
    }
  }

  function handlePointerLeave() {
    const card = cardRef.current;
    card?.style.setProperty("--mx", "50%");
    card?.style.setProperty("--my", "0%");

    const cta = ctaRef.current;
    cta?.style.setProperty("--pull-x", "0px");
    cta?.style.setProperty("--pull-y", "0px");
  }

  return (
    <div className="px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4">
      <section
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative isolate w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl"
      >
        {/* IMAGEN DE FONDO COMPLETA */}
        <Image
          alt="Northumbria Logo Fondo"
          src="/logo.jpeg"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center -z-20 opacity-80"
        />

        {/* OVERLAY OSCURO */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/60 -z-10"
        />

        {/* EFECTO DE REJILLA SUTIL */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-[0.03] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]"
        />

        {/* CONTENIDO PRINCIPAL */}
        <div className="relative z-10 mx-auto flex min-h-[400px] w-full max-w-7xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-10 md:min-h-[480px] md:py-12">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
            {/* TÍTULO EN AMARILLO (text-amber-400) */}
            <h1
              className="hero-enter text-3xl font-black uppercase tracking-tight text-amber-400 drop-shadow-md sm:text-4xl md:text-5xl"
              style={{ "--d": "90ms" } as never}
            >
              Northumbria
            </h1>

            {/* DESCRIPCIÓN DE LA MARCA */}
            <p
              className="hero-enter mt-3 max-w-md text-sm leading-6 text-zinc-200 drop-shadow sm:text-center"
              style={{ "--d": "180ms" } as never}
            >
              Celulares, accesorios seleccionados y ropa exclusiva con envío
              asegurado y atención inmediata.
            </p>

            <div
              className="hero-enter mt-6 flex flex-col gap-3 sm:flex-row"
              style={{ "--d": "260ms" } as never}
            >
              <a
                ref={ctaRef}
                href={buildWhatsAppLink(heroMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-magnetic"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Pedir por WhatsApp
              </a>
              <a href="#catalogo" className="btn btn-ghost-dark">
                Ver catálogo
              </a>
            </div>
          </div>

          <ul
            className="hero-enter mt-8 grid grid-cols-3 gap-2 border-t border-white/10 pt-5 sm:mt-auto sm:gap-3 sm:pt-6"
            style={{ "--d": "340ms" } as never}
          >
            {TRUST_BADGES.map(({ icon: Icon, title, detail }) => (
              <li
                key={title}
                className="trust-badge transition-transform duration-300 hover:-translate-y-0.5"
              >
                <Icon className="h-4 w-4 shrink-0 text-amber-400 sm:h-5 sm:w-5" />
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold text-white sm:text-xs">
                    {title}
                  </span>
                  <span className="mt-0.5 hidden text-[11px] leading-4 text-zinc-300 sm:block">
                    {detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MARQUEE INFERIOR */}
      <div className="marquee mt-3 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 py-2.5 sm:mt-4">
        <div className="marquee-track gap-10">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 items-center gap-10"
              aria-hidden={copy === 1}
            >
              {HIGHLIGHTS.map((highlight) => (
                <span
                  key={`${copy}-${highlight}`}
                  className="flex items-center gap-10 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-300"
                >
                  {highlight}
                  <span className="h-1 w-1 rounded-full bg-amber-400" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
