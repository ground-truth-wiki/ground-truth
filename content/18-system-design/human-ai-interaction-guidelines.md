---
id: human-ai-interaction-guidelines
book: 18
order: "18.6.1"
title: Human-AI interaction guidelines in practice
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [ux, human-ai-interaction, design-guidelines, trust-calibration, overreliance]
visuals: []
prerequisites: [ai-product-ux]
---
> [!tldr]
> Three published guideline sets, Microsoft's 18 Guidelines for Human-AI Interaction, Google's People + AI Guidebook and Apple's Human Interface Guidelines for machine learning and generative AI, turn "design for trust" into rules you can check in a review. They matter because the same model can help or harm depending on how its interface sets expectations, shows uncertainty, handles errors and keeps people in control. The one thing to remember: aim for appropriate reliance, not maximum trust, and design the moment the system is wrong first.

## Key ideas

- **Eighteen guidelines in four phases.** Amershi et al. condensed more than 150 design recommendations into 18 guidelines grouped as initially (make clear what the system can do, and how well), during interaction, when wrong (support efficient invocation, dismissal and correction, scope services when in doubt, make clear why the system did what it did) and over time, and tested them with 49 design practitioners on 20 AI-infused products ([Amershi et al., “Guidelines for Human-AI Interaction” (2019)](https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/); [Microsoft Research blog (2019)](https://www.microsoft.com/research/blog/guidelines-for-human-ai-interaction-design/)). Microsoft's HAX Toolkit adds a design library with examples, design patterns for each guideline and a workbook for choosing which guidelines to apply ([HAX Toolkit](https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/)).
- **Errors as a design material.** Google's People + AI Guidebook has six chapters (user needs and defining success, data collection and evaluation, mental models, explainability and trust, feedback and control, errors and graceful failure), first launched in 2019 and updated since ([Google PAIR](https://pair.withgoogle.com/guidebook-v2/chapters)). Its errors chapter separates system limitations, context errors (the system works as designed but clashes with what the user expected) and background errors (neither the user nor the system notices), and rates risk higher for novices, distracted users, low system confidence and high stakes such as health, safety and money ([PAIR, Errors + Graceful Failure](https://pair.withgoogle.com/chapter/errors-failing/)).
- **Apple's input, output and generative patterns.** Apple's machine learning guidance covers explicit and implicit feedback, calibration, mistakes, corrections, multiple options, confidence, attribution and limitations, and prefers guided corrections, which suggest specific alternatives, over freeform ones because they take less effort ([Apple HIG: Machine learning](https://developer.apple.com/design/human-interface-guidelines/machine-learning)). Its generative AI page asks apps to disclose where AI is used and never pass AI off as a human, let people dismiss, revert or retry results, offer a non-AI fallback when possible, show specific progress messages instead of "Processing…", and ask for confirmation before significant or hard-to-undo actions ([Apple HIG: Generative AI](https://developer.apple.com/design/human-interface-guidelines/generative-ai)).
- **Showing confidence and explaining outputs.** PAIR lists four ways to show confidence (categories such as high, medium and low; N-best alternatives; numbers, which are risky because they assume people understand probability; and visual ranges) and advises leaving it out when it does not change decisions or could mislead; it distinguishes general system, specific output, partial, example-based, interactive "what if" and counterfactual explanations ([PAIR, Explainability + Trust](https://pair.withgoogle.com/chapter/explainability-trust/)). Apple adds that you should show confidence only after checking that it tracks result quality, and that categories or actionable suggestions usually work better than raw percentages ([Apple HIG: Machine learning](https://developer.apple.com/design/human-interface-guidelines/machine-learning)).
- **Overreliance and automation bias.** Passi and Vorvoreanu define overreliance as users "accepting incorrect AI outputs"; their review of about 60 papers finds that explanations can raise reliance on wrong recommendations, and that cognitive forcing functions (checklists, time-outs, on-demand explanations, asking people to rule out alternatives) reduce overreliance even though users like them less ([Passi and Vorvoreanu, “Overreliance on AI: Literature Review” (2022)](https://www.microsoft.com/en-us/research/publication/overreliance-on-ai-literature-review/)). The same review recommends onboarding that shows both correct and incorrect outputs, and avoiding language that makes the AI sound human in the interface and in marketing ([full report, PDF](https://www.microsoft.com/en-us/research/wp-content/uploads/2022/06/Aether-Overreliance-on-AI-Review-Final-6.21.22.pdf)).
- **High control and high automation.** Shneiderman treats human control and computer automation as two separate axes rather than two ends of one dial, and argues for designs that offer both at once while avoiding excessive automation and excessive human control ([Shneiderman, “Human-Centered Artificial Intelligence: Reliable, Safe & Trustworthy” (2020)](https://arxiv.org/abs/2002.04087)).

## Planned visuals

- **`tree`: the 18 guidelines by phase.** Initially, during interaction, when wrong and over time; each guideline expands to its HAX design pattern, an example from an LLM assistant and the chapter that covers it.
- **`compare`: one answer, four ways to show confidence.** The same assistant answer with a category, N-best alternatives, a number and a visual range, with notes on when each helps and when showing no confidence is the better choice.
- **`stepper`: a design review of an LLM assistant.** Walk one assistant through the four phases, the PAIR error types and Apple's generative AI checks, ending in a list of findings and fixes.

## Talk like an expert

The vocabulary: **appropriate reliance**, **overreliance**, **automation bias**, **trust calibration**, **graceful failure**, **guided correction**, **N-best alternatives**, **cognitive forcing function**. Experts use the guidelines as a design-review checklist and ask "how will the user notice this is wrong, and what does fixing it cost?" before they ask how to make the system look more capable.

## Go deeper

- Amershi et al., [“Guidelines for Human-AI Interaction”](https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/) (CHI 2019), with the [HAX Toolkit](https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/).
- Google PAIR, [*People + AI Guidebook*](https://pair.withgoogle.com/guidebook-v2/chapters).
- Apple, [Human Interface Guidelines: Generative AI](https://developer.apple.com/design/human-interface-guidelines/generative-ai) and [Machine learning](https://developer.apple.com/design/human-interface-guidelines/machine-learning).
- Passi and Vorvoreanu, [“Overreliance on AI: Literature Review”](https://www.microsoft.com/en-us/research/publication/overreliance-on-ai-literature-review/) (Microsoft, MSR-TR-2022-12, 2022).

## Related

- [AI product and UX](#ai-product-ux)
- [Agent UX](#agent-ux)
- [Human in the loop](#human-in-the-loop)
- [Scoping AI features: when to use AI and what success means](#ai-use-case-scoping)
- [Responsible AI in practice](#responsible-ai)
- [Uncertainty and confidence estimation for LLMs](#llm-uncertainty)
