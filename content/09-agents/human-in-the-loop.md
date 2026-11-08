---
id: human-in-the-loop
book: 9
order: "9.9"
title: Human in the loop
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [approvals, hitl, autonomy]
visuals:
  - autonomy-dial:explorer
  - approval-flow:sequence
  - approval-prompt-compare:compare
---
> [!tldr]
> Put humans where mistakes are expensive or irreversible: approvals before side effects, interrupts during long runs, and escalation when the agent is unsure or policy requires it. Ask too rarely and agents do damage; ask too often and people approve without reading.

## Why it matters
Autonomy is a dial, not a switch. Every agent product picks a point on it, explicitly or by accident, and that choice decides both the damage a confused agent can do and how much users trust it. The failure on one side is the agent that deletes a branch nobody approved. The failure on the other side is approval fatigue: forty prompts a session, all clicked yes, protecting nothing.

## Intuition
Think of a new employee with a company card. You let them buy coffee without asking, ask them to check before booking flights, and never let them sign contracts alone. As they prove themselves, the limits rise. Good human-in-the-loop design is that policy, written down and enforced in code.

```viz
{"id":"autonomy-dial","component":"explorer","model":"autonomy","title":"Each notch of autonomy removes a class of approvals, until only irreversible actions still ask","caption":"Illustrative coding-agent run with 57 tool calls. Move the dial and watch which actions run by themselves and how many approvals a person faces per run. Destructive actions stay blocked at every setting.","alt":"Explorer with an autonomy dial from ask before everything to auto-approve network installs, listing actions as running automatically, asking, or blocked, with approvals per run.","data":"illustrative","try":"Set the dial to “Ask before everything” and count the approvals; then find the lowest setting with fewer than five."}
```

## How it works
**Approval gates.** The harness pauses before an action and shows exactly what will happen: the command, the file diff, the recipient and the message, the amount. Approval is per action or per class of action (“allow all edits in this folder for this session”).

