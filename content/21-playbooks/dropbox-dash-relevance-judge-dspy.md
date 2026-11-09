---
id: dropbox-dash-relevance-judge-dspy
book: 21
order: "21.33"
title: "Dropbox Dash: adapting an LLM relevance judge to cheaper models with DSPy"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [llm-as-judge, prompt-optimization, search-relevance, dspy, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software (AI search and answers over company knowledge)"
use_case: "An LLM relevance judge that scores query-document pairs from 1 to 5 for Dash's ranking, training data generation and offline evaluation, adapted with DSPy from OpenAI's o3 to cheaper models"
outcome: "On gpt-oss-120b, NMSE against human ratings reduced by 45 percent (from 8.83 to 4.86); model adaptation time from one to two weeks to one to two days; on gemma-3-12b, invalid-format responses from 358 to 9"
measured_how: "NMSE (scaled 0 to 100) between judge scores and human 1 to 5 relevance ratings on a human-annotated evaluation dataset, DSPy-optimized prompt against the original prompt; dataset size and period not stated (Dropbox, dropbox.tech, March 2026)"
prerequisites: [llm-as-judge, prompt-optimization]
replications: []
---
> [!tldr]
> Dropbox uses an LLM judge to score how relevant a document is to a query, and Dash's ranking, training data generation and offline evaluation use it. To run the judge on models cheaper than OpenAI's o3, the team optimized its prompt with DSPy against human relevance ratings: on gpt-oss-120b, "we reduced NMSE by 45 percent (from 8.83 to 4.86)", and adapting to a new model took one to two days instead of one to two weeks.

> [!note] From the public record
> Built from Dropbox's own published accounts, "How we optimized Dash's relevance judge with DSPy" (March 2026) and "How we used DSPy to turn AI evaluations into better responses in Dash chat" (June 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

A relevance judge takes a query and a document and assigns a score from 1 to 5. At Dropbox, "Relevance judges are used across multiple pipelines like ranking, training data generation, and offline evaluation." Other systems parse its JSON output, so a broken response can drop examples or fail batches.

The best judge ran on OpenAI's o3. It aligned closely with human ratings, "but it was expensive to run at scale". As Dash grew, the team needed to score orders of magnitude more query-document pairs, and "Running the most expensive model for every judgment wasn’t sustainable." Manual prompt tuning had produced a working judge, "but quality plateaued early", and each model swap risked regressions. See [Cost engineering](#cost-engineering).

## Why this approach

The team chose gpt-oss-120b, an open-weight model the post describes as much cheaper to run but still capable of following complex instructions. The o3 prompt "did not transfer cleanly": on the cheaper model, quality dropped. Rewriting it by hand, the post says, would require weeks of iteration and regression chasing. Instead, the team used DSPy, an open-source framework for optimizing prompts against a measurable objective. DSPy works from a defined task, dataset and metric, and the team already had all three. The post names no other tool it considered. See [Prompt optimization](#prompt-optimization).

## The approach

1. **Define the objective.** Human annotators rate query-document pairs on the same 1 to 5 scale and explain each score briefly. Judge scores are compared with theirs by normalized mean squared error (NMSE), scaled to 0 to 100, where 0 means perfect agreement. Broken JSON counts as fully incorrect. See [LLM-as-judge done right](#llm-as-judge).
2. **Optimize for gpt-oss-120b with GEPA.** For each disagreement with a human, DSPy's GEPA optimizer generates feedback, which the team built from the size and direction of the gap, the human's explanation and the model's reasoning. The prompt is revised and the loop repeats.
3. **Add guardrails.** Prompts may not contain example-specific content or change the task definition.
4. **Stress-test format.** The judge was adapted to gemma-3-12b, a much smaller and cheaper model, to test whether a low-cost judge returns valid JSON consistently.
5. **Improve the production o3 judge in small steps.** Humans explained large disagreements, and their explanations became single-line instruction bullets. DSPy only selects and combines bullets, such as: "Documents older than a year should be rated at least one point lower unless they are clearly evergreen."

## The stack

As of March 2026: OpenAI's o3 as the production judge, gpt-oss-120b as the open-weight target and gemma-3-12b as the stress test; DSPy with GEPA, and MIPROv2 in the post's chart and table; a human-annotated dataset of ratings with explanations, drawn, the post says, from limited, non-sensitive internal data. The post does not say where the open models are served.

## Results, and how they were measured

For gpt-oss-120b, the post compares the optimized prompt with the original manually tuned prompt "under identical conditions": the same task, dataset and metric.

- **gpt-oss-120b, alignment.** "we reduced NMSE by 45 percent (from 8.83 to 4.86)". A chart beside it shows 8.83 for the hand-tuned baseline, 5.11 for DSPy with MIPROv2 and 4.86 for DSPy with GEPA.
- **Adaptation time.** "Model adaptation time dropped from one to two weeks of manual iteration to one to two days."
- **Labeling volume.** On the cheaper model, "we were also able to label 10–100 times more data at the same cost".
- **gemma-3-12b, format.** In the baseline, "more than 40 percent of gemma-3-12b’s responses were malformed JSON". After optimization, "malformed outputs dropped by more than 97 percent, and NMSE improved substantially". The table: original prompt, NMSE 46.88, 498 valid and 358 invalid responses; DSPy prompt (MIPROv2), NMSE 17.26, 847 valid and 9 invalid.
- **o3, bullet selection.** The text gives no number; a chart shows NMSE 5.1 for the baseline and 4.1 for "DSPy + bullet selection".

**Later, on Dash chat.** The June 2026 post calibrates chat judges against "a small set of human-labeled examples", then optimizes the chat agent's prompt with GEPA on replayed internal chats. It reports "a 26% reduction in incomplete answers and a 13% reduction in missed key aspects" after launch, and "Total token usage dropped by 5.4%, while average completion length decreased by 9.8%."

**Not measured:** neither post gives the size of the labeled datasets, the number of annotators, whether results were measured on held-out data, or any dollar cost. The March post gives no period and reports no effect on Dash's ranking or its users. The June post compares candidates with the production prompt "using the same set of examples" and used statistical tests, but names none. It does not say whether its launch figures come from LLM judges, offline replay or live traffic, or how much traffic.

## What failed

- **Overfitting.** The optimizer copied "specific keywords, usernames, or verbatim document phrases directly into prompts", which "improved performance on the training examples but did not generalize."
- **Task drift.** Some candidate prompts changed the 1 to 5 rating scale to 1 to 3 or 1 to 4.
- **A model too weak.** "gemma-3-12b was ultimately too weak for our highest-quality production judge paths".
- **Risk on the production judge.** For o3, "Large prompt rewrites were too risky; even small wording changes could shift behavior in corner cases".

## What the team would do differently

The posts state lessons, not regrets. The March post likens the o3 work to "small PRs with tests", describes full rewrites when exploring a cheaper model and constrained edits where a production judge must stay stable, and concludes that "prompt optimization can’t be a one-off effort". The June post adds that "automated prompt optimization needs strong guardrails" and that "weak evaluation signals can lead to brittle improvements".

The wiki's reading: fixing the task, the labels and the metric first is what turns a model swap into a measured experiment. NMSE shows how closely the judge matches its annotators, not whether search improved for users; see [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation). Counting broken JSON as wrong keeps format failures visible; see [Structured outputs](#structured-outputs).

## Disclosure

None.

## Sources

- Eric Wang and Dmitriy Meyerzon, Dropbox, [“How we optimized Dash's relevance judge with DSPy”](https://dropbox.tech/machine-learning/optimizing-dropbox-dash-relevance-judge-with-dspy), dropbox.tech, 17 March 2026.
- Simran Jumani and Dmitriy Meyerzon, Dropbox, [“How we used DSPy to turn AI evaluations into better responses in Dash chat”](https://dropbox.tech/machine-learning/how-we-turned-ai-evaluations-into-better-responses-in-dash-chat), dropbox.tech, 25 June 2026.

## Related

- [About playbooks](#about-playbooks)
- [LLM-as-judge done right](#llm-as-judge)
- [Prompt optimization](#prompt-optimization)
- [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation)
- [Structured outputs](#structured-outputs)
