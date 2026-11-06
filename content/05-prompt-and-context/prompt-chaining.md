---
id: prompt-chaining
book: 5
order: "5.3"
title: Prompt patterns and chaining
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [chaining, routing, patterns]
visuals:
  - chain-patterns:diagram
  - monolith-compare:compare
---
> [!tldr]
> Chain prompts when one call would have to do too much: each step gets a simpler job, code can check its output, and the whole pipeline becomes testable step by step. Pipelines, routers, generator and critic pairs, and meta-prompting cover most chains.

## Why it matters
A single prompt that extracts, analyzes, decides and formats at once is hard to debug: when the output is wrong, you cannot tell which part failed. Splitting it into steps makes each one easier for the model, lets you validate between steps, and lets you use cheaper models for easy steps. It is the workflow half of [workflow patterns](#workflow-patterns), seen from the prompt’s side.

## Intuition
An assembly line beats a single craftsman when the product is complex and consistent: each station does one thing well, and inspection happens between stations instead of only at the end.

```viz
{"id":"chain-patterns","component":"diagram","title":"Four chain shapes: in sequence, by branch, in a critique loop, and one model writing another’s prompt","caption":"Switch tabs. Plain boxes are code; hexagons are model calls. Notes say when each shape fits.","alt":"Diagram variants of prompt chains: a pipeline, a router, a generator and critic loop, and meta-prompting.","data":"illustrative","w":560,"h":140,"variants":[
{"name":"Pipeline","note":"Fixed steps with code checks between them. Use when a task decomposes into stages, such as extract, validate, transform and format.","nodes":[{"id":"x","label":"Extract","role":"model","x":0,"y":42,"w":120,"h":56},{"id":"v","label":"Validate","sub":"code","x":146,"y":42,"w":120,"h":56},{"id":"t","label":"Transform","role":"model","x":292,"y":42,"w":120,"h":56},{"id":"f","label":"Format","sub":"code","x":438,"y":42,"w":122,"h":56}],"edges":[{"from":"x","to":"v"},{"from":"v","to":"t","label":"pass"},{"from":"t","to":"f"}]},
{"name":"Router","note":"A first call classifies the input and picks a specialized prompt, often sending easy cases to a cheaper model.","nodes":[{"id":"in","label":"Input","role":"human","x":0,"y":42,"w":100,"h":56},{"id":"r","label":"Classify","role":"model","x":140,"y":42,"w":120,"h":56},{"id":"a","label":"Prompt A","role":"model","x":320,"y":0,"w":120,"h":44},{"id":"b","label":"Prompt B","role":"model","x":320,"y":96,"w":120,"h":44}],"edges":[{"from":"in","to":"r"},{"from":"r","to":"a"},{"from":"r","to":"b"}]},
{"name":"Generator and critic","note":"One prompt drafts, another reviews against explicit criteria; repeat until the critique passes or a limit is reached.","nodes":[{"id":"g","label":"Generate","role":"model","x":60,"y":42,"w":150,"h":56},{"id":"c","label":"Critique","sub":"against criteria","role":"model","x":330,"y":42,"w":160,"h":56}],"edges":[{"from":"g","to":"c","label":"draft"},{"from":"c","to":"g","curve":50,"label":"feedback"}]},
{"name":"Meta-prompting","note":"A model writes or refines the prompt another step will use, for example turning a task description into a detailed instruction set. Evaluate the generated prompt like any other.","nodes":[{"id":"task","label":"Task description","role":"human","x":0,"y":42,"w":150,"h":56},{"id":"m","label":"Prompt writer","role":"model","x":200,"y":42,"w":150,"h":56},{"id":"w","label":"Worker","sub":"uses the prompt","role":"model","x":410,"y":42,"w":150,"h":56}],"edges":[{"from":"task","to":"m"},{"from":"m","to":"w","label":"prompt"}]}]}
```

## How it works
**Pipelines.** Each step’s output is the next step’s input. Put deterministic checks between steps: schema validation, length limits, required fields, allowed values. A failed check can retry the step, take a fallback path or stop.

**Routers.** Classify first, then dispatch. The classifier can be a small model, an embedding similarity or plain rules; each branch gets a prompt tuned for its case.

**Generator and critic.** A critic with explicit criteria (a style guide, a checklist, a rubric) catches what the generator missed. Cap the iterations and keep the best draft, not just the last. See [LLM-as-judge](#llm-as-judge) for writing good criteria.

**Meta-prompting.** Use a model to draft prompts, examples or rubrics for other steps, then test those prompts on your eval set. Prompt optimizers automate this. See [prompt optimization](#prompt-optimization).

**Templates and variables.** Store each step’s prompt as a named, versioned template with explicit slots, not as strings assembled in code. It makes steps reusable, reviewable and testable. See [prompt management](#prompt-config-management).

## In practice
```viz
{"id":"monolith-compare","component":"compare","title":"One prompt that does everything versus three steps you can test one by one","caption":"Hover the marks. The chained version costs more calls and is far easier to debug and improve.","alt":"Comparison of a single monolithic prompt and a three-step chain for processing support emails.","data":"illustrative","a":{"title":"One prompt","text":"Read this support email, work out the\ncustomer, the product and the problem,\ndecide if it is urgent, check it against\nour refund policy, draft a reply and\nreturn everything as JSON.\n(When the reply is wrong, which part\n failed?)"},"b":{"title":"Three steps","text":"1. extract(email) -> {customer, product,\n   problem}            # check: schema\n2. classify(problem) -> urgency + policy\n   section             # check: allowed values\n3. draft(fields, policy_text) -> reply\n                       # check: length, tone\n(Each step has its own eval set.)"},"links":[{"a":"work out the\ncustomer, the product and the problem,","b":"1. extract(email) -> {customer, product,\n   problem}","note":"Extraction alone is easy to test against labeled emails."},{"a":"decide if it is urgent, check it against\nour refund policy,","b":"2. classify(problem) -> urgency + policy\n   section","note":"Classification can use a cheaper model and a fixed label set."},{"a":"(When the reply is wrong, which part\n failed?)","b":"(Each step has its own eval set.)","note":"Per-step evals turn a vague failure into a specific fix."}]}
```

```python
# Pseudocode: a pipeline with code gates.
fields = extract(email)                                   # model call 1
if not schema_ok(fields): fields = extract(email, retry_with_errors=True)
label = classify(fields["problem"], model=SMALL_MODEL)    # model call 2
if label not in ALLOWED_LABELS: label = "needs-human"
reply = draft(fields, policy_text(label))                 # model call 3
```

## Numbers to know
> [!number]
> Rules of thumb. Each chained step adds a model call of latency, often a second or more. Cheap steps such as classification can run on small models at a fraction of the cost. A chain of three to five steps is common; beyond that, consider an agent or a workflow engine.

## Pitfalls and anti-patterns
> [!pitfall] Chains without gates
> Passing one model’s output straight into the next without checks means errors compound silently through every step.

- **Over-chaining.** Splitting trivial tasks adds latency and cost for no gain.
- **Losing context between steps.** Pass forward what later steps need, explicitly.
- **Unbounded critique loops.** Cap iterations and keep the best result.

## Talk like an expert
The vocabulary: **prompt chain**, **pipeline**, **gate**, **router**, **generator and critic**, **meta-prompting**, **prompt template**. Experts ask “can I test this step on its own?” and split until the answer is yes. The live debate is whether strong models make chains unnecessary for tasks they can do in one shot; testability often keeps the chain anyway.

> [!hottake] Most production prompts should be chains, because testability beats elegance.
> **The counterargument:** each split adds latency and loses some context the model would have used holistically; for tasks a strong model does reliably in one call, a single prompt with a structured output is simpler and better.

## Check yourself
```quiz
prompt-chaining
```

## Go deeper
- Anthropic, “Building effective agents” (December 2024), on prompt chaining as a workflow pattern.
- Your provider’s documentation on chaining prompts and structured outputs.

## Related
- [Workflow patterns](#workflow-patterns)
- [Prompting fundamentals](#prompting-fundamentals)
- [Structured outputs](#structured-outputs)
- [Prompt and config management](#prompt-config-management)
- [Reasoning prompts](#reasoning-prompts)
