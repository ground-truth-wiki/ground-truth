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
> A field note is an account of a real AI deployment: what was shipped, what happened, how the impact was measured, why it went the way it did, and what changed afterwards. Each is either first-hand or comes from the public record, from an official account the organization or a public body published. Postmortems and failures are as welcome as successes. This page explains what belongs here and how to add one, and lists the field notes by industry.

## The field notes, by industry

Grouped by the industry of the organization. Each page says at the top whether it is a first-hand account or built from the public record.

### Software and developer tools

- [Cloudflare's November 2025 outage: a bot-scoring model's feature file doubles in size](#cloudflare-november-2025-outage)
- [Prompt injections that bypassed tool confirmation in VS Code agent mode](#github-vscode-prompt-injection-safeguards)
- [Experienced open-source developers took longer with early-2025 AI tools](#metr-developer-productivity-rct)
- [Presto Voice: an SEC order on drive-thru AI that relied on human agents](#sec-presto-voice-ordering)

### AI and cloud providers

- [Three infrastructure bugs that degraded Claude's answers](#claude-quality-bugs-2025)
- [GTG-1002: a cyber espionage campaign run largely through Claude Code](#anthropic-gtg-1002-espionage)
- [Three Claude Code changes behind reports of worse responses](#claude-code-quality-reports-2026)
- [LiteLLM's March 2026 supply chain incident: two malicious releases on PyPI](#litellm-supply-chain-incident)
- [OpenAI's December 2024 outage: a telemetry rollout overwhelms the Kubernetes control plane](#openai-december-2024-outage)
- [Vercel's d0: a text-to-SQL agent cut down to bash and files](#vercel-agent-tools-removed)
- [Vercel's April 2026 security incident: a third-party AI tool as the way in](#vercel-april-2026-security-incident)

### Finance and insurance

- [Apple Card credit decisions under a New York regulator's review](#nydfs-apple-card-investigation)

### Commerce and marketplaces

- [Project Vend: a Claude agent runs a small office shop](#project-vend)

### Travel, mobility and delivery

- [Uber ATG's test vehicle crash in Tempe: what the NTSB found](#ntsb-uber-atg-tempe-crash)
- [Waymo's rider-only crash rates against human benchmarks, by crash type](#waymo-crash-rates-human-benchmarks)
- [Waymo's voluntary software recall: two vehicles mispredict the same towed pickup truck](#waymo-software-recall)

### Media, social and gaming

- [Spotify: when the volume of change outgrows verification](#spotify-quality-at-higher-velocity)

### Healthcare

- [A widely used sepsis model meets its first external validation](#epic-sepsis-model-validation)
- [Ambient AI documentation at Atrium Health: no efficiency gain for clinicians as a group](#atrium-health-ambient-documentation)
- [SepsisWatch at Duke: what it took to put a sepsis model into practice](#duke-algorithm-journey-map)
- [Rite Aid's in-store facial recognition: an FTC case on unmeasured false matches](#ftc-rite-aid-facial-recognition)

### Public sector

- [The New York City MyCity chatbot under audit](#nyc-mycity-chatbot-audit)

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
