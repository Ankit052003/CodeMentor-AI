import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ className, label, error, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="grid gap-1.5 text-sm font-medium text-[var(--foreground)]">
      <span>{label}</span>
      <input
        id={inputId}
        className={cn(
          "h-10 rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/50",
          error && "border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/50",
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error ? (
        <span id={`${inputId}-error`} className="text-xs font-normal text-[var(--danger)]">
          {error}
        </span>
      ) : null}
    </label>
  );
}
