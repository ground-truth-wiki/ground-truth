---
id: agi-timelines-risk
book: 19
order: "19.8.4"
title: AGI, timelines and the catastrophic-risk debate
level: frontier
stability: moving
reviewed: "2026-11"
status: seed
tags: [agi, timelines, forecasting, catastrophic-risk, debates]
visuals: []
prerequisites: [open-problems, alignment-concepts]
---
> [!tldr]
> AGI has no agreed definition, and the choice matters because contracts, safety thresholds and policy depend on it. Forecasts of its arrival range from a few years to many decades, and views on catastrophic risk range from a global priority alongside pandemics and nuclear war to a speculative risk that matters less than systemic harms such as inequality and concentration of power, mostly because people disagree about how fast capabilities grow, how fast they spread and whether they stay controllable. The one thing to remember: plan on measured capability trends, not on dates.

## Key ideas

- **Definitions carry real stakes.** The OpenAI Charter defines AGI as "highly autonomous systems that outperform humans at most economically valuable work", and the October 2025 Microsoft–OpenAI agreement ties its revenue share and Microsoft's research IP rights to AGI being declared by OpenAI and "verified by an independent expert panel". Developers' safety frameworks likewise turn capability levels into thresholds that trigger safeguards or restrict deployment (see [frontier safety frameworks](#frontier-safety-frameworks)) ([Morris et al., “Levels of AGI for Operationalizing Progress on the Path to AGI” (2023)](https://arxiv.org/abs/2311.02462); [Microsoft, “The next chapter of the Microsoft–OpenAI partnership” (2025)](https://blogs.microsoft.com/blog/2025/10/28/the-next-chapter-of-the-microsoft-openai-partnership/); [International AI Safety Report 2026](https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026)).
- **Measurable definitions, and why the Turing test is not one.** Morris et al. rate systems on performance, from Emerging ("equal to or somewhat better than an unskilled human") to Superhuman ("outperforms 100% of humans"), and on generality, with autonomy as a separate axis, while Hendrycks et al. define AGI as matching a well-educated adult across ten cognitive domains from CHC theory and score GPT-4 at 27% and GPT-5 at 57%. Turing's 1950 imitation game is older: in a 2025 three-party version, GPT-4.5 with a humanlike persona was judged human 73% of the time, more often than the real humans, but Morris et al. argue that such tests often show how easily people are fooled and are insufficient for benchmarking AGI ([Hendrycks et al., “A Definition of AGI” (2025)](https://arxiv.org/abs/2510.18212); [Turing, “Computing Machinery and Intelligence” (1950)](https://academic.oup.com/mind/article/LIX/236/433/986238); [Jones and Bergen, “Large Language Models Pass the Turing Test” (2025)](https://arxiv.org/abs/2503.23674); [Morris et al. (2023)](https://arxiv.org/abs/2311.02462)).
- **Forecasts disagree by decades, and they move.** Progress is argued from [benchmarks](#benchmark-literacy), [task time horizons](#measuring-time-horizons), ARC-AGI and [compute and algorithmic trends](#scaling-trends-limits). A survey of 2,778 AI researchers gave a 50% chance of machines outperforming humans at every task by 2047, 13 years earlier than the 2022 survey, and of full automation of all occupations by 2116. The AI 2027 scenario (April 2025) put a superhuman coder in March 2027; in an August 2026 update, the latest as of November 2026, two of its authors put their medians for an automated coder at November 2027 (Kokotajlo) and January 2030 (Lifland), while Ege Erdil, writing in Epoch AI's Gradient Updates newsletter in April 2025, gave a median of about 20 years until full automation of remote work ([Grace et al., “Thousands of AI Authors on the Future of AI” (2024)](https://arxiv.org/abs/2401.02843); [Kokotajlo et al., “AI 2027” (2025)](https://ai-2027.com/); [Lifland, Kokotajlo and Halstead, “Q2.5 2026 Timelines Update: Uplift and Revenue” (2026)](https://blog.aifutures.org/p/q25-2026-timelines-update-uplift); [Erdil, “The case for multi-decade AI timelines” (2025)](https://epoch.ai/gradient-updates/the-case-for-multi-decade-ai-timelines)).
- **The intelligence-explosion argument and its critics.** Eth and Davidson argue that AI systems automating AI research could set off a software intelligence explosion if each doubling of cumulative research effort yields more than one doubling of software efficiency (their "returns to software R&D" above 1), which they call "at least decently likely" with hardware held fixed. Erdil counters that AI research is bottlenecked by experimental compute and data, so broad automation of the economy would come first, and Narayanan and Kapoor call superintelligence, as usually conceived, incoherent (see [self-improving systems](#self-improving-systems)) ([Eth and Davidson, “Will AI R&D Automation Cause a Software Intelligence Explosion?” (2025)](https://www.forethought.org/research/will-ai-r-and-d-automation-cause-a-software-intelligence-explosion); [Erdil (2025)](https://epoch.ai/gradient-updates/the-case-for-multi-decade-ai-timelines); [Narayanan and Kapoor, “AI as Normal Technology” (2025)](https://knightcolumbia.org/content/ai-as-normal-technology)).
- **The catastrophic-risk position.** The 2023 Statement on AI Risk, signed by Geoffrey Hinton, Yoshua Bengio and the heads of Google DeepMind, OpenAI and Anthropic, says "Mitigating the risk of extinction from AI should be a global priority alongside other societal-scale risks", and 38% to 51% of surveyed researchers gave at least a 10% chance to outcomes as bad as extinction. The 2026 International AI Safety Report defines loss of control as AI systems operating "outside of anyone's control" with regaining control extremely costly or impossible, finds that expert opinion on its likelihood "varies greatly", and judges that current systems show early signs of the relevant capabilities "but not at levels that would enable loss of control" ([Center for AI Safety, “Statement on AI Risk” (2023)](https://aistatement.com/); [Grace et al. (2024)](https://arxiv.org/abs/2401.02843); [International AI Safety Report 2026](https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026)).
- **The counter-position, and what the disagreement is about.** Narayanan and Kapoor treat AI as a transformative but controllable technology whose effects arrive slowly ("Diffusion occurs over decades, not years"); they call catastrophic misalignment "(by far) the most speculative" of the risks they discuss, argue that if AI is normal technology, systemic risks such as inequality and concentration of power become "far more important than the catastrophic ones", and favor resilience over nonproliferation. The International AI Safety Report traces the disagreement to "future AI capabilities, behavioural propensities, and deployment trajectories", in short: how fast capabilities grow, whether systems behave as intended and stay controllable, and how fast and where they are deployed ([Narayanan and Kapoor (2025)](https://knightcolumbia.org/content/ai-as-normal-technology); [International AI Safety Report 2026](https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026)).

## Planned visuals

- **`tree`:** five definitions of AGI (human level across most cognitive tasks, the OpenAI Charter, Levels of AGI, the CHC-based definition, superintelligence), each with what it measures and how a claim under it would be resolved.
- **`chart`** (real data): published forecast medians against the date each was made (the 2022 and 2023 expert surveys, AI 2027 and the AI Futures Project's later updates, Erdil's estimate), labeled by milestone, since the milestones differ, with sources and dates.
- **`diagram`:** the three cruxes (speed of capability gains, speed of diffusion, controllability) with where the intelligence-explosion view, the International AI Safety Report and the normal-technology view stand on each.

## Talk like an expert

Experts ask "AGI by which definition, resolved how and by whom?" and separate **capability forecasts** from **impact forecasts**, using terms like **resolution criteria**, **takeoff speed**, **software intelligence explosion**, **loss of control** and **diffusion**. They read any timeline claim for its definition, resolution criteria, base rates and the forecaster's incentives, plan on measured capability trends rather than dates, and use these debates as inputs to [threat models](#threat-modeling) and [governance](#governance-regulation).

## Go deeper

- [Morris et al., “Levels of AGI for Operationalizing Progress on the Path to AGI” (2023)](https://arxiv.org/abs/2311.02462): six principles for defining AGI and the levels framework, ICML 2024.
- [Grace et al., “Thousands of AI Authors on the Future of AI” (2024)](https://arxiv.org/abs/2401.02843): AI researchers' forecasts and risk estimates, from what the authors call the largest survey of its kind.
- [International AI Safety Report 2026](https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026): the evidence review chaired by Yoshua Bengio under a mandate from the 2023 AI Safety Summit at Bletchley Park, including capability scenarios to 2030 and loss of control.
- [Narayanan and Kapoor, “AI as Normal Technology” (2025)](https://knightcolumbia.org/content/ai-as-normal-technology): the main counter-position to superintelligence framings.

## Related

- [Open problems and big debates](#open-problems)
- [Frontier safety frameworks](#frontier-safety-frameworks)
- [Alignment concepts](#alignment-concepts)
- [Scaling trends and limits: compute, cost, data and power](#scaling-trends-limits)
- [Measuring AI's economic impact](#economic-impact-evidence)
- [Self-improving and automated research systems](#self-improving-systems)
