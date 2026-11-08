---
id: harness-engineering
book: 11
order: "11.7"
title: Harness engineering
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [harness, ablations, tool-design]
visuals:
  - ablation-chart:chart
  - tuning-loop:diagram
  - edit-format-compare:compare
---
> [!tldr]
> Harness engineering is tuning the tools, prompts, formats and loop around a specific model, and proving every change with an ablation: remove or change one thing, rerun the eval, keep it only if the number moves. It is why the same model scores differently in different harnesses.

## Why it matters
Teams often switch models to fix problems the harness caused. A better file viewer, a different edit format, trimmed test output or a larger step budget can move an agent’s success rate as much as a model generation. Harness engineering is also how you adapt when a new model arrives: what helped the last model may hurt this one.

## Intuition
A race team does not only buy a faster engine. It tunes the gearbox, tyres and suspension for that engine and that track, one change at a time, with a stopwatch. The harness is the gearbox; the eval is the stopwatch.

```viz
{"id":"ablation-chart","component":"chart","type":"bar","title":"Removing one harness feature at a time shows which ones earn their place","caption":"Illustrative ablation of a coding agent on a fixed task set. Each bar removes or changes one feature from the full harness. The step budget and output truncation matter most here; the search tool matters least.","alt":"Bar chart of task success for a full harness and five ablations: no file viewer, no search tool, untruncated output, whole-file edits, and a 10-step budget.","data":"illustrative","categories":["Full harness","No file viewer","No search tool","Untruncated output","Whole-file edits","10-step budget"],"y":{"label":"Tasks resolved","unit":"pct","min":0,"max":0.8},"series":[{"name":"Resolved","points":[[0,0.62],[1,0.51],[2,0.58],[3,0.47],[4,0.54],[5,0.41]]}]}
```

## How it works
**Design for the model.** Models differ in which tool formats, edit formats and instruction styles they handle best. Aider’s published edit-format benchmarks (2023 onward) showed that some models are more reliable with search-and-replace blocks, others with unified diffs, and that the best format changes between model generations.

