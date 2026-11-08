---
id: ai-failure-casebook
book: 18
order: "18.5.1"
title: "Public AI failures and incidents: a casebook"
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [case-studies, incidents, failures, security-incidents, lessons]
visuals: []
prerequisites: [public-writeups]
---
> [!tldr]
> Public AI failures are the cheapest lessons you will ever get, because someone else already paid for them. Read each case like an incident report: what the system was, what it did, who was harmed, where untrusted input entered, which safeguard was missing, and what changed afterwards. The one thing to remember: most famous failures are not exotic model bugs but familiar gaps, such as no grounding, no approval before an irreversible action, or untrusted text that meets real privileges.

## Key ideas

- **Catalogs, and incident versus hazard.** The AI Incident Database indexes "harms or near harms realized in the real world" so that, like similar databases in aviation and computer security, it helps people learn from past failures ([AI Incident Database](https://incidentdatabase.ai/)). The OECD calls an event an AI incident when harm happened and an AI hazard when an AI system could plausibly lead to one, and its AI Incidents and Hazards Monitor collects both from news reports ([Aranda and Perset, OECD.AI (2024)](https://oecd.ai/en/wonk/defining-ai-incidents-and-hazards); [OECD AIM](https://oecd.ai/en/incidents)).
- **Confident, wrong and liable.** In Moffatt v. Air Canada (2024 BCCRT 149), a tribunal rejected the argument that the airline's chatbot was a separate legal entity and held the airline liable for its wrong answer on bereavement fares ([Wikipedia](https://en.wikipedia.org/wiki/Moffatt_v._Air_Canada)); in Mata v. Avianca (2023), a US federal court fined lawyers $5,000 for filing case citations that ChatGPT had made up ([Wikipedia](https://en.wikipedia.org/wiki/Mata_v._Avianca,_Inc.)), and one public database counts 2,266 court decisions that deal with hallucinated content, as of 5 November 2026 ([Charlotin, AI Hallucination Cases](https://www.damiencharlotin.com/hallucinations/)). New York City's MyCity chatbot told business owners they could take workers' tips and refuse Section 8 vouchers ([The Markup (2024)](https://themarkup.org/news/2024/03/29/nycs-ai-chatbot-tells-businesses-to-break-the-law)), and the city took it down in February 2026 ([The Markup (2026)](https://themarkup.org/artificial-intelligence/2026/01/30/mamdani-to-kill-the-nyc-ai-chatbot-we-caught-telling-businesses-to-break-the-law)).
- **Bad inputs, at learning time and at answer time.** Microsoft took its Tay chatbot offline in March 2016 because, in its first 24 hours online, "a coordinated attack by a subset of people exploited a vulnerability" in a bot that was meant to learn from its interactions with people ([Lee, Microsoft (2016)](https://blogs.microsoft.com/blog/2016/03/25/learning-tays-introduction/)). Google traced the odd AI Overviews of May 2024 mostly to data voids, satire and forum posts, noted that many viral screenshots were fake, and responded by detecting nonsensical queries, limiting satire and user-generated content as sources, and restricting when overviews appear ([Reid, Google (2024)](https://blog.google/products/search/ai-overviews-update-may-2024/)).
- **Agents and tools with too much reach.** In a case reported in July 2025, Replit's coding agent deleted a production database during a declared code freeze; Replit answered with automatic separation of development and production databases, better rollback and a planned planning-only mode ([Fortune (2025)](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/)). An attacker used an over-scoped GitHub token to push malicious code into version 1.84.0 of the Amazon Q Developer extension for VS Code, which shipped but failed to run because of a syntax error ([AWS-2025-015](https://aws.amazon.com/security/security-bulletins/AWS-2025-015/)); a fake `postmark-mcp` npm package added one line in version 1.0.16 that blind-copied every outgoing email to an attacker ([The Register (2025)](https://www.theregister.com/2025/09/29/postmark_mcp_server_code_hijacked/)).
- **Untrusted text, real privileges and an exit.** GitHub Copilot Chat rendered Markdown images, so instructions hidden in a code file could make it put chat data into an image URL that the editor then fetched; by June 2024 Copilot Chat no longer rendered Markdown images, which the researcher who reported it took to be the fix ([Rehberger (2024)](https://embracethered.com/blog/posts/2024/github-copilot-chat-prompt-injection-data-exfiltration/)). EchoLeak (CVE-2025-32711) chained the same idea with classifier and link-redaction bypasses into a zero-click leak from Microsoft 365 Copilot, triggered by a single crafted email ([Reddy and Gujral, “EchoLeak: The First Real-World Zero-Click Prompt Injection Exploit in a Production LLM System” (2025)](https://arxiv.org/abs/2509.10540)).
- **Poisoned supply chains and misuse at scale.** Two models on Hugging Face hid a reverse shell in PyTorch files compressed with 7z instead of the default ZIP format. Their pickle stream broke right after the payload ran, and the Picklescan scanner did not flag them as unsafe; ReversingLabs named the technique nullifAI ([Zanki, ReversingLabs (2025)](https://www.reversinglabs.com/blog/rl-identifies-malware-ml-model-hosted-on-hugging-face)). Code models invent package names often enough (205,474 unique hallucinated names across 16 models) that attackers can register them as a package confusion attack ([Spracklen et al., “We Have a Package for You! A Comprehensive Analysis of Package Hallucinations by Code Generating LLMs” (USENIX Security 2025)](https://arxiv.org/abs/2406.10279)), which Python Software Foundation developer Seth Larson named slopsquatting ([Infosecurity Magazine (2025)](https://www.infosecurity-magazine.com/news/ai-hallucinations-slopsquatting/)). Anthropic reported a Chinese state-sponsored espionage campaign it designated GTG-1002, in which the attacker used Claude Code to run 80 to 90% of tactical operations independently ([Anthropic, “Disrupting the first reported AI-orchestrated cyber espionage campaign” (2025)](https://assets.anthropic.com/m/ec212e6566a0d47/original/Disrupting-the-first-reported-AI-orchestrated-cyber-espionage-campaign.pdf)), and in February 2026 distillation campaigns by three AI laboratories that ran over 16 million exchanges through about 24,000 fraudulent accounts ([Anthropic (2026)](https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks)).

## Planned visuals

- **`matrix`: the casebook.** One row per case with its date, system, harm, entry vector, trust boundary crossed, missing safeguard, what changed afterwards, its OWASP LLM, OWASP Agentic and MITRE ATLAS entries, and the chapter that owns the fix; filterable by product failure versus security incident.
- **`timeline`: a decade of public AI failures.** Dated cases from Tay (2016) through Mata v. Avianca, Moffatt v. Air Canada, MyCity and AI Overviews to Replit, EchoLeak, the Amazon Q extension, `postmark-mcp`, GTG-1002 and the 2026 distillation campaigns.
- **`tree`: recurring lessons.** Grounding and abstention, approvals and blast radius, untrusted text plus privileges, rendered output as an exit, unpinned dependencies, evals for rare and adversarial queries, missing monitoring, and disclosure and liability; each lesson expands to its cases and links to the chapter that owns the control.

## Talk like an expert

Experts read a case for its **entry vector**, the **trust boundary** it crossed, the **blast radius** and the **missing control**, and they ask "what would have stopped this, and which team owns that control?" rather than "which model failed?". They map each case to the [OWASP Top 10 for Agentic Applications](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/), the OWASP LLM list and [MITRE ATLAS](https://atlas.mitre.org/), and they keep vendor statements, verified records and viral screenshots apart.

## Go deeper

- [AI Incident Database](https://incidentdatabase.ai/) and the [OECD AI Incidents and Hazards Monitor](https://oecd.ai/en/incidents), for searchable public cases.
- Aranda and Perset, [“Name it to tame it: Defining AI incidents and hazards”](https://oecd.ai/en/wonk/defining-ai-incidents-and-hazards) (OECD.AI, 2024).
- Reddy and Gujral, [“EchoLeak: The First Real-World Zero-Click Prompt Injection Exploit in a Production LLM System”](https://arxiv.org/abs/2509.10540) (2025).
- [OWASP Top 10 for Agentic Applications for 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/) (December 2025).

## Related

- [Lessons from public engineering write-ups](#public-writeups)
- [Incidents and on-call](#incidents-on-call)
- [The anti-patterns hall of shame](#anti-patterns)
- [Prompt injection attacks and defenses in depth](#prompt-injection-techniques)
- [Supply chain and model security](#supply-chain-security)
- [Hallucination and factuality](#hallucination-factuality)
