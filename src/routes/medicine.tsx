import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Pill, Check, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useTx } from "@/lib/i18nExtra";
import { medicineStore } from "@/lib/listStore";
import { useRegisterFab } from "@/lib/fab";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const Route = createFileRoute("/medicine")({
  head: () => ({ meta: [{ title: "ঔষধ — হাত-খরচ" }] }),
  component: MedicinePage,
});

function MedicinePage() {
  const { t } = useT();
  const x = useTx();
  const items = medicineStore.use();
  const [name, setName] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const [dose, setDose] = useState("");

  useRegisterFab(() => {
    nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    nameRef.current?.focus();
  });

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    medicineStore.add({
      id: crypto.randomUUID(),
      name: name.trim(),
      dose: dose.trim(),
      taken: false,
    });
    setName("");
    setDose("");
  };

  return (
    <div className="pb-4">
      <PageHeader icon={Pill} title={x.medicineTitle} subtitle={x.medicineSub} tone="debt" />
      <form onSubmit={add} className="mt-4 flex gap-2 px-4">
        <Input
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.name}
          className="h-12 flex-1 rounded-xl"
        />
        <Input
          value={dose}
          onChange={(e) => setDose(e.target.value)}
          placeholder={x.dose}
          className="h-12 w-24 rounded-xl"
        />
        <Button type="submit" className="h-12 rounded-xl">
          {x.add}
        </Button>
      </form>
      <div className="mt-4 px-4">
        {items.length === 0 ? (
          <EmptyState icon={Pill} title={x.noEntries} />
        ) : (
          <ul className="space-y-2">
            {items.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm">
                <button
                  onClick={() => medicineStore.update(m.id, { taken: !m.taken })}
                  className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${
                    m.taken ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  }`}
                  aria-label={x.taken}
                >
                  {m.taken && <Check className="h-4 w-4" strokeWidth={3} />}
                </button>
                <span className={`flex-1 text-sm ${m.taken ? "line-through text-muted-foreground" : ""}`}>
                  {m.name} {m.dose && <span className="text-muted-foreground">· {m.dose}</span>}
                </span>
                <button onClick={() => medicineStore.remove(m.id)} aria-label={t.delete}>
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
