import React from "react";
import { ScoredNeighborhood, SourceCitation } from "@/types/relocation";
import { ExternalLink, Database, Link as LinkIcon } from "lucide-react";

interface SourceCitationsProps {
  neighborhoods: ScoredNeighborhood[];
}

export function SourceCitations({ neighborhoods }: SourceCitationsProps) {
  // Aggregate unique sources
  const allSources: SourceCitation[] = [];
  const seenQueries = new Set<string>();

  neighborhoods.forEach((item) => {
    item.data.sources.forEach((src) => {
      if (!seenQueries.has(src.query)) {
        seenQueries.add(src.query);
        allSources.push(src);
      }
    });
  });

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <Database className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">SerpApi Ground Truth & Sources</h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          {allSources.length} External Citations
        </span>
      </div>

      <p className="text-xs text-slate-500">
        Every metric in MoveWise is tied directly to verified Google Local, Google Search, and Google Hotels requests:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allSources.map((source, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 hover:bg-white hover:border-teal-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-mono uppercase font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-100">
                  {source.engine}
                </span>
                {source.isCachedDemo && (
                  <span className="text-[9px] text-amber-700 font-semibold">Demo Snapshot</span>
                )}
              </div>
              <p className="font-bold text-slate-900 text-xs line-clamp-1">{source.title}</p>
              <p className="text-[11px] font-mono text-slate-500 mt-1 truncate">
                &ldquo;{source.query}&rdquo;
              </p>
            </div>

            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[11px] text-teal-700 hover:underline font-semibold"
              >
                <span>Verify Source URL</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
