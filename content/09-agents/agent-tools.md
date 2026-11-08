---
id: agent-tools
book: 9
order: "9.3"
title: Tool use and tool design
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [tools, function-calling, aci]
visuals:
  - tool-roundtrip:sequence
  - tool-def-compare:compare
  - tool-budget-calculator:calculator
---
> [!tldr]
> A tool is a function the model can ask the harness to run. The model only sees the tool’s name, description and schema, so those are prompts, and designing them well is the highest-leverage work in agent engineering.

## Why it matters
Agents fail at tools more often than at reasoning: the wrong tool, malformed arguments, a result too large to read, an error message that teaches nothing. Teams that rewrite tool descriptions and outputs often see bigger gains than from switching models. Anthropic’s engineering write-ups on SWE-bench and on writing tools for agents both report spending more time on the agent-computer interface than on the prompt.

## Intuition
Tools are the user interface you design for a model. A human gets buttons, labels and error dialogs; a model gets a name, a description, a JSON schema and whatever text comes back. If a smart new colleague could not use your tool from its documentation alone, neither can the model.

```viz
{"id":"tool-roundtrip","component":"sequence","title":"The model never runs a tool: it asks, the harness acts, and the result comes back as a message","caption":"Step through one round trip and tap a message to see its payload. Notice that the network call in step 4 is made by your code, with your credentials and your checks.","alt":"Sequence diagram of a tool call between a user, the harness, the model and a weather API, with JSON payloads.","data":"illustrative","depicts":"Anthropic Messages API shapes, simplified","try":"Tap message 3 and find the id that message 6 must echo back.","actors":[{"id":"user","label":"User","role":"human"},{"id":"app","label":"Harness","role":"agent"},{"id":"model","label":"Model","role":"model"},{"id":"api","label":"Weather API","role":"external"}],
"messages":[
{"from":"user","to":"app","label":"Question","payload":"What's the weather in Lisbon tomorrow?","note":"The user asks in plain language."},
{"from":"app","to":"model","label":"messages + tools","payload":{"tools":[{"name":"get_forecast","description":"Daily forecast for a city. Use for any weather question about a specific day.","input_schema":{"type":"object","properties":{"city":{"type":"string"},"date":{"type":"string","description":"YYYY-MM-DD"}},"required":["city","date"]}}],"messages":[{"role":"user","content":"What's the weather in Lisbon tomorrow?"}]},"note":"The harness sends the conversation and every tool definition. Definitions cost tokens on every call."},
{"from":"model","to":"app","label":"tool_use","kind":"response","payload":{"stop_reason":"tool_use","content":[{"type":"text","text":"Let me check the forecast."},{"type":"tool_use","id":"toolu_01","name":"get_forecast","input":{"city":"Lisbon","date":"2026-11-04"}}]},"note":"The model asks for a tool by name with arguments that match the schema. It has not run anything."},
{"from":"app","to":"api","label":"GET /forecast","payload":"GET /forecast?city=Lisbon&date=2026-11-04","note":"Your code validates the arguments, checks permissions and makes the real call."},
{"from":"api","to":"app","label":"200 OK","kind":"response","payload":{"high_c":19,"low_c":13,"rain_probability":0.2},"note":"The raw result. Large results should be trimmed before they reach the model."},
{"from":"app","to":"model","label":"tool_result","payload":{"role":"user","content":[{"type":"tool_result","tool_use_id":"toolu_01","content":"{\"high_c\": 19, \"low_c\": 13, \"rain_probability\": 0.2}"}]},"note":"The result goes back tied to the call’s id. Errors go back the same way, flagged with is_error."},
{"from":"model","to":"app","label":"end_turn","kind":"response","payload":{"stop_reason":"end_turn","content":[{"type":"text","text":"Tomorrow in Lisbon: 13 to 19 °C with a 20% chance of rain."}]},"note":"No more tool requests, so the loop ends."},
{"from":"app","to":"user","label":"Answer","kind":"response","payload":"Tomorrow in Lisbon: 13 to 19 °C with a 20% chance of rain.","note":"The harness streams the final text to the user."}]}
```

## How it works
A tool definition has three parts, and each one is read by the model.

**Name.** Short, specific and verb-first: `search_tickets`, not `search`. Namespacing (`github_create_issue`) helps when many tools are loaded.

**Description.** What the tool does, when to use it, when not to, what it returns, and which tool to call next. This is the most underrated text in your system.

