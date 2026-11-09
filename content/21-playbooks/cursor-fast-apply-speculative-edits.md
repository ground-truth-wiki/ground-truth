---
id: cursor-fast-apply-speculative-edits
book: 21
order: "21.32"
title: "Cursor's fast apply: a fine-tuned model and speculative edits for whole-file code edits"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [developer-tools, code-editing, speculative-decoding, fine-tuning, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software (developer tools)"
use_case: "Applying a code change planned in a chat with a frontier model to the current file, by having a fast model rewrite the whole file"
outcome: "Speeds of ~1000 tokens per second (around 3500 char/s) on the 70b model; a ~13x speedup over vanilla inference using Llama-3-70b and a ~9x speedup over the previous GPT-4 speculative edits deployment"
measured_how: "Speed as rewritten characters per second, time to first token included; quality on ~450 full-file edits of files under 400 lines graded by Claude-3 Opus; no period or production data stated (Cursor blog, May 2024)"
prerequisites: [speculative-decoding, fine-tuning-practice]
replications: []
---
> [!tldr]
> Cursor trained a model for "fast apply": it takes a change sketched in chat and rewrites the whole current file with it. A fine-tuned Llama-3-70b, served with a decoding method Cursor calls speculative edits, reached speeds of "~1000 tokens" per second ("around 3500 char/s") and, on Cursor's own eval, "almost matches claude-3-opus-diff". The post reports speed and graded quality only, with no figures from users.

> [!note] From the public record
> Built from Cursor's own published account, "Editing Files at 1000 Tokens per Second" (May 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The post opens with its diagnosis: "Frontier models such as GPT-4o struggle on large edits, with problems of laziness, inaccuracy, and high-latency." In coding agents, accurately editing hundreds of lines "can take multiple model calls", and slow edits break the programmer out of flow.

Cursor splits a difficult edit into two stages. Planning happens in a chat with a frontier model. Applying the change to the current file "should be straightforward and instant." Fast apply is that second stage. In the post's toy example, the change from chat "cannot easily be copy/pasted since it sketches out the change over a full class".

## Why this approach

**Rewrite the whole file, not a diff.** The model generates "the fully rewritten file conditioned on the current file, the conversation history, and the current code block." The post gives three possible reasons why models struggle with diffs: diffs make the model think in fewer tokens, models have "likely seen more full-files of code than diffs of code", and models are "notoriously bad at counting line numbers". A search/replace format adapted from Aider avoids line numbers, but "Most models fail to output accurate diffs, with the exception of Claude Opus." Claude Opus with that format beat gpt-4-turbo-spec "on speed and accuracy", but "is still too slow". [Inside coding agents](#coding-agent-internals) compares edit formats.

**Train a custom model.** "It is not possible to build speculative edits into any of anthropic's models", so the team trained and deployed its own, decoded with "a speculative-decoding variant tailored for code-edits". See [Speculative decoding](#speculative-decoding).

## The approach

1. **An evaluation set.** "~450 full-file edits of files under 400 lines", graded by Claude-3 Opus. On tens of curated examples, Opus agreed with the team's ratings better than GPT-4-Turbo or GPT-4o. See [LLM-as-judge done right](#llm-as-judge).
2. **A speed metric.** Rewritten characters divided by the latency of the rewrite in seconds. Latency includes time to first token, so the post calls it "a strong lower-bound on generation-speed".
3. **Synthetic training data.** From many cmd-k prompts (an edit instruction plus a code selection), GPT-4 wrote chat responses and a language model applied the change. A small set of real apply inputs produced more, higher-quality datapoints, and the datasets were combined "in an 80/20 mix". See [Synthetic data](#synthetic-data).
4. **Fine-tuning.** The team trained the Deepseek Coder Instruct and Llama 3 model families, downsampling small files (under 100 lines of code), examples per filename, and no-op datapoints.
5. **Speculative edits.** With code edits there is "a strong prior on the draft tokens", so the system can "speculate on future tokens using a deterministic algorithm rather than a draft model." The post does not describe the algorithm further.

## The stack

As of May 2024:

- **Apply model:** a fine-tuned Llama-3-70b (llama-3-70b-ft).
- **Serving:** Fireworks, which "built out api support for our custom speculation logic".
- **Data and grading:** GPT-4 for synthetic chat responses, Claude-3 Opus as grader with guidelines written as a Priompt component.
- **Compared against:** prompted Claude Opus, claude-3-sonnet, claude-3-haiku, gpt-4-turbo and gpt-4o, plus claude-3-opus-diff, gpt-4o-diff and gpt-4-turbo-spec.

The post names no hardware and no costs.

## Results, and how they were measured

- **Speed.** Cursor reports "speeds of ~1000 tokens" per second "(around 3500 char/s) on our 70b model". That is "a ~13x speedup over vanilla inference using Llama-3-70b" and "a ~9x speedup over our previous GPT-4 speculative edits deployment." The post does not say which requests were timed.
- **Speculative edits alone.** They are "equivalent to a full-file-rewrite, while being up to 9x faster". With the Fireworks deployment, the gain is larger for Llama-3 than GPT-4, "meaning a 4-5x speedup over the next fastest model."
- **Quality.** The fast-apply model "surpasses GPT-4 and GPT-4o performance", and the best one, llama-3-70b-ft, "almost matches claude-3-opus-diff and outperforms gpt-4-turbo and gpt-4o." The text gives no eval score for the fine-tuned models.
- **Felt usefulness.** All three fine-tuned models beat gpt-4-turbo on evals, but the team "could feel the difference": "Llama-3-70b felt better than other finetuned models and gpt-4-turbo", while the others "felt not-quite-useful enough, often less useful than GPT-4." The post gives no measurement for this.

**Not measured:** the post reports no production data: no acceptance or error rates, no latency seen by users, no rollout date and no measurement period.

## What failed

- **Prompted frontier models.** GPT-4 "omits code and indicates missing regions with ... or comments", and has "a tendency to 'fix/clean up' unrelated code". The team hypothesizes that Claude's better performance is "an artifact of post-training".
- **Diffs.** gpt-4o-diff "achieves a median speed of 2476 char/s", but "performs far worse than claude-3-haiku (4.18 avg eval score)".
- **Synthetic data.** "The fully synthetic data is lower quality." In the post's example, the selection range, which the pipeline throws away, "is crucial for an accurate edit".
- **Grader bias.** "These scores likely bias towards outputs of Claude models", though they match the team's qualitative assessments.
- **Long files.** The eval covers files under 400 lines. For longer context, "Naive linear scaling of RoPE position ids works poorly", as do "current community long-context finetunes of Llama 3 70b". See [RoPE scaling](#rope-scaling).

## What the team would do differently

The post does not say what the team would redo. It lists next steps: long-context training "to rewrite files up to 2500 lines long", distilling fast apply into a smaller model, "particularly llama-3-8b", and on-policy RL using data from the newly rolled-out model. See [Distillation for LLMs](#llm-distillation).

The wiki's reading: the two choices depend on each other. A whole-file rewrite spends many output tokens, and speculation pays off when most of them can be guessed in advance. That an edited file mostly repeats the current one is the wiki's inference; the post only speaks of "a strong prior on the draft tokens". The grader also comes from a model family under comparison, a bias the authors flag themselves.

## Disclosure

None.

## Sources

- Aman Sanger, Cursor (Anysphere, Inc.), [“Editing Files at 1000 Tokens per Second”](https://cursor.com/blog/instant-apply), Cursor blog (research), 14 May 2024.

## Related

- [About playbooks](#about-playbooks)
- [Speculative decoding](#speculative-decoding)
- [Inside coding agents: localization, editing and verification](#coding-agent-internals)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Latency and throughput](#latency-throughput)
