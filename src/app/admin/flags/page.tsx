import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CardRoot, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Flag } from "lucide-react";

export default async function AdminFlagsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const flags = await prisma.flagReport.findMany({
    where: { status: "OPEN" },
    include: {
      reporter: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Flag Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review reported content and take action
        </p>
      </div>

      {flags.length === 0 ? (
        <CardRoot>
          <CardContent className="flex flex-col items-center py-12">
            <Flag className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-900">
              No open flag reports
            </p>
            <p className="mt-1 text-sm text-slate-500">
              All reports have been addressed
            </p>
          </CardContent>
        </CardRoot>
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => (
            <CardRoot key={flag.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="warning">{flag.type}</Badge>
                      <Badge variant="pending">Open</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{flag.reason}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span>
                        Reported by: {flag.reporter.name} ({flag.reporter.email})
                      </span>
                      <span>Target: {flag.targetId}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(flag.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </CardRoot>
          ))}
        </div>
      )}
    </div>
  );
}
