import { useMemo, useState } from "react";
import { useAppConfig, DynIcon, type NavItem } from "@/lib/appConfig";
import { usePremium } from "@/lib/premium";
import { toast } from "sonner";
import { Lock, LockOpen, Save } from "lucide-react";

export function PremiumTab() {
  const { config, loading } = useAppConfig();
  const { premiumRoutes, savePremiumRoutes, loading: pLoading } = usePremium();
  const [selected, setSelected] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);

  const current = selected ?? premiumRoutes;

  const items = useMemo(() => {
    const map = new Map<string, NavItem>();
    config.bottomNav.forEach((i) => map.set(i.to, i));
    config.drawer.forEach((s) => s.items.forEach((i) => { if (!map.has(i.to)) map.set(i.to, i); }));
    return [...map.values()].filter((i) => i.to !== "/");
  }, [config]);

  if (loading || pLoading) return <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>;

  const toggle = (to: string) => {
    setSelected(current.includes(to) ? current.filter((r) => r !== to) : [...current, to]);
  };

  const save = async () => {
    setBusy(true);
    try {
      await savePremiumRoutes(current);
      setSelected(null);
      toast.success("প্রিমিয়াম সেটিংস সেভ হয়েছে");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
        যেই অপশনগুলো প্রিমিয়াম করবেন সেগুলো সাধারণ ইউজার lock আইকন সহ দেখবে, ঢুকতে পারবে না। অ্যাডমিন ও
        প্রিমিয়াম ইউজার সবকিছু পাবে।
      </p>

      <div className="space-y-1.5">
        {items.map((item) => {
          const on = current.includes(item.to);
          return (
            <button
              key={item.to}
              onClick={() => toggle(item.to)}
              className="flex w-full items-center gap-3 rounded-xl bg-card p-3 text-left shadow-sm"
            >
              <DynIcon icon={item.icon} className={`h-5 w-5 ${item.color ?? "text-primary"}`} strokeWidth={2.2} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{item.label}</p>
                <p className="truncate text-[10px] text-muted-foreground">{item.to}</p>
              </div>
              <span
                className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                  on ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" : "bg-muted text-muted-foreground"
                }`}
              >
                {on ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
                {on ? "প্রিমিয়াম" : "ফ্রি"}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={save}
        disabled={busy || selected === null}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
      >
        <Save className="h-4 w-4" /> {busy ? "সেভ হচ্ছে..." : "সেভ করুন"}
      </button>
    </div>
  );
}
