import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { formatCurrency, store, useTransactions } from "@/lib/store";
import { summary } from "@/lib/calc";
import { ArrowDownRight, ArrowUpRight, Receipt, Plus, Trash2, List, ArrowDown, ArrowUp, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT, type Dict } from "@/lib/i18n";
import { useTx } from "@/lib/i18nExtra";
import type { Account } from "@/lib/types";

function accountLabel(account: Account, t: Dict) {
  return t[account] ?? t.cash;
}

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "লেনদেন — হাত-খরচ" },
      { name: "description", content: "আপনার সব লেনদেনের ইতিহাস।" },
    ],
  }),
  component: TransactionsPage,
});

type Filter = "all" | "expense" | "income";
type Range = "all" | "today" | "month";

function TransactionsPage() {
  const txs = useTransactions();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<Range>("all");
  const { t, tc, lang } = useT();
  const x = useTx();
  const fc = (n: number) => formatCurrency(n, lang);
  const navigate = useNavigate();
  const s = summary(txs);
  const net = s.income - s.expense;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = new Date();
    return txs.filter((tx) => {
      if (filter !== "all" && tx.type !== filter) return false;
      if (range !== "all") {
        const d = new Date(tx.date);
        if (range === "today" && d.toDateString() !== now.toDateString()) return false;
        if (
          range === "month" &&
          (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())
        )
          return false;
      }
      if (!q) return true;
      return (
        tx.category.toLowerCase().includes(q) ||
        tc(tx.category).toLowerCase().includes(q) ||
        (tx.note ?? "").toLowerCase().includes(q) ||
        String(tx.amount).includes(q)
      );
    });
  }, [txs, filter, query, range, tc]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const tx of filtered) {
      const k = new Date(tx.date).toLocaleDateString(
        lang === "bn" ? "bn-BD" : undefined,
        { weekday: "long", month: "long", day: "numeric" },
      );
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(tx);
    }
    return Array.from(map.entries());
  }, [filtered, lang]);

  const tabs: { key: Filter; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: t.filterAll, icon: <List className="h-4 w-4" /> },
    { key: "expense", label: t.filterExpense, icon: <ArrowDown className="h-4 w-4" /> },
    { key: "income", label: t.filterIncome, icon: <ArrowUp className="h-4 w-4" /> },
  ];

  return (
    <div className="pb-4">
      {/* Filter tabs (like the screenshot) */}
      <div className="grid grid-cols-3 border-b border-border bg-card">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`relative flex flex-col items-center gap-1 py-3 text-sm font-semibold transition-colors ${
              filter === tab.key ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {filter === tab.key && (
              <span className="absolute -bottom-px left-1/2 h-0.5 w-12 -translate-x-1/2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Search + date range */}
      <div className="space-y-2 border-b border-border bg-card px-4 pb-3 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={x.searchPlaceholder}
            className="h-11 rounded-xl pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label={x.cancel}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {([
            ["all", x.fAll],
            ["today", x.fToday],
            ["month", x.fMonth],
          ] as [Range, string][]).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setRange(k)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                range === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Net balance bar */}
      <div className="flex items-end justify-between bg-card px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">{t.netBalance}</p>
          <p className={`font-display text-2xl font-bold ${net >= 0 ? "text-income" : "text-expense"}`}>
            {fc(net)}
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {t.txCount(filtered.length)}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Receipt className="h-12 w-12" strokeWidth={1.5} />
          </div>
          <p className="mt-4 font-display text-lg font-bold">
            {query || range !== "all" ? x.noResults : t.noTxTitle}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{t.noTxSub}</p>
        </div>
      ) : (
        <div className="space-y-5 px-4 pt-4">
          {groups.map(([date, items]) => (
            <div key={date}>
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {date}
                </h2>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <ul className="space-y-2">
                {items.map((tx) => (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between rounded-2xl bg-card p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${tx.type === "income" ? "bg-income/15 text-income" : "bg-expense/15 text-expense"}`}
                      >
                        {tx.type === "income" ? (
                          <ArrowDownRight className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{tc(tx.category)}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {tx.note ?? accountLabel(tx.account, t)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <p
                        className={`text-sm font-bold ${tx.type === "income" ? "text-income" : "text-expense"}`}
                      >
                        {tx.type === "income" ? "+" : "−"}
                        {fc(tx.amount)}
                      </p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => store.deleteTransaction(tx.id)}
                        aria-label={t.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* "Add transaction" pill button */}
      <button
        onClick={() => navigate({ to: "/" })}
        className="fixed bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-fab px-5 py-3.5 text-fab-foreground shadow-lg active:scale-95"
        style={{ boxShadow: "var(--shadow-fab)" }}
      >
        <Plus className="h-5 w-5" strokeWidth={2.5} />
        <span className="text-sm font-bold">{t.addTransaction}</span>
      </button>
    </div>
  );
}
