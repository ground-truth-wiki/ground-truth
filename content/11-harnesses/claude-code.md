---
id: claude-code
book: 11
order: "11.3"
title: "Case study: Claude Code"
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [claude-code, skills, hooks, subagents]
visuals:
  - hook-lifecycle:sequence
  - skills-ladder:chart
  - permission-ladder:diagram
---
> [!tldr]
> Claude Code is Anthropic’s agentic coding harness for the terminal, IDEs, desktop and web. Its design is a tour of modern harness ideas: memory files, slash commands, subagents and agent teams, hooks, skills, plugins and marketplaces, MCP with tool search, permission modes, OS-level sandboxing, headless use, scheduled tasks and an SDK. As of early November 2026 it is at version 2.1.317 (verified Nov 2026).

## Why it matters
Studying one mature harness in depth teaches you what every harness must decide. Claude Code is widely used, documented and extensible, so its mechanisms, such as `CLAUDE.md`, hooks and skills, have become reference points that other agents imitate or interoperate with. Knowing them makes you effective with it and literate about the rest of the [landscape](#coding-harness-landscape).

## Intuition
Think of Claude Code as a capable engineer who joins your team with a laptop. `CLAUDE.md` is the onboarding document. Slash commands are team rituals. Subagents are colleagues it can ask for help. Hooks are the CI checks that run whether anyone remembers or not. Skills are the team’s runbooks. Permission modes decide how much it may do without asking.

```viz
{"id":"hook-lifecycle","component":"sequence","title":"Hooks run your code at fixed points in every session, so policy does not depend on the model remembering it","caption":"Step through one session and tap each event. Hook event names follow the Claude Code documentation as of late 2026; check the docs for the current list and input format.","alt":"Sequence diagram of Claude Code hook events in one session: session start, prompt submission, before and after a tool call, and stop.","data":"illustrative","depicts":"Claude Code hooks, simplified","try":"Find the event where a hook can block a command before it runs.","actors":[{"id":"user","label":"User","role":"human"},{"id":"cc","label":"Claude Code","role":"agent"},{"id":"hook","label":"Your hook scripts","role":"tool"},{"id":"model","label":"Model","role":"model"}],
"messages":[
{"from":"cc","to":"hook","label":"SessionStart","note":"Load context at the start, such as the current branch and open issues."},
{"from":"user","to":"cc","label":"prompt","payload":"Fix the flaky date test and run the suite."},
{"from":"cc","to":"hook","label":"UserPromptSubmit","note":"Inspect or enrich the prompt before the model sees it; can block it."},
{"from":"cc","to":"model","label":"context + tools"},
{"from":"model","to":"cc","label":"tool: Bash","kind":"response","payload":{"tool":"Bash","command":"rm -rf node_modules && npm test"}},
{"from":"cc","to":"hook","label":"PreToolUse","payload":"stdin: {\"tool_name\": \"Bash\", \"tool_input\": {\"command\": \"rm -rf node_modules && npm test\"}, …}\nexit code 2 + message → blocked, message shown to the model","note":"The hook sees the exact command and can allow, block with a reason, or ask the user."},
{"from":"hook","to":"cc","label":"blocked: use npm ci","kind":"response","note":"The reason goes back to the model as feedback, so it can adapt."},
{"from":"cc","to":"hook","label":"PostToolUse","note":"After an edit or command succeeds: run a formatter, a linter or a logger."},
{"from":"cc","to":"hook","label":"Stop","note":"When the model wants to finish: a hook can require tests to pass first."}]}
```

## How it works
**Memory: `CLAUDE.md`.** Markdown files of instructions loaded into context: one in your user directory for personal preferences, one in the project root checked into the repository, and others in subdirectories for local rules. They can import other files. `/init` drafts one by exploring the codebase. Keep them short and specific: build commands, conventions, gotchas.

**Slash commands.** Built-in commands such as `/compact`, `/clear`, `/mcp`, `/agents`, `/hooks` and `/permissions` control the session; custom commands are Markdown prompts stored in `.claude/commands/` and shared with the team.

**Subagents and agent teams.** Subagents are defined in `.claude/agents/` with their own system prompt, tools and model, and run in a fresh context, returning a summary. Use them for searching, reviewing and other noisy side work. Agent teams, a research preview, let several Claude instances collaborate on one task (verified Nov 2026). See [multi-agent systems](#multi-agent).

**Hooks.** Shell commands configured in settings that run at lifecycle events, receive the event as JSON on standard input, and can block or modify actions. Hooks enforce policy deterministically. See [harness anatomy](#harness-anatomy).

**Skills, plugins and marketplaces.** Skills are folders with a `SKILL.md` file, loaded only when relevant. Plugins bundle commands, subagents, skills, hooks and MCP servers for distribution through marketplaces (verified Nov 2026). See [skills and plugins](#skills-plugins).

**MCP and tool search.** MCP servers add tools and resources. Once their definitions would exceed 10% of the context window, tool search defers them and loads matching definitions on demand (verified Nov 2026). See [MCP at scale](#mcp-at-scale).

**Permissions and sandboxing.** Rules in settings allow or deny specific tools and patterns, and permission modes set the default stance. An auto mode backed by a safety check reduces prompts for routine work (verified Nov 2026). OS-level sandboxing through Anthropic’s sandbox runtime limits filesystem and network access without a container (verified Nov 2026). See [sandboxes](#sandboxes).

```viz
{"id":"permission-ladder","component":"diagram","title":"Permission modes trade supervision for speed, and the least supervised belongs only in a sandbox","caption":"From most supervised at the top to least at the bottom. Mode names follow the documentation as of late 2026; check the docs for exact behavior. Click a mode for related chapters.","alt":"Layered diagram of Claude Code permission modes from plan mode through default, accept edits and auto, to bypassing permissions in a sandbox.","data":"illustrative","depicts":"Claude Code permission modes, simplified","w":560,"layer_h":48,"layers":[
{"id":"plan","label":"Plan mode","sub":"reads and proposes; changes nothing","role":"agent","link":"#planning-reasoning"},
{"id":"default","label":"Default","sub":"asks before edits and commands","role":"human","link":"#human-in-the-loop"},
{"id":"edits","label":"Accept edits","sub":"edits run; commands still ask","role":"tool"},
{"id":"auto","label":"Auto","sub":"a safety check reviews actions (verified Nov 2026)","role":"model","link":"#guardrails-control"},
{"id":"bypass","label":"Bypass permissions","sub":"everything runs: isolated sandboxes only","role":"untrusted","link":"#sandboxes"}]}
```

**Beyond the terminal.** Headless mode (`claude -p`) runs a task non-interactively with structured output for scripts and CI. Recurring and scheduled tasks (`/loop`, `/schedule`) run work on a timer (verified Nov 2026). OpenTelemetry metrics feed your observability stack. The Claude Agent SDK exposes the same harness for building your own agents in Python and TypeScript.

## In practice
A minimal, team-friendly setup:

```json
{
  "permissions": {
    "allow": ["Bash(npm run test:*)", "Bash(npm run lint)"],
    "deny": ["Read(./.env)", "Read(./secrets/**)"]
  },
  "hooks": {
    "PostToolUse": [
      { "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": ".claude/hooks/format.sh" }] }
    ]
  }
}
```

Illustrative settings: the hook script reads the event JSON from standard input and formats the edited file. Check the hooks documentation for the exact input fields.

Skills keep their cost near zero until used:

```viz
{"id":"skills-ladder","component":"chart","type":"bar","title":"A skill costs tens of tokens until it is needed, and only what the task uses after that","caption":"Illustrative token counts per skill at each level of progressive disclosure, on a log scale. Scripts run without their code entering the context; only their output does.","alt":"Bar chart of tokens per skill: about 70 for name and description, about 2,400 for the SKILL.md body, about 1,800 for a referenced file, about 600 for script output.","data":"illustrative","categories":["Name and description (always)","SKILL.md body (when relevant)","Referenced file (on demand)","Script output (when run)"],"y":{"label":"Tokens in context","log":true},"series":[{"name":"Tokens","points":[[0,70],[1,2400],[2,1800],[3,600]]}]}
```

Habits that pay off:
- Write `CLAUDE.md` first, and keep it under a few hundred lines; move procedures into skills.
- Start unfamiliar work in plan mode; review the plan, then switch modes.
- Use subagents for codebase search and review so the main context stays focused.
- Put non-negotiable rules in hooks and deny rules, not in prose.
- Run headless in CI for review and triage tasks, with a narrow allow list.

## Numbers to know
> [!number]
> Facts (verified Nov 2026): version 2.1.317 in early November 2026; MCP tool search defers definitions past 10% of the context window. Rules of thumb: a skill’s metadata costs tens of tokens; keep each `SKILL.md` body to a few thousand tokens and move detail into referenced files.

## Pitfalls and anti-patterns
> [!pitfall] A thousand-line CLAUDE.md
> Everything in it is loaded every session and dilutes the rest. Keep it to what matters on most tasks; put the rest in skills and referenced docs.

- **Bypass mode on your laptop.** Run it only in isolated, credential-free sandboxes.
- **Relying on instructions for safety.** Use deny rules, hooks and sandboxing.
- **Loading every MCP server.** Let tool search work, and keep server lists per project.
- **Never reading transcripts.** They show where your setup confuses the agent.

## Talk like an expert
The vocabulary: **`CLAUDE.md`**, **slash commands**, **subagents**, **agent teams**, **hooks** and **hook events**, **skills**, **plugins** and **marketplaces**, **permission modes**, **plan mode**, **headless mode**, **Agent SDK**. Power users treat their `.claude/` directory as code: reviewed, versioned and shared. The live debate is how much autonomy to grant by default, as auto modes and safety checks reduce the need for human approval.

> [!hottake] Your `.claude/` folder is now as important as your CI configuration.
> **The counterargument:** heavy customization can make agents behave differently for each developer and project, eroding the shared baseline that makes results comparable; a small, boring setup may serve teams better.

## Check yourself
```quiz
claude-code
```

## Go deeper
- The Claude Code documentation at docs.claude.com, for memory, hooks, subagents, skills, plugins, permissions and headless use.
- The `anthropics/claude-code` changelog on GitHub (verified Nov 2026).
- The `anthropics/sandbox-runtime` repository for OS-level sandboxing (verified Nov 2026).

## Related
- [Provider and agent SDKs](#provider-agent-sdks)
- [Anatomy of an agent harness](#harness-anatomy)
- [Skills, plugins and extension ecosystems](#skills-plugins)
- [The coding-harness landscape](#coding-harness-landscape)
- [Working effectively with coding agents](#working-with-coding-agents)
- [Sandboxes and execution environments](#sandboxes)
