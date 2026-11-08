---
id: model-specific-notes
book: 5
order: "5.8"
title: Model-specific notes
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [claude, gpt, gemini, quirks]
visuals:
  - quirks-matrix:matrix
  - xml-compare:compare
---
> [!tldr]
> Model families differ in how they prefer instructions, long documents, reasoning controls and output formats. Learn your model’s conventions from its provider’s current guide, keep one prompt per family in version control, and re-test on every upgrade. A dated snapshot as of November 2026.

## Why it matters
A prompt tuned for one model can lose quality on another, and even on the next version of the same model. Teams that switch providers or upgrade models without re-testing see unexplained regressions. Knowing each family’s documented conventions is a fast first pass; your own evals are the final word.

## Intuition
Different models are like colleagues from different teams: all competent, each with habits. One likes everything in labeled folders, another wants the question first, a third follows instructions so literally that a vague one goes wrong. You adapt the brief to the reader.

```viz
{"id":"quirks-matrix","component":"matrix","matrix":"model-prompting","title":"Documented conventions by model family","caption":"Sortable and filterable. Qualitative and dated as of November 2026; items marked verify should be checked against the provider’s current guide.","alt":"Table of model families with their documented conventions for structure, long documents, reasoning controls and prefill.","data":"illustrative","depicts":"As of November 2026"}
```

## How it works
**Claude (Anthropic).** Anthropic’s guidance recommends clear, explicit instructions, XML tags to separate the parts of a prompt, examples, and placing long documents before the question. Newer models follow instructions precisely, so state exactly the behavior you want rather than relying on implied defaults. As of November 2026, Claude 4.6 and later models use adaptive thinking, steered by an effort setting rather than the older token budget, and prefilling the last assistant turn returns an error on them; use structured outputs or explicit format instructions instead.

**GPT (OpenAI).** OpenAI publishes model-specific prompting guides. Recent models follow instructions literally, so explicit, well-structured instructions matter; for very long contexts its guidance has suggested placing instructions at both the start and the end (verify for your model). Reasoning models expose a reasoning-effort setting and prefer concise goals to step-by-step scripts.

**Gemini (Google).** Google’s documentation covers system instructions, long-context use, where a query after long context is recommended, and multimodal inputs. Most models think dynamically by default; as of November 2026 the control is a thinking level (such as low, medium or high, varying by model), and the older thinking budget is deprecated from Gemini 3 on.

**Open-weight models.** Use the model’s own chat template exactly, typically through the tokenizer’s template function; small formatting differences, such as a missing special token, quietly degrade quality. Some open models toggle a thinking mode through template flags or system prompt conventions. See [supervised fine-tuning](#sft).

**What transfers everywhere.** Clear goals, separated context, good examples, explicit output formats and an eval set. Model-specific conventions are refinements on top.

## In practice
```viz
{"id":"xml-compare","component":"compare","title":"XML tags and Markdown headings both separate a prompt’s parts; pick the one your model’s guide recommends and stay consistent","caption":"The same prompt in two structures. Hover the marks. Consistency within a prompt matters more than the choice itself.","alt":"Comparison of the same prompt structured with XML tags and with Markdown headings.","data":"illustrative","a":{"title":"XML tags","text":"<contract>\n[40 pages]\n</contract>\n\n<question>\nCan the vendor terminate without notice?\n</question>\n\nAnswer using only <contract>. Quote the\nclause you rely on in <quote> tags, then\ngive your answer in <answer> tags."},"b":{"title":"Markdown headings","text":"## Contract\n[40 pages]\n\n## Question\nCan the vendor terminate without notice?\n\n## Instructions\nAnswer using only the Contract section.\nQuote the clause you rely on, then give\nyour answer under a heading named Answer."},"links":[{"a":"<contract>","b":"## Contract","note":"Both delimit the material clearly; tags are unambiguous even when the document contains its own headings."},{"a":"Answer using only <contract>.","b":"Answer using only the Contract section.","note":"Refer to the parts by name in the instructions."},{"a":"in <quote> tags, then\ngive your answer in <answer> tags.","b":"give your answer under a heading named Answer.","note":"Tags make the output easy to parse; headings are easier for people to read."}]}
```

A model-upgrade routine:
1. Keep a prompt file per model family, under version control.
2. Before switching, run your eval set on the new model with the current prompt.
3. Read output diffs on failing cases; adjust using the new model’s guide.
4. Re-run, compare with intervals, then canary in production. See [CI/CD for AI](#ci-cd-for-ai).

## Numbers to know
> [!number]
> Rule of thumb: expect some regressions on every model change, even within a family. A few hundred eval cases catch most of them before users do.

## Pitfalls and anti-patterns
> [!pitfall] One prompt for every model
> A prompt that is merely acceptable everywhere is usually worse than one tuned per family, and its regressions go unnoticed.

- **Wrong chat template for open models.** Silent quality loss.
- **Trusting old tips.** Conventions change between versions; read the current guide.
- **Relying on prefill or parameters a model no longer supports.** Check compatibility with features such as extended thinking.

## Talk like an expert
The vocabulary: **model card**, **prompting guide**, **chat template**, **XML tags**, **prefill**, **reasoning effort** and **thinking budget**, **model upgrade regression**. Experts keep per-family prompts and an eval set, and treat provider guides as hypotheses to test. The live debate is convergence: as models get better at following any reasonable prompt, whether model-specific tuning still pays.

> [!hottake] Model-specific prompt tricks are a depreciating asset; your eval set is an appreciating one.
> **The counterargument:** at production scale, small per-model gains add up to real quality and cost differences, and providers’ guides encode genuine differences in how models were trained.

## Check yourself
```quiz
model-specific-notes
```

## Go deeper
- The current prompting guides from Anthropic (platform.claude.com/docs), OpenAI and Google, for each model you use.
- Hugging Face documentation on chat templates for open models.

## Related
- [Prompting fundamentals](#prompting-fundamentals)
- [Frontier model families](#frontier-families)
- [Model APIs in practice](#model-apis)
- [CI/CD for AI](#ci-cd-for-ai)
- [Supervised fine-tuning](#sft)
- [Prompt sensitivity and robust prompt testing](#prompt-robustness)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Chat templates, message roles and prompt formats](#chat-templates)
