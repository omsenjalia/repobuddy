# Graph Report - repobuddy  (2026-10-17)

## Corpus Check
- 14 files · ~2,824 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .css 1)

## Summary
- 103 nodes · 116 edges · 11 communities (8 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e121595f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- compilerOptions
- package.json
- page.tsx
- repo.ts
- RepoBuddy — Hackathon Plan
- 🧭 RepoBuddy
- CLAUDE.md
- layout.tsx
- dependencies
- devDependencies
- .claude/CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `RepoBuddy — Hackathon Plan` - 13 edges
3. `ask()` - 8 edges
4. `buildGraph()` - 6 edges
5. `repoDir()` - 5 edges
6. `🧭 RepoBuddy` - 5 edges
7. `graphify()` - 4 edges
8. `scripts` - 4 edges
9. `post()` - 3 edges
10. `Home()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `5. Timeline (120 min)` --references--> `ask()`  [INFERRED]
  plan.md → lib/repo.ts
- `POST()` --calls--> `ask()`  [EXTRACTED]
  app/api/ask/route.ts → lib/repo.ts
- `GET()` --calls--> `repoDir()`  [EXTRACTED]
  app/api/graph/[repo]/route.ts → lib/repo.ts
- `POST()` --calls--> `buildGraph()`  [EXTRACTED]
  app/api/map/route.ts → lib/repo.ts

## Import Cycles
- None detected.

## Communities (11 total, 3 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 1 - "package.json"
Cohesion: 0.14
Nodes (13): license, name, private, scripts, build, dev, start, @google/genai (+5 more)

### Community 2 - "page.tsx"
Cohesion: 0.32
Nodes (7): Home(), askQuestion(), mapRepo(), Msg, post(), PRESETS, react

### Community 3 - "repo.ts"
Cohesion: 0.16
Nodes (13): POST(), GET(), POST(), ask(), buildGraph(), gemini(), graphify(), MODEL (+5 more)

### Community 4 - "RepoBuddy — Hackathon Plan"
Cohesion: 0.13
Nodes (14): 10. Demo script (60–90 seconds), 11. Submission checklist, 12. Things to verify in the first 15 minutes, 1. Prize categories (tick all three), 2. Scope, 3. Tech stack, 4. Team roles, 6. Code layout (+6 more)

### Community 5 - "🧭 RepoBuddy"
Cohesion: 0.33
Nodes (5): Built with, How it works, License, 🧭 RepoBuddy, Setup

### Community 8 - "dependencies"
Cohesion: 0.40
Nodes (5): dependencies, @google/genai, next, react, react-dom

### Community 9 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, @types/node, @types/react, @types/react-dom, typescript

## Knowledge Gaps
- **5 isolated node(s):** `react-dom`, `@types/node`, `@types/react`, `@types/react-dom`, `typescript`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 68 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@google/genai` connect `package.json` to `repo.ts`?**
  _High betweenness centrality (0.259) - this node is a cross-community bridge._
- **What connects `react-dom`, `@types/node`, `@types/react` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Why does `RepoBuddy — Hackathon Plan` connect `RepoBuddy — Hackathon Plan` to `repo.ts`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `RepoBuddy — Hackathon Plan` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._