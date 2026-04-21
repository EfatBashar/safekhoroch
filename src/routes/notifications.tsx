import { createFileRoute } from "@tanstack/react-router";
import { Bell, Trash2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useTx } from "@/lib/i18nExtra";
import { notificationStore } from "@/lib/listStore";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "নোটিফিকেশন — হাত-খরচ" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { t, lang } = useT();
  const x = useTx();
  const items = notificationStore.use();
  return (
    <div className="pb-4">
      <PageHeader icon={Bell} title={x.notifTitle} />
      <div className="mt-4 px-4">
        {items.length === 0 ? (
          <EmptyState icon={Bell} title={x.notifEmpty} />
        ) : (
          <ul className="space-y-2">
            {items.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-3 rounded-xl p-3 shadow-sm ${n.read ? "bg-muted/40" : "bg-card"}`}
              >
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(n.date).toLocaleString(lang === "bn" ? "bn-BD" : undefined)}
                  </p>
                </div>
                <button onClick={() => notificationStore.remove(n.id)} aria-label={t.delete}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
