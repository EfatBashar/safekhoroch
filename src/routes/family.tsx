import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Users2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useTx } from "@/lib/i18nExtra";
import { familyStore } from "@/lib/listStore";
import { useRegisterFab } from "@/lib/fab";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const Route = createFileRoute("/family")({
  head: () => ({ meta: [{ title: "পরিবার — হাত-খরচ" }] }),
  component: FamilyPage,
});

function FamilyPage() {
  const { t } = useT();
  const x = useTx();
  const items = familyStore.use();
  const [name, setName] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const [rel, setRel] = useState("");

  useRegisterFab(() => {
    nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    nameRef.current?.focus();
  });

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    familyStore.add({ id: crypto.randomUUID(), name: name.trim(), relation: rel.trim() });
    setName("");
    setRel("");
  };

  return (
    <div className="pb-4">
      <PageHeader icon={Users2} title={x.familyTitle} subtitle={x.familySub} />
      <div className="mx-4 mt-2 rounded-xl bg-card p-3 shadow-sm">
        <p className="text-xs text-muted-foreground">
          {items.length} {x.members}
        </p>
      </div>
      <form onSubmit={add} className="mt-4 flex gap-2 px-4">
        <Input
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.name}
          className="h-12 flex-1 rounded-xl"
        />
        <Input
          value={rel}
          onChange={(e) => setRel(e.target.value)}
          placeholder={x.relation}
          className="h-12 w-28 rounded-xl"
        />
        <Button type="submit" className="h-12 rounded-xl">
          {x.add}
        </Button>
      </form>
      <div className="mt-4 px-4">
        {items.length === 0 ? (
          <EmptyState icon={Users2} title={x.noEntries} />
        ) : (
          <ul className="space-y-2">
            {items.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {m.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.relation || x.member}</p>
                </div>
                <button onClick={() => familyStore.remove(m.id)} aria-label={t.delete}>
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
