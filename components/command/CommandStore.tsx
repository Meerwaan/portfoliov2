"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Store = {
  isOpen: boolean;
  query: string;
  open: (query?: string) => void;
  close: () => void;
  setQuery: (q: string) => void;
};

const CommandContext = createContext<Store | null>(null);

export function CommandStoreProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const open = useCallback((q?: string) => {
    if (typeof q === "string") setQuery(q);
    setOpen(true);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);
  const value = useMemo(() => ({ isOpen, query, open, close, setQuery }), [isOpen, query, open, close]);
  return <CommandContext.Provider value={value}>{children}</CommandContext.Provider>;
}

export function useCommand(): Store {
  const ctx = useContext(CommandContext);
  if (!ctx) throw new Error("useCommand must be used within CommandStoreProvider");
  return ctx;
}
