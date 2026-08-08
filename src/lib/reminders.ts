import { billStore, notificationStore } from "./listStore";

const PREF_KEY = "etracker.billReminders.v1";

export function remindersEnabled() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PREF_KEY) === "1";
}

export function setRemindersEnabled(v: boolean) {
  try {
    localStorage.setItem(PREF_KEY, v ? "1" : "0");
  } catch {
    /* ignore */
  }
}

/** Ask for browser notification permission; returns true when granted. */
export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}

function push(title: string, body: string) {
  if (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    try {
      new Notification(title, { body });
    } catch {
      /* ignore */
    }
  }
}

/**
 * Creates an in-app notification for every unpaid bill that is due within the
 * next 3 days (or already overdue). Runs at most once per bill per month.
 */
export function scanBillReminders(labels: { title: string; dueIn: (d: number) => string }) {
  if (typeof window === "undefined") return;
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const existing = new Set(notificationStore.get().map((n) => n.id));

  for (const bill of billStore.get()) {
    if (bill.paid) continue;
    const due = new Date(now.getFullYear(), now.getMonth(), bill.dueDay);
    const days = Math.ceil((due.getTime() - now.getTime()) / 86_400_000);
    if (days > 3) continue;
    const id = `bill-${bill.id}-${monthKey}`;
    if (existing.has(id)) continue;
    const body = `${bill.name} — ৳${bill.amount} · ${labels.dueIn(days)}`;
    notificationStore.add({
      id,
      title: labels.title,
      body,
      date: new Date().toISOString(),
      read: false,
    });
    if (remindersEnabled()) push(labels.title, body);
  }
}
