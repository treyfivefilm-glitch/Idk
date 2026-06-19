import { createContext } from 'react';
import type { Condition, SavedComic } from '../types/comic';

export interface CollectionContextValue {
  items: SavedComic[];
  loading: boolean;
  isSaved(issueId: string): boolean;
  add(issueId: string, condition: Condition): Promise<void>;
  remove(savedId: string): Promise<void>;
  setCondition(savedId: string, condition: Condition): Promise<void>;
}

export const CollectionContext = createContext<CollectionContextValue | undefined>(undefined);
