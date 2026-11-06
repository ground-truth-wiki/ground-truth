---
id: skills-plugins
book: 11
order: "11.5"
title: Skills, plugins and extension ecosystems
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [skills, plugins, marketplaces]
visuals:
  - progressive-disclosure:stepper
  - skill-folder:tree
  - skill-or-tool:wizard
---
> [!tldr]
> Agent Skills package know-how as folders with a SKILL.md file that agents load only when a task needs them. Plugins bundle skills with commands, hooks and MCP servers for distribution through marketplaces. Both are cheap ways to teach agents your team’s procedures, and both are new supply chains to secure.

## Why it matters
Most of what makes an engineer effective on a team is procedural: how releases are cut, how migrations are written, which checks run before a deploy. Long system prompts are a poor home for that knowledge, because everything in them is paid for on every request. Skills load it just in time, which lets agents carry dozens of procedures at almost no cost, and plugins let teams share them.

## Intuition
A skill is a recipe card in a kitchen drawer. The chef sees the labels on every card; they pull out the full card only when cooking that dish, and fetch the supplier’s spec sheet only if the card says to. Nobody reads every card before every meal.

```viz
{"id":"progressive-disclosure","component":"stepper","title":"Progressive disclosure loads names first, a body when relevant, files on demand, and only the output of scripts","caption":"Illustrative token counts for 25 installed skills against a 12,000-token budget for skills. The last frame shows what loading every skill in full would cost.","alt":"Stepper showing context used by skills: metadata for 25 skills, then one skill body, a referenced file and script output, compared with loading all skills in full.","data":"illustrative","try":"Compare frame 4 with frame 5: same capability, about sixteen times the context.","frames":[
{"label":"Installed","caption":"25 skills are installed. Only each skill’s name and one-line description sit in context: about 70 tokens each.","stack":{"cap":12000,"label":"Context spent on skills","items":[{"label":"25 names and descriptions","tokens":1750,"role":"context","short":"Metadata"}]}},
{"label":"Match","caption":"The user asks for release notes. The release-notes skill’s description matches, so its SKILL.md body loads.","stack":{"cap":12000,"label":"Context spent on skills","items":[{"label":"25 names and descriptions","tokens":1750,"role":"context","short":"Metadata"},{"label":"release-notes body","tokens":2400,"role":"data","short":"Body"}]}},
{"label":"Reference","caption":"The body says to follow STYLE.md for tone. The agent reads that file only now.","stack":{"cap":12000,"label":"Context spent on skills","items":[{"label":"25 names and descriptions","tokens":1750,"role":"context","short":"Metadata"},{"label":"release-notes body","tokens":2400,"role":"data","short":"Body"},{"label":"STYLE.md","tokens":1800,"role":"data","short":"File"}]}},
{"label":"Script","caption":"The skill’s script collects merged pull requests. The script’s code never enters the context; only its 600-token output does.","stack":{"cap":12000,"label":"Context spent on skills","items":[{"label":"25 names and descriptions","tokens":1750,"role":"context","short":"Metadata"},{"label":"release-notes body","tokens":2400,"role":"data","short":"Body"},{"label":"STYLE.md","tokens":1800,"role":"data","short":"File"},{"label":"Script output","tokens":600,"role":"tool","short":"Output"}]}},
{"label":"Without it","caption":"Loading all 25 skills in full, with their files, would take about 105,000 tokens: far past the budget, on every request.","stack":{"cap":12000,"label":"Context spent on skills","items":[{"label":"All 25 skills in full","tokens":105000,"role":"untrusted","short":"Everything"}]}}]}
```

## How it works
**The format.** A skill is a folder containing a `SKILL.md` file with YAML front matter (at least a name and a description) followed by instructions, plus optional scripts, templates and reference files. The format is open and maintained in the `agentskills/agentskills` repository (verified Nov 2026).

```markdown
---
name: release-notes
description: Write release notes from merged pull requests in this repository's house style. Use when asked for release notes or a changelog entry.
---
# Release notes
1. Run scripts/collect_prs.sh to list pull requests merged since the last tag.
2. Group them as Features, Fixes and Internal. Skip dependency bumps.
3. Follow STYLE.md for tone. One line per change, present tense.
4. End with upgrade notes if any change is breaking.
```

**Progressive disclosure.** The description is always visible to the agent; it decides whether the skill applies, so write it like a tool description: what it does and when to use it. The body loads when relevant. Files load when the body points to them. Scripts run in the agent’s environment, and only their output enters the context.

