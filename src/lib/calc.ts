import type { Loan, Transaction, TxSource } from "./types";

/** Sources that only move money around — they must not inflate income/expense. */
const TRANSFER_SOURCES: TxSource[] = ["loan", "savings", "dps"];
export function isTransfer(t: Transaction) {
  return !!t.source && TRANSFER_SOURCES.includes(t.source);
}

export function summary(txs: Transaction[]) {
  let income = 0;
  let expense = 0;
  let cash = 0;
  let bank = 0;
  for (const t of txs) {
    const sign = t.type === "income" ? 1 : -1;
    if (!isTransfer(t)) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    if (t.account === "cash") cash += sign * t.amount;
    else bank += sign * t.amount;
  }
  return { income, expense, cash, bank, balance: cash + bank };
}

export function loanSummary(loans: Loan[]) {
  let owedToMe = 0;
  let iOwe = 0;
  for (const l of loans) {
    if (l.settled) continue;
    if (l.type === "lend") owedToMe += l.amount;
    else iOwe += l.amount;
  }
  return { owedToMe, iOwe, net: owedToMe - iOwe };
}

export function monthlyBuckets(txs: Transaction[], months = 6) {
  const now = new Date();
  const buckets: { key: string; label: string; income: number; expense: number }[] =
    [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    buckets.push({
      key,
      label: d.toLocaleString("en", { month: "short" }),
      income: 0,
      expense: 0,
    });
  }
  const map = new Map(buckets.map((b) => [b.key, b]));
  for (const t of txs) {
    if (isTransfer(t)) continue;
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const b = map.get(key);
    if (!b) continue;
    if (t.type === "income") b.income += t.amount;
    else b.expense += t.amount;
  }
  return buckets;
}

export function dailyBuckets(txs: Transaction[], days = 7) {
  const now = new Date();
  const buckets: { key: string; label: string; income: number; expense: number }[] =
    [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.push({
      key,
      label: d.toLocaleString("en", { weekday: "short" }),
      income: 0,
      expense: 0,
    });
  }
  const map = new Map(buckets.map((b) => [b.key, b]));
  for (const t of txs) {
    if (isTransfer(t)) continue;
    const key = new Date(t.date).toISOString().slice(0, 10);
    const b = map.get(key);
    if (!b) continue;
    if (t.type === "income") b.income += t.amount;
    else b.expense += t.amount;
  }
  return buckets;
}
