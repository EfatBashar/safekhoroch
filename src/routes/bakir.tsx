import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Store, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useT } from "@/lib/i18n";
import { useTx } from "@/lib/i18nExtra";
import { ledgerStore } from "@/lib/listStore";
import { formatCurrency } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { FabAdd } from "./budget";
import { toast } from "sonner";

export const Route = createFileRoute("/bakir")({
  head: () => ({ meta: [{ title: "বাকির খাতা — হাত-খরচ" }] }),
  component: BakirPage,
});

function BakirPage() {
  const { t, lang } = useT();
  const x = useTx();
  const items = ledgerStore.use();
  const [open, setOpen] = useState(false);
  const fc = (n: number) => formatCurrency(n, lang);

  // Group by shop
  const byShop = new Map<string, { credit: number; paid: number }>();
  for (const e of items) {
    const cur = byShop.get(e.shop) ?? { credit: 0, paid: 0 };
    if (e.type === "credit") cur.credit += e.amount;
    else cur.paid += e.amount;
    byShop.set(e.shop, cur);
  }
  const shops = Array.from(byShop.entries()).map(([shop, v]) => ({
    shop,
    balance: v.credit - v.paid,
  }));
  const total = shops.reduce((s, r) => s + r.balance, 0);

  return (
    <div className="pb-24">
      <PageHeader icon={Store} title={t.bakirTitle} subtitle={t.bakirSub} tone="debt" />

      <div className="mx-4 mt-4 rounded-2xl bg-debt p-4 text-debt-foreground">
        <p className="text-xs uppercase tracking-wider opacity-80">{t.iOwe}</p>
        <p className="font-display text-2xl font-bold">{fc(total)}</p>
      </div>

      <div className="mt-4 space-y-3 px-4">
        {shops.length === 0 ? (
          <EmptyState icon={Store} title={x.noEntries} />
        ) : (
          shops.map(({ shop, balance }) => (
            <div key={shop} className="rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-bold">{shop}</p>
                <p className={`font-display text-lg font-bold ${balance > 0 ? "text-debt" : "text-income"}`}>
                  {fc(balance)}
                </p>
              </div>
              <ul className="mt-2 space-y-1.5 border-t border-border pt-2">
                {items
                  .filter((e) => e.shop === shop)
                  .slice(0, 5)
                  .map((e) => (
                    <li key={e.id} className="flex items-center justify-between text-xs">
                      <div>
                        <span
                          className={`mr-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            e.type === "credit"
                              ? "bg-debt/15 text-debt"
                              : "bg-income/15 text-income"
                          }`}
                        >
                          {e.type === "credit" ? x.credit : x.paidLabel}
                        </span>
                        {new Date(e.date).toLocaleDateString(lang === "bn" ? "bn-BD" : undefined)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{fc(e.amount)}</span>
                        <button onClick={() => ledgerStore.remove(e.id)} aria-label={t.delete}>
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <FabAdd onClick={() => setOpen(true)} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl p-0">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>{t.bakirTitle}</SheetTitle>
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
  const [shop, setShop] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"credit" | "paid">("credit");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(amount);
    if (!shop.trim() || !a || a <= 0) return toast.error(t.enterValidAmount);
    ledgerStore.add({
      id: crypto.randomUUID(),
      shop: shop.trim(),
      amount: a,
      type,
      date: new Date(date).toISOString(),
    });
    onDone();
  };
  return (
    <form onSubmit={submit} className="space-y-4 px-6 pb-8 pt-2">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
        <button
          type="button"
          onClick={() => setType("credit")}
          className={`rounded-lg py-2 text-sm font-semibold ${type === "credit" ? "bg-debt text-debt-foreground" : "text-muted-foreground"}`}
        >
          {x.credit}
        </button>
        <button
          type="button"
          onClick={() => setType("paid")}
          className={`rounded-lg py-2 text-sm font-semibold ${type === "paid" ? "bg-income text-income-foreground" : "text-muted-foreground"}`}
        >
          {x.paidLabel}
        </button>
      </div>
      <div>
        <Label>{x.shop}</Label>
        <Input value={shop} onChange={(e) => setShop(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>{x.amount}</Label>
        <Input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 h-14 text-2xl font-bold"
        />
      </div>
      <div>
        <Label>{t.date}</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1"
        />
      </div>
      <Button type="submit" className="h-12 w-full">
        {x.saveBtn}
      </Button>
    </form>
  );
}
