import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PiggyBank, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useT } from "@/lib/i18n";
import { useTx } from "@/lib/i18nExtra";
import { dpsStore } from "@/lib/listStore";
import { formatCurrency, newId, store } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { FabAdd } from "./budget";
import { toast } from "sonner";

export const Route = createFileRoute("/dps")({
  head: () => ({ meta: [{ title: "ডিপিএস — হাত-খরচ" }] }),
  component: DPSPage,
});

function DPSPage() {
  const { t, lang } = useT();
  const x = useTx();
  const items = dpsStore.use();
  const [open, setOpen] = useState(false);
  const fc = (n: number) => formatCurrency(n, lang);

  return (
    <div className="pb-24">
      <PageHeader icon={PiggyBank} title={x.dpsTitle} subtitle={x.dpsSub} tone="primary" />
      <div className="mt-4 space-y-3 px-4">
        {items.length === 0 ? (
          <EmptyState icon={PiggyBank} title={x.noEntries} />
        ) : (
          items.map((d) => {
            const mature = d.monthly * d.months;
            const paidMonths = d.paidMonths ?? 0;
            return (
              <div key={d.id} className="rounded-2xl bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold">{d.bank}</p>
                    <p className="text-xs text-muted-foreground">
                      {fc(d.monthly)} × {d.months} {x.months}
                    </p>
                  </div>
                  <button onClick={() => dpsStore.remove(d.id)} aria-label={t.delete}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="mt-2 rounded-xl bg-primary/5 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{x.matureValue}</p>
                  <p className="font-display text-lg font-bold text-primary">{fc(mature)}</p>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    {paidMonths}/{d.months} {x.installmentsPaid} · {fc(d.monthly * paidMonths)}
                  </p>
                  <Button
                    size="sm"
                    className="h-9 text-xs"
                    disabled={paidMonths >= d.months}
                    onClick={() => {
                      store.addLinked({
                        type: "expense",
                        amount: d.monthly,
                        category: "DPS",
                        account: "bank",
                        note: d.bank,
                        date: new Date().toISOString(),
                        source: "dps",
                        refId: `${d.id}:${newId()}`,
                      });
                      dpsStore.update(d.id, { paidMonths: paidMonths + 1 });
                      toast.success(t.saved);
                    }}
                  >
                    {x.payInstallment}
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
            <SheetTitle>{x.dpsTitle}</SheetTitle>
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
  const [bank, setBank] = useState("");
  const [m, setM] = useState("");
  const [mo, setMo] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(m);
    const b = parseInt(mo, 10);
    if (!bank.trim() || !a || a <= 0 || !b || b <= 0)
      return toast.error(t.enterValidAmount);
    dpsStore.add({ id: newId(), bank: bank.trim(), monthly: a, months: b, paidMonths: 0 });
    onDone();
  };
  return (
    <form onSubmit={submit} className="space-y-4 px-6 pb-8 pt-2">
      <div>
        <Label>{x.bank}</Label>
        <Input value={bank} onChange={(e) => setBank(e.target.value)} className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{x.monthlyEMI}</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={m}
            onChange={(e) => setM(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>{x.months}</Label>
          <Input
            type="number"
            inputMode="numeric"
            value={mo}
            onChange={(e) => setMo(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      <Button type="submit" className="h-12 w-full">
        {x.saveBtn}
      </Button>
    </form>
  );
}
