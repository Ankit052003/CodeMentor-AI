import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/app/site-footer";
import { ToastViewport } from "@/components/ui/toast";

// Validate environment variables at server startup
import { validateEnv } from "@/lib/env";
validateEnv();

export const metadata: Metadata = {
  title: { default: "CodeMentor AI", template: "%s | CodeMentor AI" },
  description: "AI-powered code review learning platform for beginner programmers. Submit code, get instant AI reviews, and track your improvement over time.",
  keywords: ["code review", "AI learning", "programming", "beginner coders", "coding platform"],
  authors: [{ name: "Ankit Kumar", url: "https://github.com/Ankit052003" }],
  openGraph: {
    title: "CodeMentor AI",
    description: "AI-powered code review learning platform for beginner programmers.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://codementor-ai.vercel.app",
    siteName: "CodeMentor AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeMentor AI",
    description: "AI-powered code review learning platform for beginner programmers.",
  },
  robots: { index: true, follow: true },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var t = localStorage.getItem('theme');
                if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches))
                  document.documentElement.classList.add('dark');
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body suppressHydrationWarning>
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
        <ToastViewport />
      </body>
    </html>
  );
}
