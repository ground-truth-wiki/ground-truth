---
id: jailbreaks-misuse
book: 17
order: "17.4"
title: Jailbreaks and misuse
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [jailbreaks, misuse, classifiers]
visuals:
  - jailbreak-families:tree
  - many-shot-curve:chart
---
> [!tldr]
> Jailbreaks are inputs crafted to make a model ignore its own safety training; misuse is people using a system for harm. Defend in layers: model safety training, input and output classifiers, usage policies, account-level abuse detection and rate limits, and evals that track both attack success and over-refusal.

## Why it matters
Every public AI system is probed by people trying to make it produce harmful content, reveal its configuration or work for purposes it was not built for. Some attacks become screenshots on social media; some become real harm. Product teams need to know the families of attack, what their own layer of defense should be, and how not to break legitimate use while defending.

## Intuition
A jailbreak is social engineering aimed at a model: role-play, flattery, confusing framing, or wearing it down over many turns. The defenses look like those for social engineering of people: training, second opinions, limits on what any one person can do, and watching for patterns.

```viz
{"id":"jailbreak-families","component":"tree","title":"Six families of jailbreak, described by mechanism, with the defense that targets each","caption":"Expand a family. Descriptions stay at the level of mechanism; this chapter contains no working attack text.","alt":"Tree of jailbreak families: persona and role-play, many-shot, obfuscation, multi-turn escalation, optimized adversarial strings and low-resource languages, each with defenses.","data":"illustrative","open":1,"root":{"label":"Jailbreak families","children":[
{"label":"Persona and role-play","children":[{"label":"Framing harmful requests as fiction or a character. Defense: safety training on framed requests; output classifiers judge content, not framing"}]},
{"label":"Many-shot","children":[{"label":"Long contexts filled with fake dialogues of the model complying. Defense: training and classifiers that look at the whole context; limits on untrusted context"}]},
{"label":"Obfuscation and encoding","children":[{"label":"Hiding requests in encodings, ciphers or split pieces. Defense: classifiers on decoded content; safety training across encodings"}]},
{"label":"Multi-turn escalation","children":[{"label":"Starting innocently and escalating gradually across turns. Defense: conversation-level monitoring, not just per-message checks"}]},
{"label":"Optimized adversarial strings","children":[{"label":"Machine-searched suffixes that shift model behavior. Defense: adversarial training, perplexity and pattern filters"}]},
{"label":"Low-resource languages","children":[{"label":"Requests in languages with less safety training data. Defense: multilingual safety training and evals"}]}]}}
```

## How it works
**Why jailbreaks work.** Safety training teaches models to refuse certain requests, but it competes with the model’s training to be helpful and to follow context. Attacks exploit that tension: they make compliance look like the helpful, in-context behavior. Published research has documented many families, including optimized adversarial suffixes (Zou et al., 2023), multi-turn escalation such as Crescendo (Russinovich et al., 2024) and many-shot jailbreaking (Anil et al., 2024).

**Many-shot jailbreaking.** With long context windows, attackers can include many fabricated examples of the model complying. Research found attack success rising steadily with the number of examples:

```viz
{"id":"many-shot-curve","component":"chart","type":"line","title":"More fabricated examples in the context make compliance more likely","caption":"Illustrative curve with the shape reported in Anthropic’s 2024 many-shot jailbreaking research, not their data. The point is the trend: long contexts are an attack surface.","alt":"Illustrative line chart of attack success rate rising with the number of fabricated dialogue examples on a log scale.","data":"illustrative","x":{"label":"Fabricated examples in context (log scale)","log":true},"y":{"label":"Attack success rate","unit":"pct","min":0,"max":1},"series":[{"name":"Illustrative trend","points":[[1,0.02],[4,0.05],[16,0.14],[64,0.35],[256,0.6]]}]}
```

**System prompt leakage.** Attackers often try to extract system prompts. Assume they will succeed: never put secrets, credentials or security logic in a system prompt.

**Defenses in layers.**
- **Model safety training** is the base layer, provided by the model developer.
- **Input and output classifiers** screen requests and responses; Anthropic’s constitutional classifiers (2025) are one published approach. Use provider moderation endpoints or guard models. See [guardrails](#guardrails-control).
- **Usage policies and account controls:** terms of use, identity verification for risky features, rate limits, and abuse detection across sessions and accounts.
- **Product design:** narrow the system to its job; a support bot does not need to write fiction.
- **Monitoring and response:** review flagged conversations, ban abusive accounts, and feed new attacks into evals.

**Misuse beyond jailbreaks.** Spam, fraud, harassment, scraping, election manipulation and attempts to gain dangerous capabilities often use entirely normal requests. They are caught with account-level and behavioral signals rather than per-message checks. See [responsible AI](#responsible-ai).

## In practice
- **Know your layer.** As an application builder you control product scope, classifiers, rate limits, account controls and monitoring; the model’s own training is the developer’s.
- **Red-team your policies** with known families before launch, and track attack success rate over time. See [red teaming](#red-teaming).
- **Track over-refusal** alongside attack success; defenses that refuse legitimate users are failures too. See [safety evals](#safety-evals).
- **Assume system prompts leak**; keep secrets elsewhere.
- **Monitor conversations, not just messages**, for multi-turn attacks.

## Numbers to know
> [!number]
> Rules of thumb. Attack success against adaptive human red-teamers is far higher than against fixed test sets. Defenses that look at whole conversations catch escalation that per-message filters miss. Treat any published jailbreak as likely to work on some model somewhere, and test yours.

## Pitfalls and anti-patterns
> [!pitfall] Secrets in the system prompt
> System prompts are extracted routinely. Credentials, internal URLs and security logic belong in code.

- **Per-message filtering only.** Misses multi-turn escalation.
- **Over-blocking.** Refusing broad topic areas drives legitimate users away and teaches attackers nothing.
- **No feedback loop.** New attacks should become eval cases within days.

## Talk like an expert
The vocabulary: **jailbreak**, **attack success rate**, **many-shot jailbreaking**, **multi-turn escalation**, **adversarial suffix**, **system prompt leakage**, **constitutional classifiers**, **abuse detection**. Experts separate jailbreaks (making the model misbehave) from prompt injection (making an application misbehave through untrusted content) and from misuse (people doing harm with normal requests). The live debate is how far model-level robustness can go; developers report steady gains, and red-teamers keep finding new families.

> [!hottake] For most products, rate limits and account controls stop more real misuse than prompt-level defenses.
> **The counterargument:** a single successful jailbreak producing dangerous content can cause serious harm and reputational damage regardless of rate limits; content-level defenses remain essential for high-risk categories.

## Check yourself
```quiz
jailbreaks-misuse
```

## Go deeper
- Zou et al., “Universal and Transferable Adversarial Attacks on Aligned Language Models” (2023).
- Anil et al., “Many-shot Jailbreaking” (Anthropic, 2024).
- Russinovich et al., “Great, Now Write an Article About That: The Crescendo Multi-Turn LLM Jailbreak Attack” (2024).
- Sharma et al., “Constitutional Classifiers” (Anthropic, 2025).

## Related
- [Prompt injection](#prompt-injection)
- [Red teaming](#red-teaming)
- [Safety evals](#safety-evals)
- [Guardrails and control](#guardrails-control)
- [Alignment concepts](#alignment-concepts)
- [How fine-tuning changes safety](#fine-tuning-and-safety)
- [Guard models and content moderation](#guard-models-moderation)
- [Adversarial machine learning](#adversarial-ml)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Jailbreak attacks and defenses in depth](#jailbreak-techniques)
