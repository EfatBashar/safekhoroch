import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";
import { Users, MessageSquare, BarChart3, Shield, Trash2, Check } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন প্যানেল — হাত-খরচ" },
      { name: "description", content: "অ্যাপ পরিচালনা।" },
    ],
  }),
  component: AdminPage,
});

type Tab = "stats" | "users" | "feedback";

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

      <div className="sticky top-[60px] z-10 flex gap-1 border-b border-border bg-background px-3 py-2">
        <TabBtn active={tab === "stats"} onClick={() => setTab("stats")} icon={BarChart3} label="স্ট্যাটস" />
        <TabBtn active={tab === "users"} onClick={() => setTab("users")} icon={Users} label="ইউজার" />
        <TabBtn active={tab === "feedback"} onClick={() => setTab("feedback")} icon={MessageSquare} label="ফিডব্যাক" />
      </div>

      <div className="px-4 pt-4">
        {tab === "stats" && <StatsTab />}
        {tab === "users" && <UsersTab />}
        {tab === "feedback" && <FeedbackTab />}
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
  const [stats, setStats] = useState({ users: 0, admins: 0, feedback: 0, openFeedback: 0 });

  useEffect(() => {
    (async () => {
      const [u, r, f, fo] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin"),
        supabase.from("feedback").select("*", { count: "exact", head: true }),
        supabase.from("feedback").select("*", { count: "exact", head: true }).eq("status", "open"),
      ]);
      setStats({
        users: u.count ?? 0,
        admins: r.count ?? 0,
        feedback: f.count ?? 0,
        openFeedback: fo.count ?? 0,
      });
    })();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="মোট ইউজার" value={stats.users} icon={Users} />
      <StatCard label="অ্যাডমিন" value={stats.admins} icon={Shield} />
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
  const [users, setUsers] = useState<(Profile & { is_admin: boolean })[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("user_id,role").eq("role", "admin");
    const adminSet = new Set((roles ?? []).map((r) => r.user_id));
    setUsers((profiles ?? []).map((p) => ({ ...p, is_admin: adminSet.has(p.id) })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleAdmin = async (uid: string, makeAdmin: boolean) => {
    if (makeAdmin) {
      const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("অ্যাডমিন করা হয়েছে");
    } else {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", uid)
        .eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("অ্যাডমিন সরানো হয়েছে");
    }
    load();
  };

  if (loading) return <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>;
  if (!users.length) return <p className="text-sm text-muted-foreground">কোনো ইউজার নেই</p>;

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div key={u.id} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-bold text-primary">
            {(u.full_name || u.email || "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{u.full_name || "(নামহীন)"}</p>
            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
          </div>
          <button
            onClick={() => toggleAdmin(u.id, !u.is_admin)}
            className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${
              u.is_admin
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                : "bg-muted text-foreground"
            }`}
          >
            {u.is_admin ? "অ্যাডমিন" : "ইউজার"}
          </button>
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
