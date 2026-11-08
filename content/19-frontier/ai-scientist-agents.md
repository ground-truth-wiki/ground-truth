---
id: ai-scientist-agents
book: 19
order: "19.4.2"
title: AI scientist agents and autonomous labs
level: frontier
stability: volatile
reviewed: "2026-11"
status: seed
tags: [ai-scientist, automated-research, hypothesis-generation, self-driving-labs, research-agents]
visuals: []
prerequisites: [self-improving-systems, deep-research]
---
> [!tldr]
> AI scientist agents try to run the research loop themselves: propose ideas, write and run experiments, analyze the results and write them up, sometimes with robots doing the lab work. They have produced workshop-level papers and lab-validated hypotheses, and also citation errors, flawed analyses and overclaimed novelty. Remember that a generated result counts only after independent replication and review, and that these agents differ from [deep research](#deep-research) systems, which synthesize sources but run no experiments.

## Key ideas

- **The end-to-end loop: idea, code, experiment, paper, review.** The AI Scientist generates research ideas, writes code, runs experiments, plots results, writes a full paper and runs a simulated review, at less than USD 15 per paper, in three machine learning subfields (Lu et al., [“The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery”](https://arxiv.org/abs/2408.06292) (2024)). Its claim that some papers exceed a top conference's acceptance threshold rests on its own automated reviewer, which is why who reviews matters as much as who writes.
- **A fully generated paper scored above a workshop's acceptance bar.** The AI Scientist-v2 replaces code templates with agentic tree search run by an experiment manager agent, and one of three fully generated manuscripts submitted to an ICLR 2025 workshop scored above the average human acceptance threshold; the authors withdrew it before publication, as agreed with the organizers (Yamada et al., [“The AI Scientist-v2: Workshop-Level Automated Scientific Discovery via Agentic Tree Search”](https://arxiv.org/abs/2504.08066) (2025)). Their own review of the generated papers found citation inaccuracies, a figure that contradicted the paper's claims and about 57% overlap between training and test data ([Yamada et al., 2025](https://arxiv.org/abs/2504.08066)).
- **Hypothesis generators propose, critique and rank ideas.** The AI co-scientist is a multi-agent system built on Gemini that generates, critiques and refines hypotheses through tournament evolution and scales with test-time compute; its drug-repurposing candidates for acute myeloid leukemia were validated in vitro (Gottweis et al., [“Accelerating scientific discovery with Co-Scientist”](https://arxiv.org/abs/2502.18864) (2025)). Kosmos shares a structured world model between a data-analysis agent and a literature agent over runs of up to 12 hours, cites every statement to code or literature, and independent scientists judged 79.4% of its report statements accurate (Mitchener et al., [“Kosmos: An AI Scientist for Autonomous Discovery”](https://arxiv.org/abs/2511.02824) (2025)).
- **Lab-in-the-loop agents touch the physical world.** An LLM-based agent designed, planned and executed experiments, including catalyzed cross-coupling reactions, and its authors discussed how to prevent misuse (Boiko et al., [“Emergent autonomous scientific research capabilities of large language models”](https://arxiv.org/abs/2304.05332) (2023)). The A-Lab ran autonomous synthesis for 17 days, combining computation, literature data, machine learning, active learning and robotics (Szymanski et al., [“An autonomous laboratory for the accelerated synthesis of inorganic materials”](https://pmc.ncbi.nlm.nih.gov/articles/PMC10700133) (2023)), and a re-examination of its products argued that, contrary to the original paper, it had discovered no new materials (Leeman et al., [“Challenges in High-Throughput Inorganic Materials Prediction and Autonomous Synthesis”](https://journals.aps.org/prxenergy/abstract/10.1103/PRXEnergy.3.011002) (2024)).
- **Research benchmarks show how far agents still are.** PaperBench asks agents to replicate 20 ICML 2024 papers from scratch, graded on 8,316 rubric items by an LLM judge; the best agent averaged 21.0% at launch in April 2025, and models did not yet outperform top ML PhDs who attempted a subset (Starace et al., [“PaperBench: Evaluating AI's Ability to Replicate AI Research”](https://arxiv.org/abs/2504.01848) (2025)). RE-Bench, MLE-bench and the time-horizon method are covered in [measuring time horizons](#measuring-time-horizons).
- **Norms for AI-authored research are being written now.** ICLR 2026 requires authors to disclose LLM use, holds them responsible for its output and desk-rejects papers with hallucinated references ([ICLR blog, November 2025](https://blog.iclr.cc/2025/11/19/iclr-2026-response-to-llm-generated-papers-and-reviews/)), while the Agents4Science 2025 conference required AI systems as primary authors and used AI reviewers ([Agents4Science 2025](https://agents4science.stanford.edu)). Both are dated snapshots as of November 2026, and venue rules change quickly.

## Planned visuals

- `diagram`: the research loop (ideation, code, experiments, analysis, write-up, review) with the typical failure at each stage marked, such as unverifiable ideas, buggy code, leaked test data, fabricated citations and a reviewer that can be gamed.
- `tree`: the system families with their best-documented examples and how each was validated: end-to-end paper writers, hypothesis generators, data-driven discovery agents and lab-in-the-loop systems.
- `stepper`: auditing an AI-generated result step by step: trace each claim to code or a source, rerun the code, check the data splits, verify every citation, and send it to an independent reviewer.

## Talk like an expert

Experts ask which stage was automated and how the result was validated: "accepted by its own reviewer", "passed human peer review", "reproduced from code" and "validated in the wet lab" are very different claims. They talk about provenance, replication, statement accuracy and novelty checks, and treat a fluent paper as a lead to verify, not a finding.

## Go deeper

- Lu et al., [“The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery”](https://arxiv.org/abs/2408.06292) (2024).
- Yamada et al., [“The AI Scientist-v2: Workshop-Level Automated Scientific Discovery via Agentic Tree Search”](https://arxiv.org/abs/2504.08066) (2025).
- Gottweis et al., [“Accelerating scientific discovery with Co-Scientist”](https://arxiv.org/abs/2502.18864) (2025).
- Mitchener et al., [“Kosmos: An AI Scientist for Autonomous Discovery”](https://arxiv.org/abs/2511.02824) (2025).

## Related

- [Self-improving and automated research systems](#self-improving-systems)
- [Evolutionary program search with LLMs](#evolutionary-program-search)
- [Deep research systems](#deep-research)
- [Research and analyst agents](#research-analyst-agents)
- [Measuring time horizons and AI R&D capability](#measuring-time-horizons)
- [AI for biology: proteins, design and genomic models](#ai-for-biology)
