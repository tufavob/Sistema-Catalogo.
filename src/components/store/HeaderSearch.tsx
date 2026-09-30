"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";
import { useStore } from "@/components/store/StoreProvider";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { FEATURED_CATEGORIES } from "@/lib/categories";

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
      <div className="relative hidden max-w-sm flex-1 sm:block">
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

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Buscar productos"
        className="flex h-11 w-11 items-center justify-center rounded-2xl text-zinc-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 sm:hidden"
      >
        {open ? (
          <CloseIcon className="h-5 w-5" />
        ) : (
          <SearchIcon className="h-5 w-5" />
        )}
      </button>

      {open ? (
        <div
          className="fixed inset-x-0 z-50 border-b border-emerald-900/70 bg-emerald-950 p-3 sm:hidden"
          style={{ top: "var(--header-height)" }}
        >
          <SearchField
            inputRef={mobileRef}
            query={query}
            onQueryChange={setQuery}
            onKeyDown={handleKeyDown}
          />

          {showQuickAccess ? (
            <QuickCategories
              activeCategory={category}
              onSelect={handleSelectCategory}
              className="mt-3"
            />
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
      className={`rounded-2xl border border-emerald-900/70 bg-emerald-950 p-3 shadow-2xl ${className}`}
    >
      <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100/70">
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
              className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
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
    <div className="flex h-11 w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 text-zinc-300 transition-colors focus-within:border-emerald-500/60 focus-within:bg-white/10">
      <SearchIcon className="h-4 w-4 shrink-0" />
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
        placeholder="Buscar productos..."
        aria-label="Buscar productos"
        className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-400"
      />
      {query ? (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          aria-label="Limpiar búsqueda"
          className="shrink-0 rounded-full p-0.5 text-zinc-300 transition-colors hover:text-white"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      ) : (
        <kbd className="hidden shrink-0 rounded border border-white/15 px-1.5 font-sans text-[10px] font-medium text-zinc-300 lg:block">
          ⌘K
        </kbd>
      )}
    </div>
  );
}
