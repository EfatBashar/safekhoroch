import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ShoppingBasket, Check, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useTx } from "@/lib/i18nExtra";
import { marketStore } from "@/lib/listStore";
import { useRegisterFab } from "@/lib/fab";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const Route = createFileRoute("/market")({
  head: () => ({ meta: [{ title: "বাজার — হাত-খরচ" }] }),
  component: MarketPage,
});

function MarketPage() {
  const { t } = useT();
  const x = useTx();
  const items = marketStore.use();
  const [name, setName] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const [qty, setQty] = useState("");

  useRegisterFab(() => {
    nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    nameRef.current?.focus();
  });

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    marketStore.add({ id: crypto.randomUUID(), name: name.trim(), qty: qty.trim(), bought: false });
    setName("");
    setQty("");
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
          className="h-12 w-24 rounded-xl"
        />
        <Button type="submit" className="h-12 rounded-xl">
          {x.add}
        </Button>
      </form>
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
                  onClick={() => marketStore.update(m.id, { bought: !m.bought })}
                  className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${
                    m.bought ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  }`}
                  aria-label={x.bought}
                >
                  {m.bought && <Check className="h-4 w-4" strokeWidth={3} />}
                </button>
                <span className={`flex-1 text-sm ${m.bought ? "line-through text-muted-foreground" : ""}`}>
                  {m.name} {m.qty && <span className="text-muted-foreground">· {m.qty}</span>}
                </span>
                <button onClick={() => marketStore.remove(m.id)} aria-label={t.delete}>
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
