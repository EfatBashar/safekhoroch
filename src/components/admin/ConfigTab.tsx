import { useEffect, useMemo, useRef, useState } from "react";
import * as Lucide from "lucide-react";
import { useAppConfig, DynIcon, type IconRef, type NavItem, type DrawerSection, type AppConfig } from "@/lib/appConfig";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Save, Image as ImageIcon, Search, GripVertical, ArrowUp, ArrowDown } from "lucide-react";

// Curated list of common Lucide icons for quick picking; full set still searchable
const POPULAR_ICONS = [
  "LayoutGrid","LayoutDashboard","Receipt","ReceiptText","CheckCircle2","Users","Users2","User","Store","Wallet","WalletCards","TrendingUp","Landmark","BookMarked","Handshake","PieChart","CreditCard","PiggyBank","Gem","ShoppingBasket","Pill","ShieldCheck","Settings","Bell","Home","Heart","Star","Calendar","Clock","Mail","Phone","MapPin","Camera","Image","Search","Filter","Plus","Minus","Edit","Trash2","Save","Download","Upload","Share2","Lock","Unlock","Key","Eye","EyeOff","Sun","Moon","Cloud","Zap","Award","Gift","Coffee","Briefcase","Building","Car","Plane","Bike","Music","Film","Book","FileText","Folder","Database","Server","Globe","Wifi","Battery","Bluetooth","Bookmark","Tag","Flag","Anchor","Compass","Map","Navigation","Target","Trophy","Crown","Sparkles","Flame","Snowflake","Umbrella","Leaf","TreePine","Sprout","Apple","Cake","Pizza","Utensils","Wine","Beer","Smile","Frown","ThumbsUp","ThumbsDown","MessageCircle","MessageSquare","Send","Inbox","Archive","Hammer","Wrench","Cog","Activity","BarChart3","LineChart","Percent","DollarSign","Banknote","Coins","HandCoins","Scale","Truck","Package","ShoppingBag","ShoppingCart","Stethoscope","Syringe","HeartPulse","Dumbbell","Trees","Mountain","Waves","Tent",
];

const TINT_COLORS = [
  { label: "প্রাইমারি", value: "text-primary" },
  { label: "নীল", value: "text-blue-600" },
  { label: "সবুজ", value: "text-income" },
  { label: "অ্যাম্বার", value: "text-amber-600" },
  { label: "বেগুনি", value: "text-purple-600" },
  { label: "টিল", value: "text-teal-600" },
  { label: "ইন্ডিগো", value: "text-indigo-600" },
  { label: "এমেরাল্ড", value: "text-emerald-600" },
  { label: "রোজ", value: "text-rose-500" },
  { label: "অরেঞ্জ", value: "text-orange-600" },
  { label: "স্লেট", value: "text-slate-600" },
];

type SubTab = "branding" | "bottomNav" | "drawer" | "theme";

