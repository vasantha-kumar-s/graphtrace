import type { ChangeEvent } from "react";
import { Activity, Network, BookOpen, Sun, Moon, Upload, Play } from "lucide-react";

export type DashboardTab = "trace" | "graph" | "facts";

interface TraceHeaderProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  activeDemo: "incident" | "payments";
  onSelectDemo: (demo: "incident" | "payments") => void;
  onFileSelect: (file: File) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function TraceHeader({
  activeTab,
  onTabChange,
  activeDemo,
  onSelectDemo,
  onFileSelect,
  theme,
  onToggleTheme,
}: TraceHeaderProps) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-lg font-bold tracking-tight">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-black">
              GT
            </span>
            <span>GraphTrace</span>
          </div>
          <span className="hidden sm:inline-block rounded border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            Graph Retrieval Intelligence
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 rounded-md border border-border bg-background p-1 font-mono text-xs">
          <button
            type="button"
            onClick={() => onTabChange("trace")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors ${
              activeTab === "trace"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Execution Trace</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange("graph")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors ${
              activeTab === "graph"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Knowledge Graph</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange("facts")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors ${
              activeTab === "facts"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Memory Facts</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Demo switcher */}
          <div className="flex items-center rounded border border-border bg-background">
            <button
              type="button"
              onClick={() => onSelectDemo("incident")}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs transition-colors ${
                activeDemo === "incident"
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Load Webhook Timeout Incident Trace"
            >
              <Play className="h-3 w-3" />
              <span>Trace Demo</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectDemo("payments")}
              className={`flex items-center gap-1 border-l border-border px-2.5 py-1.5 text-xs transition-colors ${
                activeDemo === "payments"
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Load Multi-Hop Knowledge Graph"
            >
              <Network className="h-3 w-3" />
              <span>Graph Demo</span>
            </button>
          </div>

          {/* Import File Button */}
          <label className="flex cursor-pointer items-center gap-1.5 rounded border border-border bg-secondary px-3 py-1.5 text-foreground hover:border-primary transition-colors">
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Open JSON</span>
            <input type="file" accept=".json" className="hidden" onChange={handleFileChange} />
          </label>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
