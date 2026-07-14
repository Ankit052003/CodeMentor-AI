export function SiteFooter() {
  return (
    <footer className="border-t border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-6 text-sm shadow-inner shadow-indigo-900/20">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/30 ring-1 ring-indigo-400/30">C</span>
          <div>
            <p className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-sm font-semibold text-transparent">CodeMentor AI</p>
            <p className="text-[11px] text-indigo-300/50">AI-powered code review platform</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          <a
            href="https://github.com/Ankit052003"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-300 transition-all duration-200 hover:border-indigo-500/40 hover:bg-indigo-500/20 hover:text-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10"
          >
            <svg className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            <span>GitHub</span>
          </a>
          <a
            href="https://www.linkedin.com/in/ankit-kumar-501356301/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-300 transition-all duration-200 hover:border-indigo-500/40 hover:bg-indigo-500/20 hover:text-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10"
          >
            <svg className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            <span>LinkedIn</span>
          </a>
        </div>

        <p className="text-[11px] text-indigo-300/40">
          Built by{" "}
          <a href="https://github.com/Ankit052003" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300">
            Ankit Kumar
          </a>
        </p>
      </div>
    </footer>
  );
}
