import type { LucideIcon } from "lucide-react";
import {
  GitPullRequest,
  GitCommitHorizontal,
  Server,
  User,
  FileText,
  FolderGit2,
  Library,
  Ticket,
  Users,
  Wrench,
  FileCode,
} from "lucide-react";

export type EntityType =
  | "PR"
  | "Commit"
  | "Service"
  | "Person"
  | "Document"
  | "Repo"
  | "Library"
  | "Ticket"
  | "Team"
  | "Tool"
  | "File";

export interface TraceNode {
  id: string;
  label: string;
  type: EntityType;
  active: boolean;
  position: { x: number; y: number };
  similarity?: number;
  score?: number;
  meta?: {
    subtitle?: string;
    owner?: string;
    status?: string;
    timestamp?: string;
    snippet?: string;
    connections?: number;
    scoreGraph?: number;
    sourceUrl?: string;
    answerOverlap?: number | null;
    recency?: number;
    ageDays?: number | null;
  };
}

export interface TraceEdge {
  id: string;
  source: string;
  target: string;
  confidence: number;
  active: boolean;
  relation?: string;
}

export interface MemoryFact {
  text: string;
  remembered: boolean;
  source?: string;
}

export interface KnowledgeGraphData {
  nodes: TraceNode[];
  edges: TraceEdge[];
}

export interface GraphTraceState {
  id: string;
  query: string;
  answer?: string | null;
  outcome?: "success" | "failure" | null;
  computedAt: string;
  metrics: {
    queryTimeSec: number;
    latencyMs?: number;
  };
  graph: KnowledgeGraphData;
  facts?: MemoryFact[];
}

export interface EntityTheme {
  icon: LucideIcon;
  badgeBg: string;
  badgeText: string;
  border: string;
  label: string;
}

export const ENTITY_THEMES: Record<EntityType, EntityTheme> = {
  PR: {
    icon: GitPullRequest,
    badgeBg: "bg-indigo-500/10",
    badgeText: "text-indigo-400",
    border: "border-indigo-500/30",
    label: "Pull Request",
  },
  Commit: {
    icon: GitCommitHorizontal,
    badgeBg: "bg-teal-500/10",
    badgeText: "text-teal-400",
    border: "border-teal-500/30",
    label: "Commit",
  },
  Service: {
    icon: Server,
    badgeBg: "bg-cyan-500/10",
    badgeText: "text-cyan-400",
    border: "border-cyan-500/30",
    label: "Service",
  },
  Person: {
    icon: User,
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-400",
    border: "border-amber-500/30",
    label: "Person",
  },
  Document: {
    icon: FileText,
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-400",
    border: "border-emerald-500/30",
    label: "Document",
  },
  Repo: {
    icon: FolderGit2,
    badgeBg: "bg-purple-500/10",
    badgeText: "text-purple-400",
    border: "border-purple-500/30",
    label: "Repository",
  },
  Library: {
    icon: Library,
    badgeBg: "bg-rose-500/10",
    badgeText: "text-rose-400",
    border: "border-rose-500/30",
    label: "Library",
  },
  Ticket: {
    icon: Ticket,
    badgeBg: "bg-blue-500/10",
    badgeText: "text-blue-400",
    border: "border-blue-500/30",
    label: "Ticket",
  },
  Team: {
    icon: Users,
    badgeBg: "bg-orange-500/10",
    badgeText: "text-orange-400",
    border: "border-orange-500/30",
    label: "Team",
  },
  Tool: {
    icon: Wrench,
    badgeBg: "bg-lime-500/10",
    badgeText: "text-lime-400",
    border: "border-lime-500/30",
    label: "Tool",
  },
  File: {
    icon: FileCode,
    badgeBg: "bg-zinc-500/10",
    badgeText: "text-zinc-400",
    border: "border-zinc-500/30",
    label: "File",
  },
};

export function getEntityTheme(type: string): EntityTheme {
  return ENTITY_THEMES[type as EntityType] ?? ENTITY_THEMES.Document;
}
