# Graph Report - repobuddy  (2026-10-17)

## Corpus Check
- 19 files · ~4,547 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .css 1)

## Summary
- 128 nodes · 160 edges · 11 communities (9 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1a9ac4c6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- compilerOptions
- package.json
- app/page.tsx
- repo.ts
- RepoBuddy — Hackathon Plan
- 🧭 RepoBuddy
- CLAUDE.md
- app/layout.tsx
- dependencies
- app/app/page.tsx
- .claude/CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `RepoBuddy — Hackathon Plan` - 13 edges
3. `ask()` - 8 edges
4. `buildGraph()` - 6 edges
5. `next` - 6 edges
6. `Workspace()` - 5 edges
7. `Home()` - 5 edges
8. `repoDir()` - 5 edges
9. `🧭 RepoBuddy` - 5 edges
10. `mapRepo()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `5. Timeline (120 min)` --references--> `ask()`  [INFERRED]
  plan.md → lib/repo.ts
- `POST()` --calls--> `ask()`  [EXTRACTED]
  app/api/ask/route.ts → lib/repo.ts
- `GET()` --calls--> `repoDir()`  [EXTRACTED]
  app/api/graph/[repo]/route.ts → lib/repo.ts
- `POST()` --calls--> `buildGraph()`  [EXTRACTED]
  app/api/map/route.ts → lib/repo.ts
- `Home()` --calls--> `CopyButton()`  [EXTRACTED]
  app/page.tsx → app/ui.tsx

## Import Cycles
- None detected.

## Communities (11 total, 2 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 1 - "package.json"
Cohesion: 0.11
Nodes (18): devDependencies, @types/node, @types/react, @types/react-dom, typescript, license, name, private (+10 more)

### Community 2 - "app/page.tsx"
Cohesion: 0.26
Nodes (11): EXAMPLES, Home(), SectionHead(), SETUP, USES, CopyButton(), GITHUB_URL, PipelineTabs() (+3 more)

### Community 3 - "repo.ts"
Cohesion: 0.16
Nodes (13): POST(), GET(), POST(), ask(), buildGraph(), gemini(), graphify(), MODEL (+5 more)

### Community 4 - "RepoBuddy — Hackathon Plan"
Cohesion: 0.13
Nodes (14): 10. Demo script (60–90 seconds), 11. Submission checklist, 12. Things to verify in the first 15 minutes, 1. Prize categories (tick all three), 2. Scope, 3. Tech stack, 4. Team roles, 6. Code layout (+6 more)

### Community 5 - "🧭 RepoBuddy"
Cohesion: 0.33
Nodes (5): Built with, How it works, License, 🧭 RepoBuddy, Setup

### Community 7 - "app/layout.tsx"
Cohesion: 0.15
Nodes (6): metadata, fira, inter, metadata, GITHUB, next

### Community 8 - "dependencies"
Cohesion: 0.40
Nodes (5): dependencies, @google/genai, next, react, react-dom

### Community 9 - "app/app/page.tsx"
Cohesion: 0.29
Nodes (10): loadRecent(), Msg, post(), PRESETS, Rich(), saveRecent(), STAGES, Workspace() (+2 more)

## Knowledge Gaps
- **5 isolated node(s):** `react-dom`, `@types/node`, `@types/react`, `@types/react-dom`, `typescript`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 78 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@google/genai` connect `package.json` to `repo.ts`?**
  _High betweenness centrality (0.282) - this node is a cross-community bridge._
- **What connects `react-dom`, `@types/node`, `@types/react` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Why does `next` connect `app/layout.tsx` to `package.json`, `app/page.tsx`?**
  _High betweenness centrality (0.205) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `RepoBuddy — Hackathon Plan` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._