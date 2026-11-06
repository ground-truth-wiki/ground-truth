---
id: coding-harness-landscape
book: 11
order: "11.4"
title: The coding-harness landscape
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [coding-agents, harnesses, agents-md]
visuals:
  - harness-surfaces:diagram
  - harness-matrix:matrix
  - surface-chooser:tree
---
> [!tldr]
> Coding agents come in three surfaces: terminal agents, editor agents, and cloud or background agents that open pull requests. They converge on similar features and differ in models, autonomy defaults, extension systems, where code runs and how teams share configuration. A dated snapshot as of November 2026.

## Why it matters
Teams adopt coding agents faster than any other AI tool, and the choice shapes daily workflows, security posture and costs. The landscape changes monthly, so the useful skill is not memorizing products but knowing the dimensions that matter and testing candidates on your own repositories.

## Intuition
Choosing a coding agent is like choosing how to work with a contractor. A terminal agent is a contractor who works at your desk on your machine. An editor agent sits beside you in your editor. A cloud agent takes the ticket home and comes back with a pull request. Each suits different jobs.

```viz
{"id":"harness-surfaces","component":"diagram","title":"Three surfaces, three trade-offs: where the agent runs decides speed, oversight and safety","caption":"Examples are illustrative as of November 2026; many products span several surfaces. Click a surface for related chapters.","alt":"Diagram of three coding-agent surfaces: terminal agents, editor agents and cloud or background agents, with examples and trade-offs.","data":"illustrative","depicts":"As of November 2026","w":600,"h":200,"nodes":[
{"id":"cli","label":"Terminal agents","sub":"your machine, your checkout","role":"agent","x":0,"y":0,"w":185,"h":60,"link":"#claude-code"},
{"id":"ide","label":"Editor agents","sub":"inside the editor","role":"agent","x":207,"y":0,"w":185,"h":60,"link":"#working-with-coding-agents"},
{"id":"cloud","label":"Cloud agents","sub":"remote sandbox, opens PRs","role":"agent","x":414,"y":0,"w":186,"h":60,"link":"#long-running-agents"},
{"id":"cli2","label":"Claude Code, Codex CLI,\nGemini CLI, Aider, OpenCode","align":"center","glyph":false,"x":0,"y":96,"w":185,"h":56},
{"id":"ide2","label":"Cursor, Copilot, Windsurf,\nCline, Roo Code, Kiro","align":"center","glyph":false,"x":207,"y":96,"w":185,"h":56},
{"id":"cloud2","label":"Devin, Jules, Codex cloud,\nFactory, hosted modes","align":"center","glyph":false,"x":414,"y":96,"w":186,"h":56},
{"id":"t1","label":"Fast loop; runs as you","align":"center","glyph":false,"x":0,"y":160,"w":185,"h":38},
{"id":"t2","label":"Inline review; editor lock-in","align":"center","glyph":false,"x":207,"y":160,"w":185,"h":38},
{"id":"t3","label":"Parallel, async; review later","align":"center","glyph":false,"x":414,"y":160,"w":186,"h":38}],
"edges":[{"from":"cli","to":"cli2","style":"dashed"},{"from":"ide","to":"ide2","style":"dashed"},{"from":"cloud","to":"cloud2","style":"dashed"}]}
```

