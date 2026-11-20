import { USED_THRESHOLD } from "@/lib/overlap";

interface AnswerPanelProps {
  answer?: string | null | undefined;
}

export function AnswerPanel({ answer }: AnswerPanelProps) {
  return (
    <aside className="h-fit border border-primary/40 bg-card p-5">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">final answer</p>
      <p className="mt-3 leading-relaxed">
        {answer ?? "No answer in this trace — usage cannot be scored."}
      </p>
      <p className="mt-6 font-mono text-xs text-muted-foreground">
        An item counts as used at &ge; {USED_THRESHOLD} lexical overlap.
      </p>
    </aside>
  );
}
