# Graph Report - repobuddy  (2026-10-17)

## Corpus Check
- 24 files · ~7,536 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 4, .ico 1, .css 1)

## Summary
- 199 nodes · 280 edges · 11 communities (9 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fb792055`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- compilerOptions
- package.json
- app/page.tsx
- main.py
- RepoBuddy — Hackathon Plan
- 🧭 RepoBuddy
- CLAUDE.md
- cloud.ts
- compilerOptions
- app/app/page.tsx
- .claude/CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `RepoBuddy — Hackathon Plan` - 13 edges
3. `compilerOptions` - 9 edges
4. `ask()` - 8 edges
5. `callTool()` - 7 edges
6. `next` - 7 edges
7. `repo_dir()` - 7 edges
8. `🧭 RepoBuddy` - 7 edges
9. `Workspace()` - 6 edges
10. `json()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `5. Timeline (120 min)` --references--> `ask()`  [INFERRED]
  plan.md → server/main.py
- `test_repo_dir_blocks_traversal()` --calls--> `repo_dir()`  [EXTRACTED]
  server/test_main.py → server/main.py
- `Home()` --calls--> `CopyButton()`  [EXTRACTED]
  app/page.tsx → app/ui.tsx
- `Home()` --calls--> `PipelineTabs()`  [EXTRACTED]
  app/page.tsx → app/ui.tsx
- `Home()` --calls--> `RepoForm()`  [EXTRACTED]
  app/page.tsx → app/ui.tsx

## Import Cycles
- None detected.

## Communities (11 total, 2 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 1 - "package.json"
Cohesion: 0.08
Nodes (25): dependencies, next, react, react-dom, devDependencies, @cloudflare/workers-types, @types/node, @types/react (+17 more)

### Community 2 - "app/page.tsx"
Cohesion: 0.10
Nodes (17): metadata, fira, inter, metadata, EXAMPLES, Home(), SectionHead(), SETUP (+9 more)

### Community 3 - "main.py"
Cohesion: 0.08
Nodes (13): ask(), AskBody, build(), CommandError, gemini(), graph(), health(), map_repo() (+5 more)

### Community 4 - "RepoBuddy — Hackathon Plan"
Cohesion: 0.12
Nodes (15): 10. Demo script (60–90 seconds), 11. Submission checklist, 12. Things to verify in the first 15 minutes, 1. Prize categories (tick all three), 2. Scope, 3. Tech stack, 4. Team roles, 5. Timeline (120 min) (+7 more)

### Community 5 - "🧭 RepoBuddy"
Cohesion: 0.25
Nodes (7): Built with, Deploy, Graphify Cloud mode, How it works, License, 🧭 RepoBuddy, Run locally

### Community 7 - "cloud.ts"
Cohesion: 0.15
Nodes (26): done(), onRequestGet(), onRequestGet(), onRequestPost(), page(), onRequestPost(), onRequestGet(), Repo (+18 more)

### Community 8 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 9 - "app/app/page.tsx"
Cohesion: 0.17
Nodes (15): ApiError, EXAMPLES, Indexed, loadRecent(), Msg, post(), PRESETS, Rich() (+7 more)

## Knowledge Gaps
- **7 isolated node(s):** `react-dom`, `@cloudflare/workers-types`, `@types/node`, `@types/react`, `@types/react-dom` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 109 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `app/page.tsx` to `package.json`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **What connects `react-dom`, `@cloudflare/workers-types`, `@types/node` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Why does `ask()` connect `main.py` to `RepoBuddy — Hackathon Plan`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10317460317460317 - nodes in this community are weakly interconnected._
- **Should `main.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08392603129445235 - nodes in this community are weakly interconnected._