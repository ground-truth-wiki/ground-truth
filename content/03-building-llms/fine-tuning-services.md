---
id: fine-tuning-services
book: 3
order: "3.10.2"
title: Managed and reinforcement fine-tuning services
level: practitioner
stability: volatile
reviewed: "2026-11"
status: seed
tags: [fine-tuning, reinforcement-fine-tuning, graders, managed-services, lock-in]
visuals: []
prerequisites: [fine-tuning-practice]
---
> [!tldr]
> Managed fine-tuning services take your dataset, train on the provider's GPUs and hand back a model you call through their API or, with some services, weights you can download. They offer supervised, preference and reinforcement fine-tuning, where a grader you write scores each sampled answer. The one thing to remember: a hosted fine-tune lives and dies with its base model and its provider, so keep your data, graders and evals portable, and always compare against a well-prompted baseline.

## Key ideas

- **The shape of a job.** A typical managed reinforcement fine-tuning job uploads JSONL training data with reference answers, deploys a reward function, creates the job with one API call, is monitored through events and checkpoints, and ends in on-demand inference with no endpoint to provision; that is the workflow AWS describes for Amazon Bedrock, which uses GRPO as the training algorithm ([Subramanian et al., “Reinforcement fine-tuning on Amazon Bedrock with OpenAI-Compatible APIs: a technical walkthrough” (AWS, 25 March 2026)](https://aws.amazon.com/blogs/machine-learning/reinforcement-fine-tuning-on-amazon-bedrock-with-openai-compatible-apis-a-technical-walkthrough/)). Vertex AI saves checkpoints during tuning, by epoch for supervised tuning and by step interval for reinforcement tuning, so you can compare them before choosing one ([Vertex AI documentation: tune Gemini models](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/tune-models)).
- **Three methods.** As of November 2026, Vertex AI offers supervised fine-tuning on "hundreds to thousands of labeled examples", preference tuning on chosen and rejected responses, and reinforcement learning fine-tuning that scores sampled responses with reward functions and "updates a parameter-efficient LoRA adapter", from "dozens to a few hundred prompts"; each method supports a different list of Gemini models ([Vertex AI documentation](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/tune-models)). OpenAI's optimization guide lists supervised, vision and direct preference optimization (DPO) fine-tuning, and puts evals and prompting before fine-tuning ([OpenAI model optimization guide](https://developers.openai.com/api/docs/guides/model-optimization)).
- **Graders and reward functions.** OpenAI's graders compare a model's answer with a reference and return a score from 0 to 1, as a string check, a text-similarity metric, a score from another model, or a Python `grade` function, and its API has `validate` and `run` endpoints to check a grader on a sample answer ([OpenAI graders guide](https://developers.openai.com/api/docs/guides/graders)). Bedrock rewards come from an AWS Lambda function, such as one that returns 1.0 for a correct answer and 0.0 otherwise, or from a model-as-a-judge grader for subjective tasks ([AWS (2026)](https://aws.amazon.com/blogs/machine-learning/reinforcement-fine-tuning-on-amazon-bedrock-with-openai-compatible-apis-a-technical-walkthrough/)).
- **OpenAI is winding down self-serve fine-tuning.** As of November 2026: on 7 May 2026, OpenAI stopped new fine-tuning for organizations that had never run it; from 2 July 2026, organizations that had not run inference on a fine-tuned model in the past 60 days could no longer create jobs; active customers can no longer create new jobs from 6 January 2027; and inference on a fine-tuned model is disabled "only when the underlying base model is deprecated" ([OpenAI API deprecations](https://developers.openai.com/api/docs/deprecations)). Its graders guide says graders are being deprecated along with the evals and fine-tuning workflows they support ([OpenAI graders guide](https://developers.openai.com/api/docs/guides/graders)).
- **Other managed and open options.** Bedrock's reinforcement fine-tuning launched with Amazon Nova models in December 2025 and added open-weight models such as GPT OSS 20B and Qwen 3 32B in February 2026 ([AWS (2026)](https://aws.amazon.com/blogs/machine-learning/reinforcement-fine-tuning-on-amazon-bedrock-with-openai-compatible-apis-a-technical-walkthrough/)). Thinking Machines' Tinker, generally available since 12 December 2025 ([SiliconANGLE, 12 December 2025](https://siliconangle.com/2025/12/12/thinking-machines-makes-tinker-ai-fine-tuning-service-generally-available/)), is a LoRA training API over open-weight models with low-level calls such as `forward_backward`, `optim_step` and `sample`, and an endpoint to download any saved checkpoint ([Thinking Machines, Tinker](https://thinkingmachines.ai/tinker/)).
- **Lock-in, cost and the baseline.** A hosted fine-tune is tied to its base model: OpenAI's deprecation notices say fine-tuned versions follow their base model's shutdown schedule ([OpenAI API deprecations](https://developers.openai.com/api/docs/deprecations)), while a downloadable LoRA adapter on an open-weight base can be served elsewhere. Pricing can be per token rather than per GPU-hour: Tinker, for example, bills training, sampling and prefill per million tokens and charges $0.10 per GB per month for checkpoint storage, as of November 2026 ([Thinking Machines, Tinker](https://thinkingmachines.ai/tinker/)).

## Planned visuals

- **`sequence`: a managed reinforcement fine-tuning job.** The client uploads data and a grader, the service samples answers, the grader scores them, checkpoints are saved, and the result is deployed for inference or downloaded; each message shows its payload.
- **`matrix`: managed fine-tuning services, dated.** Rows for the services covered here, columns for methods (supervised, preference, reinforcement), grader types, weight export and base-model retirement policy, stamped with the review date.
- **`timeline`: the fine-tuning landscape in 2025 and 2026.** Tinker's general availability, Bedrock's reinforcement fine-tuning launches, and OpenAI's wind-down dates.

## Talk like an expert

Practitioners talk about graders, reward functions, checkpoints, exportable weights and base-model retirement, and treat a managed fine-tune as a dependency with an end-of-life date. Their first question is not only "how much better is it than the prompted baseline?" but "where do the weights live when the base model or the service goes away?"

## Go deeper

- [OpenAI API deprecations](https://developers.openai.com/api/docs/deprecations), the section on self-serve fine-tuning.
- [Vertex AI documentation on tuning Gemini models](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/tune-models).
- Subramanian et al., [“Reinforcement fine-tuning on Amazon Bedrock with OpenAI-Compatible APIs: a technical walkthrough”](https://aws.amazon.com/blogs/machine-learning/reinforcement-fine-tuning-on-amazon-bedrock-with-openai-compatible-apis-a-technical-walkthrough/) (AWS, 2026).
- [Thinking Machines, Tinker](https://thinkingmachines.ai/tinker/).

## Related

- [Fine-tuning in practice](#fine-tuning-practice)
- [Parameter-efficient fine-tuning methods](#peft-methods)
- [RL with verifiable rewards and reasoning models](#rlvr-reasoning)
- [RL environment harnesses](#rl-environment-harnesses)
- [Model versions, previews and deprecations](#model-lifecycle)
- [Cloud AI platforms and inference providers](#cloud-ai-platforms)