export function ConfigTab() {
  const { config, save, loading } = useAppConfig();
  const [sub, setSub] = useState<SubTab>("branding");

  if (loading) return <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {([
          ["branding", "ব্র্যান্ড"],
          ["bottomNav", "বটম ন্যাভ"],
          ["drawer", "ড্রয়ার"],
          ["theme", "থিম"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setSub(k)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${sub === k ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {sub === "branding" && <BrandingEditor config={config} save={save} />}
      {sub === "bottomNav" && <BottomNavEditor config={config} save={save} />}
      {sub === "drawer" && <DrawerEditor config={config} save={save} />}
      {sub === "theme" && <ThemeEditor config={config} save={save} />}
    </div>
  );
}

// ---------- Branding ----------
function BrandingEditor({ config, save }: { config: AppConfig; save: (p: Partial<AppConfig>) => Promise<void> }) {
  const [appName, setAppName] = useState(config.branding.appName);
  const [logoUrl, setLogoUrl] = useState(config.branding.logoUrl ?? "");
  const [busy, setBusy] = useState(false);

  const handleUpload = async (file: File) => {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("app-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("app-assets").getPublicUrl(path);
      setLogoUrl(data.publicUrl);
      toast.success("লোগো আপলোড হয়েছে");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const onSave = async () => {
    setBusy(true);
    try {
      await save({ branding: { appName, logoUrl: logoUrl || undefined } });
      toast.success("সংরক্ষিত");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 rounded-2xl bg-card p-4 shadow-sm">
      <Field label="অ্যাপের নাম">
        <input value={appName} onChange={(e) => setAppName(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      </Field>
      <Field label="লোগো">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-muted">
            {logoUrl ? <img src={logoUrl} alt="" className="h-full w-full object-contain" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
          </div>
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer rounded-lg bg-muted px-3 py-1.5 text-xs font-bold">
              ছবি আপলোড
              <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            </label>
            {logoUrl && (
              <button onClick={() => setLogoUrl("")} className="rounded-lg bg-destructive/15 px-3 py-1.5 text-xs font-bold text-destructive">
                সরান
              </button>
            )}
          </div>
        </div>
        <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="অথবা URL পেস্ট করুন" className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs" />
      </Field>
      <button onClick={onSave} disabled={busy} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
        <Save className="h-4 w-4" /> সংরক্ষণ
      </button>
    </div>
  );
}

// ---------- Bottom Nav ----------
function BottomNavEditor({ config, save }: { config: AppConfig; save: (p: Partial<AppConfig>) => Promise<void> }) {
  const [items, setItems] = useState<NavItem[]>(config.bottomNav);
  const [busy, setBusy] = useState(false);

  useEffect(() => setItems(config.bottomNav), [config.bottomNav]);

  const update = (idx: number, patch: Partial<NavItem>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };
  const remove = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const add = () => setItems((prev) => [...prev, { id: `tab-${Date.now()}`, label: "নতুন", to: "/", icon: { type: "lucide", name: "Square" } }]);
  const move = (idx: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };

  const onSave = async () => {
    setBusy(true);
    try {
      await save({ bottomNav: items });
      toast.success("সংরক্ষিত");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      {items.map((it, idx) => (
        <NavItemRow
          key={it.id}
          item={it}
          onChange={(p) => update(idx, p)}
          onRemove={() => remove(idx)}
          onMoveUp={() => move(idx, -1)}
          onMoveDown={() => move(idx, 1)}
        />
      ))}
      <div className="flex gap-2">
        <button onClick={add} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-muted py-2.5 text-sm font-bold">
          <Plus className="h-4 w-4" /> নতুন ট্যাব
        </button>
        <button onClick={onSave} disabled={busy} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">
          <Save className="h-4 w-4" /> সংরক্ষণ
        </button>
      </div>
      <p className="text-xs text-muted-foreground">টিপ: ৫টি ট্যাব রাখাই ভালো। বেশি/কম দিলেও কাজ করবে।</p>
    </div>
  );
}

// ---------- Drawer Editor ----------
function DrawerEditor({ config, save }: { config: AppConfig; save: (p: Partial<AppConfig>) => Promise<void> }) {
  const [sections, setSections] = useState<DrawerSection[]>(config.drawer);
  const [busy, setBusy] = useState(false);

  useEffect(() => setSections(config.drawer), [config.drawer]);

  const updateSection = (sIdx: number, patch: Partial<DrawerSection>) => {
    setSections((prev) => prev.map((s, i) => (i === sIdx ? { ...s, ...patch } : s)));
  };
  const removeSection = (sIdx: number) => setSections((prev) => prev.filter((_, i) => i !== sIdx));
  const addSection = () => setSections((prev) => [...prev, { id: `sec-${Date.now()}`, label: "নতুন সেকশন", items: [] }]);
  const moveSection = (sIdx: number, dir: -1 | 1) => {
    setSections((prev) => {
      const next = [...prev];
      const j = sIdx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[sIdx], next[j]] = [next[j], next[sIdx]];
      return next;
    });
  };

  const updateItem = (sIdx: number, iIdx: number, patch: Partial<NavItem>) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sIdx ? { ...s, items: s.items.map((it, j) => (j === iIdx ? { ...it, ...patch } : it)) } : s,
      ),
    );
  };
  const removeItem = (sIdx: number, iIdx: number) => {
    setSections((prev) => prev.map((s, i) => (i === sIdx ? { ...s, items: s.items.filter((_, j) => j !== iIdx) } : s)));
  };
  const addItem = (sIdx: number) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sIdx ? { ...s, items: [...s.items, { id: `it-${Date.now()}`, label: "নতুন", to: "/", icon: { type: "lucide", name: "Square" }, color: "text-primary" }] } : s,
      ),
    );
  };
  const moveItem = (sIdx: number, iIdx: number, dir: -1 | 1) => {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== sIdx) return s;
        const next = [...s.items];
        const j = iIdx + dir;
        if (j < 0 || j >= next.length) return s;
        [next[iIdx], next[j]] = [next[j], next[iIdx]];
        return { ...s, items: next };
      }),
    );
  };

  const onSave = async () => {
    setBusy(true);
    try {
      await save({ drawer: sections });
      toast.success("সংরক্ষিত");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {sections.map((sec, sIdx) => (
        <div key={sec.id} className="rounded-2xl bg-card p-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <input
              value={sec.label ?? ""}
              onChange={(e) => updateSection(sIdx, { label: e.target.value })}
              placeholder="সেকশনের লেবেল"
              className="flex-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm font-bold"
            />
            <button onClick={() => moveSection(sIdx, -1)} className="rounded-md bg-muted p-1.5"><ArrowUp className="h-3.5 w-3.5" /></button>
            <button onClick={() => moveSection(sIdx, 1)} className="rounded-md bg-muted p-1.5"><ArrowDown className="h-3.5 w-3.5" /></button>
            <button onClick={() => removeSection(sIdx)} className="rounded-md bg-destructive/15 p-1.5 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          <div className="space-y-2">
            {sec.items.map((it, iIdx) => (
              <NavItemRow
                key={it.id}
                item={it}
                showColor
                onChange={(p) => updateItem(sIdx, iIdx, p)}
                onRemove={() => removeItem(sIdx, iIdx)}
                onMoveUp={() => moveItem(sIdx, iIdx, -1)}
                onMoveDown={() => moveItem(sIdx, iIdx, 1)}
              />
            ))}
            <button onClick={() => addItem(sIdx)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-muted py-2 text-xs font-bold">
              <Plus className="h-3.5 w-3.5" /> আইটেম যোগ
            </button>
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <button onClick={addSection} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-muted py-2.5 text-sm font-bold">
          <Plus className="h-4 w-4" /> নতুন সেকশন
        </button>
        <button onClick={onSave} disabled={busy} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">
          <Save className="h-4 w-4" /> সংরক্ষণ
        </button>
      </div>
    </div>
  );
}

// ---------- Theme ----------
function ThemeEditor({ config, save }: { config: AppConfig; save: (p: Partial<AppConfig>) => Promise<void> }) {
  const [primary, setPrimary] = useState(config.theme.primary ?? "");
  const [accent, setAccent] = useState(config.theme.accent ?? "");
  const [fab, setFab] = useState(config.theme.fab ?? "");
  const [busy, setBusy] = useState(false);

  const onSave = async () => {
    setBusy(true);
    try {
      await save({ theme: { primary: primary || undefined, accent: accent || undefined, fab: fab || undefined } });
      toast.success("সংরক্ষিত");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setPrimary("");
    setAccent("");
    setFab("");
    await save({ theme: {} });
    toast.success("ডিফল্টে ফিরে গেছে");
  };

  return (
    <div className="space-y-3 rounded-2xl bg-card p-4 shadow-sm">
      <ColorField label="প্রাইমারি (হেডার/বাটন)" value={primary} onChange={setPrimary} />
      <ColorField label="অ্যাকসেন্ট" value={accent} onChange={setAccent} />
      <ColorField label="FAB (+ বাটন)" value={fab} onChange={setFab} />
      <p className="text-xs text-muted-foreground">যেকোনো CSS রঙ লিখুন (যেমন <code>#16a34a</code> বা <code>oklch(0.5 0.15 150)</code>)। ফাঁকা রাখলে ডিফল্ট।</p>
      <div className="flex gap-2">
        <button onClick={onSave} disabled={busy} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
          <Save className="h-4 w-4" /> সংরক্ষণ
        </button>
        <button onClick={reset} className="rounded-lg bg-muted px-4 py-2 text-sm font-bold">ডিফল্ট</button>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <input
          type="color"
          value={value.startsWith("#") ? value : "#16a34a"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-lg border border-input bg-background"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#16a34a বা oklch(...)"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    </Field>
  );
}

// ---------- Shared ----------
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function NavItemRow({
  item,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  showColor,
}: {
  item: NavItem;
  onChange: (p: Partial<NavItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  showColor?: boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="rounded-xl bg-muted/40 p-2.5">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPickerOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background"
          title="আইকন বাছাই"
        >
          <DynIcon icon={item.icon} className={`h-5 w-5 ${item.color ?? ""}`} />
        </button>
        <input
          value={item.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="লেবেল"
          className="flex-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm"
        />
        <button onClick={onMoveUp} className="rounded-md bg-background p-1.5"><ArrowUp className="h-3.5 w-3.5" /></button>
        <button onClick={onMoveDown} className="rounded-md bg-background p-1.5"><ArrowDown className="h-3.5 w-3.5" /></button>
        <button onClick={onRemove} className="rounded-md bg-destructive/15 p-1.5 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          value={item.to}
          onChange={(e) => onChange({ to: e.target.value })}
          placeholder="লিংক যেমন /transactions"
          className="flex-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
        />
        {showColor && (
          <select
            value={item.color ?? "text-primary"}
            onChange={(e) => onChange({ color: e.target.value })}
            className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs"
          >
            {TINT_COLORS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        )}
      </div>
      {pickerOpen && (
        <IconPicker
          current={item.icon}
          onClose={() => setPickerOpen(false)}
          onSelect={(icon) => {
            onChange({ icon });
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}

function IconPicker({
  current,
  onSelect,
  onClose,
}: {
  current: IconRef;
  onSelect: (icon: IconRef) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"lucide" | "image">(current.type);
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imgUrl, setImgUrl] = useState(current.type === "image" ? current.url : "");
  const fileRef = useRef<HTMLInputElement>(null);

  const allLucideNames = useMemo(() => {
    return Object.keys(Lucide).filter((k) => /^[A-Z]/.test(k) && k !== "Icon" && k !== "createLucideIcon" && k !== "default" && k !== "icons");
  }, []);

  const filtered = useMemo(() => {
    const base = q.trim() ? allLucideNames : POPULAR_ICONS;
    const ql = q.toLowerCase();
    return base.filter((n) => !ql || n.toLowerCase().includes(ql)).slice(0, 200);
  }, [q, allLucideNames]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `icon-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("app-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("app-assets").getPublicUrl(path);
      setImgUrl(data.publicUrl);
      toast.success("আপলোড হয়েছে");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={onClose}>
      <div className="mx-auto w-full max-w-md rounded-t-3xl bg-background p-4 pb-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold">আইকন বাছাই</h3>
          <button onClick={onClose} className="rounded-lg bg-muted px-3 py-1 text-xs font-bold">বন্ধ</button>
        </div>
        <div className="mb-3 flex gap-1.5">
          <button onClick={() => setTab("lucide")} className={`flex-1 rounded-lg py-1.5 text-xs font-bold ${tab === "lucide" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            লাইব্রেরি
          </button>
          <button onClick={() => setTab("image")} className={`flex-1 rounded-lg py-1.5 text-xs font-bold ${tab === "image" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            ছবি আপলোড
          </button>
        </div>

        {tab === "lucide" && (
          <>
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="আইকন খুঁজুন (যেমন wallet)" className="flex-1 bg-transparent text-sm outline-none" />
            </div>
            <div className="grid max-h-[55vh] grid-cols-6 gap-2 overflow-y-auto">
              {filtered.map((name) => {
                const C = (Lucide as any)[name];
                return (
                  <button
                    key={name}
                    onClick={() => onSelect({ type: "lucide", name })}
                    className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted hover:bg-primary/15"
                    title={name}
                  >
                    <C className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {tab === "image" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-muted">
                {imgUrl ? <img src={imgUrl} alt="" className="h-full w-full object-contain" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="rounded-lg bg-muted px-3 py-2 text-xs font-bold disabled:opacity-50"
              >
                {uploading ? "আপলোড..." : "ছবি বাছাই"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            </div>
            <input
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              placeholder="অথবা ছবির URL পেস্ট করুন"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={() => imgUrl && onSelect({ type: "image", url: imgUrl })}
              disabled={!imgUrl}
              className="w-full rounded-lg bg-primary py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              এই ছবিটি ব্যবহার করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
