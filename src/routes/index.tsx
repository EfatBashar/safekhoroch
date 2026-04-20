import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLoans, useTransactions, formatCurrency } from "@/lib/store";
import { summary } from "@/lib/calc";
import { useT } from "@/lib/i18n";
import {
  Wallet,
  Landmark,
  TrendingUp,
  TrendingDown,
  Receipt,
  Handshake,
  BookMarked,
  PieChart,
  PiggyBank,
  WalletCards,
  CreditCard,
  CheckCircle2,
  ShoppingBasket,
  Pill,
  ReceiptText,
  BarChart3,
  Store,
  FileText,
  Award,
  Settings,
  Grid3x3,
  History,
  ListChecks,
  HandCoins,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ড্যাশবোর্ড — হাত-খরচ" },
      {
        name: "description",
        content:
          "ব্যক্তিগত খরচ ট্র্যাকার — আয়, ব্যয়, একাউন্ট ও দেনা-পাওনা এক জায়গায়।",
      },
    ],
  }),
  component: Dashboard,
});

function greetingKey() {
  const h = new Date().getHours();
  if (h < 12) return "greetingMorning" as const;
  if (h < 16) return "greetingAfternoon" as const;
  if (h < 19) return "greetingEvening" as const;
  return "greetingNight" as const;
}

