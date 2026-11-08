---
id: harness-permissions-hooks
book: 11
order: "11.2.1"
title: Permissions, approvals and hooks in coding harnesses
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [permissions, approvals, hooks, coding-harnesses, managed-settings]
visuals: []
prerequisites: [harness-anatomy]
---
> [!tldr]
> A coding harness controls its agent in layers: instructions shape what the agent tries, permission rules and approvals decide when it must stop and ask, hooks run your own code at fixed lifecycle events, and the sandbox limits what is technically possible. Instructions are requests to the model; the other three are enforced outside it, with very different strength. Remember that in Claude Code a deny rule blocks in every mode and whatever a hook returns, and that most hooks let the action through when they crash or time out.

## Key ideas

- **Sandbox and approvals are two separate axes.** Codex sets what the agent can technically do with a sandbox mode (`read-only`, `workspace-write` or `danger-full-access`) and when it must stop and ask with an approval policy (`on-request`, `never` or `granular`); as of November 2026 Codex recommends the `Auto` preset of `workspace-write` plus `on-request` for version-controlled folders and `read-only` for other folders, and `--yolo` removes both sandbox and approvals ([Codex: Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)). Claude Code draws the same line: its permission rules "are enforced by Claude Code, not by the model", while instructions in `CLAUDE.md` only shape what the agent tries ([Claude Code: Configure permissions](https://code.claude.com/docs/en/permissions)).
- **Permission modes set the default stance.** As of November 2026 Claude Code has six modes, `default` (labeled Manual), `acceptEdits`, `plan`, `auto`, `dontAsk` and `bypassPermissions`, and `claude -p` runs start in Manual mode, where any call that needs approval is denied unless a rule, hook or callback approves it ([Claude Code: Permission modes](https://code.claude.com/docs/en/permission-modes)); setting `permissions.disableBypassPermissionsMode` to `"disable"` locks out the last one, and in managed settings no other level can override it ([Claude Code: Configure permissions](https://code.claude.com/docs/en/permissions)). Gemini CLI, which Google replaced with Antigravity CLI for unpaid-tier and Google One users on June 18, 2026, offers `default`, `auto_edit` and `plan` in settings and `yolo` only as a command-line flag, which `security.disableYoloMode` turns off ([Gemini CLI configuration reference](https://geminicli.com/docs/reference/configuration/)).
- **Rules are checked deny first, per subcommand.** Claude Code evaluates deny, then ask, then allow, and the first match wins whatever its specificity; it splits compound commands on `&&`, `||`, `;`, `|`, `|&`, `&` and newlines, applies deny and ask rules inside subshells and command substitutions, checks redirect and `tee` targets against file rules and working directories, and runs a fixed set of read-only commands such as `ls`, `cat` and `grep` without a prompt ([Claude Code: Configure permissions](https://code.claude.com/docs/en/permissions)). Deny rules block in every mode, `bypassPermissions` included, and writes to protected paths such as `.git`, `.claude`, `.mcp.json` and shell startup files are prompted in `default` and `acceptEdits`, sent to the classifier in `auto`, denied in `dontAsk` and allowed in `bypassPermissions` ([Claude Code: Permission modes](https://code.claude.com/docs/en/permission-modes)).
- **Automated reviewers cut prompts, not risk.** Claude Code's auto mode sends actions to a classifier that sees user messages, tool calls and `CLAUDE.md` but not tool results, falls back to prompting after 3 blocks in a row or 20 in total, and by its own documentation "does not guarantee safety" ([Claude Code: Permission modes](https://code.claude.com/docs/en/permission-modes)). Codex's `auto_review` only reviews actions that already need approval, denies critical-risk actions, fails closed when the review itself breaks, and adds model calls to your usage ([Codex: Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)).
- **Hooks run your code at lifecycle events.** As of November 2026 Claude Code lists 33 hook events and five handler types (a shell command, an HTTP endpoint, an MCP tool, a prompt to a model and an experimental agent), Codex lists 14 events and runs command and MCP tool handlers, and GitHub Copilot's cloud agent loads only the repository's `.github/hooks/*.json` and treats "ask" as deny because no user is there to answer ([Claude Code: Hooks reference](https://code.claude.com/docs/en/hooks), [Codex: Hooks](https://learn.chatgpt.com/docs/hooks), [GitHub Copilot: Hooks reference](https://docs.github.com/en/copilot/reference/hooks-reference)). A Claude Code hook gets the event as JSON on standard input and answers with an exit code (2 blocks) or JSON that can allow, deny or ask, defer the call (in `-p` runs only), replace the tool's input, add context for the model, or block a stop so the agent keeps working ([Claude Code: Hooks reference](https://code.claude.com/docs/en/hooks)).
- **Hooks are guardrails, not a boundary.** Most hooks fail open: on most events Claude Code carries out the action when a hook fails or times out unless a command or HTTP hook sets `onFailure: "block"`, Cursor does the same unless it sets `failClosed: true`, Copilot treats timeouts as fail-open for every event, and the Codex docs say to "treat tool hooks as a useful guardrail, not a complete enforcement boundary" ([Claude Code: Hooks reference](https://code.claude.com/docs/en/hooks), [Cursor: Hooks](https://cursor.com/docs/agent/hooks), [GitHub Copilot: Hooks reference](https://docs.github.com/en/copilot/reference/hooks-reference), [Codex: Hooks](https://learn.chatgpt.com/docs/hooks)). Trust is layered too: in Claude Code deny and ask rules apply whatever a hook returns, managed settings override user and project settings, and a repository's allow rules apply only after you accept its workspace trust dialog ([Claude Code: Configure permissions](https://code.claude.com/docs/en/permissions)), while Codex records trust against each hook's hash and skips a changed hook until it is approved again ([Codex: Hooks](https://learn.chatgpt.com/docs/hooks)).

## Planned visuals

- `diagram`: the four layers of control around one tool call (instructions, permission rules and approvals, hooks, sandbox), each labeled with what it can enforce and who enforces it: the model, the harness, your code or the operating system.
- `stepper`: one compound shell command with a redirect, checked frame by frame: split into subcommands, deny then ask then allow, the redirect target checked against file rules, the PreToolUse hook, then the sandbox, with each caption naming the layer that decided.
- `matrix`: hook systems compared and dated as of November 2026: events, handler types, decision format, behavior on failure and trust model in Claude Code, Codex, Gemini CLI, Cursor and GitHub Copilot.

## Talk like an expert

Experts talk about **permission modes**, **approval policies**, **deny-first precedence**, **PreToolUse** and **Stop** hooks, **fail-open** versus **fail-closed**, **managed settings** and **workspace trust**. They frame it as "the prompt asks, the rules decide, the sandbox guarantees", and they pick defaults per context: prompts on a laptop, narrow allow rules for headless CI, and bypass modes only inside a disposable container.

## Go deeper

- [Configure permissions](https://code.claude.com/docs/en/permissions), Claude Code documentation.
- [Hooks reference](https://code.claude.com/docs/en/hooks), Claude Code documentation.
- [Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security), Codex documentation.
- [GitHub Copilot hooks reference](https://docs.github.com/en/copilot/reference/hooks-reference), GitHub documentation.

## Related

- [Anatomy of an agent harness](#harness-anatomy)
- [Case study: Claude Code](#claude-code)
- [OS-level sandboxing for agents](#os-level-sandboxing)
- [Securing coding agents](#coding-agent-security)
- [Human in the loop](#human-in-the-loop)
- [Instruction files: AGENTS.md, CLAUDE.md and rules](#agent-instruction-files)
