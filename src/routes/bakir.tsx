import { createFileRoute } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import { Construction } from "lucide-react";

export const Route = createFileRoute("/bakir")({
  head: () => ({
    meta: [
      { title: "বাকির খাতা — হাত-খরচ" },
      { name: "description", content: "দোকানে বাকির হিসাব রাখুন।" },
    ],
  }),
  component: BakirPage,
});

function BakirPage() {
  const { t } = useT();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Construction className="h-12 w-12" strokeWidth={1.5} />
      </div>
      <h1 className="mt-5 font-display text-2xl font-bold">{t.bakirTitle}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.bakirSub}</p>
      <div className="mt-6 rounded-2xl bg-card p-5 shadow-sm">
        <p className="text-base font-bold text-foreground">{t.comingSoon}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t.comingSoonSub}</p>
      </div>
    </div>
  );
}
