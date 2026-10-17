# Graph Report - repobuddy  (2026-10-17)

## Corpus Check
- 18 files · ~5,408 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 4, .ico 1, .css 1)

## Summary
- 149 nodes · 187 edges · 11 communities (8 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5e57d2c1`
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
- next
- app/app/page.tsx
- .claude/CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `RepoBuddy — Hackathon Plan` - 13 edges
3. `ask()` - 8 edges
4. `next` - 7 edges
5. `repo_dir()` - 7 edges
6. `🧭 RepoBuddy` - 7 edges
7. `run()` - 6 edges
8. `Workspace()` - 5 edges
9. `Home()` - 5 edges
10. `build()` - 5 edges

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

## Communities (11 total, 3 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 1 - "package.json"
Cohesion: 0.09
Nodes (21): dependencies, next, react, react-dom, devDependencies, @types/node, @types/react, @types/react-dom (+13 more)

### Community 2 - "app/page.tsx"
Cohesion: 0.17
Nodes (12): fira, inter, metadata, EXAMPLES, Home(), SectionHead(), SETUP, USES (+4 more)

### Community 3 - "main.py"
Cohesion: 0.10
Nodes (14): 5. Timeline (120 min), ask(), AskBody, build(), CommandError, gemini(), graph(), health() (+6 more)

### Community 4 - "RepoBuddy — Hackathon Plan"
Cohesion: 0.13
Nodes (14): 10. Demo script (60–90 seconds), 11. Submission checklist, 12. Things to verify in the first 15 minutes, 1. Prize categories (tick all three), 2. Scope, 3. Tech stack, 4. Team roles, 6. Code layout (+6 more)

### Community 5 - "🧭 RepoBuddy"
Cohesion: 0.25
Nodes (7): Built with, Deploy, How it works, Layout, License, 🧭 RepoBuddy, Run locally

### Community 7 - "next"
Cohesion: 0.25
Nodes (3): metadata, config, next

### Community 9 - "app/app/page.tsx"
Cohesion: 0.18
Nodes (14): ApiError, loadRecent(), Msg, post(), PRESETS, Rich(), saveRecent(), STAGES (+6 more)

## Knowledge Gaps
- **5 isolated node(s):** `react-dom`, `@types/node`, `@types/react`, `@types/react-dom`, `typescript`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 91 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `app/app/page.tsx`, `app/page.tsx`, `package.json`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **What connects `react-dom`, `@types/node`, `@types/react` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Why does `RepoBuddy — Hackathon Plan` connect `RepoBuddy — Hackathon Plan` to `main.py`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `main.py` be split into smaller, more focused modules?**
  _Cohesion score 0.09659090909090909 - nodes in this community are weakly interconnected._
- **Should `RepoBuddy — Hackathon Plan` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._