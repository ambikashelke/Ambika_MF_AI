import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

/**
 * Generic data access layer for Supabase tables.
 * Provides reusable CRUD with filters, pagination, and sorting.
 *
 * RLS enforces per-user access on the server, so callers don't need to filter
 * by user_id themselves for read/update/delete.
 */

export type PublicTable = keyof Database["public"]["Tables"];

// Cast supabase to a permissive shape so the generic helpers accept any table name.
// Type safety is recovered at the call site via the <T> generic.
const sb = supabase as any;

export interface ListOptions {
  search?: { column: string; value: string };
  filters?: Record<string, string | number | boolean | null>;
  orderBy?: { column: string; ascending?: boolean };
  page?: number;
  pageSize?: number;
}

export async function getAll<T = unknown>(
  table: PublicTable,
  opts: ListOptions = {}
): Promise<{ data: T[]; count: number }> {
  let query = sb.from(table).select("*", { count: "exact" });

  if (opts.filters) {
    for (const [k, v] of Object.entries(opts.filters)) {
      query = query.eq(k, v);
    }
  }

  if (opts.search?.value) {
    query = query.ilike(opts.search.column, `%${opts.search.value}%`);
  }

  if (opts.orderBy) {
    query = query.order(opts.orderBy.column, { ascending: opts.orderBy.ascending ?? false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (opts.page !== undefined && opts.pageSize) {
    const from = opts.page * opts.pageSize;
    const to = from + opts.pageSize - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error(`[db.getAll:${table}]`, error);
    throw error;
  }
  return { data: (data ?? []) as T[], count: count ?? 0 };
}

export async function getById<T = unknown>(table: PublicTable, id: string): Promise<T | null> {
  const { data, error } = await sb.from(table).select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error(`[db.getById:${table}]`, error);
    throw error;
  }
  return (data ?? null) as T | null;
}

export async function createRecord<T = unknown>(
  table: PublicTable,
  payload: Record<string, unknown>
): Promise<T> {
  const { data, error } = await sb.from(table).insert(payload).select().single();
  if (error) {
    console.error(`[db.createRecord:${table}]`, error);
    throw error;
  }
  return data as T;
}

export async function updateRecord<T = unknown>(
  table: PublicTable,
  id: string,
  patch: Record<string, unknown>
): Promise<T> {
  const { data, error } = await sb.from(table).update(patch).eq("id", id).select().single();
  if (error) {
    console.error(`[db.updateRecord:${table}]`, error);
    throw error;
  }
  return data as T;
}

export async function deleteRecord(table: PublicTable, id: string): Promise<void> {
  const { error } = await sb.from(table).delete().eq("id", id);
  if (error) {
    console.error(`[db.deleteRecord:${table}]`, error);
    throw error;
  }
}
