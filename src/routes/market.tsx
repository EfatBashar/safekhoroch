import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ShoppingBasket, Check, Trash2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useT } from "@/lib/i18n";
import { useTx } from "@/lib/i18nExtra";
import { marketStore, type MarketItem } from "@/lib/listStore";
import { formatCurrency, newId, store } from "@/lib/store";
import { useRegisterFab } from "@/lib/fab";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const Route = createFileRoute("/market")({
  head: () => ({ meta: [{ title: "বাজার — হাত-খরচ" }] }),
  component: MarketPage,
});

function MarketPage() {
  const { t, lang } = useT();
  const x = useTx();
  const items = marketStore.use();
  const [name, setName] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const fc = (n: number) => formatCurrency(n, lang);
  const spent = items
    .filter((m) => m.bought)
    .reduce((sum, m) => sum + (m.price ?? 0), 0);

  const [editing, setEditing] = useState<MarketItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editQty, setEditQty] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const openEdit = (m: MarketItem) => {
    setEditing(m);
    setEditName(m.name);
    setEditQty(m.qty);
    setEditPrice(m.price ? String(m.price) : "");
  };

  const saveEdit = () => {
    if (!editing) return;
    if (!editName.trim()) return;
    marketStore.update(editing.id, {
      name: editName.trim(),
      qty: editQty.trim(),
      price: parseFloat(editPrice) || 0,
    });
    setEditing(null);
  };

  const deleteEditing = () => {
    if (!editing) return;
    store.removeByRef(editing.id);
    marketStore.remove(editing.id);
    setEditing(null);
  };

  const toggleBought = (m: (typeof items)[number]) => {
    const bought = !m.bought;
    marketStore.update(m.id, { bought });
    if (bought && (m.price ?? 0) > 0) {
      store.addLinked({
        type: "expense",
        amount: m.price!,
        category: "Food",
        account: "cash",
        note: `${x.marketTitle}: ${m.name}`,
        date: new Date().toISOString(),
        source: "market",
        refId: m.id,
      });
    } else if (!bought) {
      store.removeByRef(m.id);
    }
  };

  useRegisterFab(() => {
    nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    nameRef.current?.focus();
  });

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    marketStore.add({
      id: newId(),
      name: name.trim(),
      qty: qty.trim(),
      bought: false,
      price: parseFloat(price) || 0,
    });
    setName("");
    setQty("");
    setPrice("");
  };

  return (
    <div className="pb-4">
      <PageHeader icon={ShoppingBasket} title={x.marketTitle} subtitle={x.marketSub} tone="expense" />
      <form onSubmit={add} className="mt-4 flex gap-2 px-4">
        <Input
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.name}
          className="h-12 flex-1 rounded-xl"
        />
        <Input
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder={x.qty}
          className="h-12 w-20 rounded-xl"
        />
        <Input
          type="number"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={x.price}
          className="h-12 w-20 rounded-xl"
        />
        <Button type="submit" className="h-12 rounded-xl">
          {x.add}
        </Button>
      </form>
      <div className="mt-3 px-4">
        <div className="flex items-center justify-between rounded-xl bg-expense/10 px-4 py-3">
          <span className="text-xs font-semibold text-muted-foreground">{x.marketSpend}</span>
          <span className="font-display text-lg font-bold text-expense">{fc(spent)}</span>
        </div>
      </div>
      <div className="mt-4 px-4">
        {items.length === 0 ? (
          <EmptyState icon={ShoppingBasket} title={x.noEntries} />
        ) : (
          <ul className="space-y-2">
            {items.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm"
              >
                <button
                  onClick={() => toggleBought(m)}
                  className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${
                    m.bought ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  }`}
                  aria-label={x.bought}
                >
                  {m.bought && <Check className="h-4 w-4" strokeWidth={3} />}
                </button>
                <button
                  onClick={() => openEdit(m)}
                  className={`flex-1 text-left text-sm ${m.bought ? "line-through text-muted-foreground" : ""}`}
                >
                  {m.name} {m.qty && <span className="text-muted-foreground">· {m.qty}</span>}
                  {!!m.price && <span className="ml-1 font-semibold">· {fc(m.price)}</span>}
                </button>
                <button onClick={() => openEdit(m)} aria-label={lang === "bn" ? "সম্পাদনা" : "Edit"}>
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => {
                    store.removeByRef(m.id);
                    marketStore.remove(m.id);
                  }}
                  aria-label={t.delete}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{lang === "bn" ? "আইটেম সম্পাদনা" : "Edit item"}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-3">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={t.name}
              className="h-12 rounded-xl"
            />
            <div className="flex gap-2">
              <Input
                value={editQty}
                onChange={(e) => setEditQty(e.target.value)}
                placeholder={x.qty}
                className="h-12 flex-1 rounded-xl"
              />
              <Input
                type="number"
                inputMode="decimal"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder={x.price}
                className="h-12 flex-1 rounded-xl"
              />
            </div>
          </div>
          <SheetFooter className="mt-4 flex-row gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={deleteEditing}>
              {t.delete}
            </Button>
            <Button className="flex-1 rounded-xl" onClick={saveEdit}>
              {t.save}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
