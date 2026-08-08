import { useEffect, useState, useSyncExternalStore } from "react";
import type { Account, Loan, Transaction, TxSource } from "./types";

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
  /** Add an entry linked to another record (loan, bill, market item...). */
  addLinked(tx: Omit<Transaction, "id"> & { source: TxSource; refId: string }) {
    store.addTransaction({ id: newId(), ...tx });
  },
  /** Remove every entry linked to a given reference id. */
  removeByRef(refId: string) {
    const all = store.getTransactions().filter((t) => t.refId !== refId);
    write(TX_KEY, all);
    emit();
  },
  addLoan(loan: Loan) {
    const all = [loan, ...store.getLoans()];
    write(LOAN_KEY, all);
    // Borrowing brings money in, lending takes money out.
    store.addLinked({
      type: loan.type === "borrow" ? "income" : "expense",
      amount: loan.amount,
      category: loan.type === "borrow" ? "Borrowed" : "Lent",
      account: loan.account ?? "cash",
      note: loan.person,
      date: loan.date,
      source: "loan",
      refId: loan.id,
    });
  },
  toggleLoan(id: string) {
    const loan = store.getLoans().find((l) => l.id === id);
    if (!loan) return;
    const settled = !loan.settled;
    const all = store.getLoans().map((l) => (l.id === id ? { ...l, settled } : l));
    write(LOAN_KEY, all);
    const settleRef = `${id}:settle`;
    if (settled) {
      // Settling reverses the original movement.
      store.addLinked({
        type: loan.type === "borrow" ? "expense" : "income",
        amount: loan.amount,
        category: loan.type === "borrow" ? "Loan repaid" : "Loan recovered",
        account: loan.account ?? "cash",
        note: loan.person,
        date: new Date().toISOString(),
        source: "loan",
        refId: settleRef,
      });
    } else {
      store.removeByRef(settleRef);
    }
    emit();
  },
  deleteLoan(id: string) {
    const all = store.getLoans().filter((l) => l.id !== id);
    write(LOAN_KEY, all);
    store.removeByRef(id);
    store.removeByRef(`${id}:settle`);
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

/** Always BDT (৳); only the digit formatting follows the UI language. */
export function formatCurrency(n: number, lang: "en" | "bn" = "en") {
  const locale = lang === "bn" ? "bn-BD" : "en-BD";
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(Math.abs(n));
  return `${n < 0 ? "−" : ""}৳${formatted}`;
}

/** crypto.randomUUID() is unavailable in non-secure contexts. */
export function newId() {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    /* ignore */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
