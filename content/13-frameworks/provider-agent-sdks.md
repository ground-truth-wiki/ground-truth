---
id: provider-agent-sdks
book: 13
order: "13.2"
title: Provider and agent SDKs
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [sdk, agent-sdk, adk]
visuals:
  - sdk-compare:compare
  - sdk-adds:diagram
---
> [!tldr]
> Provider SDKs wrap the model API; agent SDKs wrap a whole harness. The Claude Agent SDK exposes the harness behind Claude Code; the OpenAI Agents SDK offers agents, handoffs, guardrails and tracing; Google’s ADK builds multi-agent systems on Gemini. Use one when its harness matches your task, and drop to the raw API when you need control it hides.

## Why it matters
Writing a robust agent loop with tool execution, context management, permissions, retries and tracing takes weeks. Agent SDKs give you that in a few lines, tuned by the provider for its models. They also make choices for you about context, tools and control flow, which matter when things go wrong.

## Intuition
A provider SDK is a well-made engine. An agent SDK is the engine already mounted in a chassis with steering and brakes. You drive away faster; you also accept the chassis.

```viz
{"id":"sdk-compare","component":"compare","title":"The same agent as a hand-written loop and as an agent SDK call","caption":"Illustrative Python; check current SDK documentation for exact names and options. Hover the marks.","alt":"Comparison of a hand-written agent loop using a provider SDK and an equivalent agent SDK call.","data":"illustrative","a":{"title":"Provider SDK: your loop","text":"import anthropic\nclient = anthropic.Anthropic()\nmessages = [{'role': 'user', 'content': task}]\nwhile True:\n    resp = client.messages.create(model=MODEL,\n        max_tokens=2000, tools=TOOLS, messages=messages)\n    messages.append({'role': 'assistant',\n                     'content': resp.content})\n    if resp.stop_reason != 'tool_use':\n        break\n    results = [{'type': 'tool_result', 'tool_use_id': b.id,\n                'content': run_tool(b.name, b.input)}\n               for b in resp.content if b.type == 'tool_use']\n    messages.append({'role': 'user', 'content': results})"},"b":{"title":"Agent SDK: a packaged harness","text":"import asyncio\nfrom claude_agent_sdk import query, ClaudeAgentOptions\n\nasync def main():\n    options = ClaudeAgentOptions(\n        allowed_tools=['Read', 'Edit', 'Bash'],\n        permission_mode='acceptEdits')\n    async for message in query(\n            prompt='Fix the failing date test',\n            options=options):\n        print(message)\n\nasyncio.run(main())"},"links":[{"a":"while True:","b":"async for message in query(","note":"The SDK runs the loop for you, including stop reasons and tool results."},{"a":"tools=TOOLS","b":"allowed_tools=['Read', 'Edit', 'Bash'],","note":"Built-in tools for files and shells come with the harness; you allow the ones you want."},{"a":"'content': run_tool(b.name, b.input)}","b":"permission_mode='acceptEdits')","note":"Your loop must execute tools and enforce permissions; the SDK has both built in."}]}
```

