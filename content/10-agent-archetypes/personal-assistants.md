---
id: personal-assistants
book: 10
order: "10.6"
title: Personal and ambient assistants
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [assistants, email, calendar, proactive]
visuals:
  - assistant-permissions:tree
  - ambient-flow:sequence
---
> [!tldr]
> Personal assistants act across a person’s email, calendar, files, messages and accounts, often proactively. Their value comes from memory and integration; their risks come from the same place. Design permissions per data source and action, propose rather than act for anything consequential, and make memory visible and editable.

## Why it matters
An assistant that can read your inbox, schedule meetings and pay bills is enormously useful and holds more of your life than most apps. It also reads untrusted content constantly: every email and web page can try to instruct it. Getting permissions, memory and proactivity right decides whether people trust it with anything that matters.

## Intuition
A personal assistant is a chief of staff. A great one knows your preferences, prepares things before you ask and checks with you before committing you to anything. A bad one forwards your private mail to strangers because a letter told them to.

```viz
{"id":"assistant-permissions","component":"tree","title":"Grant permissions per source and per action, not all at once","caption":"Expand a data source for sensible defaults. Reading is not the same permission as acting.","alt":"Tree of personal assistant permissions by data source, separating read, draft and act permissions with defaults.","data":"illustrative","open":1,"root":{"label":"What may the assistant do?","children":[
{"label":"Email","children":[{"label":"Read and summarize: yes. Draft replies: yes. Send: only with approval showing recipient and text","link":"#prompt-injection"}]},
{"label":"Calendar","children":[{"label":"Read: yes. Propose times: yes. Accept or send invites: with approval"}]},
{"label":"Files and documents","children":[{"label":"Read on request; share externally only with approval","link":"#privacy"}]},
{"label":"Messages and social","children":[{"label":"Read selected chats; post only with approval"}]},
{"label":"Payments and purchases","children":[{"label":"Always approval, with spending limits and merchant allowlists","link":"#protocol-soup"}]},
{"label":"Memory","children":[{"label":"Remember with consent; let the user view, edit and delete","link":"#agent-memory"}]}]}}
```

## How it works
**Integrations.** Connectors or MCP servers for mail, calendar, files and services, with OAuth scopes as narrow as the features need. See [MCP authorization](#mcp-authorization).

**Memory and personalization.** Preferences, relationships, ongoing projects and past decisions make the assistant useful; they need consent, visibility and deletion. See [memory](#agent-memory).

**Proactivity.** Ambient assistants act on triggers (a new email, an upcoming meeting, a deadline) rather than prompts. Proactive actions should arrive as proposals the user can accept, edit or dismiss:

```viz
{"id":"ambient-flow","component":"sequence","title":"A trigger produces a proposal, not an action","caption":"An illustrative ambient flow. The assistant prepares everything and the user decides with one tap.","alt":"Sequence diagram of an ambient assistant: a new email trigger, the assistant checking the calendar, drafting a reply, and the user approving before sending.","data":"illustrative","actors":[{"id":"mail","label":"Inbox","role":"untrusted"},{"id":"asst","label":"Assistant","role":"agent"},{"id":"cal","label":"Calendar","role":"tool"},{"id":"user","label":"User","role":"human"}],
"messages":[
{"from":"mail","to":"asst","label":"new email: “Can we meet Thursday?”","note":"Email content is untrusted input."},
{"from":"asst","to":"cal","label":"find free slots Thursday"},
{"from":"cal","to":"asst","label":"10:00 and 15:30 free","kind":"response"},
{"from":"asst","to":"user","label":"proposal","payload":"Reply to Sam: “Thursday works. 10:00 or 15:30?” and hold both slots.\n[Send] [Edit] [Dismiss]","note":"One tap to accept; nothing leaves the account without it."},
{"from":"user","to":"asst","label":"Send","kind":"response"},
{"from":"asst","to":"mail","label":"send reply"}]}
```

**Security.** Personal assistants combine private data, untrusted content and external communication, the lethal trifecta. Separate reading from acting, gate sends and payments, and treat instructions found in content as data. See [secure agent design](#secure-agent-design).

**On-device and hybrid.** Some processing can stay on the device for privacy, escalating to cloud models when needed. See [edge and on-device AI](#edge-on-device).

## In practice
- Start with read and draft permissions; add actions one at a time with approvals.
- Show what the assistant remembers and let users correct it.
- Rate-limit proactive suggestions; noisy assistants get ignored.
- Log every action taken on the user’s behalf in a timeline they can review.
- Evaluate across sessions: memory, preferences and follow-ups over days.

## Numbers to know
> [!number]
> Rules of thumb. Each additional connected account multiplies both usefulness and risk. Keep proactive notifications to a handful a day unless the user asks for more.

## Pitfalls and anti-patterns
> [!pitfall] Send permissions granted with read permissions
> An assistant that can read and send mail can be instructed by any incoming email to forward the inbox.

- **Invisible memory.** Users cannot trust what they cannot see or correct.
- **Proactive actions without approval.** Surprise actions erode trust quickly.
- **Broad OAuth scopes.** Ask only for what features need.

## Talk like an expert
The vocabulary: **ambient assistant**, **proactive suggestion**, **connector**, **OAuth scope**, **approval**, **memory controls**, **lethal trifecta**, **action timeline**. Experts describe assistants by what they may read, draft and do, and how users stay in control. The live debate is how much autonomy people actually want from personal assistants, and how platform owners will open their ecosystems to them.

> [!hottake] The winning personal assistant will be the one people trust with their inbox, not the smartest one.
> **The counterargument:** trust follows usefulness; a cautious assistant that cannot do much will not earn the access it needs to prove itself.

## Check yourself
```quiz
personal-assistants
```

## Go deeper
- Willison’s writing on the lethal trifecta (2025) and on prompt injection in assistants.
- Platform documentation for assistant integrations and permission scopes.

## Related
- [Memory](#agent-memory)
- [Secure agent design](#secure-agent-design)
- [Prompt injection](#prompt-injection)
- [Privacy](#privacy)
- [Human in the loop](#human-in-the-loop)
- [Agent memory architectures and benchmarks](#agent-memory-architectures)
- [Agent identity and delegated authorization](#agent-identity-delegation)
- [Agentic commerce and payment protocols](#agentic-commerce-protocols)
