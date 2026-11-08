---
id: agent-loop
book: 9
order: "9.2"
title: The agent loop
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [agents, loop, react]
visuals:
  - agent-loop-flow:flowchart
  - agent-loop-stepper:stepper
  - minimal-agent-walk:code-walk
  - agent-run-trace:trace
---
> [!tldr]
> An agent is a loop: call the model with the conversation so far, run any tools it asks for, append the results, and repeat until it stops asking or a budget runs out. Everything else in agent engineering is about what goes into that loop, what comes out, and how it ends.

## Why it matters
Every coding agent, research agent and support bot runs some version of this loop. If you can write it in fifty lines, you can debug any framework built on top of it, reason about its cost, and spot the failure modes before your users do. It is also the best interview question in the field: candidates who cannot sketch it have not built an agent.

## Intuition
Picture a detective with a notebook. Each round, they reread the whole notebook, decide on one action (check a file, run a test, ask a witness), write down what they found, and decide again. They stop when they can name the culprit, or when the boss says time is up. The notebook is the context; rereading it every round is why it gets expensive.

```mermaid id=agent-loop-flow title="The loop ends only when the model stops asking for tools, or the harness stops it" caption="Two exits: the model ends its turn, or the budget runs out. A loop without the second exit is a bug waiting for a bad day." alt="Flowchart: task, build context, call the model, which either requests tools or answers. Tool results are appended, the budget is checked, and the loop repeats or stops."
flowchart LR
  T([Task]) --> M{Call the model}
  M -->|tool_use| X[Run tools, append results]
  X --> B{Budget left?}
  B -->|yes| M
  B -->|no| S([Stop: report partial work])
  M -->|end_turn| A([Final answer])
```

## How it works
The loop has four parts.

