# Agent Guidelines

- Trace scoring logic lives in `src/lib/overlap.ts` as pure functions so it remains unit-testable.
- The viewer runs fully client-side: traces are parsed, inspected, and scored directly in the browser with no external model re-reading or data egress.
- Maintain modular component structure in `src/components/` and file-based routing under `src/routes/`.
- Do not rewrite published git history.
