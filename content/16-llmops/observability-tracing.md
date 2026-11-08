---
id: observability-tracing
book: 16
order: "16.4"
title: Observability and tracing
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [tracing, opentelemetry, logging]
visuals:
  - trace-waterfall:trace
  - monitor-tree:tree
---
> [!tldr]
> Trace every request end to end: model calls with prompts, outputs, tokens, latency and cost; retrievals; tool calls; and the agent steps between them. Use OpenTelemetry’s generative-AI conventions so traces are portable, sample and redact what you store, and turn traces into dashboards, alerts and eval cases.

## Why it matters
AI failures are rarely visible in logs alone. A wrong answer may come from a retrieval miss, a truncated context, a tool error or a model change, and only a trace shows which. Traces are also the raw material for error analysis, cost attribution and online evaluation.

## Intuition
A trace is a flight recorder for each request: every instrument reading and every action, timestamped. After an incident you replay it instead of guessing.

```viz
{"id":"trace-waterfall","component":"trace","title":"One RAG request in seven spans: the slow step and the costly step are different","caption":"Illustrative trace. Click a span for its attributes. Reranking is the slowest retrieval step; generation is where the tokens and money go.","alt":"Span waterfall of a RAG request with query rewriting, parallel keyword and vector retrieval, reranking, generation and an output check.","data":"illustrative","spans":[
{"name":"POST /chat","start":0,"dur":2900,"depth":0,"kind":"agent","note":"trace_id 4bf9…, tenant acme, prompt version answer-v14"},
{"name":"model: rewrite query","start":20,"dur":380,"depth":1,"kind":"model","note":"small model, 640 in / 38 out tokens, $0.0002"},
{"name":"retrieve: BM25","start":410,"dur":60,"depth":1,"kind":"data","note":"50 candidates"},
{"name":"retrieve: vectors","start":410,"dur":90,"depth":1,"kind":"data","note":"50 candidates, filter tenant=acme"},
{"name":"rerank","start":510,"dur":180,"depth":1,"kind":"tool","note":"64 pairs, top 6 kept"},
{"name":"model: generate answer","start":700,"dur":2050,"depth":1,"kind":"model","note":"6,900 in (5,800 cached) / 310 out tokens, $0.0067, finish: end_turn"},
{"name":"output check","start":2760,"dur":120,"depth":1,"kind":"tool","note":"citations valid 3/3, PII none"}]}
```

## How it works
**What to capture.** For every model call: model name and version, prompt template and version, inputs and outputs (sampled and redacted), token counts by type, latency (TTFT and total), finish reason and cost. For retrievals: query, filters, candidate counts and returned ids. For tools: name, arguments, result size, errors and duration. Tie them together with one trace id per request, and a session id across turns.

**OpenTelemetry.** The OpenTelemetry project defines semantic conventions for generative AI, with standard attribute names for model, token usage and finish reasons, and instrumentation libraries such as OpenLLMetry emit them automatically for common SDKs, with their own extensions. OpenInference, the convention Arize Phoenix uses, instead defines its own attribute names on OpenTelemetry spans, so its traces need a mapping to be compared. Using the standard keeps traces portable between tools. The conventions are still evolving; check the current attribute names.

```json
{
  "name": "chat model-id",
  "attributes": {
    "gen_ai.operation.name": "chat",
    "gen_ai.provider.name": "provider-name",
    "gen_ai.request.model": "model-id",
    "gen_ai.usage.input_tokens": 6900,
    "gen_ai.usage.output_tokens": 310,
    "gen_ai.response.finish_reasons": ["end_turn"],
    "app.prompt.version": "answer-v14",
    "app.tenant": "acme"
  }
}
```

**Agent traces.** Agents produce long, nested traces: loop iterations, tool calls, subagents. Visualize them as trees or waterfalls and make it easy to jump to the first error. See [evaluating agents](#evaluating-agents).

**Privacy and cost.** Traces contain user data. Redact before storing, sample full payloads, retain briefly, and restrict access. See [privacy](#privacy).

**From traces to action.** Dashboards for latency, errors, tokens and cost by feature, model and tenant; alerts on spikes; queues of sampled traces for human review; one-click conversion of bad traces into eval cases. See [online evaluation](#online-evaluation).

## In practice
```viz
{"id":"monitor-tree","component":"tree","title":"Four families of signals cover most of what AI systems need watched","caption":"Expand a family for the metrics worth alerting on. Slice every metric by feature, model, prompt version and tenant.","alt":"Tree of monitoring signals for AI systems: reliability, latency, cost and quality.","data":"illustrative","open":1,"root":{"label":"What to monitor","children":[
{"label":"Reliability","children":[{"label":"Error rate by type, retries, fallbacks taken, circuit breaker state","link":"#reliability-engineering"}]},
{"label":"Latency","children":[{"label":"TTFT and end-to-end at p50, p95, p99; time per step for agents","link":"#latency-throughput"}]},
{"label":"Cost","children":[{"label":"Tokens and dollars per request, per task, per tenant; cache hit rate","link":"#cost-capacity"}]},
{"label":"Quality","children":[{"label":"Sampled judge scores, citation validity, user feedback, refusal rate, drift in inputs","link":"#online-evaluation"}]}]}}
```

Setup order:
1. Instrument the model gateway and orchestrator with OpenTelemetry.
2. Propagate trace context to retrieval, tools and MCP servers. See [MCP at scale](#mcp-at-scale).
3. Add prompt version, tenant and feature tags to every span.
4. Build dashboards and a small set of alerts.
5. Set up sampling, redaction and retention.
6. Add a review queue and trace-to-eval-case workflow.

## Numbers to know
> [!number]
> Rules of thumb. Store full payloads for a sample (for example a few percent of traffic, plus all errors and flagged sessions) and metadata for everything. Keep raw traces for days to weeks, aggregated metrics for longer.

## Pitfalls and anti-patterns
> [!pitfall] Logging prompts without versions
> A trace that says what the model saw but not which prompt template produced it cannot be tied to a change.

- **Unredacted full payloads forever.** A privacy incident waiting to happen.
- **Traces that stop at the model call.** Retrieval and tools are where many failures start.
- **Dashboards nobody reviews.** Assign owners and alert thresholds.

## Talk like an expert
The vocabulary: **trace**, **span**, **trace context propagation**, **OpenTelemetry GenAI semantic conventions**, **sampling**, **redaction**, **cost attribution**, **review queue**. Experts debug from traces and tag every span with versions. The live debate is how much of an AI trace to keep given privacy and cost, and how to visualize very long agent traces usefully.

> [!hottake] If you can’t see the prompt version on a trace, you can’t run a production AI system.
> **The counterargument:** for very simple, single-prompt features, version tags add bookkeeping with little benefit; their value grows with the number of prompts, models and teams.

## Check yourself
```quiz
observability-tracing
```

## Go deeper
- OpenTelemetry semantic conventions for generative AI, which moved to the open-telemetry/semantic-conventions-genai repository in June 2026 (Development status, no tagged release, as of November 2026).
- OpenLLMetry and OpenInference instrumentation documentation.

## Related
- [Eval and observability tooling map](#eval-tooling)
- [Online evaluation](#online-evaluation)
- [Privacy](#privacy)
- [Cost and capacity](#cost-capacity)
- [Reference architecture](#reference-architecture)
