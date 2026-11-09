---
id: multi-agent-patterns
book: 9
order: "9.7.1"
title: Multi-agent orchestration patterns
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [multi-agent, orchestration, handoffs, debate, design-patterns]
visuals:
  - multi-agent-patterns-gallery:diagram
  - multi-agent-patterns-context:compare
  - multi-agent-patterns-magentic:stepper
  - multi-agent-patterns-chooser:tree
prerequisites: [multi-agent, workflow-patterns]
---
> [!tldr]
> Multi-agent design guides name a handful of shapes: sequential, concurrent, group chat with its maker-checker loop, handoff, magentic, and a manager that calls agents as tools. Each shape fixes who picks the next agent and what context it sees. Those two choices predict where it works and how it breaks.

## Why it matters
Design reviews and frameworks speak in these names: Microsoft’s [orchestration patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns) guide lists five, OpenAI’s [practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf) two. Each shape invites typical failures. Cemri et al., [“Why Do Multi-Agent LLM Systems Fail?”](https://arxiv.org/abs/2503.13657) (2025), defined 14 failure modes in three categories (system design, inter-agent misalignment and task verification) and used them to annotate more than 1,600 traces from seven frameworks. Know which shape invites which, and design the guard in.

## Intuition
Think of a hospital. A lab passes a sample from station to station (sequential). Three specialists read one scan alone, and a lead merges their reports (concurrent). At a tumor board, a chair picks who speaks (group chat). The emergency desk sends you, with your chart, to cardiology (handoff). An attending keeps your case and reads only the written replies to consults (manager). A case manager rewrites the care plan when treatment stalls (magentic).

Two questions separate them: who picks the next agent, and what travels with the work (the whole history, a filtered history or a short brief).

```viz
{"id":"multi-agent-patterns-gallery","component":"diagram","title":"Six shapes, told apart by who picks the next agent and what it gets to see","caption":"Switch tabs to compare the patterns. Each note gives the aliases practitioners use and the main risk. Illustrative.","alt":"Gallery of six multi-agent orchestration patterns: sequential, concurrent, group chat, handoff, manager with agents as tools, and magentic.","data":"illustrative","try":"Open Handoff, then Manager: who answers the user at the end of each?","depicts":"Pattern names from Microsoft’s Azure Architecture Center guide and OpenAI’s practical guide to building agents, as of November 2026","w":560,"h":220,"variants":[
{"name":"Sequential","note":"**Code** fixes the order, and each agent gets the previous agent’s output. Also called a pipeline, prompt chaining or linear delegation. Good for draft, review, polish. Risk: an early mistake flows downstream unless a stage checks it.","nodes":[{"id":"in","label":"Input","role":"human","x":0,"y":82,"w":80,"h":56},{"id":"a1","label":"Drafter","role":"agent","x":100,"y":82,"w":115,"h":56},{"id":"a2","label":"Reviewer","role":"agent","x":235,"y":82,"w":115,"h":56},{"id":"a3","label":"Editor","role":"agent","x":370,"y":82,"w":115,"h":56},{"id":"out","label":"Result","role":"human","x":500,"y":82,"w":60,"h":56,"glyph":false}],"edges":[{"from":"in","to":"a1"},{"from":"a1","to":"a2"},{"from":"a2","to":"a3"},{"from":"a3","to":"out"}]},
{"name":"Concurrent","note":"The same input goes to independent agents at once, and code or a model combines, compares or votes on the results. Also called parallel, fan-out/fan-in, scatter-gather or map-reduce. Agents never see each other’s work. Risk: contradictory results with no rule to settle them.","nodes":[{"id":"in","label":"Input","role":"human","x":0,"y":85,"w":80,"h":50},{"id":"w1","label":"Technical view","role":"agent","x":120,"y":0,"w":170,"h":50},{"id":"w2","label":"Financial view","role":"agent","x":120,"y":85,"w":170,"h":50},{"id":"w3","label":"Risk view","role":"agent","x":120,"y":170,"w":170,"h":50},{"id":"agg","label":"Aggregate","sub":"merge or vote","x":335,"y":78,"w":130,"h":64},{"id":"out","label":"Result","role":"human","x":495,"y":85,"w":65,"h":50,"glyph":false}],"edges":[{"from":"in","to":"w1"},{"from":"in","to":"w2"},{"from":"in","to":"w3"},{"from":"w1","to":"agg"},{"from":"w2","to":"agg"},{"from":"w3","to":"agg"},{"from":"agg","to":"out"}]},
{"name":"Group chat","note":"Agents post to one accumulating thread that all of them read, and a **chat manager** picks who speaks next: round-robin, a model’s choice or custom code. Also called roundtable, council or multi-agent debate. A **maker-checker** loop is the two-agent, turn-based form. Risk: a conversation that loops; keep it to three or fewer agents.","nodes":[{"id":"mgr","label":"Chat manager","sub":"picks next speaker","role":"agent","x":0,"y":80,"w":170,"h":60},{"id":"thread","label":"Shared thread","sub":"all agents read it","role":"context","x":205,"y":80,"w":170,"h":60},{"id":"a1","label":"Writer","role":"agent","x":420,"y":0,"w":140,"h":50},{"id":"a2","label":"Reviewer","role":"agent","x":420,"y":85,"w":140,"h":50},{"id":"a3","label":"Fact checker","role":"agent","x":420,"y":170,"w":140,"h":50}],"edges":[{"from":"mgr","to":"thread","label":"next"},{"from":"thread","to":"a1","both":true},{"from":"thread","to":"a2","both":true},{"from":"thread","to":"a3","both":true}]},
{"name":"Handoff","note":"One agent is active at a time. It answers, or **transfers control** to a better-suited specialist, usually with the conversation so far. Also called routing, triage, transfer, dispatch or delegation; LangGraph’s peer version is a **swarm**. Risk: agents bouncing the task back and forth.","nodes":[{"id":"user","label":"User","role":"human","x":0,"y":85,"w":80,"h":50},{"id":"triage","label":"Triage","role":"agent","x":115,"y":80,"w":130,"h":60},{"id":"billing","label":"Billing","role":"agent","x":290,"y":0,"w":140,"h":50},{"id":"tech","label":"Tech support","role":"agent","x":290,"y":85,"w":140,"h":50},{"id":"person","label":"Human agent","role":"human","x":290,"y":170,"w":140,"h":50},{"id":"reply","label":"Reply","role":"human","x":470,"y":85,"w":90,"h":50,"glyph":false}],"edges":[{"from":"user","to":"triage"},{"from":"triage","to":"billing","label":"handoff"},{"from":"triage","to":"tech"},{"from":"tech","to":"person","label":"handoff"},{"from":"billing","to":"reply","label":"answers"}]},
{"name":"Manager","note":"The manager keeps the conversation and calls specialists like tools. Each specialist sees only the input the manager writes and returns its final output. Also called a supervisor, or a main agent with subagents; a supervisor of supervisors makes a **hierarchy**. Risk: a brief that leaves out what the specialist needed.","nodes":[{"id":"user","label":"User","role":"human","x":0,"y":85,"w":80,"h":50},{"id":"mgr","label":"Manager","sub":"owns the answer","role":"agent","x":125,"y":80,"w":160,"h":60},{"id":"s1","label":"Research","sub":"as a tool","role":"agent","x":380,"y":0,"w":150,"h":50},{"id":"s2","label":"Billing","sub":"as a tool","role":"agent","x":380,"y":85,"w":150,"h":50},{"id":"s3","label":"Policy","sub":"as a tool","role":"agent","x":380,"y":170,"w":150,"h":50}],"edges":[{"from":"user","to":"mgr","label":"asks"},{"from":"mgr","to":"user","curve":45,"style":"dashed","label":"answers"},{"from":"mgr","to":"s1","label":"tool call"},{"from":"mgr","to":"s2"},{"from":"mgr","to":"s3"},{"from":"s3","to":"mgr","curve":-30,"style":"dashed","label":"final output"}]},
{"name":"Magentic","note":"A manager builds a **task ledger** of facts and a plan, then loops: choose an agent, record progress, re-plan when stuck. Its agents typically use tools that change external systems. Also called dynamic orchestration, task-ledger-based orchestration or adaptive planning. It comes from Magentic-One. Risk: slow to converge, and stalls on ambiguous goals.","nodes":[{"id":"in","label":"Task","role":"human","x":0,"y":85,"w":80,"h":50},{"id":"mgr","label":"Manager","sub":"plans, re-plans","role":"agent","x":110,"y":40,"w":150,"h":60},{"id":"led","label":"Ledgers","sub":"task + progress","role":"data","x":110,"y":150,"w":150,"h":56},{"id":"a1","label":"Web agent","role":"agent","x":305,"y":0,"w":135,"h":50},{"id":"a2","label":"File agent","role":"agent","x":305,"y":85,"w":135,"h":50},{"id":"a3","label":"Coder","role":"agent","x":305,"y":170,"w":135,"h":50},{"id":"ext","label":"Systems","role":"external","x":470,"y":85,"w":90,"h":50,"glyph":false}],"edges":[{"from":"in","to":"mgr"},{"from":"mgr","to":"led","both":true},{"from":"mgr","to":"a1"},{"from":"mgr","to":"a2"},{"from":"mgr","to":"a3"},{"from":"a1","to":"ext"},{"from":"a2","to":"ext"},{"from":"a3","to":"ext"}]}]}
```

## How it works
**Sequential** orchestration runs agents in an order that code fixes: [prompt chaining](#workflow-patterns) with agents as stages. Microsoft’s guide advises against it when work needs backtracking.

**Concurrent** orchestration sends one task to independent agents and combines their results. It is the multi-agent form of parallelization in Anthropic’s [“Building effective agents”](https://www.anthropic.com/engineering/building-effective-agents).

**Group chat** puts agents in one shared thread, and a chat manager picks each next speaker. In Microsoft Agent Framework’s [group chat](https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/group-chat), every participant sees the full conversation. Its two-agent form is the **maker-checker loop**: a maker proposes, a checker tests against written criteria, and approval or an iteration cap ends it. Built from plain LLM calls instead of agents, the same loop is Anthropic’s evaluator-optimizer workflow.

**Handoff** gives full control to one specialist at a time. In the OpenAI Agents SDK (as of November 2026), a [handoff](https://openai.github.io/openai-agents-python/handoffs/) is a tool such as `transfer_to_refund_agent`, and the new agent sees the whole conversation unless an `input_filter` trims it; LangGraph’s [swarm](https://github.com/langchain-ai/langgraph-swarm-py) does the same. If the first message shows the right agent, Microsoft’s guide prefers plain routing.

**Manager or decentralized.** In OpenAI’s guide, a manager’s edges are tool calls and decentralized edges are handoffs. A specialist called through [`Agent.as_tool()`](https://openai.github.io/openai-agents-python/tools/) sees only the manager’s input, not the conversation, and returns its final output: orchestrator and workers, with agents as workers. That isolation is what [multi-agent systems](#multi-agent) rely on.

```viz
{"id":"multi-agent-patterns-context","component":"compare","title":"A tool call sends the specialist a brief; a handoff sends it the whole conversation","caption":"Illustrative contexts for one request, using the defaults the OpenAI Agents SDK documents as of November 2026. Hover or focus a marked passage.","alt":"Side-by-side comparison of what a billing specialist sees when called as a tool by a manager and when it receives a handoff from a triage agent.","data":"illustrative","depicts":"OpenAI Agents SDK defaults, as of November 2026","a":{"title":"Manager: specialist called as a tool","text":"What the billing specialist sees:\n  system: You check billing records.\n  input:  Find duplicate charges on\n          this account in the last\n          7 days. Return charge ids and\n          whether a refund is allowed.\n\n  (no chat history, no other tool results)\n\nIt returns its final output:\n  \"Two charges; the second is a\n   duplicate; refund allowed.\"\nThe manager writes the reply to the user."},"b":{"title":"Handoff: specialist takes over","text":"What the billing agent sees:\n  system: You resolve billing issues.\n  user: I moved to the annual plan\n        last week.\n  triage: Thanks. How can I help?\n  user: Why was I charged twice?\n  tool call: lookup_account(user)\n  tool result: 2 charges, plan=annual\n  triage: transfer_to_billing_agent()\n\nThe billing agent replies to the user\ndirectly and owns the rest of the turn."},"links":[{"a":"(no chat history, no other tool results)","b":"user: I moved to the annual plan","note":"A specialist called through Agent.as_tool() does not inherit the parent’s conversation. After a handoff, the new agent sees the entire previous conversation by default."},{"a":"Find duplicate charges on","b":"user: Why was I charged twice?","note":"The brief is the specialist’s only view of the task. Anything the manager leaves out, such as the plan change, never reaches it."},{"b":"tool call: lookup_account(user)","note":"The handoff_filters.remove_all_tools filter drops structured tool items like these before the next agent runs. It does not redact text already copied into messages."},{"a":"The manager writes the reply to the user.","b":"directly and owns the rest of the turn.","note":"Who owns the answer: the manager synthesizes; after a handoff, the specialist speaks for the system."}]}
```

**Supervisors** are managers that route work; stacked, they form a hierarchy. LangGraph’s [supervisor library](https://github.com/langchain-ai/langgraph-supervisor-py) let a worker return its full history or only its last message. As of November 2026 it is archived in favor of supervisors built from tool calls.

**Magentic** orchestration comes from Fourney et al., [“Magentic-One: A Generalist Multi-Agent System for Solving Complex Tasks”](https://arxiv.org/abs/2411.04468) (2024). Its Orchestrator keeps a task ledger and a progress ledger. In the paper’s ablation, swapping it for a plain speaker selector with no ledgers, planning or loop detection cut performance on the GAIA validation set by 31%.

```viz
{"id":"multi-agent-patterns-magentic","component":"stepper","title":"Magentic orchestration plans in an outer loop and checks progress at every step in an inner loop","caption":"Illustrative run on the loop structure of Magentic-One (Fourney et al., 2024). Step through to see when the plan gets rewritten.","alt":"Stepper through a Magentic-One run: the Orchestrator writes a task ledger, fills a progress ledger at each step, delegates to agents, detects a stall and re-plans.","data":"illustrative","try":"Before step 5, predict what the Orchestrator does when the same step fails twice.","depicts":"Magentic-One, Fourney et al. (2024)","diagram":{"w":600,"h":210,"nodes":[{"id":"task","label":"Task ledger","sub":"facts and plan","role":"data","x":0,"y":26,"w":170,"h":56},{"id":"orch","label":"Orchestrator","role":"agent","x":215,"y":26,"w":170,"h":56},{"id":"prog","label":"Progress ledger","sub":"checked each step","role":"data","x":430,"y":26,"w":170,"h":56},{"id":"web","label":"WebSurfer","sub":"browser","role":"agent","x":0,"y":150,"w":138,"h":56},{"id":"file","label":"FileSurfer","sub":"local files","role":"agent","x":154,"y":150,"w":138,"h":56},{"id":"coder","label":"Coder","sub":"writes code","role":"agent","x":308,"y":150,"w":138,"h":56},{"id":"term","label":"Terminal","sub":"runs code","role":"agent","x":462,"y":150,"w":138,"h":56}],"edges":[{"from":"orch","to":"task","both":true,"label":"outer loop","dy":-24},{"from":"orch","to":"prog","both":true,"label":"inner loop","dy":-24},{"from":"orch","to":"web"},{"from":"orch","to":"file"},{"from":"orch","to":"coder"},{"from":"orch","to":"term"}]},
"frames":[
{"label":"Task in","highlight":["orch"],"caption":"The Orchestrator receives a task. Its team in Magentic-One: WebSurfer drives a browser, FileSurfer reads local files, Coder writes code and ComputerTerminal runs it."},
{"label":"Task ledger","highlight":["orch","task"],"edges":["orch>task"],"caption":"Outer loop. It writes a task ledger: given or verified facts, facts to look up, facts to derive and educated guesses, then a plan that assigns steps to agents.","code":"TASK LEDGER (illustrative)\ngiven:    requirements.txt is attached\nlook up:  the license of each library\nderive:   which licenses conflict with ours\nguesses:  most are permissive\nplan:     1. FileSurfer: list the libraries\n          2. WebSurfer: find each license\n          3. Coder: tabulate and flag conflicts"},
{"label":"Progress ledger","highlight":["orch","prog"],"edges":["orch>prog"],"caption":"Inner loop, every step. The Orchestrator answers five questions: is the request satisfied, is the team looping, is it making progress, who speaks next, and with what instruction.","code":"PROGRESS LEDGER (illustrative)\nrequest satisfied?  no\nlooping?            no\nmaking progress?    yes\nnext speaker:       FileSurfer\ninstruction:        List every library in requirements.txt"},
{"label":"Delegate","highlight":["orch","file"],"edges":["orch>file"],"caption":"One agent acts on one instruction and reports back. The Orchestrator answers the five questions again before it picks the next speaker."},
{"label":"Stall","highlight":["orch","web","prog"],"edges":["orch>web"],"caption":"WebSurfer hits the same dead end again. Looping or a lack of progress raises a stall counter; while it stays under a small threshold (“≤ 2” in the paper’s experiments), the inner loop goes on.","code":"looping?            yes\nmaking progress?    no\nstall counter:      over the threshold"},
{"label":"Re-plan","highlight":["orch","task"],"edges":["orch>task"],"caption":"The Orchestrator breaks out to the outer loop. It reflects on what went wrong, updates the facts and guesses and writes a new plan. Every agent clears its context and resets, then the inner loop restarts."},
{"label":"Finish","highlight":["orch","prog"],"caption":"The run ends when the Orchestrator judges the request satisfied, or at a limit on attempts or time. Magentic-One’s error analysis also logged an orchestrator concluding while necessary criteria were unverified, so add a completion check outside the model where you can."}]}
```

**Debate and mixtures.** In multi-agent debate, model instances critique each other’s answers over rounds (Du et al., [“Improving Factuality and Reasoning in Language Models through Multiagent Debate”](https://arxiv.org/abs/2305.14325), 2023). Liang et al., [“Encouraging Divergent Thinking in Large Language Models through Multi-Agent Debate”](https://arxiv.org/abs/2305.19118) (2023), add a judge and name the problem debate targets, **degeneration of thought**: a confident model stops finding new ideas by reflecting alone. Wang et al., [“Mixture-of-Agents Enhances Large Language Model Capabilities”](https://arxiv.org/abs/2406.04692) (2024), stack layers of agents, each reading all outputs of the layer before.

**Role-play and SOPs.** CAMEL pairs an AI user with an AI assistant and reports role flipping and message loops (Li et al., [“CAMEL: Communicative Agents for ‘Mind’ Exploration of Large Language Model Society”](https://arxiv.org/abs/2303.17760), 2023). MetaGPT turns standardized operating procedures into an assembly line of roles (Hong et al., [“MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework”](https://arxiv.org/abs/2308.00352), 2023).

## In practice
Start with one agent: OpenAI’s guide says to maximize it first, and to split when prompts fill with conditionals or similar tools get confused. The OpenAI Agents SDK has [primitives](#agent-sdk-primitives) for both shapes:

```python
# pip install openai-agents; set OPENAI_API_KEY in the environment
from agents import Agent, Runner, handoff
from agents.extensions import handoff_filters

billing = Agent(name="Billing agent", instructions="Resolve billing issues.", model="<model-id>")
research = Agent(name="Research agent", instructions="Answer with sources.", model="<model-id>")

# Manager pattern: the specialist is a tool. It sees only the input the
# manager writes, and its final output comes back as the tool result.
manager = Agent(
    name="Manager",
    instructions="Answer the user. Use research_tool for facts you need.",
    model="<model-id>",
    tools=[research.as_tool(tool_name="research_tool",
                            tool_description="Look up facts and cite sources.")],
)

# Decentralized pattern: triage hands off control. The billing agent would see
# the whole conversation; this filter drops earlier tool calls and results.
triage = Agent(
    name="Triage agent",
    instructions="Send billing questions to the billing agent.",
    model="<model-id>",
    handoffs=[handoff(agent=billing, input_filter=handoff_filters.remove_all_tools)],
)

result = Runner.run_sync(triage, "Why was I charged twice this month?")
print(result.last_agent.name, "->", result.final_output)
```

LangGraph builds the same shapes as [graphs over shared state](#graph-workflow-runtimes). As of November 2026, Microsoft Agent Framework ships the guide’s five patterns as built-in [orchestrations](https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/), and the [AutoGen](https://github.com/microsoft/autogen) README marks that project archived and no longer maintained, and points new users to Agent Framework.

- **Decide context per edge.** Microsoft’s guide offers the full raw context, a compacted summary, or only a new instruction set. Pass the least that works ([context engineering](#context-engineering)).
- **Give every loop an objective stop:** written criteria, a message cap and a [human](#human-in-the-loop) fallback. AutoGen’s [selector group chat](https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/selector-group-chat.html) example stops on “TERMINATE” or after 25 messages. In the MAST study, adding a high-level objective check to ChatDev raised task success on a 32-task ProgramDev set from 25.0% to 40.6%.
- **Agents as separate services** talk over a protocol such as [A2A](#a2a).

```viz
{"id":"multi-agent-patterns-chooser","component":"tree","title":"Pick the shape from the task, then guard the failure it invites","caption":"Expand the branch that matches your task. Each leaf names a pattern and the guard it needs most. Illustrative decision rules drawn from the sources in this chapter.","alt":"Decision tree for choosing a multi-agent orchestration pattern from the shape of the task, with the main guard for each pattern.","data":"illustrative","open":2,"root":{"label":"Can one agent with good tools do the task reliably?","children":[{"label":"Yes: stay single-agent","link":"#agent-loop"},{"label":"No: do you know the steps in advance?","children":[{"label":"Yes: does each step need the previous one?","children":[{"label":"Yes: sequential. Guard: check output between stages"},{"label":"No: concurrent. Guard: a rule for conflicting results"}]},{"label":"No: what does the work need most?","children":[{"label":"One voice for the user: manager with agents as tools. Guard: complete briefs","link":"#multi-agent"},{"label":"The right specialist to take over: handoff. Guard: a hop limit and a history filter"},{"label":"Several viewpoints or a review: group chat or maker-checker. Guard: three or fewer agents, written criteria, an iteration cap","link":"#llm-as-judge"},{"label":"An open-ended plan with tools: magentic. Guard: a stall limit and a completion check outside the model"}]}]}]}}
```

## Numbers to know
> [!number]
> Rules of thumb, each from the source named. Keep a group chat to three or fewer agents (Microsoft’s guide). Tool count alone does not force a split: OpenAI’s guide reports setups that handle more than 15 distinct tools, and others that struggle with fewer than 10 overlapping ones. In LangChain’s [multi-agent docs](https://docs.langchain.com/oss/python/langchain/multi-agent), one worked request that spans three domains costs about 9K tokens with subagents and 14K or more with handoffs (as of November 2026).

## Pitfalls and anti-patterns
> [!pitfall] A group chat with no finish line
> Agents keep agreeing or rephrasing until the budget runs out: in MAST terms, step repetition and being unaware of termination conditions ([agent failure modes](#agent-failure-modes)). Give the chat manager a checkable completion test, cap the messages and keep the group small.

> [!pitfall] Handoffs that carry everything, or nothing
> A default handoff copies the whole history, including tool output the next agent does not need. A strict filter or a terse brief drops the user’s constraint instead. Decide what crosses each edge, and check it in traces.

- **Handoff ping-pong.** Microsoft’s guide lists infinite handoff loops among the pattern’s main risks. Count hops.
- **Debate without a baseline.** Compare it with sampling and voting at equal cost ([test-time search](#test-time-search)).

## Talk like an expert
The vocabulary: **fan-out/fan-in**, **chat manager**, **maker-checker**, **agents as tools**, **swarm**, **task ledger**, **progress ledger**. Experts describe a design by control and context, for example a manager with agents as tools, whose workers get briefs and return summaries.

The live debate is whether to split at all. Anthropic’s multi-agent research system (a Claude Opus 4 lead with Claude Sonnet 4 subagents) beat single-agent Claude Opus 4 by 90.2% on an internal research eval, yet Anthropic says domains where all agents must share context fit poorly ([June 2025](https://www.anthropic.com/engineering/multi-agent-research-system)). Cognition’s Walden Yan argues that agents must share full traces, most simply by using one single-threaded linear agent ([“Don’t Build Multi-Agents”](https://cognition.com/blog/dont-build-multi-agents), June 2025). Both hinge on shared context.

> [!hottake] Multi-agent debate is self-consistency with extra steps.
> Smit et al., [“Should we be going MAD? A Look at Multi-Agent Debate Strategies for LLMs”](https://arxiv.org/abs/2311.17371) (2023), found that debate does not reliably beat self-consistency or ensembling. **The counterargument:** in the same study, tuning hyperparameters made several debate systems, Multi-Persona among them, perform better, and the authors conclude that debate is more sensitive to its settings rather than inherently worse.

## Check yourself
```quiz
multi-agent-patterns
```

## Go deeper
- Microsoft, [“AI agent orchestration patterns”](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns), Azure Architecture Center (updated 2026).
- Fourney et al., [“Magentic-One: A Generalist Multi-Agent System for Solving Complex Tasks”](https://arxiv.org/abs/2411.04468) (2024).
- Cemri et al., [“Why Do Multi-Agent LLM Systems Fail?”](https://arxiv.org/abs/2503.13657) (2025).

## Related
- [Multi-agent systems](#multi-agent)
- [Workflow patterns](#workflow-patterns)
- [Agent SDK primitives](#agent-sdk-primitives)
- [Graph workflow runtimes](#graph-workflow-runtimes)
- [Agent failure modes](#agent-failure-modes)
- [A2A](#a2a)
- [Playbook: Google: migrating TensorFlow models to JAX with a multi-agent system](#google-tensorflow-to-jax-migration-agents)
