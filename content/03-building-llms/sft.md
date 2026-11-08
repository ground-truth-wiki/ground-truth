---
id: sft
book: 3
order: "3.5"
title: Supervised fine-tuning
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [sft, instruction-tuning, chat-templates]
visuals:
  - chat-template:compare
  - sft-data:tree
---
> [!tldr]
> Supervised fine-tuning teaches a pretrained model to follow instructions and hold conversations by training on example prompts and ideal responses, formatted with a chat template and with loss computed only on the response tokens. A few thousand excellent examples can change behavior more than a million mediocre ones.

## Why it matters
SFT turns a text predictor into an assistant, and it is the most common way teams adapt open models to their tasks and style. Getting the template, masking and data right decides whether a fine-tune helps or quietly breaks the model.

## Intuition
Pretraining teaches a model to continue any document. SFT shows it thousands of documents that look like “a question, then an excellent answer”, until answering well is the natural continuation.

```viz
{"id":"chat-template","component":"compare","title":"The conversation you write and the token sequence the model actually trains on","caption":"Illustrative chat template in a ChatML-like style; every model family has its own. Hover the marks.","alt":"Comparison of a conversation as structured messages and the same conversation rendered with special tokens by a chat template, with loss masking marked.","data":"illustrative","a":{"title":"Messages","text":"[\n  {role: system, content: You are concise.},\n  {role: user, content: What is RoPE?},\n  {role: assistant, content: Rotary position\n     embeddings rotate queries and keys...}\n]"},"b":{"title":"Rendered tokens","text":"<|im_start|>system\nYou are concise.<|im_end|>\n<|im_start|>user\nWhat is RoPE?<|im_end|>\n<|im_start|>assistant\nRotary position embeddings rotate\nqueries and keys...<|im_end|>\n(loss computed only on the assistant span)"},"links":[{"a":"{role: user, content: What is RoPE?},","b":"<|im_start|>user\nWhat is RoPE?<|im_end|>","note":"Special tokens mark roles; they must match what the model was trained with."},{"b":"(loss computed only on the assistant span)","note":"Masking prompt tokens teaches the model to answer, not to imitate users."}]}
```

## How it works
**Data.** Prompt and response pairs, single or multi-turn, covering the tasks and style you want. Sources include human-written demonstrations, curated public datasets, distilled outputs from stronger models and synthetic data. LIMA (Zhou et al., 2023) showed that about a thousand carefully chosen examples can produce a capable assistant from a strong base model.

**Templates and masking.** A chat template converts messages to tokens with role markers; training computes loss only on assistant tokens. Using the exact template at inference matters. See [model-specific notes](#model-specific-notes).

**Training.** Usually one to a few epochs at a small learning rate, full fine-tuning or parameter-efficient methods such as LoRA. See [fine-tuning in practice](#fine-tuning-practice).

```viz
{"id":"sft-data","component":"tree","title":"Where SFT data comes from, and the check each source needs","caption":"Expand a source. Quality and diversity matter more than size.","alt":"Tree of SFT data sources with quality checks: human demonstrations, distilled outputs, public datasets and production data.","data":"illustrative","open":1,"root":{"label":"SFT data sources","children":[
{"label":"Human demonstrations","children":[{"label":"Highest quality, slow and costly; check consistency between writers","link":"#labeling-annotation"}]},
{"label":"Distilled from a stronger model","children":[{"label":"Fast and cheap; check provider terms and filter errors","link":"#distillation-merging"}]},
{"label":"Public instruction datasets","children":[{"label":"Broad coverage; check licenses, duplicates and contamination"}]},
{"label":"Your production data","children":[{"label":"Most relevant; anonymize, get consent and use corrected outputs","link":"#data-flywheel"}]}]}}
```

**What SFT is not good at.** Adding lots of new factual knowledge (retrieval or continued pretraining work better), or teaching preferences between acceptable answers (preference optimization does that). See [preference optimization](#preference-optimization).

## In practice
1. Write 50 to 100 examples by hand to define the target behavior.
2. Scale to hundreds or thousands with distillation or synthetic generation, filtered and reviewed.
3. Hold out an eval set from the same distribution, plus general-skill checks.
4. Fine-tune with the model’s template; compare against prompting the base model.

## Numbers to know
> [!number]
> Rules of thumb. Hundreds to a few thousand high-quality examples are often enough for style and format; tens of thousands for broader task coverage. One to three epochs is typical; more risks overfitting.

## Pitfalls and anti-patterns
> [!pitfall] Wrong chat template
> Training and serving with different templates degrades quality silently.

- **Fine-tuning to add facts.** Knowledge added through SFT is unreliable; use retrieval.
- **No general-skill eval.** Narrow fine-tunes can damage broader abilities.

## Talk like an expert
The vocabulary: **instruction tuning**, **demonstrations**, **chat template**, **loss masking**, **epochs**, **distillation data**, **LIMA**, **catastrophic forgetting**. Experts compare a fine-tune against a well-prompted base model before declaring victory. The live debate is how much of post-training SFT still does as reinforcement learning grows.

> [!hottake] Most teams fine-tune when a better prompt and a few examples would do.
> **The counterargument:** at high volume, fine-tuned small models can cut cost and latency dramatically while matching quality, which prompts on large models cannot.

## Check yourself
```quiz
sft
```

## Go deeper
- Zhou et al., “LIMA: Less Is More for Alignment” (2023).
- Wang et al., “Self-Instruct” (2022); Lambert et al., “Tülu 3” (2024).

## Related
- [Fine-tuning in practice](#fine-tuning-practice)
- [Preference optimization](#preference-optimization)
- [Mid-training](#mid-training)
- [Distillation, merging and compression](#distillation-merging)
- [Labeling and annotation](#labeling-annotation)
