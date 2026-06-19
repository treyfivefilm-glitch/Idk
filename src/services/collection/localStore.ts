import type { SavedComic } from '../../types/comic';
import type { CollectionStore } from './types';

const STORAGE_KEY = 'panelworth.collection.v1';

function read(): SavedComic[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedComic[]) : [];
  } catch {
    return [];
  }
}

function write(items: SavedComic[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/** Mock persistence used whenever Supabase isn't configured (e.g. local dev with no backend). */
export const localCollectionStore: CollectionStore = {
  async getCollection() {
    return read();
  },

  async addToCollection(issueId, condition) {
    const items = read();
    const entry: SavedComic = {
      savedId: crypto.randomUUID(),
      issueId,
      condition,
      savedAt: new Date().toISOString(),
    };
    write([entry, ...items]);
    return entry;
  },

  async updateCondition(savedId, condition) {
    const items = read();
    write(items.map((item) => (item.savedId === savedId ? { ...item, condition } : item)));
  },

  async removeFromCollection(savedId) {
    const items = read();
    write(items.filter((item) => item.savedId !== savedId));
  },
};
