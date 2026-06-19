import type { Collection, SavedComic } from '../../types/comic';
import type { CollectionStore } from './types';

const COLLECTIONS_KEY = 'panelworth.collections.v2';
const ITEMS_KEY = 'panelworth.collectionItems.v2';
const DEFAULT_COLLECTION_NAME = 'My Collection';

function readCollections(): Collection[] {
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Collection[]) : [];
    if (parsed.length > 0) return parsed;
  } catch {
    // fall through to bootstrap below
  }
  const bootstrapped: Collection[] = [
    { id: crypto.randomUUID(), name: DEFAULT_COLLECTION_NAME, createdAt: new Date().toISOString() },
  ];
  writeCollections(bootstrapped);
  return bootstrapped;
}

function writeCollections(collections: Collection[]): void {
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}

function readItems(): SavedComic[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    return raw ? (JSON.parse(raw) as SavedComic[]) : [];
  } catch {
    return [];
  }
}

function writeItems(items: SavedComic[]): void {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

/** Mock persistence used whenever Supabase isn't configured (e.g. local dev with no backend). */
export const localCollectionStore: CollectionStore = {
  async getCollections() {
    return readCollections();
  },

  async createCollection(name) {
    const collections = readCollections();
    const entry: Collection = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() };
    writeCollections([...collections, entry]);
    return entry;
  },

  async renameCollection(collectionId, name) {
    const collections = readCollections();
    writeCollections(collections.map((c) => (c.id === collectionId ? { ...c, name } : c)));
  },

  async deleteCollection(collectionId) {
    const collections = readCollections().filter((c) => c.id !== collectionId);
    writeCollections(collections);
    const items = readItems().filter((item) => item.collectionId !== collectionId);
    writeItems(items);
  },

  async getItems() {
    return readItems();
  },

  async addItem({ issueId, collectionId, condition }) {
    const items = readItems();
    const entry: SavedComic = {
      savedId: crypto.randomUUID(),
      issueId,
      collectionId,
      condition,
      savedAt: new Date().toISOString(),
      isSlabbed: false,
    };
    writeItems([entry, ...items]);
    return entry;
  },

  async updateItem(savedId, patch) {
    const items = readItems();
    writeItems(items.map((item) => (item.savedId === savedId ? { ...item, ...patch } : item)));
  },

  async removeItem(savedId) {
    const items = readItems();
    writeItems(items.filter((item) => item.savedId !== savedId));
  },
};
