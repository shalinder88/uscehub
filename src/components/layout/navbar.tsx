"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  HeartPulse,
  Menu,
  X,
  User,
  LayoutDashboard,
  Shield,
  LogOut,
  ChevronDown,
  FileEdit,
  Wrench,
  Search,
  Calculator,
  GitCompareArrows,
} from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/browse", label: "Browse Opportunities" },
    { href: "/for-institutions", label: "For Institutions & Physicians" },
    { href: "/community", label: "Community" },
    { href: "/freida", label: "IMG Resources" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <HeartPulse className="h-6 w-6 text-slate-800 dark:text-slate-200" />
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            USCEHub
          </span>
        </Link>

        <div className="hidden items-center gap-5 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-slate-900 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}

          {/* Tools dropdown */}
          <div className="relative">
            <button
              onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
              className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-slate-900 dark:hover:text-white"
            >
              Tools
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {toolsMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setToolsMenuOpen(false)}
                />
                <div className="absolute left-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 shadow-lg">
                  <Link
                    href="/recommend"
                    onClick={() => setToolsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <Search className="h-4 w-4" />
                    Program Finder
                  </Link>
                  <Link
                    href="/tools/cost-calculator"
                    onClick={() => setToolsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <Calculator className="h-4 w-4" />
                    Cost Calculator
                  </Link>
                  <Link
                    href="/compare"
                    onClick={() => setToolsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <GitCompareArrows className="h-4 w-4" />
                    Compare Programs
                  </Link>
                </div>
              </>
            )}
          </div>

          <Link
            href="/about"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-slate-900 dark:hover:text-white"
          >
            About Us
          </Link>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="max-w-[120px] truncate">
                  {session.user.name}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-1 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 shadow-lg">
                    <div className="border-b border-slate-100 dark:border-slate-700 px-4 py-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {session.user.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    {(session.user.role === "POSTER" ||
                      session.user.role === "ADMIN") && (
                      <Link
                        href="/poster"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <FileEdit className="h-4 w-4" />
                        Poster Dashboard
                      </Link>
                    )}
                    {session.user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 lg:hidden">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-slate-100 dark:border-slate-700" />
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tools
            </p>
            <Link
              href="/recommend"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Search className="h-4 w-4" />
              Program Finder
            </Link>
            <Link
              href="/tools/cost-calculator"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Calculator className="h-4 w-4" />
              Cost Calculator
            </Link>
            <Link
              href="/compare"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <GitCompareArrows className="h-4 w-4" />
              Compare Programs
            </Link>
            <div className="my-2 border-t border-slate-100 dark:border-slate-700" />
            {session?.user ? (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {session.user.name}
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    signOut();
                  }}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="flex gap-3 px-3 py-2">
                <Link href="/auth/signin" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signup" className="flex-1">
                  <Button size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