## How it works
**Terminal agents** run in your shell against your checkout: Claude Code, Codex CLI, Gemini CLI, Aider, OpenCode, Goose, Amp and others. They are scriptable, fast to iterate with, and run with your permissions, so sandboxing matters. See [sandboxes](#sandboxes).

**Editor agents** live in an IDE: Cursor, GitHub Copilot, Windsurf, Cline, Roo Code, Kilo Code, Kiro and others. They make inline review easy and bind you to an editor. The Agent Client Protocol lets some terminal agents appear inside editors too. See [the alphabet soup](#protocol-soup).

**Cloud and background agents** take a task, work in a remote sandbox and open a pull request: Devin, Jules, Codex in the cloud, Factory, and hosted modes of several CLIs. They parallelize well and move review to the pull request. See [long-running agents](#long-running-agents).

**Open research harnesses.** OpenHands, SWE-agent and mini-SWE-agent are open and widely used to benchmark models fairly. See [harness engineering](#harness-engineering).

**Instruction files.** AGENTS.md is read by many agents; others read their own file such as `CLAUDE.md`, `GEMINI.md` or rules directories. Keep one source of truth and point the others at it.

**Extension systems.** Most agents support MCP servers; many add their own skills, rules, plugins or extensions, with different manifests and marketplaces (verified Nov 2026 for several). See [skills and plugins](#skills-plugins).

```viz
{"id":"harness-matrix","component":"matrix","matrix":"coding-harnesses","title":"Ten coding harnesses compared by surface, openness, instruction file and extensions","caption":"Sortable and filterable. Qualitative and dated as of November 2026; products change monthly.","alt":"Table comparing coding-agent harnesses by surface, openness, instruction file and extension system.","data":"illustrative","depicts":"As of November 2026"}
```

## In practice
Choose with a short evaluation on your own work:
1. **Pick five real tasks** from your backlog: a bug fix, a small feature, a refactor, a test addition and a code review.
2. **Run two or three agents** on each, with the same instructions file and a time limit.
3. **Score** correctness, review effort, time and cost; read the transcripts. See [evaluating agents](#evaluating-agents).
4. **Check fit**: model access, security controls, sandboxing, team configuration sharing, data policies and price.

```viz
{"id":"surface-chooser","component":"tree","title":"Two questions narrow the surface: who reviews, and when?","caption":"Expand the branch that matches how your team works. Many teams use more than one surface.","alt":"Decision tree for choosing between terminal, editor and cloud coding agents.","data":"illustrative","open":2,"root":{"label":"How will humans review the agent’s work?","children":[
{"label":"Line by line, while it works","children":[{"label":"Do you live in one editor?","children":[{"label":"Yes: an editor agent"},{"label":"No, or you script a lot: a terminal agent","link":"#claude-code"}]}]},
{"label":"As a pull request, later","children":[{"label":"Are tasks well specified and independent?","children":[{"label":"Yes: cloud or background agents in parallel","link":"#long-running-agents"},{"label":"No: start in a terminal agent with plan mode, then delegate","link":"#working-with-coding-agents"}]}]}]}}
```

## Numbers to know
> [!number]
> Rules of thumb. Five representative tasks per candidate is enough to rule out poor fits; twenty gives a usable comparison. Expect agent cost and quality to vary more by task type than by product.

## Pitfalls and anti-patterns
> [!pitfall] Choosing from benchmark headlines
> Public scores use different harnesses, budgets and tasks from yours. Your repository and conventions decide what works.

- **Divergent instruction files.** Three agents with three different sets of rules produce three different codebases.
- **Ignoring where code runs.** Cloud agents need repository access and secrets policies; terminal agents need local sandboxing.
- **Locking in early.** Keep configuration portable: AGENTS.md, MCP servers and skills move between agents more easily than custom rules.

## Talk like an expert
The vocabulary: **terminal, editor and cloud agents**, **background agent**, **instruction file**, **AGENTS.md**, **worktrees**, **review surface**. Experts compare agents on their own tasks and describe them by surface and review model rather than by brand. The live debate is convergence: as features spread, whether the differentiator becomes the model, the review experience or the ecosystem.

> [!hottake] Within a year the surface will matter more than the brand.
> **The counterargument:** model access and quality still differ enough between vendors that the same surface can produce very different results; brand still means model, for now.

## Check yourself
```quiz
coding-harness-landscape
```

## Go deeper
- Each product’s documentation and changelog, read with dates in mind.
- SWE-bench and Terminal-Bench leaderboards, read with [benchmark literacy](#benchmark-literacy).

## Related
- [Case study: Claude Code](#claude-code)
- [Coding agents](#coding-agents)
- [Skills, plugins and extension ecosystems](#skills-plugins)
- [Working effectively with coding agents](#working-with-coding-agents)
- [Harness engineering](#harness-engineering)
