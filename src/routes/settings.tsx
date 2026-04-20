import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import {
  Award,
  Download,
  RefreshCw,
  Shield,
  KeyRound,
  LogOut,
  MessageCircle,
  Mail,
  Trash2,
  ChevronRight,
} from "lucide-react";

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
  const { t } = useT();
  const navigate = useNavigate();

  return (
    <div className="pb-4">
      {/* Profile hero */}
      <div className="bg-primary/10 px-5 pb-6 pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
            U
          </div>
          <p className="mt-3 text-lg font-bold">{t.appName}</p>
          <p className="text-xs text-muted-foreground">user@example.com</p>
          <button
            onClick={() => navigate({ to: "/pro" })}
            className="mt-3 flex items-center gap-1.5 rounded-full bg-card px-4 py-1.5 text-xs font-semibold shadow-sm"
          >
            🔒 {t.freePlan} • {t.upgradePro}
          </button>
        </div>
      </div>

      {/* Account section */}
      <Section title={t.account_label}>
        <Row
          icon={<Award className="h-5 w-5 text-amber-500" />}
          title={t.upgradePro}
          subtitle={t.proSub}
          onClick={() => navigate({ to: "/pro" })}
        />
        <Row
          icon={<Download className="h-5 w-5 text-income" />}
          title={t.dataExport}
          subtitle={t.dataExportSub}
        />
        <Row
          icon={<RefreshCw className="h-5 w-5 text-primary" />}
          title={t.cloudSync}
          subtitle={t.cloudSyncSub}
        />
        <Row icon={<Shield className="h-5 w-5 text-teal-600" />} title={t.privacyPolicy} />
        <Row
          icon={<KeyRound className="h-5 w-5 text-blue-600" />}
          title={t.changePassword}
        />
        <Row icon={<LogOut className="h-5 w-5 text-amber-600" />} title={t.signOut} />
      </Section>

      <Section title={t.helpContact}>
        <Row
          icon={<MessageCircle className="h-5 w-5 text-income" />}
          title={t.whatsappSupport}
          subtitle="01685253524"
        />
        <Row
          icon={<Mail className="h-5 w-5 text-blue-600" />}
          title={t.emailSupport}
          subtitle="support@hatkhoroch.com"
        />
      </Section>

      <Section title={t.dangerZone} danger>
        <Row
          icon={<Trash2 className="h-5 w-5 text-destructive" />}
          title={t.deleteAccount}
          subtitle={t.deleteAccountSub}
          danger
        />
      </Section>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {t.appName} • {t.appVersion}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
  danger,
}: {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="mt-4">
      <p
        className={`px-5 pb-2 text-xs font-semibold uppercase tracking-wider ${danger ? "text-destructive" : "text-muted-foreground"}`}
      >
        {title}
      </p>
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
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 px-5 py-3.5 text-left active:bg-muted"
    >
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-bold ${danger ? "text-destructive" : "text-foreground"}`}
        >
          {title}
        </p>
        {subtitle && (
          <p className={`text-xs ${danger ? "text-destructive/80" : "text-muted-foreground"}`}>
            {subtitle}
          </p>
        )}
      </div>
      <ChevronRight
        className={`h-4 w-4 ${danger ? "text-destructive" : "text-muted-foreground"}`}
      />
    </button>
  );
}
