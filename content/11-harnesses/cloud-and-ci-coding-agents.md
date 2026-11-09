---
id: cloud-and-ci-coding-agents
book: 11
order: "11.4.2"
title: Cloud agents, CI and review bots
level: practitioner
stability: volatile
reviewed: "2026-11"
status: seed
tags: [cloud-agents, ci-cd, code-review, headless-mode, coding-harnesses]
visuals: []
prerequisites: [coding-harness-landscape]
---
> [!tldr]
> Coding agents also run off your laptop in three ways: as hosted cloud agents that work in a remote VM and return a pull request, as steps inside your own CI, and as bots that review pull requests. Each needs what any CI job needs (a reproducible environment, scoped secrets, an egress policy and cost limits) plus a rule for who may trigger it. Remember that every agent run in CI costs twice, in runner minutes and in tokens.

## Key ideas

- **Three ways off the laptop.** As of November 2026, hosted cloud agents such as Cursor's Cloud Agents run in isolated VMs, work on a separate branch and hand back pull requests with screenshots, videos and logs ([Cursor: Cloud Agents](https://cursor.com/docs/cloud-agent)), while agents inside your own CI run as a workflow step such as `anthropics/claude-code-action`, which answers `@claude` mentions or runs a fixed `prompt` on any GitHub event, schedules included. Each such run consumes both GitHub Actions minutes and API tokens, so cap it with `--max-turns`, workflow timeouts and concurrency limits ([Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)).
- **Headless modes make agents scriptable.** `codex exec` runs without the interactive interface in a read-only sandbox by default, `--json` turns standard output into a JSON Lines event stream, `--output-schema` asks for a final answer that matches a JSON Schema, and the docs recommend the Codex GitHub Action over installing the CLI in a workflow yourself ([Codex: Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)). Claude Code's `claude -p` starts in Manual mode and denies any call that needs approval unless an allow rule, hook or callback approves it ([Claude Code: Permission modes](https://code.claude.com/docs/en/permission-modes)).
- **The environment is a setup workflow, a snapshot or an image.** GitHub Copilot's cloud agent prepares its environment from `.github/workflows/copilot-setup-steps.yml`, a single `copilot-setup-steps` job of which only some keys such as `steps`, `permissions`, `runs-on`, `services` and `timeout-minutes` are honored, and a failing step makes Copilot skip the rest and start work anyway ([GitHub: Configure the development environment for agents](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment)). Cursor builds environments by agent-led setup, a saved snapshot or a Dockerfile named in `.cursor/environment.json`, and injects secrets from its dashboard when an agent starts ([Cursor: Cloud Agents](https://cursor.com/docs/cloud-agent)).
- **Egress is off or allowlisted, except during setup.** Codex Cloud (Legacy) blocks internet access during the agent phase by default while setup scripts keep it; per environment you can allow a domain list (empty, a common-dependencies preset or all) and restrict requests to `GET`, `HEAD` and `OPTIONS` ([Codex Cloud (Legacy): internet access](https://learn.chatgpt.com/docs/cloud/internet-access)). As of November 2026, OpenAI documents the current Codex Cloud's network settings on a separate page. Copilot's agent firewall and its recommended allowlist cover processes the agent starts through its Bash tool but not setup steps or MCP server processes, and GitHub says it "should not be considered a comprehensive security solution" ([GitHub: Customizing or disabling the firewall for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-the-firewall)).
- **Decide who may trigger a run and which identity it gets.** on issue and pull request events `claude-code-action` requires the triggering user to have write access, and it rejects bot actors unless listed in `allowed_bots`, which stops bots triggering it in a loop; on public repositories GitHub withholds secrets from runs triggered by fork pull requests; and workload identity federation exchanges the workflow's GitHub OIDC token for API access, so no long-lived key is stored ([Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)). The threat model behind these rules is in [Securing coding agents](#coding-agent-security), and the Codex docs add one more: never set the API key as a job-level variable in a workflow that runs repository-controlled code ([Codex: Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)).
- **Review bots read the diff and your rules files.** As of November 2026, Copilot code review runs when requested or automatically, does not count toward required approvals by default, follows `.github/copilot-instructions.md`, path-specific `*.instructions.md` files and `AGENTS.md`, and GitHub estimates an average review at $0.25, $1.50 or $10 at the Lite, Balanced and Max effort levels ([GitHub: About Copilot code review](https://docs.github.com/en/copilot/concepts/agent-capabilities/agent-powered-workflows-and-operations/code-review)). Cursor's Bugbot reviews pull request updates guided by the `.cursor/BUGBOT.md` files on the path of each changed file and can hand bugs to a Cloud Agent to fix ([Cursor: Bugbot](https://cursor.com/docs/bugbot)), and Claude Code's cloud auto-fix watches a pull request and, when a check fails or a reviewer comments, pushes a fix if one is clear ([Claude Code in the cloud](https://code.claude.com/docs/en/claude-code-on-the-web)).

## Planned visuals

- `diagram`: the three ways off the laptop (a hosted cloud agent, an agent in your CI, a review bot), showing for each where the code runs, which credentials it holds and where the results land.
- `sequence`: an `@claude` comment on an issue, stepped through with payloads: actor checks, runner start, OIDC token exchange, agent edits, branch push, pull request, CI, and an auto-fix round on a failing check.
- `matrix`: a comparison of cloud agents and review bots dated as of November 2026: environment setup, default network policy, secrets, triggers, review guidance file and how results come back.

## Talk like an expert

Experts talk about **headless mode**, **setup steps**, **egress allowlists**, **workload identity** and **OIDC**, **trigger policy**, **bot loops** and **review noise**. They treat an agent job like any other untrusted CI job: a least-privilege token, no secrets on fork pull requests, a hard timeout, and output that lands as a pull request a human must approve.

## Go deeper

- [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions), Claude Code documentation.
- [Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode), Codex documentation.
- [Customizing or disabling the firewall for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-the-firewall), GitHub documentation.
- [Cloud Agents](https://cursor.com/docs/cloud-agent), Cursor documentation.

## Related

- [The coding-harness landscape](#coding-harness-landscape)
- [CI/CD for AI](#ci-cd-for-ai)
- [Securing coding agents](#coding-agent-security)
- [Sandboxes and execution environments](#sandboxes)
- [Working effectively with coding agents](#working-with-coding-agents)
- [Long-running and durable agents](#long-running-agents)
- [Playbook: RovoDev Code Reviewer: LLM review comments on Atlassian's pull requests](#atlassian-rovodev-code-reviewer)
- [Playbook: BitsAI-CR: two-stage LLM code review at ByteDance](#bytedance-bitsai-code-review)
- [Playbook: AutoCommenter: LLM best-practice comments in Google's code review](#google-autocommenter-code-review)
- [Playbook: GetYourGuide's Automerge: an AI pipeline that fixes and merges dependency updates](#getyourguide-ai-pull-request-workflow)
- [Playbook: uReview: Uber's in-house AI code reviewer with graded and filtered comments](#uber-ureview-code-review)
- [Playbook: Meta: mutation-guided test generation for privacy hardening](#meta-mutation-guided-test-generation)
- [Playbook: TestGen-LLM: extending human-written unit tests with LLMs at Meta](#meta-testgen-llm)
- [Playbook: Verification loops and an LLM judge for Spotify's background coding agent](#spotify-background-coding-agents)
- [Playbook: Beko: an LLM code review bot on pull requests, measured in three projects](#beko-automated-code-review)