function Dashboard() {
  const txs = useTransactions();
  useLoans();
  const s = summary(txs);
  const { t, tc, lang } = useT();
  const fc = (n: number) => formatCurrency(n, lang);
  const navigate = useNavigate();

  return (
    <div className="px-4 pb-4 pt-4">
      {/* Greeting card */}
      <div className="flex items-center gap-3 rounded-2xl bg-primary/10 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl">
          👋
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-foreground">{t[greetingKey()]}</p>
          <p className="text-xs text-muted-foreground">{t.greetingSub}</p>
        </div>
      </div>

      {/* Section 1 */}
      <SectionHeader icon={<Grid3x3 className="h-4 w-4" />} title={t.sec1FinancialSummary} />

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          tone="cash"
          icon={<Wallet className="h-5 w-5" />}
          label={t.cashOnHand}
          value={fc(s.cash)}
        />
        <SummaryCard
          tone="balance"
          icon={<Landmark className="h-5 w-5" />}
          label={t.bankAccount}
          value={fc(s.bank)}
        />
        <SummaryCard
          tone="income"
          icon={<TrendingUp className="h-5 w-5" />}
          label={t.totalIncome}
          value={fc(s.income)}
        />
        <SummaryCard
          tone="expense"
          icon={<TrendingDown className="h-5 w-5" />}
          label={t.totalExpense}
          value={fc(s.expense)}
        />
      </div>

      {/* Section 2 — feature grid */}
      <SectionHeader icon={<Grid3x3 className="h-4 w-4" />} title={t.sec2MainFeatures} />

      <div className="grid grid-cols-3 gap-3">
        <FeatTile
          icon={<Receipt className="h-7 w-7" />}
          label={t.featTransactions}
          color="blue"
          onClick={() => navigate({ to: "/transactions" })}
        />
        <FeatTile
          icon={<Landmark className="h-7 w-7" />}
          label={t.featAccounts}
          color="amber"
          onClick={() => navigate({ to: "/accounts" })}
        />
        <FeatTile
          icon={<Handshake className="h-7 w-7" />}
          label={t.featDebt}
          color="teal"
          onClick={() => navigate({ to: "/loans" })}
        />
        <FeatTile
          icon={<BookMarked className="h-7 w-7" />}
          label={t.featLedger}
          color="purple"
          onClick={() => navigate({ to: "/bakir" })}
        />
        <FeatTile
          icon={<PieChart className="h-7 w-7" />}
          label={t.featBudget}
          color="indigo"
          onClick={() => navigate({ to: "/pro" })}
        />
        <FeatTile
          icon={<WalletCards className="h-7 w-7" />}
          label={t.featSavings}
          color="rose"
          onClick={() => navigate({ to: "/pro" })}
        />
        <FeatTile
          icon={<CreditCard className="h-7 w-7" />}
          label={t.featLoan}
          color="red"
          onClick={() => navigate({ to: "/loans" })}
        />
        <FeatTile
          icon={<PiggyBank className="h-7 w-7" />}
          label={t.featDPS}
          color="yellow"
          onClick={() => navigate({ to: "/pro" })}
        />
        <FeatTile
          icon={<CheckCircle2 className="h-7 w-7" />}
          label={t.featTasks}
          color="cyan"
          onClick={() => navigate({ to: "/tasks" })}
        />
      </div>

      {/* Section 3 */}
      <SectionHeader icon={<History className="h-4 w-4" />} title={t.sec3RecentActivity} />

      {/* Recent transactions panel */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">{t.recentTransactions}</p>
          <button
            onClick={() => navigate({ to: "/transactions" })}
            className="text-xs font-semibold text-primary"
          >
            {t.seeAll}
          </button>
        </div>
        {txs.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t.noTransactions}
          </p>
        ) : (
          <ul className="space-y-2">
            {txs.slice(0, 3).map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${tx.type === "income" ? "bg-income/15 text-income" : "bg-expense/15 text-expense"}`}
                  >
                    {tx.type === "income" ? (
                      <ArrowDownRight className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{tc(tx.category)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {tx.account === "cash" ? t.cash : t.bank}
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
          </ul>
        )}
      </div>

      {/* Upcoming tasks panel */}
      <div className="mt-3 rounded-2xl bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">{t.upcomingTasks}</p>
          <button
            onClick={() => navigate({ to: "/tasks" })}
            className="text-xs font-semibold text-primary"
          >
            {t.seeAll}
          </button>
        </div>
        <p className="py-6 text-center text-sm text-muted-foreground">{t.noTasks}</p>
      </div>

      {/* Section 4 — extra tools */}
      <SectionHeader
        icon={<ListChecks className="h-4 w-4" />}
        title={t.sec4ExtraTools}
      />

      <div className="grid grid-cols-4 gap-3">
        <ToolTile
          icon={<ShoppingBasket className="h-6 w-6 text-amber-700" />}
          label={t.toolMarket}
          onClick={() => navigate({ to: "/pro" })}
        />
        <ToolTile
          icon={<Pill className="h-6 w-6 text-rose-500" />}
          label={t.toolMedicine}
          onClick={() => navigate({ to: "/pro" })}
        />
        <ToolTile
          icon={<ReceiptText className="h-6 w-6 text-orange-500" />}
          label={t.toolBills}
          onClick={() => navigate({ to: "/pro" })}
        />
        <ToolTile
          icon={<BarChart3 className="h-6 w-6 text-purple-600" />}
          label={t.toolAnalytics}
          onClick={() => navigate({ to: "/accounts" })}
        />
        <ToolTile
          icon={<Store className="h-6 w-6 text-emerald-600" />}
          label={t.toolBakir}
          onClick={() => navigate({ to: "/bakir" })}
        />
        <ToolTile
          icon={<FileText className="h-6 w-6 text-slate-600" />}
          label={t.toolReport}
          onClick={() => navigate({ to: "/accounts" })}
        />
        <ToolTile
          icon={<Award className="h-6 w-6 text-amber-500" />}
          label={t.toolPro}
          onClick={() => navigate({ to: "/pro" })}
        />
        <ToolTile
          icon={<Settings className="h-6 w-6 text-slate-500" />}
          label={t.toolSettings}
          onClick={() => navigate({ to: "/settings" })}
        />
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-3 mt-6 flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h2 className="font-display text-base font-bold text-foreground">{title}</h2>
    </div>
  );
}

function SummaryCard({
  tone,
  icon,
  label,
  value,
}: {
  tone: "cash" | "balance" | "income" | "expense";
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const cls = {
    cash: "bg-cash text-cash-foreground",
    balance: "bg-balance text-balance-foreground",
    income: "bg-income text-income-foreground",
    expense: "bg-expense text-expense-foreground",
  }[tone];
  return (
    <div
      className={`rounded-2xl p-4 ${cls}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
        {icon}
      </div>
      <p className="mt-3 text-xs font-medium opacity-90">{label}</p>
      <p className="mt-0.5 font-display text-xl font-bold">{value}</p>
    </div>
  );
}

const featColorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600 ring-blue-200",
  amber: "bg-amber-100 text-amber-700 ring-amber-200",
  teal: "bg-teal-100 text-teal-700 ring-teal-200",
  purple: "bg-purple-100 text-purple-700 ring-purple-200",
  indigo: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  rose: "bg-rose-100 text-rose-700 ring-rose-200",
  red: "bg-red-100 text-red-600 ring-red-200",
  yellow: "bg-yellow-100 text-yellow-700 ring-yellow-200",
  cyan: "bg-cyan-100 text-cyan-700 ring-cyan-200",
};

function FeatTile({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: keyof typeof featColorMap | string;
  onClick: () => void;
}) {
  const colorCls = featColorMap[color] ?? featColorMap.blue;
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl bg-card p-3 ring-1 ring-border/50 active:scale-[0.97]"
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full ring-1 ${colorCls}`}
      >
        {icon}
      </div>
      <span className="text-xs font-semibold text-foreground">{label}</span>
    </button>
  );
}

function ToolTile({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-2.5 ring-1 ring-border/50 active:scale-[0.97]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg">
        {icon}
      </div>
      <span className="text-[11px] font-semibold leading-tight text-foreground">
        {label}
      </span>
    </button>
  );
}

// Suppress unused
void HandCoins;
