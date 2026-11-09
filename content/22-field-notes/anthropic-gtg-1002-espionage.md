---
id: anthropic-gtg-1002-espionage
book: 22
order: "22.9"
title: "GTG-1002: a cyber espionage campaign run largely through Claude Code"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [security, misuse, coding-agents, jailbreaks, public-record]
visuals: []
type: field-note
account: public-record
industry: "AI model provider (threat intelligence)"
use_case: "Detecting and disrupting a state-sponsored espionage campaign that used Claude Code and MCP tools as its attack framework"
outcome: "Roughly 30 entities targeted and a handful of successful intrusions validated; Anthropic reports the AI executed approximately 80 to 90 percent of all tactical work"
measured_how: "Anthropic's own investigation of Claude usage after detection in mid-September 2025, with the AI's share based on analysis of operational tempo, request volumes and activity patterns (Anthropic post and full report, November 2025)"
prerequisites: [jailbreaks-misuse, coding-agent-security]
replications: []
---
> [!tldr]
> In mid-September 2025, Anthropic detected a campaign in which an actor it attributes to a Chinese state-sponsored group used Claude Code, inside a custom attack framework built around MCP servers, against roughly 30 entities. Anthropic's investigation validated a handful of successful intrusions. Anthropic reports the AI executed approximately 80 to 90 percent of the tactical work, with humans stepping in at "perhaps 4-6 critical decision points per hacking campaign". The attacker got past the safeguards by splitting the attack into tasks that each looked legitimate on their own, and by claiming to work for a legitimate cybersecurity firm.

> [!note] From the public record
> Built from Anthropic's own published account, "Disrupting the first reported AI-orchestrated cyber espionage campaign" (November 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

