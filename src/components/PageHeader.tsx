import type { LucideIcon } from "lucide-react";

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  tone = "primary",
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  tone?: "primary" | "income" | "expense" | "loan" | "debt";
}) {
  const toneCls = {
    primary: "bg-primary/10 text-primary",
    income: "bg-income/15 text-income",
    expense: "bg-expense/15 text-expense",
    loan: "bg-loan/15 text-loan",
    debt: "bg-debt/15 text-debt",
  }[tone];
  return (
    <div className="flex items-center gap-3 px-4 pt-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneCls}`}>
        <Icon className="h-6 w-6" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <h1 className="font-display text-xl font-bold leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-10 w-10" strokeWidth={1.5} />
      </div>
      <p className="mt-4 font-display text-lg font-bold">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
