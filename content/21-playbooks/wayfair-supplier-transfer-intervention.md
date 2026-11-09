---
id: wayfair-supplier-transfer-intervention
book: 21
order: "21.58"
title: "Wayfair Wilma: flagging supplier transfer tickets that need an associate"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [customer-support, text-classification, prompt-design, human-in-the-loop, public-record]
visuals: []
type: playbook
account: public-record
industry: "E-commerce (post-order customer service with suppliers)"
use_case: "An LLM classifier that reads each new customer, supplier or associate comment on a Supplier Transfer Program ticket and flags the ticket, with a reason code, when a Wayfair associate needs to intervene"
outcome: "95% precision and 97% recall against original target human baselines of 80% precision and 90% recall; approximately 65% of STP tickets cleared without human intervention; 29% reduction in time-to-resolution compared to the pre-Wilma period"
measured_how: "Precision, recall, reason accuracy and timely flagging against human baselines (target values stated only for precision and recall), plus time-to-resolution, supplier satisfaction and re-open rates against the pre-Wilma period; sample, labeling method and period not stated (Wayfair Tech Blog, January 2026)"
prerequisites: [classification-metrics, support-agents]
replications: []
---
> [!tldr]
> Wayfair built Wilma, an LLM-based system that reads every new comment on a Supplier Transfer Program (STP) ticket and flags the ticket when a Wayfair associate needs to step in. The post reports "95% precision, 97% recall" against target human baselines of 80% precision and 90% recall, and says Wilma can clear "approximately 65% of STP tickets without human intervention". The post's first lesson: one prompt per kind of comment author instead of one prompt for all.

> [!note] From the public record
> Built from Wayfair's own published account, "Flag Early, Fix Faster: Real-Time Intervention for Supplier Transfers with Wilma" (January 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

In Wayfair's Supplier Transfer Program, suppliers interact with the customer, diagnose the post-order issue and process a resolution. The post says that as the program scales to more suppliers, products and customer interactions, the volume of ongoing conversations grows rapidly.

