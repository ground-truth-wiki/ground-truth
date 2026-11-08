---
id: prompt-config-management
book: 16
order: "16.5"
title: Prompt and config management
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [versioning, prompts, feature-flags]
visuals:
  - prompt-registry:diagram
  - config-compare:compare
---
> [!tldr]
> Prompts, model choices and parameters are production configuration. Version them, review them, test them with evals before promotion, deploy them through environments, roll them out gradually, and tag every trace with the version that produced it.

## Why it matters
A one-word prompt change can move quality more than a week of code changes, and it often ships with less review. When prompts live as strings scattered through code, nobody knows which version is running, why answers changed, or how to roll back. Treating them as configuration with a lifecycle fixes all three.

## Intuition
Prompts are like recipes in a restaurant chain. A head office keeps the master versions, tests changes in one kitchen before rolling them out, and every dish served can be traced to the recipe version that made it.

```viz
{"id":"prompt-registry","component":"diagram","title":"A prompt version moves from a pull request through eval gates to production, and every trace remembers it","caption":"Click a stage for the chapter behind it. Rollback is changing which version an environment points at.","alt":"Diagram of a prompt lifecycle: authored in a repository or registry, evaluated, promoted through environments, fetched at runtime and recorded on traces.","data":"illustrative","w":600,"h":210,"nodes":[
{"id":"repo","label":"Repository or registry","sub":"templates, models, params","role":"data","x":0,"y":0,"w":170,"h":56},
{"id":"eval","label":"Eval gate","sub":"offline suite","role":"tool","x":215,"y":0,"w":170,"h":56,"link":"#ci-cd-for-ai"},
{"id":"staging","label":"Staging","sub":"answer-v15","role":"agent","x":430,"y":0,"w":170,"h":56},
{"id":"prod","label":"Production","sub":"answer-v14, canary v15","role":"agent","x":430,"y":150,"w":170,"h":56,"link":"#online-evaluation"},
{"id":"runtime","label":"Runtime fetch","sub":"cached, version pinned","role":"model","x":215,"y":150,"w":170,"h":56},
{"id":"traces","label":"Traces","sub":"tagged with version","role":"data","x":0,"y":150,"w":170,"h":56,"link":"#observability-tracing"}],
"edges":[{"from":"repo","to":"eval"},{"from":"eval","to":"staging","label":"pass"},{"from":"staging","to":"prod","label":"promote"},{"from":"prod","to":"runtime"},{"from":"runtime","to":"traces"}]}
```

## How it works
**What counts as configuration.** Prompt templates, system prompts, few-shot examples, tool descriptions, model and provider choices, sampling parameters, reasoning effort, retrieval settings (k, filters, reranker), guardrail thresholds and feature flags.

**Where it lives.** Either in the code repository as files reviewed with pull requests, or in a prompt registry (many observability and eval platforms include one) that non-engineers can edit with versioning and approvals. Both work; the requirement is versions, review and history.

**Environments and promotion.** Development, staging and production point to specific versions. Promotion requires passing evals; production changes roll out as canaries or A/B tests. See [CI/CD for AI](#ci-cd-for-ai).

**Runtime behavior.** Fetch configuration at startup or with short caching, pin versions explicitly, and fail safe if the registry is unreachable. Tag every trace with the versions used. See [observability](#observability-tracing).

**Experimentation.** Running two prompt versions side by side for a share of traffic is just a feature flag with an eval attached. See [online evaluation](#online-evaluation).

## In practice
```viz
{"id":"config-compare","component":"compare","title":"A prompt buried in code versus a versioned, reviewable config","caption":"Hover the marks. The second version can be diffed, evaluated, rolled back and traced.","alt":"Comparison of a prompt hard-coded in application code and the same prompt as a versioned configuration file.","data":"illustrative","a":{"title":"Hard-coded","text":"def answer(q, docs):\n    return client.messages.create(\n        model='model-x-latest',\n        temperature=0.7,\n        system='You are a helpful assistant. '\n               'Answer using the docs.',\n        messages=[...])"},"b":{"title":"Versioned config","text":"# prompts/answer.yaml\nid: answer\nversion: 14\nmodel: provider/model-x-2026-09\nparams: {temperature: 0.2, max_tokens: 800}\nsystem: |\n  You answer HR policy questions for\n  employees using only <docs>. Quote the\n  passage you rely on. If the docs do not\n  cover it, say so.\nevals: {suite: hr-answers, min_pass: 0.88}\nowner: support-ai@company"},"links":[{"a":"model='model-x-latest',","b":"model: provider/model-x-2026-09","note":"Pin a dated model version; “latest” changes under you."},{"a":"temperature=0.7,","b":"params: {temperature: 0.2, max_tokens: 800}","note":"Parameters are part of the prompt’s behavior; version them together."},{"b":"version: 14","note":"Every trace records this, so a quality change can be tied to a version."},{"b":"evals: {suite: hr-answers, min_pass: 0.88}","note":"The gate that must pass before this version is promoted."},{"b":"owner: support-ai@company","note":"Someone is accountable for changes."}]}
```

Rules:
- Pin model versions; avoid aliases such as “latest” in production.
- Review prompt changes like code changes, with eval results attached.
- Keep prompts, parameters and model choice in one versioned unit.
- Make rollback a one-line change.
- Record which version produced every output.

## Numbers to know
> [!number]
> Rules of thumb. Treat any prompt change as a deploy: it needs evals and a rollback plan. Short configuration caches (seconds to minutes) balance fast rollouts with resilience to registry outages.

## Pitfalls and anti-patterns
> [!pitfall] Editing production prompts live without evals
> A quick fix for one complaint can silently break a dozen other cases.

- **Model aliases in production.** Provider updates change behavior without a deploy.
- **Prompts split across code and dashboards.** Nobody knows the true current version.
- **No owner.** Unowned prompts drift and accumulate contradictions.

## Talk like an expert
The vocabulary: **prompt registry**, **prompt version**, **environment**, **promotion**, **eval gate**, **pinned model version**, **feature flag**, **rollback**. Experts can answer “which prompt and model produced this output?” for any trace. The live debate is where prompts should live: in code for engineering rigor, or in registries so domain experts can edit them.

> [!hottake] Prompts belong in the repository, reviewed like code.
> **The counterargument:** domain experts write many of the best prompts and should not need git; a registry with versioning, approvals and eval gates gives the same rigor with a better workflow for them.

## Check yourself
```quiz
prompt-config-management
```

## Go deeper
- Your eval or observability platform’s prompt-management documentation.
- The [CI/CD for AI](#ci-cd-for-ai) chapter for gates and rollouts.

## Related
- [CI/CD for AI](#ci-cd-for-ai)
- [Observability and tracing](#observability-tracing)
- [Prompting fundamentals](#prompting-fundamentals)
- [Online evaluation](#online-evaluation)
- [Model-specific notes](#model-specific-notes)
