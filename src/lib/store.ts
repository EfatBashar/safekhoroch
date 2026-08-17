import { useEffect, useState, useSyncExternalStore } from "react";
import type { Loan, Transaction, TxSource } from "./types";
import { supabase } from "@/integrations/supabase/client";

const TX_KEY = "etracker.transactions.v1";
const LOAN_KEY = "etracker.loans.v1";

const TX_MIGRATED_KEY = "etracker.transactions.supabase.migrated.v1";
const LOAN_MIGRATED_KEY = "etracker.loans.supabase.migrated.v1";

const cache: Record<string, unknown> = {};

const EMPTY_TX: Transaction[] = [];
const EMPTY_LOAN: Loan[] = [];

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  if (key in cache) {
    return cache[key] as T;
  }

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

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/* =========================================================
   TRANSACTIONS
========================================================= */

let txLoadStarted = false;
let txLoadPromise: Promise<void> | null = null;

function txToRow(tx: Transaction, userId: string) {
  return {
    id: tx.id,
    user_id: userId,
    type: tx.type,
    amount: tx.amount,
    category: tx.category ?? null,
    account: tx.account ?? null,
    description: tx.note ?? null,
    transaction_date: tx.date.slice(0, 10),
    metadata: {
      source: tx.source ?? "manual",
      refId: tx.refId ?? null,
    },
  };
}

function rowToTx(row: {
  id: string;
  type: string;
  amount: number;
  category: string | null;
  account: string | null;
  description: string | null;
  transaction_date: string;
  metadata: unknown;
}): Transaction {
  const metadata =
    row.metadata && typeof row.metadata === "object"
      ? (row.metadata as Record<string, unknown>)
      : {};

  const source = metadata.source;
  const refId = metadata.refId;

  return {
    id: row.id,
    type: row.type as Transaction["type"],
    amount: Number(row.amount),
    category: row.category ?? "Other",
    account:
      row.account === "bank"
        ? "bank"
        : "cash",
    note: row.description ?? undefined,
    date: row.transaction_date,

    source:
      source === "loan" ||
      source === "market" ||
      source === "savings" ||
      source === "dps" ||
      source === "bill" ||
      source === "manual"
        ? source
        : "manual",

    refId:
      typeof refId === "string"
        ? refId
        : undefined,
  };
}

async function loadTransactionsFromSupabase() {
  const { data: sessionData } =
    await supabase.auth.getSession();

  const user = sessionData.session?.user;

  if (!user) return;

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("transaction_date", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "[Transactions] Supabase load failed:",
      error
    );
    return;
  }

  const cloudTransactions =
    (data ?? []).map(rowToTx);

  const localTransactions =
    readLocal<Transaction[]>(
      TX_KEY,
      EMPTY_TX
    );

  /*
   * One-time LocalStorage migration
   */
  if (
    cloudTransactions.length === 0 &&
    localTransactions.length > 0 &&
    localStorage.getItem(
      TX_MIGRATED_KEY
    ) !== user.id
  ) {
    const rows =
      localTransactions.map((tx) =>
        txToRow(tx, user.id)
      );

    const { error: migrationError } =
      await supabase
        .from("transactions")
        .upsert(rows, {
          onConflict: "id",
        });

    if (!migrationError) {
      localStorage.setItem(
        TX_MIGRATED_KEY,
        user.id
      );

      cache[TX_KEY] =
        localTransactions;

      emit();

      return;
    }

    console.error(
      "[Transactions] Local migration failed:",
      migrationError
    );
  }

  writeLocal(
    TX_KEY,
    cloudTransactions
  );

  localStorage.setItem(
    TX_MIGRATED_KEY,
    user.id
  );

  emit();
}

function ensureTransactionLoad() {
  if (txLoadStarted) return;

  txLoadStarted = true;

  txLoadPromise =
    loadTransactionsFromSupabase().catch(
      (error) => {
        console.error(
          "[Transactions] Cloud sync failed:",
          error
        );
      }
    );
}

/* =========================================================
   LOANS
========================================================= */

let loanLoadStarted = false;
let loanLoadPromise: Promise<void> | null = null;

