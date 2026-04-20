import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { formatCurrency, store, useTransactions } from "@/lib/store";
import { ArrowDownRight, ArrowUpRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Pocket" },
      { name: "description", content: "Your full transaction history." },
    ],
  }),
  component: TransactionsPage,
});

type Filter = "all" | "income" | "expense";

function TransactionsPage() {
  const txs = useTransactions();
  const [filter, setFilter] = useState<Filter>("all");
  const { t, tc, lang } = useT();
  const fc = (n: number) => formatCurrency(n, lang);

  const filtered = useMemo(
    () => (filter === "all" ? txs : txs.filter((tx) => tx.type === filter)),
    [txs, filter],
  );

  // group by date
  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const tx of filtered) {
      const k = new Date(tx.date).toLocaleDateString(
        lang === "bn" ? "bn-BD" : undefined,
        {
          weekday: "long",
          month: "long",
          day: "numeric",
        },
      );
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(tx);
    }
    return Array.from(map.entries());
  }, [filtered, lang]);

  const filterLabels: Record<Filter, string> = {
    all: t.all,
    income: t.income,
    expense: t.expense,
  };

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-bold">{t.activityTitle}</h1>
      <p className="text-sm text-muted-foreground">{t.activitySub}</p>

      <div className="mt-5 flex gap-2 rounded-xl bg-muted p-1">
        {(["all", "income", "expense"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              filter === f
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-6">
        {groups.map(([date, items]) => (
          <div key={date}>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {date}
              </h2>
              <span className="text-xs text-muted-foreground">
                {t.items(items.length)}
              </span>
            </div>
            <ul className="space-y-2">
              {items.map((tx) => (
                <li
                  key={tx.id}
                  className="group flex items-center justify-between rounded-2xl border bg-card p-3"
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
                      <p className="text-xs text-muted-foreground">
                        {tx.note ?? (tx.account === "cash" ? t.cash : t.bank)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-card/50 p-8 text-center text-sm text-muted-foreground">
            {t.noTransactions}
          </div>
        )}
      </div>
    </div>
  );
}
