---
id: protocol-governance
book: 12
order: "12.14"
title: Governance and ecosystem
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [governance, standards, foundations]
visuals:
  - steward-map:diagram
  - sep-lifecycle:stepper
---
> [!tldr]
> Agent protocols moved from single companies toward neutral foundations within about a year. Know who stewards each one, how changes are proposed and accepted, and how deprecations work, and re-check it often: this chapter is a dated snapshot as of November 2026.

## Why it matters
When you build on a protocol, you inherit its governance: who can change it, how fast, and whether a competitor can steer it. A neutral steward with an open process makes a protocol safer to adopt; a single-vendor protocol can change direction with one announcement. Governance also tells you where to go to influence a standard your product depends on.

## Intuition
Building on a protocol is like building a house on land: you want to know who owns the land, what the zoning rules are, and how they get changed. Foundations are the public land registry; SEPs are the planning applications.

```viz
{"id":"steward-map","component":"diagram","title":"Most major agent protocols now sit with foundations or open projects rather than single companies","caption":"A dated snapshot. Origins are well documented; current stewardship changes, so check each project before you rely on it.","alt":"Diagram mapping MCP, A2A, AGENTS.md, Agent Skills, AG-UI and the Agent Client Protocol to where each originated and who stewards it.","data":"illustrative","depicts":"As of November 2026","w":600,"h":300,"nodes":[
{"id":"mcp","label":"MCP","sub":"from Anthropic, Nov 2024","role":"tool","x":0,"y":0,"w":200,"h":52,"link":"#mcp-spec-history"},
{"id":"a2a","label":"A2A","sub":"from Google, Apr 2025","role":"agent","x":0,"y":82,"w":200,"h":52,"link":"#a2a"},
{"id":"agentsmd","label":"AGENTS.md","sub":"cross-vendor, 2025","role":"data","x":0,"y":164,"w":200,"h":52,"link":"#coding-harness-landscape"},
{"id":"skills","label":"Agent Skills","sub":"from Anthropic, Oct 2025","role":"data","x":0,"y":246,"w":200,"h":52,"link":"#skills-plugins"},
{"id":"lf","label":"Agentic AI Foundation","sub":"Linux Foundation (verified Nov 2026)","x":330,"y":40,"w":270,"h":60},
{"id":"open","label":"Open repositories","sub":"agentskills/agentskills (verified Nov 2026)","x":330,"y":200,"w":270,"h":60}],
"edges":[{"from":"mcp","to":"lf","label":"Dec 2025"},{"from":"a2a","to":"lf","label":"Aug 2026"},{"from":"agentsmd","to":"lf","label":"Dec 2025"},{"from":"skills","to":"lf","label":"Oct 2026"},{"from":"skills","to":"open"}]}
```

## How it works
**MCP.** Created by Anthropic and open-sourced in November 2024. On 9 December 2025 Anthropic contributed it to the Agentic AI Foundation (AAIF) under the Linux Foundation, alongside goose and AGENTS.md as founding projects; MCP keeps its own lead and core maintainers (verified Nov 2026). Changes go through SEPs on GitHub, with maintainers and working groups for areas such as transports, authorization and extensions. The 2026-07-28 release formalized a feature lifecycle with deprecation before removal (verified Nov 2026).

**A2A.** Introduced by Google in April 2025 with many launch partners, moved to the Linux Foundation in mid-2025, and joined the AAIF as a Growth Stage project on 27 August 2026. Version 1.0.0 shipped on 12 March 2026 and 1.0.1 on 26 May 2026 (verified Nov 2026).

**AGENTS.md.** Emerged in 2025 as a shared, vendor-neutral convention for coding-agent instructions, adopted by many agents; since December 2025 it has been stewarded by the AAIF as one of its three founding projects (verified Nov 2026).

**Agent Skills.** Introduced by Anthropic in October 2025 and published as an open format, maintained in the `agentskills/agentskills` repository; Anthropic contributed it to the AAIF on 22 October 2026 (verified Nov 2026).

**AG-UI and the Agent Client Protocol.** Both came from companies building agent front ends and editors respectively, and both are developed in the open; check each project’s governance page.

**How standards evolve.** A proposal is written, discussed in the open, implemented in reference SDKs and servers, tested for interoperability, accepted, released in a dated version, and eventually deprecated and removed when superseded:

