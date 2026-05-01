import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Mail, Lock, LogIn } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "লগইন — হাত-খরচ" },
      { name: "description", content: "হাত-খরচ অ্যাপে লগইন বা সাইনআপ।" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) nav({ to: "/" });
  }, [session, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("সাইনআপ সফল! এখন লগইন করুন।");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("লগইন সফল");
        nav({ to: "/" });
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <LogIn className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">{mode === "signin" ? "লগইন" : "সাইনআপ"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">হাত-খরচ অ্যাকাউন্ট</p>
        </div>

        <form onSubmit={submit} className="space-y-3 rounded-2xl bg-card p-5 shadow-sm">
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-xs font-semibold">নাম</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="আপনার পূর্ণ নাম"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold">ইমেইল</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pl-9 text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pl-9 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? "অপেক্ষা..." : mode === "signin" ? "লগইন" : "সাইনআপ"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-sm text-primary"
        >
          {mode === "signin" ? "অ্যাকাউন্ট নেই? সাইনআপ করুন" : "ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন"}
        </button>

        <Link to="/" className="mt-6 block text-center text-xs text-muted-foreground">
          ← হোমে ফিরে যান
        </Link>
      </div>
    </div>
  );
}
