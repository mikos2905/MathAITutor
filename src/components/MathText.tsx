"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Renders text containing inline LaTeX delimited by $...$.
 *
 * Using KaTeX directly rather than a React wrapper avoids peer-dependency
 * friction with React 19, and the input is our own question data, so the
 * HTML injection is ours rather than a user's.
 */
export function MathText({ text, className }: { text: string; className?: string }) {
  const segments = text.split(/(\$[^$]*\$)/g).filter(Boolean);

  return (
    <span className={className}>
      {segments.map((segment, i) => {
        if (!segment.startsWith("$") || !segment.endsWith("$") || segment.length < 3) {
          return <span key={i}>{segment}</span>;
        }
        try {
          const html = katex.renderToString(segment.slice(1, -1), {
            throwOnError: false,
            displayMode: false,
          });
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch {
          return <span key={i}>{segment}</span>;
        }
      })}
    </span>
  );
}
