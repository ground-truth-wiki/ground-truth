---
id: async-batch-workloads
book: 16
order: "16.1.1"
title: Asynchronous and batch AI workloads
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [async, queues, batch-api, webhooks, idempotency]
visuals: []
prerequisites: [reference-architecture, reliability-engineering]
---
> [!tldr]
> Some AI work is too slow or too big to keep a user's request open: long agent runs, deep research, media generation, bulk enrichment and eval runs. Move it off the synchronous path: accept the job, hand back a status handle, run it from a queue or a provider batch API, and report progress and results later. Remember that every hop on that path can deliver the same work twice, so submission and processing must both be idempotent.

## Key ideas

- **The asynchronous request-reply pattern.** The API validates the request, answers 202 Accepted with a `Location` header for a status resource and a `Retry-After` polling hint, reports state, timestamps and an optional percent complete on each poll, and redirects with 303 See Other to the result when done; a DELETE on the status resource cancels, an `Idempotency-Key` header turns a retried POST into the same job, and a retention policy cleans up old results ([Microsoft, “Asynchronous Request-Reply pattern”](https://learn.microsoft.com/en-us/azure/architecture/patterns/asynchronous-request-reply)). Google's API guidelines use about 10 seconds as the rule of thumb for returning a long-running operation instead of the result, and about 30 days for letting completed operations expire ([Google, AIP-151 “Long-running operations”](https://google.aip.dev/151)).
- **Provider long-running modes and push notifications.** As of November 2026, OpenAI's background mode (`background: true`) returns a response you poll while it is `queued` or `in_progress`; cancelling is idempotent, a streamed background response resumes with `starting_after` set to the last `sequence_number` you saw, and time to first token is higher than for a synchronous call ([OpenAI, “Background mode”](https://developers.openai.com/api/docs/guides/background)). Instead of polling, a webhook can announce that a batch or background response finished; as of November 2026, OpenAI retries failed deliveries for up to 72 hours and may send duplicates, so deduplicate on the `webhook-id` header ([OpenAI, “Webhooks”](https://developers.openai.com/api/docs/guides/webhooks)).
- **Queues keep bulk work away from interactive latency.** A queue between producers and workers absorbs bursts, so you need enough workers for the average load rather than the peak. If the average producer rate exceeds the consumer rate, the queue just grows, and autoscaling workers without bounding their combined downstream rate only moves the overload to downstream dependencies, such as the model provider ([Microsoft, “Queue-Based Load Leveling pattern”](https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling)). Separate queues with dedicated consumer pools let each class of work meet its targets independently, so a backfill cannot starve user-facing jobs. A single shared pool that always serves high priority first can delay low-priority messages indefinitely, unless the priority of old messages is raised ([Microsoft, “Priority Queue pattern”](https://learn.microsoft.com/en-us/azure/architecture/patterns/priority-queue)).
- **At-least-once delivery, visibility timeouts and dead letters.** Most queue services deliver at least once, so consumers must be idempotent ([Microsoft, “Queue-Based Load Leveling pattern”](https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling)); in Amazon SQS a received message stays hidden for the visibility timeout, 30 seconds by default, and becomes visible again for any worker if it is not deleted in time, so a worker on a long model call should extend the timeout with a heartbeat ([Amazon SQS, “Visibility timeout”](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html)). After `maxReceiveCount` receives, a redrive policy moves a poison message to a dead-letter queue, whose retention should be longer than the source queue's because a standard queue keeps the original enqueue time ([Amazon SQS, “Using dead-letter queues”](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html)).
- **Provider batch APIs, as of November 2026.** OpenAI's Batch API takes a JSONL file of up to 50,000 requests (200 MB) for one model, each with a unique `custom_id`, at a 50% discount within a 24-hour window, with rate limits separate from synchronous traffic, output lines in any order, charges for the requests that completed if the batch expires, and output files deleted 30 days after completion ([OpenAI, “Batch API”](https://developers.openai.com/api/docs/guides/batch)). Anthropic's Message Batches are also 50% off, take up to 100,000 requests or 256 MB, mostly finish within an hour, expire after 24 hours, return results in any order (match them on `custom_id`), keep results for 29 days and are not eligible for zero data retention ([Claude, “Batch processing”](https://platform.claude.com/docs/en/build-with-claude/batch-processing)).
- **Trace across the queue, and know where queues stop.** OpenTelemetry's messaging conventions have the producer attach a creation context to each message and link producer and consumer spans with span links by default, because one span can have only one parent and a batch receive spans many producers ([OpenTelemetry, “Messaging spans”](https://opentelemetry.io/docs/specs/semconv/messaging/messaging-spans/)). SQS caps the visibility timeout at 12 hours from the first receive, extending it does not reset that limit, and for longer work AWS suggests AWS Step Functions or breaking the task into smaller steps ([Amazon SQS, “Visibility timeout”](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html)). For multi-step agents, that is the territory of [durable execution](#durable-agent-execution) and [long-running agents](#long-running-agents).

## Planned visuals

- **`sequence`:** a deep-research job through the asynchronous request-reply pattern: POST, 202 with `Location` and `Retry-After`, polls that return 200 with status and progress, a retried POST with the same `Idempotency-Key` that returns the same job, then 303 to the result; a second variant cancels with DELETE.
- **`stepper`:** one message's life in a queue: enqueue with trace context, receive, visibility timeout running, heartbeat extension, worker crash, redelivery to a second worker, an idempotent consumer skipping the repeated side effect, and a poison message moving to the dead-letter queue after `maxReceiveCount`.
- **`tree`:** should this work leave the synchronous path? Branches for streaming, provider background mode, your own queue and workers, and a provider batch API, decided by latency need, duration, volume, price and data-retention requirements.

## Talk like an expert

Engineers talk about the **request path** versus **background work**, **202 and a status resource**, **at-least-once delivery**, **idempotent consumers**, **visibility timeouts**, **poison messages**, **dead-letter queues** and **batch windows**. They ask “what happens if this message arrives twice?” and “which queue does this run on?”, and they size workers for the average load while keeping bulk jobs out of the interactive pool.

## Go deeper

- [Microsoft, “Asynchronous Request-Reply pattern”](https://learn.microsoft.com/en-us/azure/architecture/patterns/asynchronous-request-reply): 202, status endpoints, 303 redirects, cancellation and idempotency keys.
- [Google, AIP-151 “Long-running operations”](https://google.aip.dev/151): when an API should return an operation instead of a result.
- [OpenAI, “Batch API”](https://developers.openai.com/api/docs/guides/batch) and [Claude, “Batch processing”](https://platform.claude.com/docs/en/build-with-claude/batch-processing): two provider batch APIs, with their limits and retention.
- [Amazon SQS, “Visibility timeout”](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html): at-least-once delivery, heartbeats and the 12-hour limit.

## Related

- [Reference architecture](#reference-architecture)
- [Long-running and durable agents](#long-running-agents)
- [Rate limits, quotas and overload control](#rate-limits-overload)
- [Cost engineering](#cost-engineering)
- [Reliability engineering](#reliability-engineering)
- [Streaming](#streaming)
