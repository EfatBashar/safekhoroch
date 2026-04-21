import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ReceiptText, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useT } from "@/lib/i18n";
import { useTx } from "@/lib/i18nExtra";
import { billStore } from "@/lib/listStore";
import { formatCurrency } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { FabAdd } from "./budget";
import { toast } from "sonner";

export const Route = createFileRoute("/bills")({
  head: () => ({ meta: [{ title: "বিল — হাত-খরচ" }] }),
  component: BillsPage,
});

function BillsPage() {
  const { t, lang } = useT();
  const x = useTx();
  const bills = billStore.use();
  const [open, setOpen] = useState(false);
  const fc = (n: number) => formatCurrency(n, lang);
  return (
    <div className="pb-24">
      <PageHeader icon={ReceiptText} title={x.billsTitle} subtitle={x.billsSub} tone="expense" />
      <div className="mt-4 space-y-2 px-4">
        {bills.length === 0 ? (
          <EmptyState icon={ReceiptText} title={x.noEntries} />
        ) : (
          bills.map((b) => (
            <div
              key={b.id}
              className={`flex items-center justify-between rounded-xl bg-card p-3 shadow-sm ${b.paid ? "opacity-60" : ""}`}
            >
              <div className="min-w-0">
                <p className="text-sm font-bold">{b.name}</p>
                <p className="text-xs text-muted-foreground">
                  {x.due} {b.dueDay}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-display text-base font-bold text-expense">{fc(b.amount)}</p>
                <button
                  onClick={() => billStore.update(b.id, { paid: !b.paid })}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                    b.paid ? "bg-income/15 text-income" : "bg-expense/15 text-expense"
                  }`}
                >
                  {b.paid ? x.paid : x.unpaid}
                </button>
                <button onClick={() => billStore.remove(b.id)} aria-label={t.delete}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <FabAdd onClick={() => setOpen(true)} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl p-0">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>{x.billsTitle}</SheetTitle>
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
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [day, setDay] = useState("1");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(amount);
    const d = parseInt(day, 10);
    if (!name.trim() || !a || a <= 0 || !d) return toast.error(t.enterValidAmount);
    billStore.add({ id: crypto.randomUUID(), name: name.trim(), amount: a, dueDay: d, paid: false });
    onDone();
  };
  return (
    <form onSubmit={submit} className="space-y-4 px-6 pb-8 pt-2">
      <div>
        <Label>{t.name}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{x.amount}</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>{x.due}</Label>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={31}
            value={day}
            onChange={(e) => setDay(e.target.value)}
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
