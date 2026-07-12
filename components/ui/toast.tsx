export function ToastViewport() {
  return <div id="toast-viewport" className="fixed bottom-4 right-4 z-50 grid gap-2" />;
}

type ToastProps = {
  title: string;
  description?: string;
};

export function Toast({ title, description }: ToastProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-lg">
      <p className="text-sm font-semibold">{title}</p>
      {description ? <p className="mt-1 text-sm text-[var(--muted)]">{description}</p> : null}
    </div>
  );
}
