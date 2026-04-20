import { createFileRoute } from "@tanstack/react-router";
import { formatCurrency, store, useLoans } from "@/lib/store";
import { loanSummary } from "@/lib/calc";
import { Check, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/loans")({
  head: () => ({
    meta: [
      { title: "Loans — Pocket" },
      { name: "description", content: "Track money you've lent or borrowed." },
    ],
  }),
  component: LoansPage,
});

function LoansPage() {
  const loans = useLoans();
  const s = loanSummary(loans);
  const { t, lang } = useT();
  const fc = (n: number) => formatCurrency(n, lang);

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-bold">{t.loansTitle}</h1>
      <p className="text-sm text-muted-foreground">{t.loansSub}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-loan p-4 text-loan-foreground">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
            {t.owedToMe}
          </p>
          <p className="mt-1 text-2xl font-bold">{fc(s.owedToMe)}</p>
        </div>
        <div className="rounded-2xl bg-debt p-4 text-debt-foreground">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
            {t.iOwe}
          </p>
          <p className="mt-1 text-2xl font-bold">{fc(s.iOwe)}</p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border bg-card p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{t.net}</p>
        <p
          className={`text-xl font-bold ${s.net >= 0 ? "text-income" : "text-expense"}`}
        >
          {s.net >= 0 ? "+" : "−"}
          {fc(Math.abs(s.net))}
        </p>
      </div>

      <ul className="mt-5 space-y-2">
        {loans.map((l) => (
          <li
            key={l.id}
            className={`rounded-2xl border bg-card p-4 ${l.settled ? "opacity-60" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      l.type === "lend"
                        ? "bg-loan/20 text-loan"
                        : "bg-debt/20 text-debt"
                    }`}
                  >
                    {l.type === "lend" ? t.lent : t.borrowed}
                  </span>
                  {l.settled && (
                    <span className="rounded-full bg-income/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-income">
                      {t.settled}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-base font-semibold">{l.person}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(l.date).toLocaleDateString(lang === "bn" ? "bn-BD" : undefined)}
                  {l.note ? ` · ${l.note}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-bold ${l.type === "lend" ? "text-loan" : "text-debt"}`}
                >
                  {fc(l.amount)}
                </p>
                <div className="mt-1 flex justify-end gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => store.toggleLoan(l.id)}
                    aria-label={t.toggleSettled}
                  >
                    {l.settled ? (
                      <RotateCcw className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4 text-income" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => store.deleteLoan(l.id)}
                    aria-label={t.delete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </li>
        ))}
        {loans.length === 0 && (
          <li className="rounded-2xl border border-dashed bg-card/50 p-8 text-center text-sm text-muted-foreground">
            {t.noLoans}
          </li>
        )}
      </ul>
    </div>
  );
}
