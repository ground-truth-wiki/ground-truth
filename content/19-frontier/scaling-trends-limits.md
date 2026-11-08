---
id: scaling-trends-limits
book: 19
order: "19.8.1"
title: "Scaling trends and limits: compute, cost, data and power"
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [scaling, trends, compute, data-wall, energy, forecasting]
visuals:
  - scaling-trends-limits-rates:chart
  - scaling-trends-limits-ceilings:chart
  - scaling-trends-limits-wait-calculator:calculator
  - scaling-trends-limits-debate:compare
prerequisites: [scaling-laws, hardware]
---
> [!tldr]
> Frontier training compute grows about 4 to 5 times a year and training cost 2.4 to 3.5 times, while the cost of reaching a fixed level of performance falls about 13 times a year (Epoch AI, as of November 2026). Epoch's 2024 analysis finds runs of about 2e29 FLOP feasible by 2030, with power likely the first limit to bind. Read every rate with its period, interval and boundary.

## Why it matters

Engineering plans bet on trends: tokens get cheaper, a good-enough model arrives next year, a workaround soon becomes dead weight. Such bets are only as good as their measurements. This chapter is the numbers side of [open problems and big debates](#open-problems).

## Intuition

Think of AI progress as savings accounts, each compounding at its own rate. Compute spending compounds fast, chip price-performance slowly, and the price of a fixed capability falls fastest of all. Every account also has a ceiling: a power grid, a chip factory, a stock of human text.

```viz
{"id":"scaling-trends-limits-rates","component":"chart","type":"dot","title":"Each AI trend compounds at its own rate, from 1.3 times to hundreds of times a year","caption":"Measured yearly multipliers from Epoch AI. Each covers its own period, so hover a dot for its note. Log scale. Compute grows faster than cost because hardware gets cheaper; memory bandwidth grows slowest of all.","alt":"Log-scale dot plot of yearly multipliers: inference price drops per token at fixed capability of 900 times (fastest task), 40 times (GPT-4 level on PhD-level science) and 9 times (slowest task); cost per task at a fixed performance level, tokens included, falling 13 times since 2023; training compute of frontier language models 5 times since 2020; notable models 4.1 times from 2010 to 2024; frontier training cost 3.5 times since 2020 and 2.4 times since 2016; OpenAI annualized revenue 3.2 times since 2024; algorithmic efficiency about 2.8 times, computed from an 8-month halving time; AI chip performance per dollar 1.49 times since 2023; GPU memory bandwidth 1.28 times since 2008.","data":"real","source":"Epoch AI: trends dashboard (updated February 2026); Sevilla and Roldán (2024); Cottier et al. (2024); Ho et al. (2024); Cottier et al., LLM inference price trends (2025); Emberson and Roodman, The plunging price of thought (2026)","asof":"2026-09","depicts":"Epoch AI estimates published May 2024 to September 2026","try":"Hover the three per-token price dots: one trend, measured on different tasks, spans 9 to 900 times a year.","groups":[{"name":"Change per year","unit":"×","items":[
{"label":"Price drop, fastest task","value":900,"kind":"sourced","note":"price per token at fixed capability, three years to early 2025; the fastest drops are recent and may not last"},
{"label":"Price drop, GPT-4 level, science","value":40,"kind":"sourced","note":"price per token for a GPT-4-level score on GPQA Diamond, PhD-level science questions"},
{"label":"Cost drop, fixed performance","value":13,"kind":"sourced","note":"cost per task with tokens included, about 47% per quarter since 2023, five benchmarks; 7 to 10 on game puzzles, 16 to 19 on math"},
{"label":"Price drop, slowest task","value":9,"kind":"sourced","note":"price per token at fixed capability, three years to early 2025"},
{"label":"Training compute, frontier LLMs","value":5,"kind":"sourced","note":"since 2020; 90% CI 4 to 6"},
{"label":"Training compute, notable models","value":4.1,"kind":"sourced","note":"2010 to May 2024; 90% CI 3.7 to 4.6"},
{"label":"Training cost, frontier, since 2020","value":3.5,"kind":"sourced","note":"frontier language models; 90% CI 2.8 to 4.4"},
{"label":"OpenAI annualized revenue","value":3.2,"kind":"sourced","note":"since 2024; 90% CI 3.0 to 3.4"},
{"label":"Algorithmic efficiency","value":2.83,"kind":"sourced","note":"computed: an 8-month halving time is 2^(12/8) per year; 95% CI 5 to 14 months; 2012 to 2023, pretraining only"},
{"label":"Training cost, frontier, since 2016","value":2.4,"kind":"sourced","note":"amortized hardware and energy; 90% CI 2.0 to 2.9"},
{"label":"AI chip performance per dollar","value":1.49,"kind":"sourced","note":"since 2023; 90% CI 1.36 to 1.66"},
{"label":"GPU memory bandwidth","value":1.28,"kind":"sourced","note":"since 2008; 90% CI 1.24 to 1.33"}]}]}
```

## How it works

**Who measures, and how.** Most numbers here come from Epoch AI's open databases of over 3,700 models, 180 accelerators and 500 GPU clusters ([Epoch AI data](https://epoch.ai/data)), which Stanford HAI's yearly [AI Index](https://hai.stanford.edu/ai-index/2025-ai-index-report) also draws on. Few labs publish training compute, so Epoch estimates it from operation counts (about 6 × parameters × tokens, see [scaling laws](#scaling-laws)), from chips × peak FLOP/s × time × utilization, or from benchmark scores. Each estimate has a 90% interval of 3 times ("confident"), 10 times ("likely") or 31 times ("speculative") either way ([Epoch documentation](https://epoch.ai/data/ai-models-documentation/estimation)). See [compute accounting](#compute-accounting).

**The measured trends.**
- **Compute.** Frontier models grew 4 to 5 times a year from 2010 to May 2024 ([Sevilla and Roldán, 2024](https://epoch.ai/blog/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year)), frontier language models about 5 times since 2020 ([Epoch trends](https://epoch.ai/trends), updated February 2026).
- **Cost.** The amortized cost of the largest runs grew 2.4 times a year from 2016 (Cottier et al., [“The rising costs of training frontier AI models”](https://arxiv.org/abs/2405.21015), 2024). Hardware is 47 to 67% of development cost, staff 29 to 49% and energy only 2 to 6% ([Epoch AI](https://epoch.ai/blog/how-much-does-it-cost-to-train-frontier-ai-models)). Since 2020 the rate is 3.5 times ([Epoch trends](https://epoch.ai/trends)).
- **Hardware.** Chip performance per dollar has improved 49% a year since 2023, GPU memory bandwidth only 28% a year since 2008 ([Epoch trends](https://epoch.ai/trends)). Over 20 years, peak server FLOPS grew 3.0 times every two years and DRAM bandwidth 1.6 times: the **memory wall** (Gholami et al., [“AI and Memory Wall”](https://arxiv.org/abs/2403.14123), 2024). See [hardware](#hardware).
- **Algorithms.** The compute needed for a fixed performance halved about every 8 months from 2012 to 2023 (95% CI 5 to 14 months), though growth in compute contributed even more to progress (Ho et al., [“Algorithmic progress in language models”](https://arxiv.org/abs/2403.05812), 2024). See [new architectures](#new-architectures).
- **Inference prices.** At fixed capability, the price per token fell 9 to 900 times a year by task, over three years to early 2025 ([Cottier et al., Epoch AI, 2025](https://epoch.ai/data-insights/llm-inference-price-trends)). Counting the tokens each task uses, Epoch's September 2026 estimate puts the fall in cost at a fixed level of performance at about 13 times a year since 2023: 7 to 10 times on game puzzles, 16 to 19 times on math ([Emberson and Roodman, 2026](https://epoch.ai/publications/the-plunging-price-of-thought)).
- **Thresholds.** By June 2025, Epoch counted 33 publicly announced models estimated above 10^25 FLOP, the level above which the EU AI Act presumes systemic risk ([Article 51](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-51)) ([Epoch AI](https://epoch.ai/data-insights/models-over-1e25-flop)). See [governance](#governance-regulation).

**The limits.** Sevilla et al. ([“Can AI scaling continue through 2030?”](https://epoch.ai/blog/can-ai-scaling-continue-through-2030), 2024) estimate the largest run each limit allows by 2030.
- **Power.** Campuses of 1 to 5 GW look possible; a 2e29 FLOP run needs about 6 GW. A data center with 1 GW of IT power takes about two years and roughly $38 billion to build ([Epoch trends](https://epoch.ai/trends)). See [energy and AI data centers](#ai-energy).
- **Chips.** The 2030 report finds advanced packaging and high-bandwidth memory, not wafers, limiting output. One company, TSMC, fabricates almost every leading AI chip ([AI Index 2026](https://hai.stanford.edu/ai-index/2026-ai-index-report)).
- **Data.** Training sets reach the roughly 300 trillion tokens of quality-adjusted public human text between 2026 and 2032 on current trends, or by 2027 if models are overtrained 5 times (Villalobos et al., [“Will we run out of data?”](https://arxiv.org/abs/2211.04325), revised 2024). The authors name [synthetic data](#synthetic-data), other modalities and data efficiency as the routes past it, and say new innovations will be needed to keep progress going beyond 2030 ([Epoch AI](https://epoch.ai/blog/will-we-run-out-of-data-limits-of-llm-scaling-based-on-human-generated-data)). Counting images, video and audio, the 2030 report finds 400 trillion to 20 quadrillion effective tokens.
- **Latency.** Each training step takes a minimum time and bigger batches help only up to a critical size, which caps runs at about 3e30 to 1e32 FLOP, well beyond the 2e29 headline.
- **Money.** Feasible is not funded: reaching this scale depends on labs' willingness to invest "hundreds of billions of dollars".

```viz
{"id":"scaling-trends-limits-ceilings","component":"chart","type":"bar","title":"Power is the limit most likely to bind first on 2030 training runs","caption":"Epoch AI's estimated range for the largest training run each limit allows by 2030, low and high ends, log scale. Dashed lines: Epoch's estimate for GPT-4 and its headline estimate of what is feasible by 2030, about 10,000 times larger. These are uncertain estimates, not measurements.","alt":"Bar chart, log scale, of the largest feasible 2030 training run per limit: power at one campus 1e28 to 3e29 FLOP, power across distributed sites 2e28 to 2e30, chip supply 1e29 to 5e30, data 6e28 to 2e32, latency wall 3e30 to 1e32. Reference lines at 2e25 FLOP for GPT-4 and 2e29 FLOP for the 2030 estimate.","data":"real","source":"Sevilla et al., “Can AI scaling continue through 2030?”, Epoch AI","asof":"2024-08","depicts":"Epoch AI estimates published August 2024","try":"Compare the high ends: power at one campus tops out lowest, and Epoch expects power to bind first, followed by chip supply.","categories":["Power, one site","Power, many sites","Chip supply","Data","Latency wall"],"y":{"label":"Largest run (FLOP, log)","unit":"flop","log":true,"min":1e25},"series":[{"name":"Low end","points":[[0,1e28],[1,2e28],[2,1e29],[3,6e28],[4,3e30]]},{"name":"High end","points":[[0,3e29],[1,2e30],[2,5e30],[3,2e32],[4,1e32]]}],"bands":[{"y":2e25,"label":"GPT-4, about 2e25"},{"y":2e29,"label":"Feasible by 2030, about 2e29"}]}
```

**Where compute goes now.** OpenAI said o3 used 10 times o1's training compute, which Epoch reads as almost certainly reasoning training compute. In May 2025, Epoch projected that at that pace reasoning training could catch up with total frontier training compute perhaps within a year, then slow to the overall rate of about 4 times a year ([You, 2025](https://epoch.ai/gradient-updates/how-far-can-reasoning-models-scale)). Of OpenAI's estimated $7 billion of 2024 compute, $1.8 billion went to inference and $5 billion to R&D, mostly experiments rather than final runs ([Epoch AI](https://epoch.ai/data-insights/openai-compute-spend)). [Test-time scaling](#test-time-scaling) moves cost from training to every use, weakening training-compute thresholds (Ord, [“Inference Scaling Reshapes AI Governance”](https://arxiv.org/abs/2503.05705), 2025).

## In practice

Trends are priors for three decisions.
- **Cost forecasts.** Divide the per-token price decline at your capability by the growth in tokens per task. Answers from reasoning models grew about 5 times longer a year on three benchmarks Epoch tracks (90% CI 2 to 13, [April 2025](https://epoch.ai/data-insights/output-length)). Epoch's 13 times a year already counts tokens, so do not divide it again.
- **Build now or wait.** If shipping now is worth more than waiting saves, build now, behind a gateway, pinned versions and evals, so a cheaper model drops in. See [cost engineering](#cost-engineering).
- **When a workaround expires.** Date every workaround for a model weakness and re-test it at each upgrade. Task-length trends are in [measuring time horizons](#measuring-time-horizons).

```viz
{"id":"scaling-trends-limits-wait-calculator","component":"calculator","title":"Cost per task falls by the price trend divided by the growth in tokens per task","caption":"Formula view. Illustrative default inputs, not measured values. Measured per-token price declines at fixed capability ranged from 9 to 900 times a year by task (Epoch AI, March 2025), but growing tokens per task eat into them.","alt":"Calculator: from today's cost per task, a target cost, the yearly price decline and the yearly growth in tokens per task, it computes the net yearly decline, the years until the target and the months for cost per task to halve.","data":"formula","try":"Set token growth to 5: the net decline drops to 2 times a year and the wait more than doubles.","inputs":{"cost_now":0.4,"target_cost":0.1,"price_decline":10,"token_growth":2},"input_meta":{"cost_now":{"label":"Cost per task today","unit":"USD","min":0,"step":0.01},"target_cost":{"label":"Cost per task you need","unit":"USD","min":0,"step":0.01},"price_decline":{"label":"Price decline per year at fixed capability","unit":"×","min":1,"step":0.5},"token_growth":{"label":"Growth in tokens per task per year","unit":"×","min":1,"step":0.5}},"outputs":[{"id":"net_decline","label":"Net decline in cost per task per year","expr":"price_decline / token_growth","unit":"x"},{"id":"years","label":"Years until the target","expr":"ln(cost_now / target_cost) / ln(net_decline)","unit":"years","main":true},{"id":"halving_months","label":"Months for cost per task to halve","expr":"12 * ln(2) / ln(net_decline)","unit":"months"}],"assumptions":["Both trends hold at a constant rate; real trends bend, and the fastest price drops are the least certain.","The decline is at fixed capability: you must be able to switch to the cheaper model that matches today's quality.","If tokens per task grow as fast as or faster than prices fall, the result is negative or empty: on trend, the target never arrives."],"tests":[{"inputs":{"cost_now":1,"target_cost":0.01,"price_decline":10,"token_growth":1},"expect":{"net_decline":10,"years":2}},{"inputs":{"cost_now":0.8,"target_cost":0.1,"price_decline":4,"token_growth":2},"expect":{"net_decline":2,"years":3,"halving_months":12}}]}
```

The same arithmetic in Python:

```python
import math

def doubling_months(factor_per_year: float) -> float:
    """Months for a quantity changing by `factor_per_year` to change by 2x."""
    return 12 * math.log(2) / math.log(factor_per_year)

def years_until(cost_now: float, target: float,
                price_decline: float, token_growth: float = 1.0) -> float:
    net = price_decline / token_growth
    if net <= 1:
        return math.inf  # on trend, the target never arrives
    return max(0.0, math.log(cost_now / target) / math.log(net))

print(round(doubling_months(5), 1))              # 5.2 months at 5x per year
print(round(years_until(0.40, 0.10, 10, 2), 2))  # 0.86 years, illustrative inputs
```

## Numbers to know

> [!number]
> Estimates, not laws, as of November 2026 (Epoch AI). Training cost: 2.4× to 3.5× a year; energy is 2 to 6% of development cost. Compute for fixed performance halved every 8 months from 2012 to 2023. Price per token at fixed capability: 9× to 900× cheaper a year by task, to early 2025. Cost at a fixed performance level, tokens included: about 13× cheaper a year since 2023. Rule of thumb: k× a year doubles every 12 × ln 2 ÷ ln k months.

## Pitfalls and anti-patterns

> [!pitfall] Extrapolating an exponential past its ceiling
> Every trend ends at power, chips, data or money. Forecast with the limit, not only the rate, and keep horizons short.

> [!pitfall] Comparing numbers with different boundaries
> "Training cost" can mean the final run, amortized hardware or cloud rental, which Epoch finds about twice as high on average ([Cottier et al., Epoch AI](https://epoch.ai/blog/how-much-does-it-cost-to-train-frontier-ai-models)). Check period, method and interval before comparing rates.

- **Cherry-picked benchmarks.** One price trend spans 9× to 900× a year by task; use the task closest to yours ([benchmark literacy](#benchmark-literacy)).

## Talk like an expert

The vocabulary: **effective compute**, **OOM per year**, **amortized cost**, **data wall**, **overtraining**, **latency wall**, **H100-equivalents**. Experts quote a rate with its period and interval ("5× a year since 2020, 90% CI 4 to 6") and name the limit that binds. The live debate is whether scaling is slowing. Skeptics cite poor returns per unit of compute ([Ord, 2025](https://www.tobyord.com/writing/the-scaling-paradox)) and spending far ahead of revenue ([Cahn, Sequoia, 2024](https://sequoiacap.com/article/ais-600b-question/)). Optimists cite the 2030 analysis and test-time compute (Snell et al., [“Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters”](https://arxiv.org/abs/2408.03314), 2024). Timelines built on this are in [AGI, timelines and risk](#agi-timelines-risk).

```viz
{"id":"scaling-trends-limits-debate","component":"compare","title":"Both sides of the scaling debate read the same trends; they disagree about how long the spending lasts","caption":"Hover the marks. Each claim is sourced in the text or in its note; dated as of November 2026.","alt":"Comparison. Scaling is slowing: poor returns per unit of compute, training cost growing 3.5 times a year, a gap of about 500 billion dollars between spending and revenue estimated in 2024, public text used up between 2026 and 2032, reasoning-training growth that cannot last. Scaling continues: compute growing 5 times a year, 2e29 FLOP feasible by 2030, OpenAI's revenue growing 3.2 times a year and algorithms halving compute every 8 months, synthetic data, other modalities and data efficiency as routes past the data wall, and test-time compute as a second axis.","data":"real","source":"Ord (2025); Cahn, Sequoia (2024); Villalobos et al. (2024); You, Epoch AI (2025); Epoch AI trends; Sevilla et al. (2024); Ho et al. (2024); Snell et al. (2024)","asof":"November 2026","depicts":"As of November 2026","mono":false,"a":{"title":"Scaling is slowing","text":"Returns per unit of compute are poor: on one classic scaling-law graph, halving the loss took a million times more compute (Ord, 2025).\nFrontier training cost grows about 3.5 times a year.\nIn 2024 one investor estimated a hole of about $500 billion between AI infrastructure spending and AI revenue (Cahn, Sequoia).\nPublic human text is fully used between 2026 and 2032 on current trends.\nReasoning-training compute grew 10 times from o1 to o3, a pace that lasts only until it catches up with total training compute.","mono":false},"b":{"title":"Scaling continues","text":"Frontier training compute still grows about 5 times a year.\nRuns of about 2e29 FLOP, some 10,000 times GPT-4, look feasible by 2030 (Sevilla et al., 2024).\nOpenAI's annualized revenue grows about 3.2 times a year, and better algorithms halved the compute needed every 8 months from 2012 to 2023.\nSynthetic data, other modalities and data efficiency are routes past the data wall.\nTest-time compute is a second axis: matched for compute, a smaller model can beat a 14 times larger one on prompts it already sometimes solves (Snell et al., 2024).","mono":false},"links":[{"a":"halving the loss took a million times more compute","b":"still grows about 5 times a year","note":"Both hold at once. Fast compute growth buys steady progress despite poor returns per unit; the question is how long the spending can last."},{"a":"grows about 3.5 times a year","b":"grows about 3.2 times a year","note":"Costs and revenue grow at similar rates, over different periods (since 2020 and since 2024). The debate is about levels and about how long both rates last."},{"a":"Public human text is fully used between 2026 and 2032","b":"routes past the data wall","note":"The data study's own authors name these routes, and say new innovations will be needed to keep progress going beyond 2030."},{"a":"a pace that lasts only until it catches up with total training compute","b":"Test-time compute is a second axis","note":"A new axis starts small and can grow fast, then slows to the overall rate once it is a large share of compute (You, Epoch AI, 2025)."}]}
```

> [!hottake] Power, not data, is the real wall.
> **The counterargument:** power is a money and permitting problem that training across several sites can partly route around, while running out of good data may need new ideas that no budget can buy.

## Check yourself

```quiz
scaling-trends-limits
```

## Go deeper

- Sevilla et al., [“Can AI scaling continue through 2030?”](https://epoch.ai/blog/can-ai-scaling-continue-through-2030) (Epoch AI, 2024).
- Villalobos et al., [“Will we run out of data? Limits of LLM scaling based on human-generated data”](https://arxiv.org/abs/2211.04325) (2022, revised 2024).

## Related

- [Scaling laws and compute](#scaling-laws)
- [Compute accounting](#compute-accounting)
- [Measuring time horizons](#measuring-time-horizons)
- [Energy, power and AI data centers](#ai-energy)
- [Cost engineering](#cost-engineering)
- [AGI, timelines and risk](#agi-timelines-risk)
