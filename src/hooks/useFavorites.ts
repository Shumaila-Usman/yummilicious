"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "yummilicious-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {
      setFavorites([]);
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: string[]) => {
    setFavorites(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const toggleFavorite = useCallback(
    (productId: string) => {
      persist(
        favorites.includes(productId)
          ? favorites.filter((id) => id !== productId)
          : [...favorites, productId]
      );
    },
    [favorites, persist]
  );

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite, loaded };
}
