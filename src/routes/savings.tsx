import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PiggyBank, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useT } from "@/lib/i18n";
import { useTx } from "@/lib/i18nExtra";
import { savingsStore } from "@/lib/listStore";
import { formatCurrency } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { FabAdd } from "./budget";
import { toast } from "sonner";

export const Route = createFileRoute("/savings")({
  head: () => ({ meta: [{ title: "সঞ্চয় — হাত-খরচ" }] }),
  component: SavingsPage,
});

function SavingsPage() {
  const { t, lang } = useT();
  const x = useTx();
  const items = savingsStore.use();
  const [open, setOpen] = useState(false);
  const fc = (n: number) => formatCurrency(n, lang);

  return (
    <div className="pb-24">
      <PageHeader icon={PiggyBank} title={x.savingsTitle} subtitle={x.savingsSub} tone="income" />
      <div className="mt-4 space-y-3 px-4">
        {items.length === 0 ? (
          <EmptyState icon={PiggyBank} title={x.noEntries} />
        ) : (
          items.map((s) => {
            const pct = Math.min(100, Math.round((s.saved / s.target) * 100));
            return (
              <div key={s.id} className="rounded-2xl bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold">{s.goal}</p>
                    <p className="text-xs text-muted-foreground">
                      {fc(s.saved)} / {fc(s.target)} ({pct}%)
                    </p>
                  </div>
                  <button onClick={() => savingsStore.remove(s.id)} aria-label={t.delete}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-income" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 flex-1 text-xs"
                    onClick={() => {
                      const v = prompt(x.contribute);
                      const n = v ? parseFloat(v) : 0;
                      if (n > 0) savingsStore.update(s.id, { saved: s.saved + n });
                    }}
                  >
                    + {x.contribute}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <FabAdd onClick={() => setOpen(true)} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl p-0">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>{x.savingsTitle}</SheetTitle>
          </SheetHeader>
          <Form
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

function Form({ onDone }: { onDone: () => void }) {
  const { t } = useT();
  const x = useTx();
  const [goal, setGoal] = useState("");
  const [target, setTarget] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(target);
    if (!goal.trim() || !n || n <= 0) return toast.error(t.enterValidAmount);
    savingsStore.add({ id: crypto.randomUUID(), goal: goal.trim(), target: n, saved: 0 });
    onDone();
  };
  return (
    <form onSubmit={submit} className="space-y-4 px-6 pb-8 pt-2">
      <div>
        <Label>{x.goal}</Label>
        <Input value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>{x.target}</Label>
        <Input
          type="number"
          inputMode="decimal"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="mt-1 h-14 text-2xl font-bold"
        />
      </div>
      <Button type="submit" className="h-12 w-full">
        {x.saveBtn}
      </Button>
    </form>
  );
}
