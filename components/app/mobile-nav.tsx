"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

type NavLink = {
  label: string;
  href: string;
  color: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RouteLink = Link as any;

type MobileNavProps = {
  navLinks: NavLink[];
  userRole: string;
};

export function MobileNav({ navLinks, userRole }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
      >
        <div className="flex flex-col gap-1">
          <span className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-200 ${open ? "translate-y-1.5 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-200 ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-200 ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
        </div>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-16 z-50 border-b border-[var(--border)]/60 bg-[var(--panel)]/95 shadow-lg backdrop-blur-xl">
          <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <RouteLink
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-medium text-[var(--muted)] transition-all duration-200 ${link.color}`}
              >
                {link.label}
              </RouteLink>
            ))}
          </nav>
          <div className="flex items-center justify-between border-t border-[var(--border)]/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 dark:ring-indigo-700/50">
                {userRole}
              </span>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
