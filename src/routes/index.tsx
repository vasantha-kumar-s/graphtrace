import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { answerOverlap, isUsed, type AgentTrace } from "@/lib/overlap";
import { demoTrace } from "@/lib/demo-trace";
import { TraceHeader } from "@/components/TraceHeader";
import { TraceStats } from "@/components/TraceStats";
import { TraceTimeline } from "@/components/TraceTimeline";
import { RetrievalList, type ScoredRetrieval } from "@/components/RetrievalList";
import { AnswerPanel } from "@/components/AnswerPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GraphTrace — Trace & Score Agent Retrieval Evidence" },
      {
        name: "description",
        content:
          "Trace agent execution runs and evaluate every retrieved document or snippet against the generated answer with lexical overlap scoring. Runs 100% locally in your browser.",
      },
      { property: "og:title", content: "GraphTrace — Trace & Score Agent Retrieval Evidence" },
      {
        property: "og:description",
        content:
          "Retrieved vs used evidence, scored against the final answer. Fully client-side trace analysis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [trace, setTrace] = useState<AgentTrace>(demoTrace);
  const [error, setError] = useState<string | null>(null);
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const scored: ScoredRetrieval[] = useMemo(
    () =>
      trace.retrievals.map((r) => ({
        ...r,
        span: trace.spans.find((s) => s.id === r.span_id),
        items: r.items.map((i) => {
          const ov = i.answer_overlap ?? answerOverlap(trace.answer, i.content);
          return { ...i, ov, used: trace.answer ? isUsed(ov) : null };
        }),
      })),
    [trace],
  );

  const allItems = scored.flatMap((r) => r.items);
  const usedCount = allItems.filter((i) => i.used).length;

  async function handleLoadFile(file: File) {
    try {
      const text = await file.text();
      const t = JSON.parse(text) as AgentTrace;
      if (!t.query || !Array.isArray(t.retrievals)) {
        throw new Error("Invalid trace file: must contain 'query' and 'retrievals' array.");
      }
      setTrace({ ...t, spans: t.spans ?? [] });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read file");
    }
  }

  const handleToggleItem = (id: string) => {
    setOpenItemId((prev) => (prev === id ? null : id));
  };

  return (
    <main className="min-h-screen grid-bg">
      <TraceHeader onLoadDemo={() => setTrace(demoTrace)} onFileSelect={handleLoadFile} />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
          See what your agent retrieved,{" "}
          <span className="text-primary">and what it actually used.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Every retrieved item is scored against the final answer by lexical overlap. No model
          re-reads your evidence, and all analysis runs completely in your browser.
        </p>
        {error && <p className="mt-4 font-mono text-sm text-destructive">{error}</p>}

        <TraceStats
          query={trace.query}
          retrievedCount={allItems.length}
          usedCount={usedCount}
          hasAnswer={Boolean(trace.answer)}
        />

        <TraceTimeline framework={trace.framework} spans={trace.spans} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <RetrievalList
            retrievals={scored}
            openItemId={openItemId}
            onToggleItem={handleToggleItem}
          />
          <AnswerPanel answer={trace.answer} />
        </div>
      </section>
    </main>
  );
}
