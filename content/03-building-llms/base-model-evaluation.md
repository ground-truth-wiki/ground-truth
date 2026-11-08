---
id: base-model-evaluation
book: 3
order: "3.13"
title: Evaluating models during pretraining
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [pretraining, evaluation, ablations, bits-per-byte, scaling]
visuals: []
prerequisites: [scaling-laws, benchmark-literacy]
---
> [!tldr]
> Evaluating during pretraining means finding signals that tell two cheap, small runs apart and predict which choice wins at full scale. Loss across many domains and likelihood-based scores give a steadier signal than accuracy; downstream benchmarks are noisy for small models unless they are chosen and formatted with care. The one thing to remember: keep a held-out suite you never make decisions on, or your reported numbers measure your decisions instead of your model.

## Key ideas

- **Measure loss across many domains, in bits per byte when tokenizers differ.** A single validation set assumes that fit on one distribution carries over to the others. Paloma measures fit across 546 English and code domains, and normalizes log likelihood by UTF-8 bytes when vocabularies differ, though it notes that fixing the vocabulary is better. It also removes pretraining documents that contain evaluation text, so that perplexity is not underestimated ([Magnusson et al., “Paloma: A Benchmark for Evaluating Language Model Fit” (2023)](https://arxiv.org/abs/2312.10523)). The math behind perplexity and bits per byte is in [Information theory for language models](#information-theory-for-llms).
- **Pick benchmarks that give an early signal.** For its data ablations on 1.71B-parameter models, FineWeb kept benchmarks with three properties: little score variance between runs trained on different samples of the same data, near-monotonic improvement during training, and scores above random for models of that size. Its set was CommonSense QA, HellaSwag, OpenBook QA, PIQA, SIQA, WinoGrande, ARC and MMLU ([Penedo et al., “The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale” (2024)](https://arxiv.org/abs/2406.17557)).
- **Format the question for the model's stage.** The cloze formulation (CF) scores each answer option by its likelihood; the multiple-choice formulation (MCF) shows lettered options and scores the letter. Smaller base models typically need CF; in OLMES's example, OLMo-7B-0424 began gaining the ability to answer MMLU in MCF around 400B tokens. OLMES therefore runs both formulations and reports the better one, with curated 5-shot prompts and a fixed normalization per task ([Gu et al., “OLMES: A Standard for Language Model Evaluations” (2024)](https://arxiv.org/abs/2406.08446)).
- **Small experiments predict large ones, if the metric is continuous.** DataDecide pretrained models on 25 corpora at sizes up to 1B parameters, with 3 seeds. Ranking the corpora at a single small size, such as 150M parameters, picked the better corpus at 1B in about 80% of pairs, and none of 8 scaling-law methods beat that for the same compute. Continuous likelihood metrics, such as the probability of the correct answer, made MMLU, ARC, HellaSwag, MBPP and HumanEval more than 80% predictable at 1B with 0.01% of the compute ([Magnusson et al., “DataDecide: How to Predict Best Pretraining Data with Small Experiments” (2025)](https://arxiv.org/abs/2504.11393)). How mixtures are chosen with such ablations is covered in [Data mixtures, repetition and curricula](#data-mixing).
- **Forecast the final model from smaller ones.** OpenAI predicted some aspects of GPT-4's performance from models trained with no more than 1/1,000th of its compute ([OpenAI, “GPT-4 Technical Report” (2023)](https://arxiv.org/abs/2303.08774)). Llama 3 forecast benchmark accuracy in two steps: from training compute to the negative log-likelihood of correct answers, then from that likelihood to accuracy ([Grattafiori et al., “The Llama 3 Herd of Models” (2024)](https://arxiv.org/abs/2407.21783)). Observational scaling laws skip training altogether: they fit about 100 public models in a low-dimensional capability space and predicted emergent behavior from smaller models and agent performance from simpler, non-agentic benchmarks ([Ruan et al., “Observational Scaling Laws and the Predictability of Language Model Performance” (2024)](https://arxiv.org/abs/2405.10938)).
- **Keep a held-out suite, and pick checkpoints with care.** OLMo 2 kept a suite of tasks that were not used for development decisions, to avoid overfitting its recipe to its benchmarks, and asks developers to declare which tasks they developed on. Its 7B, 13B and 32B base models average several mid-training (annealing) runs on the same mixture with different data orders, which consistently beat the individual checkpoints ([Team OLMo, Walsh et al., “2 OLMo 2 Furious” (2024)](https://arxiv.org/abs/2501.00656)). Llama 3 likewise averaged checkpoints during annealing to produce its final pretrained model ([Grattafiori et al., 2024](https://arxiv.org/abs/2407.21783)).

## Planned visuals

- **`chart`:** two ablation runs over training tokens, scored on a noisy accuracy benchmark and on a continuous likelihood metric, with seed-variance bands, showing why the continuous metric separates the runs sooner (illustrative).
- **`compare`:** the same multiple-choice question in the cloze formulation and in the multiple-choice formulation, highlighting what is scored in each.
- **`diagram`:** the evaluation loop of a pretraining project: small ablations scored on a development suite drive decisions about data and recipe, the full run is tracked with loss and bits per byte, and a held-out suite is only read for the final report.

## Talk like an expert

Experts call these **early-signal** or **development** evals and judge a metric by how little it varies across seeds, whether it is above chance at small scale, and its **decision accuracy** across scales, not by its headline value. This is a different job from reading the scores of finished models ([benchmark literacy](#benchmark-literacy)) or evaluating an application ([why evals are the core skill](#why-evals)): the goal is the right decision between runs, not a score to publish.

## Go deeper

- Magnusson et al., [“Paloma: A Benchmark for Evaluating Language Model Fit”](https://arxiv.org/abs/2312.10523) (2023).
- Gu et al., [“OLMES: A Standard for Language Model Evaluations”](https://arxiv.org/abs/2406.08446) (2024).
- Magnusson et al., [“DataDecide: How to Predict Best Pretraining Data with Small Experiments”](https://arxiv.org/abs/2504.11393) (2025).
- Penedo et al., [“The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale”](https://arxiv.org/abs/2406.17557) (2024), section 3.1 on the ablation setup.

## Related

- [Benchmark literacy](#benchmark-literacy)
- [Scaling laws and compute](#scaling-laws)
- [Data mixtures, repetition and curricula](#data-mixing)
- [Information theory for language models](#information-theory-for-llms)
- [Evaluation harnesses](#eval-harnesses)
