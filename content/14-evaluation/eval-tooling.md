---
id: eval-tooling
book: 14
order: "14.11"
title: Eval and observability tooling map
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [tooling, observability, evals]
visuals:
  - eval-tooling-matrix:matrix
  - tooling-stack:diagram
  - tooling-tree:tree
---
> [!tldr]
> Eval tooling covers tracing, datasets, experiment runners, judges and dashboards. Open-source and commercial platforms overlap heavily; choose by how quickly they let you read traces, turn them into cases and rerun experiments, and keep your data portable through OpenTelemetry and plain files.

## Why it matters
Evaluation is a daily habit only if it is easy. Good tooling makes reading a trace, labeling a failure, adding a case and rerunning the eval take minutes. Bad tooling, or none, turns each of those into a chore that gets skipped. The tool market moves fast, so the durable choice is the workflow and the data formats, not the vendor.

## Intuition
Eval tools are a lab bench: a microscope (trace viewer), sample storage (datasets), instruments (graders), a lab notebook (experiment tracking) and a wall chart (dashboards). Buy the bench that fits how you work, and keep your samples in standard containers.

```viz
{"id":"tooling-stack","component":"diagram","title":"Five layers of eval tooling, all resting on traces","caption":"Most platforms cover several layers; OpenTelemetry at the bottom keeps the data portable between them. Click a layer for its chapter.","alt":"Layered diagram of eval tooling: dashboards and alerts, graders and judges, experiment runner, datasets and annotation, and tracing on OpenTelemetry.","data":"illustrative","w":560,"layer_h":46,"layers":[
{"id":"dash","label":"Dashboards and alerts","sub":"trends, slices, regressions","role":"human","link":"#online-evaluation"},
{"id":"graders","label":"Graders and judges","sub":"code checks, calibrated judges","role":"model","link":"#llm-as-judge"},
{"id":"runner","label":"Experiment runner","sub":"versions, attempts, comparisons","role":"tool","link":"#eval-harnesses"},
{"id":"data","label":"Datasets and annotation","sub":"cases, labels, review queues","role":"data","link":"#eval-datasets"},
{"id":"traces","label":"Tracing","sub":"OpenTelemetry GenAI conventions","role":"context","link":"#observability-tracing"}]}
```

## How it works
**Tracing and observability.** Capture every model call, tool call and retrieval with inputs, outputs, tokens, latency and cost, grouped into traces. OpenTelemetry’s generative-AI semantic conventions and instrumentation libraries such as OpenLLMetry and OpenInference make traces portable. See [observability](#observability-tracing).

**Datasets and annotation.** Turn traces into eval cases with one click, label them in review queues, version them, and tag slices.

**Experiment runners.** Run a system version over a dataset with several attempts, score it, and compare runs side by side with per-case diffs.

**Graders.** Built-in scorers plus your own code checks and judge prompts, with tools for calibrating judges against human labels.

**The landscape.** Open-source and commercial options include Langfuse, Arize Phoenix, Braintrust, LangSmith, Weights & Biases Weave, Promptfoo, DeepEval, Inspect and OpenAI Evals, plus general observability vendors adding LLM features. As of November 2026, Promptfoo is part of OpenAI and Langfuse part of ClickHouse; both remain open source. Coverage overlaps; check current features and pricing.

```viz
{"id":"eval-tooling-matrix","component":"matrix","matrix":"eval-tools","title":"Eval and observability tools by focus, openness and best fit","caption":"Sortable and filterable. Dated and qualitative as of November 2026; this market changes quickly.","alt":"Table of eval and observability tools with focus, openness and best fit.","data":"illustrative","depicts":"As of November 2026"}
```

## In practice
```viz
{"id":"tooling-tree","component":"tree","title":"Three questions narrow the tooling choice","caption":"Expand the branch that fits your team. Whatever you choose, keep traces in OpenTelemetry and cases in files you own.","alt":"Decision tree for choosing eval tooling by hosting needs, workflow and team size.","data":"illustrative","open":1,"root":{"label":"What matters most?","children":[
{"label":"Data must stay in our infrastructure","children":[{"label":"Self-hostable open-source tracing and eval platforms, with OpenTelemetry export"}]},
{"label":"Fast iteration on prompts and judges","children":[{"label":"An experiment-centric platform with side-by-side diffs and judge calibration"}]},
{"label":"Evals in CI","children":[{"label":"A code-first runner such as Promptfoo, DeepEval or Inspect, with results posted to pull requests","link":"#ci-cd-for-ai"}]},
{"label":"Agent and safety evals with sandboxes","children":[{"label":"A framework built for sandboxed agent tasks, such as Inspect","link":"#eval-harnesses"}]},
{"label":"Just starting","children":[{"label":"A spreadsheet of cases, a script and a trace viewer; buy tools when the workflow is clear"}]}]}}
```

Selection checklist:
- How fast can a person go from a bad trace to a new eval case?
- Can you rerun an experiment with one command and diff it against the last run?
- Does it support your graders, including custom code and calibrated judges?
- Can you export everything: traces in OpenTelemetry, cases and results as files?
- Does it meet your data residency and privacy requirements?

## Numbers to know
> [!number]
> Rules of thumb. If adding a case from a trace takes more than a minute, people will stop doing it. Sample traces for scoring rather than scoring all of them; judges on full traffic can cost more than the system they evaluate.

## Pitfalls and anti-patterns
> [!pitfall] Buying a platform before you have a workflow
> Tools amplify a habit; they do not create one. Read traces and maintain cases by hand first, then buy what removes the friction you felt.

- **Proprietary-only trace formats.** Switching later means losing history.
- **Dashboards nobody owns.** Assign someone to watch and act.
- **Scoring every trace with expensive judges.** Sample.

## Talk like an expert
The vocabulary: **trace**, **span**, **OpenTelemetry GenAI conventions**, **experiment**, **dataset version**, **review queue**, **scorer**, **judge calibration**. Experts judge tools by time from trace to case and by export options. The live debate is consolidation between general observability vendors and AI-specific eval platforms.

> [!hottake] The best eval tool is the one your whole team actually opens every day.
> **The counterargument:** a tool people like but that lacks proper versioning, paired comparisons or judge calibration produces confident, unreliable numbers; features matter as much as adoption.

## Check yourself
```quiz
eval-tooling
```

## Go deeper
- OpenTelemetry semantic conventions for generative AI.
- Documentation for the tools listed above, read with dates in mind.

## Related
- [Observability and tracing](#observability-tracing)
- [Evaluation harnesses](#eval-harnesses)
- [Why evals are the core skill](#why-evals)
- [CI/CD for AI](#ci-cd-for-ai)
- [Online evaluation](#online-evaluation)
- [OpenTelemetry GenAI semantic conventions](#otel-genai-conventions)
