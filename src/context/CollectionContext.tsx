import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { collectionStore } from '../services/collection';
import type { Condition, SavedComic } from '../types/comic';

interface CollectionContextValue {
  items: SavedComic[];
  loading: boolean;
  isSaved(issueId: string): boolean;
  add(issueId: string, condition: Condition): Promise<void>;
  remove(savedId: string): Promise<void>;
  setCondition(savedId: string, condition: Condition): Promise<void>;
}

const CollectionContext = createContext<CollectionContextValue | undefined>(undefined);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SavedComic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    collectionStore.getCollection().then((data) => {
      if (active) {
        setItems(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const isSaved = useCallback((issueId: string) => items.some((item) => item.issueId === issueId), [items]);

  const add = useCallback(async (issueId: string, condition: Condition) => {
    const entry = await collectionStore.addToCollection(issueId, condition);
    setItems((prev) => [entry, ...prev]);
  }, []);

  const remove = useCallback(async (savedId: string) => {
    await collectionStore.removeFromCollection(savedId);
    setItems((prev) => prev.filter((item) => item.savedId !== savedId));
  }, []);

  const setCondition = useCallback(async (savedId: string, condition: Condition) => {
    await collectionStore.updateCondition(savedId, condition);
    setItems((prev) => prev.map((item) => (item.savedId === savedId ? { ...item, condition } : item)));
  }, []);

  const value = useMemo<CollectionContextValue>(
    () => ({ items, loading, isSaved, add, remove, setCondition }),
    [items, loading, isSaved, add, remove, setCondition],
  );

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

export function useCollection(): CollectionContextValue {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error('useCollection must be used within a CollectionProvider');
  return ctx;
}
