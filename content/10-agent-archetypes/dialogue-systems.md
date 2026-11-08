---
id: dialogue-systems
book: 10
order: "10.5.1"
title: "Task-oriented dialogue: from intents and slots to LLM agents"
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [dialogue-systems, intent-classification, slot-filling, conversational-ai, support-agents]
visuals: []
prerequisites: [support-agents]
---
> [!tldr]
> Before LLMs, a task-oriented dialogue system was a pipeline: classify the user's intent and fill slots, track the dialogue state, choose the next action with a policy, and generate a reply. LLMs now take over much of the understanding, but the old parts did not vanish: hybrid designs still run the business logic, such as authentication, as deterministic flows. Remember the split: let the model understand the conversation, and let code decide what the business allows.

## Key ideas

- **The classic pipeline has four modules.** Pipeline systems split into natural-language understanding (NLU), dialog state tracking (DST), dialog policy and natural-language generation (NLG); NLU decomposes into intent detection, framed as classification, and slot-value extraction, framed as sequence labeling, and most recent DST work represents the state as a belief state of slot-value pairs for the user's goal (Zhang et al., [“Recent Advances and Challenges in Task-oriented Dialog System”](https://arxiv.org/abs/2003.07490) (2020)). The same survey notes that the modular structure is more interpretable and stable than end-to-end models, which is why most commercial systems were built this way.
- **Wizard-of-Oz data made the field measurable.** MultiWOZ holds about 10k human-human written dialogues spanning multiple domains, collected Wizard-of-Oz style through crowdsourcing and labeled with belief states and dialogue acts, with baselines for belief tracking, dialogue-act prediction and response generation (Budzianowski et al., [“MultiWOZ – A Large-Scale Multi-Domain Wizard-of-Oz Dataset for Task-Oriented Dialogue Modelling”](https://arxiv.org/abs/1810.00278) (2018)).
- **An intent classifier must know when to say “I don't know”.** The CLINC150 dataset covers 150 intents across 10 domains plus queries that fit none of them, and classifiers that do well in scope struggle to spot those out-of-scope queries (Larson et al., [“An Evaluation Dataset for Intent Classification and Out-of-Scope Prediction”](https://arxiv.org/abs/1909.02027) (2019)). Platforms make the fallback explicit: Dialogflow CX matches an intent from its training phrases only if its confidence score, from 0.0 to 1.0, meets the classification threshold, and otherwise fires a no-match event ([Dialogflow CX intents](https://docs.cloud.google.com/dialogflow/cx/docs/concept/intent)).
- **Hybrid designs keep business logic in flows and use an LLM to understand.** Bocklisch et al. pair in-context learning with deterministic execution of business logic: the LLM translates between the conversation and a domain-specific language that drives the logic, and they report that such assistants take significantly less effort to build than established approaches and handle complex dialogues that are very hard for NLU-based systems (Bocklisch et al., [“Task-Oriented Dialogue with In-Context Learning”](https://arxiv.org/abs/2402.12234) (2024)). In Rasa, a flow is a structured sequence of steps, collect steps store user input in slots, a flow can call another flow such as user authentication mid-conversation, and an LLM generates internal commands for how the user wants to progress while staying within the business logic the flows define ([Rasa, “Designing the logic behind conversations”](https://rasa.com/docs/learn/concepts/dialogue-management)). Anthropic draws the same line in general terms: workflows offer predictability and consistency for well-defined tasks, and agents fit where flexibility and model-driven decisions are needed ([Anthropic, “Building effective agents”](https://www.anthropic.com/engineering/building-effective-agents) (2024); see [workflow patterns](#workflow-patterns)).
- **Evaluate with policies and simulated users, next to business metrics.** τ-bench puts an agent with domain tools and policy guidelines in conversation with a language-model-simulated user and adds pass^k for reliability across trials; GPT-4o function-calling agents solved fewer than half the tasks, with pass^8 below 25% in retail (Yao et al., [“τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains”](https://arxiv.org/abs/2406.12045) (2024)), and τ²-bench adds a telecom domain where the user also acts with tools, where agents drop significantly from no-user to dual-control settings (Barres et al., [“τ²-Bench: Evaluating Conversational Agents in a Dual-Control Environment”](https://arxiv.org/abs/2506.07982) (2025)). Contact centers report their own outcomes alongside: AWS's case metrics for Connect Customer, for example, count a closed case as resolved on first contact when it had exactly one call, chat or email ([Connect Customer Cases metrics](https://docs.aws.amazon.com/connect/latest/adminguide/case-management-metrics.html)).

## Planned visuals

- `diagram`: the classic pipeline (NLU with intent and slots, state tracker, policy, generator) beside a hybrid design where an LLM issues commands into deterministic flows, as two variants with the same user turn flowing through each.
- `stepper`: one booking conversation turn by turn, showing the intent, the filled slots and the belief state after each turn, a no-match turn below the threshold, and the repair that follows.
- `tree`: a decision guide for migrating an intent bot or IVR menu: which intents stay as flows (authentication, regulated scripts, payments), which become agent tasks, and which logs become the first eval set.

## Talk like an expert

Experts talk about **intents** and **slots**, **training phrases**, the **classification threshold** and **no-match** handling, **belief states** and **dialogue acts**, **out-of-scope detection**, **flows** and **collect steps**, and **simulated users**, and they frame the LLM migration as moving understanding into the model while keeping the business rules where they can be tested.

## Go deeper

- Zhang et al., [“Recent Advances and Challenges in Task-oriented Dialog System”](https://arxiv.org/abs/2003.07490) (2020).
- Budzianowski et al., [“MultiWOZ – A Large-Scale Multi-Domain Wizard-of-Oz Dataset for Task-Oriented Dialogue Modelling”](https://arxiv.org/abs/1810.00278) (2018).
- Bocklisch et al., [“Task-Oriented Dialogue with In-Context Learning”](https://arxiv.org/abs/2402.12234) (2024).
- Barres et al., [“τ²-Bench: Evaluating Conversational Agents in a Dual-Control Environment”](https://arxiv.org/abs/2506.07982) (2025).

## Related

- [Customer-support and enterprise workflow agents](#support-agents)
- [Voice and realtime agents](#voice-agents)
- [Telephony and transport for voice agents](#voice-telephony)
- [Workflow patterns](#workflow-patterns)
- [Evaluating agents](#evaluating-agents)
