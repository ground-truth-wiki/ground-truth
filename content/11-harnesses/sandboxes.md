---
id: sandboxes
book: 11
order: "11.8"
title: Sandboxes and execution environments
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [sandbox, containers, microvm, egress]
visuals:
  - sandbox-boundary:diagram
  - isolation-matrix:matrix
  - isolation-chooser:tree
---
> [!tldr]
> Agents that run code or commands need a boundary that limits files, network, secrets and resources, enforced by the operating system or infrastructure rather than by the model. Choose the isolation technology by how much you trust the code and how fast it must start; choose the policy by what a fully compromised agent must never reach.

## Why it matters
An agent with a shell can read your SSH keys, upload your source code, delete a database or mine cryptocurrency, if a confused plan or an injected instruction tells it to. Prompts cannot prevent this; sandboxes can. They are what makes higher autonomy modes safe, and what lets background agents run without someone watching.

## Intuition
A sandbox is a workshop with a locked door. Inside, the agent can use any tool on the bench. It cannot walk into your house, it can only phone numbers on an approved list, and it only has the keys you handed it for this job.

```viz
{"id":"sandbox-boundary","component":"diagram","title":"A sandbox gates four crossings: files, network, secrets and resources","caption":"Everything inside the boundary is allowed by default; every crossing is denied unless a policy permits it. Click a crossing for the chapter that covers it.","alt":"Diagram of an agent process inside a sandbox boundary with gated crossings to the filesystem, network, secrets and resource limits.","data":"illustrative","w":600,"h":260,"groups":[{"label":"Sandbox boundary","x":150,"y":40,"w":300,"h":180}],"nodes":[
{"id":"agent","label":"Agent process","sub":"shell, code, tools","role":"agent","x":200,"y":100,"w":200,"h":60},
{"id":"files","label":"Files","sub":"workspace only","role":"data","x":0,"y":0,"w":140,"h":56},
{"id":"net","label":"Network","sub":"allowlisted hosts","role":"external","x":460,"y":0,"w":140,"h":56,"link":"#prompt-injection"},
{"id":"secrets","label":"Secrets","sub":"scoped, short-lived","role":"untrusted","x":0,"y":200,"w":140,"h":56,"link":"#mcp-authorization"},
{"id":"res","label":"Resources","sub":"CPU, memory, time","x":460,"y":200,"w":140,"h":56,"link":"#guardrails-control"}],
"edges":[{"from":"agent","to":"files","label":"read/write ./work","both":true},{"from":"agent","to":"net","label":"deny by default"},{"from":"secrets","to":"agent","label":"injected per task","style":"dashed"},{"from":"res","to":"agent","label":"limits","style":"dashed"}]}
```

## How it works
**Isolation technologies**, from lightest to strongest:
- **OS-level sandboxing** restricts a normal process with operating-system features, such as file-access rules and network filters, with no container. Anthropic’s sandbox runtime enforces filesystem and network limits this way for agents, local MCP servers and shell commands (verified Nov 2026). Instant to start; suited to local coding agents.
- **Containers** package a filesystem and isolate processes with namespaces, but share the host kernel. Fast and familiar; a kernel exploit escapes them.
- **gVisor** runs containers on a user-space kernel that intercepts system calls, shrinking the attack surface.
- **MicroVMs** such as Firecracker give each workload its own lightweight kernel and start in well under a second; many hosted sandboxes use them.
- **WebAssembly** runs code in a runtime that can only use the capabilities it is granted; strong but limited to supported languages and system interfaces.

**Hosted sandboxes.** Services such as E2B, Modal, Daytona and Cloudflare offer on-demand sandboxes for agent code, so you do not run untrusted code on your own hosts.

