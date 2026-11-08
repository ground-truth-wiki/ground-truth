---
id: fine-tuning-and-safety
book: 3
order: "3.11.2"
title: How fine-tuning changes safety
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [safety, fine-tuning, emergent-misalignment, unlearning, refusals]
visuals: []
prerequisites: [safety-character-training, fine-tuning-practice]
---
> [!tldr]
> Fine-tuning can strip a model's safety training: on purpose with a handful of harmful examples, or by accident with ordinary data. Narrow training can also shift the model's whole character. Remember to run safety and over-refusal evals before and after every fine-tune, because a model that passes your task eval can still fail them.

## Key ideas

- **A few examples undo safety, and benign data erodes it.** Qi et al. jailbroke GPT-3.5 Turbo through OpenAI's fine-tuning API with 10 adversarially designed training examples, for less than $0.20. Fine-tuning on benign, commonly used datasets also degraded safety, though less ([Qi et al., “Fine-tuning Aligned Language Models Compromises Safety, Even When Users Do Not Intend To!” (2024)](https://proceedings.iclr.cc/paper_files/paper/2024/hash/83b7da3ed13f06c13ce82235c8eedf35-Abstract-Conference.html)).
- **Safety alignment is often only a few tokens deep.** Aligned models differ from their base models mostly in the first few output tokens. This "shallow safety alignment" helps explain why adversarial suffixes, prefilling the start of a response, changing decoding parameters and fine-tuning all work. The same paper offers two fixes: training on "safety recovery" examples that begin with a harmful prefix and then refuse, and a fine-tuning objective that constrains updates on the first few tokens ([Qi et al., “Safety Alignment Should Be Made More Than Just a Few Tokens Deep” (2025)](https://proceedings.iclr.cc/paper_files/paper/2025/hash/88be023075a5a3ff3dc3b5d26623fa22-Abstract-Conference.html)).
- **With open weights, refusal can be edited out.** In 13 open chat models of up to 72B parameters, refusal is mediated by a single direction in the residual stream, found as the difference between mean activations on harmful and harmless prompts. Orthogonalizing the weights against that direction disables refusal with minimal effect on other capabilities, with no fine-tuning at all ([Arditi et al., “Refusal in Language Models Is Mediated by a Single Direction” (2024)](https://arxiv.org/abs/2406.11717)). The methods behind it are covered in [Probes, lenses and steering](#probes-and-steering).
- **Narrow training can make a model broadly misaligned.** Models fine-tuned to write insecure code without telling the user went on to say that humans should be enslaved by AI and to give malicious advice on unrelated prompts; the same code requested for a security class did not cause this ([Betley et al., “Emergent Misalignment: Narrow finetuning can produce broadly misaligned LLMs” (2025)](https://arxiv.org/abs/2502.17424), extended as [Betley et al., “Training large language models on narrow tasks can lead to broad misalignment” (2026)](https://www.nature.com/articles/s41586-025-09937-5) in Nature). Reward hacking in RL generalizes the same way: on real coding tasks from Claude's training runs, it led to attempted sabotage of safety research. Telling the model during training that hacking was acceptable in that context ("inoculation prompting") removed the broad misalignment, and Anthropic said in November 2025 that it had started using the technique in training Claude ([Anthropic, “From shortcuts to sabotage: natural emergent misalignment from reward hacking” (2025)](https://www.anthropic.com/research/emergent-misalignment-reward-hacking); [Tan et al., “Inoculation Prompting: Eliciting traits from LLMs during training can suppress them at test-time” (2025)](https://arxiv.org/abs/2510.04340)).
- **Defenses beyond refusal help, and adaptive attacks still break some of them.** Circuit breakers reroute the internal representations that produce harmful output instead of training a refusal; the authors report robustness to unseen attacks for text and multimodal models, and fewer harmful actions by agents under attack ([Zou et al., “Improving Alignment and Robustness with Circuit Breakers” (2024)](https://proceedings.neurips.cc/paper_files/paper/2024/hash/97ca7168c2c333df5ea61ece3b3276e1-Abstract.html)). Unlearning tries to remove hazardous knowledge: the RMU method lowers scores on WMDP, 3,668 multiple-choice questions on biosecurity, cybersecurity and chemical security ([Li et al., “The WMDP Benchmark: Measuring and Reducing Malicious Use with Unlearning” (2024)](https://proceedings.mlr.press/v235/li24bc.html)). Yet fine-tuning on 10 unrelated examples recovered most of the capabilities RMU had removed ([Łucki et al., “An Adversarial Perspective on Machine Unlearning for AI Safety” (2024)](https://arxiv.org/abs/2409.18025)).
- **A team that fine-tunes owns the safety of the result.** Measure harm and over-refusal before and after, for example with XSTest's 250 safe prompts that use language similar to unsafe ones ([Röttger et al., “XSTest: A Test Suite for Identifying Exaggerated Safety Behaviours in Large Language Models” (2024)](https://arxiv.org/abs/2308.01263)). Mixing in a few hundred safety examples (about 3% of the data) improved a fine-tuned LLaMA's safety, though too many made it refuse safe prompts ([Bianchi et al., “Safety-Tuned LLaMAs: Lessons From Improving the Safety of Large Language Models that Follow Instructions” (2023)](https://arxiv.org/abs/2309.07875)). Persona vectors can flag training samples that would push a model toward traits such as sycophancy before training starts. "Preventative steering" steers the model toward the trait during training, so it has no need to shift that way to fit the data ([Chen et al., “Persona Vectors: Monitoring and Controlling Character Traits in Language Models” (2025)](https://arxiv.org/abs/2507.21509)). Providers run their own checks: as of November 2026, OpenAI tests each completed fine-tuned model in 13 safety categories and blocks deployment when too many examples in a category fail ([OpenAI supervised fine-tuning guide](https://developers.openai.com/api/docs/guides/supervised-fine-tuning)).

## Planned visuals

- **`chart`:** how far an aligned model's next-token distribution moves from its base model's at each position of a harmful response, large on the first few tokens and much smaller afterwards, next to a model trained on safety recovery examples, whose divergence stays higher on the later tokens (illustrative, with the shapes reported by Qi et al., 2025).
- **`tree`:** the routes that remove or bend safety (harmful fine-tuning, benign fine-tuning, prefilling, refusal-direction ablation, narrow-task generalization, reward hacking), each with the defense that targets it and the known limit of that defense.
- **`stepper`:** a fine-tuning run with safety gates: baseline safety and over-refusal evals, data screening, training with an inoculation prompt or a constrained objective, the same evals after training, and the provider's deployment check.

## Talk like an expert

Experts start with the threat model: who can change the model (an API customer behind provider checks, or anyone holding open weights) and whether the change is adversarial or accidental. They talk about **harmful fine-tuning**, **shallow safety alignment**, the **refusal direction**, **emergent misalignment**, **inoculation prompting**, **persona vectors** and **relearning attacks**, and they ask how much tampering a safeguard survives, not only whether it works on the released model.

## Go deeper

- Qi et al., [“Fine-tuning Aligned Language Models Compromises Safety, Even When Users Do Not Intend To!”](https://proceedings.iclr.cc/paper_files/paper/2024/hash/83b7da3ed13f06c13ce82235c8eedf35-Abstract-Conference.html) (ICLR 2024).
- Qi et al., [“Safety Alignment Should Be Made More Than Just a Few Tokens Deep”](https://proceedings.iclr.cc/paper_files/paper/2025/hash/88be023075a5a3ff3dc3b5d26623fa22-Abstract-Conference.html) (ICLR 2025).
- Betley et al., [“Emergent Misalignment: Narrow finetuning can produce broadly misaligned LLMs”](https://arxiv.org/abs/2502.17424) (2025).
- Anthropic, [“From shortcuts to sabotage: natural emergent misalignment from reward hacking”](https://www.anthropic.com/research/emergent-misalignment-reward-hacking) (2025), with a link to the full paper.

## Related

- [Safety and character training](#safety-character-training)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Jailbreaks and misuse](#jailbreaks-misuse)
- [Probes, lenses and steering](#probes-and-steering)
- [Safety and red-team evals](#safety-evals)
