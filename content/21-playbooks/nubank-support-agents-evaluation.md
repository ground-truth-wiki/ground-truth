---
id: nubank-support-agents-evaluation
book: 21
order: "21.41"
title: "Nubank: customer-support agents built around evaluation"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [finance, customer-support, llm-as-judge, prompt-optimization, public-record]
visuals: []
type: playbook
account: public-record
industry: "Financial services (digital banking)"
use_case: "LLM agents that handle customer-support contacts about card delivery, debt, credit limits, card management and products, with handoff to human agents"
outcome: "Card-delivery agent: AI tNPS up 37 p.p. and self-service rate up 29 p.p. in online A/B tests; final AI tNPS 10 p.p. lower than expert human agents"
measured_how: "Online A/B tests of card-delivery agent variants against a legacy support solution, each launched at 1% of traffic, plus LLM-judge evals on analyst-labeled samples; sample sizes, period and absolute scores not stated (Nubank paper, arXiv and KDD '26, June 2026)"
prerequisites: [support-agents, llm-as-judge]
replications: []
---
> [!tldr]
> Nubank, which its paper calls "a company with 100m+ users", built LLM customer-support agents through a loop of modular prompts, calibrated LLM judges and staged A/B tests. For the card-delivery agent, the team reports a 37 p.p. gain in AI transactional NPS and a 29 p.p. gain in self-service rate, with AI tNPS 10 p.p. below expert human agents. Sample sizes, test dates and absolute scores are not published.

> [!note] From the public record
> Built from Nubank's own published account, "Building Customer Support AI Agents at 100M-User Scale: An Evaluation-Driven Framework" (June 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The paper argues that [support agents](#support-agents) face a stricter bar than many research or coding settings: "In CS, failure is costly: a single poor interaction can erode trust and drive churn." It says CS agents work on real customer data, typically use a small toolset ("often 5–15 tools") but face many edge cases, and must hand over to a human with context intact.

The case study is a card-delivery agent, "one of the highest-volume intents at our organization", which answers "Where is my card?" questions.

## Why this approach

- **Agents, with code where steps are fixed.** The agents "adhere closely to the ReACT framework", with guardrails and mandatory compliance checks added. Fixed multi-source lookups go into one composite tool, not the model.
- **Infrastructure first.** The paper calls starting with prompts a common failure mode: "the data and action layers should be established first".
- **Evaluation quality sets the pace.** "A central insight is that evaluation-pipeline quality directly determines iteration velocity." Judge prompts are optimized automatically; the paper's background notes that "Manual prompt engineering is labor-intensive and brittle". See [Prompt optimization](#prompt-optimization).

## The approach

