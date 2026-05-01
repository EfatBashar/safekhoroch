import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as Lucide from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ---------- Types ----------
export type IconRef = { type: "lucide"; name: string } | { type: "image"; url: string };

export type NavItem = {
  id: string;
  label: string;
  to: string;
  icon: IconRef;
  color?: string; // tailwind class for drawer color tint
};

export type DrawerSection = {
  id: string;
  label?: string;
  items: NavItem[];
};

export type Branding = {
  appName: string;
  logoUrl?: string; // when set, header shows image instead of text
  logoIcon?: IconRef; // optional icon shown beside name in drawer header
};

export type Theme = {
  primary?: string; // any CSS color (oklch/hex/hsl). Empty = default.
  accent?: string;
  fab?: string;
};

export type AppConfig = {
  branding: Branding;
  bottomNav: NavItem[]; // exactly 5 recommended
  drawer: DrawerSection[];
  theme: Theme;
};

// ---------- Defaults ----------
export const DEFAULT_CONFIG: AppConfig = {
  branding: { appName: "হাত-খরচ" },
  bottomNav: [
    { id: "home", label: "হোম", to: "/", icon: { type: "lucide", name: "LayoutGrid" } },
    { id: "tx", label: "লেনদেন", to: "/transactions", icon: { type: "lucide", name: "Receipt" } },
    { id: "tasks", label: "কাজ", to: "/tasks", icon: { type: "lucide", name: "CheckCircle2" } },
    { id: "loans", label: "ঋণ", to: "/loans", icon: { type: "lucide", name: "Users" } },
    { id: "bakir", label: "বাকির খাতা", to: "/bakir", icon: { type: "lucide", name: "Store" } },
  ],
  drawer: [
    {
      id: "main",
      items: [
        { id: "dash", label: "ড্যাশবোর্ড", to: "/", icon: { type: "lucide", name: "LayoutDashboard" }, color: "text-primary" },
      ],
    },
    {
      id: "fin",
      label: "ফিনান্সিয়াল ম্যানেজমেন্ট",
      items: [
        { id: "tx", label: "লেনদেন", to: "/transactions", icon: { type: "lucide", name: "Wallet" }, color: "text-blue-600" },
        { id: "report", label: "দৈনিক ক্যাশ ফ্লো", to: "/report", icon: { type: "lucide", name: "TrendingUp" }, color: "text-income" },
        { id: "accounts", label: "অ্যাকাউন্টস", to: "/accounts", icon: { type: "lucide", name: "Landmark" }, color: "text-amber-600" },
        { id: "bakir", label: "বাকির খাতা", to: "/bakir", icon: { type: "lucide", name: "BookMarked" }, color: "text-purple-600" },
        { id: "loans", label: "ঋণ", to: "/loans", icon: { type: "lucide", name: "Handshake" }, color: "text-teal-600" },
        { id: "savings", label: "সঞ্চয়", to: "/savings", icon: { type: "lucide", name: "WalletCards" }, color: "text-emerald-600" },
        { id: "budget", label: "বাজেট", to: "/budget", icon: { type: "lucide", name: "PieChart" }, color: "text-indigo-600" },
      ],
    },
    {
      id: "invest",
      label: "লোন ও ইনভেস্টমেন্ট",
      items: [
        { id: "loan2", label: "লোন", to: "/loans", icon: { type: "lucide", name: "CreditCard" }, color: "text-rose-500" },
        { id: "dps", label: "ডিপিএস", to: "/dps", icon: { type: "lucide", name: "PiggyBank" }, color: "text-amber-500" },
        { id: "invest", label: "ইনভেস্টমেন্ট", to: "/investment", icon: { type: "lucide", name: "TrendingUp" }, color: "text-income" },
        { id: "assets", label: "সম্পদ", to: "/assets", icon: { type: "lucide", name: "Gem" }, color: "text-orange-500" },
      ],
    },
    {
      id: "life",
      label: "লাইফস্টাইল",
      items: [
        { id: "market", label: "বাজার", to: "/market", icon: { type: "lucide", name: "ShoppingBasket" }, color: "text-amber-700" },
        { id: "med", label: "ঔষধ", to: "/medicine", icon: { type: "lucide", name: "Pill" }, color: "text-rose-500" },
        { id: "bills", label: "বিল রিমাইন্ডার", to: "/bills", icon: { type: "lucide", name: "ReceiptText" }, color: "text-orange-600" },
        { id: "tasks2", label: "কাজ", to: "/tasks", icon: { type: "lucide", name: "CheckCircle2" }, color: "text-teal-500" },
      ],
    },
    {
      id: "rep",
      label: "রিপোর্ট",
      items: [
        { id: "ana", label: "অ্যানালিটিক্স", to: "/report", icon: { type: "lucide", name: "PieChart" }, color: "text-purple-600" },
      ],
    },
    {
      id: "fam",
      label: "পরিবার",
      items: [
        { id: "family", label: "পরিবার", to: "/family", icon: { type: "lucide", name: "Users2" }, color: "text-teal-600" },
      ],
    },
  ],
  theme: {},
};

