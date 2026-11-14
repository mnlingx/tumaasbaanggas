# Graph Report - tumaasbaanggas  (2026-11-15)

## Corpus Check
- 7 files · ~2,693 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .example 1, (none) 1, .css 1)

## Summary
- 89 nodes · 95 edges · 8 communities (7 shown, 1 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b3503556`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Fuel Data Updater
- Frontend Interaction
- Site Content and Privacy
- Workflow Structure
- Workflow Configuration
- CI Update Execution
- CI Runtime Setup

## God Nodes (most connected - your core abstractions)
1. `render()` - 7 edges
2. `steps` - 6 edges
3. `steps` - 6 edges
4. `Privacy Policy` - 6 edges
5. `Fuel Price Home Page` - 5 edges
6. `About Page` - 4 edges
7. `news` - 3 edges
8. `update` - 3 edges
9. `on` - 3 edges
10. `update` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Privacy Contact Email` --semantically_similar_to--> `Feedback Email`  [INFERRED] [semantically similar]
  privacy.html → about.html
- `Philippine Fuel Price Monitoring` --conceptually_related_to--> `Current Fuel Price Answer`  [INFERRED]
  about.html → index.html
- `External Publishers and Payment Services` --references--> `Donation Options`  [EXTRACTED]
  privacy.html → index.html
- `About Page` --references--> `Fuel Price Home Page`  [EXTRACTED]
  about.html → index.html
- `About Page` --references--> `Privacy Policy`  [EXTRACTED]
  about.html → privacy.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Site Page Navigation** — index_home_page, about_about_page, privacy_privacy_policy [EXTRACTED 1.00]
- **Privacy and Donation Flow** — index_donations, index_donation_qr_dialog, privacy_external_services [INFERRED 0.85]

## Communities (8 total, 1 thin omitted)

### Community 0 - "Fuel Data Updater"
Cohesion: 0.11
Nodes (13): a, API_KEY, b, canonicalNewsUrl(), FUELS, MONTHS, news, old (+5 more)

### Community 1 - "Frontend Interaction"
Cohesion: 0.19
Nodes (12): el(), FALLBACK, literModal, literModalClose, loadData(), NAMES, openLiterModal(), peso() (+4 more)

### Community 2 - "Site Content and Privacy"
Cohesion: 0.21
Nodes (12): About Page, Feedback Email, Philippine Fuel Price Monitoring, Current Fuel Price Answer, Donation QR Dialog, Donation Options, Fuel Price Home Page, Oil Price References (+4 more)

### Community 3 - "Workflow Structure"
Cohesion: 0.18
Nodes (10): jobs, update, name, on, schedule, workflow_dispatch, permissions, contents (+2 more)

### Community 4 - "Workflow Configuration"
Cohesion: 0.18
Nodes (10): jobs, update, name, on, schedule, workflow_dispatch, permissions, contents (+2 more)

### Community 5 - "CI Update Execution"
Cohesion: 0.25
Nodes (8): OPENAI_API_KEY, env, name, run, uses, with, steps, node-version

### Community 6 - "CI Runtime Setup"
Cohesion: 0.25
Nodes (8): OPENAI_API_KEY, env, name, run, uses, with, steps, node-version

## Knowledge Gaps
- **3 isolated node(s):** `Donation QR Dialog`, `Oil Price References`, `No Cookies or Tracking`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 49 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `steps` connect `CI Update Execution` to `Workflow Structure`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `Donation QR Dialog`, `Oil Price References`, `No Cookies or Tracking` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Fuel Data Updater` be split into smaller, more focused modules?**
  _Cohesion score 0.11052631578947368 - nodes in this community are weakly interconnected._
- **Why does `steps` connect `CI Runtime Setup` to `Workflow Configuration`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `update` connect `Workflow Structure` to `CI Update Execution`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._