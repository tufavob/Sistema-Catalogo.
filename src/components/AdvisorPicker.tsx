"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode, Ref } from "react";
import { ADVISORS, type Advisor } from "@/lib/constants";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";

type AdvisorPickerProps = {
  children: ReactNode;
  message?: string;
  getHref?: (advisor: Advisor) => string;
  wrapperClassName?: string;
  className?: string;
  menuAlign?: "left" | "right";
  buttonRef?: Ref<HTMLButtonElement>;
};

export function AdvisorPicker({
  children,
  message,
  getHref,
  wrapperClassName,
  className,
  menuAlign = "left",
  buttonRef,
}: AdvisorPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const hrefFor =
    getHref ??
    ((advisor: Advisor) => buildWhatsAppLink(message ?? "", advisor));

  return (
    <div ref={containerRef} className={`relative ${wrapperClassName ?? ""}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={className}
      >
        {children}
      </button>

      {open ? (
        <div
          role="menu"
          className={`absolute top-full z-[80] mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1 shadow-xl ${
            menuAlign === "right" ? "right-0" : "left-0"
          }`}
        >
          {ADVISORS.map((advisor) => (
            <a
              key={advisor.id}
              role="menuitem"
              href={hrefFor(advisor)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-zinc-100"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-zinc-950">
                <WhatsAppIcon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-zinc-900">
                  {advisor.name}
                </span>
                <span className="block text-xs leading-4 text-zinc-500">
                  {advisor.role}
                </span>
              </span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
