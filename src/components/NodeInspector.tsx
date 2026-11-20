import type { TraceNode, KnowledgeGraphData } from "@/lib/trace-types";
import { getEntityTheme } from "@/lib/trace-types";
import { X, ArrowRight, ShieldCheck, Clock, Layers } from "lucide-react";

interface NodeInspectorProps {
  node: TraceNode | null;
  graph: KnowledgeGraphData;
  onClose: () => void;
  onSelectConnectedNode: (nodeId: string) => void;
}

export function NodeInspector({ node, graph, onClose, onSelectConnectedNode }: NodeInspectorProps) {
  if (!node) return null;

  const theme = getEntityTheme(node.type);
  const Icon = theme.icon;

  const connectedEdges = graph.edges.filter((e) => e.source === node.id || e.target === node.id);

  return (
    <aside className="border border-border bg-card p-5 rounded-md space-y-4">
      <div className="flex items-start justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${theme.badgeBg} ${theme.badgeText}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">{node.label}</h3>
            <span className="font-mono text-xs text-muted-foreground uppercase">{node.type}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-1"
          aria-label="Close inspector"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {node.meta?.subtitle && (
        <div>
          <p className="font-mono text-xs text-muted-foreground uppercase">Subtitle</p>
          <p className="text-xs text-foreground mt-0.5">{node.meta.subtitle}</p>
        </div>
      )}

      {/* Metric Breakdown */}
      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
        {node.similarity !== undefined && (
          <div className="border border-border bg-background/50 p-2 rounded">
            <span className="text-muted-foreground block text-[10px] uppercase">Similarity</span>
            <span className="font-bold text-foreground">{node.similarity.toFixed(3)}</span>
          </div>
        )}
        {node.score !== undefined && (
          <div className="border border-border bg-background/50 p-2 rounded">
            <span className="text-muted-foreground block text-[10px] uppercase">Fused Score</span>
            <span className="font-bold text-primary">{node.score.toFixed(3)}</span>
          </div>
        )}
        {node.meta?.answerOverlap !== undefined && node.meta?.answerOverlap !== null && (
          <div className="border border-border bg-background/50 p-2 rounded">
            <span className="text-muted-foreground block text-[10px] uppercase">Overlap</span>
            <span className="font-bold text-primary">
              {(node.meta.answerOverlap * 100).toFixed(0)}%
            </span>
          </div>
        )}
        {node.meta?.recency !== undefined && (
          <div className="border border-border bg-background/50 p-2 rounded">
            <span className="text-muted-foreground block text-[10px] uppercase">Recency Decay</span>
            <span className="font-bold text-foreground">{node.meta.recency.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Metadata Fields */}
      <div className="space-y-1.5 text-xs font-mono">
        {node.meta?.owner && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Owner:</span>
            <span className="text-foreground">{node.meta.owner}</span>
          </div>
        )}
        {node.meta?.status && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className="text-foreground">{node.meta.status}</span>
          </div>
        )}
        {node.meta?.timestamp && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Timestamp:</span>
            <span className="text-foreground">{node.meta.timestamp}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Active in Answer:</span>
          <span className={node.active ? "text-primary font-bold" : "text-muted-foreground"}>
            {node.active ? "Yes (Traced)" : "Context only"}
          </span>
        </div>
      </div>

      {/* Snippet preview */}
      {node.meta?.snippet && (
        <div>
          <p className="font-mono text-xs text-muted-foreground uppercase">Content Snippet</p>
          <div className="mt-1 max-h-32 overflow-y-auto rounded border border-border bg-background/60 p-2.5 font-mono text-xs text-muted-foreground leading-relaxed">
            {node.meta.snippet}
          </div>
        </div>
      )}

      {/* Connected Relations */}
      <div>
        <p className="font-mono text-xs text-muted-foreground uppercase mb-2">
          Connected Relations ({connectedEdges.length})
        </p>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {connectedEdges.map((e) => {
            const isOut = e.source === node.id;
            const targetId = isOut ? e.target : e.source;
            const targetNode = graph.nodes.find((n) => n.id === targetId);

            return (
              <button
                key={e.id}
                type="button"
                onClick={() => onSelectConnectedNode(targetId)}
                className="w-full flex items-center justify-between p-2 text-xs rounded border border-border bg-background/40 hover:bg-secondary text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-mono text-[10px] text-primary font-semibold">
                    {e.relation ?? "RELATES_TO"}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="truncate">{targetNode?.label ?? targetId}</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground shrink-0 ml-2">
                  conf {e.confidence.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
