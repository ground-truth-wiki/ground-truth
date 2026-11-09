---
id: autonomy-and-oversight
book: 9
order: "9.9.1"
title: Autonomy levels and human oversight
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [autonomy-levels, human-oversight, automation-bias, agenticness, governance]
visuals:
  - autonomy-and-oversight-levels:stepper
  - autonomy-and-oversight-act-ask-wait:calculator
  - autonomy-and-oversight-gates:tree
prerequisites: [what-is-an-agent, human-in-the-loop]
---
> [!tldr]
> Autonomy is how much an agent does without you, a design choice separate from what it can do (capability) and what it may touch (agency). Pick a level per class of action, let it set the gates, monitoring and interface, and check that people can really exercise that oversight.

## Why it matters
Every agent sits between “asks before every action” and “runs alone with an off switch”. Pick that point by accident and you get unsupervised damage, or oversight on paper only. The second is common: Anthropic [reported](https://claude.com/blog/auto-mode-default-in-claude-code) in August 2026 that Claude Code users approve 97% of permission prompts, and that 1,053 paid testers caught a swapped-in dangerous command 13.6% of the time. The EU AI Act’s [Article 14](https://artificialintelligenceact.eu/article/14/) also ties the human oversight it requires for high-risk systems to their “level of autonomy”. This chapter extends [human in the loop](#human-in-the-loop).

## Intuition
Picture three faders. **Capability** is how well the agent works. **Agency** is what it may touch. **Autonomy** is how often it checks in. Feng et al., [“Levels of Autonomy for AI Agents”](https://arxiv.org/abs/2506.12469) (2025), define autonomy as “the extent to which an AI agent is designed to operate without user involvement”, apart from both. An [agent](#what-is-an-agent) with a shell that asks before every step has high agency and low autonomy; a calculator-only agent that runs unsupervised has the reverse. Their five levels name the human’s role:

```viz
{"id":"autonomy-and-oversight-levels","component":"stepper","title":"Each level hands the agent more of the work and leaves the human fewer controls, down to an off switch","caption":"Step through the five user roles of Feng, McDonald and Zhang (2025). The product placements are the paper’s own, as of June 2025.","alt":"Stepper through five autonomy levels named by the user’s role: operator, collaborator, consultant, approver and observer, with the user’s controls and example systems at each level.","data":"illustrative","try":"Stop at Approver and name the control the human has there that the Observer lacks.","depicts":"Feng, McDonald and Zhang, “Levels of Autonomy for AI Agents” (2025)","diagram":{"w":600,"h":64,"nodes":[{"id":"l1","label":"L1\nOperator","role":"human","align":"center","glyph":false,"x":0,"y":2,"w":108,"h":60},{"id":"l2","label":"L2\nCollaborator","role":"human","align":"center","glyph":false,"x":123,"y":2,"w":108,"h":60},{"id":"l3","label":"L3\nConsultant","align":"center","glyph":false,"x":246,"y":2,"w":108,"h":60},{"id":"l4","label":"L4\nApprover","role":"agent","align":"center","glyph":false,"x":369,"y":2,"w":108,"h":60},{"id":"l5","label":"L5\nObserver","role":"agent","align":"center","glyph":false,"x":492,"y":2,"w":108,"h":60}],"edges":[{"from":"l1","to":"l2"},{"from":"l2","to":"l3"},{"from":"l3","to":"l4"},{"from":"l4","to":"l5"}]},
"frames":[
{"label":"Operator","highlight":["l1"],"caption":"You plan and decide. The agent acts only when you invoke it, and an action it suggests runs only after you approve it. The paper places ChatGPT Canvas and Microsoft Copilot here."},
{"label":"Collaborator","highlight":["l2"],"caption":"You and the agent both plan and execute, and you can take over its work at any point. The paper places OpenAI’s Operator product here."},
{"label":"Consultant","highlight":["l3"],"caption":"The agent plans and executes over longer stretches and consults you. You give feedback and request changes instead of taking over. Example from the paper: Gemini Deep Research."},
{"label":"Approver","highlight":["l4"],"caption":"The agent works alone and comes to you only for blockers and consequential actions. Examples from the paper: SWE-agent, Manus and Devin. The paper asks how to keep approvals here from becoming meaningless rubber stamps."},
{"label":"Observer","highlight":["l5"],"caption":"The agent runs on its own. You can read its logs, and your only control is an emergency off switch. Examples from the paper: Voyager and The AI Scientist. The authors warn that the risks here may outweigh the benefits in most cases."}]}
```

## How it works
**Level schemes measure different things.** Hugging Face’s [smolagents guide](https://huggingface.co/docs/smolagents/conceptual_guides/intro_agents) rates agency, how much model output controls the program, from simple processor to code agent. Mitchell et al., [“Fully Autonomous AI Agents Should Not be Developed”](https://arxiv.org/abs/2502.02649) (2025), adapt a similar ladder, top it with agents that write and run new code, and find that “risks to people increase with the autonomy of a system”. Feng et al. rate the user’s involvement instead.

**Agenticness is a profile, not a number.** Shavit et al., [“Practices for Governing Agentic AI Systems”](https://cdn.openai.com/papers/practices-for-governing-agentic-ai-systems.pdf) (OpenAI, 2023), split it into goal complexity, environmental complexity, adaptability and independent execution. Chan et al., [“Harms from Increasingly Agentic Algorithmic Systems”](https://arxiv.org/abs/2302.10329) (2023), name underspecification, directness of impact, goal-directedness and long-term planning; Kasirzadeh and Gabriel, [“Characterizing AI Agents for Alignment and Governance”](https://arxiv.org/abs/2504.21848) (2025), grade autonomy, efficacy, goal complexity and generality. One level number hides which dimension changed.

**In, on or out of the loop.** Human Rights Watch’s [“Losing Humanity: The Case against Killer Robots”](https://www.hrw.org/reports/Losing%20Humanity%20Executive%20Summary.pdf) (2012) used these terms for weapons: each action needs a human command; a human oversees and can override; no human input at all. It counted on-the-loop systems whose supervision is “so limited” as effectively out of the loop.

**Why reviewers rubber-stamp.** Parasuraman and Manzey, [“Complacency and Bias in Human Use of Automation: An Attentional Integration”](https://doi.org/10.1177/0018720810376055) (2010), review **automation bias**: omission and commission errors when people rely on imperfect decision aids. Experts and novices both show it, and training or instructions do not prevent it. Shavit et al. add that a person who must approve many decisions has to approve each one quickly, which leaves less room to consider it.

**Act, ask or wait.** Horvitz, [“Principles of Mixed-Initiative User Interfaces”](https://www.microsoft.com/en-us/research/publication/principles-mixed-initiative-user-interfaces/) (CHI 1999), treated an assistant’s choice as expected utility under uncertainty about the user’s goal. In this **mixed-initiative** view, two probability thresholds separate doing nothing, asking and acting.

```viz
{"id":"autonomy-and-oversight-act-ask-wait","component":"calculator","title":"The costlier a wrong action is compared with asking, the surer an agent must be before it acts alone","caption":"A simplified form of Horvitz’s (1999) expected-utility thresholds. Below the ask threshold, wait; between the thresholds, ask; above the act threshold, act. Units are arbitrary points and the defaults are illustrative.","alt":"Calculator for the confidence thresholds at which an agent should wait, ask the user or act alone, from the value of a wanted action, the cost of an unwanted action and the cost of asking.","data":"formula","try":"Set the cost of an unwanted action to 2, as for an edit that is easy to undo, and watch acting alone beat asking at 90% confidence.","depicts":"Horvitz, “Principles of Mixed-Initiative User Interfaces” (CHI 1999), simplified","inputs":{"confidence":0.9,"benefit":10,"cost_wrong":200,"cost_ask":1},"input_meta":{"confidence":{"label":"Agent’s confidence the action is wanted","unit":"0 to 1","min":0,"max":1,"step":0.01},"benefit":{"label":"Value of a wanted action","unit":"points","min":0},"cost_wrong":{"label":"Cost of an unwanted action","unit":"points","min":0},"cost_ask":{"label":"Cost of asking","unit":"points","min":0}},"outputs":[{"id":"act_above","label":"Act alone above this confidence","expr":"1 - cost_ask / cost_wrong","unit":"pct","main":true},{"id":"ask_above","label":"Ask above this confidence (wait below)","expr":"cost_ask / benefit","unit":"pct"},{"id":"act_no_ask","label":"Act threshold when nobody can be asked","expr":"cost_wrong / (benefit + cost_wrong)","unit":"pct"},{"id":"ev_act","label":"Expected value of acting now","expr":"confidence * benefit - (1 - confidence) * cost_wrong","unit":"points"},{"id":"ev_ask","label":"Expected value of asking first","expr":"confidence * benefit - cost_ask","unit":"points"},{"id":"ev_wait","label":"Expected value of waiting","expr":"0","unit":"points"}],"assumptions":["Waiting is worth 0: nothing gained, nothing broken.","Asking costs the same whether or not the action was wanted, and the person always answers correctly.","The two thresholds hold when the ask threshold is below the act threshold; otherwise asking never pays, and the no-ask threshold applies.","Horvitz lets all six outcome utilities vary; this version collapses them into three costs."],"tests":[{"inputs":{},"expect":{"act_above":0.995,"ask_above":0.1,"ev_act":-11,"ev_ask":8}},{"inputs":{"cost_wrong":2},"expect":{"act_above":0.5,"ev_act":8.8,"ev_ask":8}},{"inputs":{"confidence":0.05},"expect":{"ev_ask":-0.5,"ev_act":-189.5}}]}
```

**Notify, question, review.** For agents that react to an event stream, LangChain’s [“Introducing ambient agents”](https://www.langchain.com/blog/introducing-ambient-agents) (January 2025) names three patterns: **notify** (flag without acting), **question** (ask instead of guessing) and **review** (show an action first, so the human can approve, edit or give feedback).

**Law and governance.** Under Article 14, overseers of a high-risk system must be able to understand its limits, stay aware of automation bias, interpret its output, override it, and halt it with a “stop” button or similar. For Annex III systems it applies from 2 December 2027 (as of November 2026; see [governance and regulation](#governance-regulation)). Shavit et al. add practices: constrain actions and require approval, keep a legible ledger of actions, monitor automatically, make agents attributable and keep them interruptible.

## In practice
Choose the level per class of action, not per product; it sets gates, [monitoring](#observability-tracing) and [interface](#agent-ux):

```viz
{"id":"autonomy-and-oversight-gates","component":"tree","title":"A level is a bundle of decisions: what waits for a person, what gets watched and what the interface shows","caption":"Illustrative mapping built on the user roles of Feng et al. (2025) and the practices of Shavit et al. (2023). Expand a level, and adapt the risk classes to your own tools.","alt":"Tree mapping four autonomy settings (operator or collaborator, consultant, approver, observer) to approval gates, monitoring and interface design.","data":"illustrative","depicts":"Levels from Feng, McDonald and Zhang (2025)","open":1,"root":{"label":"You chose a level for this class of actions. What follows?","children":[
{"label":"Operator or collaborator: human in the loop","children":[{"label":"Gates: the person invokes each action or can take over at any time"},{"label":"Monitoring: the person watches the work as it happens"},{"label":"Interface: inline suggestions, a shared editor and a visible take-over control","link":"#agent-ux"}]},
{"label":"Consultant: the agent leads, the human steers","children":[{"label":"Gates: approve the plan before a long run; reversible edits run in a workspace; external actions ask"},{"label":"Monitoring: a progress stream and checkpoints the person can roll back","link":"#long-running-agents"},{"label":"Interface: an editable plan and a way to request changes mid-run"}]},
{"label":"Approver: the human handles blockers and consequential actions","children":[{"label":"Gates: only irreversible or costly actions ask, worded so they can be read in seconds","link":"#human-in-the-loop"},{"label":"Monitoring: a ledger of every action, plus an automatic monitor that escalates repeated denials","link":"#observability-tracing"},{"label":"Interface: an inbox of notify, question and review items, where review offers approve, edit or feedback"}]},
{"label":"Observer: human on the loop, with an off switch","children":[{"label":"Gates: none at run time, so only contained actions, such as reads and edits inside a sandbox, are allowed at all","link":"#sandboxes"},{"label":"Monitoring: budgets, automatic monitors and review after the fact","link":"#guardrails-control"},{"label":"Interface: logs, alerts with an owner, and a stop that triggers a prepared fallback"}]}]}}
```

A gate policy that fails closed and logs each decision with the agent’s id:

```python
import logging

RUN, ASK, BLOCK = "run", "ask", "block"

POLICY = {  # level -> risk class -> decision
    "consultant": {"read": RUN, "workspace_edit": RUN, "external_reversible": ASK, "irreversible": ASK},
    "approver":   {"read": RUN, "workspace_edit": RUN, "external_reversible": RUN, "irreversible": ASK},
    "observer":   {"read": RUN, "workspace_edit": RUN, "external_reversible": BLOCK, "irreversible": BLOCK},
}

def gate(level: str, risk_class: str, agent_id: str, action: str) -> str:
    decision = POLICY.get(level, {}).get(risk_class, BLOCK)
    logging.info("agent=%s level=%s class=%s decision=%s action=%r",
                 agent_id, level, risk_class, decision, action)
    return decision
```

Decision rules:
- **Reversible or approved.** Shavit et al. advise that actions reviewed only after the fact be easier to reverse than those needing approval. Hence the observer row and its [sandbox](#sandboxes).
- **Expose the level as a setting.** Claude Code’s [permission modes](https://code.claude.com/docs/en/permission-modes) run from `default`, where only reads run unasked, to `bypassPermissions`, which the docs reserve for isolated containers and VMs (as of November 2026). See [permissions and hooks](#harness-permissions-hooks).
- **Escalate from monitors to people.** Claude Code’s auto mode lets a classifier review actions and hands back to the human after 3 consecutive denials or 20 in total ([Anthropic, March 2026](https://www.anthropic.com/engineering/claude-code-auto-mode)).

## Numbers to know
> [!number]
> Rule of thumb from the simplified Horvitz calculator above: if an unwanted action costs N times as much as asking, act unasked only above 1 − 1/N confidence (99% for N = 100). Vendor-reported by Anthropic: 93% of Claude Code permission prompts accepted (March 2026), 97% (August 2026). In Anthropic’s study of 1,053 paid testers, the testers caught 13.6% of swapped-in dangerous commands and auto mode blocked 89%; tester block rates fell from about 17% early in a session to about 5% after 50 or more prior prompts. EU AI Act Article 14(5): with exceptions, no action may rest on an identification by a remote biometric identification system until at least two people have separately confirmed it.

## Pitfalls and anti-patterns
> [!pitfall] On the loop in name only
> A dashboard nobody watches, or a queue too long to read, puts the human out of the loop, the case Human Rights Watch singled out. Give every alert an owner, keep queues short, and seed known-bad items to measure catches, as Anthropic’s study did.

- **Capability as permission.** A stronger model alone does not justify a higher level; task reliability and the cost of mistakes do. Feng et al. treat autonomy as a design choice separate from capability, and Shavit et al. start by asking whether the agent does the intended task reliably.
- **A monitor with the agent’s blind spots.** An injection that hijacks the agent may hijack an AI monitor reading it too (Shavit et al.). See [AI control](#ai-control) and [prompt injection](#prompt-injection).
- **A stop without a fallback.** Halting an agent that is scheduling a five-person meeting, after only two invites went out, leaves a mess; prepare a fallback first, such as a notice to those two invitees (Shavit et al.).

## Talk like an expert
The vocabulary: **autonomy level**, **agency**, **agenticness**, the five roles, **human in, on and out of the loop**, **automation bias**, **mixed initiative**, **legibility**, **attributability**, **interruptibility**, and Feng et al.’s **autonomy certificates**, issued by a third party to cap an agent’s level. Say “approver level for this tool class”, not “it is autonomous”.

Mitchell et al. argue that fully autonomous agents should not be developed; Shavit et al. treat agenticness as helpful when agreed safety practices govern it.

> [!hottake] For routine actions, a classifier is a better reviewer than a tired human.
> Anthropic’s numbers point that way. **The counterargument:** they are vendor-reported from one test setup, a monitor can be fooled by the same injected text as the agent, and accountability still needs a person who can understand, override and stop the system, as Article 14 demands.

## Check yourself
```quiz
autonomy-and-oversight
```

## Go deeper
- Feng et al., [“Levels of Autonomy for AI Agents”](https://arxiv.org/abs/2506.12469) (2025).
- Shavit et al., [“Practices for Governing Agentic AI Systems”](https://cdn.openai.com/papers/practices-for-governing-agentic-ai-systems.pdf) (OpenAI, 2023).
- Horvitz, [“Principles of Mixed-Initiative User Interfaces”](https://www.microsoft.com/en-us/research/publication/principles-mixed-initiative-user-interfaces/) (CHI 1999).

## Related
- [Human in the loop](#human-in-the-loop)
- [What is an agent?](#what-is-an-agent)
- [Agent UX](#agent-ux)
- [Guardrails and control](#guardrails-control)
- [Governance, regulation and law](#governance-regulation)
- [Permissions, approvals and hooks in coding harnesses](#harness-permissions-hooks)
- [Playbook: Google data centre cooling under direct AI control](#deepmind-data-centre-cooling)
- [Field note: Uber ATG's test vehicle crash in Tempe: what the NTSB found](#ntsb-uber-atg-tempe-crash)
