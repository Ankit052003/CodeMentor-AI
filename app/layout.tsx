import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/app/site-footer";
import { ToastViewport } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "CodeMentor AI",
  description: "AI-powered code review learning platform for beginner programmers."
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <ToastViewport />
      </body>
    </html>
  );
}
