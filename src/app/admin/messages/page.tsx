export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CardRoot, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Inbox } from "lucide-react";

export default async function AdminMessagesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const messages = await prisma.adminMessage.findMany({
    where: { status: { in: ["OPEN", "READ"] } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">User Messages</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Private messages from signed-in users — feedback, grievances, data corrections.
        </p>
      </div>

      {messages.length === 0 ? (
        <CardRoot>
          <CardContent className="flex flex-col items-center py-12">
            <Inbox className="h-12 w-12 text-slate-400 dark:text-slate-600" />
            <p className="mt-4 text-sm font-medium text-slate-900 dark:text-slate-100">
              No open messages
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Inbox is clear.
            </p>
          </CardContent>
        </CardRoot>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <CardRoot key={m.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {m.subject}
                      </span>
                      <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300">
                        {m.category}
                      </span>
                      <span className={`rounded-md px-2 py-0.5 text-xs ${m.status === "OPEN" ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                        {m.status}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      From: {m.userName || "(no name)"} &lt;{m.userEmail || "(no email)"}&gt; · {formatDate(m.createdAt.toISOString())}
                    </div>
                    <pre className="mt-3 whitespace-pre-wrap rounded-md bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-800 dark:text-slate-200 font-sans">
{m.body}
                    </pre>
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
