---
id: about-field-notes
book: 22
order: "22.1"
title: About field notes
level: foundation
stability: moving
reviewed: "2026-11"
status: seed
tags: [field-notes, postmortems, contributing]
visuals: []
type: field-note
---
> [!tldr]
> A field note is an account of a real AI deployment: what was shipped, what happened, how the impact was measured, why it went the way it did, and what changed afterwards. Most are first-hand; some come from the public record, from an official account the organization or a public body published. Postmortems and failures are as welcome as successes. This book is new; this page explains what belongs here and how to add one.

## What belongs here

- **Real deployments,** told by people who were there: launches, incidents, rollbacks, migrations and slow successes.
- **Official accounts from the public record:** postmortems, incident reports, evaluations and audits that the organization or a public body published, and court or regulator decisions. They are rebuilt with every claim quoted and linked, under a "From the public record" note that says so.
- **Postmortems in a blameless style:** describe the system and the decisions, not the people who made them.
- **Impact only as measured,** against a baseline, with how it was measured. Say what nobody measured.
- **People and organizations protected:** a field note names an organization only if it agreed to be named (rule 7), and every author discloses ties to the vendors they mention (rule 5). A public-record field note names organizations as the official account itself does.

## What does not belong here

- Invented or hypothetical incidents, and incidents retold from news coverage. A public-record field note is built from the official account itself. Lessons collected from many write-ups belong in [Lessons from public engineering write-ups](#public-writeups), and incidents known only from the news in [the casebook of public AI failures](#ai-failure-casebook).
- Anything that exposes customers, users or colleagues, or confidential details you are not allowed to share.
- Marketing in the shape of a story (rule 6).

## How to add a field note

- **With a coding agent:** give it the contribution prompt from [CONTRIBUTING.md](https://github.com/ground-truth-wiki/ground-truth/blob/main/CONTRIBUTING.md). It runs `npm run new -- field-note <id> --title "…"`, which starts from the field note template, and you fill in each section.
- **Without one:** describe it in the "Share a playbook" form on GitHub and say it is a field note. A maintainer turns it into a page with you, and nothing is published before you approve it.
- **From the public record:** run `npm run new -- field-note <id> --title "…" --public-record` and follow the public-record rules in [STYLE_GUIDE.md](https://github.com/ground-truth-wiki/ground-truth/blob/main/STYLE_GUIDE.md#playbooks-and-field-notes).

## How field notes are reviewed

A steward checks that the account is first-hand, or, on a public-record page, that every quote and number matches the official account. The steward also checks that impact claims say how they were measured, that people and organizations are protected, and that the lessons link to the chapters that explain them.

## Talk like an expert

The most useful field notes end with a change someone else can copy: a new eval, a guardrail, a rollout rule or a monitoring signal.

## Related

- [About playbooks](#about-playbooks)
- [Agent failure modes](#agent-failure-modes)
- [Reliability engineering](#reliability-engineering)
- [Lessons from public engineering write-ups](#public-writeups)
- [A widely used sepsis model meets its first external validation](#epic-sepsis-model-validation)
- [Three infrastructure bugs that degraded Claude's answers](#claude-quality-bugs-2025)
- [The New York City MyCity chatbot under audit](#nyc-mycity-chatbot-audit)
