---
id: incidents-on-call
book: 16
order: "16.10"
title: Incidents and on-call
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [incidents, runbooks, postmortems]
visuals:
  - incident-flow:stepper
  - severity-tree:tree
---
> [!tldr]
> AI incidents include the usual outages and some new kinds: quality regressions without errors, harmful or embarrassing outputs, data leaks through prompts or tools, runaway agents and cost spikes. Detect them with quality and cost signals as well as errors, mitigate with rollbacks, kill switches and fallbacks, and end every incident with eval cases.

## Why it matters
An AI system can be “up” while giving wrong refund amounts to thousands of customers, or an agent can loop all night on a customer’s account. Standard incident processes catch outages; AI incidents need extra detection, mitigation levers and follow-up. Companies have also been held responsible for what their chatbots said: in Moffatt v. Air Canada (2024), a tribunal held the airline liable for its chatbot’s wrong statement about bereavement fares.

## Intuition
On-call for AI is like being the duty manager of a restaurant whose chef is brilliant and occasionally confidently wrong. You watch the dishes, not just whether the kitchen lights are on, and you can take a dish off the menu in seconds.

```viz
{"id":"incident-flow","component":"stepper","title":"From the first alert to new eval cases in seven steps","caption":"Step through an illustrative quality incident: a model provider update changes behavior, refund answers go wrong, and the team rolls back.","alt":"Stepper through an AI incident: detection, triage, mitigation, communication, resolution, postmortem and new eval cases.","data":"illustrative","diagram":{"w":600,"h":56,"nodes":[{"id":"detect","label":"Detect","role":"data","align":"center","glyph":false,"x":0,"y":0,"w":76,"h":56},{"id":"triage","label":"Triage","role":"agent","align":"center","glyph":false,"x":87,"y":0,"w":76,"h":56},{"id":"mitigate","label":"Mitigate","role":"tool","align":"center","glyph":false,"x":174,"y":0,"w":76,"h":56},{"id":"comms","label":"Tell","role":"human","align":"center","glyph":false,"x":261,"y":0,"w":76,"h":56},{"id":"resolve","label":"Resolve","role":"tool","align":"center","glyph":false,"x":348,"y":0,"w":76,"h":56},{"id":"pm","label":"Review","role":"human","align":"center","glyph":false,"x":435,"y":0,"w":76,"h":56},{"id":"evals","label":"Eval\ncases","role":"data","align":"center","glyph":false,"x":522,"y":0,"w":78,"h":56}],"edges":[{"from":"detect","to":"triage"},{"from":"triage","to":"mitigate"},{"from":"mitigate","to":"comms"},{"from":"comms","to":"resolve"},{"from":"resolve","to":"pm"},{"from":"pm","to":"evals"}]},
"frames":[
{"label":"Detect","highlight":["detect"],"caption":"An alert fires: the sampled faithfulness score for refund answers drops from 0.94 to 0.71 in two hours, with no rise in errors."},
{"label":"Triage","highlight":["triage"],"caption":"Traces show the drop began when the provider’s model alias moved to a new version. Users are receiving wrong refund amounts. Severity: high."},
{"label":"Mitigate","highlight":["mitigate"],"caption":"Pin the previous model version in the gateway and disable automatic refund offers behind a feature flag. Quality recovers within minutes."},
{"label":"Communicate","highlight":["comms"],"caption":"Notify support leads, publish a status update, and identify the affected customers from traces."},
{"label":"Resolve","highlight":["resolve"],"caption":"Contact affected customers and correct the wrong offers. Test the new model version against the eval suite before re-enabling it."},
{"label":"Review","highlight":["pm"],"caption":"A blameless review finds two causes: an unpinned model alias, and no refund-accuracy check in the release gates."},
{"label":"Eval cases","highlight":["evals"],"caption":"Twelve failing conversations become regression cases; model versions are pinned; the refund slice gets a release threshold."}]}
```

## How it works
**Kinds of AI incidents.** Outages and latency (provider down, capacity exhausted); silent quality regressions (model updates, prompt changes, retrieval bugs); harmful or embarrassing outputs; data exposure (leaked prompts, cross-tenant retrieval, injection-driven exfiltration); unsafe agent actions; and cost incidents (runaway loops, abuse).

