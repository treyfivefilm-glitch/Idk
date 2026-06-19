import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { collectionStore } from '../services/collection';
import { CollectionContext, type CollectionContextValue } from './collection-context';
import type { Collection, SavedComic } from '../types/comic';

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [items, setItems] = useState<SavedComic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([collectionStore.getCollections(), collectionStore.getItems()]).then(([c, i]) => {
      if (active) {
        setCollections(c);
        setItems(i);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const isSaved = useCallback((issueId: string) => items.some((item) => item.issueId === issueId), [items]);

  const savedCopiesOf = useCallback(
    (issueId: string) => items.filter((item) => item.issueId === issueId),
    [items],
  );

  const createCollection = useCallback(async (name: string) => {
    const entry = await collectionStore.createCollection(name);
    setCollections((prev) => [...prev, entry]);
    return entry;
  }, []);

  const renameCollection = useCallback(async (collectionId: string, name: string) => {
    await collectionStore.renameCollection(collectionId, name);
    setCollections((prev) => prev.map((c) => (c.id === collectionId ? { ...c, name } : c)));
  }, []);

  const deleteCollection = useCallback(async (collectionId: string) => {
    await collectionStore.deleteCollection(collectionId);
    setCollections((prev) => prev.filter((c) => c.id !== collectionId));
    setItems((prev) => prev.filter((item) => item.collectionId !== collectionId));
  }, []);

  const addItem = useCallback(async (issueId: string, collectionId: string, condition: SavedComic['condition']) => {
    const entry = await collectionStore.addItem({ issueId, collectionId, condition });
    setItems((prev) => [entry, ...prev]);
    return entry;
  }, []);

  const updateItem = useCallback(async (savedId: string, patch: Partial<SavedComic>) => {
    await collectionStore.updateItem(savedId, patch);
    setItems((prev) => prev.map((item) => (item.savedId === savedId ? { ...item, ...patch } : item)));
  }, []);

  const removeItem = useCallback(async (savedId: string) => {
    await collectionStore.removeItem(savedId);
    setItems((prev) => prev.filter((item) => item.savedId !== savedId));
  }, []);

  const value = useMemo<CollectionContextValue>(
    () => ({
      collections,
      items,
      loading,
      isSaved,
      savedCopiesOf,
      createCollection,
      renameCollection,
      deleteCollection,
      addItem,
      updateItem,
      removeItem,
    }),
    [collections, items, loading, isSaved, savedCopiesOf, createCollection, renameCollection, deleteCollection, addItem, updateItem, removeItem],
  );

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}
