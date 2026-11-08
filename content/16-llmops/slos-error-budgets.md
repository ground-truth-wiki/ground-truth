---
id: slos-error-budgets
book: 16
order: "16.2.2"
title: SLOs and error budgets for AI systems
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [slo, error-budget, sre, alerting, reliability]
visuals: []
prerequisites: [reliability-engineering, latency-throughput]
---
> [!tldr]
> A service level objective (SLO) is a target for a measured indicator of service (an SLI), and the error budget is the amount of failure that target allows. For AI systems the indicators include time to first token and sampled answer quality, not just HTTP errors, and a spent budget is the signal to pause prompt, model and provider changes. Remember that a 200 with a wrong answer is still an error.

## Key ideas

- **SLI, SLO and SLA are different things.** An SLI is a carefully defined quantitative measure of some aspect of service, an SLO is a target value or range for an SLI, and an SLA is a contract with consequences if the target is missed; the SRE book also advises percentiles over averages and a tighter internal SLO than the one you advertise ([Google SRE book, “Service Level Objectives”](https://sre.google/sre-book/service-level-objectives/)). A provider SLA can count far less than your SLO does. As of November 2026, Google's SLA for the Gemini Online Inference API promises 99.5% monthly uptime for its generateContent and streamGenerateContent methods (95% for models designated for shorter availability). It counts downtime only in runs of at least five consecutive minutes in which more than 5% of valid requests return HTTP 5XX, excludes errors caused by quotas, and caps credits at 50% of the monthly bill for the service. A wrong answer returns HTTP 200, so it never counts against the SLA ([Google Cloud, “Gemini Online Inference API on Gemini Enterprise Agent Platform SLA”](https://cloud.google.com/vertex-ai/generative-ai/sla)).
- **SLIs for AI services.** Latency splits into time to first token (TTFT) and time per output token (TPOT), each measured at percentiles; DistServe measures serving capacity as goodput, the maximum request rate per GPU that can be served within both TTFT and TPOT constraints ([Zhong et al., “DistServe: Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving” (2024)](https://arxiv.org/abs/2401.09670)). Microsoft's GenAIOps guide pairs operational metrics such as latency, token usage and 429 errors with quality metrics such as groundedness and relevance ([Microsoft, “GenAIOps for organizations with MLOps investments”](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/genaiops-for-mlops)). A quality score measured on a sample of traffic is a statistical estimate, so report it with error bars ([Miller, “Adding Error Bars to Evals: A Statistical Approach to Language Model Evaluations” (2024)](https://arxiv.org/abs/2411.00640)).
- **The four golden signals, translated.** Google's golden signals are latency, traffic, errors and saturation; errors include implicit ones such as “an HTTP 200 success response, but coupled with the wrong content”, which only end-to-end checks catch, and saturation emphasizes the most constrained resources ([Google SRE book, “Monitoring Distributed Systems”](https://sre.google/sre-book/monitoring-distributed-systems/)). For a hosted model those are throughput, quota and throttling ([Microsoft, “GenAIOps for organizations with MLOps investments”](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/genaiops-for-mlops)); on your own servers, KV-cache memory is a key constraint, because it limits the batch size ([Kwon et al., “Efficient Memory Management for Large Language Model Serving with PagedAttention” (2023)](https://arxiv.org/abs/2309.06180)).
- **Error budgets and the policy that enforces them.** A 99.9% SLO leaves a budget of 0.1% of events that may fail in the window. In an AI system, treat prompt, model, retrieval and provider changes as releases that can spend it, behind the same gate as code (see [CI/CD for AI](#ci-cd-for-ai)). Google's example policy halts all changes and releases other than P0 issues and security fixes once the service has exceeded its error budget for the preceding four-week window, and requires a postmortem when one incident consumes more than 20% of it ([Google SRE workbook, “Example Error Budget Policy”](https://sre.google/workbook/error-budget-policy/)).
- **Alert on burn rate, over two windows.** Burn rate is how fast the service consumes its error budget relative to the SLO: for a 99.9% SLO over 30 days, the SRE workbook pages at a burn rate of 14.4 over 1 hour (2% of the budget) or 6 over 6 hours (5%), each confirmed by a short window one twelfth as long, and opens a ticket at 1 over 3 days (10%) ([Google SRE workbook, “Alerting on SLOs”](https://sre.google/workbook/alerting-on-slos/)). Low-traffic services such as internal agents need care: at 10 requests an hour a 99.9% SLO allows only about seven failures in 30 days, so one failure spends about 14% of the budget, and the workbook suggests synthetic traffic or merging services for monitoring ([Google SRE workbook, “Alerting on SLOs”](https://sre.google/workbook/alerting-on-slos/)).
- **Availability composes, and classes of work need their own SLOs.** A service cannot be more available than the intersection of its critical dependencies, so Google's rule of thumb gives each one an extra nine and mitigates weaker ones with a capacity cache, failing open or graceful degradation ([Treynor et al., “The Calculus of Service Availability” (2017)](https://sre.google/static/pdf/calculus_of.pdf)). For a model provider, a fallback model tested with evals is one such mitigation (see [reliability engineering](#reliability-engineering)). Chat, long agent runs and batch jobs have different latency needs, so give each class its own SLOs and its own queue or consumer pool, so that one class cannot spend another's budget ([Microsoft, “Priority Queue pattern”](https://learn.microsoft.com/en-us/azure/architecture/patterns/priority-queue)).

## Planned visuals

- **`calculator`:** error budget and burn rate: SLO target, window and request volume give the allowed failures, the burn rate of a given error rate, the time until the budget is gone, and the budget spent before a 14.4x alert fires.
- **`chart`:** the error budget remaining over a 30-day window, with a slow burn and a fast incident, and where the 1-hour and 6-hour burn-rate alerts would fire on each.
- **`calculator`:** composed availability of a chat request through gateway, retrieval and one model provider in series, then with a parallel fallback provider, showing why a fallback raises the ceiling only if it is independent and tested.

## Talk like an expert

Practitioners speak in **SLIs**, **SLOs**, **error budgets**, **burn rate**, **multiwindow alerts** and **budget policy**, and they always quote a target with its percentile and window, never alone. They count a confident wrong answer as budget spent, keep the SLA (the promise with money attached) looser than the internal SLO, and ask of every provider SLA what it does not count.

## Go deeper

- [Google SRE book, “Service Level Objectives”](https://sre.google/sre-book/service-level-objectives/): the definitions and how to choose targets.
- [Google SRE workbook, “Alerting on SLOs”](https://sre.google/workbook/alerting-on-slos/): burn rate and the multiwindow, multi-burn-rate parameters.
- [Google SRE workbook, “Example Error Budget Policy”](https://sre.google/workbook/error-budget-policy/): what a team agrees to do when the budget is spent.
- [Treynor et al., “The Calculus of Service Availability” (2017)](https://sre.google/static/pdf/calculus_of.pdf): availability across dependencies and the rule of the extra nine.

## Related

- [Reliability engineering](#reliability-engineering)
- [Latency and throughput](#latency-throughput)
- [Incidents and on-call](#incidents-on-call)
- [Online evaluation](#online-evaluation)
- [Rate limits, quotas and overload control](#rate-limits-overload)
- [Cost and capacity](#cost-capacity)
