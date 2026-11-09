---
id: google-ml-code-completion
book: 21
order: "21.18"
title: Hybrid ML and semantic-engine code completion at Google
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [developer-tools, code-completion, transformers, productivity, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software (internal developer tools)"
use_case: "Code completion for Google-internal developers that combines a transformer model with rule-based semantic engines"
outcome: "User acceptance rate of 25-34%; 6% reduction in coding iteration time with single-line ML completion (at a 90% confidence level); 3% of new code (in characters) from accepted ML suggestions"
measured_how: "10k+ Googlers over three months across eight languages compared with a control group; production metrics for 10k+ (single-line) and 5k+ (multi-line) developers (Google Research blog, July 2022)"
prerequisites: [encoders-and-decoders, online-experiments]
replications: []
---
> [!tldr]
> Google combined encoder-decoder transformer models with rule-based semantic engines to suggest single-line and multi-line code completions to its internal developers. With 10k+ internal developers, the post reports "a user acceptance rate of 25-34%" and, against a control group, a 6% reduction in coding iteration time at a 90% confidence level. The semantic engines also check ML suggestions for semantic correctness, which filters out suggestions that would not compile.

> [!note] From the public record
> Built from Google's own published account, "ML-Enhanced Code Completion Improves Developer Productivity" (July 2022), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The post opens: "The increasing complexity of code poses a key challenge to productivity in software engineering." Code completion in integrated development environments (IDEs) conventionally comes from rule-based semantic engines (SEs), which typically see the full repository and understand its semantic structure. The post cites recent research showing that large language models (it names Codex and PaLM) enable longer and more complex code suggestions. The open question, in the authors' words, was how ML code completion affects developer productivity "beyond perceived productivity and accepted suggestions".

## Why this approach

The post describes a limit on each side. An SE typically predicts only a single token. An ML model is typically unaware of code outside its input window, and its training data can miss recent additions to a changing repository, so "the model may suggest code that looks correct, but doesn’t compile".

One model covers eight languages because the team observed "improved or equal performance across all languages, removing the need for dedicated models". A size of ~0.5B parameters gave "a good tradeoff for high prediction accuracy with low latency and resource cost". The post does not say which alternatives were compared.

## The approach

During training on Google's monorepo, the team masked out the remainder of a line and some follow-up lines "to mimic code that is being actively developed". Multi-line suggestions come from applying the single-line model repeatedly, with learned thresholds that decide whether to continue on the next line. ML and SE are then combined in three ways:

1. **Re-ranking.** Completions are requested from both at the same time. The ML model's first token is matched against the SE's single-token suggestions, and the top three ML suggestions that the SE also proposes move to the top.
2. **Semantic checks.** The SE checks ML completions within a latency budget of <100ms for the end-to-end completion, using cached abstract syntax trees. Typical checks are reference resolution, method invocation checks such as the number of parameters, and assignability checks.
3. **Continuation.** When the dropdown of semantic single-token completions appears, the ML model's single-line continuation of the item in focus is shown inline, for example a full method call with all its parameters.

## The stack

As of July 2022:

- **Model:** [encoder-decoder](#encoders-and-decoders) transformer models on TPUs, with one model of ~0.5B parameters for C++, Java, Python, Go, Typescript, Proto, Kotlin and Dart.
- **Input and decoding:** sub-word tokens with a SentencePiece vocabulary (see [Tokenization](#tokenization)), ~1000-2000 tokens around the cursor as input, and beam search (or tree exploration) on the decoder (see [Decoding and sampling](#decoding-sampling)).
- **Training data:** Google's monorepo, whose quality "is enforced by guidelines and reviews".
- **Semantic engines:** cloud language services built on an internal library with compiler-like features, placed in the same locations as the TPUs. Because requests run in parallel and ML is typically faster to serve (~40 ms median), the post says the design adds no latency to completions.

The post does not name the model, the IDE or the training compute.

## Results, and how they were measured

- **Productivity.** The team compared 10k+ Googlers using the hybrid, "over three months across eight programming languages", with a control group and saw "a 6% reduction in coding iteration time (time between builds and tests) when exposed to single-line ML completion". The results section states this "at a 90% confidence level".
- **Acceptance.** "With 10k+ Google-internal developers using the completion setup in their IDE, we measured a user acceptance rate of 25-34%." The tables give 25% for single-line completions (10k+ developers) and 34% for multi-line completions (5k+ developers), both for suggestions visible for >750ms, with 21 and 73 average characters per accept.
- **Share of code.** "Currently, 3% of new code (measured in characters) is now generated from accepting ML completion suggestions." The tables list 2.6% of all code added by single-line and 0.6% by multi-line ML suggestions.
- **Re-ranking.** "For 28% of accepted completions, the rank of the completion is higher due to boosting, and in 0.4% of cases it is worse." Users also typed >10% fewer characters before accepting a suggestion.
- **Semantic checks.** The post gives Go as its example: "~8% of suggestions contain compilation errors before semantic checks". It continues that the checks "filtered out 80% of uncompilable suggestions". Single-line acceptance "improved by 1.9x over the first six weeks" of incorporating the checks, "presumably due to increased user trust". For languages without semantic checks, "we only saw a 1.3x increase in acceptance".

**Not measured:** the post gives no absolute iteration times, no experiment dates and no description of how the control group was assigned. It reports no iteration-time result for multi-line completion and no effect on defects or code quality. It does not say whether the 1.9x and 1.3x figures come from a controlled comparison.

## What failed

- **Code that does not compile.** Based on internal user experience research, the post says this issue "can lead to the erosion of user trust over time while reducing productivity gains".
- **Re-ranking can hurt.** In 0.4% of cases, boosting made the rank of an accepted completion worse.
- **A claim taken back.** An update dated 2022/09/06 removed a statement about "an observed reduction in context switches that could not be confirmed with statistical significance".

## What the team would do differently

The post states nothing it would redo. Its next step is to give ML models extra information from SEs at inference time, for example by letting long predictions go back and forth between the two, with the SE checking correctness and offering all possible continuations. It closes with the aim to "go beyond just “smart” results, but ensure a positive impact on productivity".

The wiki's reading: the team measured productivity against a control group and stated a confidence level instead of relying on acceptance rates alone, the kind of evidence [Online controlled experiments for AI features](#online-experiments) describes. The design also treats trust as an input: fast, rule-based checks from existing tooling catch model errors, a pattern discussed in [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines).

## Disclosure

None.

## Sources

- Maxim Tabachnyk (Staff Software Engineer) and Stoyan Nikolov (Senior Engineering Manager), Google Research, [“ML-Enhanced Code Completion Improves Developer Productivity”](https://research.google/blog/ml-enhanced-code-completion-improves-developer-productivity/), Google Research blog, 26 July 2022, updated 6 September 2022.

## Related

- [About playbooks](#about-playbooks)
- [Online controlled experiments for AI features](#online-experiments)
- [Encoders, decoders and encoder-decoders](#encoders-and-decoders)
- [Decoding and sampling](#decoding-sampling)
- [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines)
