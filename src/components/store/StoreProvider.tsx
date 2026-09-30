"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type StoreContextValue = {
  query: string;
  setQuery: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const value = useMemo(
    () => ({ query, setQuery, category, setCategory }),
    [query, category]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore debe usarse dentro de StoreProvider");
  }

  return context;
}
