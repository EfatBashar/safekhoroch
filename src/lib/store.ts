import { useEffect, useState, useSyncExternalStore } from "react";
import type { Loan, Transaction } from "./types";

const TX_KEY = "etracker.transactions.v1";
const LOAN_KEY = "etracker.loans.v1";

// Cached snapshots — useSyncExternalStore requires stable references between
// reads, otherwise it triggers an infinite re-render loop (React error #185).
const cache: Record<string, unknown> = {};
const EMPTY_TX: Transaction[] = [];
const EMPTY_LOAN: Loan[] = [];

function read<T>(key: string, fallback: T): T {
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

function write(key: string, value: unknown) {
  cache[key] = value;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export const store = {
  getTransactions(): Transaction[] {
    return read<Transaction[]>(TX_KEY, EMPTY_TX);
  },
  getLoans(): Loan[] {
    return read<Loan[]>(LOAN_KEY, EMPTY_LOAN);
  },
  addTransaction(tx: Transaction) {
    const all = [tx, ...store.getTransactions()];
    write(TX_KEY, all);
    emit();
  },
  deleteTransaction(id: string) {
    const all = store.getTransactions().filter((t) => t.id !== id);
    write(TX_KEY, all);
    emit();
  },
  addLoan(loan: Loan) {
    const all = [loan, ...store.getLoans()];
    write(LOAN_KEY, all);
    emit();
  },
  toggleLoan(id: string) {
    const all = store.getLoans().map((l) =>
      l.id === id ? { ...l, settled: !l.settled } : l,
    );
    write(LOAN_KEY, all);
    emit();
  },
  deleteLoan(id: string) {
    const all = store.getLoans().filter((l) => l.id !== id);
    write(LOAN_KEY, all);
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

function useHydrated<T>(get: () => T, fallback: T): T {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const value = useSyncExternalStore(
    store.subscribe,
    get,
    () => fallback,
  );
  return hydrated ? value : fallback;
}

export function useTransactions() {
  return useHydrated(store.getTransactions, [] as Transaction[]);
}
export function useLoans() {
  return useHydrated(store.getLoans, [] as Loan[]);
}

export function formatCurrency(n: number, lang: "en" | "bn" = "en") {
  if (lang === "bn") {
    const formatted = new Intl.NumberFormat("bn-BD", {
      maximumFractionDigits: 0,
    }).format(Math.abs(n));
    return `৳${formatted}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
