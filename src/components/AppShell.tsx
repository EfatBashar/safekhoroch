import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutGrid,
  Receipt,
  CheckCircle2,
  Users,
  Store,
  Plus,
  Menu,
  Bell,
  Settings as SettingsIcon,
  User,
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Landmark,
  BookMarked,
  Handshake,
  WalletCards,
  PieChart as PieIcon,
  CreditCard,
  PiggyBank,
  Gem,
  ShoppingBasket,
  Pill,
  ReceiptText,
  Users2,
  Award,
  LogOut,
  X,
} from "lucide-react";
import { AddSheet } from "./AddSheet";
import { cn } from "@/lib/utils";
import { LanguageProvider, useT } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function AppShell() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppShellInner />
      </LanguageProvider>
    </AuthProvider>
  );
}

function AppShellInner() {
  const [addOpen, setAddOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang, setLang } = useT();

  const tabs = [
    { to: "/", label: t.navDashboard, icon: LayoutGrid, exact: true },
    { to: "/transactions", label: t.navTransactions, icon: Receipt, exact: false },
    { to: "/tasks", label: t.navTodo, icon: CheckCircle2, exact: false },
    { to: "/loans", label: t.navDebt, icon: Users, exact: false },
    { to: "/bakir", label: t.navBakir, icon: Store, exact: false },
  ] as const;

  // Determine page title for header
  const pageTitle = (() => {
    if (location.pathname === "/") return t.appName;
    if (location.pathname.startsWith("/transactions")) return t.activity;
    if (location.pathname.startsWith("/accounts")) return t.accountsTitle;
    if (location.pathname.startsWith("/loans")) return t.loansTitle;
    if (location.pathname.startsWith("/tasks")) return t.tasksTitle;
    if (location.pathname.startsWith("/bakir")) return t.bakirTitle;
    if (location.pathname.startsWith("/settings")) return t.settingsTitle;
    if (location.pathname.startsWith("/pro")) return t.proTitle;
    return t.appName;
  })();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      {/* Top app bar (green like হাত-খরচ) */}
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground">
        <div className="flex items-center justify-between px-3 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-3">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label={t.menu}
            className="flex h-10 w-10 items-center justify-center rounded-lg active:bg-white/10"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="font-display text-xl font-bold tracking-tight">{pageTitle}</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLang(lang === "bn" ? "en" : "bn")}
              className="rounded-lg px-2 py-1 text-xs font-bold active:bg-white/10"
              aria-label="Toggle language"
            >
              {lang === "bn" ? "EN" : "বাং"}
            </button>
            <button
              onClick={() => navigate({ to: "/notifications" })}
              aria-label={t.notifications}
              className="flex h-10 w-10 items-center justify-center rounded-lg active:bg-white/10"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate({ to: "/settings" })}
              aria-label={t.settings}
              className="flex h-10 w-10 items-center justify-center rounded-lg active:bg-white/10"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label={t.profile}
              className="flex h-10 w-10 items-center justify-center rounded-lg active:bg-white/10"
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-32">
        <Outlet />
      </main>

      {/* FAB — hide on pages that have their own FAB */}
      {!["/budget", "/savings", "/dps", "/bills", "/investment", "/assets", "/bakir"].some(
        (p) => location.pathname === p || location.pathname.startsWith(p + "/"),
      ) && (
        <button
          aria-label={t.add}
          onClick={() => setAddOpen(true)}
          className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-2xl bg-fab text-fab-foreground transition-transform active:scale-95"
          style={{ boxShadow: "var(--shadow-fab)" }}
        >
          <Plus className="h-7 w-7" strokeWidth={2.5} />
        </button>
      )}

      {/* Bottom nav (5 tabs) */}
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-card/95 backdrop-blur">
        <ul className="grid grid-cols-5 px-1 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] pt-1.5">
          {tabs.map(({ to, label, icon: Icon, exact }) => {
            const active = exact
              ? location.pathname === to
              : location.pathname.startsWith(to);
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                  <span className="leading-tight">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <AddSheet open={addOpen} onOpenChange={setAddOpen} />
      <SideDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}

function SideDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useT();
  const navigate = useNavigate();

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  const sections: {
    label?: string;
    items: { icon: React.ElementType; label: string; to: string; color: string }[];
  }[] = [
    {
      items: [
        { icon: LayoutDashboard, label: t.dashboard, to: "/", color: "text-primary" },
      ],
    },
    {
      label: t.drawerFinancialMgmt,
      items: [
        { icon: Wallet, label: t.featTransactions, to: "/transactions", color: "text-blue-600" },
        { icon: TrendingUp, label: t.drawerDailyCashFlow, to: "/report", color: "text-income" },
        { icon: Landmark, label: t.featAccounts, to: "/accounts", color: "text-amber-600" },
        { icon: BookMarked, label: t.featLedger, to: "/bakir", color: "text-purple-600" },
        { icon: Handshake, label: t.featDebt, to: "/loans", color: "text-teal-600" },
        { icon: WalletCards, label: t.featSavings, to: "/savings", color: "text-emerald-600" },
        { icon: PieIcon, label: t.featBudget, to: "/budget", color: "text-indigo-600" },
      ],
    },
    {
      label: t.drawerLoanInvest,
      items: [
        { icon: CreditCard, label: t.featLoan, to: "/loans", color: "text-rose-500" },
        { icon: PiggyBank, label: t.featDPS, to: "/dps", color: "text-amber-500" },
        { icon: TrendingUp, label: t.drawerInvestment, to: "/investment", color: "text-income" },
        { icon: Gem, label: t.drawerAssetVault, to: "/assets", color: "text-orange-500" },
      ],
    },
    {
      label: t.drawerLifestyle,
      items: [
        { icon: ShoppingBasket, label: t.toolMarket, to: "/market", color: "text-amber-700" },
        { icon: Pill, label: t.toolMedicine, to: "/medicine", color: "text-rose-500" },
        { icon: ReceiptText, label: t.drawerBillReminder, to: "/bills", color: "text-orange-600" },
        { icon: CheckCircle2, label: t.featTasks, to: "/tasks", color: "text-teal-500" },
      ],
    },
    {
      label: t.drawerReports,
      items: [
        { icon: PieIcon, label: t.toolAnalytics, to: "/report", color: "text-purple-600" },
        { icon: ReceiptText, label: t.toolReport, to: "/report", color: "text-slate-600" },
      ],
    },
    {
      label: t.drawerFamily,
      items: [
        { icon: Users2, label: t.drawerFamily2, to: "/family", color: "text-teal-600" },
      ],
    },
    {
      items: [
        { icon: Award, label: t.drawerProUpgrade, to: "/pro", color: "text-amber-500" },
        { icon: SettingsIcon, label: t.settings, to: "/settings", color: "text-slate-500" },
        { icon: LogOut, label: t.drawerLogout, to: "/", color: "text-rose-500" },
      ],
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] p-0 sm:w-[320px]">
        {/* Profile header */}
        <div className="bg-primary px-5 pb-6 pt-[calc(env(safe-area-inset-top)+1rem)] text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-primary">
              U
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg active:bg-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-3 text-lg font-bold">{t.appName}</p>
          <p className="text-xs opacity-80">{t.greetingSub}</p>
        </div>

        {/* Scrollable menu */}
        <div className="h-[calc(100vh-160px)] overflow-y-auto pb-8">
          {sections.map((section, idx) => (
            <div key={idx} className="border-b border-border">
              {section.label && (
                <p className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.label}
                </p>
              )}
              <ul>
                {section.items.map((item, i) => (
                  <li key={i}>
                    <button
                      onClick={() => go(item.to)}
                      className="flex w-full items-center gap-4 px-5 py-3 text-left active:bg-muted"
                    >
                      <item.icon className={cn("h-5 w-5", item.color)} strokeWidth={2.2} />
                      <span className="text-sm font-medium text-foreground">
                        {item.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
