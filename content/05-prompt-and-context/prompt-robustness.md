---
id: prompt-robustness
book: 5
order: "5.1.2"
title: Prompt sensitivity and robust prompt testing
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [prompt-sensitivity, prompt-testing, robustness, evaluation]
visuals: []
prerequisites: [prompting-fundamentals, why-evals]
---
> [!tldr]
> Language models can change their answers, and their scores, when a prompt changes in ways that should not matter: spacing, separators, casing, wording or the order of examples. A score measured with one prompt is one draw from a wide distribution. Test prompts the way you test models: several meaning-preserving variants, several runs per case, paired comparisons and an interval instead of a single number.

## Key ideas

- **Small, meaning-preserving edits change results.** The Prompt Report's survey of the evidence notes that extra spaces, different capitalization, other delimiters or a swapped synonym can significantly change performance, and that on some tasks the order of the few-shot examples alone moves accuracy from below 50% to above 90% (Schulhoff et al., [“The Prompt Report: A Systematic Survey of Prompt Engineering Techniques”](https://arxiv.org/html/2406.06608v6) (2024)).
- **Report a range, not a point.** Sclar et al. measured gaps of up to 76 accuracy points between plausible prompt formats for LLaMA-2-13B, and the sensitivity did not go away with larger models, more few-shot examples or instruction tuning. Their FormatSpread algorithm samples a set of plausible formats and reports the interval of expected performance, without needing the model's weights (Sclar et al., [“Quantifying Language Models' Sensitivity to Spurious Features in Prompt Design or: How I learned to start worrying about prompt formatting”](https://arxiv.org/abs/2310.11324v2) (2024)).
- **Format effects do not carry over between models.** In the same study, performance across formats correlated only weakly from one model to another, so a comparison of two models on one fixed format can mislead, and a format tuned for today's model is no evidence that it suits the next one. Mizrahi et al. found the same at scale: across 6.5 million instances, 20 LLMs and 39 tasks, the instruction template changed both absolute scores and model rankings, and they propose metrics computed over many paraphrases of each instruction (Mizrahi et al., [“State of What Art? A Call for Multi-Prompt LLM Evaluation”](https://aclanthology.org/2024.tacl-1.52) (2024)).
- **Strict output formats can cost reasoning quality.** Tam et al. found that format-restricting instructions and JSON mode lowered performance on reasoning tasks, more so the stricter the constraint, while JSON mode was competitive or better on some classification tasks. Letting the model answer in natural language first and converting the answer to the format in a second step scored nearly the same as unrestricted answers for most models (Tam et al., [“Let Me Speak Freely? A Study on the Impact of Format Restrictions on Performance of Large Language Models”](https://aclanthology.org/2024.emnlp-industry.91) (2024)).
- **Requirements spread over turns get lost.** In over 200,000 simulated conversations with 15 LLMs, performance on six generation tasks fell by 39% on average when a fully specified task was revealed piece by piece over several turns, mostly because answers became less reliable rather than because ability dropped; models commit to early assumptions and do not recover. The authors recommend consolidating the requirements into a single instruction, or starting a new conversation that repeats the same information (Laban et al., [“LLMs Get Lost In Multi-Turn Conversation”](https://arxiv.org/abs/2505.06120) (2025)).
- **A practical protocol.** Test several meaning-preserving variants of each prompt, sample several answers per case, compare candidates on the same cases and report an interval, as in [statistics for evals](#eval-statistics). Miller recommends standard errors of the mean, resampling answers to reduce variance, inference on question-level paired differences, and power analysis to check that an eval set can detect the difference you care about (Miller, [“Adding Error Bars to Evals: A Statistical Approach to Language Model Evaluations”](https://arxiv.org/abs/2411.00640) (2024)).

## Planned visuals

- `chart`: accuracy on one task across many prompt formats for several models, drawn as a range per model from the published data in Sclar et al. (with source and date), showing how wide the spread is and how model rankings flip between formats.
- `compare`: two prompts that differ only in separator, casing and example order, side by side, with linked highlights on every changed character and a note that results can still differ.
- `explorer` (the `ci` model): how the interval around a prompt's score narrows as you add cases, runs per case and prompt variants, so a reader sees when a difference between two prompts is real.

## Talk like an expert

Experts talk about **prompt sensitivity**, **format spread**, **multi-prompt evaluation**, **run-to-run variance** and **paired comparisons**, and they treat a single-prompt score as one sample: their first questions are "which prompt, how many variants, how many runs, and what is the interval?"

## Go deeper

- Sclar et al., [“Quantifying Language Models' Sensitivity to Spurious Features in Prompt Design or: How I learned to start worrying about prompt formatting”](https://arxiv.org/abs/2310.11324v2) (2024).
- Mizrahi et al., [“State of What Art? A Call for Multi-Prompt LLM Evaluation”](https://aclanthology.org/2024.tacl-1.52) (2024).
- Laban et al., [“LLMs Get Lost In Multi-Turn Conversation”](https://arxiv.org/abs/2505.06120) (2025).
- Miller, [“Adding Error Bars to Evals: A Statistical Approach to Language Model Evaluations”](https://arxiv.org/abs/2411.00640) (2024).

## Related

- [Prompting fundamentals](#prompting-fundamentals)
- [In-context learning and example design](#in-context-learning)
- [Statistics for evals](#eval-statistics)
- [Prompt and config management](#prompt-config-management)
- [CI/CD for AI](#ci-cd-for-ai)
- [Benchmark literacy](#benchmark-literacy)
