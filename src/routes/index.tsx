import { createFileRoute } from "@tanstack/react-router";
import { useLoans, useTransactions, formatCurrency } from "@/lib/store";
import { loanSummary, summary, dailyBuckets } from "@/lib/calc";
import { ArrowDownRight, ArrowUpRight, Wallet, Banknote } from "lucide-react";
import { useT } from "@/lib/i18n";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Pocket" },
      { name: "description", content: "Your money at a glance: balance, income, expenses." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const txs = useTransactions();
  const loans = useLoans();
  const s = summary(txs);
  const ls = loanSummary(loans);
  const week = dailyBuckets(txs, 7);
  const { t, tc, lang } = useT();
  const fc = (n: number) => formatCurrency(n, lang);

  return (
    <div className="px-5 pt-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{t.greeting}</p>
          <h1 className="text-2xl font-bold">{t.yourPocket}</h1>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
          P
        </div>
      </header>

      {/* Hero balance card */}
      <div
        className="relative overflow-hidden rounded-3xl bg-balance p-6 text-balance-foreground"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-8 h-44 w-44 rounded-full bg-white/5" />
        <p className="text-xs font-medium uppercase tracking-widest opacity-80">
          {t.totalBalance}
        </p>
        <p className="mt-2 text-4xl font-bold tracking-tight">{fc(s.balance)}</p>
        <div className="mt-6 flex gap-3">
          <MiniStat
            icon={<Wallet className="h-4 w-4" />}
            label={t.cash}
            value={fc(s.cash)}
          />
          <MiniStat
            icon={<Banknote className="h-4 w-4" />}
            label={t.bank}
            value={fc(s.bank)}
          />
        </div>
      </div>

      {/* Income / Expense */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard
          tone="income"
          icon={<ArrowDownRight className="h-5 w-5" />}
          label={t.income}
          value={fc(s.income)}
        />
        <StatCard
          tone="expense"
          icon={<ArrowUpRight className="h-5 w-5" />}
          label={t.expense}
          value={fc(s.expense)}
        />
      </div>

      {/* Weekly chart */}
      <section className="mt-6 rounded-2xl border bg-card p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-base font-semibold">{t.thisWeek}</h2>
          <span className="text-xs text-muted-foreground">{t.last7Days}</span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={week} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-income)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-income)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-expense)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-expense)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="var(--color-muted-foreground)"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="var(--color-income)"
                fill="url(#gIncome)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="var(--color-expense)"
                fill="url(#gExpense)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Loan summary */}
      <section className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-loan p-4 text-loan-foreground">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
            {t.owedToMe}
          </p>
          <p className="mt-1 text-xl font-bold">{fc(ls.owedToMe)}</p>
        </div>
        <div className="rounded-2xl bg-debt p-4 text-debt-foreground">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
            {t.iOwe}
          </p>
          <p className="mt-1 text-xl font-bold">{fc(ls.iOwe)}</p>
        </div>
      </section>

      {/* Recent */}
      <section className="mt-6">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-base font-semibold">{t.recentActivity}</h2>
          <span className="text-xs text-muted-foreground">{t.totalCount(txs.length)}</span>
        </div>
        <ul className="space-y-2">
          {txs.slice(0, 5).map((tx) => (
            <li
              key={tx.id}
              className="flex items-center justify-between rounded-2xl border bg-card p-3"
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
                  <p className="text-xs text-muted-foreground capitalize">
                    {tx.account === "cash" ? t.cash : t.bank} ·{" "}
                    {new Date(tx.date).toLocaleDateString(lang === "bn" ? "bn-BD" : undefined)}
                  </p>
                </div>
              </div>
              <p
                className={`text-sm font-bold ${tx.type === "income" ? "text-income" : "text-expense"}`}
              >
                {tx.type === "income" ? "+" : "−"}
                {fc(tx.amount)}
              </p>
            </li>
          ))}
          {txs.length === 0 && (
            <li className="rounded-2xl border border-dashed bg-card/50 p-6 text-center text-sm text-muted-foreground">
              {t.emptyDashboard}
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex-1 rounded-xl bg-white/15 px-3 py-2 backdrop-blur">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider opacity-80">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 text-base font-bold">{value}</p>
    </div>
  );
}

function StatCard({
  tone,
  icon,
  label,
  value,
}: {
  tone: "income" | "expense";
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const cls =
    tone === "income"
      ? "bg-income text-income-foreground"
      : "bg-expense text-expense-foreground";
  return (
    <div
      className={`rounded-2xl p-4 ${cls}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
        {icon}
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wider opacity-90">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
