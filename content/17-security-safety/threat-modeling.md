---
id: threat-modeling
book: 17
order: "17.1"
title: Threat modeling LLM apps and agents
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [threat-model, owasp, atlas]
visuals:
  - threat-dfd:diagram
  - stride-matrix:matrix
  - owasp-tree:tree
---
> [!tldr]
> Threat modeling for AI systems starts with the classic questions (what are we building, what can go wrong, what will we do about it, did we do a good job?) and adds a new fact: every piece of text the model reads is a potential instruction. Draw the data flows, mark trust boundaries, and use STRIDE, OWASP’s LLM Top 10 and MITRE ATLAS as checklists.

## Why it matters
AI features change the attack surface in ways traditional reviews miss: a document in a vector store can steer an agent, a tool description can exfiltrate data, and a chatbot can be talked into revealing its configuration. Teams that threat-model before building put boundaries in the right places; teams that do not discover them in incident reports.

## Intuition
A threat model is a map of a building marked with every door, window and vent, and who has keys to each. For an AI system, you also mark every place where a stranger can slip a note that the receptionist will read aloud and act on.

```viz
{"id":"threat-dfd","component":"diagram","title":"Every arrow that crosses a dashed boundary carries text the model might obey","caption":"An illustrative data-flow diagram of an email assistant. Boxes are components; dashed groups are trust boundaries. Click a component for the chapter that covers its risks.","alt":"Data-flow diagram of an AI email assistant with trust boundaries around the user’s device, the service and third parties.","data":"illustrative","w":600,"h":300,"groups":[{"label":"User’s device","x":0,"y":0,"w":160,"h":300},{"label":"Your service","x":180,"y":0,"w":240,"h":300},{"label":"Third parties","x":440,"y":0,"w":160,"h":300}],"nodes":[
{"id":"user","label":"User","role":"human","x":14,"y":40,"w":132,"h":50},
{"id":"ui","label":"Chat UI","role":"human","x":14,"y":160,"w":132,"h":50,"link":"#agent-ux"},
{"id":"agent","label":"Agent","role":"agent","x":220,"y":40,"w":160,"h":50,"link":"#secure-agent-design"},
{"id":"idx","label":"Vector index","role":"data","x":220,"y":130,"w":160,"h":50,"link":"#production-rag"},
{"id":"logs","label":"Logs","role":"data","x":220,"y":220,"w":160,"h":50,"link":"#privacy"},
{"id":"llm","label":"Model API","role":"model","x":454,"y":30,"w":132,"h":50},
{"id":"mail","label":"Email inbox","role":"untrusted","x":454,"y":120,"w":132,"h":50,"link":"#prompt-injection"},
{"id":"mcp","label":"MCP servers","role":"tool","x":454,"y":210,"w":132,"h":50,"link":"#mcp-security"}],
"edges":[{"from":"user","to":"ui"},{"from":"ui","to":"agent","label":"requests"},{"from":"agent","to":"llm","both":true},{"from":"mail","to":"agent","label":"untrusted text","style":"dashed"},{"from":"idx","to":"agent","label":"retrieved text"},{"from":"agent","to":"mcp","both":true},{"from":"agent","to":"logs","style":"dashed"}]}
```

## How it works
**Data-flow diagrams.** Draw users, components, data stores and external services, and the data that moves between them. Mark trust boundaries wherever data crosses from one level of trust to another. In AI systems, every channel that delivers text into a model’s context is a boundary, including retrieved documents, tool results, memory and other agents’ messages.

**STRIDE for AI.** Microsoft’s STRIDE categories still apply, with AI-specific instances:

```viz
{"id":"stride-matrix","component":"matrix","matrix":"stride-ai","title":"The six STRIDE categories, each with its AI-specific threats and first defenses","caption":"Filter by a word such as “injection” or “logs”. A checklist to walk through for every data-flow diagram.","alt":"Table mapping STRIDE categories to AI-specific threats, examples and first defenses.","data":"illustrative"}
```

**OWASP Top 10 for LLM Applications.** A community list of the most common risk categories, updated periodically; its 2026 edition (August 2026) is a useful checklist. It reordered the 2025 list, lifting excessive agency to third, and widened system prompt leakage into hidden context exposure; both numberings circulate, so quote IDs with their year (LLM08:2026, not LLM08):