## How it works
**Provider SDKs.** Typed clients for each API (Python, TypeScript and more), with streaming helpers, retries, tool-use types and structured-output parsing. Use them directly for single calls, chains and your own loops. See [model APIs](#model-apis).

**Claude Agent SDK.** The harness that powers Claude Code, available as a library in Python and TypeScript (renamed from the Claude Code SDK in 2025): the agent loop, built-in file, shell and web tools, MCP servers, subagents, hooks, permissions and context compaction. Suited to agents that work with files, code and long tasks. See [Claude Code](#claude-code).

**OpenAI Agents SDK.** A lightweight framework of agents with instructions and tools, handoffs between agents, guardrails that validate inputs and outputs, sessions, and built-in tracing.

**Google Agent Development Kit (ADK).** A framework for building single and multi-agent systems, optimized for Gemini and Google Cloud but model-agnostic, with tools, workflows and deployment options.

**What an agent SDK adds over a provider SDK:**

```viz
{"id":"sdk-adds","component":"diagram","title":"Eight pieces of harness an agent SDK gives you that a provider SDK does not","caption":"Each is something you would otherwise build and maintain. Click a piece for its chapter.","alt":"Diagram of an agent SDK surrounding a provider SDK with the loop, tools, context management, permissions, MCP, subagents, hooks and tracing.","data":"illustrative","w":600,"h":230,"nodes":[
{"id":"core","label":"Provider SDK","sub":"model calls","role":"model","x":215,"y":87,"w":170,"h":56},
{"id":"loop","label":"Agent loop","role":"agent","x":0,"y":0,"w":140,"h":44,"link":"#agent-loop"},
{"id":"tools","label":"Built-in tools","role":"tool","x":153,"y":0,"w":140,"h":44,"link":"#agent-tools"},
{"id":"ctx","label":"Context management","role":"context","x":306,"y":0,"w":140,"h":44,"link":"#context-engineering"},
{"id":"perm","label":"Permissions","role":"human","x":460,"y":0,"w":140,"h":44,"link":"#human-in-the-loop"},
{"id":"mcp","label":"MCP client","role":"tool","x":0,"y":186,"w":140,"h":44,"link":"#mcp-architecture"},
{"id":"sub","label":"Subagents, handoffs","role":"agent","x":153,"y":186,"w":140,"h":44,"link":"#multi-agent"},
{"id":"hooks","label":"Hooks, guardrails","role":"tool","x":306,"y":186,"w":140,"h":44,"link":"#guardrails-control"},
{"id":"trace","label":"Tracing","role":"data","x":460,"y":186,"w":140,"h":44,"link":"#observability-tracing"}],
"edges":[{"from":"loop","to":"core","style":"dashed"},{"from":"tools","to":"core","style":"dashed"},{"from":"ctx","to":"core","style":"dashed"},{"from":"perm","to":"core","style":"dashed"},{"from":"mcp","to":"core","style":"dashed"},{"from":"sub","to":"core","style":"dashed"},{"from":"hooks","to":"core","style":"dashed"},{"from":"trace","to":"core","style":"dashed"}]}
```

## In practice
Choosing:
- **Raw provider SDK** when you need precise control over every call, or the task is a few calls rather than an agent.
- **An agent SDK** when its harness fits: file and code work for the Claude Agent SDK, handoff-style multi-agent apps for the OpenAI Agents SDK, Gemini-centric systems for ADK.
- **A general framework** when you need provider independence, durable graphs or an ecosystem of integrations. See [orchestration frameworks](#orchestration-frameworks).

Whatever you pick: route calls through a gateway, keep prompts and tools in versioned config, trace everything, and run evals on the SDK’s default behavior before trusting it.

## Numbers to know
> [!number]
> Rules of thumb. An agent SDK can replace hundreds of lines of loop, tool and context code. SDKs evolve quickly; pin versions and read changelogs, especially for context management and permission defaults.

## Pitfalls and anti-patterns
> [!pitfall] Accepting SDK defaults unexamined
> Default tools, permissions and context handling were chosen for general use. Check that they fit your task and security model.

- **Lock-in by accident.** Provider-specific SDKs tie you to one model family; decide that deliberately.
- **Hidden context growth.** Inspect what the SDK sends on each call.
- **Two harnesses at once.** Wrapping an agent SDK in a framework’s agent loop doubles the complexity.

## Talk like an expert
The vocabulary: **provider SDK**, **agent SDK**, **Claude Agent SDK**, **OpenAI Agents SDK**, **Agent Development Kit**, **handoff**, **guardrail**, **session**, **built-in tools**. Experts can say what their SDK sends on each model call and how to override it. The live debate is whether provider agent SDKs will become the default way to build agents, displacing provider-neutral frameworks.

> [!hottake] The provider’s own agent SDK is usually the best harness for that provider’s models.
> **The counterargument:** provider SDKs optimize for their own models and ecosystems; teams that need to switch or mix models get more durable value from provider-neutral frameworks and their own thin harness.

## Check yourself
```quiz
provider-agent-sdks
```

## Go deeper
- The Claude Agent SDK documentation at docs.claude.com.
- The OpenAI Agents SDK and Google Agent Development Kit documentation.

## Related
- [Model APIs in practice](#model-apis)
- [Case study: Claude Code](#claude-code)
- [The agent loop](#agent-loop)
- [The landscape map](#framework-landscape)
- [Orchestration frameworks](#orchestration-frameworks)
- [AI frameworks beyond Python: TypeScript, Java, .NET and Go](#frameworks-beyond-python)
- [Managed agent platforms and hosted harnesses](#managed-agent-platforms)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Agent SDK primitives: runners, tools, guardrails, sessions and tracing](#agent-sdk-primitives)
- [Embedding agent harnesses in your application](#embedded-agent-harnesses)