**Ablations.** Change one part at a time: a tool, a description, the edit format, the truncation limit, the budget, the system prompt. Rerun the same eval with several attempts per task and compare with confidence intervals. Keep what moves the number; delete what does not. See [statistics for evals](#eval-statistics).

**Why scores differ across harnesses.** Tools decide how efficiently the model perceives and acts; output limits decide how much noise enters context; budgets decide whether the model gets to finish; retry rules decide how many chances it gets. A benchmark score without these is incomplete. See [what a harness is](#what-is-a-harness).

**Minimal versus maximal.** Minimal harnesses (one shell tool, a simple loop) are easy to study and transfer across models; maximal ones (many specialized tools, subagents, hooks) can be faster and safer but are tuned to particular models. Stronger models often need less structure, so re-run ablations on every upgrade.

```viz
{"id":"tuning-loop","component":"diagram","title":"Read transcripts, change one thing, measure, keep or revert: the loop that improves harnesses","caption":"The loop is slow by design: one change per iteration, judged by the eval rather than by impressions.","alt":"Loop diagram: read transcripts, form a hypothesis, change one part, rerun the eval, then keep or revert the change.","data":"illustrative","w":600,"h":200,"nodes":[{"id":"read","label":"Read transcripts","sub":"where does it hesitate?","role":"human","x":0,"y":0,"w":180,"h":56,"link":"#error-analysis"},{"id":"hyp","label":"Hypothesis","sub":"one specific cause","role":"agent","x":210,"y":0,"w":180,"h":56},{"id":"change","label":"Change one part","sub":"tool, format, budget","role":"tool","x":420,"y":0,"w":180,"h":56},{"id":"eval","label":"Rerun the eval","sub":"several attempts","role":"data","x":420,"y":140,"w":180,"h":56,"link":"#evaluating-agents"},{"id":"keep","label":"Keep or revert","sub":"by the interval","x":210,"y":140,"w":180,"h":56,"link":"#eval-statistics"}],"edges":[{"from":"read","to":"hyp"},{"from":"hyp","to":"change"},{"from":"change","to":"eval"},{"from":"eval","to":"keep"},{"from":"keep","to":"read","label":"next"}]}
```

## In practice
One of the most common tuning decisions is the edit format:

```viz
{"id":"edit-format-compare","component":"compare","title":"Search-and-replace and unified diffs express the same edit with different failure modes","caption":"The same one-line fix in two formats. Hover the marks. Which format a model handles best is an empirical question; measure it in your harness.","alt":"Comparison of the same code edit written as a search-and-replace block and as a unified diff.","data":"illustrative","a":{"title":"Search and replace","text":"src/dates.py\n<<<<<<< SEARCH\n    return datetime.strptime(s, '%d/%m/%y')\n=======\n    return datetime.fromisoformat(s)\n>>>>>>> REPLACE"},"b":{"title":"Unified diff","text":"--- a/src/dates.py\n+++ b/src/dates.py\n@@ -41,3 +41,3 @@ def parse_date(s):\n     s = s.strip()\n-    return datetime.strptime(s, '%d/%m/%y')\n+    return datetime.fromisoformat(s)\n     # callers expect a datetime"},"links":[{"a":"<<<<<<< SEARCH","b":"@@ -41,3 +41,3 @@ def parse_date(s):","note":"Search-and-replace locates the edit by exact text; a diff also needs correct line numbers and context lines, which models often get wrong."},{"a":"    return datetime.strptime(s, '%d/%m/%y')","b":"-    return datetime.strptime(s, '%d/%m/%y')","note":"Both require the old text to match the file exactly; whitespace mistakes are the commonest failure."},{"a":"    return datetime.fromisoformat(s)","b":"+    return datetime.fromisoformat(s)","note":"The new text is the same; only the framing differs, and framing errors make an edit fail to apply."}]}
```

A practical ablation protocol:
1. **Freeze an eval set** of 30 to 100 representative tasks with checkable outcomes.
2. **Run the baseline** three or more times per task to measure noise.
3. **Change one thing**, rerun, and compare pass rates with intervals.
4. **Read transcripts** for tasks that flipped, to confirm the mechanism.
5. **Record** each change, its effect and the model version in a changelog.
6. **Re-run the whole set** when the model changes.

## Numbers to know
> [!number]
> Rules of thumb. Agent runs are noisy: run each task several times, and treat differences smaller than the interval as noise. A single harness change can move agentic scores by many points; report harness, budget and attempts with every number.

## Pitfalls and anti-patterns
> [!pitfall] Tuning on the test set
> If you change the harness until a benchmark goes up, the gain may not transfer. Keep a held-out set you never tune on.

- **Changing several things at once.** You will not know which one helped.
- **One run per task.** Nondeterminism hides or invents improvements.
- **Carrying tweaks across model upgrades untested.** Old workarounds can hurt new models.

## Talk like an expert
The vocabulary: **ablation**, **agent-computer interface**, **edit format**, **truncation limit**, **step budget**, **minimal versus maximal harness**, **held-out set**. Experts report “model X in harness Y with budget Z” and keep a log of harness changes with their measured effects. The live debate is whether harness engineering is a lasting discipline or a temporary patch until models handle any reasonable interface.

> [!hottake] Harness engineering is where most of the remaining gains on agentic tasks are hiding.
> **The counterargument:** each new model generation has erased many harness tricks; investing in the eval set that measures harnesses lasts longer than investing in any particular trick.

## Check yourself
```quiz
harness-engineering
```

## Go deeper
- Yang et al., “SWE-agent” (2024), on the agent-computer interface.
- Aider’s blog posts and leaderboards on edit formats and model performance.

## Related
- [Anatomy of an agent harness](#harness-anatomy)
- [What “harness” means](#what-is-a-harness)
- [Evaluating agents](#evaluating-agents)
- [Tool use and tool design](#agent-tools)
- [Statistics for evals](#eval-statistics)
