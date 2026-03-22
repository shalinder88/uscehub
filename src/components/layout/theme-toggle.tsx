"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
