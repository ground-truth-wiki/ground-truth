---
id: prompting-techniques
book: 5
order: "5.2.1"
title: A field guide to prompting techniques
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [prompting-techniques, chain-of-thought, decomposition, self-verification, catalog]
visuals: []
prerequisites: [reasoning-prompts]
---
> [!tldr]
> Prompting research has produced dozens of named techniques, and most of them are variations on a few moves: show examples, make the model think before it answers, split the problem, combine several attempts, or have the model check its own work. Use a taxonomy as the map, know each technique's mechanism, and treat every technique as a hypothesis to test on your own eval set, because reasoning models already do much of this internally.

## Key ideas

- **One map for the zoo.** The Prompt Report organizes 58 text prompting techniques into in-context learning (few-shot and zero-shot), thought generation, decomposition, ensembling and self-criticism, defines a vocabulary of 33 terms, and treats answer engineering as its own step: choosing the answer's shape (a token, a span, an image), its space (the values it may take), and an extractor or verbalizer that maps raw output to a label (Schulhoff et al., [“The Prompt Report: A Systematic Survey of Prompt Engineering Techniques”](https://arxiv.org/html/2406.06608v6) (2024)).
- **Rewrite the input, or generate thoughts first.** System 2 Attention has the model rewrite the prompt to remove irrelevant information, Rephrase and Respond has it restate and expand the question, and re-reading repeats the question; on the thought-generation side, analogical prompting generates its own worked examples, contrastive chain of thought adds wrong and right explanations, complexity-based prompting picks complex examples, and Auto-CoT generates chains of thought automatically ([Schulhoff et al., 2024](https://arxiv.org/html/2406.06608v6)). Generated knowledge prompting has the model write relevant background knowledge first and then answer with it as extra input (Liu et al., [“Generated Knowledge Prompting for Commonsense Reasoning”](https://arxiv.org/abs/2110.08387) (2022)).
- **Decompose, or hand work to code.** Self-ask has the model pose and answer its own follow-up questions, a structure that lets a search engine answer them (Press et al., [“Measuring and Narrowing the Compositionality Gap in Language Models”](https://arxiv.org/abs/2210.03350) (2022)); plan-and-solve first devises a plan, then carries out the subtasks (Wang et al., [“Plan-and-Solve Prompting: Improving Zero-Shot Chain-of-Thought Reasoning by Large Language Models”](https://arxiv.org/abs/2305.04091) (2023)); Skeleton-of-Thought drafts an outline and expands its points in parallel, and DECOMP routes sub-problems to separate handlers ([Schulhoff et al., 2024](https://arxiv.org/html/2406.06608v6)). PAL writes code as its reasoning and lets a Python interpreter compute the answer, as Program of Thoughts in the Prompt Report's list also does; PAL with Codex beat PaLM-540B with chain of thought on GSM8K by 15 points top-1 accuracy (Gao et al., [“PAL: Program-aided Language Models”](https://arxiv.org/abs/2211.10435) (2022)).
- **Ensemble, then criticize.** Universal self-consistency puts all free-form outputs into one prompt and has the model select the majority answer, DENSE combines prompts built from different example subsets, and prompt paraphrasing ensembles reworded prompts; self-refine iterates feedback and revision, and self-verification scores candidate answers by predicting masked parts of the question ([Schulhoff et al., 2024](https://arxiv.org/html/2406.06608v6)). Chain-of-verification drafts an answer, plans fact-checking questions, answers them independently so the draft does not bias them, and then revises, which reduced hallucinations on list questions, closed-book question answering and long-form generation (Dhuliawala et al., [“Chain-of-Verification Reduces Hallucination in Large Language Models”](https://arxiv.org/abs/2309.11495) (2023)).
- **Persona and emotion prompts have mixed evidence.** The first version of Zheng et al. reported that interpersonal roles in system prompts consistently improved performance, but the revised paper, across 4 model families, 162 roles and 2,410 factual questions, found that personas did not improve on a no-persona control (Zheng et al., [“When ‘A Helpful Assistant’ Is Not Really Helpful: Personas in System Prompts Do Not Improve Performances of Large Language Models”](https://arxiv.org/abs/2311.10054) (2024)). EmotionPrompt reported gains from emotional phrases (Li et al., [“Large Language Models Understand and Can be Enhanced by Emotional Stimuli”](https://arxiv.org/abs/2307.11760) (2023)), while tipping or threatening a model generally had no significant effect on GPQA and MMLU-Pro (Meincke et al., [“Prompting Science Report 3: I'll pay you or I'll kill you -- but will you care?”](https://arxiv.org/abs/2508.00614) (2025)).
- **Reasoning models absorbed some techniques, so test before you keep one.** OpenAI's guidance says its reasoning models do not need "think step by step" instructions, which may not help and can hurt, and often do not need few-shot examples, while delimiters still help (OpenAI, [reasoning best practices](https://developers.openai.com/api/docs/guides/reasoning-best-practices), as of November 2026). Effects are contingent even without reasoning: on gpt-3.5-turbo, the Prompt Report's MMLU benchmark found few-shot chain of thought best and zero-shot chain of thought below plain zero-shot, so A/B every technique on your own eval set, on the same cases, with an interval ([Schulhoff et al., 2024](https://arxiv.org/html/2406.06608v6)).

## Planned visuals

- `tree`: the taxonomy as an expandable tree (in-context learning, thought generation, decomposition, ensembling, self-criticism), each leaf naming the technique, its one-line mechanism and its defining paper.
- `stepper`: chain-of-verification on one factual list question: the draft, the planned verification questions, the independent answers and the revised answer, with the dropped error highlighted. Illustrative.
- `compare`: the same word problem solved with chain of thought and with program-aided reasoning, showing where the arithmetic moves from the model to the interpreter. Illustrative.

## Talk like an expert

Experts sort techniques by family (**few-shot**, **zero-shot**, **thought generation**, **decomposition**, **ensembling**, **self-criticism**, **answer engineering**) and ask of each one what it costs in calls and tokens, whether a reasoning model already does it, and what it gained on their own eval set rather than in the paper.

## Go deeper

- Schulhoff et al., [“The Prompt Report: A Systematic Survey of Prompt Engineering Techniques”](https://arxiv.org/html/2406.06608v6) (2024).
- Sahoo et al., [“A Systematic Survey of Prompt Engineering in Large Language Models: Techniques and Applications”](https://arxiv.org/abs/2402.07927) (2024).
- Dhuliawala et al., [“Chain-of-Verification Reduces Hallucination in Large Language Models”](https://arxiv.org/abs/2309.11495) (2023).
- Gao et al., [“PAL: Program-aided Language Models”](https://arxiv.org/abs/2211.10435) (2022).

## Related

- [Reasoning prompts](#reasoning-prompts)
- [Prompting fundamentals](#prompting-fundamentals)
- [Planning and reasoning strategies](#planning-reasoning)
- [Query understanding](#query-understanding)
- [Prompt patterns and chaining](#prompt-chaining)
- [In-context learning and example design](#in-context-learning)
