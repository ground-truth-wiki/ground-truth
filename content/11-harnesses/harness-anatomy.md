---
id: harness-anatomy
book: 11
order: "11.2"
title: Anatomy of an agent harness
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [harness, architecture, compaction, hooks]
visuals:
  - harness-layers:diagram
  - harness-turn:stepper
  - harness-min-max:compare
---
> [!tldr]
> An agent harness is everything between the model and the world: system prompt, tools, loop controller, context manager, memory files, permissions and sandbox, subagents, hooks, interface and telemetry. Each part answers one question about how the agent behaves, and you can read any product as a set of choices about them.

## Why it matters
Two products built on the same model can feel completely different, and the difference is the harness. When you evaluate a coding agent, design your own, or debug one that misbehaves, this anatomy tells you where to look: a wrong edit is a tool problem, a forgotten instruction is a context problem, a deleted file is a permissions problem.

## Intuition
If the model is an engine, the harness is the rest of the car: steering (the loop), dashboard (interface), brakes (permissions), mirrors (telemetry), fuel management (context) and the glovebox of manuals (memory files and skills). A great engine in a car with no brakes is not a product.

```viz
{"id":"harness-layers","component":"diagram","title":"Eleven parts wrap the model, and each one answers a different question about behavior","caption":"Read from the bottom up: the model, what it is told, what it can do, what it remembers, how the loop runs, what protects the world, and how people see it. Click a layer to open the chapter that covers it.","alt":"Layered diagram of an agent harness from the model at the bottom through system prompt, tools, memory files, context manager, loop controller, subagents, permissions and sandbox, hooks, telemetry and interface.","data":"illustrative","try":"Click “Permissions and sandbox” and find which defaults your favorite coding agent uses.","w":560,"layer_h":40,"layers":[
{"id":"ui","label":"Interface","sub":"CLI, IDE, web, headless","role":"human","link":"#agent-ux"},
{"id":"tel","label":"Telemetry","sub":"traces, metrics, costs","role":"data","link":"#observability-tracing"},
{"id":"hooks","label":"Hooks and events","sub":"run code before and after actions","link":"#claude-code"},
{"id":"perm","label":"Permissions and sandbox","sub":"what it may touch","link":"#sandboxes"},
{"id":"sub","label":"Subagents","sub":"isolated contexts for side work","role":"agent","link":"#multi-agent"},
{"id":"loop","label":"Loop controller","sub":"budgets, stop rules, retries","role":"agent","link":"#agent-loop"},
{"id":"ctx","label":"Context manager","sub":"compaction, result clearing","role":"context","link":"#context-engineering"},
{"id":"mem","label":"Memory files and skills","sub":"CLAUDE.md, AGENTS.md, SKILL.md","role":"data","link":"#skills-plugins"},
{"id":"tools","label":"Tool set","sub":"built-in tools and MCP servers","role":"tool","link":"#agent-tools"},
{"id":"sys","label":"System prompt","sub":"role, rules, style","role":"context","link":"#prompting-fundamentals"},
{"id":"model","label":"Model","sub":"chosen per task","role":"model","link":"#choosing-a-model"}]}
```

## How it works
**System prompt.** Sets role, goals, rules and style. In coding agents it also teaches tool etiquette: read before editing, run tests, keep changes small.

