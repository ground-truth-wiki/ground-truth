---
id: cloudflare-internal-ai-engineering-stack
book: 21
order: "21.9"
title: "Cloudflare's internal AI engineering stack: gateway, MCP portal and AI code review"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [developer-tools, coding-agents, mcp, code-review, ai-gateway, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software and developer tools (Cloudflare's internal engineering)"
use_case: "An internal platform that gives engineers AI coding tools, shared MCP servers and an AI review of every merge request, built on Cloudflare's own products"
outcome: "3,683 internal users actively using AI coding tools (60% company-wide, 93% across R&D); 100% AI code reviewer coverage across all repos on the standard CI pipeline"
measured_how: "Usage counts the post gives for the last 30 days (its scoreboard dates the adoption figures Feb 5 to April 15, 2026); no adoption baseline, no control group and no quality measure (Cloudflare Blog, April 2026)"
prerequisites: [coding-agents, gateways-routers]
replications: []
---
> [!tldr]
> Cloudflare built the platform behind its engineers' AI coding tools on its own products (all but Backstage), with an AI reviewer on every merge request. The post counts "3,683 internal users actively using AI coding tools" and a rise in weekly merge requests, but reports no quality measure and no causal test.

> [!note] From the public record
> Built from Cloudflare's own published account, "The AI engineering stack we built internally, on the platform we ship" (April 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The project started "Eleven months ago" (as of April 2026), "to truly integrate AI into our engineering stack". A tiger team called iMARS started it, and the Dev Productivity team carried it on.

With "over 3,600+ internal users using AI coding tools daily", the company had to solve access and visibility across many clients and roles. And early on, "coding agents produced changes that looked plausible and were still wrong for the repo", usually because the model lacked local context such as the right test command.

## Why this approach

- **A proxy Worker in front of AI Gateway.** Direct connections to AI Gateway "would have been simpler to set up initially", but one Worker let the team add per-user attribution, model catalog management and permission enforcement later, without touching client configs. See [Gateways and routers](#gateways-routers).
- **Workers AI for some workloads,** for cost against frontier models and because inference stays on the same network as Workers, Durable Objects and storage.
- **Code Mode at the portal.** Every MCP tool definition uses context tokens before the model starts; with Code Mode, the model discovers and calls tools through code. See [MCP at scale](#mcp-at-scale).

Apart from Backstage, every layer in the post's architecture table is a product Cloudflare ships, and the post was published to close out Cloudflare's Agents Week. It does not say which other vendors were considered.

## The approach

1. **One command to set up.** `opencode auth login` fetches a shared config and authenticates through Cloudflare Access. Local configs take priority.
2. **A proxy Worker** validates the Access token, injects the API key server side and forwards requests to AI Gateway: "No API keys exist on user machines."
3. **An MCP Server Portal** aggregates 13 production MCP servers exposing 182+ tools behind one endpoint, collapsed into two portal-level tools with Code Mode.
4. **Backstage** is the knowledge graph of services and owners, queried through an MCP server.
5. **Generated AGENTS.md files.** A model writes them from Backstage metadata, a repository analysis and Engineering Codex standards, and the system opens a merge request for the owning team. See [Instruction files](#agent-instruction-files).
6. **An AI Code Reviewer.** A GitLab CI component runs OpenCode with a coordinator that classifies each merge request by risk tier and delegates to specialized review agents, such as security and codex compliance. Findings carry a severity level and, where one applies, an Engineering Codex rule ID. See [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents).

## The stack

As of April 2026: OpenCode and Windsurf as clients; Cloudflare Access; AI Gateway; frontier labs (OpenAI, Anthropic, Google) and open-weight models on Workers AI, including Kimi K2.5; Opus 4.6 and GPT 5.4 in the reviewer; the Agents SDK, Durable Objects, Dynamic Workers, Sandbox SDK and Workflows; the Engineering Codex, Cloudflare's internal standards system; self-hosted Backstage and GitLab.

## Results, and how they were measured

The post reports usage counts "over the last 30 days", while its scoreboard dates the same adoption figures Feb 5 to April 15, 2026.

- **Adoption.** "3,683 internal users actively using AI coding tools (60% company-wide, 93% across R&D)", out of approximately 6,100 total employees.
- **Volume.** 47.95 million AI requests (the scoreboard calls them "AI messages"). Separately, 20.18 million AI Gateway requests per month and 241.37 billion tokens routed through AI Gateway.
- **Provider split.** Over the last month, frontier labs took 13.38M requests (91.16%) and Workers AI 1.3M (8.84%): "Frontier models handle the bulk of complex agentic coding work for now".
- **Merge requests.** The post states "The impact on developer velocity internally is clear" and "we’ve never seen a quarter-to-quarter increase in merge requests to this degree." The 4-week rolling average "has climbed from ~5,600/week to over 8,700", and "The week of March 23 hit 10,952, nearly double the Q4 baseline."
- **Code review.** "100% AI code reviewer coverage across all repos on our standard CI pipeline." Workers AI handles about 15% of the reviewer's traffic.
- **Cost.** Citing an earlier Cloudflare post, it says a security agent processes over 7 billion tokens per day on Kimi. "That would cost an estimated $2.4M per year on a mid-tier proprietary model. But on Workers AI, it's 77% cheaper." The post gives no method for the estimate.

**Not measured:** the post gives no quality, defect or accuracy figures for the reviewer, the security agent or the merged code. It does not separate the effect of AI tools from other causes of the rise in merge requests, and its claim that the first draft "is usually close enough to ship" comes with no measurement.

## What failed

- **Plausible but wrong changes,** from missing local context. This led to AGENTS.md.
- **Tool schemas filling the context window.** The GitLab MCP server's 34 tool schemas used roughly 15,000 tokens of context window per request: "On a 200K context window, that's 7.5% of the budget gone before asking a question." The post says portal-level Code Mode lets the team solve this centrally.
- **Imperfect generated files.** Across roughly 3,900 repositories, "The first pass wasn't always perfect, especially for polyglot repos or unusual build setups". The post adds that even that baseline "was much better than asking agents to infer everything from scratch", with no measurement. The files also age: "A stale AGENTS.md can be worse than no file at all." The AI Code Reviewer can flag changes that suggest an update.

## What the team would do differently

The post names nothing it would redo. It names one early decision it got right: "routing through a single proxy Worker from day one." It says none of the pieces is especially novel on its own: "The difference is the wiring". Next, it plans background agents that run in the cloud with the same tools.

The wiki's reading: the results count adoption and volume. Merge requests per week are a throughput proxy, and without a quality measure they do not show whether more changes meant better software. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).

## Disclosure

None.

## Sources

- Ayush Thakur, Scott Roe-Meschke and Rajesh Bhatia, Cloudflare, [“The AI engineering stack we built internally, on the platform we ship”](https://blog.cloudflare.com/internal-ai-engineering-stack/), Cloudflare Blog, 20 April 2026. The published title has a dash where this page has a comma.

## Related

- [About playbooks](#about-playbooks)
- [Instruction files: AGENTS.md, CLAUDE.md and rules](#agent-instruction-files)
- [MCP at scale](#mcp-at-scale)
- [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
