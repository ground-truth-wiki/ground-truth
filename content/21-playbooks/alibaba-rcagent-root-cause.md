---
id: alibaba-rcagent-root-cause
book: 21
order: "21.30"
title: "RCAgent: root cause analysis of Flink jobs with a locally hosted LLM agent"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [incidents, root-cause-analysis, agents, tool-calling, public-record]
visuals: []
type: playbook
account: public-record
industry: "Cloud computing (managed stream processing on Apache Flink)"
use_case: "An LLM agent that gathers logs, code and database records through tools and reports the root cause, solution, evidence and responsibility for anomalous Flink jobs"
outcome: "On out-of-domain jobs: 82.06% precision in determining responsibility (with TSC) and an SRE-rated H-Helpfulness of 2.92 on a 0 to 5 scale; offline: +8.71 and +6.52 METEOR against ReAct"
measured_how: "SRE-labeled out-of-domain jobs from the first two weeks of deployment (sample size not stated), and an offline set of 161 jobs from one month of anomalies, scored with text metrics and a GPT-4 judge (Wang et al., arXiv, version of August 2024)"
prerequisites: [agent-loop, agent-tools]
replications: []
---
> [!tldr]
> Alibaba Cloud's Real-time Compute Platform for Apache Flink uses RCAgent, an LLM agent on a locally deployed model, for out-of-domain jobs that "existing automatic SRE tools cannot properly handle". On such jobs from the first two weeks of deployment, SREs rated its help 2.92 on a 0 to 5 scale, "indicating moderate support for RCA". With Trajectory-level Self-Consistency it reached "a precision of 82.06% in determining the responsibility".

> [!note] From the public record
> Built from Alibaba Group's own published account, "RCAgent: Cloud Root Cause Analysis by Autonomous Agents with Tool-Augmented Large Language Models" (October 2023, revised August 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Alibaba Cloud's Real-time Compute Platform runs stream processing jobs on Apache Flink. The paper notes that anomalies in cloud systems, such as unrecoverable failures and hanging jobs, "severely impact customer experience" and can potentially violate service level agreements. The platform's existing automatic SRE tools cannot properly handle some of these jobs (see [Incidents and on-call](#incidents-on-call)). The paper also sets a constraint: the model should be internally hosted, because "transmitting production-level confidential data to external API induces privacy risks."

## Why this approach

Earlier LLM work on cloud RCA fine-tuned GPT models, a "computationally expensive supervised adaption" in the paper's words, or used few-shot RAG methods "all based on the GPT family and scenarios within Microsoft". The paper says none of them lets the model collect information or decide on its own.

