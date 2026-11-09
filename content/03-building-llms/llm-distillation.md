---
id: llm-distillation
book: 3
order: "3.9.1"
title: "Distillation for LLMs: soft labels, on-policy and multi-teacher"
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [distillation, on-policy-distillation, kl-divergence, post-training, small-models]
visuals: []
prerequisites: [distillation-merging]
---
> [!tldr]
> Distillation trains a student model to imitate a teacher: on the teacher's full next-token distributions, on text the teacher wrote, or on the student's own samples graded token by token by the teacher. The on-policy form removes exposure bias and gives an RL-like run with a dense signal at a fraction of RL's cost, and since 2026 it also merges several specialist teachers into one model. Remember the practical gates: a shared tokenizer or a cross-tokenizer method, access to the teacher's log-probabilities, and the teacher's terms of use.

## Key ideas

- **Three main forms for language models.** Word-level or logit distillation matches the teacher's per-token distribution over the vocabulary on fixed text; sequence-level distillation trains on teacher-generated sequences, approximating the teacher's distribution over sequences with a single high-probability output, which is what SFT on teacher outputs does; on-policy distillation lets the student generate and the teacher score its tokens ([Lambert, “Synthetic Data & Distillation”, RLHF book](https://rlhfbook.com/c/12-synthetic-data)). Kim and Rush introduced the sequence-level form for translation, where their best student ran about 10 times faster than its teacher with little loss in quality ([Kim and Rush, “Sequence-Level Knowledge Distillation” (2016)](https://arxiv.org/abs/1606.07947)).
- **Forward KL covers modes; reverse KL seeks them.** Training on teacher text with cross-entropy minimizes the forward KL from teacher to student, which can make a small student overestimate the teacher's low-probability regions; MiniLLM switches to reverse KL, optimized on the student's own samples, and reports lower exposure bias and better calibration from 120M to 13B parameters ([Gu et al., “MiniLLM: On-Policy Distillation of Large Language Models” (2023)](https://arxiv.org/abs/2306.08543)). GKD allows other divergences, including a generalized Jensen-Shannon divergence that interpolates between the two, which can help when the student lacks the capacity to mimic the teacher ([Agarwal et al., “On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes” (2023)](https://arxiv.org/abs/2306.13649)); the theory is in [information theory for language models](#information-theory-for-llms).
- **Exposure bias is the imitation-learning problem again.** A student trained only on teacher text never sees the states its own mistakes lead to; in imitation learning, Ross et al. pointed out that such sequential prediction breaks the usual i.i.d. assumption and trained the learner under the distribution of observations its own policy induces ([Ross et al., “A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning” (AISTATS 2011)](https://arxiv.org/abs/1011.0686)). GKD applies the same idea by training the student on its self-generated outputs with feedback from the teacher ([Agarwal et al. (2023)](https://arxiv.org/abs/2306.13649)), and the RLHF book stresses that the imitation-learning bounds are an analogy for LLMs, not a guarantee ([Lambert, RLHF book](https://rlhfbook.com/c/12-synthetic-data)); see [imitation learning and offline RL](#imitation-offline-rl).
- **On-policy distillation is RL with a dense reward.** Thinking Machines' recipe uses the negative per-token reverse KL between student and teacher as the advantage in an RL loss, so every token the student writes gets graded ([Lu, “On-Policy Distillation”, Thinking Machines Lab (2025)](https://thinkingmachines.ai/blog/on-policy-distillation/)). In the Qwen3 report, on-policy distillation of Qwen3-8B reached 74.4 on AIME'24 in 1,800 GPU hours, against 67.6 in 17,920 GPU hours for RL from the same checkpoint; Qwen3's small models came from this strong-to-weak route, first off-policy on teacher outputs, then on-policy KL alignment to Qwen3-32B or Qwen3-235B-A22B ([Yang et al., “Qwen3 Technical Report” (2025)](https://arxiv.org/html/2505.09388)).
- **Several teachers, or the model as its own teacher.** Multi-teacher on-policy distillation (MOPD), introduced in 2026, trains domain teachers with separate RL runs and distills them on-policy into one student; on Qwen3-30B-A3B it beat mixed RL, cascaded RL, off-policy fine-tuning and weight merging while keeping nearly all of each teacher's capability, and it was used to post-train MiMo-V2-Flash ([Ma et al., “MOPD: Multi-Teacher On-Policy Distillation for Capability Integration in LLM Post-Training” (2026)](https://arxiv.org/abs/2606.30406); [Xiaomi LLM-Core Team, “MiMo-V2-Flash Technical Report” (2026)](https://arxiv.org/abs/2601.02780)). Self-distillation gives one model both roles: SDPO conditions the current model on feedback such as runtime errors or judge evaluations (successful rollouts can stand in as feedback for failed ones), and distills those feedback-informed predictions back into the policy ([Hübotter et al., “Reinforcement Learning via Self-Distillation” (2026)](https://arxiv.org/abs/2601.20802)).
- **Tokenizers, log-probabilities and terms of use decide what is possible.** Per-token methods need teacher log-probabilities on the student's tokens, so they usually require a shared tokenizer ([Lambert, RLHF book](https://rlhfbook.com/c/12-synthetic-data)); as of November 2026, TRL's stable DistillationTrainer requires the teacher to share the student's vocabulary, while its experimental GOLDTrainer aligns different tokenizers ([Hugging Face TRL, Distillation Trainer](https://huggingface.co/docs/trl/distillation_trainer); [Hugging Face TRL, GOLD Trainer](https://huggingface.co/docs/trl/gold_trainer)). Sequence-level distillation from an API model needs only text, but terms can forbid it: as of November 2026, Anthropic's Commercial Terms (effective June 17, 2025) say customers may not access the services "to build a competing product or service, including to train competing AI models or resell the Services except as expressly approved by Anthropic" ([Anthropic, Commercial Terms of Service](https://www.anthropic.com/legal/commercial-terms)).

## Planned visuals

- **`compare`:** off-policy distillation (the teacher writes, the student imitates) beside on-policy distillation (the student writes, the teacher grades each token), with linked highlights on where exposure bias comes from.
- **`stepper`:** one on-policy distillation step: the student samples a completion, the teacher scores each token, the per-token reverse KL becomes the advantage, and the update lowers the probability of the first token where the student went wrong (illustrative).
- **`diagram`:** multi-teacher on-policy distillation: several RL-trained domain teachers grading one student's rollouts, next to the alternatives it was compared with (mixed RL, cascaded RL, weight merging), with links to their chapters.

## Talk like an expert

Experts talk about teacher and student, soft labels, logit and sequence-level distillation, forward and reverse KL, mode-seeking, exposure bias, on-policy distillation, GKD, MOPD, strong-to-weak distillation, self-distillation and shared tokenizers. They ask whether a model was distilled off-policy or on-policy, from which teacher and with which divergence, and whether the terms allowed it.

## Go deeper

- Lambert, [“Synthetic Data & Distillation”](https://rlhfbook.com/c/12-synthetic-data), chapter of the RLHF book.
- Agarwal et al., [“On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes”](https://arxiv.org/abs/2306.13649) (2023).
- Gu et al., [“MiniLLM: On-Policy Distillation of Large Language Models”](https://arxiv.org/abs/2306.08543) (2023).
- Lu, [“On-Policy Distillation”](https://thinkingmachines.ai/blog/on-policy-distillation/), Thinking Machines Lab (2025).

## Related

- [Distillation, merging and compression](#distillation-merging)
- [Information theory for language models](#information-theory-for-llms)
- [Imitation learning and offline RL](#imitation-offline-rl)
- [Small and local models](#small-local-models)
- [Post-training: from base model to assistant](#post-training-overview)
- [Training reasoning models: cold starts, distillation and length control](#reasoning-training-recipes)
- [Playbook: LinkedIn LANTERN: distilling LLMs into small models for job-fit ratings and explanations](#linkedin-lantern-distillation)
