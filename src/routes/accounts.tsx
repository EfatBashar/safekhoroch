import { createFileRoute } from "@tanstack/react-router";
import { formatCurrency, useTransactions } from "@/lib/store";
import { summary, monthlyBuckets } from "@/lib/calc";
import { Wallet, Landmark } from "lucide-react";
import { useT } from "@/lib/i18n";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/accounts")({
  head: () => ({
    meta: [
      { title: "একাউন্ট — হাত-খরচ" },
      { name: "description", content: "নগদ ও ব্যাংক ব্যালেন্স ও মাসিক ট্রেন্ড।" },
    ],
  }),
  component: AccountsPage,
});

function AccountsPage() {
  const txs = useTransactions();
  const s = summary(txs);
  const months = monthlyBuckets(txs, 6);
  const { t, lang } = useT();
  const fc = (n: number) => formatCurrency(n, lang);

  return (
    <div className="px-4 pb-4 pt-4">
      <h1 className="font-display text-xl font-bold">{t.accountsTitle}</h1>
      <p className="text-xs text-muted-foreground">{t.accountsSub}</p>

      <div className="mt-4 space-y-3">
        <AccountCard
          tone="cash"
          icon={<Wallet className="h-5 w-5" />}
          label={t.cashOnHand}
          value={fc(s.cash)}
        />
        <AccountCard
          tone="balance"
          icon={<Landmark className="h-5 w-5" />}
          label={t.bankAccount}
          value={fc(s.bank)}
        />
      </div>

      <section className="mt-5 rounded-2xl bg-card p-4 shadow-sm">
        <h2 className="font-display text-base font-bold">{t.monthlySummary}</h2>
        <p className="text-xs text-muted-foreground">{t.last6Months}</p>
        <div className="mt-3 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
              <Bar dataKey="income" fill="var(--color-income)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill="var(--color-expense)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-3 rounded-2xl bg-card p-4 shadow-sm">
        <h2 className="font-display text-base font-bold">{t.sec1FinancialSummary}</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label={t.totalIncome} value={fc(s.income)} tone="income" />
          <Row label={t.totalExpense} value={fc(s.expense)} tone="expense" />
          <div className="my-2 h-px bg-border" />
          <Row
            label={t.netSavings}
            value={fc(s.income - s.expense)}
            tone={s.income - s.expense >= 0 ? "income" : "expense"}
            bold
          />
        </dl>
      </section>
    </div>
  );
}

function AccountCard({
  tone,
  icon,
  label,
  value,
}: {
  tone: "cash" | "balance";
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const cls =
    tone === "cash"
      ? "bg-cash text-cash-foreground"
      : "bg-balance text-balance-foreground";
  return (
    <div
      className={`flex items-center justify-between rounded-2xl p-4 ${cls}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
          {icon}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider opacity-80">{label}</p>
          <p className="font-display text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
  bold,
}: {
  label: string;
  value: string;
  tone?: "income" | "expense";
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={`${bold ? "text-base font-bold" : "font-semibold"} ${tone === "income" ? "text-income" : tone === "expense" ? "text-expense" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
