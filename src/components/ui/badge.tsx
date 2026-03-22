import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200",
        observership: "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
        externship: "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
        research: "bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
        postdoc: "bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
        elective: "bg-cyan-50 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300",
        volunteer: "bg-pink-50 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300",
        pending: "bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
        approved: "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
        rejected: "bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300",
        hidden: "bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300",
        paused: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
        success: "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
        warning: "bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
        info: "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
