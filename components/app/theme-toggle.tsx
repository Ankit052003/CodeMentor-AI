"use client";

import React, { useState, useEffect } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      className="relative flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border border-indigo-200/30 bg-indigo-100/50 p-1 transition-colors duration-300 hover:border-indigo-300/50 dark:border-indigo-600/30 dark:bg-indigo-900/30 dark:hover:border-indigo-500/50"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-indigo-200/50 transition-all duration-300 dark:bg-indigo-800 dark:ring-indigo-400/30 ${
          dark ? "translate-x-6" : "translate-x-0"
        }`}
      >
        <span className="text-xs leading-none transition-opacity duration-300">
          {dark ? "🌙" : "☀️"}
        </span>
      </span>
    </button>
  );
}