Maintaining quality within STP "relies heavily on manual monitoring". A team of associates skims supplier-customer threads for signs of confusion, stalled progress, policy mismatches or customer frustration. The post says such instances often mark moments when the customer experience is at risk and an associate "needs to intervene quickly to course-correct". It calls the manual process "time-consuming, inconsistent by nature and difficult to scale". As caseload grows, a contact transferred to a supplier is more likely to be handled inappropriately or reviewed too late. For the wider pattern, see [Customer-support and enterprise workflow agents](#support-agents).

## Why this approach

The post does not describe alternatives to an LLM that the team considered. It contrasts Wilma with the manual process it replaces: continuous, real-time monitoring instead of "delayed human spot checks". Within the LLM design, it compares a first design with a single prompt for all incoming tickets and a final design that splits the prompt by comment author, because each kind of author has different situations that might need intervention.

## The approach

Each new comment on an STP ticket triggers, through a webhook and a Publish/Subscribe (Pub/Sub) consumer, a LangGraph workflow that decides in "approximately one second" whether an associate should step in. See [Graph workflow runtimes](#graph-workflow-runtimes). The graph runs three steps:

1. **Identify the author.** The system "deterministically identifies whether the new comment came from a customer, a supplier or a Wayfair associate".
2. **Classify with a role-specific prompt.** Each author type gets a prompt with only the intervention categories for that role, such as frustration or refund escalation for customers, and incorrect guidance or policy misalignment for suppliers.
3. **Flag and route.** If intervention is needed, the system adds a flag, a reason code and a short rationale to the ticket, and routes it to a global partner support associates' queue with the comment that triggered it.

Each flagged ticket requires validation by an associate. On disagreement, a "thumbs-down" workflow records whether the flag or its reason was wrong, with the corrected rationale, and this feeds model refinement: a [human in the loop](#human-in-the-loop) design.

## The stack

As of January 2026, the post names:

- LangGraph for the workflow graph.
- A webhook and a Publish/Subscribe (Pub/Sub) topic, with a consumer that triggers the graph.
- LLMs for classification; the post does not name the model or its vendor.
- Jinja2 prompt templates, which replaced a format string template.
- SupportHub, where the STP tickets live (the introduction calls it ServiceHub).
- Arize for observability: trace-level visibility into flagging behavior, debugging and automated alerts for anomalous shifts in key metrics. See [Observability and tracing](#observability-tracing).

## Results, and how they were measured

The post evaluates Wilma on "precision, recall, reason accuracy and timeliness". For what precision and recall mean, see [Classification and regression metrics](#classification-metrics).

- **Classification.** "Wilma significantly outperformed its original target human baselines of 80% precision and 90% recall", "achieving 95% precision, 97% recall, 99.8% reason accuracy and 99.7% timely flagging". The post says all four results surpass human baseline performance, but gives human baseline values only for precision and recall.
- **Prompt design.** The single-prompt design reached "an accuracy of 70%". After the prompt was split by author, "the prediction accuracy increased significantly to 96% with this optimized design".
- **Automation.** "Early results show that Wilma can automatically clear approximately 65% of STP tickets without human intervention."
- **Resolution time.** "a 29% reduction in time-to-resolution compared to the pre-Wilma period".
- **Supplier satisfaction.** "an increase in the supplier satisfaction score from 3.1 to 3.8 (out of five)", which the post attributes to faster response times and proactive agent interventions.
- **Re-opens.** "a 2.8% reduction in overall ticket re-open rates".

**Not measured:** the post gives no evaluation period, no number of tickets, and no account of how the correct labels were set or which data the 70% and 96% figures come from. It does not date the pre-Wilma period, say whether the before-and-after comparisons control for other changes, give the sample behind the satisfaction score, or say whether the 2.8% is relative or in percentage points.

## What failed

The first design, one prompt for all tickets, had three problems besides its 70% accuracy:

- **Hallucinated reason codes.** The model "incorrectly predicted intervention reason codes that were not applicable to the comment author".
- **Token cost.** The single, consolidated prompt led to a higher input token cost.
- **Static templates.** A format string template "proved inefficient, as it offered only a static method for handling the prompts".

According to the post, splitting the prompt by author "effectively eliminated model hallucinations" and lowered input token cost. The post reports no failures in production. It says that constant improvement of prompts and flagging categories is necessary to keep pace with evolving business processes.

## What the team would do differently

The post has two "Lessons Learned" sections. The first, "Author-Aware Prompts", includes a bold takeaway: "Author-aware prompts beat one-size-fits-all." Limiting each prompt to the reasons relevant to its author, the post says, reduced ambiguity in the model's decision space and increased the deterministic behavior of the solution, which improved precision, recall and overall prediction stability. The second, "Evaluate and Improve", describes continuous evaluation through associate feedback, offline evaluation, quality assurance team reviews and monitoring in Arize.

Next, the team is exploring reusable tools that fetch context beyond the ticket, such as Model Context Protocol tools that extract information from the order trail, which logs the actions and communications related to an order.

The wiki's reading: the reported jump from 70% to 96% came with a design change. A deterministic rule (who wrote this comment?) runs before the LLM and narrows the labels the model chooses from. Where code can decide part of a classification, deciding it first leaves the model a smaller, less ambiguous task. The business numbers come without dates, samples or controls, so they show a direction more than a size.

## Disclosure

None.

## Sources

- Farshid Bahrami, Atharva Deo, Roger Bock, Ying Jiang and Luming Wang, Wayfair, [“Flag Early, Fix Faster: Real-Time Intervention for Supplier Transfers with Wilma”](https://www.aboutwayfair.com/careers/tech-blog/flag-early-fix-faster-real-time-intervention-for-supplier-transfers-with-wilma), Wayfair Tech Blog, 15 January 2026.

## Related

- [About playbooks](#about-playbooks)
- [Customer-support and enterprise workflow agents](#support-agents)
- [Classification and regression metrics](#classification-metrics)
- [Graph workflow runtimes](#graph-workflow-runtimes)
- [Human in the loop](#human-in-the-loop)
