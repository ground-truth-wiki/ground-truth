---
id: coding-agent-security
book: 11
order: "11.8.2"
title: Securing coding agents
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [coding-agents, agent-security, prompt-injection, workspace-trust, supply-chain]
visuals: []
prerequisites: [sandboxes, prompt-injection]
---
> [!tldr]
> A coding agent reads untrusted text all day, from issues and pull requests to dependencies and web pages, and acts with your files and credentials, so one injected instruction can become code execution. The repository itself is attack surface: instruction files, MCP configs, hooks, skills and settings are code or policy the harness may load. Remember two rules: the agent must not be able to edit its own configuration, and a cloned repository is untrusted until you decide otherwise.

## Key ideas

- **Repository configuration is code.** Claude Code documents what a repository can run before you trust its folder: in a `claude -p` or SDK run, which never shows the trust dialog, hooks from the project's settings run and servers in `.mcp.json` connect without asking, so for a repository you did not write the docs suggest `--setting-sources user`, `--bare` or `--settings '{"disableAllHooks": true}'` ([Claude Code: Configure permissions](https://code.claude.com/docs/en/permissions)).
- **Injected agents rewrite their own settings.** In Cursor before 1.3.9, creating a new dotfile needed no approval, so an indirect prompt injection could create `.cursor/mcp.json` and get remote code execution ([CVE-2025-54135](https://cveawg.mitre.org/api/cve/CVE-2025-54135)); in GitHub Copilot, injected instructions made the agent write `"chat.tools.autoApprove": true` into `.vscode/settings.json` and then run commands without confirmation, fixed in August 2025 as [CVE-2025-53773](https://cveawg.mitre.org/api/cve/CVE-2025-53773) ([Embrace The Red write-up](https://embracethered.com/blog/posts/2025/github-copilot-remote-code-execution-via-prompt-injection)). The fix is protected paths: Claude Code's sandbox denies writes to its settings, `.mcp.json`, shell startup files and git hooks because a command that could edit them "could grant itself permissions, or add a hook or MCP server that Claude Code runs outside the sandbox" ([Claude Code: Sandboxing](https://code.claude.com/docs/en/sandboxing)).
- **Approval must follow the content, not the name.** Cursor up to 1.2.4 let an attacker with write access to a shared repository silently swap an already-approved MCP server definition for a malicious command, with no new prompt ([CVE-2025-54136](https://cveawg.mitre.org/api/cve/CVE-2025-54136)); Codex closes this gap for hooks by recording trust against each hook's hash and skipping any new or changed hook until you trust it again ([Codex: Hooks](https://learn.chatgpt.com/docs/hooks)).
- **Workspace trust gates what a folder may run.** As of November 2026, VS Code's Restricted Mode blocks tasks, debugging, some workspace settings and extensions that have not opted in, and disables agents in that workspace ([VS Code: Workspace Trust](https://code.visualstudio.com/docs/editing/workspaces/workspace-trust)); Codex can start read-only until you trust a folder, and an `untrusted` entry disables project-local configuration ([Codex: Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)); Claude Code applies a project's allow rules and extra directories only after you accept its trust dialog ([Claude Code: Configure permissions](https://code.claude.com/docs/en/permissions)).
- **Credentials and egress are what an attacker wants.** By default Claude Code's sandbox lets commands read most of the machine, credential files such as `~/.ssh` and `~/.aws/credentials` included, unless you deny them, and allowing broad domains such as `github.com` can open exfiltration paths, which is why its docs insist that filesystem and network isolation are needed together ([Claude Code: Sandboxing](https://code.claude.com/docs/en/sandboxing)). The agent's own tokens sit inside the boundary too: Copilot's cloud agent sets `GITHUB_COPILOT_API_TOKEN` and `GITHUB_COPILOT_GIT_TOKEN` in the sandbox where its hook scripts run ([GitHub Copilot: Hooks reference](https://docs.github.com/en/copilot/reference/hooks-reference)).
- **CI adds triggers and identities.** In CI ([Cloud agents, CI and review bots](#cloud-and-ci-coding-agents) covers the setup), `claude-code-action` checks on issue and pull request events that the triggering user has write access and rejects bot actors unless allowlisted, on public repositories GitHub withholds secrets from fork pull requests, workload identity federation replaces long-lived keys with the workflow's OIDC token, and a custom GitHub App with only Contents, Issues and Pull requests permissions gives least privilege where the official app asks for more ([Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)). Bypass modes belong only in isolation: Claude Code says to use `bypassPermissions` only in containers or VMs where it cannot cause damage ([Claude Code: Configure permissions](https://code.claude.com/docs/en/permissions)).

## Planned visuals

- `diagram`: the coding-agent attack surface as a data-flow diagram with trust boundaries: untrusted inputs (issues, pull requests, dependencies, web pages, repository configuration) flowing into the agent, and the privileged sinks it can reach (the shell, its own configuration files, credentials and the network).
- `stepper`: a configuration self-modification attack replayed frame by frame (injected text in a README, the agent creates an MCP config, the harness starts the server, code runs), then replayed with protected paths and workspace trust switched on.
- `tree`: a checklist per surface (laptop, CI, cloud agent), each branch listing the controls to set and the chapter that explains them.

## Talk like an expert

Experts talk about **untrusted input**, **repository-borne configuration**, **configuration self-modification**, **protected paths**, **rug pulls**, **workspace trust**, **egress** and **least privilege**. They assume the model will be injected sooner or later and ask what it can reach then: which files, which tokens, which hosts and which of its own settings.

## Go deeper

- [Configure the sandboxed Bash tool](https://code.claude.com/docs/en/sandboxing), Claude Code documentation, especially its security limitations.
- [Configure permissions](https://code.claude.com/docs/en/permissions), Claude Code documentation, the sections on workspace trust.
- [Workspace Trust](https://code.visualstudio.com/docs/editing/workspaces/workspace-trust), VS Code documentation.
- [CVE-2025-54135](https://cveawg.mitre.org/api/cve/CVE-2025-54135), the CVE record for prompt injection through Cursor's MCP files.

## Related

- [Sandboxes and execution environments](#sandboxes)
- [Secure agent design](#secure-agent-design)
- [Prompt injection](#prompt-injection)
- [MCP security](#mcp-security)
- [Supply chain and model security](#supply-chain-security)
- [Permissions, approvals and hooks in coding harnesses](#harness-permissions-hooks)
- [Field note: Prompt injections that bypassed tool confirmation in VS Code agent mode](#github-vscode-prompt-injection-safeguards)
