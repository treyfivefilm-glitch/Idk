import type { Collection, SavedComic } from '../../types/comic';

/**
 * Shared interface for collection persistence — both "boxes" (named
 * collections) and the saved comics filed into them. Implemented by both the
 * localStorage-backed store (used when Supabase isn't configured) and the
 * Supabase-backed store, so the UI never has to change when one is swapped
 * for the other.
 */
export interface CollectionStore {
  getCollections(): Promise<Collection[]>;
  createCollection(name: string): Promise<Collection>;
  renameCollection(collectionId: string, name: string): Promise<void>;
  /** Also removes any saved comics filed in this box. Callers should confirm with the user first. */
  deleteCollection(collectionId: string): Promise<void>;

  getItems(): Promise<SavedComic[]>;
  addItem(input: Pick<SavedComic, 'issueId' | 'collectionId' | 'condition'>): Promise<SavedComic>;
  /** Partial patch for any personal field — condition, grade, slab status, notes, etc. */
  updateItem(savedId: string, patch: Partial<SavedComic>): Promise<void>;
  removeItem(savedId: string): Promise<void>;
}
