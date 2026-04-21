import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Gem, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useT } from "@/lib/i18n";
import { useTx } from "@/lib/i18nExtra";
import { assetStore } from "@/lib/listStore";
import { formatCurrency } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { FabAdd } from "./budget";
import { toast } from "sonner";

export const Route = createFileRoute("/assets")({
  head: () => ({ meta: [{ title: "সম্পদ — হাত-খরচ" }] }),
  component: AssetsPage,
});

function AssetsPage() {
  const { t, lang } = useT();
  const x = useTx();
  const items = assetStore.use();
  const [open, setOpen] = useState(false);
  const fc = (n: number) => formatCurrency(n, lang);
  const total = items.reduce((s, i) => s + i.value, 0);
  return (
    <div className="pb-24">
      <PageHeader icon={Gem} title={x.assetTitle} subtitle={x.assetSub} tone="loan" />
      <div className="mx-4 mt-4 rounded-2xl bg-loan p-4 text-loan-foreground">
        <p className="text-xs uppercase tracking-wider opacity-80">{x.totalValue}</p>
        <p className="font-display text-2xl font-bold">{fc(total)}</p>
      </div>
      <div className="mt-4 space-y-2 px-4">
        {items.length === 0 ? (
          <EmptyState icon={Gem} title={x.noEntries} />
        ) : (
          items.map((i) => (
            <div key={i.id} className="flex items-center justify-between rounded-xl bg-card p-3 shadow-sm">
              <div>
                <p className="text-sm font-bold">{i.name}</p>
                <p className="text-xs text-muted-foreground">{i.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-display text-base font-bold">{fc(i.value)}</p>
                <button onClick={() => assetStore.remove(i.id)} aria-label={t.delete}>
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
            <SheetTitle>{x.assetTitle}</SheetTitle>
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
  const [type, setType] = useState("");
  const [value, setValue] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(value);
    if (!name.trim() || !a || a <= 0) return toast.error(t.enterValidAmount);
    assetStore.add({ id: crypto.randomUUID(), name: name.trim(), type: type.trim(), value: a });
    onDone();
  };
  return (
    <form onSubmit={submit} className="space-y-4 px-6 pb-8 pt-2">
      <div>
        <Label>{t.name}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>{x.type}</Label>
        <Input value={type} onChange={(e) => setType(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>{x.totalValue}</Label>
        <Input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 h-14 text-2xl font-bold"
        />
      </div>
      <Button type="submit" className="h-12 w-full">
        {x.saveBtn}
      </Button>
    </form>
  );
}
