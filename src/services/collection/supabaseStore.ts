import { supabase } from '../supabaseClient';
import type { Collection, SavedComic } from '../../types/comic';
import type { CollectionStore } from './types';

/**
 * Real Supabase-backed implementation. Active automatically once
 * VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set (see README) and two
 * tables exist:
 *
 *   collections
 *     id          uuid primary key default gen_random_uuid()
 *     name        text not null
 *     created_at  timestamptz not null default now()
 *     user_id     uuid references auth.users  -- add once auth is wired up
 *
 *   collection_items
 *     saved_id            uuid primary key default gen_random_uuid()
 *     issue_id            text not null
 *     collection_id       uuid not null references collections(id) on delete cascade
 *     condition           text not null
 *     saved_at            timestamptz not null default now()
 *     is_slabbed          boolean not null default false
 *     grade               numeric
 *     grading_company     text
 *     purchase_price      numeric
 *     purchase_date       date
 *     storage_box         text
 *     signed_by           text
 *     notes               text
 *     personal_cover_url  text
 *     user_id             uuid references auth.users  -- add once auth is wired up
 */
function collectionsTable(client: NonNullable<typeof supabase>) {
  return client.from('collections');
}

function itemsTable(client: NonNullable<typeof supabase>) {
  return client.from('collection_items');
}

function toSavedComic(r: Record<string, unknown>): SavedComic {
  return {
    savedId: r.saved_id as string,
    issueId: r.issue_id as string,
    collectionId: r.collection_id as string,
    condition: r.condition as SavedComic['condition'],
    savedAt: r.saved_at as string,
    isSlabbed: Boolean(r.is_slabbed),
    grade: (r.grade as number | null) ?? undefined,
    gradingCompany: (r.grading_company as SavedComic['gradingCompany'] | null) ?? undefined,
    purchasePrice: (r.purchase_price as number | null) ?? undefined,
    purchaseDate: (r.purchase_date as string | null) ?? undefined,
    storageBox: (r.storage_box as string | null) ?? undefined,
    signedBy: (r.signed_by as string | null) ?? undefined,
    notes: (r.notes as string | null) ?? undefined,
    personalCoverUrl: (r.personal_cover_url as string | null) ?? undefined,
  };
}

function fromPatch(patch: Partial<SavedComic>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.collectionId !== undefined) out.collection_id = patch.collectionId;
  if (patch.condition !== undefined) out.condition = patch.condition;
  if (patch.isSlabbed !== undefined) out.is_slabbed = patch.isSlabbed;
  if (patch.grade !== undefined) out.grade = patch.grade;
  if (patch.gradingCompany !== undefined) out.grading_company = patch.gradingCompany;
  if (patch.purchasePrice !== undefined) out.purchase_price = patch.purchasePrice;
  if (patch.purchaseDate !== undefined) out.purchase_date = patch.purchaseDate;
  if (patch.storageBox !== undefined) out.storage_box = patch.storageBox;
  if (patch.signedBy !== undefined) out.signed_by = patch.signedBy;
  if (patch.notes !== undefined) out.notes = patch.notes;
  if (patch.personalCoverUrl !== undefined) out.personal_cover_url = patch.personalCoverUrl;
  return out;
}

export const supabaseCollectionStore: CollectionStore = {
  async getCollections() {
    if (!supabase) return [];
    const { data, error } = await collectionsTable(supabase).select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r): Collection => ({ id: r.id, name: r.name, createdAt: r.created_at }));
  },

  async createCollection(name) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await collectionsTable(supabase).insert({ name }).select('*').single();
    if (error) throw error;
    return { id: data.id, name: data.name, createdAt: data.created_at };
  },

  async renameCollection(collectionId, name) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await collectionsTable(supabase).update({ name }).eq('id', collectionId);
    if (error) throw error;
  },

  async deleteCollection(collectionId) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await collectionsTable(supabase).delete().eq('id', collectionId);
    if (error) throw error;
  },

  async getItems() {
    if (!supabase) return [];
    const { data, error } = await itemsTable(supabase).select('*').order('saved_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toSavedComic);
  },

  async addItem({ issueId, collectionId, condition }) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await itemsTable(supabase)
      .insert({ issue_id: issueId, collection_id: collectionId, condition, is_slabbed: false })
      .select('*')
      .single();
    if (error) throw error;
    return toSavedComic(data);
  },

  async updateItem(savedId, patch) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await itemsTable(supabase).update(fromPatch(patch)).eq('saved_id', savedId);
    if (error) throw error;
  },

  async removeItem(savedId) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await itemsTable(supabase).delete().eq('saved_id', savedId);
    if (error) throw error;
  },
};
