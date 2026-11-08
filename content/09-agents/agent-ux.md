---
id: agent-ux
book: 9
order: "9.12"
title: Agent UX
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [ux, streaming, trust]
visuals:
  - agent-ux-anatomy:diagram
  - spinner-vs-stream:compare
---
> [!tldr]
> Agents are slow, probabilistic and sometimes wrong, so their interfaces must show progress, expose the plan, allow interruption and undo, keep results in an editable artifact, and make every claim checkable. Good agent UX turns waiting into trust.

## Why it matters
A two-minute agent run behind a spinner feels broken at thirty seconds. The same run with a visible plan, live progress and a stop button feels like watching a colleague work. Users forgive mistakes they can see and fix; they abandon systems that fail silently. For agents, the interface is part of the safety story too: it is where approvals, interrupts and review happen.

## Intuition
Think of a contractor renovating your kitchen. A good one tells you the plan, shows progress each day, asks before knocking down walls, leaves receipts, and lets you change your mind. A bad one disappears for two weeks and presents a bill. Same work, opposite trust.

```viz
{"id":"agent-ux-anatomy","component":"diagram","title":"Seven interface parts turn an agent run from a black box into something people can steer","caption":"An annotated agent interface. Click a part for the chapter behind it.","alt":"Annotated layout of an agent interface: editable plan, progress stream, artifact pane, approval prompt, citations and logs, stop and undo controls, and the composer.","data":"illustrative","w":600,"h":300,"groups":[{"label":"Agent interface","x":0,"y":0,"w":600,"h":300}],"nodes":[
{"id":"plan","label":"Editable plan","sub":"steps, status","role":"agent","x":14,"y":28,"w":180,"h":56,"link":"#planning-reasoning"},
{"id":"stream","label":"Progress stream","sub":"what it is doing now","role":"context","x":14,"y":100,"w":180,"h":56,"link":"#streaming"},
{"id":"approve","label":"Approval prompt","sub":"exact action, options","role":"human","x":14,"y":172,"w":180,"h":56,"link":"#human-in-the-loop"},
{"id":"artifact","label":"Artifact pane","sub":"the work product, editable","role":"data","x":214,"y":28,"w":372,"h":128},
{"id":"cite","label":"Citations and logs","sub":"sources, actions taken","role":"tool","x":214,"y":172,"w":180,"h":56,"link":"#grounding-citations"},
{"id":"ctrl","label":"Stop and undo","sub":"interrupt, roll back","role":"plain","x":406,"y":172,"w":180,"h":56,"link":"#long-running-agents"},
{"id":"compose","label":"Composer","sub":"redirect at any time","role":"human","x":14,"y":242,"w":572,"h":44}]}
```

## How it works
**Stream progress, not tokens.** Show which step is running (“searching tickets”, “running tests: 3 of 12 failed”), and what it found. Raw token streaming of internal reasoning is less useful than a readable activity feed. See [streaming](#streaming).

**Make the plan visible and editable.** Let users see the plan before a long run starts and change it. Plans are the cheapest place to catch misunderstandings. See [planning](#planning-reasoning).

**Interrupt and undo.** A stop button that works at any step, and checkpoints that let users roll back changes. Without these, people will not delegate anything important. See [long-running agents](#long-running-agents).

**Artifacts and canvases.** Put the work product (a document, a diff, a dashboard) in its own editable pane beside the conversation, so users can change it directly instead of describing changes in chat.

**Generative UI.** Agents can render forms, tables and small interactive views instead of walls of text; protocols such as AG-UI and MCP Apps carry these between agent and front end. See [the alphabet soup](#protocol-soup).

**Citations and evidence.** Link claims to sources and actions to logs, so users can check. See [grounding and citations](#grounding-citations).

**Calibrated trust.** Say when the agent is unsure, show what it could not verify, and do not let fluent prose imply more certainty than exists. See [AI product and UX](#ai-product-ux).

## In practice
The difference between a spinner and a progress stream:

```viz
{"id":"spinner-vs-stream","component":"compare","title":"The same 90-second run feels broken behind a spinner and trustworthy as a stream","caption":"Hover the marks. The streamed version exposes progress, a surprise, and a decision point, all of which the spinner hides.","alt":"Comparison of a spinner-only interface and a step-by-step progress stream for the same agent run.","data":"illustrative","mono":false,"a":{"title":"Spinner","text":"Working on it…\n(90 seconds pass)\nHere is the updated report with all the figures corrected and the summary rewritten to reflect the new quarter. I also reorganized the appendix.","mono":false},"b":{"title":"Progress stream","text":"Plan: 1) find figures 2) recompute 3) update summary\n✓ Found 14 figures in the report\n✓ Recomputed from the Q3 sheet: 3 changed\n⚠ Figure 9 has no source data. Keep it or remove it?\n✓ Summary updated (diff available)\nDone. Changes: 3 figures, 1 paragraph. Appendix untouched.","mono":false},"links":[{"a":"Working on it…","b":"Plan: 1) find figures 2) recompute 3) update summary","note":"A visible plan sets expectations and invites correction before work starts."},{"a":"all the figures corrected","b":"Recomputed from the Q3 sheet: 3 changed","note":"Specific counts let users check the claim."},{"b":"Figure 9 has no source data. Keep it or remove it?","note":"Surfacing a problem mid-run beats hiding it in a confident summary."},{"a":"I also reorganized the appendix.","b":"Appendix untouched.","note":"Scope stays explicit, and unrequested changes do not slip through."}]}
```

Checklist for an agent interface:
- A plan the user can see before work starts, and edit.
- A progress feed in plain language, updated at every step.
- A stop button that always works, and an undo for changes.
- Approvals that state the exact effect. See [human in the loop](#human-in-the-loop).
- The work product in an editable artifact, with a diff of changes.
- Citations for claims and a log of actions.
- A clear end state: what was done, what was not, and what needs a decision.

## Numbers to know
> [!number]
> Rules of thumb. People notice delays of a few hundred milliseconds and start to doubt a silent interface within seconds; show the first sign of progress immediately. For runs over about ten seconds, show steps, not just a spinner. For runs over a few minutes, let users leave and notify them when done.

## Pitfalls and anti-patterns
> [!pitfall] Confident summaries of uncertain work
> A polished final message that hides skipped steps and unverified claims teaches users to trust the agent exactly when they should not.

- **Streaming internal monologue as progress.** Raw reasoning text is noisy; summarize it into steps.
- **Chat-only editing.** Forcing users to describe edits in chat instead of editing the artifact wastes their time.
- **No end state.** Users should know whether the run finished, failed or needs them.

## Talk like an expert
The vocabulary: **progress stream**, **visible plan**, **interruptibility**, **artifact** or **canvas**, **generative UI**, **trust calibration**, **human on the loop**. Experts design for the moment the agent is wrong: what does the user see, and how fast can they recover? The live debate is how much autonomy users actually want: many prefer agents that propose and wait over agents that act and report.

> [!hottake] For agents, UX is a reliability feature, not polish.
> **The counterargument:** a great interface cannot make an unreliable agent useful; if the underlying success rate is low, visible progress just shows users the failures in more detail.

## Check yourself
```quiz
agent-ux
```

## Go deeper
- The [AI product and UX](#ai-product-ux) chapter for the broader design principles.
- AG-UI and MCP Apps documentation, for protocols that carry agent state and UI to front ends.

## Related
- [AI product and UX](#ai-product-ux)
- [Human in the loop](#human-in-the-loop)
- [Streaming](#streaming)
- [Grounding and citations](#grounding-citations)
- [Planning and reasoning strategies](#planning-reasoning)
