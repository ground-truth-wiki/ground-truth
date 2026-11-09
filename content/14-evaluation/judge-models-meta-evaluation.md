---
id: judge-models-meta-evaluation
book: 14
order: "14.5.1"
title: Judge models, juries and meta-evaluation
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [llm-judge, meta-evaluation, judge-bias, reward-models, calibration]
visuals: []
prerequisites: [llm-as-judge, eval-statistics]
---
> [!tldr]
> A judge model is an LLM, prompted or fine-tuned, that grades other models' outputs, and a jury combines several of them. Meta-evaluation measures the judge itself: how often it agrees with people or with objectively labeled answers, which biases it has, and how much error it adds to every score it produces. The one thing to remember: a judge is a classifier with error rates you can measure, so measure them and correct the scores it gives you.

## Key ideas

- **Pick the judge format to fit the question.** Zheng et al. define pairwise comparison (which of two answers is better), single-answer grading (score one answer) and reference-guided grading (grade against a reference solution), and found GPT-4 as a judge reached over 80% agreement with human preferences, the level at which humans agree with each other ([Zheng et al., “Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena” (2023)](https://arxiv.org/abs/2306.05685)). G-Eval has the judge write its own evaluation steps, fill in a form, and weight each possible score by its token probability, and it warns that LLM evaluators may favor LLM-written text ([Liu et al., “G-Eval: NLG Evaluation using GPT-4 with Better Human Alignment” (2023)](https://arxiv.org/abs/2303.16634)); for labels you will act on, binary pass or fail is applied more consistently than a 1-to-5 Likert scale, whose neighboring points, such as 3 and 4, are judged subjectively and inconsistently across annotators ([Husain and Shankar, “AI Evals: Everything You Need to Know” (2026)](https://hamel.dev/blog/posts/evals-faq/)).
- **Fine-tuned open judges are the alternative to prompting a frontier model.** Prometheus 2 is an open evaluator model that does both direct assessment and pairwise ranking against criteria the user writes ([Kim et al., “Prometheus 2: An Open Source Language Model Specialized in Evaluating Other Language Models” (2024)](https://arxiv.org/abs/2405.01535)), and JudgeLM fine-tunes 7B to 33B judges, using swap augmentation, reference support and reference drop against position, knowledge and format bias; its 7B judge grades 5,000 samples in about 3 minutes on 8 A100 GPUs ([Zhu et al., “JudgeLM: Fine-tuned Large Language Models are Scalable Judges” (2023)](https://arxiv.org/abs/2310.17631)). A fine-tuned judge is close kin to a generative [reward model](#reward-modeling), and reward models are tested the same way, on prompt, chosen and rejected trios ([Lambert et al., “RewardBench: Evaluating Reward Models for Language Modeling” (2024)](https://arxiv.org/abs/2403.13787)).
- **Juries trade one large judge for several small ones.** A Panel of LLM evaluators (PoLL) made of smaller models from disjoint model families beat a single large judge across three judge settings and six datasets, with less intra-model bias, at over seven times lower cost ([Verga et al., “Replacing Judges with Juries: Evaluating LLM Generations with a Panel of Diverse Models” (2024)](https://arxiv.org/abs/2404.18796)). The FACTS Grounding leaderboard likewise aggregates several judge models into its factuality score to reduce the bias of any one of them ([Jacovi et al., “The FACTS Grounding Leaderboard” (2025)](https://arxiv.org/abs/2501.03200)).
- **Each known bias has a standard countermeasure.** For position bias, judge both orders and count a win only when they agree ([Zheng et al., 2023](https://arxiv.org/abs/2306.05685)); for verbosity bias, control for length, as length-controlled AlpacaEval does with a regression that predicts the preference at zero length difference, which raised its Spearman correlation with Chatbot Arena from 0.94 to 0.98 ([Dubois et al., “Length-Controlled AlpacaEval: A Simple Way to Debias Automatic Evaluators” (2024)](https://arxiv.org/abs/2404.04475)). For self-preference (Zheng et al. call it self-enhancement bias), mix in judges from other model families, which is how PoLL reduces intra-model bias ([Verga et al., 2024](https://arxiv.org/abs/2404.18796)); for knowledge and format bias, give the judge a reference and also train it to work without one ([Zhu et al., 2023](https://arxiv.org/abs/2310.17631)).
- **Meta-evaluation checks the judge against ground truth, and hard pairs expose it.** Against human labels, a judge is scored by its true positive rate, true negative rate and Cohen's kappa (see [LLM-as-judge](#llm-as-judge)), and against human rankings by rank correlations such as Spearman's ρ and Kendall's τ, which G-Eval reports on summarization ([Liu et al., 2023](https://arxiv.org/abs/2303.16634)). Judge benchmarks make the test harder: LLMBar has 419 pairs in which one output follows the instruction and the other only looks better ([Zeng et al., “Evaluating Large Language Models at Evaluating Instruction Following” (2023)](https://arxiv.org/abs/2310.07641)), and on JudgeBench, whose pairs are labeled by objective correctness in knowledge, reasoning, math and coding, many strong models including GPT-4o did only slightly better than random guessing in the 2024 paper ([Tan et al., “JudgeBench: A Benchmark for Evaluating LLM-based Judges” (2024)](https://arxiv.org/abs/2410.12784)).
- **Correct a judged pass rate for the judge's error rates.** With sensitivity q₁ and specificity q₀ estimated on a human-labeled calibration set, the naive judged pass rate p is biased, and the Rogan-Gladen plug-in θ = (p + q₀ − 1) ÷ (q₀ + q₁ − 1) corrects it; Lee et al. add confidence intervals that include the uncertainty of both the test set and the calibration set ([Lee et al., “How to Correctly Report LLM-as-a-Judge Evaluations” (2025)](https://arxiv.org/abs/2511.21140)). Prediction-powered inference is the general version of this idea: a small labeled set plus many model predictions gives valid confidence intervals, narrower when the predictions are better ([Angelopoulos et al., “Prediction-Powered Inference” (2023)](https://arxiv.org/abs/2301.09633)); see [statistics for evals](#eval-statistics).

## Planned visuals

- **`explorer`** (an extension of the existing `judge` model): set a judge's sensitivity and specificity and the true pass rate, and watch the naive judged pass rate drift away from the truth while the Rogan-Gladen corrected estimate and its interval track it.
- **`matrix`:** the bias catalog, one row per bias (position, verbosity, self-preference, knowledge, format), with how to detect it, the mitigation and the paper that documented it.
- **`compare`:** one large judge next to a jury of three smaller judges from different families on the same pairs, showing where the single judge's verdicts flip with answer order and where the jury's majority holds (illustrative).

## Talk like an expert

Experts talk about **pairwise versus pointwise**, **reference-guided grading**, **position, verbosity and self-preference bias**, **juries**, **sensitivity and specificity**, **kappa** and **bias-corrected pass rates**, and they treat a judge as a measurement instrument that needs its own validation set. The live question is whether judges keep up as the outputs they grade grow more sophisticated; JudgeBench was built on that worry, and labels its pairs by objective correctness instead of human preference.

## Go deeper

- [Zheng et al., “Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena” (2023)](https://arxiv.org/abs/2306.05685): the judge formats, the first bias catalog and agreement with humans.
- [Verga et al., “Replacing Judges with Juries” (2024)](https://arxiv.org/abs/2404.18796): the case for panels of diverse smaller judges.
- [Tan et al., “JudgeBench: A Benchmark for Evaluating LLM-based Judges” (2024)](https://arxiv.org/abs/2410.12784): meta-evaluation on hard pairs with objective labels.
- [Lee et al., “How to Correctly Report LLM-as-a-Judge Evaluations” (2025)](https://arxiv.org/abs/2511.21140): bias correction and honest intervals for judged scores.

## Related

- [LLM-as-judge done right](#llm-as-judge)
- [Statistics for evals](#eval-statistics)
- [Metrics and graders](#metrics-graders)
- [Reward models and preference data](#reward-modeling)
- [Hallucination and factuality](#hallucination-factuality)
- [Scalable oversight: debate, amplification and weak-to-strong](#scalable-oversight)
- [Playbook: Uber PerfInsights: finding Go performance antipatterns with LLMs](#uber-perfinsights)
