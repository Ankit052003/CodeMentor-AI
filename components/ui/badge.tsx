import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "blue" | "green" | "amber" | "red";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneClassName: Record<BadgeTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
  blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  amber: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  red: "border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-300"
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClassName[tone],
        className
      )}
      {...props}
    />
  );
}
