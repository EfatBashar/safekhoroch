import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";
import { Users, MessageSquare, BarChart3, Shield, Trash2, Check, Settings as SettingsIcon, Crown, Search } from "lucide-react";
import { ConfigTab } from "@/components/admin/ConfigTab";
import { PremiumTab } from "@/components/admin/PremiumTab";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন প্যানেল — হাত-খরচ" },
      { name: "description", content: "অ্যাপ পরিচালনা।" },
    ],
  }),
  component: AdminPage,
});

type Tab = "stats" | "users" | "feedback" | "config" | "premium";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
};

type Feedback = {
  id: string;
  email: string | null;
  message: string;
  status: string;
  created_at: string;
};

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("stats");

  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/auth" });
    else if (!isAdmin) nav({ to: "/" });
  }, [user, isAdmin, loading, nav]);

  if (loading || !isAdmin) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">লোড হচ্ছে...</div>
    );
  }

  return (
    <div className="pb-8">
      <PageHeader icon={Shield} title="অ্যাডমিন প্যানেল" subtitle="অ্যাপ পরিচালনা" />

      <div className="sticky top-[60px] z-10 flex gap-1 overflow-x-auto border-b border-border bg-background px-3 py-2">
        <TabBtn active={tab === "stats"} onClick={() => setTab("stats")} icon={BarChart3} label="স্ট্যাটস" />
        <TabBtn active={tab === "users"} onClick={() => setTab("users")} icon={Users} label="ইউজার" />
        <TabBtn active={tab === "feedback"} onClick={() => setTab("feedback")} icon={MessageSquare} label="ফিডব্যাক" />
        <TabBtn active={tab === "premium"} onClick={() => setTab("premium")} icon={Crown} label="প্রিমিয়াম" />
        <TabBtn active={tab === "config"} onClick={() => setTab("config")} icon={SettingsIcon} label="কনফিগ" />
      </div>

      <div className="px-4 pt-4">
        {tab === "stats" && <StatsTab />}
        {tab === "users" && <UsersTab />}
        {tab === "feedback" && <FeedbackTab />}
        {tab === "premium" && <PremiumTab />}
        {tab === "config" && <ConfigTab />}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold ${
        active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function StatsTab() {
  const [stats, setStats] = useState({ users: 0, admins: 0, premium: 0, feedback: 0, openFeedback: 0 });

  useEffect(() => {
    (async () => {
      const [u, r, pr, f, fo] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin"),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "premium"),
        supabase.from("feedback").select("*", { count: "exact", head: true }),
        supabase.from("feedback").select("*", { count: "exact", head: true }).eq("status", "open"),
      ]);
      setStats({
        users: u.count ?? 0,
        admins: r.count ?? 0,
        premium: pr.count ?? 0,
        feedback: f.count ?? 0,
        openFeedback: fo.count ?? 0,
      });
    })();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="মোট ইউজার" value={stats.users} icon={Users} />
      <StatCard label="অ্যাডমিন" value={stats.admins} icon={Shield} />
      <StatCard label="প্রিমিয়াম ইউজার" value={stats.premium} icon={Crown} />
      <StatCard label="মোট ফিডব্যাক" value={stats.feedback} icon={MessageSquare} />
      <StatCard label="অপঠিত ফিডব্যাক" value={stats.openFeedback} icon={MessageSquare} />
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<(Profile & { is_admin: boolean; is_premium: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("user_id,role");
    const adminSet = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
    const premiumSet = new Set(
      (roles ?? []).filter((r) => r.role === "premium").map((r) => r.user_id),
    );
    setUsers(
      (profiles ?? []).map((p) => ({
        ...p,
        is_admin: adminSet.has(p.id),
        is_premium: premiumSet.has(p.id),
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleRole = async (uid: string, role: "admin" | "premium", enable: boolean) => {
    if (enable) {
      const { error } = await supabase.from("user_roles").insert({ user_id: uid, role });
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", uid)
        .eq("role", role);
      if (error) return toast.error(error.message);
    }
    toast.success("আপডেট হয়েছে");
    load();
  };

  const filtered = users.filter((u) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return (u.full_name ?? "").toLowerCase().includes(s) || (u.email ?? "").toLowerCase().includes(s);
  });

  if (loading) return <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="নাম বা ইমেইল খুঁজুন"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
      <p className="text-xs text-muted-foreground">মোট {filtered.length} জন ইউজার</p>

      {!filtered.length && <p className="text-sm text-muted-foreground">কোনো ইউজার নেই</p>}

      {filtered.map((u) => (
        <div key={u.id} className="rounded-xl bg-card p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 font-bold text-primary">
              {(u.full_name || u.email || "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{u.full_name || "(নামহীন)"}</p>
              <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                সাইনআপ: {new Date(u.created_at).toLocaleString("bn-BD")}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                u.is_admin
                  ? "bg-primary/15 text-primary"
                  : u.is_premium
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {u.is_admin ? "অ্যাডমিন" : u.is_premium ? "প্রিমিয়াম" : "ফ্রি"}
            </span>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => toggleRole(u.id, "admin", !u.is_admin)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-bold ${
                u.is_admin ? "bg-primary/15 text-primary" : "bg-muted text-foreground"
              }`}
            >
              {u.is_admin ? "অ্যাডমিন সরান" : "অ্যাডমিন করুন"}
            </button>
            <button
              onClick={() => toggleRole(u.id, "premium", !u.is_premium)}
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold ${
                u.is_premium
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  : "bg-muted text-foreground"
              }`}
            >
              <Crown className="h-3 w-3" />
              {u.is_premium ? "প্রিমিয়াম সরান" : "প্রিমিয়াম করুন"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeedbackTab() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const close = async (id: string) => {
    await supabase.from("feedback").update({ status: "closed" }).eq("id", id);
    toast.success("সমাধান করা হয়েছে");
    load();
  };
  const del = async (id: string) => {
    if (!confirm("মুছে ফেলবেন?")) return;
    await supabase.from("feedback").delete().eq("id", id);
    load();
  };

  if (loading) return <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>;
  if (!items.length) return <p className="text-sm text-muted-foreground">কোনো ফিডব্যাক নেই</p>;

  return (
    <div className="space-y-2">
      {items.map((f) => (
        <div key={f.id} className="rounded-xl bg-card p-3 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                f.status === "open"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  : "bg-income/15 text-income"
              }`}
            >
              {f.status === "open" ? "নতুন" : "সমাপ্ত"}
            </span>
            <span className="text-xs text-muted-foreground">{f.email || "(অজানা)"}</span>
          </div>
          <p className="text-sm">{f.message}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {new Date(f.created_at).toLocaleString("bn-BD")}
          </p>
          <div className="mt-2 flex gap-2">
            {f.status === "open" && (
              <button
                onClick={() => close(f.id)}
                className="flex items-center gap-1 rounded-lg bg-income/15 px-2 py-1 text-xs font-bold text-income"
              >
                <Check className="h-3 w-3" /> সমাধান
              </button>
            )}
            <button
              onClick={() => del(f.id)}
              className="flex items-center gap-1 rounded-lg bg-destructive/15 px-2 py-1 text-xs font-bold text-destructive"
            >
              <Trash2 className="h-3 w-3" /> মুছুন
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
