import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useT } from "@/lib/i18n";
import { useTx } from "@/lib/i18nExtra";
import { budgetStore } from "@/lib/listStore";
import { formatCurrency, useTransactions } from "@/lib/store";
import { EXPENSE_CATEGORIES } from "@/lib/types";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { useRegisterFab } from "@/lib/fab";
import { toast } from "sonner";

export const Route = createFileRoute("/budget")({
  head: () => ({ meta: [{ title: "বাজেট — হাত-খরচ" }] }),
  component: BudgetPage,
});

function BudgetPage() {
  const { t, tc, lang } = useT();
  const x = useTx();
  const budgets = budgetStore.use();
  const txs = useTransactions();
  const [open, setOpen] = useState(false);

  const fc = (n: number) => formatCurrency(n, lang);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const spentByCat: Record<string, number> = {};
  for (const tx of txs) {
    if (tx.type !== "expense") continue;
    if (new Date(tx.date) < monthStart) continue;
    spentByCat[tx.category] = (spentByCat[tx.category] ?? 0) + tx.amount;
  }

  return (
    <div className="pb-24">
      <PageHeader icon={Wallet} title={x.budgetTitle} subtitle={x.budgetSub} />

      <div className="mt-4 px-4">
        {budgets.length === 0 ? (
          <EmptyState icon={Wallet} title={x.noEntries} />
        ) : (
          <ul className="space-y-3">
            {budgets.map((b) => {
              const spent = spentByCat[b.category] ?? 0;
              const pct = Math.min(100, Math.round((spent / b.limit) * 100));
              const over = spent > b.limit;
              return (
                <li key={b.id} className="rounded-2xl bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold">{tc(b.category)}</p>
                      <p className="text-xs text-muted-foreground">
                        {fc(spent)} / {fc(b.limit)}
                      </p>
                    </div>
                    <button
                      onClick={() => budgetStore.remove(b.id)}
                      className="text-muted-foreground"
                      aria-label={t.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${over ? "bg-expense" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p
                    className={`mt-2 text-xs font-semibold ${
                      over ? "text-expense" : "text-muted-foreground"
                    }`}
                  >
                    {over ? `+${fc(spent - b.limit)} over` : `${fc(b.limit - spent)} ${x.remaining}`}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <FabAdd onClick={() => setOpen(true)} />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl p-0">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>{x.budgetTitle}</SheetTitle>
          </SheetHeader>
          <BudgetForm
            onDone={() => {
              setOpen(false);
              toast.success(t.saved);
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function BudgetForm({ onDone }: { onDone: () => void }) {
  const { t, tc } = useT();
  const x = useTx();
  const [cat, setCat] = useState("");
  const [limit, setLimit] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(limit);
    if (!cat || !n || n <= 0) return toast.error(t.enterValidAmount);
    budgetStore.add({ id: crypto.randomUUID(), category: cat, limit: n });
    onDone();
  };
  return (
    <form onSubmit={submit} className="space-y-4 px-6 pb-8 pt-2">
      <div>
        <Label>{t.category}</Label>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={t.pick} />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {tc(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>{x.limit}</Label>
        <Input
          type="number"
          inputMode="decimal"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="mt-1 h-14 text-2xl font-bold"
        />
      </div>
      <Button type="submit" className="h-12 w-full">
        {x.saveBtn}
      </Button>
    </form>
  );
}

export function FabAdd({ onClick }: { onClick: () => void }) {
  useRegisterFab(onClick);
  return null;
}
