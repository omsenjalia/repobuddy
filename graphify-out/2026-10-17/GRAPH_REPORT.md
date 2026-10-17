# Graph Report - repobuddy  (2026-10-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 77 nodes · 93 edges · 10 communities (7 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bb03b14d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- compilerOptions
- package.json
- page.tsx
- repo.ts
- ask
- [repo]/route.ts
- buildGraph
- layout.tsx
- dependencies
- devDependencies

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `ask()` - 7 edges
3. `buildGraph()` - 6 edges
4. `repoDir()` - 5 edges
5. `graphify()` - 4 edges
6. `scripts` - 4 edges
7. `Home()` - 3 edges
8. `post()` - 3 edges
9. `run` - 3 edges
10. `askQuestion()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `ask()`  [EXTRACTED]
  app/api/ask/route.ts → lib/repo.ts
- `GET()` --calls--> `repoDir()`  [EXTRACTED]
  app/api/graph/[repo]/route.ts → lib/repo.ts
- `POST()` --calls--> `buildGraph()`  [EXTRACTED]
  app/api/map/route.ts → lib/repo.ts

## Import Cycles
- None detected.

## Communities (10 total, 3 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 1 - "package.json"
Cohesion: 0.14
Nodes (13): license, name, private, scripts, build, dev, start, @google/genai (+5 more)

### Community 2 - "page.tsx"
Cohesion: 0.32
Nodes (7): Home(), askQuestion(), mapRepo(), Msg, post(), PRESETS, react

### Community 4 - "ask"
Cohesion: 0.50
Nodes (4): POST(), ask(), gemini(), ollama()

### Community 6 - "buildGraph"
Cohesion: 0.60
Nodes (4): POST(), buildGraph(), graphify(), run

### Community 8 - "dependencies"
Cohesion: 0.40
Nodes (5): dependencies, @google/genai, next, react, react-dom

### Community 9 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, @types/node, @types/react, @types/react-dom, typescript

## Knowledge Gaps
- **5 isolated node(s):** `react-dom`, `@types/node`, `@types/react`, `@types/react-dom`, `typescript`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 46 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@google/genai` connect `package.json` to `repo.ts`?**
  _High betweenness centrality (0.265) - this node is a cross-community bridge._
- **What connects `react-dom`, `@types/node`, `@types/react` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Why does `react` connect `page.tsx` to `package.json`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._