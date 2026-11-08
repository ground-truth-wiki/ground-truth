---
id: cloud-ai-platforms
book: 4
order: "4.7.2"
title: Cloud AI platforms and inference providers
level: practitioner
stability: volatile
reviewed: "2026-11"
status: seed
tags: [cloud-platforms, inference-providers, bedrock, data-residency, model-hosting]
visuals: []
prerequisites: [model-apis]
---
> [!tldr]
> Besides the lab's own API, you can often call a model in three other ways: through a hyperscaler's model platform (Amazon Bedrock, Microsoft Foundry and Google's Gemini Enterprise Agent Platform, as of November 2026), through an independent inference provider or router, or on hardware you run yourself. Platforms bring your cloud's identity, networking, billing and data-processing terms, and providers bring choice by price and speed. Remember that the "same model" is not the same everywhere: model IDs, routing regions, features, safety filters, lifecycle dates and even quantization change with the host.

## Key ideas

- **A hyperscaler platform wraps the model in your cloud's plumbing.** In Microsoft Foundry, for example (as of November 2026), serverless deployments accept keys or Microsoft Entra sign-in, can sit behind a private endpoint, bill partner and community models through Azure Marketplace, and the Azure Machine Learning service "acts as the data processor" for the prompts and outputs ([Microsoft Foundry Models overview](https://learn.microsoft.com/en-us/azure/foundry/concepts/foundry-models-overview)).
- **Each platform is a catalog of first-party, partner and open models (as of November 2026).** Amazon Bedrock lists more than 100 foundation models from Amazon, Anthropic, DeepSeek, Moonshot AI, MiniMax, OpenAI, xAI and others ([What is Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)); Foundry splits more than 10,000 models into models "sold by Azure" with Microsoft support and models "from partners and community", including open models from the Hugging Face Hub ([Foundry Models overview](https://learn.microsoft.com/en-us/azure/foundry/concepts/foundry-models-overview)); and Google folded Vertex AI into the Gemini Enterprise Agent Platform on 22 April 2026, where Vertex AI Model Garden became "Model Garden" ([release notes](https://docs.cloud.google.com/gemini-enterprise-agent-platform/release-notes)).
- **Serverless access, dedicated compute and reserved capacity are different products.** In Foundry, a serverless deployment is billed for inputs and outputs, typically in tokens, on infrastructure Microsoft hosts, while managed compute deploys the weights to dedicated virtual machines and bills their core hours ([Foundry Models overview](https://learn.microsoft.com/en-us/azure/foundry/concepts/foundry-models-overview)). Google's Model as a Service (MaaS) gives serverless access to selected partner and open models, and some MaaS models are also available for self-deployment, from a different model card ([Use open models using Model as a Service (MaaS)](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/open-models/use-maas)). For steady high volume you can reserve capacity (as of November 2026): Bedrock sells Provisioned Throughput ([cross-Region inference](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html)) and Foundry sells provisioned throughput units with lower latency variance ([deployment types](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/deployment-types)).
- **Routing scope trades data residency against capacity and price.** Bedrock's geographic inference profiles keep processing inside a geography such as the US, EU or APAC, while global profiles route to any supported commercial Region for about 10% lower cost as of November 2026 ([Cross-Region inference](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html)); Foundry's Global, Data Zone and Standard deployment types make the same choice and keep stored data in your Azure geography, and a new model arrives on Global deployments first, then Data Zone, then geography-based ones ([deployment types](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/deployment-types)).
- **APIs, model IDs, lifecycles and filters belong to the platform.** As of November 2026, Bedrock's runtime serves its native Converse and Invoke APIs next to Messages, Responses and Chat Completions, with IDs such as `anthropic.…` or `global.anthropic.…` for a global inference profile ([What is Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)), and Bedrock says its lifecycle dates "may differ from dates published by model providers" ([Bedrock model lifecycle](https://docs.aws.amazon.com/bedrock/latest/userguide/model-lifecycle.html)). Foundry applies default Azure AI Content Safety filters to serverless language models, which you can turn off per endpoint and which are not enabled when you call the model through an API other than the Azure OpenAI v1 APIs ([Foundry Models overview](https://learn.microsoft.com/en-us/azure/foundry/concepts/foundry-models-overview)).
- **Independent providers and routers compete on price, speed and data policy, and the same open model can behave differently on each.** Hugging Face Inference Providers routes one OpenAI-compatible endpoint to many providers, picks the highest-throughput one by default (`:cheapest` and `:preferred` change that), and states no extra markup on provider rates as of November 2026 ([Inference Providers](https://huggingface.co/docs/inference-providers/index)); OpenRouter sorts providers by price, throughput or latency and can exclude those that collect data, require zero data retention, or filter by quantization from int4 to fp32 ([Provider routing](https://openrouter.ai/docs/guides/routing/provider-selection)). Moonshot AI's K2 Vendor Verifier reports "significant differences" in tool-call performance between the open-source engines and vendors serving Kimi K2, and its suggestions to vendors are to run the recommended engine versions, keep tool-call IDs in the format the model expects, and add guided decoding to enforce the tool schema ([K2-Vendor-Verifier](https://github.com/MoonshotAI/K2-Vendor-Verifier)).

## Planned visuals

- `matrix`: a dated decision table, as of November 2026, comparing the lab's first-party API, a cloud platform, an inference provider or router, and self-hosting on data terms, residency options, feature freshness, price levers, model choice and operational effort.
- `diagram`: where a model call goes, from weights published on a hub or by a lab, through cloud catalogs and inference providers, to your gateway and app, with each layer opening its chapter.
- `compare`: one request under a geographic versus a global inference profile, side by side: where it may be processed, where data rests, what the audit log shows, and the price difference.

## Talk like an expert

Experts say **Model-as-a-Service**, **serverless versus managed compute**, **inference profile**, **data zone**, **provisioned throughput** and **zero data retention**, and before comparing prices they ask three questions: where is the request processed, who is the data processor, and which build and quantization of the model is actually served?

## Go deeper

- AWS, [Cross-Region inference](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html) and [Model lifecycle](https://docs.aws.amazon.com/bedrock/latest/userguide/model-lifecycle.html) in the Amazon Bedrock User Guide.
- Microsoft, [Understanding deployment types in Microsoft Foundry Models](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/deployment-types).
- Hugging Face, [Inference Providers documentation](https://huggingface.co/docs/inference-providers/index).
- OpenRouter, [Provider routing](https://openrouter.ai/docs/guides/routing/provider-selection).

## Related

- [Model APIs in practice](#model-apis)
- [Gateways and routers](#gateways-routers)
- [Choosing a model](#choosing-a-model)
- [Model versions, previews and deprecations](#model-lifecycle)
- [Enterprise readiness](#enterprise-readiness)
- [Model hubs and the Hugging Face ecosystem](#hugging-face-ecosystem)
