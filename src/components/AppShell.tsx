import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutDashboard, Receipt, Wallet, HandCoins, Plus } from "lucide-react";
import { AddSheet } from "./AddSheet";
import { cn } from "@/lib/utils";
import { LanguageProvider, useT } from "@/lib/i18n";

export function AppShell() {
  return (
    <LanguageProvider>
      <AppShellInner />
    </LanguageProvider>
  );
}

function AppShellInner() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { t, lang, setLang } = useT();

  const tabs = [
    { to: "/", label: t.home, icon: LayoutDashboard, exact: true },
    { to: "/transactions", label: t.activity, icon: Receipt, exact: false },
    { to: "/accounts", label: t.accounts, icon: Wallet, exact: false },
    { to: "/loans", label: t.loans, icon: HandCoins, exact: false },
  ] as const;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      {/* Language toggle */}
      <div className="fixed top-3 right-3 z-40 mx-auto flex max-w-md justify-end">
        <div className="flex items-center rounded-full border border-border bg-card/90 p-0.5 text-xs font-semibold shadow-sm backdrop-blur">
          <button
            onClick={() => setLang("en")}
            className={cn(
              "rounded-full px-3 py-1 transition-colors",
              lang === "en"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground",
            )}
            aria-pressed={lang === "en"}
          >
            EN
          </button>
          <button
            onClick={() => setLang("bn")}
            className={cn(
              "rounded-full px-3 py-1 transition-colors",
              lang === "bn"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground",
            )}
            aria-pressed={lang === "bn"}
          >
            বাং
          </button>
        </div>
      </div>

      <main className="flex-1 pb-32">
        <Outlet />
      </main>

      <button
        aria-label={t.add}
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-1/2 z-30 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
        style={{ boxShadow: "var(--shadow-fab)" }}
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </button>

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-card/95 backdrop-blur">
        <ul className="grid grid-cols-4 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2">
          {tabs.map(({ to, label, icon: Icon, exact }) => {
            const active = exact
              ? location.pathname === to
              : location.pathname.startsWith(to);
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <AddSheet open={open} onOpenChange={setOpen} />
    </div>
  );
}
