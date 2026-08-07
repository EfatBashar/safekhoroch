import { Lock } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function PremiumLockScreen({ label }: { label?: string }) {
  const nav = useNavigate();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/15 text-amber-600">
        <Lock className="h-9 w-9" />
      </div>
      <h2 className="mt-4 text-lg font-bold">এটি একটি প্রিমিয়াম ফিচার</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {label ? `"${label}" ` : ""}ব্যবহার করতে প্রিমিয়াম অ্যাক্সেস প্রয়োজন। অ্যাডমিনের সাথে যোগাযোগ করুন।
      </p>
      <button
        onClick={() => nav({ to: "/" })}
        className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground active:scale-95"
      >
        হোমে ফিরে যান
      </button>
    </div>
  );
}
