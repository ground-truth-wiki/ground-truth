---
id: frameworks-beyond-python
book: 13
order: "13.3.2"
title: "AI frameworks beyond Python: TypeScript, Java, .NET and Go"
level: practitioner
stability: volatile
reviewed: "2026-11"
status: seed
tags: [typescript, java, dotnet, go, agent-frameworks]
visuals: []
prerequisites: [orchestration-frameworks]
---
> [!tldr]
> Python is not the only home of AI engineering: TypeScript, Java and Kotlin, .NET and Go each have model clients, agent frameworks and workflow engines built around their own runtimes, dependency injection and observability. The concepts carry over (a model client, tools, an agent loop, workflows, memory, tracing), so the practical choice is usually the stack your team already runs. Check status per language, because the same framework can be stable in one language and in preview in another.

## Key ideas

- **TypeScript: the AI SDK.** The AI SDK has a Core that works across model providers for text, structured objects, tool calls and agents, a UI layer of framework-agnostic hooks for chat interfaces, and a harness layer; its `ToolLoopAgent` is the recommended way to build agents (as of November 2026), with loop control through `stopWhen` and `prepareStep`, shared state in `runtimeContext` and per-tool values such as API keys in `toolsContext`. AI SDK 7, released on June 25, 2026, requires Node.js 22, supports only ES modules (no CommonJS `require()`), and adds tool approval policies and a durable `WorkflowAgent` ([AI SDK, “Introduction”](https://ai-sdk.dev/docs/introduction); [AI SDK, “Agents overview”](https://ai-sdk.dev/docs/agents/overview); [Vercel, “AI SDK 7 is now available”](https://vercel.com/changelog/ai-sdk-7)).
- **Streaming to the browser is a protocol.** The AI SDK's data stream uses Server-Sent Events with typed parts for text, reasoning, tool inputs and outputs, tool approval requests and responses, and steps, and a custom backend must set the `x-vercel-ai-ui-message-stream: v1` header (as of November 2026); a plain text stream carries only text, so tool calls need the data stream. Cross-framework alternatives such as AG-UI are covered in [agent interface protocols](#agent-ui-protocols) ([AI SDK, “Stream protocols”](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol)).
- **More TypeScript options.** Mastra is a TypeScript framework for agents and applications with Studio as an interactive UI, and its 1.0 has been released as stable (status update of October 28, 2026); Google's ADK is available in Python, TypeScript, Go, Java and Kotlin, with ADK TypeScript 2.0 generally available with graph workflows; Genkit has generally available SDKs for TypeScript, Go and Dart and a Python preview; and Cloudflare's Agents SDK runs each agent as a Durable Object with local SQL storage (all as of November 2026) ([Mastra docs](https://mastra.ai/docs); [Mastra, “Announcing Mastra v1 beta”](https://mastra.ai/blog/mastrav1); [ADK](https://adk.dev/); [Genkit](https://genkit.dev/); [Cloudflare, “Agents”](https://developers.cloudflare.com/agents/)).
- **Java and Kotlin.** Spring AI offers a fluent `ChatClient` modeled on Spring's `WebClient` and `RestClient`, Advisors that wrap recurring patterns around model calls, tool calling, structured output mapped to POJOs, a portable vector store API, MCP integration for consuming MCP servers and exposing Spring services, and observability, with 2.0.2 as the current release and 1.1.x and 1.0.x releases still listed as stable. LangChain4j provides a high-level AI Services API, chat memory, tools, RAG and agents, integrates with Quarkus, Spring Boot, Helidon and Micronaut, and lists 20+ model providers and 30+ embedding stores (as of November 2026) ([Spring AI reference](https://docs.spring.io/spring-ai/reference/); [LangChain4j, “Introduction”](https://docs.langchain4j.dev/intro)).
- **.NET and Go.** In .NET, `Microsoft.Extensions.AI` defines `IChatClient` and `IEmbeddingGenerator` and adds automatic function invocation, caching and OpenTelemetry through familiar dependency-injection and middleware patterns, so provider libraries plug in behind one interface. For agents, Microsoft Agent Framework, which combines Semantic Kernel's enterprise foundations with AutoGen's orchestration patterns and offers migration guides from both, reached 1.0 for .NET and Python on April 3, 2026, and its workflow docs also cover a Go SDK (as of November 2026); Go teams can also use ADK for Go and Genkit for Go, and the GitHub Copilot SDK has official bindings for TypeScript, Python, Go, .NET, Java and Rust ([Microsoft Learn, “Microsoft.Extensions.AI libraries”](https://learn.microsoft.com/en-us/dotnet/ai/microsoft-extensions-ai); [Microsoft, “Microsoft Agent Framework Version 1.0”](https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-version-1-0/); [Microsoft Learn, “Workflow concepts”](https://learn.microsoft.com/en-us/agent-framework/concepts/workflows/); [GitHub, “github/copilot-sdk”](https://github.com/github/copilot-sdk)).
- **Map the concepts, then check the version line.** The parts have different names but the same jobs: a model-client abstraction (AI SDK Core, `ChatClient`, `IChatClient`), tools, an agent loop (`ToolLoopAgent`, AI Services, Agent Framework agents), workflows and memory, so the designs in [Agent SDK primitives](#agent-sdk-primitives) and [graph workflow runtimes](#graph-workflow-runtimes) transfer. What does not transfer is status: Spring AI lists 2.0, 1.1 and 1.0 releases side by side, Genkit's Python SDK is in preview while its TypeScript and Go SDKs are GA, and Agent Framework 1.0 was announced for .NET and Python (as of November 2026) ([Spring AI reference](https://docs.spring.io/spring-ai/reference/); [Genkit](https://genkit.dev/); [Microsoft, “Microsoft Agent Framework Version 1.0”](https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-version-1-0/)).

## Planned visuals

- **`matrix`:** a dated selection table by language (TypeScript, Java and Kotlin, .NET, Go) with each framework's layer (model client, agent, workflow, UI stream), status and version line, as of November 2026.
- **`compare`:** the same tool-using agent written with the AI SDK's `ToolLoopAgent` in TypeScript and with Spring AI's `ChatClient` in Java, with linked highlights for the model client, the tool definition, the loop and the structured output.
- **`diagram`:** the layer map per language, from model-client abstraction to agent layer, workflow layer and UI stream, with each box linked to the chapter that explains its Python counterpart.

## Talk like an expert

People in these stacks talk about **provider-agnostic clients**, **middleware** or **advisors** around the model call, **tool loops**, **structured output to typed objects** and the **UI message stream**. They choose by the platform they already operate (Spring, ASP.NET, Node.js or edge workers) and check that the feature they need is stable in their language, not only in Python.

## Go deeper

- [AI SDK, “Agents overview”](https://ai-sdk.dev/docs/agents/overview): `ToolLoopAgent`, loop control, runtime and tool contexts, and `HarnessAgent`.
- [Spring AI reference](https://docs.spring.io/spring-ai/reference/): `ChatClient`, Advisors, tool calling, structured output, vector stores, MCP and observability.
- [LangChain4j, “Introduction”](https://docs.langchain4j.dev/intro): AI Services, memory, tools, RAG and framework integrations.
- [Microsoft Learn, “Microsoft.Extensions.AI libraries”](https://learn.microsoft.com/en-us/dotnet/ai/microsoft-extensions-ai): `IChatClient`, `IEmbeddingGenerator` and middleware in .NET.

## Related

- [Orchestration frameworks](#orchestration-frameworks)
- [Selection guide and matrix](#framework-selection)
- [Provider and agent SDKs](#provider-agent-sdks)
- [Agent interface protocols: AG-UI, MCP Apps and generative UI specs](#agent-ui-protocols)
- [Graph workflow runtimes: state, super-steps and checkpoints](#graph-workflow-runtimes)
- [Streaming](#streaming)
