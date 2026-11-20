interface TraceStatsProps {
  query: string;
  retrievedCount: number;
  usedCount: number;
  hasAnswer: boolean;
}

export function TraceStats({ query, retrievedCount, usedCount, hasAnswer }: TraceStatsProps) {
  return (
    <div className="mt-10 grid gap-4 md:grid-cols-4">
      <div className="border border-border bg-card p-5 md:col-span-2">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">query</p>
        <p className="mt-2 truncate text-2xl font-bold">{query}</p>
      </div>
      <div className="border border-border bg-card p-5">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          retrieved
        </p>
        <p className="mt-2 truncate text-2xl font-bold">{retrievedCount}</p>
      </div>
      <div className="border border-border bg-card p-5">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">used</p>
        <p className="mt-2 truncate text-2xl font-bold text-primary">
          {hasAnswer ? `${usedCount} / ${retrievedCount}` : "—"}
        </p>
      </div>
    </div>
  );
}
