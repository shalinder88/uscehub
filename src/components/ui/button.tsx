import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-sm",
        outline:
          "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white",
        ghost:
          "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        success:
          "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
