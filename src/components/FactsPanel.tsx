import type { MemoryFact } from "@/lib/trace-types";
import { BookOpen, Sparkles, CheckCircle2 } from "lucide-react";

interface FactsPanelProps {
  facts?: MemoryFact[] | undefined;
}

export function FactsPanel({ facts }: FactsPanelProps) {
  if (!facts || facts.length === 0) {
    return (
      <div className="border border-border bg-card p-6 rounded-md text-center text-muted-foreground font-mono text-xs">
        No structured facts found in this trace.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Grounded Knowledge Facts</h2>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {facts.length} facts supplied to agent
        </span>
      </div>

      <div className="grid gap-3">
        {facts.map((fact, index) => (
          <div
            key={index}
            className="flex items-start justify-between gap-4 border border-border bg-card p-4 rounded-md transition-colors hover:border-primary/50"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs shrink-0">
                {index + 1}
              </span>
              <div>
                <p className="font-mono text-xs text-foreground font-medium leading-relaxed">
                  {fact.text}
                </p>
                {fact.source && (
                  <span className="mt-1 inline-block font-mono text-[10px] text-muted-foreground">
                    Source: {fact.source}
                  </span>
                )}
              </div>
            </div>

            <span
              className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] rounded border ${
                fact.remembered
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {fact.remembered ? (
                <>
                  <Sparkles className="h-3 w-3" /> remembered
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3" /> structural
                </>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
