import { useState, useMemo } from "react";
import type { KnowledgeGraphData, TraceNode } from "@/lib/trace-types";
import { getEntityTheme } from "@/lib/trace-types";
import { ZoomIn, ZoomOut, RotateCcw, Filter, Sparkles } from "lucide-react";

interface GraphCanvasProps {
  data: KnowledgeGraphData;
  selectedNodeId: string | null;
  onSelectNode: (node: TraceNode | null) => void;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 64;

export function GraphCanvas({ data, selectedNodeId, onSelectNode }: GraphCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [onlyActive, setOnlyActive] = useState(false);

  const filteredNodes = useMemo(() => {
    if (!onlyActive) return data.nodes;
    return data.nodes.filter((n) => n.active);
  }, [data.nodes, onlyActive]);

  const activeNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return data.edges.filter((e) => activeNodeIds.has(e.source) && activeNodeIds.has(e.target));
  }, [data.edges, activeNodeIds]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, TraceNode>();
    filteredNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [filteredNodes]);

  return (
    <div className="relative flex flex-col rounded-md border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between border-b border-border px-4 py-2.5 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Multi-Hop Relationship Graph
          </span>
          <span className="text-muted-foreground">
            {filteredNodes.length} nodes · {filteredEdges.length} edges
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOnlyActive(!onlyActive)}
            className={`flex items-center gap-1 rounded border px-2.5 py-1 text-xs transition-colors ${
              onlyActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-foreground"
            }`}
          >
            <Filter className="h-3 w-3" />
            {onlyActive ? "Showing active path" : "Show all nodes"}
          </button>
          <div className="flex items-center border border-border rounded">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              className="p-1 hover:bg-secondary text-muted-foreground"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-xs font-mono text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
              className="p-1 hover:bg-secondary text-muted-foreground"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="border-l border-border p-1 hover:bg-secondary text-muted-foreground"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div
        className="relative min-h-[460px] w-full overflow-auto bg-background/50 p-4"
        style={{ cursor: "default" }}
      >
        <svg
          width="1000"
          height="460"
          className="mx-auto block"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
        >
          <defs>
            <marker
              id="arrow-active"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M 0 0 L 8 4 L 0 8 z" className="fill-primary" />
            </marker>
            <marker
              id="arrow-inactive"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M 0 0 L 8 4 L 0 8 z" className="fill-muted-foreground/40" />
            </marker>
          </defs>

          {/* Render Relationship Edges */}
          {filteredEdges.map((edge) => {
            const src = nodeMap.get(edge.source);
            const tgt = nodeMap.get(edge.target);
            if (!src || !tgt) return null;

            const sx = src.position.x + NODE_WIDTH / 2;
            const sy = src.position.y + NODE_HEIGHT / 2;
            const tx = tgt.position.x + NODE_WIDTH / 2;
            const ty = tgt.position.y + NODE_HEIGHT / 2;

            const mx = (sx + tx) / 2;
            const my = (sy + ty) / 2;
            const isActive = edge.active;

            return (
              <g key={edge.id}>
                <path
                  d={`M ${sx} ${sy} Q ${mx} ${my - 20} ${tx} ${ty}`}
                  fill="none"
                  stroke={isActive ? "var(--primary)" : "var(--border)"}
                  strokeWidth={isActive ? 2 : 1}
                  strokeDasharray={isActive ? undefined : "4 3"}
                  markerEnd={isActive ? "url(#arrow-active)" : "url(#arrow-inactive)"}
                  className="transition-colors duration-200"
                />
                {edge.relation && (
                  <g transform={`translate(${mx}, ${my - 12})`}>
                    <rect
                      x="-38"
                      y="-9"
                      width="76"
                      height="18"
                      rx="3"
                      fill="var(--card)"
                      stroke={isActive ? "var(--primary)" : "var(--border)"}
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground font-mono text-[9px] font-semibold"
                    >
                      {edge.relation}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render Entity Nodes */}
          {filteredNodes.map((node) => {
            const theme = getEntityTheme(node.type);
            const isSelected = node.id === selectedNodeId;
            const isActive = node.active;
            const Icon = theme.icon;

            return (
              <g
                key={node.id}
                transform={`translate(${node.position.x}, ${node.position.y})`}
                onClick={() => onSelectNode(isSelected ? null : node)}
                className="cursor-pointer transition-transform duration-150 hover:scale-[1.02]"
              >
                <rect
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx="4"
                  fill="var(--card)"
                  stroke={
                    isSelected ? "var(--primary)" : isActive ? "var(--primary)" : "var(--border)"
                  }
                  strokeWidth={isSelected ? 2.5 : isActive ? 1.5 : 1}
                  className={isActive ? "drop-shadow-[0_0_8px_rgba(134,239,172,0.15)]" : ""}
                />

                {/* Header Tag / Entity Type */}
                <rect x="8" y="8" width="18" height="18" rx="3" className={theme.badgeBg} />
                <foreignObject x="9" y="9" width="16" height="16">
                  <div
                    className={`flex h-full w-full items-center justify-center ${theme.badgeText}`}
                  >
                    <Icon className="h-3 w-3" />
                  </div>
                </foreignObject>

                <text
                  x="32"
                  y="21"
                  className="fill-muted-foreground font-mono text-[10px] uppercase tracking-wider"
                >
                  {node.type}
                </text>

                {isActive && (
                  <circle
                    cx={NODE_WIDTH - 14}
                    cy="16"
                    r="4"
                    className="fill-primary animate-pulse"
                  />
                )}

                {/* Node Label */}
                <text x="10" y="45" className="fill-foreground font-sans text-xs font-semibold">
                  {node.label.length > 22 ? `${node.label.slice(0, 20)}…` : node.label}
                </text>

                {/* Score chip if present */}
                {node.score !== undefined && (
                  <text
                    x={NODE_WIDTH - 10}
                    y="52"
                    textAnchor="end"
                    className="fill-primary font-mono text-[10px]"
                  >
                    score {node.score.toFixed(2)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
