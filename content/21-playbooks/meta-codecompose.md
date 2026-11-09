---
id: meta-codecompose
book: 21
order: "21.74"
title: "CodeCompose: fine-tuned code completion at Meta"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [developer-tools, code-completion, fine-tuning, rollout, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software (internal developer tools)"
use_case: "Inline code completion in Meta's internal editors from an InCoder model fine-tuned on Meta's own code, across 9 programming languages"
outcome: "Acceptance rate of 22% on 4.5 million suggestions shown to 16K developers; 8% of their code came from CodeCompose; offline, hidden lines reproduced between 40% and 58% of the time"
measured_how: "Telemetry: acceptance rate on suggestions displayed for at least 750 milliseconds and share of code at character level, period not stated and no control-group comparison reported; offline exact match and BLEU on 20K held-out files; thematic analysis of feedback from 70 engineers (Meta, Proc. ACM Softw. Eng., July 2024)"
prerequisites: [fine-tuning-practice]
replications: []
---
> [!tldr]
> Meta fine-tuned the public InCoder model on its own code and deployed it as CodeCompose, an inline code completion tool, across 9 programming languages. The paper reports "an acceptance rate of 22%" on 4.5 million suggestions shown to 16K developers, with 8% of their code coming from CodeCompose. The paper reports no measure of productivity.

> [!note] From the public record
> Built from Meta's own published account, "AI-assisted Code Authoring at Scale: Fine-tuning, deploying, and mixed methods evaluation" (July 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

At Meta, "Tens of thousands of developers work on billions of lines of code (LOCs) in a monolithic repository" with code in 9+ programming languages. Much knowledge about internal processes and libraries "is embedded in the source code or is confined to a small set of developers". The paper argues that an assistant trained on an organization's own repository "can surface internal knowledge during code authoring".

## Why this approach

Developers often edit with code on both sides of the cursor, and "The code after the cursor contains highly relevant signals about the code being written." Per the paper, BERT-style masked models see both sides but are not easily suited to generation; GPT-style causal models generate but see only preceding tokens. The team took InCoder, a generative model trained with a Causal Masking objective that uses both sides. See [Encoders, decoders and encoder-decoders](#encoders-and-decoders).

Fine-tuning on internal code lets CodeCompose handle languages such as Hack and Flow. Without tuning on internal APIs and functions, the authors write, "the model would be unable to make reasonable suggestions for the internal codebase." See [Fine-tuning in practice](#fine-tuning-practice). The paper does not say whether a vendor tool was considered.

## The approach

1. **A custom objective.** Language Causal Masking (LCM) masks at the language level rather than after tokenization, only at trigger characters such as `(`, `.` and `=`. A metadata prefix adds the language and file path. Ablations set a 70-30 split of the input between code before and after the cursor.
2. **Fresh, filtered data.** The team trained on code changed through diffs (Meta's term for pull requests) from up to 2 years back and excluded code that is not in production or deprecated. With language partner teams it also removed obsolete patterns such as "PHP-isms" in Hack.
3. **Serving for latency.** Requests are not batched. Inputs under 1500 tokens get beam search with a beam width of 3, longer ones greedy generation. The language server waits for a 20ms pause before re-sending a request and caches responses.
4. **One line at a time.** Suggestions complete the current line and are not shown when code sits to the right of the cursor, except tokens such as `)`, `}` and `]`.
5. **A staged rollout.** Languages came in waves (Python first, then Hack, Flow and C++, then the others), each in increments of 25% of developers. "The rollout was completed after four weeks in Spring of 2023."

## The stack

As described in the paper (July 2024) for the system it evaluates: InCoder-1.3B fine-tuned with LCM, trained for 4 epochs in 4 days on a cluster of 128 A100 GPUs and deployed on a cluster of 150 A100 GPUs. A footnote says that by the time the paper was accepted, the team had moved to CodeLlama-7B as its foundation model. A Rust language server following the Language Server Protocol calls the inference tier via Thrift and records telemetry. Editors include Meta's version of VS Code, Android Studio through an adapter, and a web-based variant of Jupyter notebooks.

## Results, and how they were measured

- **Offline accuracy.** The test set was "an unseen random sample of 20K source code files", held out by a filepath-based hash, in Hack, C++, Python and Flow (JavaScript). On masked lines, "we are able to reproduce hidden lines between 40% and 58% of the time", and "Our LCM fine-tuned model substantially outperforms the Public model by between 1.4 times and 4.1 times." The LCM model's exact match was 57.7% for Hack against 14.2% for the public InCoder model, and 40.0% for C++ against 23.4%.
- **Acceptance.** "We see an acceptance rate of 22% which is comparable to those at Google and GitHub." It covers 4.5 million suggestions in 9 languages, each displayed for at least 750 milliseconds.
- **Share of code.** "At the time of this writing, 16K developers have used it with 8% of their code coming directly from CodeCompose." This is counted in characters typed, excluding large copy-pastes and refactors.
- **Feedback.** Two authors coded posts from 70 engineers: "We find that 91.5% of the feedback is positive". Six responses (8.5%) were unfavorable, with "less than 1% of engineers turning off CodeCompose".

**Not measured:** productivity. The paper notes that "a high acceptance rate does not necessarily mean developers are being more productive when using the tool". It reports no control-group comparison for the online metrics, does not state the period they cover, and gives no measured latency or cost.

## What failed

- **Specialized code.** "CodeCompose is not helpful in scenarios where developers use specialized APIs and libraries".
- **Hallucinations.** Developers complained that it could hallucinate uncommon API names and URLs.
- **Clashing with auto-complete.** Sometimes the two systems competed to show suggestions, and the Tab key was overloaded for both. "A few developers disabled CodeCompose as they found CodeCompose to be noisy and intrusive."
- **Large blocks and slow answers.** The paper says that suggesting a large block of code while developers are in their coding flow "results in an extremely jarring experience". On latency, "developers were fine with suggestions appearing within 300ms - 500ms, and certainly not beyond 1s": the acceptance rate went down when end-to-end latency went up. See [Latency and throughput](#latency-throughput).
- **Limits of the evidence.** The tool ran only at Meta, so results "might not hold elsewhere", and developers "might not have been comfortable sharing negative assessments with colleagues."

## What the team would do differently

The paper does not say what the team would change. Its lessons learned are: filter obsolete and not-in-production code from training data, add context such as the code after the cursor, build trust through gradual rollout, suggest one line at a time, and keep latency low with caching and debouncing. On metrics, it says productivity "has to be measured explicitly". Planned work includes dynamic context from other files. The team was also exploring semantic information to reduce hallucinations.

The wiki's reading: the backtest shows the fine-tuned model predicts Meta's code better than the public one, acceptance and share of code show use, and feedback shows how it felt. None shows time saved. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).

## Disclosure

None.

## Sources

- Vijayaraghavan Murali, Chandra Maddila, Imad Ahmad, Michael Bolin, Daniel Cheng, Negar Ghorbani, Renuka Fernandez, Nachiappan Nagappan and Peter C. Rigby, Meta Platforms Inc. (Peter C. Rigby also Concordia University), [“AI-assisted Code Authoring at Scale: Fine-tuning, deploying, and mixed methods evaluation”](https://arxiv.org/abs/2305.12050), Proc. ACM Softw. Eng. 1, FSE, Article 48 (July 2024), doi:10.1145/3643774. Preprint on arXiv: v1 20 May 2023, v2 16 February 2024.

## Related

- [About playbooks](#about-playbooks)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Latency and throughput](#latency-throughput)
- [Online evaluation](#online-evaluation)