function loanToRow(
  loan: Loan,
  userId: string
) {
  return {
    id: loan.id,

    user_id: userId,

    name: loan.person,

    type: loan.type,

    principal: loan.amount,

    interest_rate: 0,

    paid_amount: loan.settled
      ? loan.amount
      : 0,

    /*
     * The database calls this due_date.
     * We preserve the original loan date inside metadata.
     */
    due_date: null,

    status: loan.settled
      ? "paid"
      : "open",

    notes: loan.note ?? null,

    metadata: {
      account: loan.account ?? "cash",
      loan_date: loan.date,
      settled: loan.settled,
    },
  };
}

function rowToLoan(row: {
  id: string;
  user_id: string;
  name: string;
  type: string | null;
  principal: number;
  interest_rate: number | null;
  paid_amount: number;
  due_date: string | null;
  status: string;
  notes: string | null;
  metadata: unknown;
  created_at: string;
}): Loan {
  const metadata =
    row.metadata &&
    typeof row.metadata === "object"
      ? (row.metadata as Record<string, unknown>)
      : {};

  const storedDate =
    typeof metadata.loan_date === "string"
      ? metadata.loan_date
      : row.created_at;

  const storedAccount =
    metadata.account === "bank"
      ? "bank"
      : "cash";

  const isSettled =
    row.status === "paid" ||
    Number(row.paid_amount) >=
      Number(row.principal);

  return {
    id: row.id,

    type:
      row.type === "lend"
        ? "lend"
        : "borrow",

    person: row.name,

    amount: Number(row.principal),

    date: storedDate,

    note:
      row.notes ?? undefined,

    settled: isSettled,

    account: storedAccount,
  };
}

async function loadLoansFromSupabase() {
  const { data: sessionData } =
    await supabase.auth.getSession();

  const user = sessionData.session?.user;

  if (!user) return;

  const { data, error } =
    await supabase
      .from("loans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    console.error(
      "[Loans] Supabase load failed:",
      error
    );
    return;
  }

  const cloudLoans =
    (data ?? []).map(rowToLoan);

  const localLoans =
    readLocal<Loan[]>(
      LOAN_KEY,
      EMPTY_LOAN
    );

  /*
   * One-time migration:
   * Existing LocalStorage loans are uploaded
   * if the cloud table is empty.
   */
  if (
    cloudLoans.length === 0 &&
    localLoans.length > 0 &&
    localStorage.getItem(
      LOAN_MIGRATED_KEY
    ) !== user.id
  ) {
    const rows =
      localLoans.map((loan) =>
        loanToRow(loan, user.id)
      );

    const { error: migrationError } =
      await supabase
        .from("loans")
        .upsert(rows, {
          onConflict: "id",
        });

    if (!migrationError) {
      localStorage.setItem(
        LOAN_MIGRATED_KEY,
        user.id
      );

      cache[LOAN_KEY] =
        localLoans;

      emit();

      return;
    }

    console.error(
      "[Loans] Local migration failed:",
      migrationError
    );
  }

  writeLocal(
    LOAN_KEY,
    cloudLoans
  );

  localStorage.setItem(
    LOAN_MIGRATED_KEY,
    user.id
  );

  emit();
}

function ensureLoanLoad() {
  if (loanLoadStarted) return;

  loanLoadStarted = true;

  loanLoadPromise =
    loadLoansFromSupabase().catch(
      (error) => {
        console.error(
          "[Loans] Cloud sync failed:",
          error
        );
      }
    );
}

/* =========================================================
   AUTH LISTENER
========================================================= */

function setupAuthListener() {
  supabase.auth.onAuthStateChange(
    (_event, session) => {
      txLoadStarted = false;
      txLoadPromise = null;

      loanLoadStarted = false;
      loanLoadPromise = null;

      if (session?.user) {
        void loadTransactionsFromSupabase();
        void loadLoansFromSupabase();

        txLoadStarted = true;
        loanLoadStarted = true;
      } else {
        cache[TX_KEY] = [];
        cache[LOAN_KEY] = [];

        emit();
      }
    }
  );
}

if (typeof window !== "undefined") {
  setupAuthListener();
}

/* =========================================================
   STORE
========================================================= */

