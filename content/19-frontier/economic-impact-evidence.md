---
id: economic-impact-evidence
book: 19
order: "19.8.3"
title: "Measuring AI's economic impact"
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [economics, productivity, labor, automation, measurement]
visuals: []
prerequisites: [open-problems, eval-statistics]
---
> [!tldr]
> AI's economic impact is measured in four main ways that answer different questions: exposure studies (which tasks AI could speed up), usage data (which tasks people actually bring to AI), experiments (whether AI makes a given worker faster or better) and task-value benchmarks (whether AI can do whole paid tasks). Their results diverge, sometimes in sign, because they measure different things under different conditions. The one thing to remember: an exposure score or a benchmark result is not a productivity gain, and every number needs its method, sample and date.

## Key ideas

- **Exposure is not adoption.** Eloundou et al. had human annotators and GPT-4 rate O*NET tasks as exposed if an LLM, or software built on one, could cut the time to do them by at least half at equivalent quality, and estimated that about 80% of US workers could have at least 10% of their tasks affected and about 19% at least half. The authors stress that this measures technical feasibility, which "does not guarantee labor productivity or automation outcomes" ([Eloundou et al., “GPTs are GPTs” (2023)](https://arxiv.org/abs/2303.10130)).
- **Usage data shows what people actually do, on one platform.** The Anthropic Economic Index mapped over four million Claude.ai conversations to O*NET tasks: software development and writing made up nearly half of use, and 57% of use looked like augmentation (iterating on or learning from outputs) against 43% automation. The split moves between reports: automation overtook augmentation on Claude.ai in August 2025 data, augmentation led again (52% to 45%) in November 2025, and about three-quarters of API traffic was automation ([Handa et al., “Which Economic Tasks are Performed with AI?” (2025)](https://arxiv.org/abs/2503.04761); [Anthropic, September 2025 report](https://www.anthropic.com/research/anthropic-economic-index-september-2025-report); [Anthropic, January 2026 report](https://www.anthropic.com/research/anthropic-economic-index-january-2026-report)).
- **Field experiments find gains inside the "jagged frontier" and losses outside it.** In a randomized experiment with 758 BCG consultants, GPT-4 users completed 12.2% more tasks, 25.1% faster and at 40% higher quality on tasks inside the frontier, but on a task designed to fall outside it, correct answers fell from 84% without AI to 60 to 70% with it. A staggered rollout to 5,179 customer support agents raised issues resolved per hour by 14%, most for novices, while a randomized trial with 16 experienced open-source developers found that allowing AI tools increased task completion time by 19% ([Mollick, “Centaurs and Cyborgs on the Jagged Frontier” (2023)](https://www.oneusefulthing.org/p/centaurs-and-cyborgs-on-the-jagged); [Brynjolfsson, Li and Raymond, “Generative AI at Work”, NBER w31161 (2023)](https://www.nber.org/papers/w31161); [Becker et al., “Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity” (2025)](https://arxiv.org/abs/2507.09089)).
- **Task-value benchmarks diverge because their tasks differ.** GDPval has experts in 44 occupations judge model deliverables blind against professionals' work, and in the October 2025 paper 47.6% of the best model's deliverables on the gold subset (Claude Opus 4.1) were rated as good as or better than the expert's; the authors note the tasks are "precisely-specified and one-shot, not interactive". The Remote Labor Index uses 240 real remote-work projects, mostly sourced from freelancers on online platforms and averaging 28.9 hours of human work. It counts a project as automated only if evaluators judge the AI deliverable at least as good as the human one, and in the October 2025 paper the best agent (Manus) reached 2.5% ([Patwardhan et al., “GDPval” (2025)](https://arxiv.org/abs/2510.04374); [Mazeika et al., “Remote Labor Index” (2025)](https://arxiv.org/abs/2510.26787)).
- **Measurement problems are the main story.** Self-reports mislead: the slowed-down developers believed afterwards that AI had cut their completion time by 20%. Selection matters too. METR's 2026 follow-up found developers declining to take part rather than work without AI, and 30% to 50% of surveyed developers holding back tasks they did not want to do unaided, so it called its new estimates unreliable and likely a lower bound on the speedup. Even a usage measure shifts with its classifier: Anthropic's August 2025 automation share on Claude.ai was 49% or 45%, depending on the model that labeled the data ([Becker et al. (2025)](https://arxiv.org/abs/2507.09089); [METR, “We are Changing our Developer Productivity Experiment Design” (2026)](https://metr.org/blog/2026-02-24-uplift-update/); [Anthropic, September 2025 report](https://www.anthropic.com/research/anthropic-economic-index-september-2025-report)).
- **Labor-market evidence is early and mixed (as of November 2026).** US payroll data through June 2026 show no economy-wide displacement, but employment of 22- to 25-year-olds in AI-exposed occupations 19% below its counterfactual, mainly through less hiring and concentrated where AI substitutes for tasks; the authors call these descriptive facts, not causal estimates. Danish records linked to adoption surveys show precise null effects on earnings and hours, ruling out effects larger than 2% two years after ChatGPT's launch ([Brynjolfsson, Chandar and Chen, “Canaries in the Coal Mine?” (revised August 2026)](https://digitaleconomy.stanford.edu/publications/canaries-in-the-coal-mine); [Humlum and Vestergaard, “Still Waters, Rapid Currents: Early Labor Market Transformation under Generative AI”, NBER w33777 (2025, revised March 2026)](https://www.nber.org/papers/w33777)).

## Planned visuals

- **`tree`:** the four measurement methods (exposure, usage, experiments, task-value benchmarks), each with the question it answers, its unit, an example study and its main blind spot.
- **`chart`** (real data): forecast versus measured effect in the METR developer trial (developer forecast, developer estimate afterwards, economist and ML expert forecasts, measured result with its interval), from Becker et al. (2025).
- **`chart`** (real data): the Anthropic Economic Index automation and augmentation shares on Claude.ai across report waves, with the API share beside them, dated, from the first report (February 2025), the September 2025 report and the January 2026 report.

## Talk like an expert

Economists separate **exposure**, **adoption**, **productivity** and **labor-market outcomes**, and talk about **augmentation versus automation**, **selection effects**, **external validity** and **counterfactual employment gaps**. Before quoting a number they ask which method, which population and which date; for a product claim or ROI case, the same discipline applies inside one organization, as [Measuring the impact and ROI of an AI feature](#measuring-ai-impact) explains.

## Go deeper

- [Eloundou et al., “GPTs are GPTs: An Early Look at the Labor Market Impact Potential of Large Language Models” (2023)](https://arxiv.org/abs/2303.10130): the task-exposure method.
- [Handa et al., “Which Economic Tasks are Performed with AI? Evidence from Millions of Claude Conversations” (2025)](https://arxiv.org/abs/2503.04761): the usage-based method and its limits.
- [Becker et al., “Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity” (2025)](https://arxiv.org/abs/2507.09089): a randomized trial with its forecasts, read with [METR's 2026 follow-up](https://metr.org/blog/2026-02-24-uplift-update/).
- [Brynjolfsson, Chandar and Chen, “Canaries in the Coal Mine? Six Facts about the Recent Employment Effects of Artificial Intelligence”](https://digitaleconomy.stanford.edu/publications/canaries-in-the-coal-mine): payroll evidence, revised as new data arrive.

## Related

- [Open problems and big debates](#open-problems)
- [Measuring time horizons and AI R&D capability](#measuring-time-horizons)
- [AGI, timelines and the catastrophic-risk debate](#agi-timelines-risk)
- [State-of-the-art snapshot](#sota-snapshot)
- [Governance, regulation and law](#governance-regulation)
- [Statistics for evals](#eval-statistics)
