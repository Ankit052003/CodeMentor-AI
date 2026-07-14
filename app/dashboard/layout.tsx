import React from "react";
import { getCurrentUser } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { MobileNav } from "@/components/app/mobile-nav";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const allNavLinks = [
  { label: "Submissions", href: "/dashboard/submissions", roles: ["STUDENT", "MENTOR", "ADMIN"], color: "hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300" },
  { label: "Improvement", href: "/dashboard/improvement", roles: ["STUDENT", "MENTOR", "ADMIN"], color: "hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300" },
  { label: "Mentor", href: "/dashboard/mentor", roles: ["MENTOR", "ADMIN"], color: "hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 dark:hover:text-amber-300" },
  { label: "Admin", href: "/dashboard/admin", roles: ["ADMIN"], color: "hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 dark:hover:text-rose-300" },
];

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const navLinks = allNavLinks.filter((link) => link.roles.includes(user.role as "STUDENT" | "MENTOR" | "ADMIN"));

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] transition-colors duration-300">
      <header className="sticky top-0 z-40 border-b border-[var(--border)]/60 bg-[var(--panel)]/90 shadow-sm backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <a
            href="/dashboard"
            className="group flex shrink-0 items-center gap-2.5 text-lg font-bold text-[var(--foreground)]"
            aria-label="CodeMentor AI Dashboard Home"
          >
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 text-sm font-black text-white shadow-lg shadow-indigo-300/50 ring-2 ring-indigo-400/40 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-indigo-400/60 dark:shadow-indigo-600/30 dark:ring-indigo-500/50" aria-hidden="true">
              <span className="relative z-10 text-[15px] tracking-tight">C</span>
              <span className="absolute inset-0 animate-pulse rounded-xl bg-white/10" style={{ animationDuration: "3s" }} />
            </span>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              CodeMentor AI
            </span>
          </a>

          <nav className="hidden flex-1 items-center justify-center gap-6 md:flex" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-[var(--muted)] transition-all duration-200 ${link.color}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 dark:ring-indigo-700/50">
              {user.role}
            </span>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              >
                Sign out
              </button>
            </form>
          </div>
          <MobileNav navLinks={navLinks.map((l) => ({ label: l.label, href: l.href, color: l.color }))} userRole={user.role} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6" role="main">
        {children}
      </main>
    </div>
  );
}