**Input schema.** A JSON Schema for the arguments. Use enums for closed sets, bounds for numbers, defaults, and a description with an example for any argument that is easy to get wrong. Many APIs can enforce the schema with constrained decoding, which removes malformed calls entirely; see [structured outputs](#structured-outputs).

The **result** is the other half of the interface. Return what the model needs to take the next step, in a compact, readable form: identifiers it can pass to the next tool, a short excerpt rather than the full object, and a clear error message that says what to try instead.

```viz
{"id":"tool-def-compare","component":"compare","title":"The same tool, described for a human skimming code and for a model that reads every word","caption":"Hover or focus a marked passage to see its counterpart and why it matters.","alt":"Side-by-side comparison of a vague search tool definition and a well-designed search_tickets definition.","data":"illustrative","a":{"title":"Before: written for nobody","text":"name: search\ndescription: Searches.\nparameters:\n  q: string\n  n: integer"},"b":{"title":"After: written for the model","text":"name: search_tickets\ndescription: Search support tickets by keyword. Use it before\n  answering any question about a customer's issue. Returns at\n  most `limit` tickets, newest first: id, title, status and a\n  200-character excerpt. For the full thread, call get_ticket.\nparameters:\n  query: string, required. Keywords such as 'refund double\n    charge', not a full question.\n  status: one of open | pending | closed | any (default open)\n  limit: integer from 1 to 25 (default 10)"},"links":[{"a":"name: search","b":"name: search_tickets","note":"A name is part of the prompt. Say what it searches, so it is not confused with other search tools."},{"a":"Searches.","b":"Use it before\n  answering any question about a customer's issue.","note":"Say when to use the tool, not only what it does."},{"a":"q: string","b":"query: string, required. Keywords such as 'refund double\n    charge', not a full question.","note":"Readable argument names and an example cut malformed calls."},{"a":"n: integer","b":"limit: integer from 1 to 25 (default 10)","note":"Bound the output so one call cannot flood the context."},{"b":"For the full thread, call get_ticket.","note":"Point to the next tool. Agents chain tools better when tools say how they connect."}]}
```

## In practice
Design rules that hold across providers:

- **Fewer, better tools.** Consolidate: one `search_tickets` with filters beats five near-duplicates. Overlapping tools are the top cause of wrong-tool errors.
- **Return identifiers and excerpts.** Give the model handles it can pass to the next call, and let it ask for detail.
- **Paginate and truncate in the harness.** Put a token cap on every result and say when you truncated (“showing 10 of 240; refine the query”).
- **Errors as instructions.** “No ticket with id 4821. Ids are numeric; call search_tickets to find one.” beats a stack trace.
- **Idempotency and side effects.** Mark tools that change the world, require confirmation for destructive ones, and make retries safe with idempotency keys. See [human in the loop](#human-in-the-loop).
- **Code as action.** Some agents let the model write code that calls tools (the CodeAct approach) instead of one JSON call at a time. It composes loops and filters in one step and keeps intermediate data out of context, at the price of needing a [sandbox](#sandboxes).

Every definition you load costs tokens on every call. With dozens of [MCP](#mcp-primitives) servers that adds up fast, which is why harnesses now search for tools and load them on demand:

```viz
{"id":"tool-budget-calculator","component":"calculator","title":"Tool definitions are a tax on every request, and fifty tools can take a tenth of the window","caption":"Enter your own numbers. Prices are placeholders: use your provider’s current input price. Cached prefixes cost much less, which is why tool definitions belong in the cached part of the prompt.","alt":"Calculator for the tokens, share of context window and cost taken by tool definitions.","data":"formula","outputs":[{"id":"defs","label":"Definition tokens per request","expr":"tools * tokens_per_tool","unit":"tokens","main":true},{"id":"share","label":"Share of the context window","expr":"defs / window","unit":"pct"},{"id":"cost","label":"Cost of definitions per 1,000 uncached requests","expr":"defs * 1000 * usd_per_mtok / 1000000","unit":"usd"}],"inputs":{"tools":50,"tokens_per_tool":400,"window":200000,"usd_per_mtok":3},"input_meta":{"tools":{"label":"Tools loaded","min":1},"tokens_per_tool":{"label":"Tokens per definition","min":10},"window":{"label":"Context window","unit":"tokens"},"usd_per_mtok":{"label":"Input price","unit":"$ per million tokens, illustrative"}},"assumptions":["Every definition is sent with every request.","No prompt caching; cached reads are far cheaper.","Token counts per definition vary widely; measure yours with the provider’s token counter."],"tests":[{"inputs":{"tools":50,"tokens_per_tool":400},"expect":{"defs":20000,"share":0.1,"cost":60}},{"inputs":{"tools":10,"tokens_per_tool":300},"expect":{"defs":3000,"share":0.015,"cost":9}}]}
```

> [!insight] Tool search
> When definitions grow past a threshold, harnesses can replace them with a single search tool and load matching definitions on demand. As of November 2026, Claude Code defers MCP tool definitions once they would exceed 10% of the context window (verified Nov 2026). See [MCP at scale](#mcp-at-scale).

## Numbers to know
> [!number]
> Rules of thumb. A typical tool definition is a few hundred tokens. Keep tool results under a few thousand tokens by default. Wrong-tool errors climb as the number of similar tools grows; past a few dozen tools, search or routing usually beats loading everything.

## Pitfalls and anti-patterns
> [!pitfall] Wrapping your REST API one endpoint per tool
> Agents do not think in endpoints. Design tools around tasks the agent performs, and combine endpoints behind one tool when a task needs several.

- **Silent truncation.** If you cut results without saying so, the model assumes it saw everything.
- **Trusting tool output.** Results from the web, email or documents can contain instructions written by attackers. See [prompt injection](#prompt-injection).
- **Vague errors.** “Error 400” teaches nothing; say what was wrong and what to do.

## Talk like an expert
The terms: **agent-computer interface** (ACI, coined in the SWE-agent paper by Yang and colleagues in 2024), **tool choice** (auto, required, a specific tool or none), **parallel tool calls**, **idempotency**, **deferred loading** or **tool search**, and **code as action**. Experts evaluate tools the way designers test interfaces: watch transcripts, find where the model hesitates or misuses a tool, and rewrite the description. The live debate is JSON tool calls versus code execution as the action format.

> [!hottake] Your tool descriptions matter more than your system prompt.
> **The counterargument:** the system prompt sets the goals, constraints and policy that decide which tool calls are acceptable at all. Great tools with a confused objective still produce a confused agent.

## Check yourself
```quiz
agent-tools
```

## Go deeper
- Yang et al., “SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering” (2024).
- Wang et al., “Executable Code Actions Elicit Better LLM Agents” (2024), the CodeAct paper.
- Anthropic engineering, “Writing effective tools for agents” (2025). Search the title on anthropic.com.

## Related
- [The agent loop](#agent-loop)
- [MCP server primitives](#mcp-primitives)
- [Structured outputs](#structured-outputs)
- [Harness engineering](#harness-engineering)
- [Prompt injection](#prompt-injection)
- [Guardrails and control](#guardrails-control)
