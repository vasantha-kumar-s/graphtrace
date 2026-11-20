# GraphTrace

> **Agent Retrieval & Execution Trace Analyzer** — Evaluate which retrieved documents and evidence chunks actually shaped your AI agent's generated answer.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-ff4154.svg)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

When building Retrieval-Augmented Generation (RAG) pipelines and autonomous agents (e.g. with LangGraph, LlamaIndex, CrewAI, AutoGen), agents frequently retrieve dozens of documents or code snippets that never actually influence the final response. This leads to bloated context windows, increased latency, higher LLM token costs, and subtle hallucinations.

**GraphTrace** provides a high-fidelity visual trace viewer and lexical overlap evaluator for agent execution runs. It runs **100% client-side** in your browser: no traces or proprietary code leave your machine, and no secondary LLM calls are made to evaluate evidence usage.

---

## Features

- **100% Client-Side Privacy**: Traces are parsed and analyzed purely within your browser session using standard Web APIs. No telemetry, third-party trackers, or backend data storage.
- **Lexical Overlap Scoring**: Automatically tokens and scores every retrieved snippet against the final answer using token-set overlap ratio (`Math.min(answerTokens, snippetTokens)`).
- **Threshold-Based Usage Detection**: Automatically tags each piece of evidence as **used** (green badge, $\ge 0.20$ overlap) or **no trace** (red outline, $< 0.20$ overlap).
- **Multi-Phase Execution Timeline**: Visualizes execution spans (`retriever`, `llm`, `node`), parent-child span relationships, and relative millisecond latencies across the pipeline.
- **Multi-Arm Retrieval Breakdown**: Compares retrievals across different search arms (e.g., vector search vs. knowledge graph search vs. keyword search).
- **Interactive Chunk Inspection**: Expand and read full snippet content directly within the UI, alongside vector similarity scores and overlap metrics.
- **Instant Demo Mode**: Includes an interactive sample trace modeled after a LangGraph incident resolution flow.
- **Flexible JSON Import**: Accepts any agent trace file matching the standard GraphTrace JSON schema.

---

## Technology Stack

