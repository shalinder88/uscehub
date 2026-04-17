export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
import { Avatar } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  ShieldCheck,
  List,
  Users,
  Star,
  Flag,
  ScrollText,
  Inbox,
} from "lucide-react";

const sidebarLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/posters", label: "Pending Posters", icon: ShieldCheck },
  { href: "/admin/listings", label: "Pending Listings", icon: List },
  { href: "/admin/messages", label: "User Messages", icon: Inbox },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/flags", label: "Flags", icon: Flag },
  { href: "/admin/activity", label: "Activity Log", icon: ScrollText },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 lg:block">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 p-6">
            <Avatar name={session.user.name || "Admin"} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                {session.user.name}
              </p>
              <p className="truncate text-xs text-slate-600 dark:text-slate-400">Administrator</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
