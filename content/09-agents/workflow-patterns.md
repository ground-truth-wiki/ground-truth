---
id: workflow-patterns
book: 9
order: "9.4"
title: Workflow patterns
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [workflows, chaining, orchestrator]
visuals:
  - workflow-gallery:diagram
  - workflow-chooser:tree
---
> [!tldr]
> Five workflow patterns cover most LLM applications: prompt chaining, routing, parallelization, orchestrator and workers, and evaluator and optimizer. Each trades a little flexibility for a lot of predictability, and each has a clear sign that you need it.

## Why it matters
Most products that call themselves agents are workflows, and that is a compliment. When you know the steps, code is cheaper, faster, testable and debuggable. Knowing the five patterns lets you build 80% of applications without an agent loop, and lets you recognize when a task really does need one.

## Intuition
A workflow is an assembly line where some stations are models. You decide the stations and the conveyor; the models do the skilled work at each station. Agents are what you use when you cannot draw the assembly line in advance.

```viz
{"id":"workflow-gallery","component":"diagram","title":"Five shapes cover most LLM workflows, and only the last two loop","caption":"Switch tabs to compare the patterns. Models are hexagons, code steps are plain boxes. Each pattern’s note says when to reach for it.","alt":"Gallery of five workflow pattern diagrams: chaining, routing, parallelization, orchestrator and workers, evaluator and optimizer.","data":"illustrative","try":"Open Routing, then Orchestrator: what decides the branches in each?","w":560,"h":220,"variants":[
{"name":"Prompt chaining","note":"Fixed steps in sequence, with a code **gate** between them. Use it when the task splits cleanly into stages, such as outline then draft then translate.","nodes":[{"id":"in","label":"Input","role":"human","x":0,"y":82,"w":90,"h":56},{"id":"s1","label":"Outline","role":"model","x":110,"y":82,"w":110,"h":56},{"id":"g","label":"Gate:\ncheck outline","x":240,"y":82,"w":110,"h":56},{"id":"s2","label":"Draft","role":"model","x":370,"y":82,"w":100,"h":56},{"id":"out","label":"Output","role":"human","x":486,"y":82,"w":74,"h":56,"glyph":false}],"edges":[{"from":"in","to":"s1"},{"from":"s1","to":"g"},{"from":"g","to":"s2","label":"pass"},{"from":"s2","to":"out"}]},
{"name":"Routing","note":"A classifier sends each input to a specialized handler. Use it when inputs fall into distinct types that deserve different prompts, tools or models, including sending easy cases to a cheap model.","nodes":[{"id":"in","label":"Input","role":"human","x":0,"y":82,"w":90,"h":56},{"id":"r","label":"Classify","role":"model","x":120,"y":82,"w":110,"h":56},{"id":"h1","label":"Refund flow","role":"model","x":280,"y":0,"w":150,"h":50},{"id":"h2","label":"Tech support","role":"model","x":280,"y":85,"w":150,"h":50},{"id":"h3","label":"Small model: FAQ","role":"model","x":280,"y":170,"w":150,"h":50},{"id":"out","label":"Output","role":"human","x":470,"y":85,"w":90,"h":50,"glyph":false}],"edges":[{"from":"in","to":"r"},{"from":"r","to":"h1"},{"from":"r","to":"h2"},{"from":"r","to":"h3"},{"from":"h1","to":"out"},{"from":"h2","to":"out"},{"from":"h3","to":"out"}]},
{"name":"Parallelization","note":"Independent calls run at once, then code combines them. **Sectioning** splits a task into parts; **voting** runs the same task several times and takes the majority. Use it for speed or for confidence.","nodes":[{"id":"in","label":"Input","role":"human","x":0,"y":85,"w":90,"h":50},{"id":"w1","label":"Check policy","role":"model","x":140,"y":0,"w":150,"h":50},{"id":"w2","label":"Check facts","role":"model","x":140,"y":85,"w":150,"h":50},{"id":"w3","label":"Check tone","role":"model","x":140,"y":170,"w":150,"h":50},{"id":"agg","label":"Aggregate\nor vote","x":340,"y":80,"w":110,"h":60},{"id":"out","label":"Output","role":"human","x":480,"y":85,"w":80,"h":50,"glyph":false}],"edges":[{"from":"in","to":"w1"},{"from":"in","to":"w2"},{"from":"in","to":"w3"},{"from":"w1","to":"agg"},{"from":"w2","to":"agg"},{"from":"w3","to":"agg"},{"from":"agg","to":"out"}]},
{"name":"Orchestrator and workers","note":"A model breaks the task into subtasks **at runtime**, delegates them, and synthesizes the results. Use it when you cannot know the subtasks in advance, such as edits across an unknown number of files.","nodes":[{"id":"in","label":"Input","role":"human","x":0,"y":85,"w":80,"h":50},{"id":"o","label":"Orchestrator","sub":"plans subtasks","role":"agent","x":110,"y":80,"w":160,"h":60},{"id":"w1","label":"Worker","role":"model","x":320,"y":0,"w":120,"h":50},{"id":"w2","label":"Worker","role":"model","x":320,"y":85,"w":120,"h":50},{"id":"w3","label":"Worker","role":"model","x":320,"y":170,"w":120,"h":50},{"id":"out","label":"Output","role":"human","x":480,"y":85,"w":80,"h":50,"glyph":false}],"edges":[{"from":"in","to":"o"},{"from":"o","to":"w1"},{"from":"o","to":"w2"},{"from":"o","to":"w3"},{"from":"w3","to":"o","curve":-30,"label":"results","style":"dashed"},{"from":"w2","to":"out","style":"dashed","label":"synthesis"}]},
{"name":"Evaluator and optimizer","note":"One call generates, another critiques against explicit criteria, and the loop repeats until the critique passes or a limit is hit. Use it when you can state what good looks like and iteration measurably helps.","nodes":[{"id":"in","label":"Input","role":"human","x":0,"y":85,"w":90,"h":50},{"id":"gen","label":"Generate","role":"model","x":130,"y":85,"w":130,"h":50},{"id":"ev","label":"Evaluate","sub":"against criteria","role":"model","x":310,"y":85,"w":140,"h":50},{"id":"out","label":"Accepted","role":"human","x":480,"y":85,"w":80,"h":50,"glyph":false}],"edges":[{"from":"in","to":"gen"},{"from":"gen","to":"ev","label":"draft"},{"from":"ev","to":"gen","curve":50,"label":"feedback"},{"from":"ev","to":"out","label":"pass"}]}]}
```

