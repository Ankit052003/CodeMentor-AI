type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-[var(--border)] bg-white px-6 py-12 text-center">
      <div className="max-w-md">
        <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
        {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}