```viz
{"id":"owasp-tree","component":"tree","title":"The 2026 OWASP Top 10 for LLM applications, each linked to where Ground Truth covers it","caption":"Expand for a one-line description. As of November 2026; check genai.owasp.org for the current edition, since the list is revised as practice changes.","alt":"Tree of the ten OWASP risk categories for LLM applications in the 2026 edition.","data":"illustrative","depicts":"OWASP Top 10 for LLM Applications, 2026 edition (as of November 2026)","open":0,"root":{"label":"OWASP Top 10 for LLM applications (2026)","children":[
{"label":"LLM01 Prompt injection","children":[{"label":"Instructions in inputs or content that override intended behavior","link":"#prompt-injection"}]},
{"label":"LLM02 Sensitive information disclosure","children":[{"label":"Leaking personal data, secrets or confidential content","link":"#privacy"}]},
{"label":"LLM03 Excessive agency","children":[{"label":"Agents with more tools, permissions or autonomy than they need","link":"#guardrails-control"}]},
{"label":"LLM04 Supply chain","children":[{"label":"Compromised models, datasets, packages and plugins","link":"#supply-chain-security"}]},
{"label":"LLM05 Data and model poisoning","children":[{"label":"Manipulated training, fine-tuning or retrieval data","link":"#supply-chain-security"}]},
{"label":"LLM06 Unbounded consumption","children":[{"label":"Runaway cost, denial of service and model extraction","link":"#cost-capacity"}]},
{"label":"LLM07 Misinformation","children":[{"label":"Confident, wrong output trusted by people or systems","link":"#grounding-citations"}]},
{"label":"LLM08 Hidden context exposure","children":[{"label":"System prompts, tool schemas and other hidden context extracted or inferred","link":"#jailbreaks-misuse"}]},
{"label":"LLM09 Vector and embedding weaknesses","children":[{"label":"Poisoned or leaky retrieval stores, broken access control","link":"#production-rag"}]},
{"label":"LLM10 Improper output handling","children":[{"label":"Passing model output to browsers, shells or databases unchecked","link":"#secure-agent-design"}]}]}}
```

**OWASP Top 10 for Agentic Applications.** Its companion list (December 2025, IDs ASI01 to ASI10) covers what changes once the model acts on its own, from agent goal hijack to rogue agents. The LLM list's 2026 preface says to use both for agents.

**MITRE ATLAS.** A knowledge base of adversary tactics and techniques against AI systems, modeled on ATT&CK, useful for red-team planning and mapping incidents. **NIST’s AI Risk Management Framework** frames risk governance more broadly. See [governance](#governance-regulation).

## In practice
A one-hour threat-modeling session for a new AI feature:
1. **Draw** the data-flow diagram, including every source of text the model reads.
2. **Mark** trust boundaries and the assets worth protecting: user data, credentials, money, reputation.
3. **Walk STRIDE** for each boundary crossing, and the OWASP list for the system as a whole.
4. **Ask the agent question:** if the model is fully manipulated, what can it reach and do? See [secure agent design](#secure-agent-design).
5. **Decide mitigations**, owners and tests; turn each threat into a [safety eval](#safety-evals) case.
6. **Revisit** when tools, data sources or autonomy change.

## Numbers to know
> [!number]
> Rules of thumb. Count the untrusted text channels into each model call; each is an injection path. Count the tools with side effects an agent holds; each is a potential impact. The product of the two is a crude but useful measure of risk.

## Pitfalls and anti-patterns
> [!pitfall] Treating the model as the security boundary
> Instructions such as “never reveal the system prompt” are not controls. Assume the model can be persuaded, and enforce boundaries in code and infrastructure.

- **Forgetting indirect inputs.** Retrieved documents, tool results and memory are inputs too.
- **Threat modeling once.** New tools or data sources change the model.
- **No assets list.** Without knowing what matters, every threat looks equal.

## Talk like an expert
The vocabulary: **data-flow diagram**, **trust boundary**, **STRIDE**, **OWASP LLM Top 10**, **MITRE ATLAS**, **asset**, **blast radius**, **excessive agency**. Experts ask “where does untrusted text enter, and what can the model do afterwards?” first. The live debate is how threat modeling adapts to agents whose tool use is open-ended, where the set of possible actions is hard to enumerate.

> [!hottake] For AI systems, the question is not whether the model can be manipulated but what it can do once it is.
> **The counterargument:** model-level robustness keeps improving and does reduce risk; designing as if models were defenseless can make products needlessly restrictive.

## Check yourself
```quiz
threat-modeling
```

## Go deeper
- OWASP Top 10 for LLM Applications, current edition, at owasp.org.
- OWASP Top 10 for Agentic Applications, at genai.owasp.org.
- MITRE ATLAS at atlas.mitre.org.
- Shostack, *Threat Modeling: Designing for Security* (2014).

## Related
- [Prompt injection](#prompt-injection)
- [Secure agent design](#secure-agent-design)
- [Supply chain and model security](#supply-chain-security)
- [Red teaming](#red-teaming)
- [MCP security](#mcp-security)
