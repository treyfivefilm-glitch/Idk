import { supabase } from '../supabaseClient';
import type { Condition, SavedComic } from '../../types/comic';
import type { CollectionStore } from './types';

/**
 * Real Supabase-backed implementation. Active automatically once
 * VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set (see README) and a
 * `collection_items` table exists with columns:
 *   saved_id   uuid primary key default gen_random_uuid()
 *   issue_id   text not null
 *   condition  text not null
 *   saved_at   timestamptz not null default now()
 *   user_id    uuid references auth.users  -- add once auth is wired up
 */
function row(client: NonNullable<typeof supabase>) {
  return client.from('collection_items');
}

export const supabaseCollectionStore: CollectionStore = {
  async getCollection() {
    if (!supabase) return [];
    const { data, error } = await row(supabase).select('*').order('saved_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(
      (r): SavedComic => ({
        savedId: r.saved_id,
        issueId: r.issue_id,
        condition: r.condition as Condition,
        savedAt: r.saved_at,
      }),
    );
  },

  async addToCollection(issueId, condition) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await row(supabase)
      .insert({ issue_id: issueId, condition })
      .select('*')
      .single();
    if (error) throw error;
    return { savedId: data.saved_id, issueId: data.issue_id, condition: data.condition, savedAt: data.saved_at };
  },

  async updateCondition(savedId, condition) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await row(supabase).update({ condition }).eq('saved_id', savedId);
    if (error) throw error;
  },

  async removeFromCollection(savedId) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await row(supabase).delete().eq('saved_id', savedId);
    if (error) throw error;
  },
};
