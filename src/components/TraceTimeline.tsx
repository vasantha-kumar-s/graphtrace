import type { Span } from "@/lib/overlap";

interface TraceTimelineProps {
  framework?: string | undefined;
  spans: Span[];
}

export function TraceTimeline({ framework, spans }: TraceTimelineProps) {
  const total = Math.max(...spans.map((s) => s.end_ms ?? s.start_ms), 1);

  return (
    <div className="mt-6 border border-border bg-card p-5">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        timeline · {framework ?? "custom"}
      </p>
      <div className="mt-4 space-y-2">
        {spans.map((s) => {
          const start = s.start_ms;
          const end = s.end_ms ?? s.start_ms;
          const duration = Math.round(end - start);
          const leftPct = (start / total) * 100;
          const widthPct = Math.max(((end - start) / total) * 100, 1);

          return (
            <div key={s.id} className="flex items-center gap-3 font-mono text-xs">
              <span className="w-32 shrink-0 truncate">{s.name}</span>
              <div className="relative h-5 flex-1 bg-muted">
                <div
                  className={
                    s.kind === "retriever"
                      ? "absolute h-full bg-primary/70"
                      : s.kind === "llm"
                        ? "absolute h-full bg-accent/70"
                        : "absolute h-full bg-chart-3/70"
                  }
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                  }}
                />
              </div>
              <span className="w-16 text-right text-muted-foreground">{duration}ms</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