| Layer                      | Technologies                                                                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**              | [React 19](https://react.dev/) with [TanStack Start](https://tanstack.com/start)                                                                                |
| **Routing & Query**        | [TanStack Router](https://tanstack.com/router) (file-based routing), [TanStack Query v5](https://tanstack.com/query)                                            |
| **Styling**                | [Tailwind CSS v4](https://tailwindcss.com/) with OKLCH dynamic color system and brutalist developer theme                                                       |
| **Bundling & Server**      | [Vite 8](https://vite.dev/), [Nitro 3](https://nitro.unjs.io/) (SSR + Cloudflare module support)                                                                |
| **Testing**                | [Vitest](https://vitest.dev/), [@testing-library/react](https://testing-library.com/), [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) |
| **Linting & Code Quality** | [ESLint 9](https://eslint.org/) (flat config), [Prettier 3](https://prettier.io/), [typescript-eslint](https://typescript-eslint.io/)                           |

---

## Architecture & Project Structure

GraphTrace is structured around pure computational scoring logic separated from presentation components:

```
graphtrace/
├── public/                 # Static assets (favicon, robots.txt)
├── src/
│   ├── components/         # Modular UI components
│   │   ├── AnswerPanel.tsx     # Final answer display and threshold legend
│   │   ├── RetrievalList.tsx   # Expandable list of retrieval spans and chunks
│   │   ├── TraceHeader.tsx     # Top navigation, brand logo, and file loader
│   │   ├── TraceStats.tsx      # Overview metrics (query, retrieved count, used count)
│   │   └── TraceTimeline.tsx   # Execution span waterfall timeline visualization
│   ├── lib/                # Pure scoring functions and server wrappers
│   │   ├── demo-trace.ts       # Sample multi-step LangGraph agent trace
│   │   ├── error-capture.ts    # Server error recovery and diagnostics
│   │   ├── error-page.ts       # SSR fallback error template
│   │   ├── overlap.ts          # Pure lexical tokenization and overlap scoring
│   │   ├── overlap.test.ts     # Unit tests for scoring algorithm
│   │   └── utils.ts            # Class name merging utility (clsx + tailwind-merge)
│   ├── routes/             # File-based routes (TanStack Router)
│   │   ├── __root.tsx          # Root HTML shell, layout, and global error boundaries
│   │   └── index.tsx           # Primary trace analyzer page
│   ├── test/               # Integration tests and Vitest setup
│   │   ├── app-routing.test.tsx# Routing and fallback integration test
│   │   └── setup.ts            # DOM polyfills for Vitest environment
│   ├── router.tsx          # Router factory with per-request QueryClient
│   ├── routeTree.gen.ts    # Auto-generated TanStack router manifest
│   ├── server.ts           # SSR server entrypoint
│   ├── start.ts            # TanStack Start middleware configuration
│   └── styles.css          # Tailwind CSS v4 design tokens and theme variables
├── .env.example            # Environment configuration template
├── eslint.config.js        # Flat ESLint configuration
├── package.json            # Project manifest, dependencies, and scripts
├── tsconfig.json           # TypeScript configuration with path aliases
├── vite.config.ts          # Vite configuration
└── vitest.config.ts        # Vitest test runner configuration
```

---

## Trace Schema Specification

GraphTrace accepts `.json` trace files adhering to the following structure:

```json
{
  "query": "why is checkout failing?",
  "framework": "langgraph",
  "latency_ms": 2140,
  "answer": "Checkout fails because the Stripe webhook handler times out after the payment intent confirms...",
  "spans": [
    { "id": "s1", "name": "plan", "kind": "node", "start_ms": 0, "end_ms": 180, "status": "ok" },
    {
      "id": "s2",
      "name": "search_prs",
      "kind": "retriever",
      "parent_id": "s1",
      "start_ms": 180,
      "end_ms": 720,
      "status": "ok"
    },
    { "id": "s3", "name": "answer", "kind": "llm", "start_ms": 720, "end_ms": 2140, "status": "ok" }
  ],
  "retrievals": [
    {
      "span_id": "s2",
      "query": "checkout failure",
      "arm": "vector",
      "items": [
        {
          "id": "pr_412",
          "label": "PR #412 · Raise Stripe webhook timeout",
          "kind": "pull_request",
          "score": 0.88,
          "content": "Stripe webhook handler times out on payment_intent.succeeded. Raise timeout and add retry queue."
        }
      ]
    }
  ]
}
```

### Overlap Algorithm

Lexical overlap is defined as:

$$\text{Overlap}(A, C) = \frac{|T(A) \cap T(C)|}{\min(|T(A)|, |T(C)|)}$$

Where:

- $T(A)$ is the set of normalized non-stopword tokens from the generated answer.
- $T(C)$ is the set of normalized non-stopword tokens from the retrieved chunk content.
- An item is marked **Used** if $\text{Overlap} \ge 0.20$.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version `20.x` or higher recommended)
- `npm` (version `10.x` or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/vasantha-kumar-s/graphtrace.git
   cd graphtrace
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables (optional):
   ```bash
   cp .env.example .env
   ```

---

## Development & Build Commands

| Command              | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| `npm run dev`        | Starts the local Vite development server with HMR          |
| `npm run build`      | Produces an optimized production client and SSR build      |
| `npm run preview`    | Previews the production build locally                      |
| `npm run test`       | Runs the test suite via Vitest                             |
| `npm run test:watch` | Runs Vitest in interactive watch mode                      |
| `npm run lint`       | Runs ESLint 9 checks across all TypeScript and React files |
| `npm run format`     | Formats all code files with Prettier                       |

---

## Usage Instructions

1. **Launch the Application**: Run `npm run dev` and open `http://localhost:3000` (or the displayed port) in your browser.
2. **Explore Demo Trace**: Click the **demo run** button in the top navigation bar to load an example trace featuring multi-arm retrieval (vector search and knowledge graph search).
3. **Inspect Execution Timeline**: The timeline waterfall displays each span's execution order, duration in milliseconds, and type (`retriever`, `llm`, or `node`).
4. **Evaluate Retrieved vs. Used Items**:
   - Items with a **green badge** (`used 0.XX`) supplied lexical context that reached the final answer.
   - Items with a **red strikeout** (`no trace 0.00`) were retrieved by the search system but never used in the response.
5. **Inspect Chunk Contents**: Click any item card to expand and read its raw retrieved text.
6. **Upload Custom Traces**: Click **open trace.json** to import traces from your own agent logging pipeline.

---

## License

This project is licensed under the MIT License.