**Risk classes.** Group tools by blast radius: read-only, local and reversible, sandboxed execution, network or external effects, irreversible, and destructive. Map each class to always, ask, or never. Tool annotations such as `destructiveHint` in [MCP](#mcp-primitives) help, but only from servers you trust.

**Interrupts.** Users must be able to stop or redirect a run at any step without losing progress. That requires the loop to check for interrupts between steps and the harness to [checkpoint](#long-running-agents).

**Escalation.** The agent hands off to a person when confidence is low, policy requires it, or the user asks. A good handoff includes a summary, what was tried and what is needed, so the human starts informed. See [support agents](#support-agents).

**Review after the fact.** For background agents, the human loop moves to review: pull requests, drafts, reports. The agent proposes; a person merges, sends or publishes.

```viz
{"id":"approval-flow","component":"sequence","title":"An approval pauses the loop, shows the exact action, and resumes only on a yes","caption":"Tap each message. The approval request names the action precisely, and the agent receives the decision as information either way.","alt":"Sequence diagram of an agent requesting a risky tool call, the harness asking a human for approval, and the decision flowing back.","data":"illustrative","actors":[{"id":"model","label":"Model","role":"model"},{"id":"harness","label":"Harness","role":"agent"},{"id":"human","label":"Human","role":"human"},{"id":"tool","label":"Git host","role":"external"}],
"messages":[
{"from":"model","to":"harness","label":"tool_use: push","payload":{"name":"git_push","input":{"branch":"main","force":false}},"note":"The model asks to push to a shared branch, a class of action this harness always gates."},
{"from":"harness","to":"human","label":"Approve this push?","payload":"Push 3 commits to main on acme/api:\n  - fix: handle empty config\n  - test: add regression for #812\n  - docs: update config.md\n[Approve] [Deny] [Push to a new branch instead]","note":"Show the exact effect, not “the agent wants to use git”. Offer a safer alternative."},
{"from":"human","to":"harness","label":"Push to a new branch","kind":"response","note":"The human picks the safer option."},
{"from":"harness","to":"tool","label":"push to agent/fix-812","note":"The harness executes the approved variant."},
{"from":"tool","to":"harness","label":"pushed","kind":"response"},
{"from":"harness","to":"model","label":"tool_result","payload":{"type":"tool_result","content":"The user redirected the push to branch agent/fix-812. Open a pull request instead of pushing to main."},"note":"The decision goes back to the model as information, so it can adapt its plan."}]}
```

## In practice
How the approval is worded matters as much as when it appears:

```viz
{"id":"approval-prompt-compare","component":"compare","title":"An approval people can read in two seconds is an approval people actually read","caption":"Hover the marks. The good prompt states the effect, the scope and an alternative.","alt":"Comparison of a vague approval prompt and a specific one for sending an email.","data":"illustrative","mono":false,"a":{"title":"Vague","text":"The agent wants to use the tool send_email. Allow?\n[Allow] [Deny]","mono":false},"b":{"title":"Specific","text":"Send an email to dana@customer.example\nSubject: Your refund for order 2291\nBody: 3 sentences, includes the refund amount ($42.10).\n[Send] [Edit first] [Don’t send]","mono":false},"links":[{"a":"use the tool send_email","b":"Send an email to dana@customer.example","note":"Name the effect and the recipient, not the tool."},{"b":"includes the refund amount ($42.10)","note":"Surface the detail most likely to be wrong."},{"a":"[Allow] [Deny]","b":"[Send] [Edit first] [Don’t send]","note":"Buttons named for actions, plus a middle option that keeps the human in control."}]}
```

Design rules:
- **Gate by blast radius, not by tool.** Reads run; reversible edits run in a workspace; external, irreversible and costly actions ask.
- **Batch where safe.** “Approve all edits under `src/` for this task” beats forty identical prompts.
- **Make denial useful.** A denied action returns a reason to the model, so it can try another way.
- **Log every decision** with who approved what, for audit. See [enterprise readiness](#enterprise-readiness).
- **Prefer review over approval for background work.** Pull requests, drafts and staged changes let humans decide with full context.

## Numbers to know
> [!number]
> Rules of thumb. If a typical run asks for more than a handful of approvals, expect people to stop reading them. Keep approval prompts readable in a few seconds. Reversible actions in a sandbox rarely need approval; irreversible ones always do.

## Pitfalls and anti-patterns
> [!pitfall] Approval fatigue
> A gate that fires on every action trains users to click yes. It protects you less than a smaller number of precise gates.

- **Approvals that hide the details.** “Allow tool use?” is not informed consent.
- **No interrupt.** Users who cannot stop an agent will not start one.
- **Escalations without context.** Handing a human a raw transcript wastes the escalation.
- **Trusting a server’s risk labels blindly.** Annotations are hints. See [MCP security](#mcp-security).

## Talk like an expert
The vocabulary: **approval gate**, **blast radius**, **autonomy level**, **interrupt**, **escalation**, **approval fatigue**, **human on the loop** (monitoring rather than approving). Experts ask “what is the worst thing this action can do, and can we undo it?”. The live debate is how far automated safety checks, such as a classifier that reviews each action, can replace human approvals; several coding agents now offer such modes.

> [!hottake] Most approval prompts are security theater.
> **The counterargument:** precise, rare approvals on irreversible actions are among the few defenses that hold even when the model is fully manipulated. The theater is in the noisy ones, not the idea.

## Check yourself
```quiz
human-in-the-loop
```

## Go deeper
- Anthropic, “Building effective agents” (December 2024), on checkpoints and human feedback.
- LangGraph’s documentation on interrupts and human-in-the-loop patterns, for one concrete implementation.

## Related
- [Guardrails and control](#guardrails-control)
- [Agent UX](#agent-ux)
- [Tool use and tool design](#agent-tools)
- [Secure agent design](#secure-agent-design)
- [Prompt injection](#prompt-injection)
