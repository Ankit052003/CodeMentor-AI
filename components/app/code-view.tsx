import { cn } from "@/lib/utils";

type CodeViewProps = {
  code: string;
  language: string;
  className?: string;
};

const jsKeywords =
  /\b(?:const|let|var|function|return|if|else|for|while|switch|case|break|continue|class|extends|import|from|export|async|await|try|catch|throw|new|this|super|typeof|instanceof|in|of|null|undefined|true|false|interface|type|implements|enum|readonly|public|private|protected|as|satisfies)\b/g;
const pythonKeywords =
  /\b(?:def|class|return|if|elif|else|for|while|try|except|finally|import|from|as|pass|break|continue|True|False|None|and|or|not|in|is|lambda|with|yield|await|async|raise|assert|global|nonlocal|del)\b/g;
const stringPattern = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g;
const numberPattern = /\b\d+(?:\.\d+)?\b/g;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getKeywordPattern(language: string) {
  return language === "PYTHON" ? pythonKeywords : jsKeywords;
}

function renderTokens(text: string, language: string) {
  const combinedPattern = new RegExp(
    `(${stringPattern.source})|(${getKeywordPattern(language).source})|(${numberPattern.source})`,
    "g"
  );

  let lastIndex = 0;
  let html = "";

  for (const match of text.matchAll(combinedPattern)) {
    const index = match.index ?? 0;
    html += escapeHtml(text.slice(lastIndex, index));

    const token = match[0];
    if (match[1]) {
      html += `<span class="text-amber-300">${escapeHtml(token)}</span>`;
    } else if (match[2]) {
      html += `<span class="text-sky-300 font-medium">${escapeHtml(token)}</span>`;
    } else if (match[3]) {
      html += `<span class="text-violet-300">${escapeHtml(token)}</span>`;
    }

    lastIndex = index + token.length;
  }

  html += escapeHtml(text.slice(lastIndex));
  return html;
}

function highlightLine(line: string, language: string) {
  const commentPattern = language === "PYTHON" ? /^(.*?)(#.*)$/ : /^(.*?)(\/\/.*)$/;
  const commentMatch = line.match(commentPattern);

  if (!commentMatch) {
    return renderTokens(line, language);
  }

  const codePart = commentMatch[1] ?? "";
  const commentPart = commentMatch[2] ?? "";

  return `${renderTokens(codePart, language)}<span class="text-emerald-300">${escapeHtml(commentPart)}</span>`;
}

export function CodeView({ code, language, className }: CodeViewProps) {
  const lines = code.split(/\r?\n/);

  return (
    <pre className={cn("overflow-x-auto rounded-2xl border border-[var(--border)] bg-slate-950 p-4 text-sm text-slate-50", className)}>
      <code className="block">
        {lines.map((line, index) => (
          <div key={`${index}-${line}`} className="grid grid-cols-[3rem_1fr] gap-4">
            <span className="select-none text-right text-slate-500">{index + 1}</span>
            <span dangerouslySetInnerHTML={{ __html: line.length ? highlightLine(line, language) : "&nbsp;" }} />
          </div>
        ))}
      </code>
    </pre>
  );
}