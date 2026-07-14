type ErrorStateProps = {
  title: string;
  description: string;
};

export function ErrorState({ title, description }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 dark:border-red-800 dark:bg-red-900/30">
      <h2 className="text-sm font-semibold text-[var(--danger)]">{title}</h2>
      <p className="mt-1 text-sm text-red-700 dark:text-red-400">{description}</p>
    </div>
  );
}
