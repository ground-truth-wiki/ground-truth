---
id: uber-perfinsights
book: 21
order: "21.67"
title: "Uber PerfInsights: finding Go performance antipatterns with LLMs"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [performance-engineering, go, code-analysis, llm-as-judge, public-record]
visuals: []
type: playbook
account: public-record
industry: "Mobility and delivery (back-end Go services at Uber)"
use_case: "Finding performance antipatterns in the most CPU-expensive functions of Go services with an LLM, validating each finding with an LLM jury and rule-based checks, and passing fixes on as code changes"
outcome: "False positives reduced 'from over 80% to the low teens'; validated antipattern detections fell from 265 to 176 between February and June; time to detect and fix an issue 'from 14.5 hours to almost 1 hour of tool runtime'"
measured_how: "Validated detections in February (an average) and in June, a false-positive rate and a per-issue time, all reported without method, sample or calculation; the per-issue time follows an annual projection of manual effort (Uber blog, July 2025)"
prerequisites: [llm-as-judge]
replications: []
---
> [!tldr]
> Uber built PerfInsights to find performance antipatterns in its Go services. It takes the most CPU-expensive functions from production profiles, asks an LLM to check them against a catalog of known antipatterns, and validates each finding with a jury of LLMs and rule-based checks. The post reports false positives falling "from over 80% to the low teens" and the time per issue falling "from 14.5 hours to almost 1 hour of tool runtime", without saying how either was measured.

> [!note] From the public record
> Built from Uber's own published account, "PerfInsights: Detecting Performance Optimization Opportunities in Go Code using Generative AI" (July 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The post says "back-end service efficiency directly influences operational costs and user experience." In March 2024, the top 10 Go services accounted for compute spend that the post describes as "more than multi-million dollars".

Manual work was slow: "Profiling, benchmarking, and analyzing code could take days or even weeks." In one past case, 5 critical antipatterns took two engineers, one of them a Principal Engineer, a full month (∼320 hours). In another, 11 unique antipatterns took a four-person Go expert team a full week (∼160 hours). One Go expert spent six months full-time on related projects (∼960 hours). The post says these represent "over 1,400 hours for just a handful of cases."

## Why this approach

PerfInsights began as an Uber Hackdayz 2024 finalist. It combines runtime CPU and memory profiles with GenAI-powered static analysis "to pinpoint expensive hotpath functions". The post says engineers "can now deliver high-impact performance improvements without needing specialized knowledge". It does not say which other options the team considered.

## The approach

1. **Filter hotpath functions.** Production profiles are collected "using Uber’s daily fleet-wide profiler during peak traffic periods". For each service, the tool takes the top 30 functions by flat CPU usage. If `runtime.mallocgc` accounts for more than 15% of CPU time, it also analyzes memory profiles. A static filter drops open-source dependencies and internal runtime functions.
2. **Detect antipatterns.** The full source code of each function goes to an LLM with a catalog of antipatterns from the Go Foundations team's past optimization work, such as unbounded memory allocations, redundant loop computations and inefficient string operations. The prompts use few-shot examples (see [In-context learning and example design](#in-context-learning)), cast the model and audience as Go experts, ask for runnable fixes, use one prompt per antipattern, separate detection from validation, and ask for a confidence level.
3. **Validate.** A "jury of large language models" checks each detection: "These models independently assess whether an antipattern is present and whether the suggested optimization is valid." Then "LLMCheck is a framework designed to catch false positives by running through several domain-specific rule-based validators." One rule checks that an identified loop invariant is not actually outside the loop. LLMCheck also logs metrics on detection accuracy, failure rates and potential model drift.
4. **Ship fixes.** Validated suggestions flow into Optix, which the post describes as Uber's continuous code optimization tool. It also says insights "are fed into downstream tools for code transformation or manual review by developers", but does not explain how the diffs are created. PerfInsights is integrated into CI/CD pipelines, so "optimization opportunities are surfaced regularly, not just when something breaks."

## The stack

As of July 2025: Go services in Uber's Go monorepo, Uber's daily fleet-wide profiler, an LLM for detection, a jury of LLMs, LLMCheck with its dashboards, Optix, and CI/CD pipelines. The post names no model or vendor. It says only that "high input token limits were critical for passing large Go functions without truncation", and gives neither the limit nor the jury size.

## Results, and how they were measured

- **Precision.** "This dual-validation strategy has dramatically improved precision, reducing false positives from over 80% to the low teens."
- **Other 80% figures.** On prompt design: "we improved detection precision and reduced false positives by 80%". On the LLMCheck dashboards: "This transparency has helped cut hallucination rates by more than 80%". The post does not say whether these describe the same measurement.
- **Detections.** "In February, we averaged 265 validated detections, reaching a single-day high of 500." By June the figure was 176, which the post calls "a 33.5% reduction in just four months". The post does not give the year or the set of services counted.
- **Time per issue.** The post says "we reduced the engineering time required to detect and fix an issue from 14.5 hours to almost 1 hour of tool runtime", "a 93.10% time savings". The post places it after a projection: "Projecting this annually, that’s a reduction of 267 antipatterns", which would have taken the Go expert team approximately 3,800 hours by hand. The post does not show how it arrived at 14.5 hours.
- **Diffs.** "This has already produced hundreds of merged diffs". The post cites "meaningful cost savings" and says "Landing the first 5 digits saving diff was a breakthrough moment", without a unit, period or total.

**Not measured:** the post states no exact number of merged diffs, no compute or dollar savings, no method or sample behind the false-positive and hallucination rates, no time engineers spend reviewing and landing the diffs, and no cost of running the LLMs.

## What failed

- **Single-shot detection.** "In our initial attempts, a single-shot LLM-based antipattern detection produced inconsistent and unreliable results": "responses varied between runs, included hallucinations, and often generated non-runnable code." The post also says "Early iterations suffered from noisy, inconsistent outputs."
- **Hallucinations that remain.** Even with juries, the post lists "Detecting antipatterns that don’t exist", confusing maps with slices, flagging a loop invariant whose variable is outside the loop, and treating loop variables in `for` statements as loop invariants. One example: "No case-insensitive string comparison was present in the code but was detected." See [Hallucination and factuality](#hallucination-factuality).

## What the team would do differently

The post states lessons rather than things it would redo. Prompt wording mattered: "small adjustments in prompt phrasing and contextual cues dramatically influenced accuracy." Static filtering before any LLM call, it says, "transformed what could have been a brittle AI prototype into a focused optimization assistant". Validation was what earned trust: "To move beyond demos, we needed to give developers confidence in PerfInsights’ recommendations." On the antipattern count, the post says: "We will keep refining both the scanner and LLMCheck to drive this number even lower".

The wiki's reading: the design layers three kinds of check. Profiles decide what the model sees, LLM judges vote on each finding (see [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation)), and deterministic rules catch errors the judges share. The headline time figure sets engineering hours against tool runtime, leaving out the human time to review and merge a fix, and its 14.5-hour baseline is not explained. Read it as an estimate, not a measured saving (see [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)).

## Disclosure

None.

## Sources

- Sung Whang, Joseph Wang and Lavanya Verma (the author biographies also include Ryan Hang), Uber, [“PerfInsights: Detecting Performance Optimization Opportunities in Go Code using Generative AI”](https://www.uber.com/blog/perfinsights/), Uber blog, 22 July 2025.

## Related

- [About playbooks](#about-playbooks)
- [LLM-as-judge done right](#llm-as-judge)
- [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [A field guide to prompting techniques](#prompting-techniques)
