import { createContext } from 'react';
import type { Collection, SavedComic } from '../types/comic';

export interface CollectionContextValue {
  collections: Collection[];
  items: SavedComic[];
  loading: boolean;
  isSaved(issueId: string): boolean;
  /** All saved copies of a given issue, across every box — used by "you already own this". */
  savedCopiesOf(issueId: string): SavedComic[];
  createCollection(name: string): Promise<Collection>;
  renameCollection(collectionId: string, name: string): Promise<void>;
  deleteCollection(collectionId: string): Promise<void>;
  addItem(issueId: string, collectionId: string, condition: SavedComic['condition']): Promise<SavedComic>;
  updateItem(savedId: string, patch: Partial<SavedComic>): Promise<void>;
  removeItem(savedId: string): Promise<void>;
}

export const CollectionContext = createContext<CollectionContextValue | undefined>(undefined);
