import { useEffect } from "react";
import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#16a34a" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Safe Khoroch" },
      { title: "Safe Khoroch — Personal Work & Expense Tracker" },
      { name: "description", content: "Track income, expenses, works, accounts, and loans in a clean mobile-first dashboard." },
      { property: "og:title", content: "Safe Khoroch — Personal Work & Expense Tracker" },
      { name: "twitter:title", content: "Safe Khoroch — Personal Work & Expense Tracker" },
      { property: "og:description", content: "Track income, expenses, works, accounts, and loans in a clean mobile-first dashboard." },
      { name: "twitter:description", content: "Track income, expenses, works, accounts, and loans in a clean mobile-first dashboard." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/AnKEUCdfwqgnzUUjgcKe1OoNwfG2/social-images/social-1777628287504-ChatGPT_Image_May_1,_2026,_03_34_31_PM.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/AnKEUCdfwqgnzUUjgcKe1OoNwfG2/social-images/social-1777628287504-ChatGPT_Image_May_1,_2026,_03_34_31_PM.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "icon", href: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Page not found.</p>
      </div>
    </div>
  );
}

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster position="top-center" />
        <PwaRegister />
        <Scripts />
      </body>
    </html>
  );
}

function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Service worker registration failed:", err);
    });
  }, []);
  return null;
}

import { AppShell } from "@/components/AppShell";

function RootComponent() {
  return <AppShell />;
}
