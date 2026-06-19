import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Only defined when both env vars are present. The collection store
 * (see services/collection/index.ts) falls back to a localStorage-backed
 * implementation of the same interface when this is undefined, so the rest
 * of the app never needs to know which backend is active.
 */
export const supabase: SupabaseClient | undefined =
  url && anonKey ? createClient(url, anonKey) : undefined;
