---
id: github-vscode-prompt-injection-safeguards
book: 22
order: "22.6"
title: Prompt injections that bypassed tool confirmation in VS Code agent mode
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [prompt-injection, coding-agents, agent-security, tool-permissions, public-record]
visuals: []
type: field-note
account: public-record
industry: "Software and developer tools"
use_case: "Agent mode in the Copilot Chat extension for VS Code, with built-in tools and MCP servers"
outcome: "Proof-of-concept injections in GitHub issues sent a local GitHub token to an outside server and launched an app without user confirmation; addressed together with the VS Code team"
measured_how: "Proof-of-concept exploits from a security assessment, each shown with screenshots; no rates, attempt counts or affected users reported (GitHub blog, August 2025, updated July 2026)"
prerequisites: [prompt-injection, coding-agents]
replications: []
---
> [!tldr]
> A security assessment published by GitHub showed how instructions placed in a GitHub issue could make agent mode in the Copilot Chat extension for VS Code send a local GitHub token to an outside server, or launch a program, with no user confirmation. The fixes added confirmations for new URLs and stopped edits outside the workspace. Its lesson: "pay close attention to subtle implementation details".

> [!note] From the public record
> Built from GitHub's own published account, "Safeguarding VS Code against prompt injections" (August 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

Agent mode "lets you use multiple large language models (LLMs), built-in tools, and MCP servers". VS Code adds project files and tool definitions to the prompt, runs the tool calls the model returns, and feeds the output back (see [The agent loop](#agent-loop)). The risk is external data: a user might ask about a GitHub issue "that contains malicious instructions".

By design, sensitive tools such as installExtension always require user confirmation, and VS Code always asks before running tools from MCP servers. Some standard tools, such as reading files, run automatically. The fetch_webpage tool asked only for sites outside a list of trusted origins, which included `*.github.com` by default.

The post was published on 25 August 2025 and updated on 6 July 2026, without saying what changed.

## What happened

Each test put instructions in a GitHub issue, then asked Copilot about it.

1. **fetch_webpage.** The trust check "was only using a regular expression comparison instead of properly parsing the URL", so `http://example.com/.github.com/xyz` counted as trusted. The issue told the agent to read the GitHub token from a local file and send it in a fetched URL. The post says "the Chat GPT-4o model incorrectly followed the instructions from the issue rather than summarizing its content as asked". "All of this happened without any confirmation being requested."
2. **Simple Browser.** The tool is meant for local websites but "supports loading external websites as well". With a similar issue, "Copilot leaked the token to an external website rather than simply displaying the issue content to the user."
3. **editFile.** The user is asked to click keep or undo for each change, but "the files have already been edited on disk, so the “keep” option does nothing." Because MCP servers can be started from shell commands, an issue told the agent to change the settings.json of VS Code Insiders so that the GitHub MCP server would launch the Calculator app. The configuration reloaded, and "the calculator opened automatically before I had a chance to respond or review the changes".

The post says a number of external bug reports "highlighted the same underlying problem with immediate file changes", including reports from EmbraceTheRed and Persistent Security.

## Impact, and how it was measured

In the post's words, the vulnerabilities could have let attackers "leak local GitHub tokens, access sensitive files, or even execute arbitrary code without any user confirmation".

The evidence is proof-of-concept exploits shown with screenshots, not measured rates. On models:

- "even state-of-the-art models like GPT-4.1, Gemini 2.5 Pro, and Claude Sonnet 4 can be misled by tool outputs"
- "often models do not follow malicious instructions right away"; attackers need techniques "similar to the ones used in model jailbreaking".
- Claude Sonnet 4 "seems to be the model most thoroughly trained to resist these types of attacks, but even it can be reliably tricked."

**Not measured:** the post gives no success rates per model or technique, no number of attempts, no fix dates or versions, and no count of affected users. It does not say whether any of these issues were exploited outside the research.

## Why it happened

- **Data and instructions mix.** VS Code separates tool output, user prompts and system messages in JSON, but "on the backend side, all these messages are blended into a single text prompt for inference." Prompts can carry untrusted data, "a major reason why prompt injections happen". See [Prompt injection](#prompt-injection).
- **Gaps in the confirmation gate.** The assessment looked for tools that could act without confirmation. On editing: "This core issue here is the auto-saving behavior of the editFile tool." The post explains the design: "the agent is designed to make incremental changes to multiple files step by step."
- **Temperature 0.** VS Code sets the temperature to 0, so "prompt injection exploits become more reliable to reproduce."

## What changed afterwards

The post reports these fixes, made together with the VS Code team:

- URLs in the fetch tool were decoupled from the trusted domains feature, and "the fetch tool now requires user confirmation to fetch URLs never seen before".
- "the Simple Browser tool now requires user confirmation before proceeding to open any new URL".
- "These days, VS Code no longer allows the agent to edit files outside of the workspace." Protections that "force user confirmation whenever sensitive files are edited, such as configuration files" were described as coming soon and "already available in Insiders". The post does not say whether or when they reached the stable release.

It also lists new features, such as choosing which tools the model can use. It does not report re-running the exploits against the fixes.

## Lessons

The source's own lessons:

- It is essential to "pay close attention to subtle implementation details" so that protections against prompt injection are not bypassed.
- Confirmations may become fewer as models improve, "but for now, we need to carefully monitor the actions performed by the model".
- Open untrusted repositories in Workspace Trust's restricted mode, and isolate the agent with Developer Containers or GitHub Codespaces. A "proper sandboxing environment" provides "a strong layer of defense against prompt injection attacks".

The wiki's reading:

- **A confirmation gate is only as strong as the check behind it.** Parse URLs, and treat any tool that reaches the network as a way out for data. See [Permissions, approvals and hooks in coding harnesses](#harness-permissions-hooks).
- **Review has to come before the side effect.** A prompt after the write protects nothing if another process reloads the file. See [Securing coding agents](#coding-agent-security).
- **Do not rely on the model to refuse.** Every model the post names could be misled; isolation limits the damage. See [Sandboxes and execution environments](#sandboxes).

## Disclosure

None.

## Sources

- Michael Stepankin (@artsploit), GitHub, [“Safeguarding VS Code against prompt injections”](https://github.blog/security/vulnerability-research/safeguarding-vs-code-against-prompt-injections/), The GitHub Blog (Vulnerability research), 25 August 2025, updated 6 July 2026.

## Related

- [About field notes](#about-field-notes)
- [Prompt injection attacks and defenses in depth](#prompt-injection-techniques)
- [MCP security](#mcp-security)
- [Secure agent design](#secure-agent-design)
- [Threat modeling LLM apps and agents](#threat-modeling)
