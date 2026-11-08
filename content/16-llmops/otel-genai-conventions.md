---
id: otel-genai-conventions
book: 16
order: "16.4.1"
title: OpenTelemetry GenAI semantic conventions
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [opentelemetry, tracing, semantic-conventions, observability, agents]
visuals: []
prerequisites: [observability-tracing]
---
> [!tldr]
> The OpenTelemetry GenAI semantic conventions are a shared vocabulary for telemetry from model calls, tools, retrieval and agents: span names, `gen_ai.*` attributes, metrics and events. As of November 2026 they live in their own repository in Development status, with no tagged release, so names still change. Pin your instrumentation versions, know which names they emit, and keep prompts and outputs out of telemetry unless you opt in.

## Key ideas

- **The pipeline they ride on.** Instrumentation, zero-code for the libraries you use or code-based for your own logic, emits traces, metrics and logs ([OpenTelemetry, “Instrumentation”](https://opentelemetry.io/docs/concepts/instrumentation/)), which travel over OTLP, gRPC on port 4317 or HTTP with binary or JSON Protobuf on port 4318, stable for all three signals ([OpenTelemetry, “OTLP specification”](https://opentelemetry.io/docs/specs/otlp/)). A Collector in between receives, processes and exports that telemetry ([OpenTelemetry, “Collector”](https://opentelemetry.io/docs/collector/)), and its tail sampling processor can keep every trace that contains an error or runs slow, which head sampling cannot, because it decides at the start, before the rest of the trace is known ([OpenTelemetry, “Sampling”](https://opentelemetry.io/docs/concepts/sampling/)).
- **Where the conventions live, and their status.** Release v1.42.0 of the core semantic conventions ([published 12 June 2026](https://github.com/open-telemetry/semantic-conventions/releases/tag/v1.42.0)) deprecated every `gen_ai.*` attribute, metric, event and span defined there, including the OpenAI and MCP models, and moved them to a dedicated repository ([semantic-conventions changelog](https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md)). As of November 2026 that repository, which uses Weaver to manage its dependencies on the core conventions, marks the GenAI conventions Development, has no tagged release, and lists its schema URL as TODO ([open-telemetry/semantic-conventions-genai](https://github.com/open-telemetry/semantic-conventions-genai)).
- **The inference span.** As of November 2026, it is named `{gen_ai.operation.name} {gen_ai.request.model}`, should be of kind CLIENT (INTERNAL for a model running in the same process), and requires `gen_ai.operation.name` and `gen_ai.provider.name`. It recommends the response model, finish reasons, `gen_ai.usage.input_tokens` and `gen_ai.usage.output_tokens` with cache-read, cache-write and reasoning subsets, requires `error.type` when the call fails, and requires `gen_ai.conversation.id` when one is readily available, to group turns ([GenAI client inference](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/client-inference.md)). Well-known operation names include `chat`, `embeddings`, `retrieval`, `execute_tool`, `create_agent`, `invoke_agent`, `invoke_workflow` and memory operations such as `search_memory`, and provider pages cover OpenAI, Anthropic, AWS Bedrock and Azure AI Inference ([GenAI attribute registry](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/registry/attributes/gen-ai.md); [GenAI conventions index](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/README.md)).
- **Content is opt-in, and evaluations are events.** Prompts, outputs and system instructions go into `gen_ai.input.messages`, `gen_ai.output.messages` and `gen_ai.system_instructions` only on request: `OTEL_INSTRUMENTATION_GENAI_CAPTURE_CONTENT` defaults to `NO_CONTENT` (the others are `SPAN_ONLY`, `EVENT_ONLY` and `SPAN_AND_EVENT`), and for production, where telemetry volume or sensitive data is a concern, the spec recommends storing content externally and recording a reference such as `gen_ai.input.messages_ref` ([GenAI spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md)). Evaluation results travel as `gen_ai.evaluation.result` events, parented to the span they evaluate when possible, or tied to it by `gen_ai.response.id` when the span id is not available ([GenAI events](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-events.md)).
- **Agents, subagents, MCP and A2A.** An in-process run is an `invoke_agent` span when the model drives the control flow and `invoke_workflow` when the application does ([GenAI agent spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-agent-spans.md)); in the spec's example, a subagent called as a tool nests as `invoke_agent root_agent`, then `execute_tool weather_specialist`, then `invoke_agent weather_specialist` ([agent call examples](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/non-normative/examples-agent-calls.md)). Across processes, MCP instrumentation injects the trace context (W3C `traceparent` and `tracestate`, plus `baggage` if used) into each request's `params._meta`, and the server uses that context as its remote parent; A2A has conventions of its own ([GenAI MCP conventions](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/mcp.md); [GenAI A2A conventions](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/a2a.md)).
- **Names move: pin, map and migrate.** As of November 2026, unreleased change fragments rename `gen_ai.usage.cache_creation.input_tokens` to `cache_write`, replace the `gen_ai.client.token.usage` histogram with separate per-direction, per-operation token usage histograms, and rename the client time-to-first-chunk and time-per-output-chunk metrics to `gen_ai.client.inference.*` ([changelog.d](https://github.com/open-telemetry/semantic-conventions-genai/tree/main/changelog.d)), after earlier renames such as `gen_ai.system` to `gen_ai.provider.name` ([v1.41.0 registry](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/registry/attributes/gen-ai.md)). Arize's OpenInference is a separate convention, with `openinference.span.kind` values such as `LLM`, `RETRIEVER`, `TOOL` and `AGENT` and attributes such as `llm.model_name` and `llm.token_count.prompt`, so mixing the two needs an explicit mapping ([OpenInference semantic conventions](https://github.com/Arize-ai/openinference/blob/main/spec/semantic_conventions.md)).

## Planned visuals

- **`trace`:** one agent run with GenAI spans: `invoke_agent`, two `chat` spans with token usage and finish reasons, an `execute_tool` span, a subagent nested under its tool span, and an MCP server span joined through `params._meta`.
- **`compare`:** the same model call as a GenAI span and as an OpenInference span, with linked highlights between `gen_ai.request.model` and `llm.model_name`, the token counts, and the content attributes.
- **`diagram`:** the pipeline from instrumented app through OTLP to a Collector (receivers, processors including tail sampling, exporters) and on to tracing and eval backends, with where content capture and external storage sit.

## Talk like an expert

Practitioners talk about **semantic conventions**, **`gen_ai.*` attributes**, **span kinds**, **opt-in content capture**, **trace context propagation**, **tail sampling** and the **schema URL**. They ask which names an instrumentation version emits before trusting a dashboard, and they treat a rename in the conventions like an API migration.

## Go deeper

- [open-telemetry/semantic-conventions-genai](https://github.com/open-telemetry/semantic-conventions-genai): the conventions, their change fragments and reference implementations.
- [GenAI client inference](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/client-inference.md): the inference span, its metrics and events.
- [OpenInference semantic conventions](https://github.com/Arize-ai/openinference/blob/main/spec/semantic_conventions.md): the main alternative vocabulary.
- [OpenTelemetry, “Sampling”](https://opentelemetry.io/docs/concepts/sampling/): head and tail sampling, and what each can keep.

## Related

- [Observability and tracing](#observability-tracing)
- [Eval and observability tooling map](#eval-tooling)
- [MCP at scale](#mcp-at-scale)
- [Incidents and on-call](#incidents-on-call)
- [Agent eval metrics and benchmark design](#agent-eval-metrics)