```viz
{"id":"skill-folder","component":"tree","title":"A skill is just a folder: one required file and whatever the procedure needs","caption":"Expand the folder. Only SKILL.md is required; everything else loads when the instructions call for it.","alt":"Tree of a skill folder with SKILL.md, scripts, templates and reference files.","data":"illustrative","open":2,"root":{"label":"release-notes/","children":[{"label":"SKILL.md","note":"required: front matter plus instructions"},{"label":"STYLE.md","note":"reference file, loaded on demand"},{"label":"scripts/","children":[{"label":"collect_prs.sh","note":"runs; only its output enters context"}]},{"label":"templates/","children":[{"label":"release.md","note":"output skeleton"}]}]}}
```

**Cross-agent tooling.** Skills started in Claude and are now read by many agents. A skills command-line tool from Vercel Labs installs skills into more than 75 agents (verified Nov 2026), and directories list community skills.

**Plugins and marketplaces.** A plugin bundles skills with slash commands, subagents, hooks and MCP servers under one manifest, installed from a marketplace that can be public or private to a company. Harnesses ship their own plugin formats; Cursor publishes one in the `cursor/plugins` repository (verified Nov 2026).

**Supply-chain security.** A skill is instructions an agent will follow plus scripts it may run. A malicious skill can exfiltrate data or weaken safety checks. Review skills like code, pin versions, prefer internal marketplaces for sensitive work, and use scanners; NVIDIA’s SkillSpector is one dedicated skill security scanner (verified Nov 2026). See [supply chain security](#supply-chain-security).

## In practice
Skill, tool or MCP server? Answer two questions:

```viz
{"id":"skill-or-tool","component":"wizard","wizard":"mcp-vs-function-vs-skill","title":"Procedures become skills, shared capabilities become MCP servers, and private functions stay tools","caption":"A two-question guide. Many teams ship all three: a server for access, a skill for how to use it well.","alt":"Decision wizard choosing between a skill, an MCP server and a plain tool.","data":"illustrative"}
```

Writing good skills:
- **Description first.** Say what it does and when to use it, with the words users actually say.
- **One procedure per skill.** Split big ones; small skills match more precisely.
- **Short bodies, linked details.** Keep the body to a few thousand tokens; put reference material in files.
- **Scripts for deterministic steps.** Let code do what code does well, and keep its output small.
- **Test with real prompts.** Check that the skill triggers when it should, and does not when it should not.
- **Version and review** skills in a repository like any other code.

## Numbers to know
> [!number]
> Rules of thumb. A skill’s name and description cost tens of tokens. Keep the body under a few thousand tokens. Twenty-five skills with progressive disclosure cost less context than one long system prompt section.

## Pitfalls and anti-patterns
> [!pitfall] Installing skills you have not read
> A skill can tell the agent to do anything and ship a script to do it. Treat unknown skills like unknown packages.

- **Vague descriptions.** “Helpful utilities” never triggers correctly.
- **Skills that duplicate tools.** If it is a capability, build a tool or server; skills are for procedures.
- **Giant bodies.** They defeat the point of progressive disclosure.

## Talk like an expert
The vocabulary: **Agent Skills**, **SKILL.md**, **front matter**, **progressive disclosure**, **plugin manifest**, **marketplace**, **skill scanner**. Experts distinguish “capability” (a tool) from “know-how” (a skill) and ship both. The live debate is standardization: whether one skill and plugin format will work across all agents, or each harness will keep its own.

> [!hottake] Skills will replace most of what teams currently put in system prompts.
> **The counterargument:** some instructions, such as safety rules, tone and project basics, must apply on every request, and those belong in always-loaded context, not behind a trigger the model may miss.

## Check yourself
```quiz
skills-plugins
```

## Go deeper
- The `agentskills/agentskills` repository for the open format (verified Nov 2026).
- The `vercel-labs/skills` and `cursor/plugins` repositories, and NVIDIA’s `SkillSpector` (verified Nov 2026).
- The Claude Code documentation on skills and plugins.

## Related
- [Case study: Claude Code](#claude-code)
- [Anatomy of an agent harness](#harness-anatomy)
- [Supply chain and model security](#supply-chain-security)
- [The rest of the alphabet soup](#protocol-soup)
- [Context engineering](#context-engineering)
