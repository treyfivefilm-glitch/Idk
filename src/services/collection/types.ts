import type { Condition, SavedComic } from '../../types/comic';

/**
 * Shared interface for collection persistence. Implemented by both the
 * localStorage-backed store (used when Supabase isn't configured) and the
 * Supabase-backed store, so the UI never has to change when one is swapped
 * for the other.
 */
export interface CollectionStore {
  getCollection(): Promise<SavedComic[]>;
  addToCollection(issueId: string, condition: Condition): Promise<SavedComic>;
  updateCondition(savedId: string, condition: Condition): Promise<void>;
  removeFromCollection(savedId: string): Promise<void>;
}
