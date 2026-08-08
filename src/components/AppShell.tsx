import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Plus,
  Menu,
  Bell,
  Settings as SettingsIcon,
  ShieldCheck,
  LogOut,
  X,
} from "lucide-react";
import { AddSheet } from "./AddSheet";
import { cn } from "@/lib/utils";
import { LanguageProvider, useT } from "@/lib/i18n";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AppConfigProvider, useAppConfig, DynIcon } from "@/lib/appConfig";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { FabProvider, useFab } from "@/lib/fab";
import { PremiumProvider, usePremium } from "@/lib/premium";
import { PremiumLockScreen } from "@/components/PremiumGate";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { scanBillReminders } from "@/lib/reminders";
import { notificationStore } from "@/lib/listStore";
import { useTx } from "@/lib/i18nExtra";

export function AppShell() {
  return (
    <AuthProvider>
      <AppConfigProvider>
        <PremiumProvider>
          <LanguageProvider>
            <FabProvider>
              <AppShellInner />
            </FabProvider>
          </LanguageProvider>
        </PremiumProvider>
      </AppConfigProvider>
    </AuthProvider>
  );
}


function AppShellInner() {
  const [addOpen, setAddOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang, setLang } = useT();
  const { isAdmin } = useAuth();
  const { config } = useAppConfig();
  const { action: fabAction } = useFab();
  const { isLocked } = usePremium();
  const x = useTx();
  const notifs = notificationStore.use();
  const unread = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    scanBillReminders({
      title: x.billDueTitle,
      dueIn: (d) => (d <= 0 ? x.fToday : `${d} ${lang === "bn" ? "দিন বাকি" : "days left"}`),
    });
    const id = setInterval(
      () =>
        scanBillReminders({
          title: x.billDueTitle,
          dueIn: (d) => (d <= 0 ? x.fToday : `${d} ${lang === "bn" ? "দিন বাকি" : "days left"}`),
        }),
      60 * 60 * 1000,
    );
    return () => clearInterval(id);
  }, [x, lang]);
  const locked = isLocked(location.pathname);


  const tabs = config.bottomNav;

  // Determine page title for header
  const pageTitle = (() => {
    if (location.pathname === "/") return config.branding.appName || t.appName;
    if (location.pathname.startsWith("/transactions")) return t.activity;
    if (location.pathname.startsWith("/accounts")) return t.accountsTitle;
    if (location.pathname.startsWith("/loans")) return t.loansTitle;
    if (location.pathname.startsWith("/tasks")) return t.tasksTitle;
    if (location.pathname.startsWith("/bakir")) return t.bakirTitle;
    if (location.pathname.startsWith("/settings")) return t.settingsTitle;
    if (location.pathname.startsWith("/admin")) return "অ্যাডমিন";
    return config.branding.appName || t.appName;
  })();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground">
        <div className="flex items-center justify-between px-3 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-3">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label={t.menu}
            className="flex h-10 w-10 items-center justify-center rounded-lg active:bg-white/10"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            {config.branding.logoUrl && (
              <img src={config.branding.logoUrl} alt="" className="h-7 w-7 rounded object-contain" />
            )}
            <h1 className="font-display text-xl font-bold tracking-tight">{pageTitle}</h1>
          </div>
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
              className="relative flex h-10 w-10 items-center justify-center rounded-lg active:bg-white/10"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-expense px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate({ to: "/admin" })}
                aria-label="Admin Panel"
                className="flex h-10 w-10 items-center justify-center rounded-lg active:bg-white/10"
              >
                <ShieldCheck className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => navigate({ to: "/settings" })}
              aria-label={t.settings}
              className="flex h-10 w-10 items-center justify-center rounded-lg active:bg-white/10"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-32">
        {locked ? <PremiumLockScreen /> : <Outlet />}
      </main>

      {!locked && !["/report", "/settings", "/notifications", "/admin", "/auth"].some(
        (p) => location.pathname === p || location.pathname.startsWith(p + "/"),
      ) && (
        <button
          aria-label={t.add}
          onClick={() => (fabAction ? fabAction() : setAddOpen(true))}
          className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-2xl bg-fab text-fab-foreground transition-transform active:scale-95"
          style={{ boxShadow: "var(--shadow-fab)" }}
        >
          <Plus className="h-7 w-7" strokeWidth={2.5} />
        </button>
      )}


      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-card/95 backdrop-blur">
        <ul className="grid px-1 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] pt-1.5" style={{ gridTemplateColumns: `repeat(${Math.max(tabs.length, 1)}, minmax(0,1fr))` }}>
          {tabs.map((tab) => {
            const active = tab.to === "/"
              ? location.pathname === "/"
              : location.pathname === tab.to || location.pathname.startsWith(tab.to + "/");
            const tabLocked = isLocked(tab.to);
            return (
              <li key={tab.id}>
                <Link
                  to={tab.to}
                  onClick={(e) => {
                    if (tabLocked) {
                      e.preventDefault();
                      toast.error("এটি একটি প্রিমিয়াম ফিচার");
                    }
                  }}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                    tabLocked && "opacity-60",
                  )}
                >
                  <DynIcon icon={tab.icon} className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                  {tabLocked && (
                    <Lock className="absolute right-1.5 top-0 h-3 w-3 text-amber-500" strokeWidth={3} />
                  )}
                  <span className="leading-tight">{tab.label}</span>
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
  const { isAdmin, signOut } = useAuth();
  const { config } = useAppConfig();
  const { isLocked } = usePremium();
  const x = useTx();
  const notifs = notificationStore.use();
  const unread = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    scanBillReminders({
      title: x.billDueTitle,
      dueIn: (d) => (d <= 0 ? x.fToday : `${d} ${lang === "bn" ? "দিন বাকি" : "days left"}`),
    });
    const id = setInterval(
      () =>
        scanBillReminders({
          title: x.billDueTitle,
          dueIn: (d) => (d <= 0 ? x.fToday : `${d} ${lang === "bn" ? "দিন বাকি" : "days left"}`),
        }),
      60 * 60 * 1000,
    );
    return () => clearInterval(id);
  }, [x, lang]);
  const navigate = useNavigate();

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  const handleLogout = async () => {
    onOpenChange(false);
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] p-0 sm:w-[320px]">
        <div className="bg-primary px-5 pb-6 pt-[calc(env(safe-area-inset-top)+1rem)] text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white text-2xl font-bold text-primary">
              {config.branding.logoUrl ? (
                <img src={config.branding.logoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                (config.branding.appName || "U").slice(0, 1)
              )}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg active:bg-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-3 text-lg font-bold">{config.branding.appName || t.appName}</p>
          <p className="text-xs opacity-80">{t.greetingSub}</p>
        </div>

        <div className="h-[calc(100vh-160px)] overflow-y-auto pb-8">
          {config.drawer.map((section) => (
            <div key={section.id} className="border-b border-border">
              {section.label && (
                <p className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.label}
                </p>
              )}
              <ul>
                {section.items.map((item) => {
                  const itemLocked = isLocked(item.to);
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          if (itemLocked) {
                            onOpenChange(false);
                            toast.error("এটি একটি প্রিমিয়াম ফিচার");
                            return;
                          }
                          go(item.to);
                        }}
                        className="flex w-full items-center gap-4 px-5 py-3 text-left active:bg-muted"
                      >
                        <DynIcon icon={item.icon} className={cn("h-5 w-5", item.color, itemLocked && "opacity-60")} strokeWidth={2.2} />
                        <span className={cn("flex-1 text-sm font-medium text-foreground", itemLocked && "opacity-60")}>
                          {item.label}
                        </span>
                        {itemLocked && <Lock className="h-4 w-4 text-amber-500" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {isAdmin && (
            <div className="border-b border-border">
              <p className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                অ্যাডমিন
              </p>
              <ul>
                <li>
                  <button
                    onClick={() => go("/admin")}
                    className="flex w-full items-center gap-4 px-5 py-3 text-left active:bg-muted"
                  >
                    <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={2.2} />
                    <span className="text-sm font-medium text-foreground">অ্যাডমিন প্যানেল</span>
                  </button>
                </li>
              </ul>
            </div>
          )}

          <div>
            <ul>
              <li>
                <button
                  onClick={() => go("/settings")}
                  className="flex w-full items-center gap-4 px-5 py-3 text-left active:bg-muted"
                >
                  <SettingsIcon className="h-5 w-5 text-slate-500" strokeWidth={2.2} />
                  <span className="text-sm font-medium text-foreground">{t.settings}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-4 px-5 py-3 text-left active:bg-muted"
                >
                  <LogOut className="h-5 w-5 text-rose-500" strokeWidth={2.2} />
                  <span className="text-sm font-medium text-foreground">{t.drawerLogout}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
