import type { Retrieval, RetrievedItem, Span } from "@/lib/overlap";

export interface ScoredRetrieval extends Retrieval {
  span?: Span | undefined;
  items: (RetrievedItem & { ov: number | null; used: boolean | null })[];
}

interface RetrievalListProps {
  retrievals: ScoredRetrieval[];
  openItemId: string | null;
  onToggleItem: (id: string) => void;
}

export function RetrievalList({ retrievals, openItemId, onToggleItem }: RetrievalListProps) {
  return (
    <div className="space-y-6">
      {retrievals.map((r) => (
        <div key={r.span_id} className="border border-border bg-card">
          <div className="flex justify-between border-b border-border px-5 py-3 font-mono text-xs text-muted-foreground">
            <span>
              {r.span?.name ?? r.span_id} · “{r.query}”
            </span>
            <span>{r.arm ?? "unknown"}</span>
          </div>
          {r.items.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => onToggleItem(i.id)}
              className="block w-full border-b border-border px-5 py-4 text-left transition-colors last:border-0 hover:bg-secondary"
            >
              <div className="flex items-center justify-between gap-4">
                <span
                  className={
                    i.used === false
                      ? "text-muted-foreground line-through decoration-destructive/60"
                      : ""
                  }
                >
                  {i.label}
                </span>
                <span className="flex shrink-0 gap-3 font-mono text-xs">
                  <span className="text-muted-foreground">
                    score {i.score !== undefined && i.score !== null ? i.score.toFixed(3) : "—"}
                  </span>
                  {i.used === null ? null : i.used ? (
                    <span className="bg-primary px-2 py-0.5 text-primary-foreground">
                      used {i.ov !== null ? i.ov.toFixed(2) : ""}
                    </span>
                  ) : (
                    <span className="border border-destructive/60 px-2 py-0.5 text-destructive">
                      no trace {i.ov !== null ? i.ov.toFixed(2) : "0"}
                    </span>
                  )}
                </span>
              </div>
              {openItemId === i.id && i.content && (
                <p className="mt-3 font-mono text-xs text-muted-foreground">{i.content}</p>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
