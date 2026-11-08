---
id: managed-agent-platforms
book: 13
order: "13.8"
title: Managed agent platforms and hosted harnesses
level: practitioner
stability: volatile
reviewed: "2026-11"
status: seed
tags: [agent-platforms, agent-hosting, agent-runtime, build-vs-buy, cloud-platforms]
visuals: []
prerequisites: [framework-landscape]
---
> [!tldr]
> A managed agent platform runs the agent itself, not only the model: it hosts each session in an isolated sandbox and adds memory, tool gateways, identity, observability and policy around it. Platforms come in two shapes: runtimes that host your own containerized agent code, built with almost any framework, and hosted harnesses where you send configuration and events and the provider runs the loop. Remember that you trade control over data retention, residency and portability for isolation, scaling and governance you would otherwise build yourself.

## Key ideas

- **A layer above model APIs.** Anthropic's own comparison puts the line here: the Messages API gives direct model access for custom agent loops, while Claude Managed Agents is a “pre-built, configurable agent harness that runs in managed infrastructure”. Amazon Bedrock AgentCore, generally available since October 13, 2025, likewise describes itself as a platform for building, deploying and operating agents with any framework and foundation model, without managing infrastructure ([Anthropic, “Claude Managed Agents overview”](https://platform.claude.com/docs/en/managed-agents/overview); [AWS, “What is Amazon Bedrock AgentCore?”](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html); [AWS, “Amazon Bedrock AgentCore is now generally available”](https://aws.amazon.com/about-aws/whats-new/2025/10/amazon-bedrock-agentcore-available/)).
- **Bring-your-own-agent runtimes.** AgentCore Runtime hosts agents built with LangGraph, Strands, CrewAI or custom code, runs each user session in a dedicated microVM with isolated CPU, memory and filesystem that is terminated and sanitized afterwards, and allows sessions of up to 8 hours on microVMs or 14 days on Instances. Google's Gemini Enterprise Agent Runtime gives ADK full integration, managed templates for LangChain, LangGraph, AG2 and LlamaIndex, a custom template for CrewAI, and custom containers, and Microsoft Foundry Agent Service hosted agents run every session in its own VM-isolated sandbox and accept your container built with any framework, such as Agent Framework, LangGraph, Semantic Kernel or custom code (all as of November 2026) ([AWS, “AgentCore Runtime”](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html); [Google Cloud, “Agent Runtime”](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/runtime); [Microsoft Learn, “Hosted agents in Foundry Agent Service”](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents)).
- **Hosted harnesses.** In Claude Managed Agents you define an agent (model, system prompt, tools, MCP servers and skills) and an environment (an Anthropic-managed cloud sandbox or a self-hosted one), start sessions, send events and receive results over server-sent events, steer or interrupt a running agent, and schedule recurring runs; it is in beta behind the `managed-agents-2026-04-01` header. AgentCore Harness is the AWS counterpart: you pass a model, system prompt and tools inline, and each session runs in an isolated microVM with filesystem and shell access (as of November 2026) ([Anthropic, “Claude Managed Agents overview”](https://platform.claude.com/docs/en/managed-agents/overview); [AWS, “What is Amazon Bedrock AgentCore?”](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html)).
- **The services around the runtime, and the protocols they speak.** AgentCore adds Memory, a Gateway that turns APIs and Lambda functions into MCP-compatible tools and connects existing MCP servers, Identity, Code Interpreter, Browser, OpenTelemetry-compatible Observability, Evaluations, Policy (rules in natural language or in Dogwood, a language compatible with Cedar, checked on every tool call through the Gateway) and a Registry of agents, MCP servers, tools and skills, and its Runtime can host MCP, A2A and AG-UI servers. Foundry hosted agents expose the OpenAI-compatible Responses protocol and an Invocations protocol for arbitrary JSON payloads, also support Activity and A2A, and reach Foundry tools through a Toolbox MCP endpoint (as of November 2026) ([AWS, “What is Amazon Bedrock AgentCore?”](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html); [AWS, “AgentCore Runtime”](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html); [Microsoft Learn, “Hosted agents in Foundry Agent Service”](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents)).
- **Framework vendors and the edge host agents too.** LangGraph Platform has been called LangSmith Deployment since October 2025; its Agent Server manages assistants, threads, runs and cron jobs, persists data in PostgreSQL, uses Redis for signaling between API servers and queue workers, runs in LangSmith cloud or self-hosted, and can also deploy agents built with Strands or the Claude Agent SDK. Cloudflare's Agents SDK makes each agent a Durable Object with local SQL storage, scheduled work and recoverable execution, and its Pi harness uses a job queue for future work, so a run continues after the object is evicted (as of November 2026) ([LangChain, “LangGraph Platform is now Generally Available”](https://www.langchain.com/blog/langgraph-platform-ga); [LangSmith, “Agent Server”](https://docs.langchain.com/langsmith/agent-server); [Cloudflare, “Agents”](https://developers.cloudflare.com/agents/)).
- **What you give up, and what to check first.** Hosting moves session data to the provider: Claude Managed Agents stores conversation history, sandbox state and outputs server-side, so it is not eligible for zero data retention or HIPAA BAA coverage, even with self-hosted sandboxes, though you can delete sessions and files through the API (as of November 2026). Pricing has its own unit too: AgentCore Runtime charges for the resources a session consumes and aligns CPU billing with active processing. Before you adopt a platform's memory, identity or policy store, check data handling, session pricing and how you would move the agent elsewhere ([Anthropic, “Claude Managed Agents overview”](https://platform.claude.com/docs/en/managed-agents/overview); [AWS, “AgentCore Runtime”](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html)).

## Planned visuals

- **`matrix`:** a dated comparison of AgentCore, Google's Agent Runtime, Foundry hosted agents, Claude Managed Agents, LangSmith Deployment and Cloudflare Agents by shape (your code or hosted harness), session isolation, supported frameworks, protocols and data handling, as of November 2026.
- **`tree`:** a build-versus-host decision: must you own the loop, which framework do you use, do you need zero data retention or a specific region, and how many tenants share the system, leading to self-hosting, a bring-your-own-agent runtime or a hosted harness.
- **`diagram`:** the anatomy of a managed agent platform: a runtime with one sandbox per session at the center, surrounded by memory, tool gateway, identity, policy, observability, evaluations and registry, each linked to its chapter.

## Talk like an expert

Platform teams separate the **runtime** (where the loop and its sandbox run) from the **harness** (who wrote the loop), and talk about **per-session isolation**, **agents, environments and sessions**, **tool gateways**, **agent identity** and **policy at the tool call**. Their first questions are where session data lives, who can delete it, and how hard it would be to move the agent to another host; the embedded alternative is covered in [embedding agent harnesses](#embedded-agent-harnesses).

## Go deeper

- [AWS, “What is Amazon Bedrock AgentCore?”](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html): every AgentCore service, from Harness and Runtime to Policy and Registry.
- [Anthropic, “Claude Managed Agents overview”](https://platform.claude.com/docs/en/managed-agents/overview): agents, environments, sessions and events, sandboxes and data handling.
- [Google Cloud, “Agent Runtime”](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/runtime): framework tiers, custom containers and the managed runtime on Google Cloud.
- [LangSmith, “Agent Server”](https://docs.langchain.com/langsmith/agent-server): assistants, threads, runs, persistence and the task queue.

## Related

- [The landscape map](#framework-landscape)
- [Provider and agent SDKs](#provider-agent-sdks)
- [Embedding agent harnesses in your application](#embedded-agent-harnesses)
- [Sandboxes and execution environments](#sandboxes)
- [Selection guide and matrix](#framework-selection)
- [Long-running and durable agents](#long-running-agents)
