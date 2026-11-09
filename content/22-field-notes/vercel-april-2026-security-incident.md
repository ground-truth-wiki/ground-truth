---
id: vercel-april-2026-security-incident
book: 22
order: "22.14"
title: "Vercel's April 2026 security incident: a third-party AI tool as the way in"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [incidents, security, supply-chain, oauth, public-record]
visuals: []
type: field-note
account: public-record
industry: "Software (developer platform)"
use_case: "A third-party AI tool, Context.ai, used by a Vercel employee, whose Google Workspace OAuth app was compromised"
outcome: "An attacker reached internal Vercel systems and decrypted non-sensitive environment variables; Vercel identified a limited subset of customers, and later a small number of additional accounts, as affected; remediation complete and incident closed as of October 16, 2026"
measured_how: "No counts or metrics; affected customers and accounts described as groups, the additional accounts found by a broader review of IOCs, requests to the Vercel network and environment variable read events in logs (Vercel security bulletin, April to October 2026)"
prerequisites: [supply-chain-security]
replications: []
---
> [!tldr]
> In April 2026, an attacker reached internal Vercel systems through Context.ai, a third-party AI tool used by a Vercel employee, and decrypted customer environment variables not marked as sensitive. Vercel published an indicator of compromise for the tool's OAuth app, recommended that affected customers rotate credentials, and closed the incident on October 16, 2026.

> [!note] From the public record
> Built from Vercel's own published account, "Vercel April 2026 security incident" (April 2026, last updated October 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

The account is a security bulletin in Vercel's Knowledge Base by its Security Team, updated from April to October 2026. It opens: "We’ve identified a security incident that involved unauthorized access to certain internal Vercel systems."

The bulletin says the incident originated from "a small, third-party AI tool whose Google Workspace OAuth app was the subject of a broader compromise", a compromise "potentially affecting its hundreds of users across many organizations." It does not say what the tool did, what access its OAuth app held, or how it was compromised.

The data at stake was customers' environment variables. The bulletin separates variables marked "sensitive" from the rest, "(those that decrypt to plaintext)".

## What happened

The bulletin describes the path in this order:

1. Context.ai was compromised.
2. The attacker used that access to "take over the employee's individual Vercel Google Workspace account".
3. That account enabled access to the employee's Vercel account.
4. From there, the attacker was able to "pivot into a Vercel environment" and "enumerate and decrypt non-sensitive environment variables".

The update log gives times in PST without a year; the title places them in 2026.

- **April 19.** Vercel published an indicator of compromise (IOC) at 11:04 AM, then information about the origin of the attack at 6:01 PM.
- **April 20.** It clarified the definition of compromised credentials, validated that npm packages were not compromised and shipped product enhancements.
- **April 22 and 23.** It published, then clarified, findings from the continued investigation.
- **April 24.** The entry reads "No updates published."
- **October 16, 10:19 AM.** Remediation was complete and the incident closed.

The bulletin does not say when or how the intrusion was detected.

## Impact, and how it was measured

The bulletin names affected groups but does not count them.

- **Customer environment variables.** Vercel first identified "a limited subset of customers" whose non-sensitive environment variables were compromised, and recommended "an immediate rotation of credentials".
- **More accounts.** A broader review, with additional IOCs and an analysis of requests to the Vercel network and environment variable read events in its logs, found "a small number of additional accounts that were compromised as part of this incident". Those customers were notified.
- **Separate compromises.** The review also found a small number of customer accounts with signs of compromise that appear to be separate from the April 2026 incident. These compromises "do not appear to have originated on Vercel systems". Vercel says this does not appear to continue or expand the April incident, or to be evidence of an earlier one.
- **npm packages.** With GitHub, Microsoft, npm and Socket, the security team confirmed that "no npm packages published by Vercel have been compromised".
- **The attacker.** Vercel assesses the attacker as "highly sophisticated based on their operational velocity and in-depth understanding of Vercel's product API surface".

**Not measured:** the bulletin gives no number of affected customers, accounts or environment variables, no date of first access or detection, no length of time the attacker had access, and no statement on whether exposed values were used.

## Why it happened

The bulletin names an origin and does not use the term root cause: "The incident originated with a compromise of Context.ai, a third-party AI tool used by a Vercel employee."

The bulletin states that the Google Workspace account gave access to the employee's Vercel account, and that environment variables not marked as sensitive could be decrypted. It does not describe which controls the attacker passed on the way to "a Vercel environment".

## What changed afterwards

- **Outside help.** Vercel engaged incident response experts, notified law enforcement, and says it is working with Google Mandiant, additional cybersecurity firms and industry peers. It also engaged Context.ai directly.
- **An indicator for others.** It published the OAuth app's ID and recommended that Google Workspace Administrators and Google Account owners check for its use immediately.
- **Customer guidance.** Rotate environment variables not marked as sensitive, which "should be treated as potentially exposed and rotated as a priority", and use the sensitive environment variables feature. Rotate before deleting: "Deleting your Vercel projects or account is not sufficient to eliminate risk." Enable multi-factor authentication, review activity logs and recent deployments, and set Deployment Protection to Standard at a minimum.
- **Product changes.** "Better environment variable management, with stronger defaults, improved safeguards, and in-product education", a new team-wide management and security overview of environment variables, and an easier to use activity log.

As of October 16, 2026, "all remediation actions related to the security incident are complete, and the incident is closed". The bulletin does not report whether the product changes reduced exposure.

## Lessons

The bulletin states no lessons beyond its recommendations to customers, listed above.

The wiki's reading: four points for teams that adopt AI tools.

- **An AI tool connected to a work account is part of the supply chain.** The incident started at a small third-party tool whose OAuth app was the subject of a broader compromise. Reviewing such apps and what they can reach is covered in [Supply chain and model security](#supply-chain-security) and [Threat modeling LLM apps and agents](#threat-modeling).
- **Access chains.** One identity led to the next: the AI tool, the Google Workspace account, the Vercel account, a Vercel environment. Limiting what each delegated grant can reach is the subject of [Agent identity and delegated authorization](#agent-identity-delegation).
- **Defaults decide exposure.** Variables not marked as sensitive could be decrypted, and the first product enhancement Vercel lists names "stronger defaults".
- **Share indicators.** Vercel published the OAuth app ID so that others could check their own environments, a part of incident communication covered in [Incidents and on-call](#incidents-on-call).

## Disclosure

None.

## Sources

- Security Team, Vercel, [“Vercel April 2026 security incident”](https://vercel.com/kb/bulletin/vercel-april-2026-security-incident), Vercel Knowledge Base security bulletin, dated 19 Apr 2026, update log from April 19 to October 16, 2026 (last updated October 16, 2026).

## Related

- [About field notes](#about-field-notes)
- [Supply chain and model security](#supply-chain-security)
- [Agent identity and delegated authorization](#agent-identity-delegation)
- [Incidents and on-call](#incidents-on-call)
- [Public AI failures and incidents: a casebook](#ai-failure-casebook)
