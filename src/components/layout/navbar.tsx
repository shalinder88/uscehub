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
  BookOpen,
} from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse Opportunities" },
    { href: "/for-institutions", label: "For Institutions & Physicians" },
    { href: "/community", label: "Community" },
    { href: "/img-resources", label: "IMG Resources" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#dfd5b8] bg-[#faf6e8]/85 backdrop-blur-lg dark:border-[#34373f] dark:bg-[#1d1f26]/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <HeartPulse className="h-6 w-6 text-[#1a5454] dark:text-[#1a5454]" />
          <span className="font-serif text-lg font-semibold tracking-tight text-[#0d1418] dark:text-[#f7f5ec]" style={{ fontFamily: "Charter, 'Iowan Old Style', 'Source Serif Pro', ui-serif, Georgia, serif" }}>
            USCEHub
          </span>
        </Link>

        <div className="hidden items-center gap-5 lg:flex">
          <span aria-hidden="true" className="mr-1 h-5 w-px bg-[#dfd5b8] dark:bg-[#34373f]" />
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#4a5057] transition-colors hover:text-[#0d1418] dark:text-[#bfc1c9] dark:hover:text-[#f7f5ec]"
            >
              {link.label}
            </Link>
          ))}

          {/* Tools dropdown */}
          <div className="relative">
            <button
              onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
              className="flex items-center gap-1 text-sm font-medium text-[#4a5057] transition-colors hover:text-[#0d1418] dark:text-[#bfc1c9] dark:hover:text-[#f7f5ec]"
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
                <div className="absolute left-0 z-50 mt-2 w-56 rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] py-1 shadow-lg dark:border-[#34373f] dark:bg-[#23262e]">
                  <Link
                    href="/recommend"
                    onClick={() => setToolsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0d1418] hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
                  >
                    <Search className="h-4 w-4" />
                    Program Finder
                  </Link>
                  <Link
                    href="/tools/cost-calculator"
                    onClick={() => setToolsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0d1418] hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
                  >
                    <Calculator className="h-4 w-4" />
                    Cost Calculator
                  </Link>
                  <Link
                    href="/compare"
                    onClick={() => setToolsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0d1418] hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
                  >
                    <GitCompareArrows className="h-4 w-4" />
                    Compare Programs
                  </Link>
                  <div className="my-1 border-t border-[#dfd5b8] dark:border-[#34373f]" />
                  <Link
                    href="/resources"
                    onClick={() => setToolsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0d1418] hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
                  >
                    <BookOpen className="h-4 w-4" />
                    Resources &amp; Guides
                  </Link>
                </div>
              </>
            )}
          </div>

          <Link
            href="/about"
            className="text-sm font-medium text-[#4a5057] transition-colors hover:text-[#0d1418] dark:text-[#bfc1c9] dark:hover:text-[#f7f5ec]"
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
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#0d1418] transition-colors hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dfd5b8] bg-[#f0e9d3] text-xs font-medium text-[#4a5057] dark:border-[#34373f] dark:bg-[#2a2d36] dark:text-[#bfc1c9]">
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
                  <div className="absolute right-0 z-50 mt-1 w-56 rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] py-1 shadow-lg dark:border-[#34373f] dark:bg-[#23262e]">
                    <div className="border-b border-[#dfd5b8] px-4 py-3 dark:border-[#34373f]">
                      <p className="text-sm font-medium text-[#0d1418] dark:text-[#f7f5ec]">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-[#4a5057] dark:text-[#bfc1c9]">
                        {session.user.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0d1418] hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0d1418] hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    {(session.user.role === "POSTER" ||
                      session.user.role === "ADMIN") && (
                      <Link
                        href="/poster"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0d1418] hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
                      >
                        <FileEdit className="h-4 w-4" />
                        Poster Dashboard
                      </Link>
                    )}
                    {session.user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0d1418] hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-[#dfd5b8] dark:border-[#34373f]">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#0d1418] hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
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
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#4a5057] hover:bg-[#f0e9d3] dark:text-[#bfc1c9] dark:hover:bg-[#2a2d36]"
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
        <div className="border-t border-[#dfd5b8] bg-[#faf6e8] dark:border-[#34373f] dark:bg-[#1d1f26] lg:hidden">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#0d1418] hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-[#dfd5b8] dark:border-[#34373f]" />
            <p className="px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1a5454] dark:text-[#0fa595]">
              Tools
            </p>
            <Link
              href="/recommend"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#0d1418] hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
            >
              <Search className="h-4 w-4" />
              Program Finder
            </Link>
            <Link
              href="/tools/cost-calculator"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#0d1418] hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
            >
              <Calculator className="h-4 w-4" />
              Cost Calculator
            </Link>
            <Link
              href="/compare"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#0d1418] hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
            >
              <GitCompareArrows className="h-4 w-4" />
              Compare Programs
            </Link>
            <Link
              href="/resources"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#0d1418] hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
            >
              <BookOpen className="h-4 w-4" />
              Resources &amp; Guides
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#0d1418] hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
            >
              About Us
            </Link>
            <div className="my-2 border-t border-[#dfd5b8] dark:border-[#34373f]" />
            {session?.user ? (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-[#0d1418] dark:text-[#f7f5ec]">
                    {session.user.name}
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-[#0d1418] hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    signOut();
                  }}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-[#0d1418] hover:bg-[#f0e9d3] dark:text-[#f7f5ec] dark:hover:bg-[#2a2d36]"
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
