import { useEffect, useState, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

/* =========================================================
   LOCAL CACHE HELPERS
========================================================= */

const cache: Record<string, unknown> = {};

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  if (key in cache) return cache[key] as T;
  try {
    const raw = localStorage.getItem(key);
    const value = raw ? (JSON.parse(raw) as T) : fallback;
    cache[key] = value;
    return value;
  } catch {
    cache[key] = fallback;
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  cache[key] = value;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function useHydrated<T>(get: () => T, fallback: T, subscribe: (l: () => void) => () => void): T {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const value = useSyncExternalStore(subscribe, get, () => fallback);
  return hydrated ? value : fallback;
}

/* =========================================================
   GENERIC SUPABASE-BACKED ENTITY STORE
   Every item type gets: get(), use(), add(), update(), remove()
   Local writes are optimistic; every mutation is also pushed
   to the matching Supabase table so data survives reloads and
   syncs across devices.
========================================================= */

type WithId = { id: string };

function makeEntityStore<TItem extends WithId>(opts: {
  key: string;
  table: string;
  toRow: (item: TItem, userId: string) => Record<string, unknown>;
  fromRow: (row: Record<string, unknown>) => TItem;
}) {
  const { key, table, toRow, fromRow } = opts;
  const listeners = new Set<() => void>();
  let loadStarted = false;

  function emit() {
    listeners.forEach((l) => l());
  }

  function readAll(): TItem[] {
    return readLocal<TItem[]>(key, []);
  }

  function writeAll(items: TItem[]) {
    writeLocal(key, items);
  }

  async function loadFromSupabase() {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const { data, error } = await (supabase.from(table as never) as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`[${table}] Supabase load failed:`, error);
      return;
    }

    const cloudItems = ((data ?? []) as Record<string, unknown>[]).map(fromRow);
    const localItems = readAll();

    // Safe merge — NEVER drop a local-only record just because the
    // cloud fetch came back without it (missed upload, flaky
    // connection, slow background sync, etc.). Cloud wins for ids
    // present in both; local-only records are kept and re-queued
    // for upload so they become durable too.
    const cloudIds = new Set(cloudItems.map((it) => it.id));
    const localOnly = localItems.filter((it) => !cloudIds.has(it.id));
    const merged = [...localOnly, ...cloudItems];

    writeAll(merged);
    emit();

    if (localOnly.length > 0) {
      const rows = localOnly.map((it) => toRow(it, user.id));
      const { error: resyncError } = await (supabase.from(table as never) as any).upsert(rows, {
        onConflict: "id",
      });
      if (resyncError) {
        console.error(`[${table}] Re-sync of local-only rows failed:`, resyncError);
      }
    }
  }

  function ensureLoad() {
    if (loadStarted) return;
    loadStarted = true;
    void loadFromSupabase().catch((error) => {
      console.error(`[${table}] Cloud sync failed:`, error);
    });
  }

  if (typeof window !== "undefined") {
    supabase.auth.onAuthStateChange((event, session) => {
      loadStarted = false;
      if (session?.user) {
        void loadFromSupabase();
        loadStarted = true;
      } else if (event === "SIGNED_OUT") {
        // Only clear on an explicit sign-out — a transient/initial
        // null-session callback must never wipe local data.
        writeAll([]);
        emit();
      }
    });
  }

  return {
    get(): TItem[] {
      ensureLoad();
      return readAll();
    },

    use(): TItem[] {
      return useHydrated(
        () => {
          ensureLoad();
          return readAll();
        },
        [] as TItem[],
        (l) => {
          listeners.add(l);
          return () => listeners.delete(l);
        },
      );
    },

    add(item: TItem) {
      const all = [item, ...readAll()];
      writeAll(all);
      emit();

      void (async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;
        if (!user) {
          console.error(`[${table}] No authenticated user`);
          return;
        }
        const { error } = await (supabase.from(table as never) as any).upsert(toRow(item, user.id), {
          onConflict: "id",
        });
        if (error) console.error(`[${table}] Supabase insert failed:`, error);
      })();
    },

    update(id: string, patch: Partial<TItem>) {
      const all = readAll().map((it) => (it.id === id ? { ...it, ...patch } : it));
      writeAll(all);
      emit();

      const updated = all.find((it) => it.id === id);
      if (!updated) return;

      void (async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;
        if (!user) return;
        const { error } = await (supabase.from(table as never) as any)
          .update(toRow(updated, user.id))
          .eq("id", id)
          .eq("user_id", user.id);
        if (error) console.error(`[${table}] Supabase update failed:`, error);
      })();
    },

    remove(id: string) {
      const all = readAll().filter((it) => it.id !== id);
      writeAll(all);
      emit();

      void (async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;
        if (!user) return;
        const { error } = await (supabase.from(table as never) as any)
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
        if (error) console.error(`[${table}] Supabase delete failed:`, error);
      })();
    },

    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

