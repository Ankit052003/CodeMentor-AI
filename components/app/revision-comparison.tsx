import { Badge } from "@/components/ui/badge";
import { CodeView } from "@/components/app/code-view";

type RevisionComparisonProps = {
  originalSource: string;
  latestSource: string;
  revisionSummary: string;
  revisionCreatedAt: string;
};

function lineCount(value: string) {
  return value.split(/\r?\n/).length;
}

export function RevisionComparison({ originalSource, latestSource, revisionSummary, revisionCreatedAt }: RevisionComparisonProps) {
  const originalLines = lineCount(originalSource);
  const latestLines = lineCount(latestSource);
  const lineDelta = latestLines - originalLines;
  const characterDelta = latestSource.length - originalSource.length;

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Revision comparison</h2>
        <Badge tone={lineDelta < 0 ? "green" : lineDelta > 0 ? "amber" : "neutral"}>{lineDelta > 0 ? `+${lineDelta}` : `${lineDelta}`} lines</Badge>
        <Badge tone={characterDelta < 0 ? "green" : characterDelta > 0 ? "amber" : "neutral"}>{characterDelta > 0 ? `+${characterDelta}` : `${characterDelta}`} chars</Badge>
      </div>
      <p className="text-sm text-[var(--muted)]">Latest revision: {revisionSummary} · {revisionCreatedAt}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--foreground)]">Original</p>
          <CodeView code={originalSource} language="JAVASCRIPT" className="max-h-80" />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--foreground)]">Latest revision</p>
          <CodeView code={latestSource} language="JAVASCRIPT" className="max-h-80" />
        </div>
      </div>
    </section>
  );
}