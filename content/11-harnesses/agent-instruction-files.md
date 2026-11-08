---
id: agent-instruction-files
book: 11
order: "11.4.1"
title: "Instruction files: AGENTS.md, CLAUDE.md and rules"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [instruction-files, agents-md, claude-md, context-engineering, coding-harnesses]
visuals:
  - agent-instruction-files-context-vs-enforcement:diagram
  - agent-instruction-files-load-order:stepper
  - agent-instruction-files-placement:tree
prerequisites: [coding-harness-landscape, context-engineering]
---
> [!tldr]
> Instruction files are Markdown files that a coding agent loads into its context: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, Cursor rules and Copilot instructions. They shape what the agent proposes but enforce nothing; permission rules, hooks and the sandbox do that. Keep them short, keep one source of truth, and review them like code.

## Why it matters
Every session starts with a fresh context window, so an instruction file is how you hand the agent project knowledge before it starts searching ([Claude Code memory docs](https://code.claude.com/docs/en/memory)). A good file stops repeated mistakes; one in a cloned repository is a stranger’s prompt running with your permissions. The payoff is not automatic: in one study, context files did not generally improve task success and raised inference cost by more than 20% on average ([Gloaguen et al., “Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?” (2026)](https://arxiv.org/abs/2602.11988)).

## Intuition
An instruction file is the note you leave a house-sitter: where the fuse box is, which tap drips. It makes a good stay likely but locks no doors. For what must never happen you lock the door, and in a harness the locks are permission rules, hooks and the sandbox.

```viz
{"id":"agent-instruction-files-context-vs-enforcement","component":"diagram","title":"Instruction files shape what the agent proposes; permission rules, hooks and the sandbox decide what runs","caption":"Illustrative concept diagram. Everything in the top row reaches the model as text it may or may not follow. Everything in the dashed box on the right is enforced by the harness whatever the model decides. Claude Code’s documentation draws this line explicitly (as of November 2026). Click a box for its chapter.","alt":"Diagram: five instruction sources (managed policy file, user file, project files, path-scoped rules, auto memory) feed the context window, which shapes the model. The model’s tool calls then pass permission rules and hooks, and run inside the sandbox.","data":"illustrative","depicts":"Claude Code memory and managed-settings documentation, as of November 2026","try":"Follow a tool call from the model to the tools: which boxes on its path can actually stop it?","w":600,"h":370,"groups":[{"label":"Instruction files: loaded as text","x":0,"y":0,"w":600,"h":82},{"label":"Enforced by the harness","x":410,"y":200,"w":190,"h":166}],"nodes":[
{"id":"managed","label":"Managed","sub":"org policy","role":"external","glyph":false,"x":6,"y":26,"w":110,"h":48},
{"id":"user","label":"User","sub":"personal","role":"human","glyph":false,"x":124,"y":26,"w":110,"h":48},
{"id":"project","label":"Project","sub":"AGENTS.md","role":"context","glyph":false,"x":242,"y":26,"w":110,"h":48,"link":"#coding-harness-landscape"},
{"id":"rules","label":"Path rules","sub":"file-scoped","role":"context","glyph":false,"x":360,"y":26,"w":110,"h":48},
{"id":"memory","label":"Auto memory","sub":"agent notes","role":"data","glyph":false,"x":478,"y":26,"w":110,"h":48,"link":"#agent-memory"},
{"id":"ctx","label":"Context window","role":"context","x":220,"y":130,"w":160,"h":50,"link":"#context-engineering"},
{"id":"model","label":"Model","role":"model","x":225,"y":222,"w":150,"h":50},
{"id":"perm","label":"Permission rules","sub":"allow, ask, deny","role":"tool","glyph":false,"x":418,"y":228,"w":174,"h":38,"link":"#harness-permissions-hooks"},
{"id":"hooks","label":"Hooks","sub":"scripts at events","role":"tool","glyph":false,"x":418,"y":274,"w":174,"h":38,"link":"#claude-code"},
{"id":"sandbox","label":"Sandbox","sub":"OS-level limits","role":"tool","glyph":false,"x":418,"y":320,"w":174,"h":38,"link":"#sandboxes"},
{"id":"tools","label":"Tools run","sub":"files, shell, web","role":"tool","x":188,"y":316,"w":180,"h":46}],
"edges":[{"from":"managed","to":"ctx"},{"from":"user","to":"ctx"},{"from":"project","to":"ctx"},{"from":"rules","to":"ctx"},{"from":"memory","to":"ctx"},{"from":"ctx","to":"model","label":"shapes"},{"from":"model","to":"perm","label":"call"},{"from":"sandbox","to":"tools","label":"allowed"}]}
```

## How it works
Product behavior in this section is as of November 2026.

**The common core.** Every format is Markdown pasted into the context, and Claude Code’s docs state there is “no guarantee of strict compliance” ([Claude Code memory docs](https://code.claude.com/docs/en/memory)). The [AGENTS.md](https://agents.md/) convention says the nearest file wins and the user’s prompt overrides everything. Codex and Claude Code handle it by ordering, not dropping: Codex joins one file per directory from the project root down to the working directory, so closer files come later and override earlier ones ([Codex docs](https://learn.chatgpt.com/docs/agent-configuration/agents-md)), and Claude Code concatenates root to leaf too. When two files disagree, the model settles it, not a parser.

**AGENTS.md.** Plain Markdown with no required fields, released by OpenAI in August 2025 and stewarded since December 2025 by the Agentic AI Foundation under the Linux Foundation ([Linux Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)). As of November 2026 [its site](https://agents.md/) lists Codex, Jules, Cursor, Gemini CLI, Devin, Junie, Aider, goose and GitHub Copilot’s coding agent, among others.

**CLAUDE.md.** Four scopes, broadest first: a managed policy file, `~/.claude/CLAUDE.md`, the project file and a personal `CLAUDE.local.md` that you add to `.gitignore` ([Claude Code memory docs](https://code.claude.com/docs/en/memory)). Files at and above the launch directory load at startup, subdirectory files on demand. `@path` imports nest up to four hops. Imports in a project file that reach outside the working directory need a one-time approval, because other people commit to shared repositories. Since v2.1.277, Claude Code reads `AGENTS.md` when no `CLAUDE.md` or `CLAUDE.local.md` exists in the working directory or above.

**Cursor rules.** `.mdc` files in `.cursor/rules` whose `description`, `globs` and `alwaysApply` fields set one of four types: always on, file-scoped, agent-requested or manual ([Cursor docs](https://cursor.com/docs/context/rules)). Team rules beat project rules, which beat user rules.

**GitHub Copilot.** `.github/copilot-instructions.md` applies to every request in the repository. Files named `*.instructions.md` in `.github/instructions/` pick files with `applyTo` and can skip one agent with `excludeAgent` (`"code-review"` or `"cloud-agent"`) ([GitHub docs](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions)). Copilot also reads `AGENTS.md`, or a root `CLAUDE.md` or `GEMINI.md`, but surfaces differ: as of November 2026 the cloud agent and the CLI read all three, while Chat in VS Code reads only `AGENTS.md` ([support table](https://docs.github.com/en/copilot/reference/custom-instructions-support)).

**GEMINI.md.** Gemini CLI loads a global file, workspace files and files found just in time, and `context.fileName` can point it at `AGENTS.md` ([Gemini CLI docs](https://geminicli.com/docs/cli/gemini-md/)). The same docs say Antigravity CLI replaced Gemini CLI for unpaid-tier and Google One users in June 2026. Antigravity CLI reads both `GEMINI.md` and `AGENTS.md` ([migration guide](https://antigravity.google/docs/cli/gcli-migration)).

**Always-on versus path-scoped.** Root files load every session; path-scoped rules load only when the agent works with matching files:

```viz
{"id":"agent-instruction-files-load-order","component":"stepper","title":"Claude Code loads always-on files at startup, and nested files and path rules only when Claude touches a matching file","caption":"Illustrative monorepo and token counts. Behavior follows the Claude Code memory documentation as of November 2026. Bright boxes are in context; dim ones cost nothing yet.","alt":"Stepper through four moments of a Claude Code session in a monorepo: files loaded at launch, a nested file and a path-scoped rule loaded on demand, a conflict between two files, and a second nested file loaded on demand.","data":"illustrative","depicts":"Claude Code memory documentation, as of November 2026","try":"Step to frame 2 and check which files are still dim, and why.","diagram":{"w":600,"h":228,"groups":[{"label":"Outside the repo","x":0,"y":0,"w":186,"h":228},{"label":"acme/ (launch here)","x":196,"y":0,"w":208,"h":228},{"label":"acme/packages/","x":414,"y":0,"w":186,"h":228}],"nodes":[
{"id":"managed","label":"Managed CLAUDE.md","sub":"IT-deployed","role":"external","glyph":false,"x":8,"y":28,"w":170,"h":42},
{"id":"user","label":"User CLAUDE.md","sub":"~/.claude/","role":"human","glyph":false,"x":8,"y":78,"w":170,"h":42},
{"id":"proj","label":"CLAUDE.md","sub":"team file, in git","role":"context","glyph":false,"x":204,"y":28,"w":192,"h":42},
{"id":"local","label":"CLAUDE.local.md","sub":"personal, gitignored","role":"human","glyph":false,"x":204,"y":78,"w":192,"h":42},
{"id":"rtest","label":"rules/testing.md","sub":"no paths: at launch","role":"context","glyph":false,"x":204,"y":128,"w":192,"h":42},
{"id":"rapi","label":"rules/api.md","sub":"paths: packages/api/**","role":"context","glyph":false,"x":204,"y":178,"w":192,"h":42},
{"id":"api","label":"api/CLAUDE.md","sub":"nested file","role":"context","glyph":false,"x":422,"y":28,"w":170,"h":42},
{"id":"handler","label":"api/src/handler.ts","sub":"file Claude reads","glyph":false,"x":422,"y":78,"w":170,"h":42,"at":1},
{"id":"web","label":"web/CLAUDE.md","sub":"nested file","role":"context","glyph":false,"x":422,"y":128,"w":170,"h":42},
{"id":"app","label":"web/app.tsx","sub":"file Claude edits","glyph":false,"x":422,"y":178,"w":170,"h":42,"at":3}],"edges":[]},
"frames":[
{"label":"Launch","highlight":["managed","user","proj","local","rtest"],"caption":"Claude Code starts in `acme/` and loads the files there and above, broadest first: the managed file, your user file, the project `CLAUDE.md` with `CLAUDE.local.md` appended after it, and the rule without `paths`. The two nested files and `rules/api.md` wait.","stack":{"cap":6000,"label":"Instruction tokens in context","items":[{"label":"Managed","tokens":300,"role":"external"},{"label":"User","tokens":400,"role":"human"},{"label":"Project CLAUDE.md","tokens":1500,"role":"context","short":"Project"},{"label":"Local","tokens":200,"role":"human"},{"label":"testing rule","tokens":500,"role":"context","short":"Rule"}]}},
{"label":"Read","highlight":["managed","user","proj","local","rtest","api","rapi","handler"],"caption":"Claude reads `packages/api/src/handler.ts`. Two files load on demand: `api/CLAUDE.md`, because Claude touched a file under its directory, and `rules/api.md`, because its pattern matches. `web/CLAUDE.md` stays out: nothing there has been touched.","stack":{"cap":6000,"label":"Instruction tokens in context","items":[{"label":"Managed","tokens":300,"role":"external"},{"label":"User","tokens":400,"role":"human"},{"label":"Project CLAUDE.md","tokens":1500,"role":"context","short":"Project"},{"label":"Local","tokens":200,"role":"human"},{"label":"testing rule","tokens":500,"role":"context","short":"Rule"},{"label":"api/CLAUDE.md","tokens":900,"role":"context","short":"api"},{"label":"api rule","tokens":400,"role":"context","short":"Rule"}]}},
{"label":"Conflict","highlight":["proj","api"],"caption":"The two files disagree about the test command. Both are in context; nothing merges them. The nested file was read later, but the docs warn that with contradictory instructions Claude may pick one arbitrarily. Fix the files, not the prompt.","code":"acme/CLAUDE.md                - Run tests with `npm test`.\nacme/packages/api/CLAUDE.md   - Run tests with `pnpm test`.","stack":{"cap":6000,"label":"Instruction tokens in context","items":[{"label":"Managed","tokens":300,"role":"external"},{"label":"User","tokens":400,"role":"human"},{"label":"Project CLAUDE.md","tokens":1500,"role":"context","short":"Project"},{"label":"Local","tokens":200,"role":"human"},{"label":"testing rule","tokens":500,"role":"context","short":"Rule"},{"label":"api/CLAUDE.md","tokens":900,"role":"context","short":"api"},{"label":"api rule","tokens":400,"role":"context","short":"Rule"}]}},
{"label":"Edit","highlight":["managed","user","proj","local","rtest","api","rapi","web","app"],"caption":"Claude edits `packages/web/app.tsx`, so `web/CLAUDE.md` loads. On-demand files live in the message history: after compaction they are summarized away and reload only when a matching file is touched again, while the root file and unscoped rules are re-read from disk.","stack":{"cap":6000,"label":"Instruction tokens in context","items":[{"label":"Managed","tokens":300,"role":"external"},{"label":"User","tokens":400,"role":"human"},{"label":"Project CLAUDE.md","tokens":1500,"role":"context","short":"Project"},{"label":"Local","tokens":200,"role":"human"},{"label":"testing rule","tokens":500,"role":"context","short":"Rule"},{"label":"api/CLAUDE.md","tokens":900,"role":"context","short":"api"},{"label":"api rule","tokens":400,"role":"context","short":"Rule"},{"label":"web/CLAUDE.md","tokens":800,"role":"context","short":"web"}]}}]}
```

**Organization level.** Developers cannot exclude Claude Code’s managed `CLAUDE.md` with `claudeMdExcludes` ([docs](https://code.claude.com/docs/en/memory)), Cursor admins can enforce team rules ([docs](https://cursor.com/docs/context/rules)), and Copilot ranks organization instructions below personal and repository ones ([docs](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions)). Enforcement still lives in settings, such as Claude Code’s managed `permissions.deny`.

**Auto memory.** Claude Code also writes notes for itself and loads the first 200 lines or 25 KB of their index each session ([docs](https://code.claude.com/docs/en/memory)). They stay on your machine, unreviewed unless you open them with `/memory`. See [agent memory](#agent-memory).

The [landscape](#coding-harness-landscape) as of November 2026:

| Harness | Project file | Personal or org | Scoped by | Reads `AGENTS.md` |
|---|---|---|---|---|
| Claude Code | `CLAUDE.md` | `~/.claude/`, managed file | Directory, `paths` | Without `CLAUDE.md` |
| Codex | `AGENTS.md` | `~/.codex/` | Directory | Native |
| Cursor | `.cursor/rules/*.mdc` | User, team rules | `globs` | Yes, nested too |
| GitHub Copilot | `copilot-instructions.md` | Personal, organization | `applyTo` | By surface |
| Gemini CLI | `GEMINI.md` | `~/.gemini/` | Directory | Via setting |

## In practice
**What belongs:** build, test and lint commands; conventions that differ from defaults; gotchas the code hides; review guidelines. **What does not:** directory tours (the study above found overviews did not help), rules a linter enforces, occasional procedures, which belong in [skills](#skills-plugins), secrets, and anything that must never happen.

```viz
{"id":"agent-instruction-files-placement","component":"tree","title":"Most instructions belong somewhere other than the root file","caption":"Expand the branch that matches your instruction. Only the second branch belongs in the always-on file. Mechanisms named as of November 2026.","alt":"Decision tree for where an instruction belongs: enforcement, the root instruction file, a nested file or path-scoped rule, a skill, a personal file, nowhere, or the harness's secret handling.","data":"illustrative","try":"Take the last instruction you added to your own file and find its branch.","open":1,"root":{"label":"What kind of instruction is it?","children":[
{"label":"It must hold even if the model disagrees","children":[{"label":"A permission rule, a hook or the sandbox; prose can explain it but not enforce it","link":"#harness-permissions-hooks"}]},
{"label":"It matters on most tasks in this repository","children":[{"label":"The root AGENTS.md or CLAUDE.md: commands, conventions, gotchas, review rules"}]},
{"label":"It matters only for part of the codebase","children":[{"label":"One package or directory","note":"a nested AGENTS.md or CLAUDE.md there"},{"label":"One kind of file across the repository","note":"a path-scoped rule: paths, globs or applyTo"}]},
{"label":"It is a multi-step procedure used now and then","children":[{"label":"A skill, loaded only when the task needs it","link":"#skills-plugins"}]},
{"label":"It is personal","children":[{"label":"Your user file, CLAUDE.local.md or Cursor user rules, never the shared file"}]},
{"label":"The agent can find it in the code","children":[{"label":"Leave it out: layout and dependencies are one search away"}]},
{"label":"It is a secret","children":[{"label":"Never in an instruction file; keep it out of the agent’s reach","link":"#sandboxes"}]}]}}
```

A minimal cross-agent `AGENTS.md` (illustrative content):

```markdown
# AGENTS.md

## Commands
- Install: `pnpm install`. Test one package: `pnpm --filter <package> test`.
- Before every commit: `pnpm lint && pnpm typecheck`.

## Conventions
- Database access goes through `packages/db`; never import the driver directly.
- `src/generated/` comes from `pnpm codegen`. Never edit it by hand.

## Gotchas
- Integration tests need a local Postgres: `docker compose up db`.

## Reviews
- Flag any change to `migrations/` that is not backward compatible.
```

Claude Code reads it directly. For Claude-only notes, add a `CLAUDE.md` that starts with `@AGENTS.md`, which beats a sentence asking Claude to read the file. But a root `CLAUDE.md` stops Claude Code from reading `AGENTS.md` files on its own, nested ones included, unless **Project instructions** is set to `claude-md-and-agents-md`.

Then audit the files in CI:

```python
"""Audit agent instruction files for size, invisible characters and stale commands."""
import json
import pathlib
import re
import sys
import unicodedata

PATTERNS = [
    "**/AGENTS.md", "**/CLAUDE.md", "**/CLAUDE.local.md", "**/GEMINI.md",
    ".github/copilot-instructions.md", ".github/instructions/**/*.instructions.md",
    ".cursor/rules/**/*.mdc", ".claude/rules/**/*.md",
]
MAX_LINES = 200  # Claude Code's target per CLAUDE.md; Cursor suggests 500 per rule

root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".")
pkg = root / "package.json"
scripts = set(json.loads(pkg.read_text()).get("scripts", {})) if pkg.exists() else None

problems = []
files = {p for pat in PATTERNS for p in root.glob(pat) if "node_modules" not in p.parts}
for path in sorted(files):
    lines = path.read_text(encoding="utf-8").splitlines()
    if len(lines) > MAX_LINES:
        problems.append(f"{path}: {len(lines)} lines, target is under {MAX_LINES}")
    for n, line in enumerate(lines, 1):
        # Category Cf holds zero-width, bidirectional and other invisible format characters.
        hidden = sorted({f"U+{ord(c):04X}" for c in line if unicodedata.category(c) == "Cf"})
        if hidden:
            problems.append(f"{path}:{n}: invisible characters {hidden}")
        if scripts is not None:
            for name in re.findall(r"npm run ([\w:-]+)", line):
                if name not in scripts:
                    problems.append(f"{path}:{n}: `npm run {name}` is not a script in package.json")

for problem in problems:
    print(problem)
sys.exit(1 if problems else 0)  # a non-zero exit fails the CI job
```

> [!try]
> Delete every line in your root file that the agent could learn from a directory listing, then check that a fresh session still builds and tests.

## Numbers to know
> [!number]
> As of November 2026. Claude Code: under 200 lines per `CLAUDE.md` and imports up to four hops ([docs](https://code.claude.com/docs/en/memory)). Cursor: under 500 lines per rule ([docs](https://cursor.com/docs/context/rules)). Codex: 32 KiB of combined `AGENTS.md` by default ([docs](https://learn.chatgpt.com/docs/agent-configuration/agents-md)). `AGENTS.md`: more than 60,000 open-source projects, by its own count ([agents.md](https://agents.md/)). Rule of thumb: if a line changes nothing on most tasks, cut it.

## Pitfalls and anti-patterns
> [!pitfall] Writing policy as prose
> “Never push to main” in an instruction file is a request that will one day be ignored. Enforce it with a permission rule, a hook or the sandbox (see [permissions and hooks](#harness-permissions-hooks)).

- **Drifting copies.** Separate files for each agent soon disagree. Import one source; on Windows a committed symlink can check out as plain text ([Claude Code docs](https://code.claude.com/docs/en/memory)).
- **Contradictions.** Files are concatenated, not merged. As of November 2026, Claude Code’s `/doctor prompt-audit` looks for files that contradict each other ([docs](https://code.claude.com/docs/en/memory)).
- **A personal file that hides the team file.** In Claude Code, adding `CLAUDE.local.md` stops `AGENTS.md` from loading by default.
- **Trusting a cloned repository.** Pillar Security’s “Rules File Backdoor” research (2025) showed instructions hidden as invisible Unicode in Cursor and Copilot rules files ([Pillar Security](https://www.pillar.security/blog/new-vulnerability-in-github-copilot-and-cursor-how-hackers-can-weaponize-code-agents)). Check those files, for example with the audit script above, before running an agent in an unfamiliar repository. See [prompt injection](#prompt-injection) and [supply chain security](#supply-chain-security).

## Talk like an expert
The vocabulary: **instruction file**, **always-on** versus **path-scoped**, **nearest wins**, **managed policy**, **auto memory**. A useful frame: these files are a fixed cost in [context engineering](#context-engineering), paid in every session. The live debate is whether they help. Gloaguen et al. saw no general gain on issue-fixing benchmarks, which score task success rather than things like team conventions. The authors themselves conclude that context files are useful for “specifying non-standard coding practices”.

> [!hottake] The best instruction file is a list of the agent’s past mistakes.
> Add a line when the agent errs twice, as Claude Code’s docs suggest, and prune what it no longer needs. **The counterargument:** a reactive file teaches nothing on day one, and waiting for failures means paying for each one.

## Check yourself
```quiz
agent-instruction-files
```

## Go deeper
- [AGENTS.md](https://agents.md/): the format and its FAQ.
- [How Claude remembers your project](https://code.claude.com/docs/en/memory) (Claude Code).
- Cursor’s [Rules](https://cursor.com/docs/context/rules) and GitHub’s [support table](https://docs.github.com/en/copilot/reference/custom-instructions-support).
- Gloaguen et al., [“Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?”](https://arxiv.org/abs/2602.11988) (2026).

## Related
- [The coding-harness landscape](#coding-harness-landscape)
- [Case study: Claude Code](#claude-code)
- [Working effectively with coding agents](#working-with-coding-agents)
- [Skills, plugins and extension ecosystems](#skills-plugins)
- [Context engineering](#context-engineering)
- [Permissions, approvals and hooks in coding harnesses](#harness-permissions-hooks)
