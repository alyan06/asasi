"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine, Product } from "@/lib/types";
import { effectivePrice } from "@/lib/format";

const STORAGE_KEY = "asasi:cart";

type CartContextValue = {
  lines: CartLine[];
  hydrated: boolean;
  count: number;
  subtotal: number;
  add: (product: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount (avoids SSR/client hydration mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Persist + broadcast across tabs.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore quota errors */
    }
  }, [lines, hydrated]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setLines(JSON.parse(e.newValue));
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function add(product: Product, qty = 1) {
    setLines((prev) => {
      const existing = prev.find((l) => l.product_id === product.id);
      const stock = product.stock_quantity;
      if (existing) {
        const nextQty = Math.min(existing.quantity + qty, stock);
        return prev.map((l) =>
          l.product_id === product.id ? { ...l, quantity: nextQty } : l,
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          slug: product.slug,
          name: product.name,
          price: effectivePrice(product),
          image: product.image_urls?.[0] ?? null,
          quantity: Math.min(qty, stock) || 1,
          stock,
        },
      ];
    });
  }

  function setQty(productId: string, qty: number) {
    setLines((prev) =>
      prev
        .map((l) =>
          l.product_id === productId
            ? { ...l, quantity: Math.max(1, Math.min(qty, l.stock || qty)) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }

  function remove(productId: string) {
    setLines((prev) => prev.filter((l) => l.product_id !== productId));
  }

  function clear() {
    setLines([]);
  }

  const count = useMemo(
    () => lines.reduce((n, l) => n + l.quantity, 0),
    [lines],
  );
  const subtotal = useMemo(
    () => lines.reduce((n, l) => n + l.price * l.quantity, 0),
    [lines],
  );

  const value: CartContextValue = {
    lines,
    hydrated,
    count,
    subtotal,
    add,
    setQty,
    remove,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
