---
id: google-autocommenter-code-review
book: 21
order: "21.14"
title: "AutoCommenter: LLM best-practice comments in Google's code review"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [code-review, developer-tools, static-analysis, online-evaluation, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software (internal developer tools)"
use_case: "An LLM-backed system that flags violations of coding best practices in C++, Java, Python and Go, with a link to the best practice document, in code review and in the IDE"
outcome: "Useful ratio from developer feedback plateaued at around 54%, then reached the 80% target after suppressing non-actionable URLs and updating summaries; comment-resolution rate estimated at about 40%; no statistically significant change in code review duration"
measured_how: "Useful ratio from thumbs up, thumbs down and Please fix clicks (about 10% of automated comments in the code review system got any); resolution estimated from 6000 snapshot pairs and a manual sample of 40; A/B experiment with about half of all developers in July 2023 (Vijayvergiya et al., AIware '24, May 2024)"
prerequisites: [cloud-and-ci-coding-agents, online-evaluation]
replications: []
---
> [!tldr]
> Google built AutoCommenter, a system backed by a T5-based model that flags violations of coding best practices, and rolled it out to all its developers between July 2022 and October 2023. The useful ratio from developer feedback "plateaued at around 54%", and suppressing non-actionable URLs and updating summaries reached the 80% target. An A/B experiment found no statistically significant change in code review duration, and the team estimates the comment-resolution rate at about 40%.

> [!note] From the public record
> Built from Google's own published account, "AI-Assisted Assessment of Coding Practices in Modern Code Review" (May 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

At Google, each change is reviewed by at least one other developer, and every day "tens of thousands of changes to the codebase go through the review process". Authors and reviewers are expected to verify best practices, and formal style guides exist for 15 languages. Linters check some rules, but "some guidelines cannot be captured by precise rules at all". Language experts called readability mentors summarize the best practice in a review comment and add its URL; for them, this can become "a monotonous and time-consuming task". The goal was timely feedback for authors, so reviewers can focus on overall functionality.

## Why this approach

The paper says recent advances suggest LLMs "are suitable for code-review automation", but deployment at scale and extrinsic evaluations of user acceptance were unexplored. Human review comments that link a best practice document provided the training examples. The paper does not say which other options were considered.

## The approach

1. **Task.** The input is a fixed task prompt plus one source file. The output is zero, one or more pairs of a byte offset and the URL of the violated best practice, plus a confidence score.
2. **Data and selection.** Checkpoint, thresholds and decoding were chosen with per-file precision and recall on a time-split dataset and a run over full historical code reviews to estimate posting frequency.
3. **Surfaces.** IDE diagnostics with a blue curly underline, and posted comments in the code review system with thumbs up, thumbs down and "Please fix" buttons.
4. **Calibration.** Per-URL confidence thresholds, no comments on unchanged lines, and beam search in code review but greedy decoding in the IDE (see [Decoding and sampling](#decoding-sampling)).
5. **Suppression.** Specific predictions are switched off by "conditional filtering (matching regular expressions on the source code)", which can be applied immediately.
6. **Rollout.** The paper's authors only until July 2022, then around 3 thousand volunteers, an A/B experiment with about half of all developers in July 2023, and all developers since October 2023.

## The stack

As of May 2024, the paper describes:

- **Model:** "a traditional transformer approach based on T5, using T5X", one multi-task model trained on "over 3 billion examples", about 800k of them for this task. Its context window is 2048 tokens. No parameter count is given.
- **Training:** T5X on a fleet of TPUs, a Beam pipeline for dataset curation, and Tensorboard for monitoring.
- **Serving:** a central best practice analysis service that queries a model service and filters the predictions.

## Results, and how they were measured

**Useful ratio,** the share of comments with feedback that got a thumbs up or "Please fix": "After several months of early usage, we observed that the useful ratio plateaued at around 54%." In an April 2023 study, 15 raters gave around 370 comments a useful ratio of 60%. Suppressing 17 non-actionable URLs raised the historical useful ratio from 54% to 66% on developer feedback, and from 60% to 74% on rater feedback. After 5 more suppressions and manually updated summaries, "these changes were sufficient to reach our target useful ratio of 80%". Explicit feedback came on "about 10% of automated comments in the code review system".

**A/B experiment.** "We did not detect any statistically significant change" in code review duration, active review time or comment-response iterations. "We did, however, detect a slight improvement in coding speed."

**Comment resolution.** In 6000 snapshot pairs, the comment was gone from its lines in 50% of cases. In a manual sample of 40 of those, the author's change resolved the issue in 80% of cases. "Therefore, we estimate that the comment-resolution rate is about 40%".

**Coverage.** AutoCommenter used 330 distinct URLs, covering "68% of historical human comments with a best practice URL". Of the top-50 URLs, "For 33/50 (66%) of these best practices, violation detection is beyond the scope of traditional static analysis."

**Not measured:** any effect on defects or cost. For confidentiality, the paper withholds absolute numbers of code reviews, developers, files and comments. It gives no precision or recall figures, no size for the coding-speed gain and no A/B duration.

## What failed

- **Outdated rules.** Within days of the volunteer launch, users filed a large number of issues, many about one Python imports guideline that changed in early 2022, while the training data stretched back before 2022. The paper notes that "as languages evolve, or new libraries are introduced, best practices evolve as well". Retraining is "time and resource-consuming", so the team chose suppression.
- **Thresholds.** At t=0.98, around 80% of sampled predictions below the threshold were still correct.
- **Unchanged code.** 80% of comments would have landed on lines the author had not modified.
- **Latency.** Beam search had a median latency of 2 seconds, too slow for the IDE.
- **Unhelpful comments.** Raters found guidelines covering several topics, missing or inadequate summaries, subjective topics, a systematic C++ push_back versus emplace_back error, and correct but low-value comments.
- **Narrow coverage, noisy metrics.** Even with beam search, "URL diversity remains relatively low", and with incomplete human labels "our precision and recall measures are noisy".

## What the team would do differently

The paper's lessons: "Intrinsic evaluations and real-world performance can diverge significantly", and extrinsic evaluations and system improvements "proved essential for a successful deployment" (see [Online evaluation](#online-evaluation)). "Even a few negative user experiences can erode trust in an automated system", so monitoring real-world feedback was crucial. Next, the paper plans work on recall and calls improving URL diversity and coverage "one of our top priorities".

The wiki's reading: the useful ratio rests on the few comments that got explicit feedback, so the resolution estimate adds a second signal. See [Online controlled experiments for AI features](#online-experiments) for randomized rollouts and [Building eval datasets](#eval-datasets) for incomplete ground truth.

## Disclosure

None.

## Sources

- Manushree Vijayvergiya, Małgorzata Salawa, Ivan Budiselić, Dan Zheng, Pascal Lamblin, Marko Ivanković, Juanjo Carin, Mateusz Lewko, Jovan Andonov, Goran Petrović, Daniel Tarlow, Petros Maniatis and René Just, Google (René Just: University of Washington, work done at Google), [“AI-Assisted Assessment of Coding Practices in Modern Code Review”](https://arxiv.org/abs/2405.13565), arXiv:2405.13565v1, 22 May 2024. 1st ACM International Conference on AI-Powered Software (AIware '24), 15 to 16 July 2024, Porto de Galinhas, Brazil, doi:10.1145/3664646.3665664.

## Related

- [About playbooks](#about-playbooks)
- [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents)
- [Online evaluation](#online-evaluation)
- [Online controlled experiments for AI features](#online-experiments)
- [Decoding and sampling](#decoding-sampling)
