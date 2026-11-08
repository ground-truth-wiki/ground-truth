---
id: ai-energy
book: 15
order: "15.12"
title: Energy, power and AI data centers
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [energy, data-centers, power, sustainability, pue]
visuals: []
prerequisites: [inference-fundamentals, hardware]
---
> [!tldr]
> AI's energy use is measured at very different boundaries, from one GPU during one request to a whole data center over a year, so honest published figures can differ by factors. Per request, energy depends on how many tokens are generated and how busy the hardware is kept; at grid scale, data centers used about 1.5% of the world's electricity in 2024, but demand is growing fast and grid connections can delay new sites. Remember to ask what is inside the boundary, and which year and scenario a figure belongs to, before you compare two numbers.

## Key ideas

- **Boundaries change the number.** Google measured the median Gemini Apps text prompt in May 2025 at 0.24 Wh when counting active accelerators, host CPU and DRAM, idle machines held in reserve and data-center overhead, but at 0.10 Wh under a narrower approach that counts only the active accelerators, in the 10% most energy-efficient data centers (Elsworth et al., [“Measuring the environmental impact of delivering AI at Google Scale”](https://arxiv.org/abs/2508.15734) (2025)). The same study reports 0.03 gCO2e (market-based Scope 2 emissions from electricity plus Scope 1 and 3 emissions of the serving hardware, including the embodied emissions of making it) and 0.26 mL of water consumed per median prompt and leaves out training, external networking and end-user devices, so read any provider's figure for its boundary, its statistic (here a median) and its date ([Elsworth et al.](https://arxiv.org/html/2508.15734)).
- **Measuring and benchmarking.** GPU telemetry exposes cumulative counters, such as NVML's total energy in millijoules since the driver was last reloaded, so a run's energy is the difference between two readings ([NVML energy counter](https://nvidia.github.io/cuda-python/cuda-bindings/13.3.1/module/generated/cuda.bindings.nvml.device_get_total_energy_consumption.html)), and the ML.ENERGY Benchmark uses this kind of software-based GPU measurement to report energy per generated response, with a public leaderboard (Chung et al., [“The ML.ENERGY Benchmark: Toward Automated Inference Energy Measurement and Optimization”](https://arxiv.org/abs/2505.06371) (2025)). Other public results use other boundaries: as of November 2026, AI Energy Score reports H100 GPU energy in watt-hours per 1,000 queries with 1 to 5 stars relative to the other models on the same task ([AI Energy Score](https://huggingface.github.io/AIEnergyScore/)), InferenceX reports joules per token (total, input and output) and attaches chip power telemetry to each run ([InferenceX FAQ](https://inferencex.semianalysis.com/about)), and MLPerf Power sets rules for comparable measurements from microwatts to megawatts, with 1,841 reproducible measurements from 60 systems analyzed in its paper (Tschand et al., [“MLPerf Power: Benchmarking the Energy Efficiency of Machine Learning Systems from Microwatts to Megawatts for Sustainable AI”](https://arxiv.org/abs/2410.12032) (2024)).
- **What drives energy per request.** In the ML.ENERGY Benchmark, reasoning models generate one to two orders of magnitude more output tokens per request than chat models, batch size strongly affects both time and energy, and a larger model can use less energy than a smaller one when the smaller one's KV cache keeps it from reaching larger batches ([Chung et al.](https://arxiv.org/html/2505.06371)). Its automated configuration recommendations sometimes save more than 40% without changing what the model computes ([Chung et al., 2025](https://arxiv.org/abs/2505.06371)); see [benchmarking inference servers](#inference-benchmarking) for the load and length controls that make such numbers comparable.
- **Inside the facility: PUE and water.** Power usage effectiveness (PUE) compares total facility energy with the energy used by IT equipment, so 2.0 means one watt of overhead, such as cooling and power distribution, for every watt of IT; Google reports a 2025 fleet PUE of 1.09 against a 1.54 average in the Uptime Institute's 2025 survey ([Google data centers, Efficiency](https://datacenters.google/efficiency/)), and by definition PUE measures overhead, not how useful the IT work is. Water needs two distinctions, withdrawal versus consumption (withdrawal minus discharge) and on-site cooling water versus off-site water used to generate the electricity: Li et al. estimate that training GPT-3 in Microsoft's US data centers consumed about 5.4 million liters, 700,000 of them on site, and show that water efficiency varies with location and time (Li et al., [“Making AI Less ‘Thirsty’: Uncovering and Addressing the Secret Water Footprint of AI Models”](https://arxiv.org/abs/2304.03271) (2023)).
- **Grid scale: demand and constraints.** The IEA estimates that data centers used 415 TWh in 2024, about 1.5% of global electricity, and projects around 945 TWh by 2030 in its Base Case, with 2035 scenarios from 700 to 1,700 TWh and renewables meeting about half of the growth, natural gas and nuclear about 175 TWh each ([IEA, Energy and AI: Executive summary](https://www.iea.org/reports/energy-and-ai/executive-summary) (2025)); for the United States, LBNL estimated 176 TWh, about 4.4% of electricity, in 2023 and 325 to 580 TWh, about 6.7 to 12%, by 2028 ([US DOE, 20 December 2024](https://www.energy.gov/articles/doe-releases-new-report-evaluating-increase-electricity-demand-data-centers)). Energy is a small cost but a hard limit: it was 2 to 6% of the cost of developing frontier models in Epoch AI's estimate ([Cottier et al., Epoch AI, 2024](https://epoch.ai/blog/how-much-does-it-cost-to-train-frontier-ai-models)), xAI's Colossus needed about 300 MW for about 200,000 chips in March 2025 (Pilz et al., [“Trends in AI Supercomputers”](https://arxiv.org/abs/2504.16026) (2025)), and the IEA estimates that around 20% of planned data-center projects could face delays if grid risks are not addressed ([IEA](https://www.iea.org/reports/energy-and-ai/executive-summary)).
- **The contested debate.** The case for concern: data-center emissions rise from 180 Mt today to 300 Mt by 2035 in the IEA's Base Case and up to 500 Mt in its Lift-Off Case ([IEA](https://www.iea.org/reports/energy-and-ai/executive-summary)), and efficiency gains can raise total resource use through rebound effects, the Jevons paradox (Luccioni et al., [“From Efficiency Gains to Rebound Effects: The Problem of Jevons' Paradox in AI's Polarized Environmental Debate”](https://arxiv.org/abs/2501.16548) (2025)). The case against alarm: Google reports that from May 2024 to May 2025 software efficiencies cut energy per median prompt 33-fold, and that, together with cleaner electricity, its carbon footprint fell 44-fold ([Elsworth et al.](https://arxiv.org/abs/2508.15734)), data-center emissions stay below 1.5% of energy-sector emissions in the IEA's outlook, and the IEA judges that AI applications could cut emissions by far more than data centers emit, though by far less than climate goals need, calling AI "not a silver bullet" ([IEA](https://www.iea.org/reports/energy-and-ai/executive-summary)).

## Planned visuals

- **`diagram`:** the nested boundaries for one prompt, from the active accelerator to host CPU and DRAM, idle reserve machines, facility overhead (PUE) and the grid behind it for carbon and water, each layer marked with what Elsworth et al. included or left out and linked to its chapter.
- **`calculator`:** energy and carbon per request from measured accelerator energy over a run and the number of requests served, then scaled by a host factor, PUE and a grid carbon intensity the reader enters, with every assumption shown and tests.
- **`chart`:** global data-center electricity use, the IEA's 2024 estimate and its 2030 and 2035 projections with the scenario range as a band; real data with source and date.

## Talk like an expert

Experts state energy with its unit and its boundary (watt-hours per prompt at the facility, joules per token on the GPU, terawatt-hours per year for a country), separate water withdrawal from consumption, and treat carbon as energy times a grid intensity under a named accounting method. In debates they keep per-request efficiency and total demand apart, and when a customer's sustainability questionnaire asks for an AI feature's footprint, they answer with a boundary, a date and a source for every number.

## Go deeper

- Elsworth et al., [“Measuring the environmental impact of delivering AI at Google Scale”](https://arxiv.org/abs/2508.15734) (2025).
- Chung et al., [“The ML.ENERGY Benchmark: Toward Automated Inference Energy Measurement and Optimization”](https://arxiv.org/abs/2505.06371) (2025).
- IEA, [Energy and AI: Executive summary](https://www.iea.org/reports/energy-and-ai/executive-summary) (2025).
- Li et al., [“Making AI Less ‘Thirsty’: Uncovering and Addressing the Secret Water Footprint of AI Models”](https://arxiv.org/abs/2304.03271) (2023).

## Related

- [Hardware](#hardware)
- [Benchmarking inference servers](#inference-benchmarking)
- [Cost engineering](#cost-engineering)
- [Scaling trends and limits: compute, cost, data and power](#scaling-trends-limits)
- [Compute governance: chips, supply chains and export controls](#compute-governance)
- [Edge and on-device AI](#edge-on-device)
