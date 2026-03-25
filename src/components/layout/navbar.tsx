"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useJourney } from "@/components/providers/journey-provider";
import { PHASE_CONFIGS } from "@/lib/journey";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const { phase } = useJourney();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const currentPhase = PHASE_CONFIGS[phase];
  const navItems = currentPhase.nav;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <HeartPulse className="h-6 w-6 text-accent" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            USCEHub
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.label} className="relative">
                <button
                  onClick={() => setDropdownOpen(dropdownOpen === item.label ? null : item.label)}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground hover:bg-surface-alt"
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {dropdownOpen === item.label && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(null)} />
                    <div className="absolute left-0 z-50 mt-1 w-64 rounded-xl border border-border bg-surface p-1.5 shadow-xl">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setDropdownOpen(null)}
                          className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-alt"
                        >
                          <div className="text-sm font-medium text-foreground">{child.label}</div>
                          {child.description && (
                            <div className="text-xs text-muted">{child.description}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground hover:bg-surface-alt"
              >
                {item.label}
              </Link>
            )
          )}
        </div>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 lg:flex">
          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground hover:bg-surface-alt"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="max-w-[120px] truncate text-foreground">
                  {session.user.name}
                </span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-1 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-xl">
                    <div className="border-b border-border px-3 py-3 mb-1">
                      <p className="text-sm font-medium text-foreground">{session.user.name}</p>
                      <p className="text-xs text-muted">{session.user.email}</p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-surface-alt"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-surface-alt"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    {(session.user.role === "POSTER" || session.user.role === "ADMIN") && (
                      <Link
                        href="/poster"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-surface-alt"
                      >
                        <FileEdit className="h-4 w-4" />
                        Poster Dashboard
                      </Link>
                    )}
                    {session.user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-surface-alt"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={() => { setUserMenuOpen(false); signOut(); }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-surface-alt"
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
                <Button variant="ghost" size="sm" className="text-muted hover:text-foreground">
                  Log In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-accent text-white hover:brightness-110">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            className="inline-flex items-center justify-center rounded-lg p-2 text-muted hover:text-foreground hover:bg-surface-alt"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-surface lg:hidden">
          <div className="space-y-1 px-4 py-3">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    {item.label}
                  </p>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:text-foreground hover:bg-surface-alt"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:text-foreground hover:bg-surface-alt"
                >
                  {item.label}
                </Link>
              )
            )}

            <div className="my-2 border-t border-border" />

            {session?.user ? (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{session.user.name}</p>
                  <p className="text-xs text-muted">{session.user.email}</p>
                </div>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-muted hover:text-foreground hover:bg-surface-alt">
                  Dashboard
                </Link>
                <button onClick={() => { setMobileOpen(false); signOut(); }} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-muted hover:text-foreground hover:bg-surface-alt">
                  Log Out
                </button>
              </>
            ) : (
              <div className="flex gap-3 px-3 py-2">
                <Link href="/auth/signin" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full border-border text-muted">Log In</Button>
                </Link>
                <Link href="/auth/signup" className="flex-1">
                  <Button size="sm" className="w-full bg-accent text-white">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