1. **Modular context.** Instructions, routines, macros (response templates), tool specifications and a working-memory scratchpad are versioned separately and combined per configuration. Routines are translated from the procedures written for human agents. See [Context engineering](#context-engineering).
2. **Tools written like prompts.** Each tool states when not to call it and returns only the fields the model needs; action tools are safe to call again. See [Tool use and tool design](#agent-tools).
3. **Labeled evals.** Three operations analysts labeled pseudonymized card-delivery conversations pass or fail on five criteria, E1 to E5, with 888, 90, 816, 246 and 90 samples. The majority vote became ground truth.
4. **Optimized judges.** GEPA, run within DSPy, rewrote the judge instructions using the analysts' rationales as feedback. Data was split 40%/30%/30%, each experiment ran five times, and results come from the held-out test set. Agreement between seven judge models was measured with Cohen's kappa. See [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation).
5. **Staged online tests.** "Each variant was launched at 1% traffic, and subsequently increased to larger percentages." Judge scores excluded weak variants. The baseline V0 had only a knowledge-base retrieval tool and a human-transfer tool; later versions added a routine, domain tools, frustration detection and card reissue, among other changes, each driven by failures the offline evals found. See [Online controlled experiments for AI features](#online-experiments).
6. **Escalation.** The agent transfers to a human when a case falls outside its routines, data retrieval fails, or its confidence is low.

## The stack

As of June 2026, the paper names:

- **Agent models:** card-delivery variants on GPT-4.1 and on GPT-5. It does not say which model the best variants use.
- **Judges:** GPT-4.1-mini as the base model, GPT-5.1 as GEPA's reflection model, GEPA in DSPy with auto=light ("approximately 500 iterations"). Agreement was checked on GPT-4o, GPT-4o-mini, GPT-4.1, GPT-4.1-mini, GPT-5, o3 and o3-mini.
- **Card-delivery tools:** get_customer_profile, check_card_delivery and reissue_card.
- **Infrastructure:** identity and authentication, idempotent action APIs, and audit trails. Third-party models run under agreements that "contractually prohibit training on Nubank data".

It names no cloud, serving stack or agent framework.

## Results, and how they were measured

**Card delivery, online.** "The AI agent delivered a 37 percentage point improvement in AI tNPS", and "we observed a 29 p.p increase in SSR". tNPS is asked right after a support interaction; SSR is the share of needs resolved without human escalation. "Notably, the AI tNPS came within 10 p.p. of the expert human-agent tNPS score." The abstract measures the gains "over prior agent variants", Section 6.3 against "our legacy customer support solution", and Figure 9 from V0. The paper says both "A/B tested 11 variants" and "10 different variants".

**Offline evals and online results.** "We observe a strong positive correlation: versions with lower eval failure rates consistently achieve higher tNPS scores". V10 and V8 showed "approximately 20 - 25 p.p. reductions in failure rate" and the highest tNPS gains, 37 p.p. relative to V0. The text says V6 "showed minimal offline improvement" and "delivered near-zero tNPS lift".

**Judges (accuracy %, held-out test set, E1 to E4; mean with 95% confidence interval over five runs).**

| Eval | Majority class | Starter prompt | GEPA-optimized |
|---|---|---|---|
| E1 | 51.11 | 77.78 ± 0.49 | 82.00 ± 0.09 |
| E2 | 77.78 | 68.88 ± 3.41 | 88.89 ± 0.00 |
| E3 | 56.62 | 58.07 ± 0.26 | 73.01 ± 0.76 |
| E4 | 51.11 | 74.00 ± 0.95 | 76.89 ± 0.79 |

On E1, kappa between the GPT-4.1 and GPT-5 families was 0.109 with the starter prompt. After optimization, GPT-4.1 and GPT-4o reached 0.895, and GPT-5 and o3 0.950.

**Five agents (online A/B tests, p.p.).**

| Use case | tNPS gain | SSR gain | AI minus human tNPS |
|---|---|---|---|
| Card delivery | +37 | +29 | −10 |
| Debt management | +40 | +2.9 | −23.6 |
| Credit limit | +4.5 | +7.5 | −7.1 |
| Card management | +38.3 | +4.8 | −1.1 |
| Product explainer | +12.3 | −1.5 | −6.2 |

**Not measured:** the paper gives no sample sizes beyond "a large number of real customer interactions", no test dates or duration, no absolute tNPS or SSR values, no significance tests for the online results and no correlation coefficient. It mentions "reduced operational costs at scale" but reports no cost figures.

## What failed

- **The hand-written judge.** On E2 the starter prompt "degraded performance to 68.88", "performing worse than the majority-class baseline". It did not separate reissue chats from status inquiries.
- **Judges that did not agree.** On E1, "The starter prompt resulted in negligible agreement across the majority of model pairs." The unoptimized GPT-4.1-mini put every test case in one class.
- **A model switch.** "GPT-5 failed to call contextual tools before responding unless explicitly instructed". One "tool-first principle" directive fixed it. GPT-5 also wrote more verbose answers.
- **Product explainer.** "The Product Explainer SSR dip reflects transient LLM request failures."
- **Debt management**, which the paper calls "the hardest domain", stays furthest from human agents (−23.6 p.p.).

## What the team would do differently

The paper states lessons: "only a few hundred high quality binary labels are enough to build an effective eval", and "more capable models with stricter instruction-following require more explicit prompts". It warns that "there is usually a trade-off between SSR and tNPS": handing hard cases to humans can raise tNPS.

The wiki's reading: given that trade-off, the card-delivery result matters because tNPS and SSR rose together. The E2 row shows why a judge needs a trivial baseline beside it. Section 6.3.3 gives the 37 p.p. relative to V0, which could not take domain actions; without absolute values or sample sizes, the gain cannot be sized. Figure 9 plots V6 far from zero on the offline axis, unlike the text.

## Disclosure

None.

## Sources

- Aman Gupta, Kevin Rossell, Edesio Alcobaça, Jose Chrystian Lima Pacheco, Carolina Baptista de Lima, Shao Tang, Luiz Paulo Rabachini, Luis Moneda, Herbert Fei, Daniel Silva and Rohan Ramanath, Nubank, [“Building Customer Support AI Agents at 100M-User Scale: An Evaluation-Driven Framework”](https://arxiv.org/abs/2606.08867), arXiv:2606.08867, v1 7 June 2026, v2 13 June 2026; accepted to KDD '26 (32nd ACM SIGKDD Conference on Knowledge Discovery and Data Mining), doi:10.1145/3770855.3818332.

## Related

- [About playbooks](#about-playbooks)
- [Customer-support and enterprise workflow agents](#support-agents)
- [LLM-as-judge done right](#llm-as-judge)
- [Online controlled experiments for AI features](#online-experiments)
- [Prompt optimization](#prompt-optimization)
