---
id: measuring-ai-impact
book: 18
order: "18.9"
title: Measuring the impact and ROI of an AI feature
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [roi, product-metrics, impact-measurement, experimentation, productivity]
visuals: []
prerequisites: [online-evaluation, eval-statistics]
---
> [!tldr]
> Measuring impact means showing, inside one organization, that an AI feature changed an outcome people care about, at a cost worth paying; economy-wide evidence lives in [Measuring AI's economic impact](#economic-impact-evidence). Model quality, feature usage, task outcomes and business outcomes are four different levels that often disagree, and what users say about their own speed can point the opposite way from what was measured. The one thing to remember: choose a unit of value with guardrails, and compare against a randomized group, a staggered rollout or a holdout, not against last quarter.

## Key ideas

- **Goals, signals, metrics.** Google's HEART framework sorts user-centered metrics into happiness, engagement, adoption, retention and task success, and its process starts from the product's goals, then finds the signals that show success, and only then picks metrics ([Rodden, Hutchinson and Fu, “Measuring the User Experience on a Large Scale: User-Centered Metrics for Web Applications” (2010)](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/)). For an AI feature, the same discipline separates model quality (evals) from usage, from task outcomes such as resolved tickets or merged changes, from business outcomes such as cost or revenue.
- **Usage is not value.** Ziegler et al. found that the acceptance rate of shown code completions, rather than measures of how long accepted code persists, drives how productive developers feel; the study compared usage data with surveys of perceived productivity, so acceptance rate tracks engagement and perception, not delivered value ([Ziegler et al., “Productivity Assessment of Neural Code Completion” (2022)](https://arxiv.org/abs/2205.06537)). A unit of value needs guardrails beside it, as in Brynjolfsson, Li and Raymond, who measured issues resolved per hour alongside customer sentiment and employee retention ([NBER w31161](https://www.nber.org/papers/w31161)).
- **Self-reports mislead.** In a randomized trial with 16 experienced open-source developers on 246 tasks in mature projects they knew well, allowing AI tools increased completion time by 19%, while the developers had forecast that AI would cut it by 24% and still estimated afterwards that it had cut it by 20% ([Becker et al., “Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity” (2025)](https://arxiv.org/abs/2507.09089)). Ask for measured task times or outcomes, not surveys about speed.
- **Causal designs, and reference results with their settings.** In a controlled experiment, recruited developers with GitHub Copilot implemented an HTTP server in JavaScript 55.8% faster than a control group ([Peng et al., “The Impact of AI on Developer Productivity: Evidence from GitHub Copilot” (2023)](https://arxiv.org/abs/2302.06590)). A staggered rollout of an assistant to 5,179 customer support agents raised issues resolved per hour by 14% on average, by 34% for novice and low-skilled agents and minimally for experienced ones, later published in the *Quarterly Journal of Economics* (2025) ([Brynjolfsson, Li and Raymond, “Generative AI at Work”, NBER w31161](https://www.nber.org/papers/w31161)); see [online experiments](#online-experiments) for randomized access and holdouts.
- **The organization decides the return.** DORA's 2025 report finds that "AI's primary role is as an amplifier, magnifying an organization's existing strengths and weaknesses," and that the greatest returns come from the surrounding system rather than the tools ([DORA, “State of AI-assisted Software Development 2025”](https://dora.dev/research/2025/dora-report/)).
- **Full-cost ROI, and vendor claims to verify.** An honest ROI sets measured benefits against full costs: inference, integration, human review time, error handling and maintenance. Klarna announced in February 2024 that its assistant handled two-thirds of customer service chats in its first month, did "the equivalent work of 700 full-time agents" and would bring an estimated $40 million profit improvement in 2024 ([Klarna (2024)](https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/)); in May 2025 its CEO said AI service had been cheaper but of "lower quality" and that Klarna was hiring human agents again ([Entrepreneur (2025)](https://www.entrepreneur.com/business-news/klarna-ceo-reverses-course-by-hiring-more-humans-not-ai/491396)).

## Planned visuals

- **`diagram`: four levels of measurement.** Model quality, feature usage, task outcomes and business outcomes as stacked layers, each with example metrics and guardrails, and the arrows where they commonly disagree (high acceptance with no time saved; time saved with more rework).
- **`chart`: perceived versus measured speed.** Developers' forecast, their belief afterwards, expert forecasts and the measured result from Becker et al. (2025), as real data with its source and as-of date.
- **`calculator`: full-cost ROI of an AI feature.** Inputs: tasks per month, measured time saved per task with its confidence interval, loaded hourly cost, inference cost per task, review minutes, error rate and cost per error, integration and maintenance cost; outputs: net monthly benefit and ROI, with the formula and assumptions shown. Illustrative inputs only.

## Talk like an expert

The vocabulary: **unit of value**, **guardrail metric**, **acceptance rate**, **staggered rollout**, **holdout**, **perception gap**, **heterogeneous effects**, **full-cost ROI**. Experts ask "compared with what?" before "how much?", write a measurement plan (goal, unit of value, guardrails, design, sample size, duration, costs) before launch, and read vendor impact numbers as claims until the design behind them is public.

## Go deeper

- Becker et al., [“Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity”](https://arxiv.org/abs/2507.09089) (2025).
- Brynjolfsson, Li and Raymond, [“Generative AI at Work”](https://www.nber.org/papers/w31161) (NBER Working Paper 31161, 2023; *Quarterly Journal of Economics*, 2025).
- Rodden, Hutchinson and Fu, [“Measuring the User Experience on a Large Scale: User-Centered Metrics for Web Applications”](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/) (CHI 2010).
- DORA, [“State of AI-assisted Software Development 2025”](https://dora.dev/research/2025/dora-report/).

## Related

- [Online evaluation](#online-evaluation)
- [Online controlled experiments for AI features](#online-experiments)
- [Scoping AI features: when to use AI and what success means](#ai-use-case-scoping)
- [AI pricing and unit economics](#ai-pricing-unit-economics)
- [Measuring AI's economic impact](#economic-impact-evidence)
