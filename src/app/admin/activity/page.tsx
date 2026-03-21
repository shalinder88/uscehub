import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CardRoot, CardContent } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

export default async function AdminActivityPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const logs = await prisma.adminActionLog.findMany({
    include: {
      admin: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  function getActionVariant(action: string) {
    if (action.startsWith("approve")) return "approved" as const;
    if (action.startsWith("reject")) return "rejected" as const;
    if (action.startsWith("hide")) return "warning" as const;
    return "default" as const;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Activity Log</h1>
        <p className="mt-1 text-sm text-slate-500">
          Recent admin actions and moderation activity
        </p>
      </div>

      {logs.length === 0 ? (
        <CardRoot>
          <CardContent className="flex flex-col items-center py-12">
            <ScrollText className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-900">
              No activity yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Admin actions will appear here
            </p>
          </CardContent>
        </CardRoot>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Action
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Target Type
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Target ID
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Admin
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Notes
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <Badge variant={getActionVariant(log.action)}>
                      {log.action.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {log.targetType}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-500">
                    {log.targetId.substring(0, 12)}...
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {log.admin.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {log.notes || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {formatDate(log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