// ---------- Icon renderer ----------
export function DynIcon({
  icon,
  className,
  strokeWidth,
}: {
  icon: IconRef;
  className?: string;
  strokeWidth?: number;
}) {
  if (icon.type === "image") {
    return <img src={icon.url} alt="" className={className} style={{ objectFit: "contain" }} />;
  }
  const Cmp = (Lucide as unknown as Record<string, Lucide.LucideIcon>)[icon.name] ?? Lucide.Square;
  return <Cmp className={className} strokeWidth={strokeWidth} />;
}

// ---------- Context ----------
type Ctx = {
  config: AppConfig;
  loading: boolean;
  reload: () => Promise<void>;
  save: (patch: Partial<AppConfig>) => Promise<void>;
};

const AppConfigCtx = createContext<Ctx>({
  config: DEFAULT_CONFIG,
  loading: true,
  reload: async () => {},
  save: async () => {},
});

const KEYS = ["branding", "bottomNav", "drawer", "theme"] as const;

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("app_settings").select("key,value").in("key", KEYS as unknown as string[]);
    const next: AppConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    (data ?? []).forEach((row: { key: string; value: unknown }) => {
      if (row.key === "branding") next.branding = { ...next.branding, ...(row.value as Branding) };
      else if (row.key === "bottomNav" && Array.isArray(row.value)) next.bottomNav = row.value as NavItem[];
      else if (row.key === "drawer" && Array.isArray(row.value)) next.drawer = row.value as DrawerSection[];
      else if (row.key === "theme") next.theme = (row.value as Theme) ?? {};
    });
    setConfig(next);
    applyTheme(next.theme);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("app_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const save = async (patch: Partial<AppConfig>) => {
    const rows: { key: string; value: unknown }[] = [];
    if (patch.branding) rows.push({ key: "branding", value: patch.branding });
    if (patch.bottomNav) rows.push({ key: "bottomNav", value: patch.bottomNav });
    if (patch.drawer) rows.push({ key: "drawer", value: patch.drawer });
    if (patch.theme) rows.push({ key: "theme", value: patch.theme });
    if (!rows.length) return;
    const { error } = await supabase.from("app_settings").upsert(rows, { onConflict: "key" });
    if (error) throw error;
    await load();
  };

  return (
    <AppConfigCtx.Provider value={{ config, loading, reload: load, save }}>
      {children}
    </AppConfigCtx.Provider>
  );
}

export const useAppConfig = () => useContext(AppConfigCtx);

// ---------- Theme application ----------
function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const set = (varName: string, value?: string) => {
    if (value && value.trim()) root.style.setProperty(varName, value);
    else root.style.removeProperty(varName);
  };
  set("--primary", theme.primary);
  set("--accent", theme.accent);
  set("--fab", theme.fab);
  set("--ring", theme.primary);
}