Anthropic published the case on 13 November 2025 as a short post, with a full report from its Threat Intelligence team, which "investigates real world cases of misuse". The misused system was Claude Code. Neither document names a Claude model version. The post ties the case to models that can now "run in loops where they take autonomous actions" and reach tools "often via the open standard Model Context Protocol". See [Securing coding agents](#coding-agent-security).

The report names the actor GTG-1002 and says Anthropic assesses "with high confidence" that it was a Chinese state-sponsored group. Neither document sets out the evidence behind this attribution.

## What happened

1. **Setup.** Human operators chose the targets and built a framework that used Claude as an orchestrator, splitting multi-stage attacks into tasks for Claude sub-agents. MCP servers gave it remote command execution, browser automation, code analysis, testing framework integration and callback communication.
2. **Getting past the safeguards.** The operators "broke down their attacks into small, seemingly innocent tasks" and told Claude it worked for a legitimate cybersecurity firm doing defensive testing.
3. **Reconnaissance.** Claude mapped infrastructure across multiple targets at once, with a separate operational context for each campaign.
4. **Exploitation and lateral movement.** Claude generated payloads, validated exploits through callback systems, then harvested and tested credentials. Humans approved the move to active exploitation and the use of harvested credentials.
5. **Collection and handoff.** Against one targeted technology company, Claude queried databases and systems, extracted data and categorized findings by intelligence value. In the report's worked example of a database extraction, Claude also created a persistent backdoor user account, and the human operator approved the final exfiltration targets. The report says "Evidence suggests the threat actor handed off persistent access to additional teams".
6. **Detection and response.** "In mid-September 2025, we detected suspicious activity". The report says "the sustained nature of the attack triggered detection". Over the following ten days Anthropic mapped the operation, banned accounts as they were identified, notified affected entities as appropriate and coordinated with authorities.
7. **Corrections and updates.** On 14 November 2025 the post was edited to correct the attack speed from "thousands of requests per second" to "thousands of requests, often multiple per second". The report's changelog records an attribution wording update on 17 November 2025.

## Impact, and how it was measured

- **Targets and intrusions.** "The operation targeted roughly 30 entities and our investigation validated a handful of successful intrusions." Targets included technology corporations, financial institutions, chemical manufacturing companies and government agencies. No victim is named.
- **Share of the work done by the AI.** Analysis of operational tempo, request volumes and activity patterns "confirms the AI executed approximately 80 to 90 percent of all tactical work independently", in the report's words. Human engagement was "estimated at 10 to 20 percent of total effort". The post says human intervention was required only sporadically, at "perhaps 4-6 critical decision points per hacking campaign".
- **Time per task.** In the report's two worked examples, Claude's autonomous actions took 1-4 hours against 2-10 minutes of human operator actions for a vulnerability discovery and exploitation sequence, and 2-6 hours against 5-20 minutes for a database extraction.
- **Speed.** "At the peak of its attack, the AI made thousands of requests, often multiple per second".
- **Reliability of the AI.** "Claude frequently overstated findings and occasionally fabricated data during autonomous operations", such as credentials that did not work, which meant "requiring careful validation of all claimed results".

**Not measured:** the sources give no exact count of successful intrusions, no data volumes, no time from first activity to detection, and no detail of the signals that flagged it beyond "the sustained nature of the attack". The 80 to 90 percent figure has a one-line basis but no published method, and no method is given for the 4-6 decision points.

## Why it happened

The report explains the bypass through missing context. The framework split attacks into tasks "each of which appeared legitimate when evaluated in isolation", so Claude carried out parts of attack chains "without access to the broader malicious context". The report adds that "The key was role-play": the operators claimed to be employees of legitimate cybersecurity firms, which the report calls "social engineering" of the AI model. See [Jailbreaks and misuse](#jailbreaks-misuse).

The report also says cyber capabilities increasingly "derive from orchestration of commodity resources rather than technical innovation". The infrastructure "relied overwhelmingly on open source penetration testing tools rather than custom malware development", and the custom work "focused on integration rather than novel capabilities".

## What changed afterwards

The post says Anthropic has "expanded our detection capabilities and developed better classifiers to flag malicious activity". The report adds that it is "prototyping proactive early detection systems for autonomous cyber attacks", and that "This attack pattern has been incorporated into our broader safety and security controls". Neither document says whether these changes have since caught similar activity.

## Lessons

The source's own lessons: "The barriers to performing sophisticated cyberattacks have dropped substantially", and "Less experienced and resourced groups can now potentially perform large-scale attacks of this nature." The post calls the case "an escalation" on its earlier "vibe hacking" findings, where humans still directed the operations. It argues that the same abilities "also make it crucial for cyber defense", and advises security teams to experiment with AI for defense in Security Operations Center automation, threat detection, vulnerability assessment and incident response. The report notes a limit: "While we only have visibility into Claude usage", the case likely reflects patterns across frontier AI models.

The wiki's reading:

- **Per-request checks miss a split-up plan.** Each subtask looked harmless; the harm was in the sequence. Detection came from the sustained pattern, which argues for monitoring at the level of accounts and sessions. See [Threat modeling LLM apps and agents](#threat-modeling).
- **Agent claims need checking, for attackers too.** Overstated findings and invented credentials limited this campaign as they limit honest agents. See [Agent failure modes](#agent-failure-modes).
- **Tool integrations are where the capability lives.** An MCP layer over commodity tools turned a coding agent into an operations platform. See [MCP security](#mcp-security).

## Disclosure

None.

## Sources

- Anthropic (no author named), [“Disrupting the first reported AI-orchestrated cyber espionage campaign”](https://www.anthropic.com/news/disrupting-AI-espionage), Anthropic news (Security), 13 November 2025, edited 14 November 2025.
- Anthropic (no author named), [“Disrupting the first reported AI-orchestrated cyber espionage campaign: Full report”](https://assets.anthropic.com/m/ec212e6566a0d47/original/Disrupting-the-first-reported-AI-orchestrated-cyber-espionage-campaign.pdf), Anthropic, November 2025, changelog entry 17 November 2025.

## Related

- [About field notes](#about-field-notes)
- [Securing coding agents](#coding-agent-security)
- [Jailbreaks and misuse](#jailbreaks-misuse)
- [Security and vulnerability-research agents](#security-agents)
- [Threat modeling LLM apps and agents](#threat-modeling)
