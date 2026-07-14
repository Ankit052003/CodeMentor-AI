import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-blue-700 focus-visible:outline-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500",
  secondary:
    "border border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] hover:bg-slate-50 focus-visible:outline-blue-700 dark:hover:bg-slate-800 dark:hover:border-slate-600",
  danger:
    "bg-[var(--danger)] text-white hover:bg-red-800 focus-visible:outline-red-800 dark:bg-red-700 dark:hover:bg-red-600",
  ghost: "text-[var(--muted)] hover:bg-slate-100 focus-visible:outline-blue-700 dark:hover:bg-slate-800"
};

const sizeClassName: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm"
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variantClassName[variant],
        sizeClassName[size],
        className
      )}
      type={type}
      {...props}
    />
  );
}
