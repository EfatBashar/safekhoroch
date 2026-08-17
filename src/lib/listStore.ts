import { supabase } from "@/integrations/supabase/client";

// Generic list store backed by localStorage with stable references
// (avoids React error #185 from useSyncExternalStore).

const cache: Record<string, unknown> = {};
const listeners: Record<string, Set<() => void>> = {};

function read<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  if (key in cache) return cache[key] as T[];
  try {
    const raw = localStorage.getItem(key);
    const v = raw ? (JSON.parse(raw) as T[]) : fallback;
    cache[key] = v;
    return v;
  } catch {
    cache[key] = fallback;
    return fallback;
  }
}

function write<T>(key: string, value: T[]) {
  cache[key] = value;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
  listeners[key]?.forEach((l) => l());
}

function subscribe(key: string, l: () => void) {
  if (!listeners[key]) listeners[key] = new Set();
  listeners[key].add(l);
  return () => {
    listeners[key].delete(l);
  };
}

export function createListStore<T extends { id: string }>(key: string) {
  const EMPTY: T[] = [];
  return {
    get(): T[] {
      return read<T>(key, EMPTY);
    },
    add(item: T) {
      write<T>(key, [item, ...this.get()]);
    },
    update(id: string, patch: Partial<T>) {
      write<T>(
        key,
        this.get().map((x) => (x.id === id ? { ...x, ...patch } : x)),
      );
    },
    remove(id: string) {
      write<T>(
        key,
        this.get().filter((x) => x.id !== id),
      );
    },
    use(): T[] {
      const [hydrated, setHydrated] = useState(false);
      useEffect(() => setHydrated(true), []);
      const value = useSyncExternalStore(
        (l) => subscribe(key, l),
        () => this.get(),
        () => EMPTY,
      );
      return hydrated ? value : EMPTY;
    },
  };
}

// ---------- Specific stores ----------

export type Budget = { id: string; category: string; limit: number };
export type Savings = { id: string; goal: string; target: number; saved: number };
export type DPS = { id: string; bank: string; monthly: number; months: number; paidMonths?: number };
export type Investment = { id: string; name: string; amount: number; note?: string };
export type Asset = { id: string; name: string; value: number; type: string };
export type Bill = { id: string; name: string; amount: number; dueDay: number; paid: boolean };
export type MarketItem = { id: string; name: string; qty: string; bought: boolean; price?: number };
export type Medicine = { id: string; name: string; dose: string; taken: boolean };
export type Family = { id: string; name: string; relation: string };
export type LedgerEntry = {
  id: string;
  shop: string;
  amount: number;
  type: "credit" | "paid";
  date: string;
  note?: string;
};
export type Notification = { id: string; title: string; body: string; date: string; read: boolean };

export const budgetStore = createListStore<Budget>("etracker.budgets.v1");
export const savingsStore = createListStore<Savings>("etracker.savings.v1");
export const dpsStore = createListStore<DPS>("etracker.dps.v1");
export const investmentStore = createListStore<Investment>("etracker.investments.v1");
export const assetStore = createListStore<Asset>("etracker.assets.v1");
export const billStore = createListStore<Bill>("etracker.bills.v1");
export const marketStore = createListStore<MarketItem>("etracker.market.v1");
export const medicineStore = createListStore<Medicine>("etracker.medicine.v1");
export const familyStore = createListStore<Family>("etracker.family.v1");
export const ledgerStore = createListStore<LedgerEntry>("etracker.ledger.v1");
export const notificationStore = createListStore<Notification>("etracker.notifs.v1");
