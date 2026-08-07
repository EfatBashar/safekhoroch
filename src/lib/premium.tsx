import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const SETTINGS_KEY = "premium_features";

type PremiumCtx = {
  premiumRoutes: string[];
  isPremium: boolean;
  loading: boolean;
  isLocked: (route: string) => boolean;
  savePremiumRoutes: (routes: string[]) => Promise<void>;
  reload: () => Promise<void>;
};

const Ctx = createContext<PremiumCtx>({
  premiumRoutes: [],
  isPremium: false,
  loading: true,
  isLocked: () => false,
  savePremiumRoutes: async () => {},
  reload: async () => {},
});

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const [premiumRoutes, setPremiumRoutes] = useState<string[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();
    const value = data?.value;
    setPremiumRoutes(Array.isArray(value) ? (value as string[]) : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("premium_features_changes")
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

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setIsPremium(false);
      return;
    }
    supabase
      .rpc("has_role", { _user_id: user.id, _role: "premium" })
      .then(({ data }) => {
        if (!cancelled) setIsPremium(!!data);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const savePremiumRoutes = async (routes: string[]) => {
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: SETTINGS_KEY, value: routes as unknown as never }, { onConflict: "key" });
    if (error) throw error;
    setPremiumRoutes(routes);
  };

  const isLocked = (route: string) => {
    if (isAdmin || isPremium) return false;
    return premiumRoutes.includes(route);
  };

  return (
    <Ctx.Provider
      value={{ premiumRoutes, isPremium, loading, isLocked, savePremiumRoutes, reload: load }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const usePremium = () => useContext(Ctx);
