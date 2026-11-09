---
id: llm-as-judge
book: 14
order: "14.5"
title: LLM-as-judge done right
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [llm-judge, rubrics, calibration, bias]
visuals:
  - judge-calibration:explorer
  - position-bias:compare
  - judge-rubric-tree:tree
---
> [!tldr]
> An LLM judge grades outputs with a prompt instead of a person. It is only as trustworthy as its calibration: one specific criterion, a binary verdict with a written critique, and measured agreement with human labels on a held-out set.

## Why it matters
Most qualities you care about, such as whether an answer followed the user’s constraint, cannot be checked with a regex, and humans cannot read ten thousand outputs a day. A judge scales human judgment, but an uncalibrated judge scales noise with a confident face. The difference between the two is a process, and it is cheap.

## Intuition
A judge is a junior reviewer you are training. You give them one clear rule, example cases, and you check their verdicts against yours until they agree often enough, then you spot-check them forever. You would never let a new reviewer score “overall quality from 1 to 10” on their first day.

```viz
{"id":"judge-calibration","component":"explorer","model":"judge","title":"Raw agreement looks fine at almost any threshold; the true negative rate shows whether the judge catches failures","caption":"Illustrative set of 40 answers with human pass or fail labels and judge scores from 1 to 10. Move the pass threshold and watch the confusion matrix, the rates and Cohen’s kappa.","alt":"Explorer with a judge threshold slider and a two-by-two confusion matrix of human labels against judge verdicts, with agreement, true positive rate, true negative rate and kappa.","data":"illustrative","try":"Find the threshold with the best kappa, then compare its raw agreement with a threshold of 3."}
```

