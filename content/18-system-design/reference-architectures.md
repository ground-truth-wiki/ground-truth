---
id: reference-architectures
book: 18
order: "18.2"
title: Reference architectures
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [blueprints, architecture, case-studies]
visuals:
  - blueprint-gallery:diagram
  - blueprint-index:tree
---
> [!tldr]
> Twelve blueprints cover most AI products: RAG assistant, coding agent, support agent, document extraction, deep research, voice agent, analyst agent, personal assistant, background agent, multi-tenant copilot, on-device hybrid and an eval-and-data platform. Each is a starting design with its key components and risks; adapt it with the system design method.

## Why it matters
Most new AI projects resemble one of a dozen shapes. Starting from the right blueprint avoids reinventing the basics and highlights the risks specific to that shape, from permissions in RAG to sandboxes in coding agents.

## Intuition
Architects keep pattern books: a library, a clinic, a school. Every building is different, but each starts from a plan that already solves the common problems of its type.

```viz
{"id":"blueprint-gallery","component":"diagram","title":"Six of the twelve blueprints, each as its core request path","caption":"Switch tabs. Each variant shows the minimum components; the index below links all twelve to their chapters.","alt":"Diagram variants of six reference blueprints: RAG assistant, coding agent, support agent, document extraction, deep research and voice agent.","data":"illustrative","w":560,"h":120,"variants":[
{"name":"RAG assistant","note":"Permission-filtered hybrid retrieval, reranking, cited answers, faithfulness checks. Key risk: permissions and stale content.","nodes":[{"id":"q","label":"Question","role":"human","x":0,"y":32,"w":100,"h":56},{"id":"r","label":"Filtered retrieval","role":"data","x":130,"y":32,"w":130,"h":56,"link":"#production-rag"},{"id":"g","label":"Answer + cite","role":"model","x":290,"y":32,"w":120,"h":56},{"id":"c","label":"Check","role":"tool","x":440,"y":32,"w":120,"h":56,"link":"#grounding-citations"}],"edges":[{"from":"q","to":"r"},{"from":"r","to":"g"},{"from":"g","to":"c"}]},
{"name":"Coding agent","note":"Agent loop with file, search and test tools in a sandbox; pull request for review. Key risk: credentials and unreviewed code.","nodes":[{"id":"t","label":"Task","role":"human","x":0,"y":32,"w":100,"h":56},{"id":"a","label":"Agent loop","role":"agent","x":130,"y":32,"w":130,"h":56,"link":"#coding-agents"},{"id":"s","label":"Sandbox + tests","role":"tool","x":290,"y":32,"w":130,"h":56,"link":"#sandboxes"},{"id":"pr","label":"Pull request","role":"data","x":450,"y":32,"w":110,"h":56}],"edges":[{"from":"t","to":"a"},{"from":"a","to":"s","both":true},{"from":"a","to":"pr"}]},
{"name":"Support agent","note":"Policy retrieval, tools with hard limits, escalation with context, QA sampling. Key risk: invented policy.","nodes":[{"id":"c","label":"Customer","role":"human","x":0,"y":32,"w":100,"h":56},{"id":"a","label":"Agent + policy","role":"agent","x":130,"y":32,"w":140,"h":56,"link":"#support-agents"},{"id":"t","label":"Limited tools","role":"tool","x":300,"y":0,"w":120,"h":44},{"id":"h","label":"Human handoff","role":"human","x":300,"y":76,"w":120,"h":44}],"edges":[{"from":"c","to":"a"},{"from":"a","to":"t"},{"from":"a","to":"h"}]},
{"name":"Document extraction","note":"Classify, parse, extract to schema, validate, route low confidence to review. Key risk: plausible misreads.","nodes":[{"id":"d","label":"Documents","role":"data","x":0,"y":32,"w":100,"h":56},{"id":"x","label":"Parse + extract","role":"model","x":130,"y":32,"w":130,"h":56,"link":"#document-extraction"},{"id":"v","label":"Validate","role":"tool","x":290,"y":32,"w":110,"h":56},{"id":"r","label":"Review queue","role":"human","x":430,"y":32,"w":130,"h":56}],"edges":[{"from":"d","to":"x"},{"from":"x","to":"v"},{"from":"v","to":"r","label":"low confidence"}]},
{"name":"Deep research","note":"Plan, parallel subagents, evidence notes, reflection, cited report. Key risk: weak sources and unchecked citations.","nodes":[{"id":"q","label":"Question","role":"human","x":0,"y":32,"w":100,"h":56},{"id":"p","label":"Lead agent","role":"agent","x":130,"y":32,"w":120,"h":56,"link":"#deep-research"},{"id":"s","label":"Subagents","role":"tool","x":280,"y":32,"w":120,"h":56},{"id":"r","label":"Cited report","role":"data","x":430,"y":32,"w":130,"h":56}],"edges":[{"from":"q","to":"p"},{"from":"p","to":"s","both":true},{"from":"p","to":"r"}]},
{"name":"Voice agent","note":"Streaming speech in and out, turn detection, fast model, tools with filler speech. Key risk: latency and interruptions.","nodes":[{"id":"u","label":"Caller","role":"human","x":0,"y":32,"w":100,"h":56},{"id":"asr","label":"Speech in","role":"tool","x":130,"y":32,"w":110,"h":56},{"id":"m","label":"Fast model","role":"model","x":270,"y":32,"w":120,"h":56,"link":"#voice-agents"},{"id":"tts","label":"Speech out","role":"tool","x":420,"y":32,"w":140,"h":56}],"edges":[{"from":"u","to":"asr"},{"from":"asr","to":"m"},{"from":"m","to":"tts"}]}]}
```

