---
id: support-agents
book: 10
order: "10.5"
title: Customer-support and enterprise workflow agents
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [support, enterprise, policy]
visuals:
  - support-flow:diagram
  - handoff-compare:compare
---
> [!tldr]
> Support and workflow agents answer questions from policy and knowledge bases, act through business systems within policy limits, and hand off to people with full context when they should. Success is measured by resolution quality, not just deflection, and the company is responsible for what the agent says.

## Why it matters
Customer support is one of the largest deployments of AI agents, with clear economics and visible risks. A good support agent resolves routine issues instantly at any hour; a bad one invents policies, traps customers in loops and creates legal exposure. In Moffatt v. Air Canada (2024), a tribunal held the airline responsible for its chatbot’s incorrect statement about refunds.

## Intuition
A support agent is a new hire on the help desk with access to the policy binder and a few systems. They should solve what the binder covers, ask a supervisor when it does not, and never promise what the policy does not allow.

```viz
{"id":"support-flow","component":"diagram","title":"Resolve within policy, escalate with context, and sample everything for quality","caption":"An illustrative support agent architecture. Click a component for the chapter behind it.","alt":"Diagram of a support agent: inbound channels, classification and retrieval, an agent with policy-limited tools, a policy and confidence check, resolution or escalation to a human with a summary, and quality sampling.","data":"illustrative","w":600,"h":230,"nodes":[
{"id":"in","label":"Chat, email, voice","role":"human","x":0,"y":80,"w":120,"h":56,"link":"#voice-agents"},
{"id":"ctx","label":"Classify and retrieve","sub":"intent, account, policy","role":"data","x":150,"y":80,"w":140,"h":56,"link":"#rag-fundamentals"},
{"id":"agent","label":"Agent with tools","sub":"lookup, refund up to limit","role":"agent","x":320,"y":80,"w":140,"h":56,"link":"#agent-tools"},
{"id":"resolve","label":"Resolve","role":"data","x":490,"y":0,"w":110,"h":56},
{"id":"human","label":"Human agent","sub":"with summary","role":"human","x":490,"y":160,"w":110,"h":56,"link":"#human-in-the-loop"},
{"id":"qa","label":"Quality sampling","role":"tool","x":320,"y":180,"w":140,"h":46,"link":"#online-evaluation"}],
"edges":[{"from":"in","to":"ctx"},{"from":"ctx","to":"agent"},{"from":"agent","to":"resolve","label":"within policy"},{"from":"agent","to":"human","label":"escalate"},{"from":"agent","to":"qa","style":"dashed"}]}
```

## How it works
**Knowledge and policy.** Retrieve from help articles, policies and past resolutions, with citations, and answer “not covered” when they are silent. See [grounding](#grounding-citations).

**Actions within limits.** Tools for order lookup, account changes and refunds, with hard limits in code (refunds up to an amount, only for eligible orders) and approvals above them. See [guardrails](#guardrails-control).

**Escalation.** Hand off when the customer asks, when confidence or policy coverage is low, for sensitive topics, or after repeated failure. The handoff includes a summary, what was tried and what is needed, so the customer does not repeat themselves.

**Enterprise workflow agents.** The same pattern covers internal requests: IT tickets, HR questions, procurement and finance operations, usually with stronger identity and permission requirements. See [enterprise readiness](#enterprise-readiness).

**Metrics.** Resolution rate with quality checks (not deflection alone), customer satisfaction, escalation rate and quality, handle time, policy-violation rate from sampled reviews, and cost per resolution.

## In practice
```viz
{"id":"handoff-compare","component":"compare","title":"A handoff that makes the customer start over versus one that lets the human finish the job","caption":"Hover the marks. The second costs a few tokens and saves minutes of the customer’s and agent’s time.","alt":"Comparison of a bare escalation message and an escalation with a structured summary for the human agent.","data":"illustrative","mono":false,"a":{"title":"Bare handoff","text":"Transferring you to an agent. Please describe your issue.","mono":false},"b":{"title":"Handoff with context","text":"To the human agent: Customer Dana R., order 2291. Charged twice on 2 November; duplicate confirmed in billing. Refund of $42.10 is above my automatic limit of $25 for this customer tier. Customer prefers a refund to card, not credit. Policy section 4.2 applies.\nTo the customer: I’ve passed this to a colleague with everything we discussed; they can issue the refund directly.","mono":false},"links":[{"a":"Please describe your issue.","b":"Charged twice on 2 November; duplicate confirmed in billing.","note":"The human starts from the facts, not from zero."},{"b":"above my automatic limit of $25","note":"States exactly why the agent could not finish."},{"b":"they can issue the refund directly.","note":"Sets the customer’s expectation honestly."}]}
```

Launch checklist:
- Answers grounded in current policy with citations; “not covered” allowed.
- Action limits enforced in code; approvals above them.
- Escalation on request, low confidence, sensitive topics and loops, with summaries.
- Sampled human review of resolved conversations for policy violations.
- Evals built from real tickets, including angry, ambiguous and multi-issue ones. See [eval recipes](#eval-recipes).

## Numbers to know
> [!number]
> Rules of thumb. Track resolution quality on a sample, not just containment. A customer who must repeat everything after a handoff is a failed resolution even if the human fixes it.

## Pitfalls and anti-patterns
> [!pitfall] Optimizing for deflection
> Keeping customers away from humans looks efficient until churn and complaints rise. Measure resolved, satisfied customers.

- **Policy in the prompt only.** Limits belong in tools and code.
- **No way to reach a human.** Frustration and, in some jurisdictions, compliance problems.
- **Stale knowledge bases.** The agent repeats last year’s policy confidently.

## Talk like an expert
The vocabulary: **resolution rate**, **containment** or **deflection**, **escalation**, **warm handoff**, **policy limits**, **CSAT**, **cost per resolution**, **QA sampling**. Experts report resolution quality and escalation quality alongside cost. The live debate is how far to automate: some companies that pushed hard toward full automation later re-emphasized access to human agents.

> [!hottake] The best support agents are judged by their handoffs, not by how rarely they make them.
> **The counterargument:** every unnecessary escalation costs real money and wait time; for routine, well-covered issues, end-to-end automation is the better customer experience.

## Check yourself
```quiz
support-agents
```

## Go deeper
- Moffatt v. Air Canada, 2024 BCCRT 149, the British Columbia Civil Resolution Tribunal decision.
- Yao et al., “τ-bench” (2024), for evaluating tool-using customer agents with simulated users.

## Related
- [Human in the loop](#human-in-the-loop)
- [Grounding and citations](#grounding-citations)
- [Voice and realtime agents](#voice-agents)
- [Evaluating agents](#evaluating-agents)
- [Guardrails and control](#guardrails-control)
- [Telephony and transport for voice agents](#voice-telephony)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Task-oriented dialogue: from intents and slots to LLM agents](#dialogue-systems)