## How it works
**Pick one criterion per judge.** “Did the answer respect every constraint the user stated?” is gradable. “Is this a good answer?” is not. Use your [error analysis](#error-analysis) categories as the criteria.

**Prefer binary verdicts with a critique.** Pass or fail, preceded by a short written reason. Binary verdicts are easier to calibrate and act on than 1-to-10 scores, and the critique makes disagreements debuggable.

**Pointwise or pairwise.** Pointwise grades one output against a rubric. Pairwise asks which of two outputs is better, which is more sensitive for comparing systems but tells you nothing about absolute quality.

**Know the biases.**
- **Position bias:** in pairwise comparisons, judges favor one position, often the first.
- **Verbosity bias:** longer answers win more often than they deserve.
- **Self-preference:** a model may favor outputs that resemble its own.
- **Leniency:** judges pass too much; true negative rates are usually the weak spot.

Zheng et al. (2023) documented several of these in their study of LLM judges with MT-Bench and Chatbot Arena.

```viz
{"id":"position-bias","component":"compare","title":"Swap the order and a biased judge changes its mind: run both orders and count only agreement","caption":"Illustrative pairwise verdicts on the same two answers in both orders. When the verdict flips, the honest result is a tie.","alt":"Two judge prompts with the same answers in opposite order, producing opposite verdicts.","data":"illustrative","a":{"title":"Order 1: A shown first","text":"Response 1: [answer A]\nResponse 2: [answer B]\n\nJudge: Response 1 is better. It is\nclearer and addresses the question\ndirectly.\nVerdict: A"},"b":{"title":"Order 2: B shown first","text":"Response 1: [answer B]\nResponse 2: [answer A]\n\nJudge: Response 1 is better. It is\nclearer and addresses the question\ndirectly.\nVerdict: B"},"links":[{"a":"Response 1: [answer A]","b":"Response 1: [answer B]","note":"Only the order changed."},{"a":"Response 1 is better.","b":"Response 1 is better.","note":"The judge preferred whatever came first: position bias."},{"a":"Verdict: A","b":"Verdict: B","note":"Count a win only when both orders agree; otherwise record a tie."}]}
```

**Calibrate against humans.** Label a set of outputs yourself, ideally 100 or more with both passes and failures. Run the judge, build the confusion matrix, and measure the true positive rate, the true negative rate and Cohen’s kappa. Iterate on the judge prompt with a development split, then report on a held-out test split.

**Watch for drift.** Re-check calibration when you change the judge model, the judge prompt or the system being judged. Shankar et al. (2024) also observed **criteria drift**: graders refine what they mean by “good” as they see more outputs, so rubrics should evolve with the labels.

## In practice
A judge prompt that follows these rules:

```text
You are grading one property of an assistant's reply: whether it respects
every constraint the user stated (dates, budgets, exclusions, formats).

<conversation>{conversation}</conversation>
<reply>{reply}</reply>

First list each user constraint and whether the reply respects it.
Then output exactly one line: VERDICT: PASS or VERDICT: FAIL.
FAIL if any constraint is violated or silently ignored.
Examples of FAIL: user said "no weekend delivery", reply offers Saturday.
```

```viz
{"id":"judge-rubric-tree","component":"tree","title":"Five checks separate a measurement instrument from an opinion generator","caption":"Expand each check for the question to ask and the evidence that answers it.","alt":"Checklist tree for validating an LLM judge.","data":"illustrative","open":1,"root":{"label":"Is this judge trustworthy?","children":[
{"label":"One criterion?","children":[{"label":"It grades a single, named failure mode from error analysis","link":"#error-analysis"}]},
{"label":"Binary with a critique?","children":[{"label":"Pass or fail, after a short written reason you can read"}]},
{"label":"Calibrated?","children":[{"label":"True positive and true negative rates measured on a held-out human-labeled set","link":"#labeling-annotation"}]},
{"label":"Bias-checked?","children":[{"label":"Both orders for pairwise; length-controlled examples"}]},
{"label":"Monitored?","children":[{"label":"Recalibrated after any change to judge model, prompt or system","link":"#online-evaluation"}]}]}}
```

Then use it: run the judge on every eval case, report the pass rate with a confidence interval (see [statistics for evals](#eval-statistics)), and correct for known judge error rates when precision matters.

## Numbers to know
> [!number]
> Rules of thumb. Label at least 100 examples for calibration, with enough failures to estimate the true negative rate. Aim for high agreement on both classes, not just high raw agreement. Raw agreement on an unbalanced set can look excellent while kappa is near zero.

## Pitfalls and anti-patterns
> [!pitfall] The 1-to-10 overall-quality judge
> Scores that mix many criteria are uncalibrated, unstable across runs and impossible to act on. Split them into binary judges per criterion.

- **Trusting the judge model’s reputation.** Calibrate every judge on your own data.
- **Judging with the same model that generated.** Self-preference inflates scores; use a different model where you can, or at least measure the effect.
- **No held-out set.** Tuning the judge prompt on the same examples you report on overfits.
- **Ignoring the critique.** Reading judge reasons is the fastest way to find rubric bugs.

## Talk like an expert
The vocabulary: **pointwise** and **pairwise**, **reference-based** and **reference-free**, **position, verbosity and self-preference bias**, **true negative rate**, **Cohen’s kappa**, **criteria drift**, **judge drift**. Experts call a calibrated judge “a classifier with known error rates” and quote its TPR and TNR. The live debate is how far judges can replace human review for high-stakes domains; most practitioners keep humans on a sample forever.

> [!hottake] A calibrated binary judge is worth more than any benchmark score.
> **The counterargument:** judges inherit the blind spots of the models they are built from, so for frontier capabilities, where the judge may be weaker than the system it grades, human experts and objective checks remain essential.

## Check yourself
```quiz
llm-as-judge
```

## Go deeper
- Zheng et al., “Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena” (2023).
- Shankar et al., “Who Validates the Validators?” (2024).
- Cohen, “A Coefficient of Agreement for Nominal Scales” (1960), the origin of kappa.

## Related
- [Error analysis first](#error-analysis)
- [Metrics and graders](#metrics-graders)
- [Statistics for evals](#eval-statistics)
- [Labeling and annotation](#labeling-annotation)
- [Evaluating RAG](#rag-evaluation)
- [Classification and regression metrics](#classification-metrics)
- [Arenas and leaderboards](#arenas-leaderboards)
- [Label quality: agreement, aggregation and label errors](#label-quality)
- [Scalable oversight: debate, amplification and weak-to-strong](#scalable-oversight)
- [Playbook: Notion's Auto: evaluating a model router on replayed real tasks](#notion-model-router)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation)