```viz
{"id":"sep-lifecycle","component":"stepper","title":"A protocol change becomes real only after it is implemented, released and survives deprecation of what it replaces","caption":"A generic proposal lifecycle, modeled on how MCP uses SEPs. Exact stage names vary by project; check each project’s contributing guide.","alt":"Stepper through the lifecycle of a protocol change from draft proposal to release and the deprecation of the feature it replaces.","data":"illustrative","diagram":{"w":600,"h":56,"nodes":[{"id":"draft","label":"Draft","align":"center","glyph":false,"x":0,"y":0,"w":90,"h":56},{"id":"review","label":"Review","align":"center","glyph":false,"x":102,"y":0,"w":90,"h":56},{"id":"impl","label":"Implement","role":"tool","align":"center","glyph":false,"x":204,"y":0,"w":90,"h":56},{"id":"accept","label":"Accept","role":"agent","align":"center","glyph":false,"x":306,"y":0,"w":90,"h":56},{"id":"release","label":"Release","role":"data","align":"center","glyph":false,"x":408,"y":0,"w":90,"h":56},{"id":"deprecate","label":"Deprecate\nold","align":"center","glyph":false,"x":510,"y":0,"w":90,"h":56}],"edges":[{"from":"draft","to":"review"},{"from":"review","to":"impl"},{"from":"impl","to":"accept"},{"from":"accept","to":"release"},{"from":"release","to":"deprecate"}]},
"frames":[
{"label":"Draft","highlight":["draft"],"caption":"Someone writes a proposal: the problem, the design, alternatives considered and compatibility impact."},
{"label":"Review","highlight":["review"],"caption":"Maintainers and the community discuss it in public. Most proposals change substantially here."},
{"label":"Implement","highlight":["impl"],"caption":"Reference SDKs and servers implement it, which surfaces problems no review catches."},
{"label":"Accept","highlight":["accept"],"caption":"Maintainers accept the proposal into the next version."},
{"label":"Release","highlight":["release"],"caption":"It ships in a dated specification version with a changelog entry."},
{"label":"Deprecate","highlight":["deprecate"],"caption":"Features it replaces are marked deprecated, given a migration window, and later removed, as HTTP+SSE was in MCP 2026-07-28 (verified Nov 2026)."}]}
```

## In practice
Before betting a product on a protocol:
1. **Read the governance page**: who maintains it, and how decisions are made.
2. **Read the changelog**: how often it breaks compatibility, and how deprecations are announced.
3. **Count independent implementations**: hosts, servers and SDKs from different organizations.
4. **Watch the proposals**: open SEPs show what is coming.
5. **Participate** if it matters to you: file issues, comment on proposals, join working groups.

## Numbers to know
> [!number]
> Facts with dates: MCP open-sourced November 2024; A2A announced April 2025; Agent Skills introduced October 2025; A2A 1.0.0 March 2026; MCP 2026-07-28 with a formal feature lifecycle (verified Nov 2026 where marked). Rule of thumb: re-check governance and status every quarter for any protocol your product depends on.

## Pitfalls and anti-patterns
> [!pitfall] Treating “open” as “neutral”
> An open-source specification controlled by one company can still change direction overnight. Look at who decides, not just who can read.

- **Ignoring deprecation notices.** They are your migration deadline.
- **Assuming foundation membership is permanent stability.** Foundations host projects; maintainers still drive them.
- **Not tracking proposals.** The next breaking change is usually visible months ahead.

## Talk like an expert
The vocabulary: **steward**, **foundation**, **maintainers**, **working group**, **SEP**, **feature lifecycle**, **deprecation window**, **reference implementation**. Experts ask “who can change this, and how?” before adopting a protocol. The live debate is whether moving protocols to foundations speeds adoption by reassuring competitors, or slows evolution by adding process.

> [!hottake] Governance, not technical design, decides which agent protocols win.
> **The counterargument:** protocols spread when they solve problems developers have today with good SDKs; neutral governance helps adoption by large companies, but a well-governed protocol that is hard to use still loses.

## Check yourself
```quiz
protocol-governance
```

## Go deeper
- The governance and contributing documents in the `modelcontextprotocol/modelcontextprotocol` and `a2aproject/A2A` repositories.
- The Linux Foundation’s project pages for agent protocols (verify current names).

## Related
- [Why protocols](#why-protocols)
- [MCP spec history](#mcp-spec-history)
- [Agent2Agent (A2A)](#a2a)
- [The rest of the alphabet soup](#protocol-soup)
- [Watchlist](#watchlist)
