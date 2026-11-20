import type { ChangeEvent } from "react";

interface TraceHeaderProps {
  onLoadDemo: () => void;
  onFileSelect: (file: File) => void;
}

export function TraceHeader({ onLoadDemo, onFileSelect }: TraceHeaderProps) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <header className="border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2 font-mono text-lg font-semibold tracking-tight">
          <span className="inline-block h-3 w-3 bg-primary" /> graphtrace
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={onLoadDemo}
            className="border border-border px-3 py-2 transition-colors hover:border-primary"
          >
            demo run
          </button>
          <label className="cursor-pointer bg-primary px-3 py-2 text-primary-foreground transition-opacity hover:opacity-90">
            open trace.json
            <input type="file" accept=".json" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
      </div>
    </header>
  );
}
