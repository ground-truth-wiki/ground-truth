---
id: watchlist
book: 19
order: "19.9"
title: Watchlist
level: frontier
stability: volatile
reviewed: "2026-11"
status: full
tags: [sources, newsletters, conferences]
visuals:
  - sources-tree:tree
  - watch-routine:stepper
---
> [!tldr]
> Keep up with AI without drowning: follow primary sources (model and system cards, specification repositories, papers), a few high-signal curators, data trackers and policy bodies, and run a short weekly routine that turns news into evals and decisions.

## Why it matters
AI changes weekly, and most of the noise does not matter for your systems. A deliberate watchlist catches the changes that do (new models, spec versions, deprecations, security issues, regulations) and ignores the rest.

## Intuition
A watchlist is a news diet: a few nutritious sources, eaten regularly, beat endless snacking on headlines.

```viz
{"id":"sources-tree","component":"tree","title":"Five kinds of source worth following","caption":"Expand a kind for examples. Prefer primary sources; verify claims before acting.","alt":"Tree of source types for keeping up with AI: primary sources, curators, data trackers, policy bodies and communities.","data":"illustrative","open":1,"root":{"label":"What to follow","children":[
{"label":"Primary sources","children":[{"label":"Labs’ release notes, model and system cards; MCP and A2A specification repositories; arXiv in your areas","link":"#mcp-spec-history"}]},
{"label":"High-signal curators","children":[{"label":"Practitioner newsletters, blogs and podcasts that read the primary sources for you"}]},
{"label":"Data and evaluation trackers","children":[{"label":"Epoch AI, METR, LMArena and benchmark leaderboards","link":"#benchmark-literacy"}]},
{"label":"Policy bodies","children":[{"label":"The EU AI Office, NIST, national AI safety and security institutes","link":"#governance-regulation"}]},
{"label":"Communities","children":[{"label":"Framework and protocol communities, issue trackers and changelogs of the tools you use"}]}]}}
```

## How it works
**Primary over secondary.** Release notes and specs beat summaries; summaries beat social media.

**Relevance filter.** For each item, ask: does it change a model, tool, protocol, price, law or risk my system depends on?

**From news to action.** Relevant changes become eval runs, upgrade tickets, security reviews or decision-record updates. See [decision guides](#decision-guides).

```viz
{"id":"watch-routine","component":"stepper","title":"A 30-minute weekly routine that turns AI news into decisions","caption":"Illustrative. Adjust sources to your stack.","alt":"Stepper of a weekly routine: scan primary sources, filter for relevance, test, decide and record.","data":"illustrative","frames":[
{"label":"Scan","caption":"Ten minutes: release notes and changelogs of your models, SDKs, protocols and frameworks; one curator digest."},
{"label":"Filter","caption":"Keep only changes to things you depend on: new versions, deprecations, prices, security notices, regulations."},
{"label":"Test","caption":"Run your eval suite on any new model or version worth considering."},
{"label":"Decide","caption":"Upgrade, schedule, or ignore, with a one-line reason."},
{"label":"Record","caption":"Update decision records and the team’s changelog; set reminders for deprecation dates."}]}
```

## In practice
- Subscribe to changelogs of everything in your stack.
- Keep a team watchlist document with owners per area.
- Treat volatile chapters of this Bible as dated; check their review dates.

## Numbers to know
> [!number]
> Rule of thumb: half an hour a week of structured watching beats hours of unstructured scrolling.

## Pitfalls and anti-patterns
> [!pitfall] Reacting to every launch
> Re-architecting for each announcement wastes more time than it saves.

## Talk like an expert
Experts know the release cadence of their dependencies and read specs before posts. The live debate is how to keep shared knowledge current as AI changes faster than documentation.

> [!hottake] Changelogs are the most underrated AI news source.
> **The counterargument:** changelogs miss context and strategic shifts that good analysis explains; you need both.

## Check yourself
```quiz
watchlist
```

## Go deeper
- This Bible’s [What’s new](#whats-new) page and changelog.

## Related
- [State-of-the-art snapshot](#sota-snapshot)
- [Open problems and big debates](#open-problems)
- [Who’s who and where to learn](#whos-who)
- [Decision guides](#decision-guides)
- [Benchmark literacy](#benchmark-literacy)
