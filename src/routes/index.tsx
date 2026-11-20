import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { answerOverlap, isUsed, type AgentTrace } from "@/lib/overlap";
import { demoTrace } from "@/lib/demo-trace";
import { demoGraphTrace } from "@/lib/demo-graph";
import type { GraphTraceState, TraceNode } from "@/lib/trace-types";
import { TraceHeader, type DashboardTab } from "@/components/TraceHeader";
import { TraceStats } from "@/components/TraceStats";
import { TraceTimeline } from "@/components/TraceTimeline";
import { RetrievalList, type ScoredRetrieval } from "@/components/RetrievalList";
import { AnswerPanel } from "@/components/AnswerPanel";
import { GraphCanvas } from "@/components/GraphCanvas";
import { NodeInspector } from "@/components/NodeInspector";
import { FactsPanel } from "@/components/FactsPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "GraphTrace — Graph-Based Retrieval Intelligence & Multi-Hop Relationship Tracing",
      },
      {
        name: "description",
        content:
          "Trace agent execution runs, evaluate retrieved evidence against answers with lexical overlap scoring, and explore multi-hop knowledge graphs. Runs 100% locally in your browser.",
      },
      {
        property: "og:title",
        content: "GraphTrace — Graph-Based Retrieval Intelligence",
      },
      {
        property: "og:description",
        content:
          "Analyze multi-hop graph retrieval, causal relationship paths, and evidence utilization. Zero external egress.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("trace");
  const [activeDemo, setActiveDemo] = useState<"incident" | "payments">("incident");

  // State for execution trace mode
  const [trace, setTrace] = useState<AgentTrace>(demoTrace);
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  // State for knowledge graph mode
  const [graphState, setGraphState] = useState<GraphTraceState>(demoGraphTrace);
  const [selectedNode, setSelectedNode] = useState<TraceNode | null>(null);

  // Error and theme state
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "dark"); // Default dark mode for developer SaaS
  }, []);

  const handleToggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSelectDemo = (demo: "incident" | "payments") => {
    setActiveDemo(demo);
    setError(null);
    if (demo === "incident") {
      setTrace(demoTrace);
      setActiveTab("trace");
    } else {
      setGraphState(demoGraphTrace);
      setActiveTab("graph");
    }
  };

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
      const parsed = JSON.parse(text) as Record<string, unknown>;

      if (parsed["graph"] && typeof parsed["graph"] === "object") {
        const g = parsed as unknown as GraphTraceState;
        if (!Array.isArray(g.graph.nodes) || !Array.isArray(g.graph.edges)) {
          throw new Error("Invalid graph trace format: 'graph.nodes' and 'graph.edges' required.");
        }
        setGraphState(g);
        setActiveTab("graph");
        setError(null);
      } else if (parsed["query"] && Array.isArray(parsed["retrievals"])) {
        const t = parsed as unknown as AgentTrace;
        setTrace({ ...t, spans: t.spans ?? [] });
        setActiveTab("trace");
        setError(null);
      } else {
        throw new Error(
          "Unrecognized trace format. Expected either an AgentTrace (query, retrievals) or GraphTraceState (graph.nodes, graph.edges).",
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse trace file.");
    }
  }

  const handleSelectConnectedNode = (nodeId: string) => {
    const target = graphState.graph.nodes.find((n) => n.id === nodeId);
    if (target) setSelectedNode(target);
  };

  return (
    <main className="min-h-screen bg-background text-foreground grid-bg">
      <TraceHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeDemo={activeDemo}
        onSelectDemo={handleSelectDemo}
        onFileSelect={handleLoadFile}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Error notification banner */}
        {error && (
          <div className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 font-mono text-xs text-destructive flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Execution Trace & Overlap Scoring */}
        {activeTab === "trace" && (
          <section className="space-y-6">
            <div>
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
                See what your agent retrieved,{" "}
                <span className="text-primary">and what it actually used.</span>
              </h1>
              <p className="mt-3 max-w-3xl text-muted-foreground text-sm leading-relaxed">
                Every retrieved chunk or entity is scored against the generated answer by lexical
                token overlap. No external LLM re-reads your evidence, ensuring fast, deterministic,
                and private evaluations.
              </p>
            </div>

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
                onToggleItem={(id) => setOpenItemId((prev) => (prev === id ? null : id))}
              />
              <AnswerPanel answer={trace.answer} />
            </div>
          </section>
        )}

        {/* Tab 2: Knowledge Graph Exploration */}
        {activeTab === "graph" && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Multi-Hop Relationship Tracing
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Trace multi-hop relationship chains across PRs, services, commits, and documents
                  to uncover causal dependencies.
                </p>
              </div>

              <div className="font-mono text-xs text-muted-foreground bg-card border border-border p-2.5 rounded">
                Query: <span className="text-foreground font-semibold">“{graphState.query}”</span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <GraphCanvas
                data={graphState.graph}
                selectedNodeId={selectedNode?.id ?? null}
                onSelectNode={setSelectedNode}
              />

              {selectedNode ? (
                <NodeInspector
                  node={selectedNode}
                  graph={graphState.graph}
                  onClose={() => setSelectedNode(null)}
                  onSelectConnectedNode={handleSelectConnectedNode}
                />
              ) : (
                <aside className="border border-border bg-card p-5 rounded-md space-y-4">
                  <h3 className="font-semibold text-sm text-foreground">Graph Insights</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Click any node in the graph to inspect its entity properties, vector similarity,
                    recency decay, and directed relation hops.
                  </p>
                  <div className="border-t border-border pt-3 space-y-2 font-mono text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Total Entities:</span>
                      <span className="text-foreground">{graphState.graph.nodes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Causal Nodes:</span>
                      <span className="text-primary font-bold">
                        {graphState.graph.nodes.filter((n) => n.active).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Directed Edges:</span>
                      <span className="text-foreground">{graphState.graph.edges.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Traversal Latency:</span>
                      <span className="text-foreground">
                        {graphState.metrics.latencyMs ?? 1240}ms
                      </span>
                    </div>
                  </div>
                </aside>
              )}
            </div>

            {graphState.answer && (
              <div className="border border-primary/40 bg-card p-5 rounded-md">
                <p className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                  Grounded Final Answer
                </p>
                <p className="mt-2 text-sm text-foreground leading-relaxed">{graphState.answer}</p>
              </div>
            )}
          </section>
        )}

        {/* Tab 3: Memory Facts */}
        {activeTab === "facts" && (
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Episodic Memory & Grounded Facts
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Structured knowledge assertions and relational facts passed into the model prompt
                during generation.
              </p>
            </div>

            <FactsPanel facts={graphState.facts} />
          </section>
        )}
      </div>
    </main>
  );
}
