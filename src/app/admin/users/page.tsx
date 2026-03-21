import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Users</h1>
        <p className="mt-1 text-sm text-slate-500">
          {users.length} registered user{users.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                Name
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                Email
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                Role
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {user.name}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      user.role === "ADMIN"
                        ? "info"
                        : user.role === "POSTER"
                        ? "observership"
                        : "default"
                    }
                  >
                    {user.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={user.emailVerified ? "approved" : "pending"}>
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  {formatDate(user.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