## How it works
```viz
{"id":"blueprint-index","component":"tree","title":"All twelve blueprints with their defining component and main risk","caption":"Expand a group and follow the link to the chapter with full detail.","alt":"Tree of twelve AI reference blueprints grouped by kind, each with its defining component and main risk.","data":"illustrative","open":1,"root":{"label":"Twelve blueprints","children":[
{"label":"Knowledge","children":[{"label":"RAG assistant: permission-aware retrieval; risk: leaks and stale content","link":"#production-rag"},{"label":"Deep research: evidence notes; risk: unchecked citations","link":"#deep-research"},{"label":"Analyst agent: sandboxed code over data; risk: unverified numbers","link":"#research-analyst-agents"}]},
{"label":"Action","children":[{"label":"Coding agent: sandbox and tests; risk: credentials, unreviewed code","link":"#coding-agents"},{"label":"Support agent: limits in tools; risk: invented policy","link":"#support-agents"},{"label":"Personal assistant: per-source permissions; risk: injection via inbox","link":"#personal-assistants"},{"label":"Background agent: durable execution; risk: silent failures","link":"#long-running-agents"}]},
{"label":"Processing","children":[{"label":"Document extraction: validation and review; risk: plausible misreads","link":"#document-extraction"},{"label":"Voice agent: streaming pipeline; risk: latency","link":"#voice-agents"}]},
{"label":"Platform","children":[{"label":"Multi-tenant copilot: tenant isolation and budgets; risk: cross-tenant leaks","link":"#enterprise-readiness"},{"label":"On-device hybrid: local model plus cloud fallback; risk: device limits","link":"#edge-on-device"},{"label":"Eval and data platform: traces to cases to gates; risk: unowned curation","link":"#data-flywheel"}]}]}}
```

**Shared backbone.** Every blueprint sits on the same backbone: API gateway, orchestrator, model gateway, observability and evals. See [reference architecture](#reference-architecture).

**What differs.** The defining component (retrieval, sandbox, tool limits, validation, streaming) and the dominant risk, which decides where you spend design effort.

## In practice
1. Pick the closest blueprint, or combine two (a support agent with a RAG assistant inside it is common).
2. Run the [system design method](#system-design-method) over it with your requirements.
3. Spend most design time on the blueprint’s defining component and main risk.

## Numbers to know
> [!number]
> Rule of thumb: most products are one blueprint plus parts of a second. If yours needs four, the scope is probably several products.

## Pitfalls and anti-patterns
> [!pitfall] Copying a blueprint without its safeguards
> Taking the request path but not the permissions, validation or sandbox that makes it safe.

- **Forcing a blueprint that does not fit.** Use the design method when none does.

## Talk like an expert
The vocabulary: **blueprint**, **request path**, **defining component**, **dominant risk**, **shared backbone**, **composition**. Experts name the blueprint first and then the deviations. The live debate is whether agent platforms will turn these blueprints into configurable products.

> [!hottake] Twelve blueprints cover nine in ten AI products.
> **The counterargument:** the most valuable products often combine capabilities in new ways that no catalog anticipates, and starting from a blueprint can anchor teams on a familiar but suboptimal design.

## Check yourself
```quiz
reference-architectures
```

## Go deeper
- Each linked chapter for the full design of its blueprint.

## Related
- [Reference architecture](#reference-architecture)
- [The AI system design method](#system-design-method)
- [Decision guides](#decision-guides)
- [Back-of-the-envelope estimation](#back-of-envelope)
- [Lessons from public engineering write-ups](#public-writeups)
- [Guard models and content moderation](#guard-models-moderation)
- [Worked AI system design interview answers](#system-design-interview-answers)