**Detection.** Error and latency alerts, plus quality signals (sampled judge scores, citation validity, refusal rates, user feedback), cost and token anomalies per tenant, safety classifier hit rates, and user reports. See [online evaluation](#online-evaluation).

**Severity.** Classify by harm and breadth:

```viz
{"id":"severity-tree","component":"tree","title":"Severity depends on harm and breadth, not on whether anything crashed","caption":"An illustrative severity scheme. Adapt the levels to your product; agree on them before you need them.","alt":"Tree of AI incident severity levels with examples from data exposure to single bad answers.","data":"illustrative","open":1,"root":{"label":"How severe is it?","children":[
{"label":"SEV 1: critical","children":[{"label":"Data exposure across users or tenants; harmful outputs or unsafe actions at scale; full outage","link":"#privacy"}]},
{"label":"SEV 2: major","children":[{"label":"Wrong answers on a high-stakes slice; cost spike threatening budgets; major feature down","link":"#cost-capacity"}]},
{"label":"SEV 3: moderate","children":[{"label":"Noticeable quality drop on a minor feature; degraded latency; a contained harmful output"}]},
{"label":"SEV 4: minor","children":[{"label":"Isolated bad answers; cosmetic issues. Log it, add an eval case"}]}]}}
```

**Mitigation levers.** Prepare them in advance: roll back a prompt or model version; switch providers; disable a feature, tool or connector with a flag; tighten guardrails; lower autonomy (require approvals); stop agents with a kill switch; rate-limit or block abusive tenants. See [guardrails](#guardrails-control) and [prompt management](#prompt-config-management).

**Runbooks.** Write them for the predictable cases: provider outage, quality regression, prompt injection report, data exposure, runaway agent, cost spike. Each says how to confirm, what to switch, whom to tell.

**Blameless reviews and follow-up.** Find causes in systems, not people; add eval cases for every failure; fix the gate that should have caught it. See [CI/CD for AI](#ci-cd-for-ai).

## In practice
On-call readiness checklist:
- Quality, cost and safety alerts alongside errors and latency.
- Feature flags and kill switches for every AI feature, tool and agent.
- Pinned model versions and one-step rollback.
- Runbooks for the six common AI incident types.
- Traces with versions, so you can find affected users quickly.
- A review template that ends with new eval cases and gate changes.

## Numbers to know
> [!number]
> Rules of thumb. Quality regressions often show up in sampled scores within an hour if sampling covers the affected slice. A kill switch or flag should take effect in under a minute; test it regularly.

## Pitfalls and anti-patterns
> [!pitfall] Alerting only on errors
> The most damaging AI incidents return HTTP 200 with confident, wrong content.

- **No kill switch.** A runaway agent cannot wait for a deploy.
- **Unpinned models.** Provider updates become your incidents.
- **Reviews without eval cases.** The same failure returns.

## Talk like an expert
The vocabulary: **severity**, **silent regression**, **kill switch**, **feature flag**, **rollback**, **runbook**, **blameless postmortem**, **blast radius**, **time to mitigate**. Experts measure time to detect and time to mitigate quality incidents, not just outages. The live debate is how to detect subtle harms quickly at scale without reviewing every conversation.

> [!hottake] Every AI feature should ship with its off switch.
> **The counterargument:** switching a feature off is itself a user-facing incident; for core features, graceful degradation to a simpler mode usually serves users better than a hard off.

## Check yourself
```quiz
incidents-on-call
```

## Go deeper
- Google’s *Site Reliability Engineering* book, chapters on incident management and postmortems.
- The AI Incident Database, for public examples of AI failures.

## Related
- [Reliability engineering](#reliability-engineering)
- [Online evaluation](#online-evaluation)
- [Guardrails and control](#guardrails-control)
- [CI/CD for AI](#ci-cd-for-ai)
- [Observability and tracing](#observability-tracing)
- [SLOs and error budgets for AI systems](#slos-error-budgets)
- [Public AI failures and incidents: a casebook](#ai-failure-casebook)
- [Field note: three infrastructure bugs that degraded Claude's answers](#claude-quality-bugs-2025)
- [Playbook: RCAgent: root cause analysis of Flink jobs with a locally hosted LLM agent](#alibaba-rcagent-root-cause)
- [Playbook: Xpert: recommending the first incident query to Microsoft's on-call engineers](#microsoft-xpert-incident-queries)
- [Playbook: Ramp Sheets: agents that write monitors, triage alerts and propose fixes](#ramp-sheets-self-maintaining)
- [Playbook: Zalando: mining incident postmortems with a multi-stage LLM pipeline](#zalando-postmortem-analysis)
