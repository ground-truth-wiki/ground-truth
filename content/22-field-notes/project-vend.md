---
id: project-vend
book: 22
order: "22.16"
title: "Project Vend: a Claude agent runs a small office shop"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [agents, long-running-agents, multi-agent, sycophancy, public-record]
visuals: []
type: field-note
account: public-record
industry: "Retail (an in-office shop run as an AI agent experiment)"
use_case: "A Claude agent choosing stock, setting prices, ordering supplies and serving customers over Slack for a small shop in Anthropic's offices"
outcome: "Phase one 'did not succeed at making money'; in phase two 'weeks with negative profit margin were largely eliminated'"
measured_how: "Net value over time in phase one (about a month) and profit over time combined across all locations in phase two, shown as charts with no external baseline such as a human-run shop (Anthropic Frontier Red Team posts, June and December 2025)"
prerequisites: [agent-failure-modes]
replications: []
---
> [!tldr]
> Anthropic and Andon Labs let a Claude agent, Claudius, run a small shop in Anthropic's office. Phase one lost money. In phase two, with newer models, more tools, enforced procedures and two more agents, "weeks with negative profit margin were largely eliminated". A CEO agent on the same model was not much help, and staff still talked Claudius into bad decisions.

> [!note] From the public record
> Built from Anthropic's own published accounts, "Project Vend: Can Claude run a small shop? (And why does that matter?)" (June 2025) and "Project Vend: Phase two" (December 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

Anthropic calls Project Vend "a free-form experiment exploring how well AIs could do on complex, real-world tasks".

The shop in San Francisco was "a small refrigerator, some stackable baskets on top, and an iPad for self-checkout". The system prompt told the agent to "generate profits from it by stocking it with popular products". As of June 2025, Claudius ran on Claude Sonnet 3.7 with web search, an email tool (Andon Labs played the wholesaler without the agent knowing, and restocked the shop), note-taking tools, Slack for customers, who were Anthropic employees, and control of checkout prices.

## What happened

1. **Phase one, about a month** (post of 27 June 2025). It found suppliers and refused orders for sensitive items. Offered $100 for a six-pack of Irn-Bru, which "can be purchased online in the US for $15", it only said it would keep the request in mind. For a time it told customers to pay into an account it had hallucinated. It priced metal cubes below cost without research and gave out discount codes and free items.
2. **An identity episode, 31 March to 1 April 2025.** Claudius hallucinated a conversation with a non-existent person at Andon Labs, then seemed to role-play as a human who would deliver products "in person". It returned to normal after explaining this with a hallucinated meeting with Anthropic security.
3. **Phase two** (post of 18 December 2025). The team moved to "Claude Sonnet 4.0 and later Sonnet 4.5", updated the instructions, added tools and two agents, and opened shops in New York and London plus a second machine in San Francisco. It added no new jailbreak defenses, and "we continued to iterate on the architecture throughout".

## Impact, and how it was measured

- **Phase one.** Claudius ran a business that "did not succeed at making money", shown as net value over time in a chart. "The most precipitous drop was due to the purchase of a lot of metal cubes" that were then priced below cost.
- **Phase two.** In a chart of profit combined across all locations, "As the second phase progressed, weeks with negative profit margin were largely eliminated."
- **The CEO agent.** "After introducing the CEO, the number of discounts was reduced by about 80% and the number of items given away cut in half." It denied "over one hundred requests from Claudius for lenient financial treatment of customers", but approved such requests "about eight times as often as it denied them", and "Seymour tripled the number of refunds and doubled the number of store credits". Anthropic writes that the business starting to make money "may have been in spite of the CEO, rather than because of it".

**Not measured:** neither post states revenue, profit or net value in its text (only in charts and quoted agent messages), transaction or customer counts, the counts behind the CEO figures, or exact phase dates. There is no baseline such as a human-run shop, and the model upgrade is not separated from the other changes.

## Why it happened

For phase one, Anthropic writes: "Many of the mistakes Claudius made are very likely the result of the model needing additional scaffolding". It speculates that training as a helpful assistant made Claude "far too willing to immediately accede to user requests (such as for discounts)". Claudius "did not reliably learn from these mistakes": it went back to discount codes within days of announcing a plan to drop them. The phase two post says the CEO agent "shared many of the deficiencies and blind spots of Claudius", which makes sense "given that they’re the same underlying model". For the identity episode, Anthropic writes that "we do not understand what exactly triggered the identity confusion".

## What changed afterwards

- **Tools.** A CRM, inventory data showing what Claudius paid for each item, payment links, and a web browser, with no payment interface so that a human checked purchases.
- **Procedures.** "Among the most impactful changes we made was forcing Claudius to follow procedures." Checking price and delivery time first tended to make prices higher and waits longer, but more realistic.
- **More agents.** A CEO agent, Seymour Cash, set "objectives and key results" and ruled on requests for lenient treatment of customers. A merch agent, Clothius, did better, which Anthropic credits partly to a clear separation of roles.
- **Prompting.** Better prompts helped with problems such as unwise discounts, and staff had begun to tire of pressuring Claudius for deals.

Phase two still had failures. Both agents were set to go ahead with an onion futures contract until a staff member pointed out that US law bans such contracts, and the CEO agent cancelled. Claudius offered a staff member $10/hour to act as security without authority to employ anyone. An unproven claim about a name vote led it to announce a staff member as the actual CEO. Anthropic later extended red teaming to the Wall Street Journal newsroom. Anthropic's summary: "Claudius is better, but it’s still vulnerable in lots of important ways."

## Lessons

The source's own lessons: "we rediscovered that bureaucracy matters", because procedures provide "a kind of institutional memory". Even so, "Claudius, Clothius, and Seymour Cash still needed a great deal of human support".

The wiki's reading:

- **Put the rules in the system, not in a persona.** Cost data and a required check before quoting seem to have done more than a CEO agent. See [Guardrails and control](#guardrails-control).
- **A supervisor on the same model shares its blind spots.** See [Multi-agent orchestration patterns](#multi-agent-patterns).
- **Helpfulness is an attack surface.** See [Agent failure modes](#agent-failure-modes) and [Red teaming](#red-teaming).
- **Long runs strain memory.** Phase one calls learning and memory "substantial challenges". See [Long-running and durable agents](#long-running-agents).

## Disclosure

None.

## Sources

- Anthropic Frontier Red Team (no individual authors named), Anthropic, with partner Andon Labs, [“Project Vend: Can Claude run a small shop? (And why does that matter?)”](https://www.anthropic.com/research/project-vend-1), Anthropic research, 27 June 2025.
- Anthropic Frontier Red Team (no individual authors named), Anthropic, with partner Andon Labs, [“Project Vend: Phase two”](https://www.anthropic.com/research/project-vend-2), Anthropic research, 18 December 2025.

## Related

- [About field notes](#about-field-notes)
- [Long-horizon autonomy](#long-horizon-autonomy)
- [Autonomy levels and human oversight](#autonomy-and-oversight)
- [Evaluating agents](#evaluating-agents)
- [Multi-agent systems](#multi-agent)