**1. Context assembly.** Each call sends the system prompt, the tool definitions and the entire message history. The model is stateless: it remembers nothing between calls except what you send. See [context engineering](#context-engineering).

**2. The model call.** The model returns either text, one or more tool calls, or both. The API tells you which through a stop reason: in Anthropic’s Messages API it is `tool_use` when the model wants tools and `end_turn` when it is done. Other providers use different names for the same idea.

**3. Tool execution.** The harness, not the model, runs the tool. It validates arguments, enforces permissions, catches errors and truncates large outputs. Each result goes back as a message tied to the call’s id. See [tool design](#agent-tools).

**4. The stop decision.** The loop ends when the model stops requesting tools, when a step or token budget is spent, or when a human or a guardrail interrupts it. See [guardrails](#guardrails-control).

The cost of a run grows faster than its length, because every call re-reads everything before it. Step through a real-shaped run:

```viz
{"id":"agent-loop-stepper","component":"stepper","title":"Context grows every turn, and every call re-reads all of it","caption":"Watch the bar fill. By the last call the model reads 20,450 input tokens; across five calls it re-read 60,550 in total. That is why prompt caching and compaction matter for agents.","alt":"Stepper showing the context of a five-turn agent run growing from 4,000 to 21,350 tokens against a 25,000-token run budget.","data":"illustrative","try":"Step to turn 4 and compare the size of the tool results with the size of the model’s own messages.","frames":[
{"label":"Start","caption":"Before the first call the context holds instructions, tool definitions and the task: 4,000 tokens. Steps used: 0 of 20.","stack":{"cap":25000,"label":"Run budget","items":[{"label":"System prompt","tokens":2500,"role":"context","short":"System"},{"label":"Tool definitions","tokens":1200,"role":"tool","short":"Tools"},{"label":"Task","tokens":300,"role":"human"}]}},
{"label":"Turn 1","caption":"The model asks to read `src/parse.py`. The harness runs the tool and appends a 5,000-token file. Steps used: 1.","stack":{"cap":25000,"label":"Run budget","items":[{"label":"System prompt","tokens":2500,"role":"context","short":"System"},{"label":"Tool definitions","tokens":1200,"role":"tool","short":"Tools"},{"label":"Task","tokens":300,"role":"human"},{"label":"Model turns","tokens":450,"role":"model"},{"label":"Tool results","tokens":5000,"role":"data","short":"Results"}]}},
{"label":"Turn 2","caption":"It runs the tests. The harness returns only the last 50 lines, 1,800 tokens, instead of the full log. Steps used: 2.","stack":{"cap":25000,"label":"Run budget","items":[{"label":"System prompt","tokens":2500,"role":"context","short":"System"},{"label":"Tool definitions","tokens":1200,"role":"tool","short":"Tools"},{"label":"Task","tokens":300,"role":"human"},{"label":"Model turns","tokens":650,"role":"model"},{"label":"Tool results","tokens":6800,"role":"data","short":"Results"}]}},
{"label":"Turn 3","caption":"It reads the failing test, another 3,500 tokens. Tool results now dominate the context. Steps used: 3.","stack":{"cap":25000,"label":"Run budget","items":[{"label":"System prompt","tokens":2500,"role":"context","short":"System"},{"label":"Tool definitions","tokens":1200,"role":"tool","short":"Tools"},{"label":"Task","tokens":300,"role":"human"},{"label":"Model turns","tokens":900,"role":"model"},{"label":"Tool results","tokens":10300,"role":"data","short":"Results"}]}},
{"label":"Turn 4","caption":"It follows an import into `src/tokenize.py`: 5,000 more tokens. The model’s own messages are still under 1,200 tokens in total. Steps used: 4.","stack":{"cap":25000,"label":"Run budget","items":[{"label":"System prompt","tokens":2500,"role":"context","short":"System"},{"label":"Tool definitions","tokens":1200,"role":"tool","short":"Tools"},{"label":"Task","tokens":300,"role":"human"},{"label":"Model turns","tokens":1150,"role":"model"},{"label":"Tool results","tokens":15300,"role":"data","short":"Results"}]}},
{"label":"Turn 5","caption":"The model answers without a tool call, so the stop reason is `end_turn` and the loop exits at 21,350 tokens after five calls.","stack":{"cap":25000,"label":"Run budget","items":[{"label":"System prompt","tokens":2500,"role":"context","short":"System"},{"label":"Tool definitions","tokens":1200,"role":"tool","short":"Tools"},{"label":"Task","tokens":300,"role":"human"},{"label":"Model turns","tokens":2050,"role":"model"},{"label":"Tool results","tokens":15300,"role":"data","short":"Results"}]}}]}
```

## In practice
Here is a complete agent in about fifty lines of Python using the Anthropic SDK. Step through it to see which line implements which part of the loop.

```viz
{"id":"minimal-agent-walk","component":"code-walk","title":"Fifty lines hold the whole loop: tools, a budget, a stop rule and error handling","caption":"Each step lights the lines and the part of the loop they implement. The model id is a placeholder; everything else runs as written with the anthropic package installed.","alt":"Code walk through a minimal Python agent with two tools, a step budget, a stop condition and tool error handling.","data":"illustrative","language":"python","code":"import subprocess\nimport anthropic\n\nclient = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY\nMODEL = \"your-model-id\"         # placeholder: pick a current model\n\nTOOLS = [\n    {\"name\": \"read_file\",\n     \"description\": \"Read a UTF-8 text file from the repository. Use it for any file the task mentions.\",\n     \"input_schema\": {\"type\": \"object\",\n                      \"properties\": {\"path\": {\"type\": \"string\"}},\n                      \"required\": [\"path\"]}},\n    {\"name\": \"run_tests\",\n     \"description\": \"Run the test suite and return the last 50 lines of output.\",\n     \"input_schema\": {\"type\": \"object\", \"properties\": {}}},\n]\n\ndef run_tool(name, args):\n    if name == \"read_file\":\n        with open(args[\"path\"], encoding=\"utf-8\") as f:\n            return f.read()[:20_000]  # truncate to protect the context\n    if name == \"run_tests\":\n        p = subprocess.run([\"pytest\", \"-q\"], capture_output=True, text=True, timeout=300)\n        return \"\\n\".join((p.stdout + p.stderr).splitlines()[-50:])\n    return f\"Unknown tool: {name}\"\n\ndef agent(task, max_steps=20):\n    messages = [{\"role\": \"user\", \"content\": task}]\n    for _ in range(max_steps):  # a budget, so the loop always ends\n        resp = client.messages.create(\n            model=MODEL, max_tokens=4096, tools=TOOLS, messages=messages,\n            system=\"You are a careful engineer. Investigate before you answer.\")\n        messages.append({\"role\": \"assistant\", \"content\": resp.content})\n        if resp.stop_reason != \"tool_use\":  # no tool requested: done\n            return \"\".join(b.text for b in resp.content if b.type == \"text\")\n        results = []\n        for block in resp.content:\n            if block.type != \"tool_use\":\n                continue\n            try:\n                out, err = run_tool(block.name, block.input), False\n            except Exception as e:  # errors are information, not crashes\n                out, err = f\"{type(e).__name__}: {e}\", True\n            results.append({\"type\": \"tool_result\", \"tool_use_id\": block.id,\n                            \"content\": out, \"is_error\": err})\n        messages.append({\"role\": \"user\", \"content\": results})\n    return \"Stopped: step budget used up. Partial findings are in the transcript.\"\n\nprint(agent(\"Find out why test_parse fails and explain the root cause.\"))","diagram":{"w":360,"h":300,"nodes":[{"id":"user","label":"User task","role":"human","x":110,"y":0,"w":140,"h":44},{"id":"loop","label":"Harness loop","sub":"budget, stop rule","role":"agent","x":100,"y":80,"w":160,"h":52},{"id":"model","label":"Model","role":"model","x":0,"y":180,"w":150,"h":50},{"id":"tools","label":"Tools","role":"tool","x":210,"y":180,"w":150,"h":50},{"id":"ctx","label":"Message history","role":"context","x":100,"y":256,"w":160,"h":44}],"edges":[{"from":"user","to":"loop","label":"task"},{"from":"loop","to":"model"},{"from":"model","to":"loop","curve":34,"label":"tool_use"},{"from":"loop","to":"tools"},{"from":"tools","to":"ctx","label":"results"}]},
"steps":[{"lines":[1,5],"node":"model","note":"Create a client and name the model. Keep the id in config so upgrades are one-line changes."},{"lines":[7,16],"node":"tools","note":"Tool definitions are prompts. The description tells the model when to use the tool, and the schema constrains its arguments."},{"lines":[18,25],"node":"tools","note":"The harness, not the model, executes tools. Truncating output here protects every later call from a huge file."},{"lines":[27,29],"node":"loop","note":"The message list is the agent’s whole memory. The `for` loop with `max_steps` guarantees the run ends."},{"lines":[30,33],"node":["model","ctx"],"note":"Each call sends the full history. The assistant’s reply, including its tool requests, is appended verbatim."},{"lines":[34,35],"node":"loop","note":"The stop rule: if the model did not ask for a tool, return its text. A `max_tokens` stop also lands here, so check for it in production."},{"lines":[36,46],"node":["tools","ctx"],"note":"Run every requested tool, turn exceptions into error results the model can read, and send all results back in one user message."},{"lines":[47,49],"node":"loop","note":"The budget exit. Say that the run stopped early, so callers never mistake a timeout for an answer."}]}
```

> [!try]
> Open the [agent-loop playground](#tool-agent-loop) and change the step budget in your head: which turn would a budget of three cut off, and what would the user see?

A few decisions to make before shipping:

- **Budgets.** Set a step limit and a token or cost limit. A starting point: 20 steps for interactive tasks, more for background jobs with checkpoints. See [long-running agents](#long-running-agents).
- **Parallel tool calls.** Many models request several tools at once. Run independent calls concurrently and return all results together.
- **Streaming.** Stream text to the user while the loop runs, and show which tool is executing. See [agent UX](#agent-ux).
- **Tracing.** Record each model call and tool call as a span. When a run goes wrong you will want to see this:

```viz
{"id":"agent-run-trace","component":"trace","title":"Wall-clock time hides in tools: one test run took 45% of this agent’s time","caption":"Illustrative trace of the five-turn run above. Click a span for its tokens and duration. Model calls get slower as context grows, but the slowest single step is the test suite.","alt":"Span waterfall of an agent run with five model calls and four tool calls, totaling 14.2 seconds.","data":"illustrative","spans":[{"name":"agent.run","start":0,"dur":14200,"depth":0,"kind":"agent","note":"Five model calls, four tool calls."},{"name":"model call 1","start":0,"dur":1900,"depth":1,"kind":"model","tin":4000,"tout":450},{"name":"read_file parse.py","start":1900,"dur":60,"depth":1,"kind":"tool"},{"name":"model call 2","start":1960,"dur":1500,"depth":1,"kind":"model","tin":9450,"tout":200},{"name":"run_tests","start":3460,"dur":6400,"depth":1,"kind":"tool","note":"The slowest step. Cache test results or run a narrower test."},{"name":"model call 3","start":9860,"dur":1300,"depth":1,"kind":"model","tin":11450,"tout":250},{"name":"read_file test_parse.py","start":11160,"dur":50,"depth":1,"kind":"tool"},{"name":"model call 4","start":11210,"dur":1150,"depth":1,"kind":"model","tin":15200,"tout":250},{"name":"read_file tokenize.py","start":12360,"dur":40,"depth":1,"kind":"tool"},{"name":"model call 5","start":12400,"dur":1800,"depth":1,"kind":"model","tin":20450,"tout":900,"note":"Longest output: the final explanation."}]}
```

## Numbers to know
> [!number]
> Rules of thumb. Input tokens across a run grow roughly with the square of the number of turns when each turn adds a similar amount, because each call re-reads the history. Prompt caching typically makes repeated prefixes far cheaper than fresh input; check your provider’s current prices. Interactive agents usually take 3 to 30 steps; background coding agents can take hundreds, which requires [compaction](#context-engineering).

## Pitfalls and anti-patterns
> [!pitfall] The loop with no exit
> A loop that only stops when the model says so will eventually spin forever on a confusing error. Always enforce a step budget and a cost budget in code.

- **Throwing on tool errors.** Crashing the run on an exception wastes the model’s ability to recover. Return the error as a result marked `is_error` and let the model try something else.
- **Unbounded tool output.** One `cat` of a log file can fill the context. Truncate, paginate or summarize in the harness.
- **Treating `max_tokens` as success.** If the response was cut off, the text is incomplete. Detect it and continue or retry.
- **Hiding the loop.** If you cannot print the full transcript of a run, you cannot debug it.

## Talk like an expert
The vocabulary: **ReAct** (reason and act interleaved, from the 2022 paper by Yao and colleagues), **stop reason**, **step budget**, **trajectory** (the full sequence of calls and results), **turn** versus **step**, and **harness** for the code around the loop. Experts describe agents as “a model plus a harness” and evaluate trajectories, not just final answers. The live debate is how much logic belongs in the loop (planning steps, reflection, verification) versus leaving the model to decide, as models get better at long tasks.

> [!hottake] The best agent architecture is a while loop and good tools.
> **The counterargument:** for long or high-stakes tasks, explicit structure such as plans, checkpoints, verifiers and human approvals measurably improves reliability, and production needs durable execution that a bare loop does not give you.

## Check yourself
```quiz
agent-loop
```

## Go deeper
- Yao et al., “ReAct: Synergizing Reasoning and Acting in Language Models” (2022).
- Anthropic, “Building effective agents” (December 2024).
- Anthropic’s tool use documentation: search “tool use” on docs.claude.com for the current message format.

## Related
- [What is an agent?](#what-is-an-agent)
- [Tool use and tool design](#agent-tools)
- [Context engineering](#context-engineering)
- [Anatomy of an agent harness](#harness-anatomy)
- [Agent failure modes](#agent-failure-modes)
- [Build your own harness](#build-your-own-harness)
- [Chat Completions, Responses and Messages](#api-shapes)
- [Language agents: research lineage and the CoALA framework](#agent-research-lineage)