**Tool set.** Built-in tools (read, edit, search, shell, web fetch) plus external ones through [MCP](#mcp-primitives). Tool design is the agent-computer interface; see [tool design](#agent-tools).

**Memory files and skills.** Plain files the harness loads into context: project instructions such as `CLAUDE.md` or `AGENTS.md`, and [Agent Skills](#skills-plugins), folders whose `SKILL.md` is loaded only when relevant (progressive disclosure).

**Context manager.** Decides what stays in the window: compaction near the limit, clearing old tool results, deferring rarely used tool definitions. See [context engineering](#context-engineering).

**Loop controller.** Runs the [agent loop](#agent-loop), enforces step and cost budgets, retries transient errors and decides when to stop.

**Subagents.** Spawns helpers with fresh contexts for search, review or parallel work, and takes back summaries. See [multi-agent systems](#multi-agent).

**Permissions and sandbox.** Decides which actions need approval, which are allowed, and where code runs. Permission modes range from asking for everything to allowing everything inside a sandbox. See [sandboxes](#sandboxes).

**Hooks and events.** User-defined code that runs at lifecycle points, such as before a tool call (to block or rewrite it) or after an edit (to run a formatter). Hooks turn policy into code instead of prompt text.

**Interface.** Terminal, IDE panel, web app or headless API. The same harness often ships several.

**Telemetry.** Traces of every model and tool call, token counts and costs, exported to your observability stack. See [observability](#observability-tracing).

Follow one tool call through the parts:

```viz
{"id":"harness-turn","component":"stepper","title":"A single tool call passes through six harness parts before the model sees its result","caption":"Each step lights the part that acts. Notice how much happens between the model asking and the tool running: that is where safety and quality are enforced.","alt":"Stepper following one tool call through context assembly, the model, hooks, permission checks, a sandbox, result trimming, telemetry and the loop decision.","data":"illustrative","diagram":{"w":600,"h":232,"nodes":[
{"id":"input","label":"User message","role":"human","x":0,"y":0,"w":130,"h":50},{"id":"assemble","label":"Assemble context","role":"context","x":155,"y":0,"w":145,"h":50},{"id":"model","label":"Model","role":"model","x":325,"y":0,"w":120,"h":50},{"id":"req","label":"Tool request","role":"tool","x":470,"y":0,"w":130,"h":50},
{"id":"pre","label":"Pre-tool hook","x":470,"y":91,"w":130,"h":50},{"id":"perm","label":"Permission check","x":305,"y":91,"w":140,"h":50},{"id":"box","label":"Sandboxed run","x":155,"y":91,"w":125,"h":50},{"id":"post","label":"Post-tool hook","x":0,"y":91,"w":130,"h":50},
{"id":"trim","label":"Trim and append","role":"context","x":0,"y":182,"w":145,"h":50},{"id":"span","label":"Trace span","role":"data","x":170,"y":182,"w":130,"h":50},{"id":"loop","label":"Continue or stop","role":"agent","x":325,"y":182,"w":150,"h":50}],
"edges":[{"from":"input","to":"assemble"},{"from":"assemble","to":"model"},{"from":"model","to":"req"},{"from":"req","to":"pre"},{"from":"pre","to":"perm"},{"from":"perm","to":"box"},{"from":"box","to":"post"},{"from":"post","to":"trim"},{"from":"trim","to":"span"},{"from":"span","to":"loop"}]},
"frames":[
{"label":"Message","highlight":["input"],"caption":"The user asks the agent to rename a function across the project."},
{"label":"Assemble","highlight":["assemble"],"caption":"The context manager builds the request: system prompt, memory files, available tools and the history, compacted if needed."},
{"label":"Model","highlight":["model"],"caption":"The model decides to search for every use of the function first."},
{"label":"Request","highlight":["req"],"caption":"It emits a tool request: a shell command running a code search."},
{"label":"Pre-tool hook","highlight":["pre"],"caption":"A user-defined hook inspects the command. It could block it, rewrite it or log it; here it allows it."},
{"label":"Permission","highlight":["perm"],"caption":"The permission layer checks the mode and rules. Read-only commands are pre-approved; a command that deletes files would pause for the user."},
{"label":"Sandbox","highlight":["box"],"caption":"The command runs inside a sandbox that limits the filesystem paths and network hosts it can reach."},
{"label":"Post-tool hook","highlight":["post"],"caption":"A post-tool hook runs, for example a formatter after edits or a logger after commands."},
{"label":"Trim","highlight":["trim"],"caption":"The result, 800 matching lines, is truncated to the first 100 with a note saying so, then appended to the history."},
{"label":"Trace","highlight":["span"],"caption":"Telemetry records the span: command, duration, output size and tokens."},
{"label":"Loop","highlight":["loop"],"caption":"The loop controller checks budgets and calls the model again with the new result."}]}
```

## In practice
Design a harness by answering one question per part, in writing, before you build:

| Part | Question to answer |
|---|---|
| System prompt | What is the agent for, and what must it never do? |
| Tool set | Which actions, at what granularity, with what output limits? |
| Memory files and skills | What durable knowledge does it load, and when? |
| Context manager | What happens at 80% of the window? |
| Loop controller | What are the step, token, cost and time budgets? |
| Subagents | Which work is noisy enough to isolate? |
| Permissions and sandbox | What may it do without asking, and where does code run? |
| Hooks | Which policies must be enforced in code? |
| Interface | How does a user see progress, interrupt and undo? |
| Telemetry | What do you need to see when a run goes wrong? |

```viz
{"id":"harness-min-max","component":"compare","title":"A hundred-line harness and a full product harness make opposite bets on the same model","caption":"Hover the marks. Minimal harnesses bet that the model needs little help and are easy to study; maximal harnesses bet on structure, safety and speed for daily use.","alt":"Comparison of a minimal harness with one shell tool and a maximal harness with many tools, subagents, hooks and sandboxing.","data":"illustrative","mono":false,"a":{"title":"Minimal (for example mini-SWE-agent)","text":"One tool: a shell. One loop with a step limit. A linear message history with no compaction. Every action is a command whose output goes straight back. Small enough to read in one sitting, and used by researchers to compare models fairly.","mono":false},"b":{"title":"Maximal (for example Claude Code)","text":"Many tools: read, edit, search, shell, web fetch and MCP servers with tool search. Subagents and agent teams for parallel work. Hooks, skills, plugins and memory files. Permission modes, OS-level sandboxing, compaction, telemetry and several interfaces.","mono":false},"links":[{"a":"One tool: a shell.","b":"Many tools: read, edit, search, shell, web fetch and MCP servers with tool search.","note":"Specialized tools give the model safer, more efficient actions; one shell tool keeps the interface uniform."},{"a":"no compaction","b":"compaction","note":"Long sessions need context management; short benchmark tasks often do not."},{"a":"used by researchers to compare models fairly","b":"Permission modes, OS-level sandboxing","note":"Research harnesses optimize for comparability; products optimize for safety and daily use."}]}
```

## Numbers to know
> [!number]
> Rules of thumb. A minimal agent harness fits in about a hundred lines. Product harnesses carry system prompts and tool definitions that run to many thousands of tokens, which is why their prefixes must be cached. The same model can move by many points on an agentic benchmark when only the harness changes; always report both.

## Pitfalls and anti-patterns
> [!pitfall] Policy in the prompt instead of in code
> “Never delete files outside the project” in the system prompt is a request. A hook or sandbox that blocks it is a guarantee.

- **Too many tools by default.** Load narrowly and defer the rest.
- **No telemetry.** Without traces you will debug agents by guessing.
- **One permission mode for every context.** Interactive work, background jobs and CI need different defaults.
- **Ignoring the interface.** Users who cannot see or interrupt the agent stop trusting it.

## Talk like an expert
The vocabulary: **scaffold** (an older word for harness), **agent-computer interface**, **progressive disclosure**, **permission mode**, **hooks**, **headless mode**, **subagents** and **agent teams**. Experts say “model plus harness” in one breath, and compare harnesses by ablation: change one part, rerun the eval. The live debate is minimal versus maximal: as models improve, does structure still pay, or does it just get in the way?

> [!hottake] The harness is now a bigger differentiator than the model.
> **The counterargument:** harness ideas spread within weeks, since they are visible to users and easy to copy, while capability gaps between models persist for months. The durable advantage is still the model, plus evals that show which harness choices matter.

## Check yourself
```quiz
harness-anatomy
```

## Go deeper
- Yang et al., “SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering” (2024).
- The mini-SWE-agent repository from the SWE-agent team, a deliberately minimal harness.
- Anthropic’s Claude Code documentation at docs.claude.com, for hooks, subagents, skills and permission modes.

## Related
- [What “harness” means](#what-is-a-harness)
- [Case study: Claude Code](#claude-code)
- [Harness engineering](#harness-engineering)
- [Sandboxes and execution environments](#sandboxes)
- [Build your own harness](#build-your-own-harness)
- [Context engineering](#context-engineering)