/* =========================================================
   ITEM TYPES
========================================================= */

export type MarketItem = { id: string; name: string; qty: string; bought: boolean; price: number };
export type BillItem = { id: string; name: string; amount: number; dueDay: number; paid: boolean };
export type SavingsItem = { id: string; goal: string; target: number; saved: number };
export type DpsItem = { id: string; bank: string; monthly: number; months: number; paidMonths: number };
export type MedicineItem = { id: string; name: string; dose: string; taken: boolean };
export type FamilyItem = { id: string; name: string; relation: string };
export type BudgetItem = { id: string; category: string; limit: number };
export type NotificationItem = { id: string; title: string; body: string; date: string; read: boolean };
export type AssetItem = { id: string; name: string; type: string; value: number };
export type InvestmentItem = { id: string; name: string; amount: number; note?: string };
export type LedgerItem = { id: string; shop: string; amount: number; type: "credit" | "paid"; date: string };
export type CustomCategory = { id: string; name: string; type: "income" | "expense" };

/* =========================================================
   STORES
========================================================= */

export const marketStore = makeEntityStore<MarketItem>({
  key: "etracker.market.v1",
  table: "market",
  toRow: (m, userId) => ({
    id: m.id,
    user_id: userId,
    name: m.name,
    category: null,
    quantity: 1,
    unit: m.qty || null,
    price: m.price,
    total_amount: m.price,
    purchased_at: new Date().toISOString().slice(0, 10),
    notes: null,
    metadata: { bought: m.bought },
  }),
  fromRow: (row) => ({
    id: row.id as string,
    name: (row.name as string) ?? "",
    qty: (row.unit as string) ?? "",
    bought: !!(row.metadata as Record<string, unknown> | null)?.bought,
    price: Number(row.price ?? 0),
  }),
});

export const billStore = makeEntityStore<BillItem>({
  key: "etracker.bills.v1",
  table: "bills",
  toRow: (b, userId) => ({
    id: b.id,
    user_id: userId,
    title: b.name,
    category: null,
    amount: b.amount,
    due_date: null,
    status: b.paid ? "paid" : "pending",
    recurring: true,
    notes: null,
    metadata: { dueDay: b.dueDay },
  }),
  fromRow: (row) => ({
    id: row.id as string,
    name: (row.title as string) ?? "",
    amount: Number(row.amount ?? 0),
    dueDay: Number((row.metadata as Record<string, unknown> | null)?.dueDay ?? 1),
    paid: row.status === "paid",
  }),
});

export const savingsStore = makeEntityStore<SavingsItem>({
  key: "etracker.savings.v1",
  table: "savings",
  toRow: (s, userId) => ({
    id: s.id,
    user_id: userId,
    name: s.goal,
    target_amount: s.target,
    current_amount: s.saved,
    target_date: null,
    notes: null,
    metadata: {},
  }),
  fromRow: (row) => ({
    id: row.id as string,
    goal: (row.name as string) ?? "",
    target: Number(row.target_amount ?? 0),
    saved: Number(row.current_amount ?? 0),
  }),
});

export const dpsStore = makeEntityStore<DpsItem>({
  key: "etracker.dps.v1",
  table: "dps",
  toRow: (d, userId) => ({
    id: d.id,
    user_id: userId,
    name: d.bank,
    monthly_amount: d.monthly,
    total_deposit: d.monthly * d.paidMonths,
    maturity_amount: d.monthly * d.months,
    start_date: null,
    maturity_date: null,
    installment_count: d.months,
    paid_installments: d.paidMonths,
    status: d.paidMonths >= d.months ? "matured" : "active",
    notes: null,
    metadata: {},
  }),
  fromRow: (row) => ({
    id: row.id as string,
    bank: (row.name as string) ?? "",
    monthly: Number(row.monthly_amount ?? 0),
    months: Number(row.installment_count ?? 0),
    paidMonths: Number(row.paid_installments ?? 0),
  }),
});

