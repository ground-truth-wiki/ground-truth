---
id: ai-pricing-unit-economics
book: 18
order: "18.8"
title: AI pricing and unit economics
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [pricing, unit-economics, gross-margin, outcome-based-pricing, cost]
visuals: []
prerequisites: [cost-engineering, back-of-envelope]
---
> [!tldr]
> Every use of an AI feature costs real money, because each request burns inference compute, so AI products behave less like classic software and more like a utility with a meter. The pricing model (per token, per seat, per credit, per outcome or a hybrid) decides who carries that variable cost, and each one asks something different of engineering. The one thing to remember: know your cost to serve per task and per user, including your heaviest users, before you set a price; this page is information, not financial advice.

## Key ideas

- **A variable cost per use, and thinner margins.** Casado and Bornstein found AI companies often at 50 to 60% gross margin, against 60 to 80% or more for comparable SaaS, driven by cloud compute (often 25% or more of revenue) and by humans in the loop ([Casado and Bornstein, a16z (2020)](https://a16z.com/the-new-business-of-ai-and-how-its-different-from-traditional-software/)). Bessemer put the average gross margin of the fastest-growing AI startups, which it calls Supernovas, at about 25%, with many close to zero or negative, and of a second group it calls Shooting Stars at about 60%, as of August 2025 ([Bessemer Venture Partners, “The State of AI 2025”](https://www.bvp.com/atlas/the-state-of-ai-2025)).
- **The pricing menu, and who carries the risk.** Model APIs bill usage per million input and output tokens at separate rates, so the customer carries the usage risk; Anthropic, for example, discounts batch processing by 50%, as of November 2026 ([Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)). Salesforce's Agentforce shows three models side by side: $2 per conversation, Flex Credits at $0.005 each with 20 credits (about $0.10) per action, and per-user licenses such as $125 per user per month for its add-ons, as of November 2026 ([Agentforce pricing](https://www.salesforce.com/agentforce/pricing/)).
- **Outcome-based pricing needs a precise outcome.** Intercom charges $0.99 per outcome for its Fin agent, counts a resolution when "no further help is requested after Fin's last answer", charges at most one outcome per conversation, and does not bill conversations handed to a human without an outcome, as of November 2026 ([Fin pricing](https://fin.ai/pricing)). The vendor now carries the cost of failed attempts, and the outcome definition becomes a billing rule that engineering must meter per tenant, audit and track with evals.
- **Hybrids: seats with credit allowances and overage.** A capped allowance limits what a heavy user can cost the vendor: Copilot Pro costs $10 a month and includes 1,500 GitHub AI Credits (1 credit = $0.01), drawn down by tokens at per-model rates, and when they run out the user upgrades, sets a dollar budget for extra usage or waits for the monthly reset, as of November 2026 ([GitHub Docs: Copilot billing for individuals](https://docs.github.com/en/copilot/concepts/billing/billing-for-individuals)). GitHub moved its plans from counted premium requests to these token-based credits on June 1, 2026 (annual Pro and Pro+ subscribers keep premium requests until their plan expires), and dropped the fallback to a cheaper model once the allowance was used up ([Rodriguez, GitHub (2026)](https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/)).
- **Falling prices move the math.** Appenzeller estimated that for equivalent capability, LLM inference cost falls about 10x per year ([Appenzeller, “Welcome to LLMflation – LLM inference cost is going down fast”, a16z (2024)](https://a16z.com/llmflation-llm-inference-cost/)). Epoch AI found that the price to reach a fixed performance level fell between 9x and 900x per year depending on the benchmark threshold, and cautioned that the fastest declines may not last, which is why API-versus-self-hosting and build-versus-buy choices (see [cost engineering](#cost-engineering) and [decision guides](#decision-guides)) need re-checking as prices change ([Cottier et al., Epoch AI (2025)](https://epoch.ai/data-insights/llm-inference-price-trends)).

## Planned visuals

- **`calculator`: margin per user under each pricing model.** Inputs: tasks per user per month, tokens per task, token prices, resolution rate, and the seat, credit and outcome prices; outputs: cost to serve, revenue and gross margin per user under usage, seat, credit, outcome and hybrid pricing, with the formula and assumptions shown. Illustrative inputs only.
- **`compare`: who carries the cost risk.** Usage, seat, credit and outcome pricing side by side, linking each to the risk it shifts (heavy users, failed attempts, model choice) and the engineering it needs (metering, per-tenant attribution, an auditable outcome definition, evals).
- **`chart`: the falling price of a fixed capability.** Price per million tokens to reach fixed benchmark thresholds over time on a log axis, from Epoch AI's data, with its source and as-of date.

## Talk like an expert

The vocabulary: **cost to serve**, **gross margin**, **unit economics**, **blended price**, **credit burn rate**, **overage**, **outcome definition**, **heavy-user tail**. Experts quote margin per task and per user, including the heaviest users rather than the average, and treat pricing as a decision about who carries the variable cost of inference.

## Go deeper

- Casado and Bornstein, [“The New Business of AI (and How It's Different From Traditional Software)”](https://a16z.com/the-new-business-of-ai-and-how-its-different-from-traditional-software/) (a16z, 2020).
- Bessemer Venture Partners, [“The State of AI 2025”](https://www.bvp.com/atlas/the-state-of-ai-2025) (August 2025).
- Cottier et al., [“LLM inference prices have fallen rapidly but unequally across tasks”](https://epoch.ai/data-insights/llm-inference-price-trends) (Epoch AI, 2025).
- Appenzeller, [“Welcome to LLMflation – LLM inference cost is going down fast”](https://a16z.com/llmflation-llm-inference-cost/) (a16z, 2024).

## Related

- [Cost engineering](#cost-engineering)
- [Cost and capacity](#cost-capacity)
- [Back-of-the-envelope estimation](#back-of-envelope)
- [Decision guides](#decision-guides)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
