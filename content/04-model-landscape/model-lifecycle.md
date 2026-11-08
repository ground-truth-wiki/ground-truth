---
id: model-lifecycle
book: 4
order: "4.6.1"
title: Model versions, previews and deprecations
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [model-versions, deprecation, migration, aliases, lifecycle]
visuals: []
prerequisites: [choosing-a-model]
---
> [!tldr]
> Every hosted model has a lifecycle: it ships under an ID, often starts as a preview, becomes stable, is marked legacy or deprecated, and is finally retired, after which calls to it fail. Each provider and each cloud platform names these stages differently and sets its own notice periods. Pin a model ID, know its retirement date, and have a tested migration path before you need it.

## Key ideas

- **An ID is a snapshot; an alias is a pointer.** As of November 2026, Anthropic says each model ID identifies a pinned version: from the Claude 4.6 generation on, dateless IDs such as `claude-sonnet-4-6` are the pinned snapshots themselves, while for earlier models the Claude API also accepts dateless aliases such as `claude-sonnet-4-5`, which point to the most recent dated snapshot ([Anthropic, “Model IDs and versioning”](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions)). Also as of November 2026, Google's `latest` aliases are hot-swapped with every new release of a model variant, with two weeks' email notice, and Google recommends a specific stable model for most production apps ([Google AI Studio, “Models”](https://aistudio.google.com/docs/models)).
- **Fixed weights do not mean fixed behavior.** Anthropic states that the weights behind a model ID never change, but the serving infrastructure around them (the request router, safety classifiers and sampling logic) can, and it occasionally produces minor differences in observable behavior ([Anthropic, “Model IDs and versioning”](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions)). Keep evaluating a pinned model in production too ([Online evaluation](#online-evaluation)).
- **Release stages set expectations.** Google labels Gemini versions stable, preview, latest or experimental: preview models can serve production traffic but may have tighter rate limits and can be deprecated with at least two weeks' notice, and experimental models are typically not suitable for production (as of November 2026) ([Google AI Studio, “Models”](https://aistudio.google.com/docs/models)). OpenAI likewise says preview models can be retired on much shorter notice than generally available ones, for example two weeks (as of November 2026) ([OpenAI, “Deprecations”](https://developers.openai.com/api/docs/deprecations)).
- **Each provider and platform runs its own clock.** As of November 2026, Anthropic uses the states Active, Legacy, Deprecated and Retired and gives at least 60 days' notice before retiring a publicly released model; OpenAI promises at least six months' notice for generally available models and three months for specialized variants; and on Amazon Bedrock, models launched from 7 September 2026 move from Active to Legacy to End-of-Life, with a 6-month or 45-day Legacy period in which no new Provisioned Throughput can be created ([Anthropic, “Model deprecations”](https://platform.claude.com/docs/en/about-claude/model-deprecations); [OpenAI, “Deprecations”](https://developers.openai.com/api/docs/deprecations); [AWS, “Model lifecycle”](https://docs.aws.amazon.com/bedrock/latest/userguide/model-lifecycle.html)). Cloud platforms set their own dates: Anthropic notes that Bedrock and Google-managed Claude models follow their own retirement schedules, and AWS says only the dates on its model cards apply on Bedrock.
- **Endpoints and parameters retire too, and retirement need not mean deletion.** OpenAI shut down the Assistants API on 26 August 2026 in favor of the Responses and Conversations APIs, and Anthropic removed the `temperature`, `top_p` and `top_k` request parameters in API version `2026-10-21`, where sending them returns a 400 error ([OpenAI, “Deprecations”](https://developers.openai.com/api/docs/deprecations); [Anthropic, “Model deprecations”](https://platform.claude.com/docs/en/about-claude/model-deprecations)). Anthropic has also committed to preserving the weights of all publicly released models for at least the lifetime of the company, so a retired model is out of service but not destroyed ([Anthropic, “Commitments on model deprecation and preservation” (2025)](https://www.anthropic.com/research/deprecation-commitments)).
- **Migrate on a schedule, not in a panic.** Inventory usage by model and API key (Anthropic's Console offers a usage export for this), re-run your evals on the replacement well before the retirement date, re-tune prompts for it, then send it shadow or canary traffic behind your eval gates before you switch ([Anthropic, “Model deprecations”](https://platform.claude.com/docs/en/about-claude/model-deprecations); [CI/CD for AI](#ci-cd-for-ai)).

## Planned visuals

- **`timeline`:** one model's life from preview to retirement on a dated axis, with the notice windows of Anthropic, OpenAI and Amazon Bedrock taken from their policy pages.
- **`mermaid` (state diagram):** the lifecycle states of each provider side by side (Active, Legacy, Deprecated, Retired; Active, Legacy, End-of-Life), with the event that triggers each transition.
- **`stepper`:** the migration playbook, from the usage inventory through evals, prompt tuning, shadow traffic and canary to the switch and the rollback plan.

## Talk like an expert

Practitioners talk about **pinned snapshots** versus **aliases**, **deprecation** versus **retirement** (also **shutdown** or **end-of-life**), **notice periods** and **legacy periods**, and they treat a model upgrade as a deploy that passes the same eval gates as code. A good habit is to record the retirement date next to every model ID in your configuration ([Prompt and config management](#prompt-config-management)).

## Go deeper

- [Anthropic, “Model deprecations”](https://platform.claude.com/docs/en/about-claude/model-deprecations): lifecycle states, notice, usage audits and the full deprecation history.
- [OpenAI, “Deprecations”](https://developers.openai.com/api/docs/deprecations): definitions, notice periods and every model and endpoint shutdown.
- [AWS, “Model lifecycle”](https://docs.aws.amazon.com/bedrock/latest/userguide/model-lifecycle.html): how a cloud platform sets its own lifecycle for the same models.
- [Anthropic, “Commitments on model deprecation and preservation” (2025)](https://www.anthropic.com/research/deprecation-commitments): weight preservation and post-deployment reports.

## Related

- [Choosing a model](#choosing-a-model)
- [CI/CD for AI](#ci-cd-for-ai)
- [Prompt and config management](#prompt-config-management)
- [Cloud AI platforms and inference providers](#cloud-ai-platforms)
- [Model APIs in practice](#model-apis)
- [Frontier model families](#frontier-families)
