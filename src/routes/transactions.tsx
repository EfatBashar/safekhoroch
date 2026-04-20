import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { formatCurrency, store, useTransactions } from "@/lib/store";
import { ArrowDownRight, ArrowUpRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const filtered = useMemo(
    () => (filter === "all" ? txs : txs.filter((t) => t.type === filter)),
    [txs, filter],
  );

  // group by date
  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const t of filtered) {
      const k = new Date(t.date).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(t);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-bold">Activity</h1>
      <p className="text-sm text-muted-foreground">All your money movements</p>

      <div className="mt-5 flex gap-2 rounded-xl bg-muted p-1">
        {(["all", "income", "expense"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${
              filter === f
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {f}
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
                {items.length} item{items.length > 1 ? "s" : ""}
              </span>
            </div>
            <ul className="space-y-2">
              {items.map((t) => (
                <li
                  key={t.id}
                  className="group flex items-center justify-between rounded-2xl border bg-card p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.type === "income" ? "bg-income/15 text-income" : "bg-expense/15 text-expense"}`}
                    >
                      {t.type === "income" ? (
                        <ArrowDownRight className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.note ?? `${t.account[0].toUpperCase()}${t.account.slice(1)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-bold ${t.type === "income" ? "text-income" : "text-expense"}`}
                    >
                      {t.type === "income" ? "+" : "−"}
                      {formatCurrency(t.amount)}
                    </p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => store.deleteTransaction(t.id)}
                      aria-label="Delete"
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
            No transactions yet.
          </div>
        )}
      </div>
    </div>
  );
}
