import { cn } from "@/lib/utils";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
};

export function Select({
  className,
  label,
  options,
  error,
  placeholder,
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <label className="grid gap-1.5 text-sm font-medium text-[var(--foreground)]">
      <span>{label}</span>
      <select
        id={selectId}
        className={cn(
          "h-10 rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/50",
          error && "border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/50",
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span id={`${selectId}-error`} className="text-xs font-normal text-[var(--danger)]">
          {error}
        </span>
      ) : null}
    </label>
  );
}
