"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";
import { useStore } from "@/components/store/StoreProvider";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { FEATURED_CATEGORIES } from "@/lib/categories";
import { SOCIAL_LINKS } from "@/lib/social";

const CATALOG_ID = "catalogo";

function scrollToCatalog() {
  const target = document.getElementById(CATALOG_ID);
  if (!target) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  target.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
}

export function HeaderSearch() {
  const { query, setQuery, category, setCategory } = useStore();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const desktopRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";

      if (isShortcut) {
        event.preventDefault();
        const input = (window.innerWidth < 640 ? mobileRef : desktopRef)
          .current;
        input?.focus({ preventScroll: true });
      }

      if (event.key === "Escape") {
        setOpen(false);
        setFocused(false);
        desktopRef.current?.blur();
        mobileRef.current?.blur();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;

    mobileRef.current?.focus({ preventScroll: true });
  }, [open]);

  function closeSearch() {
    setOpen(false);
    setFocused(false);
    desktopRef.current?.blur();
    mobileRef.current?.blur();
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      closeSearch();
      scrollToCatalog();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
    }
  }

  function handleSelectCategory(name: string) {
    setCategory(name);
    setQuery("");
    closeSearch();
    scrollToCatalog();
  }

  const showQuickAccess = query === "";

  return (
    <>
      {/* CAMPO DE BÚSQUEDA DESKTOP (SIN LOGO AL COSTADO) */}
      <div className="relative hidden w-full max-w-md flex-1 sm:block">
        <SearchField
          inputRef={desktopRef}
          query={query}
          onQueryChange={setQuery}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {focused && showQuickAccess ? (
          <QuickCategories
            activeCategory={category}
            onSelect={handleSelectCategory}
            className="absolute inset-x-0 top-full z-50 mt-2"
          />
        ) : null}
      </div>

      {/* BOTÓN DE BÚSQUEDA MÓVIL */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-search"
        aria-label="Buscar productos"
        className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white sm:hidden"
      >
        {open ? (
          <CloseIcon className="h-5 w-5" />
        ) : (
          <SearchIcon className="h-5 w-5" />
        )}
      </button>

      {/* DESPLEGABLE MÓVIL */}
      {open ? (
        <div
          className="fixed inset-x-0 z-50 border-b border-zinc-800 bg-zinc-950 p-3 sm:hidden"
          style={{ top: "var(--header-height)" }}
        >
          <SearchField
            inputRef={mobileRef}
            query={query}
            onQueryChange={setQuery}
            onKeyDown={handleKeyDown}
          />

          {showQuickAccess ? (
            <>
              <QuickCategories
                activeCategory={category}
                onSelect={handleSelectCategory}
                className="mt-3"
              />
              <MobileSocialLinks onSelect={closeSearch} />
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function QuickCategories({
  activeCategory,
  onSelect,
  className = "",
}: {
  activeCategory: string;
  onSelect: (name: string) => void;
  className?: string;
}) {
  return (
    <div
      aria-label="Categorías principales"
      className={`rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl ${className}`}
    >
      <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
        Categorías principales
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {FEATURED_CATEGORIES.map((name) => {
          const isActive = activeCategory === name;

          return (
            <button
              key={name}
              type="button"
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(name)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? "border-amber-400/60 bg-amber-400/15 text-amber-300"
                  : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MobileSocialLinks({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl">
      <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
        Síguenos
      </p>

      <ul className="mt-2 flex flex-wrap gap-2">
        {SOCIAL_LINKS.map(({ label, href, Icon, placeholder }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onSelect}
              aria-label={
                placeholder
                  ? `${label} (próximamente)`
                  : `${label} de Northumbria`
              }
              title={placeholder ? "Próximamente" : label}
              className="flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-amber-400/60 hover:bg-white/10 hover:text-white"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SearchField({
  inputRef,
  query,
  onQueryChange,
  onKeyDown,
  onFocus,
  onBlur,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  onQueryChange: (value: string) => void;
  onKeyDown?: (event: ReactKeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <div className="relative flex h-10 w-full items-center">
      <div className="pointer-events-none absolute left-3 text-zinc-400">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="Buscar en el catálogo..."
        aria-label="Buscar productos"
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-10 text-sm text-white placeholder-zinc-400 focus:border-amber-400 focus:outline-none"
      />
      {query ? (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 shrink-0 rounded-full p-0.5 text-zinc-400 transition-colors hover:text-white"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      ) : (
        <kbd className="absolute right-3 hidden shrink-0 rounded border border-white/15 px-1.5 font-sans text-[10px] font-medium text-zinc-400 lg:block">
          ⌘K
        </kbd>
      )}
    </div>
  );
}