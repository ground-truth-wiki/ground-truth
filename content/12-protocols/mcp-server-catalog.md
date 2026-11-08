---
id: mcp-server-catalog
book: 12
order: "12.10"
title: MCP server types and catalog
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [mcp, servers, catalog]
visuals:
  - server-taxonomy:tree
  - trust-tiers:diagram
---
> [!tldr]
> MCP servers sort three ways: by transport (local stdio or remote HTTP), by role (knowledge, actions, compute, browsers, memory and meta servers) and by trust (vendor-official, community or your own). The catalog grows weekly, so choose by role and trust, then check what is current.

## Why it matters
Thousands of MCP servers exist, ranging from official integrations maintained by large vendors to weekend projects with broad credentials. Knowing the categories helps you find the right server quickly; knowing the trust tiers keeps you from handing your mail, code or cloud account to an unknown package.

## Intuition
A server catalog is an app store without much curation. The useful habits are the same: know what kind of app you need, prefer the one made by the company that runs the service, read the permissions, and keep the number installed small.

```viz
{"id":"server-taxonomy","component":"tree","title":"Six roles cover almost every MCP server; the role tells you what can go wrong","caption":"Expand a role to see common categories and the main risk to check before installing. Named projects are examples as of November 2026, not endorsements; verify current status.","alt":"Tree of MCP server roles with categories, examples and risks.","data":"illustrative","depicts":"MCP server landscape as of November 2026","open":1,"root":{"label":"MCP servers by role","children":[
{"label":"Knowledge and data","children":[{"label":"Filesystems, databases, documentation, search and web fetch","note":"risk: oversharing; untrusted fetched content"},{"label":"Examples: reference filesystem and fetch servers; documentation servers such as Context7"}]},
{"label":"Actions and integrations","children":[{"label":"Version control, ticketing, chat and email, calendars, payments, design tools","note":"risk: side effects with your credentials"},{"label":"Examples: GitHub’s official server; remote servers from Linear, Atlassian, Asana, Stripe and Figma"}]},
{"label":"Compute and sandboxes","children":[{"label":"Code execution, notebooks, cloud sandboxes","note":"risk: code running where it can reach secrets","link":"#sandboxes"}]},
{"label":"Browsers","children":[{"label":"Browser automation and DevTools servers, such as Microsoft’s Playwright server and Chrome DevTools MCP","note":"risk: every page is untrusted input","link":"#computer-use-agents"}]},
{"label":"Memory","children":[{"label":"Knowledge-graph and vector memory servers","note":"risk: stale or private facts surfacing","link":"#agent-memory"}]},
{"label":"Meta servers","children":[{"label":"Gateways, aggregators and proxies that front other servers","note":"risk: a single point of compromise","link":"#mcp-at-scale"}]}]}}
```

## How it works
**By transport.** Local stdio servers run on your machine with your permissions and suit filesystems, local databases, Git and browsers. Remote HTTP servers are services reached over the network with OAuth and suit SaaS products. See [transports](#mcp-transports).

**By role.** Knowledge servers read; action servers change the world; compute servers run code; browser servers drive web pages; memory servers persist facts; meta servers sit in front of other servers. The role tells you the risk: action servers need approvals, browser servers need injection defenses, compute servers need sandboxes.

**By trust.** Three tiers:

```viz
{"id":"trust-tiers","component":"diagram","title":"Trust follows who maintains the server and who holds the credentials","caption":"Prefer servers from the vendor whose system they wrap; read the code of community servers before giving them credentials; your own servers are only as safe as your review.","alt":"Diagram of three trust tiers for MCP servers: vendor-official, community and your own, each with what to check.","data":"illustrative","w":600,"h":150,"nodes":[
{"id":"vendor","label":"Vendor-official","sub":"maintained by the system’s owner","role":"tool","x":0,"y":0,"w":185,"h":60},
{"id":"community","label":"Community","sub":"third-party maintainers","role":"untrusted","x":207,"y":0,"w":185,"h":60},
{"id":"own","label":"Your own","sub":"built in-house","role":"agent","x":414,"y":0,"w":186,"h":60},
{"id":"v2","label":"Check: scopes, version, changelog","align":"center","glyph":false,"x":0,"y":96,"w":185,"h":52},
{"id":"c2","label":"Check: code, publisher, pinning","align":"center","glyph":false,"x":207,"y":96,"w":185,"h":52},
{"id":"o2","label":"Check: review, tests, audit logs","align":"center","glyph":false,"x":414,"y":96,"w":186,"h":52}],
"edges":[{"from":"vendor","to":"v2","style":"dashed"},{"from":"community","to":"c2","style":"dashed"},{"from":"own","to":"o2","style":"dashed"}]}
```

**The categories.** Filesystems; version control; databases; web search and fetch; browser automation; documentation and knowledge bases; productivity and communication (mail, chat, calendars); project management; cloud and infrastructure; observability; payments and finance; design; data and analytics; memory; security; media.

**Reference servers.** The MCP project maintains a small set of reference servers on GitHub (filesystem, fetch, Git, memory and others) as examples of good practice. Several earlier reference servers were archived as vendors shipped official ones.

**Registries.** An official MCP registry and vendor marketplaces list servers with metadata for discovery. A listing is not an endorsement: check publisher and code yourself. See [MCP at scale](#mcp-at-scale).

## In practice
Before installing any server:
1. **Who maintains it?** Prefer the vendor of the wrapped system.
2. **What does it need?** List the credentials and scopes; reject “full access” when the tools are read-only.
3. **What does it say?** Read every tool description in full, looking for instructions about other tools or secrecy. See [MCP security](#mcp-security).
4. **How is it run?** Sandbox local servers; prefer remote servers with OAuth for SaaS.
5. **Is it pinned?** Fix the version and review changes before upgrading.
6. **Do you need it for this task?** Load servers per task, not all the time.

## Numbers to know
> [!number]
> Rules of thumb. Most agents need a handful of servers for a given task. Each loaded server adds its tool definitions to every model call and widens the attack surface. Fewer, better-maintained servers beat a long list.

## Pitfalls and anti-patterns
> [!pitfall] Installing from a directory listing
> Directories show names and stars, not provenance. A server with a familiar name may not be the official one.

- **Broad tokens for narrow tools.** A read-only search server should not hold write scopes.
- **Unpinned community servers.** An update can change behavior without review.
- **Everything loaded everywhere.** Every task inherits every server’s risk.

## Talk like an expert
The vocabulary: **vendor-official versus community**, **local versus remote**, **reference servers**, **registry**, **meta server**, **gateway**. Experts ask “who maintains this, and what does it hold?” before “what does it do?”. The live debate is curation: who should review and certify servers, and whether hosts should refuse uncertified ones by default.

> [!hottake] Most teams should run fewer than ten MCP servers, and most of them should be vendor-official.
> **The counterargument:** the long tail of niche community servers is where much of the value for specialized workflows lives, and with sandboxing and review it can be used safely.

## Check yourself
```quiz
mcp-server-catalog
```

## Go deeper
- The `modelcontextprotocol/servers` repository for reference servers.
- The official MCP registry and vendor documentation for current listings (check dates).

## Related
- [MCP security](#mcp-security)
- [MCP at scale](#mcp-at-scale)
- [Building MCP servers](#building-mcp-servers)
- [MCP architecture](#mcp-architecture)
- [Sandboxes and execution environments](#sandboxes)
- [Browser automation for agents: Playwright, CDP and agent libraries](#browser-automation-stack)
- [Publishing and discovering MCP servers: the registry, server.json and bundles](#mcp-registry-and-packaging)