**The policy matters more than the technology.**
- **Files:** mount only the workspace, read-only where possible; never the home directory.
- **Network:** default-deny egress with an allowlist of hosts. Egress is the exfiltration channel. See [prompt injection](#prompt-injection).
- **Secrets:** inject only the credentials a task needs, scoped and short-lived; keep them out of environment variables the agent can print where possible.
- **Resources:** cap CPU, memory, disk, processes and wall-clock time.
- **Lifetime:** destroy the sandbox after the task; persist only declared outputs.

```viz
{"id":"isolation-matrix","component":"matrix","matrix":"sandbox-isolation","title":"Isolation options trade startup speed for strength of the boundary","caption":"Sortable and filterable. Qualitative; strength depends heavily on configuration.","alt":"Table comparing OS-level sandboxes, containers, gVisor, microVMs, full VMs and WebAssembly by boundary, startup and best use.","data":"illustrative","depicts":"As of November 2026"}
```

## In practice
```viz
{"id":"isolation-chooser","component":"tree","title":"Two questions pick the boundary: who wrote the code, and whose machine is it?","caption":"Expand the branch that matches your case. Whatever you choose, the egress and secrets policy is the part attackers test.","alt":"Decision tree for choosing an isolation technology by code trust and host ownership.","data":"illustrative","open":2,"root":{"label":"Who wrote the code that will run?","children":[
{"label":"An agent, on a developer’s laptop","children":[{"label":"OS-level sandboxing of the agent and its commands, with workspace-only files and a network allowlist","link":"#claude-code"}]},
{"label":"An agent, on shared servers or in CI","children":[{"label":"Containers with gVisor, or microVMs; one sandbox per task; no production credentials"}]},
{"label":"Users or third parties, multi-tenant","children":[{"label":"MicroVMs or a hosted sandbox service, strict egress, per-tenant isolation"}]},
{"label":"A narrow, well-defined function","children":[{"label":"WebAssembly with only the capabilities it needs"}]}]}}
```

A sandbox checklist for any agent with code execution:
- One sandbox per task or session, destroyed afterwards.
- Workspace-only filesystem; no access to `~/.ssh`, cloud credentials or browser profiles.
- Default-deny outbound network with an allowlist; log blocked attempts.
- Scoped, short-lived credentials injected for the task.
- CPU, memory, disk and time limits.
- An audit log of commands and network calls. See [observability](#observability-tracing).

## Numbers to know
> [!number]
> Rules of thumb. OS-level sandboxes and containers start in milliseconds to seconds; microVMs in well under a second; full VMs in seconds to minutes. Default-deny egress with an allowlist blocks most exfiltration paths, provided DNS and proxies are also controlled.

## Pitfalls and anti-patterns
> [!pitfall] A sandbox with the network wide open
> Isolation of files means little if the agent can send anything it reads to any host. Egress control is the most important setting.

- **Mounting the home directory** “for convenience”.
- **Long-lived credentials inside the sandbox.**
- **Reusing one sandbox across users or tasks.** State leaks between them.
- **Bypass modes outside a sandbox.** See [Claude Code](#claude-code).

## Talk like an expert
The vocabulary: **isolation boundary**, **shared kernel**, **microVM**, **gVisor**, **OS-level sandbox**, **egress allowlist**, **ephemeral sandbox**, **least privilege**. Experts ask “what can this process reach if the model is fully compromised?” and design the answer to be “nothing that matters”. The live debate is how much isolation local developer agents need: strong boundaries add friction to everyday work.

> [!hottake] Every agent with a shell should run in a sandbox, even on a developer’s own laptop.
> **The counterargument:** developers already run untrusted code from package managers all day; heavy isolation for agents alone adds friction without addressing that larger supply-chain risk.

## Check yourself
```quiz
sandboxes
```

## Go deeper
- The `anthropics/sandbox-runtime` repository (verified Nov 2026).
- Firecracker and gVisor project documentation.
- Documentation for hosted sandboxes such as E2B, Modal and Daytona.

## Related
- [Secure agent design](#secure-agent-design)
- [Guardrails and control](#guardrails-control)
- [Case study: Claude Code](#claude-code)
- [Prompt injection](#prompt-injection)
- [Anatomy of an agent harness](#harness-anatomy)
- [Browser automation for agents: Playwright, CDP and agent libraries](#browser-automation-stack)
- [Data-analysis and notebook agents](#data-analysis-agents)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [OS-level sandboxing for agents](#os-level-sandboxing)
- [Securing coding agents](#coding-agent-security)