## How it works
**Prompt chaining** decomposes a task into a fixed sequence. Gates between steps are ordinary code: check a length, validate JSON, confirm a section exists. Chaining trades latency for accuracy, because each call has an easier job.

**Routing** classifies the input first. The classifier can be a model, a smaller model, embeddings or plain rules. Routing is also how you spend less: send easy questions to a cheap model and hard ones to a strong one.

**Parallelization** runs independent calls at once. Sectioning splits work (one call checks policy while another checks facts). Voting runs the same prompt several times and aggregates, which raises confidence on judgments such as “is this content safe?”

**Orchestrator and workers** looks like parallelization, but the split is decided by a model at runtime. This is the bridge to [multi-agent systems](#multi-agent).

**Evaluator and optimizer** iterates: generate, critique, revise. It works when the evaluator can apply criteria the generator misses, such as a style guide or a test suite. Without a hard stop, it can loop or polish into blandness.

## In practice
Patterns compose. A support bot might route by intent, chain retrieval and drafting inside each route, and run a parallel policy check before sending. Build the simplest version first, measure it with [evals](#why-evals), and add a pattern only when the eval shows a gap it fixes.

```python
# Pseudocode: routing with a cheap first pass and a gate.
intent = classify(message)                      # small model or rules
if intent == "refund":
    draft = answer(message, prompt=REFUND_PROMPT, tools=[lookup_order])
elif intent == "technical":
    docs = retrieve(message, k=8)
    draft = answer(message, prompt=TECH_PROMPT, context=docs)
else:
    draft = answer(message, model=SMALL_MODEL, prompt=FAQ_PROMPT)
if not policy_check(draft):                     # gate: code, not vibes
    draft = escalate_to_human(message)
```

```viz
{"id":"workflow-chooser","component":"tree","title":"Two questions pick the pattern: do you know the steps, and can you check the result?","caption":"Expand the branches that match your task. If you end at “agent loop”, read the next Book’s chapters before building one.","alt":"Decision tree for choosing a workflow pattern.","data":"illustrative","open":3,"root":{"label":"Do you know the steps in advance?","children":[{"label":"Yes","children":[{"label":"Is the input one of a few known types?","children":[{"label":"Yes: routing","link":"#workflow-patterns"},{"label":"No: are there independent subtasks?","children":[{"label":"Yes: parallelization"},{"label":"No: prompt chaining"}]}]}]},{"label":"No","children":[{"label":"Can a model split the work into subtasks?","children":[{"label":"Yes: orchestrator and workers","link":"#multi-agent"},{"label":"No: can you state clear quality criteria?","children":[{"label":"Yes: evaluator and optimizer"},{"label":"No: a full agent loop","link":"#agent-loop"}]}]}]}]}}
```

## Numbers to know
> [!number]
> Rules of thumb. Each extra step in a chain adds a full model call of latency, often around a second or more for a short output. Voting with three to five samples usually captures most of the gain of voting. A router that sends even half of traffic to a cheaper model can cut cost substantially if quality holds; measure it.

## Pitfalls and anti-patterns
> [!pitfall] Building an agent when a chain would do
> If you can write the steps on a whiteboard, an agent loop adds cost, latency and new failure modes for no gain.

- **Gates that ask a model to judge itself.** Prefer code checks; when you need a model judge, calibrate it. See [LLM-as-judge](#llm-as-judge).
- **Unbounded evaluator loops.** Cap iterations, and keep the best draft, not the last.
- **Routing without a fallback.** Misclassified inputs need a safe default route.

## Talk like an expert
Experts name the pattern before the framework: “this is routing plus a parallel guardrail.” The five-pattern vocabulary was popularized by Anthropic’s “Building effective agents” essay (December 2024), and you will hear it in design reviews everywhere. The live debate is where workflows end and agents begin as models get better at deciding their own steps.

> [!hottake] Most agents in production should be workflows with one agentic step.
> **The counterargument:** hard-coded branches multiply as edge cases appear, and a capable model with good tools often handles the long tail more gracefully than the tree of `if` statements you would otherwise maintain.

## Check yourself
```quiz
workflow-patterns
```

## Go deeper
- Anthropic, “Building effective agents” (December 2024).
- Wang et al., “Self-Consistency Improves Chain of Thought Reasoning in Language Models” (2022), the basis for voting.

## Related
- [What is an agent?](#what-is-an-agent)
- [Prompt patterns and chaining](#prompt-chaining)
- [Multi-agent systems](#multi-agent)
- [Planning and reasoning strategies](#planning-reasoning)
- [Decision guides](#decision-guides)
- [Multi-agent orchestration patterns](#multi-agent-patterns)
- [Task-oriented dialogue: from intents and slots to LLM agents](#dialogue-systems)
- [Graph workflow runtimes: state, super-steps and checkpoints](#graph-workflow-runtimes)
