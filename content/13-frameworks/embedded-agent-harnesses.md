---
id: embedded-agent-harnesses
book: 13
order: "13.2.2"
title: Embedding agent harnesses in your application
level: practitioner
stability: volatile
reviewed: "2026-11"
status: seed
tags: [agent-harness, agent-sdks, claude-agent-sdk, coding-agents, embedding]
visuals: []
prerequisites: [provider-agent-sdks, harness-anatomy]
---
> [!tldr]
> As of November 2026, the harnesses behind coding agents also ship as libraries: the Claude Agent SDK, the Codex SDK and the GitHub Copilot SDK let your application start an agent that already has file, shell and edit tools, permissions and resumable sessions, instead of you writing a loop over a provider SDK. Under the hood each one drives a local agent runtime, by default in a separate process, so embedding one means operating that process: its sandbox, its credentials, the configuration files it reads and its version. Remember that you inherit the harness's defaults, so isolate and pin it like any other dependency that can run shell commands.

## Key ideas

- **Three harnesses, one shape.** The Claude Agent SDK is “a library that runs the Claude Code binary” from Python or TypeScript, with built-in tools, permissions, sessions you can resume or fork, hooks, subagents, MCP, skills and plugins; the Codex SDK (TypeScript and Python) starts, continues and resumes local Codex threads, forks them in Python, and sets read-only, workspace-write or full-access sandbox presets for a thread or a later turn; the GitHub Copilot SDK, generally available with official SDKs for TypeScript, Python, Go, .NET, Java and Rust, embeds the agent runtime behind Copilot CLI (all as of November 2026) ([Anthropic, “Agent SDK overview”](https://code.claude.com/docs/en/agent-sdk/overview); [OpenAI, “Codex SDK”](https://learn.chatgpt.com/docs/codex-sdk); [GitHub, “github/copilot-sdk”](https://github.com/github/copilot-sdk)).
- **Under the hood: a child process and a stream of events.** When your code calls `query()`, the Claude Agent SDK spawns a `claude` CLI process and talks to it over stdio, and that process owns the shell, the working directory and the session transcripts on local disk, one subprocess per session. The Codex TypeScript SDK spawns the `codex` CLI and exchanges JSONL events over stdin and stdout, while the Python SDK controls the local Codex app-server over JSON-RPC, the same app-server OpenAI points to for custom clients that handle authentication, history, approvals and streamed events; the Copilot SDK drives its runtime over JSON-RPC too, by default as a Copilot CLI child process in server mode (as of November 2026) ([Anthropic, “Hosting the Agent SDK”](https://code.claude.com/docs/en/agent-sdk/hosting); [OpenAI, “openai/codex” TypeScript SDK README](https://github.com/openai/codex/blob/main/sdk/typescript/README.md); [OpenAI, “Codex SDK”](https://learn.chatgpt.com/docs/codex-sdk); [GitHub, “github/copilot-sdk”](https://github.com/github/copilot-sdk)).
- **The harness reads your files unless you tell it not to.** With `settingSources` omitted, the Claude Agent SDK loads the same user, project and local settings as the CLI, including `CLAUDE.md` files, hooks and the skills, agents and commands under `.claude/`. Passing `settingSources: []` limits the agent to what you configure in code, but managed policy settings, the global `~/.claude.json` and auto memory are still read, so Anthropic warns against relying on defaults for multi-tenant isolation (as of November 2026) ([Anthropic, “Use Claude Code features in the SDK”](https://code.claude.com/docs/en/agent-sdk/claude-code-features)).
- **Wrappers and pickers sit on top.** AI SDK 7 (June 2026) runs harnesses such as Claude Code, Codex, Deep Agents, OpenCode and Pi through `HarnessAgent` with the AI SDK's standard `generate` and `stream` results, and Microsoft Agent Framework 1.0 (April 2026) lists GitHub Copilot SDK and Claude Code SDK integrations, which run either one as an agent harness inside Agent Framework orchestration, among its preview features. In low-code, Copilot Studio asks builders to pick a GitHub Copilot, Customer Conversation or standard harness, a choice that sets how an agent reasons, what it can do and how it is billed (as of November 2026) ([Vercel, “AI SDK 7 is now available”](https://vercel.com/changelog/ai-sdk-7); [Microsoft, “Microsoft Agent Framework Version 1.0”](https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-version-1-0/); [Microsoft Learn, “Copilot Studio overview”](https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio)).
- **Embed, write your own loop, or let someone host it.** Anthropic draws the line by who runs the loop: the Agent SDK embeds Claude Code's agent in a process you operate, the client SDK leaves the tool loop to you, and Managed Agents hosts it. Its hosting guide shows the price of embedding: every running agent is a long-lived process tied to local state, about 1 GiB of RAM, 5 GiB of disk and 1 CPU per agent is the suggested starting point, and token cost typically dominates container cost by an order of magnitude or more, so a thin loop of your own (see [Build your own harness](#build-your-own-harness)) stays attractive when you need full control of every prompt or cannot afford a process per session ([Anthropic, “Agent SDK overview”](https://code.claude.com/docs/en/agent-sdk/overview); [Anthropic, “Hosting the Agent SDK”](https://code.claude.com/docs/en/agent-sdk/hosting)).
- **Run it like untrusted code next to your credentials.** Anthropic's guide says to run the SDK in a sandboxed container, keep tool credentials out of the agent's environment behind a proxy that injects them, give each tenant its own working and config directory, bound runs with `maxTurns` because sessions have no timeout of their own, and update deliberately, since the bundled CLI is pinned to the SDK package version. Terms and billing follow the harness: unless previously approved, Anthropic does not allow third-party products built on the Agent SDK to offer claude.ai login or rate limits, and the Copilot SDK needs a Copilot subscription, with each prompt counted toward its usage allowance, unless you bring your own provider key (as of November 2026) ([Anthropic, “Hosting the Agent SDK”](https://code.claude.com/docs/en/agent-sdk/hosting); [Anthropic, “Agent SDK overview”](https://code.claude.com/docs/en/agent-sdk/overview); [GitHub, “github/copilot-sdk”](https://github.com/github/copilot-sdk)).

## Planned visuals

- **`diagram`:** the parts of an embedded harness: your application, the SDK library, the harness process (CLI or app-server) with its shell, working directory and transcripts, the model API, and the configuration files it reads (`CLAUDE.md`, settings, skills), each linked to its chapter.
- **`sequence`:** one `query()` call stepped through: the app spawns the subprocess, the prompt goes in over stdio, the harness asks a permission callback before a shell command, a hook denies a destructive one, events stream back, and the app stores the session id to resume later.
- **`tree`:** a decision between embedding a harness, writing your own loop over a provider SDK and using a [managed platform](#managed-agent-platforms), by task type, who must run the loop, tenancy and data-handling needs.

## Talk like an expert

Practitioners say they **embed a harness** rather than build an agent, and talk about the **subprocess model**, **setting sources**, **permission callbacks**, **session resume and fork** and **pinning the harness version**. The first question they ask is who owns the loop, and the second is what the harness can touch: its filesystem, its network and the keys in its environment.

## Go deeper

- [Anthropic, “Agent SDK overview”](https://code.claude.com/docs/en/agent-sdk/overview): capabilities, the comparison with the client SDK and Managed Agents, and the login and branding rules.
- [Anthropic, “Hosting the Agent SDK”](https://code.claude.com/docs/en/agent-sdk/hosting): the subprocess model, session patterns, multi-tenant isolation, credentials and cost.
- [OpenAI, “Codex SDK”](https://learn.chatgpt.com/docs/codex-sdk): threads, runs, resume and fork, sandbox modes and the app-server.
- [GitHub, “github/copilot-sdk”](https://github.com/github/copilot-sdk): the JSON-RPC architecture, languages, authentication and permission handlers.

## Related

- [Provider and agent SDKs](#provider-agent-sdks)
- [Case study: Claude Code](#claude-code)
- [Build your own harness](#build-your-own-harness)
- [Managed agent platforms and hosted harnesses](#managed-agent-platforms)
- [Permissions, approvals and hooks in coding harnesses](#harness-permissions-hooks)
- [Sandboxes and execution environments](#sandboxes)
