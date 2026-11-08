---
id: about-playbooks
book: 21
order: "21.1"
title: About playbooks
level: foundation
stability: moving
reviewed: "2026-11"
status: seed
tags: [playbooks, contributing]
visuals: []
type: playbook
---
> [!tldr]
> A playbook shows how one team used AI for one real use case in one industry: the problem, the approach, the stack, the results and how they were measured, and what failed. This book is new and waits for its first playbooks; this page explains what belongs here and how to add one.

## What belongs here

- **One real use case per page,** from work that was actually done, in one industry: retail, healthcare, the public sector or any other.
- **The whole story:** the problem, why this approach, what was built, the stack, the results, what failed, and what the team would do differently.
- **Results only as measured,** with the metric, the baseline, the sample and the period. "We did not measure this" is a fine answer; an estimate presented as a result is not.
- **People and organizations protected:** a playbook names an organization only if it agreed to be named (rule 7), and every author discloses ties to the vendors they mention (rule 5).

## What does not belong here

- Hypothetical or composite case studies, or anything invented to make a point.
- Product announcements, vendor case studies written to sell, and benchmarks without a method (rule 6).
- Tutorials without a real deployment behind them. Those belong in the chapters of Books 0 to 20.

## How to add a playbook

- **With a coding agent:** give it the contribution prompt from [CONTRIBUTING.md](https://github.com/ground-truth-wiki/ground-truth/blob/main/CONTRIBUTING.md). It runs `npm run new -- playbook <id> --title "…"`, which starts from the playbook template, and you fill in each section.
- **Without one:** fill in the "Share a playbook" form on GitHub. A maintainer turns it into a page with you, and nothing is published before you approve it.

## How playbooks are reviewed

A steward reads every playbook like a careful editor: are the results measured as described, is the organization anonymized or did it agree to be named, are the claims about tools sourced and dated, and is anything selling rather than explaining? Other teams who try the same approach can add their result under `replications`, so a playbook grows stronger, or weaker, with evidence.

## Talk like an expert

Practitioners trust a playbook more for its "what failed" section than for its results: failures are where the transferable lessons live.

## Related

- [About field notes](#about-field-notes)
- [Why evals are the core skill](#why-evals)
- [Error analysis first](#error-analysis)
- [Lessons from public engineering write-ups](#public-writeups)
