---
id: what-is-an-agent
book: 9
order: "9.1"
title: What is an agent?
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [agents, autonomy, workflows]
visuals:
  - autonomy-spectrum:stepper
  - agent-wizard:wizard
  - workflow-vs-agent-compare:compare
---
> [!tldr]
> An agent is a model running in a loop that chooses its own next action until the task is done. A workflow is code you wrote that calls a model at fixed steps. The real question is never “is it an agent?” but “who decides the next step, code or the model?”, and the answer should be the model only when the task demands it.

## Why it matters
“Agent” is the most overloaded word in the field. Vendors call chatbots agents; researchers call reinforcement-learning policies agents; your colleague calls a prompt chain an agent. If you cannot say precisely what you mean, you will build the wrong thing: an expensive, unpredictable agent where a ten-line workflow would do, or a brittle tree of `if` statements where an agent would have handled the long tail.

## Intuition
A recipe is a workflow: the steps are written down and anyone can follow them. A chef cooking from whatever is in the fridge is an agent: they look, decide, taste and adjust. Recipes are cheaper, faster and more consistent. You hire the chef only when you cannot write the recipe in advance.

```viz
{"id":"autonomy-spectrum","component":"stepper","title":"Autonomy is a dial: each step to the right hands more decisions to the model","caption":"Step through six positions. At each one, notice who decides the next step and what a mistake costs. Most products belong in the first four positions.","alt":"Stepper along a spectrum from a single model call to an autonomous background agent, with an example product and the deciding party at each position.","data":"illustrative","try":"Stop at “Agent with approvals” and name a product you use that sits there.","diagram":{"w":600,"h":64,"nodes":[{"id":"a","label":"Single\ncall","align":"center","glyph":false,"x":0,"y":2,"w":90,"h":60},{"id":"b","label":"Prompt\nchain","align":"center","glyph":false,"x":102,"y":2,"w":90,"h":60},{"id":"c","label":"Router","align":"center","glyph":false,"x":204,"y":2,"w":90,"h":60},{"id":"d","label":"Tool-using\nassistant","role":"tool","align":"center","glyph":false,"x":306,"y":2,"w":90,"h":60},{"id":"e","label":"Agent with\napprovals","role":"agent","align":"center","glyph":false,"x":408,"y":2,"w":90,"h":60},{"id":"f","label":"Background\nagent","role":"agent","align":"center","glyph":false,"x":510,"y":2,"w":90,"h":60}],"edges":[{"from":"a","to":"b"},{"from":"b","to":"c"},{"from":"c","to":"d"},{"from":"d","to":"e"},{"from":"e","to":"f"}]},
"frames":[
{"label":"Single call","highlight":["a"],"caption":"Code decides everything; the model answers once. Example: classify a support ticket’s urgency. A mistake costs one wrong label."},
{"label":"Prompt chain","highlight":["b"],"caption":"Code fixes the sequence; each step is one call with a check between. Example: extract fields, validate, then draft a reply."},
{"label":"Router","highlight":["c"],"caption":"A model picks a branch, but every branch is code you wrote. Example: send billing questions and bug reports down different pipelines."},
{"label":"Tool-using assistant","highlight":["d"],"caption":"The model chooses which tool to call within one turn, usually a read-only search or lookup. Example: a chat assistant that can search the web."},
{"label":"Agent with approvals","highlight":["e"],"caption":"The model plans and acts over many steps; a person approves risky actions. Example: a coding agent editing files in your repository and asking before it runs commands."},
{"label":"Background agent","highlight":["f"],"caption":"The model works for minutes or hours without a person watching, then reports back. Example: a cloud coding agent that opens a pull request. Mistakes are found after the fact, so sandboxes, budgets and review matter most here."}]}
```

## How it works
**The working definition.** Anthropic’s essay “Building effective agents” (December 2024) draws the line this Bible uses: in **workflows**, models and tools are orchestrated through predefined code paths; in **agents**, the model dynamically directs its own process and tool use. Both are “agentic systems”; they differ in who holds control.

