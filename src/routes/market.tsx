import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ShoppingBasket, Check, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useTx } from "@/lib/i18nExtra";
import { marketStore } from "@/lib/listStore";
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
                <span className={`flex-1 text-sm ${m.bought ? "line-through text-muted-foreground" : ""}`}>
                  {m.name} {m.qty && <span className="text-muted-foreground">· {m.qty}</span>}
                  {!!m.price && <span className="ml-1 font-semibold">· {fc(m.price)}</span>}
                </span>
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
    </div>
  );
}
