import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useTx } from "@/lib/i18nExtra";
import { useTransactions, formatCurrency } from "@/lib/store";
import { summary } from "@/lib/calc";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const Route = createFileRoute("/report")({
  head: () => ({ meta: [{ title: "রিপোর্ট — হাত-খরচ" }] }),
  component: ReportPage,
});

function ReportPage() {
  const { lang, tc } = useT();
  const x = useTx();
  const txs = useTransactions();
  const s = summary(txs);
  const fc = (n: number) => formatCurrency(n, lang);

  const byCat: Record<string, number> = {};
  for (const tx of txs) {
    if (tx.type !== "expense") continue;
    byCat[tx.category] = (byCat[tx.category] ?? 0) + tx.amount;
  }
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const totalCat = cats.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="pb-4">
      <PageHeader icon={FileText} title={x.reportTitle} subtitle={x.reportSub} />
      <div className="mt-4 grid grid-cols-3 gap-2 px-4">
        <Stat label={x.totalIncomeLabel} value={fc(s.income)} tone="income" />
        <Stat label={x.totalExpenseLabel} value={fc(s.expense)} tone="expense" />
        <Stat
          label={x.netLabel}
          value={fc(s.income - s.expense)}
          tone={s.income - s.expense >= 0 ? "income" : "expense"}
        />
      </div>

      <div className="mx-4 mt-5 rounded-2xl bg-card p-4 shadow-sm">
        <p className="mb-3 text-sm font-bold">{x.byCategory}</p>
        {cats.length === 0 ? (
          <EmptyState icon={FileText} title={x.noData} />
        ) : (
          <ul className="space-y-3">
            {cats.map(([cat, val]) => {
              const pct = Math.round((val / totalCat) * 100);
              return (
                <li key={cat}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-semibold">{tc(cat)}</span>
                    <span className="text-muted-foreground">
                      {fc(val)} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-expense" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "income" | "expense" }) {
  return (
    <div className="rounded-xl bg-card p-3 shadow-sm">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`font-display text-sm font-bold ${tone === "income" ? "text-income" : "text-expense"}`}>
        {value}
      </p>
    </div>
  );
}