**What makes something an agent.** Four ingredients: a model that can choose actions, tools that let actions affect the world, a [loop](#agent-loop) that feeds results back, and a stop condition. Remove the loop and you have a tool-using assistant; remove the model’s choice and you have a workflow.

**Why agents became practical.** Three capabilities crossed a threshold around 2024 and 2025: reliable [tool calling](#agent-tools), recovery from errors in tool results, and staying on task across many steps. Coding was the first domain where this paid off, because tests give the loop an honest feedback signal.

**When not to build one.**
- The steps are known: write a [workflow](#workflow-patterns).
- Latency must be low: every loop step adds a full model call.
- Mistakes are costly and hard to detect: autonomy multiplies them.
- You cannot evaluate trajectories: you will not know whether it works. See [evaluating agents](#evaluating-agents).

Unsure? Answer three questions:

```viz
{"id":"agent-wizard","component":"wizard","wizard":"workflow-vs-agent","title":"Three questions tell you whether you need a workflow, an agent, or an agent on a short leash","caption":"Each answer narrows the design. The result links to the chapters you need next.","alt":"Decision wizard choosing between a routing workflow, a prompt chain, an agent with approvals and an agent with budgets.","data":"illustrative"}
```

## In practice
The same task looks very different as a workflow and as an agent. Hover the marked parts to compare where decisions live:

```viz
{"id":"workflow-vs-agent-compare","component":"compare","title":"In a workflow the branches live in your code; in an agent they live in the model’s choices","caption":"The same refund request handled both ways. The workflow is predictable and testable; the agent copes with the request nobody planned for.","alt":"Side-by-side comparison of a refund request handled by a fixed workflow and by an agent choosing tools.","data":"illustrative","a":{"title":"Workflow (code decides)","text":"intent = classify(msg)\nif intent == 'refund':\n    order = lookup_order(msg)\n    if order.days_since < 30:\n        draft = write_reply(msg, order, 'approve')\n    else:\n        draft = write_reply(msg, order, 'decline')\nelse:\n    draft = escalate(msg)\nsend_after_review(draft)"},"b":{"title":"Agent (model decides)","text":"system: You resolve refund requests under\n  POLICY. Tools: lookup_order, issue_refund\n  (needs approval), ask_customer, escalate.\nuser: I was charged twice and one order\n  never arrived.\nmodel: lookup_order(email=...)\nmodel: lookup_order(id=2)  # second charge\nmodel: ask_customer('Which order is missing?')\nmodel: issue_refund(id=2)  -> approval\nmodel: Explains both outcomes to the customer."},"links":[{"a":"intent = classify(msg)","b":"I was charged twice and one order\n  never arrived.","note":"The workflow assumed one intent per message. The agent can handle a message that mixes two problems."},{"a":"if order.days_since < 30:","b":"under\n  POLICY.","note":"The workflow encodes policy as code; the agent reads it as instructions, so test it on edge cases."},{"a":"send_after_review(draft)","b":"issue_refund(id=2)  -> approval","note":"Both keep a human on the risky action, in different places."},{"b":"ask_customer('Which order is missing?')","note":"Asking a clarifying question is a step no one wrote into the workflow."}]}
```

A practical rule: start every project as a workflow, log where it fails, and promote only the failing part to an agent. Many production “agents” are workflows with one agentic step inside.

## Numbers to know
> [!number]
> Rules of thumb. Each agent step costs a full model call, often a second or more, and re-reads the growing history. Agents commonly use several times the tokens of a single chat turn; Anthropic reported about 4× for agents and about 15× for its multi-agent research system (2025). See [multi-agent systems](#multi-agent).

## Pitfalls and anti-patterns
> [!pitfall] Agent-washing
> Calling a single prompt an agent sets expectations it cannot meet, and calling a real agent “just a chatbot” hides the risks it carries. Describe systems by who decides the next step.

- **Autonomy without evals.** If you cannot score trajectories, you cannot tell whether more autonomy helped.
- **Skipping the leash.** Agents that can take irreversible actions need approvals and [guardrails](#guardrails-control) from day one.
- **Building the framework first.** Write the loop by hand once; then decide whether you need a framework.

## Talk like an expert
The vocabulary: **agentic system**, **workflow versus agent**, **autonomy level**, **control flow**, **who holds the pen**. Experts ask “what decides the next step?” and “what is the blast radius of a wrong step?”. The live debate is whether the distinction will fade as models get better: if a model can reliably follow a workflow written in plain language, the line between instructions and code blurs.

> [!hottake] Most things marketed as agents should be workflows, and they would work better if they were.
> **The counterargument:** hand-written workflows accrete branches for every edge case until they are harder to maintain than an agent with good tools and a clear policy. For open-ended domains, flexibility is a feature, not a risk to be engineered away.

## Check yourself
```quiz
what-is-an-agent
```

## Go deeper
- Anthropic, “Building effective agents” (December 2024).
- Yao et al., “ReAct: Synergizing Reasoning and Acting in Language Models” (2022).
- Wang et al., “A Survey on Large Language Model based Autonomous Agents” (2023), a broad map of early agent research.

## Related
- [The agent loop](#agent-loop)
- [Workflow patterns](#workflow-patterns)
- [Human in the loop](#human-in-the-loop)
- [Mental models that matter](#mental-models)
- [Evaluating agents](#evaluating-agents)
