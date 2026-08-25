import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { useTx } from "@/lib/i18nExtra";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Download,
  RefreshCw,
  Shield,
  KeyRound,
  LogOut,
  LogIn,
  Trash2,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  Bell,
  Moon,
} from "lucide-react";
import { remindersEnabled, setRemindersEnabled, requestNotificationPermission } from "@/lib/reminders";
import { getTheme, setTheme, type Theme } from "@/lib/theme";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "সেটিংস — হাত-খরচ" },
      { name: "description", content: "অ্যাকাউন্ট ও অ্যাপ সেটিংস।" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t, lang } = useT();
  const x = useTx();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [fbMsg, setFbMsg] = useState("");
  const [fullName, setFullName] = useState<string>("");
  const [notifOn, setNotifOn] = useState(false);
  const [darkOn, setDarkOn] = useState(false);

  useEffect(() => setNotifOn(remindersEnabled()), []);
  useEffect(() => setDarkOn(getTheme() === "dark"), []);

  const toggleDark = (checked: boolean) => {
    const next: Theme = checked ? "dark" : "light";
    setTheme(next);
    setDarkOn(checked);
  };

  const toggleNotif = async () => {
    if (notifOn) {
      setRemindersEnabled(false);
      setNotifOn(false);
      return;
    }
    const ok = await requestNotificationPermission();
    if (!ok) return toast.error(x.notifBlocked);
    setRemindersEnabled(true);
    setNotifOn(true);
    toast.success(x.notifOn);
  };

  useEffect(() => {
    if (!user) {
      setFullName("");
      return;
    }
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setFullName(data?.full_name || ""));
  }, [user]);

  const exportData = () => {
    try {
      const all: Record<string, unknown> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("etracker.")) {
          try {
            all[k] = JSON.parse(localStorage.getItem(k) || "null");
          } catch {
            all[k] = localStorage.getItem(k);
          }
        }
      }
      const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hat-khoroch-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(x.exportDone);
    } catch {
      toast.error("Export failed");
    }
  };

  const deleteAll = () => {
    if (!confirm(x.confirmDelete)) return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith("etracker."))
      .forEach((k) => localStorage.removeItem(k));
    toast.success(x.deletedAll);
    setTimeout(() => location.reload(), 600);
  };

  const sendFeedback = async () => {
    if (!fbMsg.trim()) return;
    const { error } = await supabase.from("feedback").insert({
      user_id: user?.id ?? null,
      email: user?.email ?? null,
      message: fbMsg.trim(),
    });
    if (error) return toast.error(error.message);
    toast.success("ধন্যবাদ! আপনার মতামত পাঠানো হয়েছে।");
    setFbMsg("");
    setFeedbackOpen(false);
  };

  const initial = (user?.email || "U").slice(0, 1).toUpperCase();

  return (
    <div className="pb-4">
      <div className="bg-primary/10 px-5 pb-6 pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
            {initial}
          </div>
          <p className="mt-3 text-lg font-bold">{fullName || user?.user_metadata?.full_name || (user ? "(নামহীন)" : t.appName)}</p>
          <p className="text-xs text-muted-foreground">{user?.email || "অতিথি"}</p>
          {!user && (
            <button
              onClick={() => navigate({ to: "/auth" })}
              className="mt-3 flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              <LogIn className="h-3.5 w-3.5" /> লগইন / সাইনআপ
            </button>
          )}
        </div>
      </div>

      {isAdmin && (
        <Section title="অ্যাডমিন">
          <Row
            icon={<ShieldCheck className="h-5 w-5 text-primary" />}
            title="অ্যাডমিন প্যানেল"
            subtitle="ইউজার, স্ট্যাটস ও ফিডব্যাক ম্যানেজ"
            onClick={() => navigate({ to: "/admin" })}
          />
        </Section>
      )}

      {user && authLoading && !isAdmin && (
        <Section title="অ্যাডমিন">
          <Row
            icon={<ShieldCheck className="h-5 w-5 text-primary" />}
            title="অ্যাডমিন চেক হচ্ছে..."
            subtitle="একটু অপেক্ষা করুন"
          />
        </Section>
      )}

      <Section title={t.account_label}>
        
        <Row icon={<Download className="h-5 w-5 text-income" />} title={t.dataExport} subtitle={t.dataExportSub} onClick={exportData} />
        <Row icon={<RefreshCw className="h-5 w-5 text-primary" />} title={t.cloudSync} subtitle={t.cloudSyncSub} onClick={() => toast.info(t.comingSoon)} />
        <Row
          icon={<Bell className={`h-5 w-5 ${notifOn ? "text-income" : "text-muted-foreground"}`} />}
          title={x.enableNotif}
          subtitle={notifOn ? x.notifOn : ""}
          onClick={toggleNotif}
        />
        <Row
          icon={<Moon className={`h-5 w-5 ${darkOn ? "text-primary" : "text-muted-foreground"}`} />}
          title={lang === "bn" ? "ডার্ক মোড" : "Dark mode"}
          right={<Switch checked={darkOn} onCheckedChange={toggleDark} />}
        />
        <Row icon={<Shield className="h-5 w-5 text-teal-600" />} title={t.privacyPolicy} onClick={() => toast.info(t.comingSoon)} />
        <Row icon={<KeyRound className="h-5 w-5 text-blue-600" />} title={t.changePassword} onClick={() => toast.info(t.comingSoon)} />
        {user ? (
          <Row
            icon={<LogOut className="h-5 w-5 text-amber-600" />}
            title={t.signOut}
            onClick={async () => {
              await signOut();
              toast.success(x.signedOut);
            }}
          />
        ) : (
          <Row icon={<LogIn className="h-5 w-5 text-primary" />} title="লগইন" onClick={() => navigate({ to: "/auth" })} />
        )}
      </Section>

      <Section title={t.helpContact}>
        <Row icon={<MessageSquare className="h-5 w-5 text-primary" />} title="ফিডব্যাক পাঠান" subtitle="আপনার মতামত / সমস্যা" onClick={() => setFeedbackOpen(true)} />
      </Section>

      {feedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setFeedbackOpen(false)}>
          <div className="w-full max-w-md rounded-t-2xl bg-card p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-2 text-lg font-bold">ফিডব্যাক পাঠান</h2>
            <textarea
              value={fbMsg}
              onChange={(e) => setFbMsg(e.target.value)}
              rows={4}
              placeholder="আপনার মতামত লিখুন..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <div className="mt-3 flex gap-2">
              <button onClick={() => setFeedbackOpen(false)} className="flex-1 rounded-lg bg-muted py-2 text-sm font-bold">বাতিল</button>
              <button onClick={sendFeedback} className="flex-1 rounded-lg bg-primary py-2 text-sm font-bold text-primary-foreground">পাঠান</button>
            </div>
          </div>
        </div>
      )}

      <Section title={t.dangerZone} danger>
        <Row icon={<Trash2 className="h-5 w-5 text-destructive" />} title={t.deleteAccount} subtitle={t.deleteAccountSub} danger onClick={deleteAll} />
      </Section>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {t.appName} • {t.appVersion}
      </p>
    </div>
  );
}

function Section({ title, children, danger }: { title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div className="mt-4">
      <p className={`px-5 pb-2 text-xs font-semibold uppercase tracking-wider ${danger ? "text-destructive" : "text-muted-foreground"}`}>{title}</p>
      <div className="divide-y divide-border bg-card">{children}</div>
    </div>
  );
}

function Row({
  icon,
  title,
  subtitle,
  onClick,
  danger,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  danger?: boolean;
  right?: React.ReactNode;
}) {
  const Comp = right ? "div" : "button";
  return (
    <Comp
      onClick={right ? undefined : onClick}
      className="flex w-full items-center gap-4 px-5 py-3.5 text-left active:bg-muted"
    >
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-bold ${danger ? "text-destructive" : "text-foreground"}`}>{title}</p>
        {subtitle && <p className={`text-xs ${danger ? "text-destructive/80" : "text-muted-foreground"}`}>{subtitle}</p>}
      </div>
      {right ?? <ChevronRight className={`h-4 w-4 ${danger ? "text-destructive" : "text-muted-foreground"}`} />}
    </Comp>
  );
}
