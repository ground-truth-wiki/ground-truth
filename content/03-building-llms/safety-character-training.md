---
id: safety-character-training
book: 3
order: "3.11"
title: Safety and character training
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [safety, refusals, model-spec]
visuals:
  - safety-layers-training:diagram
  - refusal-style:compare
---
> [!tldr]
> Safety and character are trained at every stage: filtered pretraining data, supervised examples of safe and helpful behavior, preference training with human and AI feedback guided by principles, adversarial training against jailbreaks, and separate classifiers. Modern approaches aim for helpful answers within limits rather than blanket refusals.

## Why it matters
How a model refuses, hedges, disagrees and behaves under pressure is designed, not accidental. Engineers building on models inherit these behaviors; understanding how they are trained explains over-refusal, sycophancy and robustness to attacks, and how system prompts interact with them.

## Intuition
Character training is upbringing, not a rulebook. A well-raised person handles situations no rule anticipated; a person who only memorized rules either refuses everything unusual or follows the letter of a rule into absurdity.

```viz
{"id":"safety-layers-training","component":"diagram","title":"Safety is built in layers from data to deployment","caption":"Each stage shapes behavior; classifiers at deployment add an independent check. Click a stage for its chapter.","alt":"Layered diagram of safety training: pretraining data filtering, supervised examples, preference training with principles, adversarial training and deployment classifiers.","data":"illustrative","w":560,"layer_h":46,"layers":[
{"id":"deploy","label":"Deployment classifiers","sub":"independent input and output checks","role":"tool","link":"#guardrails-control"},
{"id":"adv","label":"Adversarial training","sub":"red-team attacks become training data","role":"untrusted","link":"#red-teaming"},
{"id":"pref","label":"Preference training with principles","sub":"RLHF, Constitutional AI, rubrics","role":"agent","link":"#preference-optimization"},
{"id":"sft","label":"Supervised examples","sub":"safe, helpful demonstrations","role":"data","link":"#sft"},
{"id":"pre","label":"Pretraining data filtering","sub":"remove the worst content","role":"context","link":"#pretraining-data"}]}
```

## How it works
**Data filtering** removes some hazardous and toxic content before training, though models still learn plenty from what remains.

**Supervised examples** demonstrate how to handle sensitive requests: helpfully where possible, with care where needed, declining only what must be declined.

**Principles and AI feedback.** Constitutional AI (Bai et al., 2022) trains with written principles that guide AI critiques and comparisons; OpenAI’s deliberative alignment (2024) trains reasoning models to consult safety specifications in their reasoning. See [preference optimization](#preference-optimization).

**Character training.** Developers shape traits such as curiosity, honesty, directness and warmth; Anthropic described character training for Claude in 2024.

**Helpful refusals.** Newer approaches favor “safe completions”: giving the most helpful answer that stays within limits, rather than refusing whenever a topic is sensitive.

```viz
{"id":"refusal-style","component":"compare","title":"A blanket refusal versus a helpful answer within limits","caption":"Illustrative responses to a dual-use question. Hover the marks.","alt":"Comparison of a flat refusal and a safe, helpful completion to a question about medication interactions.","data":"illustrative","mono":false,"a":{"title":"Blanket refusal","text":"I can’t help with questions about medication doses. Please consult a professional.","mono":false},"b":{"title":"Helpful within limits","text":"Combining those two medicines can raise the risk of serotonin syndrome. Warning signs include agitation, fever and muscle twitching; seek urgent care if they appear. A pharmacist can check the doses against your other medicines.","mono":false},"links":[{"a":"I can’t help with questions about medication doses.","b":"Combining those two medicines can raise the risk of serotonin syndrome.","note":"The safety-relevant information is exactly what the person needed."},{"b":"A pharmacist can check the doses against your other medicines.","note":"It still points to a professional, without withholding useful facts."}]}
```

**Robustness and classifiers.** Adversarial training on jailbreak attempts improves robustness; separate classifiers such as Anthropic’s constitutional classifiers (2025) block specific high-risk content independently of the model. See [jailbreaks and misuse](#jailbreaks-misuse).

## In practice
- Expect models to differ in refusal style; test your domain’s legitimate edge cases for over-refusal. See [safety evals](#safety-evals).
- Use system prompts to provide context that makes legitimate requests clear (for example, that users are clinicians), within provider policies.
- Keep your own guardrails for application-specific risks; model training covers general ones.

## Numbers to know
> [!number]
> Rule of thumb: measure harm and over-refusal together; a change that improves one often worsens the other unless the method improves both.

## Pitfalls and anti-patterns
> [!pitfall] Treating model safety as application safety
> Model training does not know your data, tools or users. Application guardrails and evals are still yours to build.

- **Prompting a model to ignore its safety training.** Unreliable and usually against provider terms.

## Talk like an expert
The vocabulary: **harmlessness training**, **Constitutional AI**, **deliberative alignment**, **character training**, **safe completion**, **over-refusal**, **adversarial training**, **safety classifier**. Experts evaluate refusal style as well as refusal rate. The live debate is how models should handle dual-use knowledge as capabilities grow, and who decides the principles.

> [!hottake] Over-refusal has done more damage to trust in AI assistants than jailbreaks have.
> **The counterargument:** the harms that safety training prevents are rare but severe, and erring toward caution in high-risk domains is a reasonable price for avoiding them.

## Check yourself
```quiz
safety-character-training
```

## Go deeper
- Bai et al., “Constitutional AI” (2022).
- Guan et al., “Deliberative Alignment” (OpenAI, 2024).
- Anthropic, “Claude’s Character” (2024).

## Related
- [Alignment concepts](#alignment-concepts)
- [Preference optimization](#preference-optimization)
- [Jailbreaks and misuse](#jailbreaks-misuse)
- [Safety evals](#safety-evals)
- [Frontier safety frameworks](#frontier-safety-frameworks)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Model specs, constitutions and the instruction hierarchy](#model-specs-instruction-hierarchy)
- [How fine-tuning changes safety](#fine-tuning-and-safety)