export const medicineStore = makeEntityStore<MedicineItem>({
  key: "etracker.medicine.v1",
  table: "medicine",
  toRow: (m, userId) => ({
    id: m.id,
    user_id: userId,
    name: m.name,
    dosage: m.dose || null,
    quantity: null,
    schedule: null,
    start_date: null,
    end_date: null,
    notes: null,
    metadata: { taken: m.taken },
  }),
  fromRow: (row) => ({
    id: row.id as string,
    name: (row.name as string) ?? "",
    dose: (row.dosage as string) ?? "",
    taken: !!(row.metadata as Record<string, unknown> | null)?.taken,
  }),
});

export const familyStore = makeEntityStore<FamilyItem>({
  key: "etracker.family.v1",
  table: "family",
  toRow: (f, userId) => ({
    id: f.id,
    user_id: userId,
    name: f.name,
    relation: f.relation || null,
    phone: null,
    email: null,
    notes: null,
    metadata: {},
  }),
  fromRow: (row) => ({
    id: row.id as string,
    name: (row.name as string) ?? "",
    relation: (row.relation as string) ?? "",
  }),
});

export const budgetStore = makeEntityStore<BudgetItem>({
  key: "etracker.budgets.v1",
  table: "budgets",
  toRow: (b, userId) => ({
    id: b.id,
    user_id: userId,
    category: b.category,
    limit_amount: b.limit,
    spent_amount: 0,
    period: "monthly",
    start_date: null,
    end_date: null,
    metadata: {},
  }),
  fromRow: (row) => ({
    id: row.id as string,
    category: (row.category as string) ?? "",
    limit: Number(row.limit_amount ?? 0),
  }),
});

export const notificationStore = makeEntityStore<NotificationItem>({
  key: "etracker.notifications.v1",
  table: "notifications",
  toRow: (n, userId) => ({
    id: n.id,
    user_id: userId,
    title: n.title,
    message: n.body,
    type: "info",
    read: n.read,
    read_at: n.read ? new Date().toISOString() : null,
    metadata: { date: n.date },
  }),
  fromRow: (row) => ({
    id: row.id as string,
    title: (row.title as string) ?? "",
    body: (row.message as string) ?? "",
    date: ((row.metadata as Record<string, unknown> | null)?.date as string) ?? (row.created_at as string),
    read: !!row.read,
  }),
});

export const assetStore = makeEntityStore<AssetItem>({
  key: "etracker.assets.v1",
  table: "assets",
  toRow: (a, userId) => ({
    id: a.id,
    user_id: userId,
    name: a.name,
    type: a.type || null,
    value: a.value,
    metadata: {},
  }),
  fromRow: (row) => ({
    id: row.id as string,
    name: (row.name as string) ?? "",
    type: (row.type as string) ?? "",
    value: Number(row.value ?? 0),
  }),
});

export const investmentStore = makeEntityStore<InvestmentItem>({
  key: "etracker.investments.v1",
  table: "investments",
  toRow: (i, userId) => ({
    id: i.id,
    user_id: userId,
    name: i.name,
    amount: i.amount,
    note: i.note ?? null,
    metadata: {},
  }),
  fromRow: (row) => ({
    id: row.id as string,
    name: (row.name as string) ?? "",
    amount: Number(row.amount ?? 0),
    note: (row.note as string) ?? undefined,
  }),
});

export const ledgerStore = makeEntityStore<LedgerItem>({
  key: "etracker.ledger.v1",
  table: "ledger_entries",
  toRow: (l, userId) => ({
    id: l.id,
    user_id: userId,
    shop: l.shop,
    amount: l.amount,
    type: l.type,
    entry_date: l.date.slice(0, 10),
    metadata: {},
  }),
  fromRow: (row) => ({
    id: row.id as string,
    shop: (row.shop as string) ?? "",
    amount: Number(row.amount ?? 0),
    type: row.type === "paid" ? "paid" : "credit",
    date: (row.entry_date as string) ?? new Date().toISOString().slice(0, 10),
  }),
});

export const categoryStore = makeEntityStore<CustomCategory>({
  key: "etracker.customCategories.v1",
  table: "custom_categories",
  toRow: (c, userId) => ({
    id: c.id,
    user_id: userId,
    name: c.name,
    type: c.type,
  }),
  fromRow: (row) => ({
    id: row.id as string,
    name: (row.name as string) ?? "",
    type: row.type === "income" ? "income" : "expense",
  }),
});
