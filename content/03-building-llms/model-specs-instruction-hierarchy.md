---
id: model-specs-instruction-hierarchy
book: 3
order: "3.11.1"
title: Model specs, constitutions and the instruction hierarchy
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [model-spec, constitution, instruction-hierarchy, character-training, safety]
visuals: []
prerequisites: [safety-character-training]
---
> [!tldr]
> A model spec or constitution is a public document in which a lab writes down how its models should behave and whose instructions win when they conflict. Labs turn these documents into training data and rewards, and the instruction hierarchy (system above developer above user above tool output) is the part application engineers feel most directly. The one thing to remember: the hierarchy is a trained tendency, not a guarantee; it makes prompt injection and system-prompt extraction harder but does not stop them.

## Key ideas

- **From written principles to training data.** Constitutional AI uses "a list of rules or principles" as the only human oversight of harmlessness: the model critiques and revises its own answers for supervised training, then AI preferences train a preference model that serves as the reward for reinforcement learning ([Bai et al., “Constitutional AI: Harmlessness from AI Feedback” (2022)](https://arxiv.org/abs/2212.08073)). Deliberative alignment teaches OpenAI's o-series models the safety specifications themselves and trains them to "explicitly recall and accurately reason over the specifications before answering", without human-written chains of thought ([Guan et al., “Deliberative Alignment: Reasoning Enables Safer Language Models” (2024)](https://arxiv.org/abs/2412.16339)).
- **From written principles to rewards.** Rule Based Rewards turn "fine-grained, composable, LLM-graded few-shot prompts" about desired and undesired behavior into rewards for reinforcement learning, needing only a small amount of human data ([Mu et al., “Rule Based Rewards for Language Model Safety” (2024)](https://arxiv.org/abs/2411.01111)). Safe-completion training centers on the safety of the output rather than a binary judgment of the user's intent, so the model seeks the most helpful answer within the policy, and OpenAI reports using it in GPT-5 ([Yuan et al., “From Hard Refusals to Safe-Completions: Toward Output-Centric Safety Training” (2025)](https://arxiv.org/abs/2508.09224)).
- **OpenAI's Model Spec.** The version of 29 October 2026, the one model-spec.openai.com pointed to as of November 2026, ranks instructions in a chain of command with the authority levels Root, System, Developer, User and Guideline; assistant and tool messages, and quoted or untrusted text and multimodal data, have no authority unless an applicable instruction delegates it. Its red-line principles, such as never facilitating "critical and high severity harms", apply "across all deployments"; root-level instructions "cannot be overridden by conversational context", while user-level and guideline-level defaults can be; the spec is public domain (CC0), and OpenAI notes that production models do not yet fully reflect it ([OpenAI Model Spec, 2026-10-29](https://model-spec.openai.com/2026-10-29.html)).
- **Claude's constitution.** As of November 2026, the current version is from January 2026 and is published under CC0 ([anthropics/claude-constitution](https://github.com/anthropics/claude-constitution)). It asks Claude to prioritize being broadly safe first, broadly ethical second and following Anthropic's guidelines third, ahead of helpfulness, in a way that is "holistic rather than strict"; it treats instructions inside tool results and documents as information rather than commands; and it sets hard constraints, such as never giving serious uplift toward biological, chemical, nuclear or radiological weapons, that "cannot be unlocked by any operator or user" ([Claude's constitution, January 2026 text](https://raw.githubusercontent.com/anthropics/claude-constitution/main/20260120-constitution.md)).
- **Training the instruction hierarchy.** Wallace et al. define the order as "system messages take precedence over user messages, and user messages take precedence over third-party content", build training data with synthetic data and context distillation (follow lower-level instructions that agree, answer as if misaligned ones were never seen), and report for GPT-3.5 a 63% better defense against system-prompt extraction, over 30% more robustness to unseen jailbreaks, and some regressions in over-refusal ([Wallace et al., “The Instruction Hierarchy: Training LLMs to Prioritize Privileged Instructions” (2024)](https://arxiv.org/abs/2404.13208v1)). Shipped chat formats encode it: OpenAI's harmony format for gpt-oss orders its roles system, developer, user, assistant, tool for resolving instruction conflicts ([OpenAI, harmony response format](https://developers.openai.com/cookbook/articles/openai-harmony)).
- **Character and persona training.** Open Character Training is an open implementation that shapes assistant personas with Constitutional AI and synthetic introspective data, tested on three open-weight models and 11 personas, and reports persona changes more robust to adversarial prompting than system prompts or activation steering ([Maiya et al., “Open Character Training: Shaping the Persona of AI Assistants through Constitutional AI” (2025)](https://arxiv.org/abs/2511.01689)). Persona vectors are directions in activation space for traits such as sycophancy, used to monitor shifts, to flag training data that would cause them, and to prevent them by steering during fine-tuning ([Chen et al., “Persona Vectors: Monitoring and Controlling Character Traits in Language Models” (2025)](https://arxiv.org/abs/2507.21509)).

## Planned visuals

- **`diagram`: the authority ladder.** Layers from Root and System down to User, Guideline and "no authority", with the harmony roles and an application's real inputs (system prompt, user turn, retrieved page, tool result) placed on the rung where each one sits; untrusted content carries its hatch pattern.
- **`stepper`: from spec to model.** A principle in the spec becomes synthetic prompts, critiques and revisions, rule-based rewards or spec-citing reasoning, and finally an eval that checks the trained model against the same principle.
- **`compare`: one injected tool result, two models.** An illustrative tool output containing an instruction, handled by a model that obeys it and by one trained on the hierarchy that treats it as data, with linked marks on the instruction and on each response.

## Talk like an expert

Experts talk about the chain of command, principals, authority levels and delegation, red lines versus overridable defaults, and context distillation. They treat a spec as a statement of intent that models are trained toward, never as a security boundary: application permissions should still assume the hierarchy will sometimes fail (see [prompt injection](#prompt-injection)).

## Go deeper

- [OpenAI Model Spec](https://model-spec.openai.com/2026-10-29.html), version of 29 October 2026.
- [Claude's constitution](https://github.com/anthropics/claude-constitution), version of January 2026.
- Wallace et al., [“The Instruction Hierarchy: Training LLMs to Prioritize Privileged Instructions”](https://arxiv.org/abs/2404.13208v1) (2024).
- Guan et al., [“Deliberative Alignment: Reasoning Enables Safer Language Models”](https://arxiv.org/abs/2412.16339) (2024).

## Related

- [Safety and character training](#safety-character-training)
- [Prompt injection](#prompt-injection)
- [Alignment concepts](#alignment-concepts)
- [Guardrails and control](#guardrails-control)
- [Chat templates, message roles and prompt formats](#chat-templates)
- [Model-specific notes](#model-specific-notes)
