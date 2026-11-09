---
id: linkedin-generative-ai-product-lessons
book: 21
order: "21.71"
title: "LinkedIn's assistant for jobs and the feed: what came easy and where it struggled"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [rag, structured-outputs, evaluation, latency, public-record]
visuals: []
type: playbook
account: public-record
industry: "Online professional network (jobs and professional content)"
use_case: "An AI assistant that answers members' questions about feed posts and job postings, routing each question to an agent that calls internal APIs and Bing, then writes the answer"
outcome: "LLM outputs that were invalid against the supplied schema or not valid YAML fell from ~10% of the time to ~0.01%, after a defensive YAML parser and prompt hints"
measured_how: "Error rates as reported in the post, with no sample, period or method stated; answer quality rated by an internal linguist team on up to 500 daily conversations (LinkedIn Engineering Blog, April 2024)"
prerequisites: [rag-fundamentals, structured-outputs]
replications: []
---
> [!tldr]
> A LinkedIn team built a generative AI assistant for feed posts and job postings as a pipeline of routing, retrieval and generation. The post says the design and development speed came easy; it struggled with evaluation, calling internal APIs, consistent quality, and capacity and latency. The team reached 80% of the basic experience it aimed for in the first month, then spent four more months trying to pass 95% completion of the full experience.

> [!note] From the public record
> Built from LinkedIn's own published account, "Musings on building a Generative AI product" (April 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

The post describes "turning every feed and job posting into a springboard" for members: to get information faster, to assess their fit for a job, and to receive advice, such as how to prepare for an interview. On quality, the post says that "getting it 80% was fast, but that last 20% took most of our work", for a product where "99%+ of your answers should be great". The post does not name the product or give any user numbers.

## Why this approach

The post does not describe alternatives for the overall design. It calls [retrieval-augmented generation](#rag-fundamentals) "a common design pattern" and used it in three steps. Tuning routing and retrieval "felt more natural given their classification nature": the team built dev sets and fitted them "with prompt engineering and in-house models". To move fast across teams, tasks were split into independent agents developed by different people.

For parsing model output, the post names one rejected option: re-prompting the model after a bad output, because "it adds a non-trivial amount of latency and also consumes precious GPU capacity due to the additional LLM call". The team chose YAML over JSON "because it is less verbose, and hence consumes fewer tokens than JSON."

## The approach

1. **Routing** "decides if the query is in scope or not, and which AI agent to forward it to."
2. **Retrieval** is a "recall-oriented step": the agent decides which services to call, such as LinkedIn People Search or the Bing API.
3. **Generation** is a "precision-oriented step" that filters the noisy retrieved data and writes the answer.

LinkedIn's own data sits behind internal APIs, and LLMs "have not been trained with this information". The team wrapped the APIs as skills with four parts: a description of what the API does and when to use it, the configuration to call the RPC API, an LLM-friendly input and output schema, and logic that maps between the LLM-friendly and the actual RPC schemas (see [Tool use and tool design](#agent-tools)). The model decides which skill to use and outputs its parameters.

A small horizontal team handled shared parts, such as the service hosting the product, evaluation tooling and global prompt templates; vertical teams had autonomy over their agents.

For evaluation, guidelines came first: a job fit answer should be "factual but also empathetic." To scale annotation, an internal linguist team built tooling and processes (see [Labeling and annotation](#labeling-annotation)). Annotators have "a ~1 day turnaround"; members are the final judges, but "some metrics can take 3+ days for a single change".

All requests stream, also inside the pipeline: API calls fire as soon as the model has written their parameters (see [Streaming](#streaming)).

## The stack

As of April 2024: "Small models for routing/retrieval, bigger models for generation", with no models or vendors named; skills over internal APIs; the Bing API; YAML output read by an in-house defensive YAML parser; Embedding-Based Retrieval "powered by an in-memory database" to put response examples into prompts; GPU clusters; and a fully async, non-blocking pipeline.

## Results, and how they were measured

- **Malformed outputs.** About "~90% of the time" the parameters came in the right format, but "~10% of the time the LLM would make mistakes and often output data that was invalid as per the schema supplied". The team found common mistakes in the payloads, patched them in code before parsing, and added hints to its prompts (see [Structured outputs](#structured-outputs)). "We were ultimately able to reduce occurrences of these errors to ~0.01%."
- **Time to quality.** "The team achieved 80% of the basic experience we were aiming to provide within the first month" and "then spent an additional four months attempting to surpass 95% completion of our full experience". The post does not define these percentages or say whether 95% was reached.
- **Evaluation capacity.** "Our internal linguist team built tooling and processes by which we could evaluate up to 500 daily conversations", with metrics such as overall quality score, hallucination rate and Responsible AI violation.

**Not measured:** the post gives no sample, period or method for the ~10% and ~0.01% figures, publishes none of the linguist team's scores, and reports no user numbers, cost figures or measured latency. Its latency numbers are a worked example, not measurements.

## What failed

- **Hallucinations.** "We underestimated the challenge of detecting and mitigating hallucinations". Quality scores rose fast, then plateaued, and "the rate of improvement slowed significantly for each subsequent 1% gain". The team's "training" was "mostly prompt engineering which was more of an art than a science."
- **Fragmentation.** Separate agents gained speed "at the cost of fragmentation": follow-up interactions with the assistant might be handled by different models, prompts or tools.
- **A public ramp.** As the team tackled hallucinations and Chain of Thought became prominent in its prompts, it "neglected that TBT would hurt us much more" (TBT is time between tokens). Chain of Thought adds "tokens that the member never sees", which increases perceived latency. "This caused one of our public ramps to suddenly sound alerts left and right that some tasks were hitting timeouts", and the team "quickly had to increase capacity to alleviate the issue".
- **Cost.** GPU clusters are hard to get and costly. "At the beginning we even had to set timetables for when it was ok to test the product or not", because testing used too many tokens and locked developers out.
- **Automatic evaluation.** It is "still a work in progress", so engineers check results by eye on a limited set of examples.

## What the team would do differently

The post does not say what the team would redo. It lists what worked, including "limiting the number of agents" and "A centralized evaluation pipeline with multi-turn conversations". Its planned work includes an end-to-end automatic evaluation pipeline, a unified skill registry, and moving simpler tasks to in-house, fine-tuned models.

The wiki's reading: every extra model call or hidden reasoning token costs latency and GPU capacity. The team fixed format errors in code rather than with a retry, and the reasoning tokens it added for quality led to timeouts in a public ramp. A prompt change that adds reasoning is also a [latency change](#latency-throughput).

## Disclosure

None.

## Sources

- Juan Pablo Bottaro, co-author Karthik R., LinkedIn, [“Musings on building a Generative AI product”](https://www.linkedin.com/blog/engineering/generative-ai/musings-on-building-a-generative-ai-product), LinkedIn Engineering Blog, 25 April 2024.

## Related

- [About playbooks](#about-playbooks)
- [RAG fundamentals](#rag-fundamentals)
- [Structured outputs](#structured-outputs)
- [Hallucination and factuality](#hallucination-factuality)
- [Latency and throughput](#latency-throughput)
