export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-white px-6 py-4 text-sm text-[var(--muted)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>CodeMentor AI</p>
        <p>
          Name: &lt;your-name&gt; · GitHub: &lt;your-github-profile&gt; · LinkedIn:
          &lt;your-linkedin-profile&gt;
        </p>
      </div>
    </footer>
  );
}
