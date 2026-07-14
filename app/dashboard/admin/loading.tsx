export default function AdminLoading() {
  return (
    <div className="space-y-8 p-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
      <div className="grid gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
      </div>
      <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}
