import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function Textarea({ className, label, error, id, ...props }: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <label className="grid gap-1.5 text-sm font-medium text-[var(--foreground)]">
      <span>{label}</span>
      <textarea
        id={textareaId}
        className={cn(
          "min-h-28 rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/50",
          error && "border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/50",
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...props}
      />
      {error ? (
        <span id={`${textareaId}-error`} className="text-xs font-normal text-[var(--danger)]">
          {error}
        </span>
      ) : null}
    </label>
  );
}