The team chose a tool-augmented agent in the ReAct style (see [The agent loop](#agent-loop)) on an internally hosted model, and named the cost: "While trading off the model’s ability for security, we need techniques to mitigate the gap to some extent." It also had to manage context length, as logs, code and query results are large, and action validity, as less aligned models generate more invalid actions.

## The approach

1. **A controller agent** runs a thought-action-observation loop. Actions are JSON, a "finalize" tool lets it decide when to report, and it uses no few-shot examples, given limited context length.
2. **Observation Snapshot Key (OBSK).** The controller sees only the head of each observation plus a key; a key-value store returns the full observation when an action names that key.
3. **Semantically minimalist tools.** Information-gathering tools take simple parameters such as an entity ID instead of exposing SQL or a log query API. See [Tool use and tool design](#agent-tools).
4. **Expert agents.** A code analysis tool reads classes recursively. A log analysis tool clusters log lines into chunks and analyzes each with retrieved examples, discarding analyses whose copied evidence cannot be fuzzy-matched to the chunk.
5. **Stabilization.** JsonRegen repairs output that does not parse by having the LLM convert it to YAML and regenerate JSON (see [Structured outputs](#structured-outputs)). Error messages flag repeated calls with the same arguments, trivial input to experts and finalizing too early.
6. **Trajectory-level Self-Consistency (TSC)** samples only when the controller steps into finalization, then aggregates the candidates.

In deployment, RCAgent "analyzes all Out-of-Domain (OoD) jobs that existing automatic SRE tools cannot properly handle", and passes jobs it labels as platform responsibility to the Flink SRE team.

## The stack

As of August 2024, for the experiments: Vicuna-13B-V1.5-16K on vLLM, on a single NVIDIA A100 SXM4 GPU (80 GB), with greedy decoding by default. The deployed configuration is not stated. GTE-LARGE is the embedding model, "an internally deployable substitute" for text-embedding-ada-002. Data comes from logs in Alibaba Cloud's SLS (Simple Log Service), a database of advisor service history and the advisor services' code.

## Results, and how they were measured

**Offline.** The team collected "15,616 anomalous jobs of one-month cloud system history" and filtered them to "~5,000 non-trivial anomalous jobs with substantial log content". The Flink Advisor knowledge base, "a large rule set distilled from experienced SREs’ domain knowledge", produced analyses for these, and the jobs it analyzed successfully were reduced to 161, with no more than two sharing a root cause. An LLM summarized those analyses into targets that the SRE team proofread and annotated. Outputs were scored with text metrics such as METEOR and BLEURT (see [Reference-based text metrics](#text-generation-metrics)), and by gpt-4-0613 on a 0 to 10 scale.

- "+8.71 and +6.52 METEOR against ReAct in the root cause and solution prediction subtasks".
- "the RCAgent achieves a 99.38% Pass Rate within 15 steps and a 7.93% Invalid Rate", against 86.33 and 22.82 for ReAct.

**Online.** Out-of-domain jobs from "the first two weeks of the system’s deployment", beyond the current rules, were labeled by experienced SREs, who scored helpfulness from 0 to 5.

- With TSC, "RCAgent demonstrates a precision of 82.06% in determining the responsibility", against 80.74 without TSC, 77.65 for XGBoost, 77.85 for fine-tuned T5, 77.21 for an LLM summary baseline and 73.53 for ReAct.
- Helpfulness was 2.92±0.21 with TSC, 2.47±0.17 without and 1.36±0.03 for ReAct; a Tukey's HSD test found both RCAgent variants better than ReAct (p=0.001).

**Not measured:** the paper gives no count of online jobs or raters, no count of jobs RCAgent handles in production, no period of use beyond the two-week evaluation, and no effect on time to resolve or SRE workload. Its statement that the procedure "improves the efficiency of spotting anomalies" carries no figure.

## What failed

- **Sampled decoding.** With nucleus sampling, "the stability collapses to 70.19% Pass Rate and 44.80% Invalid Rate", which led to TSC.
- **Query execution tools.** With SQL and SLS query execution tools instead, "The substitution drastically downgrades the Pass Rate by 33.54%", mainly through "a 70.95% Invalid Rate" (Table 4 gives 70.94).
- **Missing parts.** Without JsonRegen, stability dropped. Without the expert agents, results fell, "leaving only marginal improvement over ReAct".
- **Plain ReAct online** had lower responsibility precision than all three non-agent methods. The authors suggest "the instabilities an autonomous agent solution would incur" might explain it.

## What the team would do differently

The paper states no regrets or future work, only lessons from its experiments: "the necessity of providing semantically minimalist tools for locally hosted LLMs" and "the vitality of optimal decoding during initial steps".

The wiki's reading: the offline labels start from a rule set's analyses, for jobs it could already analyze, while the target is jobs the rules cannot handle; only the online test, of unstated size, measures that. With a less capable local model, much of the work went into the environment around the loop: simpler tools, shorter observations and repaired JSON. See [Agent failure modes](#agent-failure-modes).

## Disclosure

None.

## Sources

- Zefan Wang, Zichuan Liu, Yingying Zhang, Aoxiao Zhong, Jihong Wang, Fengbin Yin, Lunting Fan, Lingfei Wu and Qingsong Wen, Alibaba Group with co-authors from Tsinghua University, Nanjing University, Xi’an Jiaotong University, Harvard University, Anytime AI and Squirrel Ai Learning, [“RCAgent: Cloud Root Cause Analysis by Autonomous Agents with Tool-Augmented Large Language Models”](https://arxiv.org/abs/2310.16340), arXiv 2310.16340 (cs.SE), version 1 submitted 25 October 2023, version 3 (used here) 2 August 2024; accepted at CIKM 2024, the 33rd ACM International Conference on Information and Knowledge Management, doi:10.1145/3627673.3680016.

## Related

- [About playbooks](#about-playbooks)
- [Incidents and on-call](#incidents-on-call)
- [Tool use and tool design](#agent-tools)
- [Reference-based text metrics](#text-generation-metrics)
- [Agent failure modes](#agent-failure-modes)