export const store = {
  /* ---------------- TRANSACTIONS ---------------- */

  getTransactions(): Transaction[] {
    ensureTransactionLoad();

    return readLocal<Transaction[]>(
      TX_KEY,
      EMPTY_TX
    );
  },

  addTransaction(tx: Transaction) {
    /*
     * Optimistic UI
     */
    const all = [
      tx,
      ...store.getTransactions(),
    ];

    writeLocal(
      TX_KEY,
      all
    );

    emit();

    /*
     * Supabase
     */
    void (async () => {
      const { data: sessionData } =
        await supabase.auth.getSession();

      const user =
        sessionData.session?.user;

      if (!user) return;

      const { error } =
        await supabase
          .from("transactions")
          .upsert(
            txToRow(tx, user.id),
            {
              onConflict: "id",
            }
          );

      if (error) {
        console.error(
          "[Transactions] Supabase insert failed:",
          error
        );
        return;
      }

      localStorage.setItem(
        TX_MIGRATED_KEY,
        user.id
      );
    })();
  },

  deleteTransaction(id: string) {
    const all =
      store
        .getTransactions()
        .filter(
          (t) => t.id !== id
        );

    writeLocal(
      TX_KEY,
      all
    );

    emit();

    void (async () => {
      const { data: sessionData } =
        await supabase.auth.getSession();

      const user =
        sessionData.session?.user;

      if (!user) return;

      const { error } =
        await supabase
          .from("transactions")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

      if (error) {
        console.error(
          "[Transactions] Supabase delete failed:",
          error
        );
      }
    })();
  },

  addLinked(
    tx: Omit<Transaction, "id"> & {
      source: TxSource;
      refId: string;
    }
  ) {
    store.addTransaction({
      id: newId(),
      ...tx,
    });
  },

  removeByRef(refId: string) {
    const current =
      store.getTransactions();

    const removedIds =
      current
        .filter(
          (t) => t.refId === refId
        )
        .map(
          (t) => t.id
        );

    const all =
      current.filter(
        (t) => t.refId !== refId
      );

    writeLocal(
      TX_KEY,
      all
    );

    emit();

    void (async () => {
      const { data: sessionData } =
        await supabase.auth.getSession();

      const user =
        sessionData.session?.user;

      if (
        !user ||
        removedIds.length === 0
      ) {
        return;
      }

      const { error } =
        await supabase
          .from("transactions")
          .delete()
          .in("id", removedIds)
          .eq("user_id", user.id);

      if (error) {
        console.error(
          "[Transactions] Linked transaction delete failed:",
          error
        );
      }
    })();
  },

  /* ---------------- LOANS ---------------- */

  getLoans(): Loan[] {
    ensureLoanLoad();

    return readLocal<Loan[]>(
      LOAN_KEY,
      EMPTY_LOAN
    );
  },

  addLoan(loan: Loan) {
    /*
     * 1. Optimistic local update
     */
    const all = [
      loan,
      ...store.getLoans(),
    ];

    writeLocal(
      LOAN_KEY,
      all
    );

    emit();

    /*
     * 2. IMPORTANT:
     * Save the actual Loan to Supabase.
     */
    void (async () => {
      const { data: sessionData } =
        await supabase.auth.getSession();

      const user =
        sessionData.session?.user;

      if (!user) {
        console.error(
          "[Loans] No authenticated user"
        );
        return;
      }

      const row =
        loanToRow(
          loan,
          user.id
        );

      const { error } =
        await supabase
          .from("loans")
          .upsert(
            row,
            {
              onConflict: "id",
            }
          );

      if (error) {
        console.error(
          "[Loans] Supabase insert failed:",
          error
        );
        return;
      }

      localStorage.setItem(
        LOAN_MIGRATED_KEY,
        user.id
      );

      console.log(
        "[Loans] Loan saved to Supabase:",
        loan.id
      );
    })();

    /*
     * 3. Create linked transaction
     */
    store.addLinked({
      type:
        loan.type === "borrow"
          ? "income"
          : "expense",

      amount:
        loan.amount,

      category:
        loan.type === "borrow"
          ? "Borrowed"
          : "Lent",

      account:
        loan.account ?? "cash",

      note:
        loan.person,

      date:
        loan.date,

      source:
        "loan",

      refId:
        loan.id,
    });
  },

  toggleLoan(id: string) {
    const loan =
      store
        .getLoans()
        .find(
          (l) => l.id === id
        );

    if (!loan) return;

    const settled =
      !loan.settled;

    const updatedLoan: Loan = {
      ...loan,
      settled,
    };

    const all =
      store
        .getLoans()
        .map(
          (l) =>
            l.id === id
              ? updatedLoan
              : l
        );

    writeLocal(
      LOAN_KEY,
      all
    );

    emit();

    /*
     * Update Supabase loan
     */
    void (async () => {
      const { data: sessionData } =
        await supabase.auth.getSession();

      const user =
        sessionData.session?.user;

      if (!user) return;

      const { error } =
        await supabase
          .from("loans")
          .update({
            paid_amount:
              settled
                ? loan.amount
                : 0,

            status:
              settled
                ? "paid"
                : "open",

            metadata: {
              account:
                loan.account ??
                "cash",

              loan_date:
                loan.date,

              settled,
            },
          })
          .eq(
            "id",
            loan.id
          )
          .eq(
            "user_id",
            user.id
          );

      if (error) {
        console.error(
          "[Loans] Supabase update failed:",
          error
        );
      }
    })();

    /*
     * Settlement transaction
     */
    const settleRef =
      `${id}:settle`;

    if (settled) {
      store.addLinked({
        type:
          loan.type === "borrow"
            ? "expense"
            : "income",

        amount:
          loan.amount,

        category:
          loan.type === "borrow"
            ? "Loan repaid"
            : "Loan recovered",

        account:
          loan.account ?? "cash",

        note:
          loan.person,

        date:
          new Date().toISOString(),

        source:
          "loan",

        refId:
          settleRef,
      });
    } else {
      store.removeByRef(
        settleRef
      );
    }

    emit();
  },

  deleteLoan(id: string) {
    const all =
      store
        .getLoans()
        .filter(
          (l) => l.id !== id
        );

    writeLocal(
      LOAN_KEY,
      all
    );

    /*
     * Remove original transaction
     */
    store.removeByRef(id);

    /*
     * Remove settlement transaction
     */
    store.removeByRef(
      `${id}:settle`
    );

    emit();

    /*
     * Delete Loan from Supabase
     */
    void (async () => {
      const { data: sessionData } =
        await supabase.auth.getSession();

      const user =
        sessionData.session?.user;

      if (!user) return;

      const { error } =
        await supabase
          .from("loans")
          .delete()
          .eq(
            "id",
            id
          )
          .eq(
            "user_id",
            user.id
          );

      if (error) {
        console.error(
          "[Loans] Supabase delete failed:",
          error
        );
      }
    })();
  },

  /* ---------------- SUBSCRIBE ---------------- */

  subscribe(
    listener: () => void
  ) {
    listeners.add(
      listener
    );

    return () =>
      listeners.delete(
        listener
      );
  },
};

/* =========================================================
   REACT HOOKS
========================================================= */

function useHydrated<T>(
  get: () => T,
  fallback: T
): T {
  const [
    hydrated,
    setHydrated,
  ] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const value =
    useSyncExternalStore(
      store.subscribe,
      get,
      () => fallback
    );

  return hydrated
    ? value
    : fallback;
}

export function useTransactions() {
  return useHydrated(
    store.getTransactions,
    [] as Transaction[]
  );
}

export function useLoans() {
  return useHydrated(
    store.getLoans,
    [] as Loan[]
  );
}

/* =========================================================
   HELPERS
========================================================= */

export function formatCurrency(
  n: number,
  lang: "en" | "bn" = "en"
) {
  const locale =
    lang === "bn"
      ? "bn-BD"
      : "en-BD";

  const formatted =
    new Intl.NumberFormat(
      locale,
      {
        maximumFractionDigits: 0,
      }
    ).format(
      Math.abs(n)
    );

  return `${
    n < 0 ? "−" : ""
  }৳${formatted}`;
}

export function newId() {
  try {
    if (
      typeof crypto !== "undefined" &&
      "randomUUID" in crypto
    ) {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }

  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
