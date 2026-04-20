import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { Award, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/pro")({
  head: () => ({
    meta: [
      { title: "প্রো সাবস্ক্রিপশন — হাত-খরচ" },
      { name: "description", content: "হাত-খরচ প্রো সাবস্ক্রিপশন।" },
    ],
  }),
  component: ProPage,
});

function ProPage() {
  const { t } = useT();
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="px-4 pb-8 pt-4">
      {/* Hero */}
      <div className="rounded-3xl bg-primary px-6 py-10 text-center text-primary-foreground">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fab text-fab-foreground">
          <Award className="h-9 w-9" strokeWidth={2} />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">{t.proHeroTitle}</h1>
        <p className="mt-1 text-sm opacity-90">{t.proHeroSub}</p>
      </div>

      {/* Plan selector */}
      <h2 className="mb-3 mt-6 font-display text-base font-bold">{t.pickPlan}</h2>

      <button
        onClick={() => setPlan("monthly")}
        className={`mb-3 flex w-full items-center justify-between rounded-2xl border-2 bg-card p-4 ${
          plan === "monthly" ? "border-primary" : "border-border"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
              plan === "monthly" ? "border-primary bg-primary" : "border-border"
            }`}
          >
            {plan === "monthly" && (
              <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
            )}
          </div>
          <span className="text-sm font-bold">{t.monthlyPlan}</span>
        </div>
        <div>
          <span className="font-display text-xl font-bold text-primary">৳49</span>
          <span className="text-xs text-muted-foreground">{t.perMonth}</span>
        </div>
      </button>

      <button
        onClick={() => setPlan("yearly")}
        className={`flex w-full items-center justify-between rounded-2xl border-2 bg-card p-4 ${
          plan === "yearly" ? "border-primary" : "border-border"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
              plan === "yearly" ? "border-primary bg-primary" : "border-border"
            }`}
          >
            {plan === "yearly" && (
              <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
            )}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold">{t.yearlyPlan}</span>
            <span className="mt-1 rounded-full bg-income/15 px-2 py-0.5 text-[10px] font-bold text-income">
              {t.saveTag}
            </span>
          </div>
        </div>
        <div>
          <span className="font-display text-xl font-bold text-primary">৳499</span>
          <span className="text-xs text-muted-foreground">{t.perYear}</span>
        </div>
      </button>

      {/* Benefits */}
      <div className="mt-6 rounded-2xl bg-primary/5 p-5">
        <p className="mb-3 text-sm font-bold">{t.proBenefits}</p>
        <ul className="space-y-2 text-sm text-foreground">
          {[t.benefit1, t.benefit2, t.benefit3, t.benefit4, t.benefit5, t.benefit6].map(
            (b, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" strokeWidth={3} />
                <span>{b}</span>
              </li>
            ),
          )}
        </ul>
      </div>

      <Button
        onClick={() => toast.success(t.payNow)}
        className="mt-6 h-14 w-full rounded-2xl bg-primary text-base font-bold"
      >
        {t.payNow} ›
      </Button>
    </div>
  );
}
