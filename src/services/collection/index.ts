import { supabase } from '../supabaseClient';
import { localCollectionStore } from './localStore';
import { supabaseCollectionStore } from './supabaseStore';
import type { CollectionStore } from './types';

/**
 * Picks the real Supabase store when configured, otherwise the localStorage
 * mock — same interface either way, so nothing above this layer needs to
 * change when a real backend is provisioned.
 */
export const collectionStore: CollectionStore = supabase ? supabaseCollectionStore : localCollectionStore;

export type { CollectionStore } from './types';
