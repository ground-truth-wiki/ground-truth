---
id: reasoning-prompts
book: 5
order: "5.2"
title: Reasoning prompts
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [chain-of-thought, reasoning, prompting]
visuals:
  - cot-compare:compare
  - sc-vote:stepper
---
> [!tldr]
> Asking a model to reason before answering improves multi-step problems: chain of thought, decomposition, self-consistency and self-critique. With reasoning models that think natively, the craft shifts from scripting steps to stating goals and constraints, choosing an effort level, and verifying the result.

## Why it matters
Many tasks fail not because the model lacks knowledge but because it answers before working the problem: arithmetic in word problems, multi-condition policy checks, planning. A short instruction to reason, or a structure that forces intermediate steps, can turn a wrong answer into a right one. Knowing when that helps, and when a reasoning model already does it, saves both quality and tokens.

## Intuition
Ask someone a tricky question and demand an instant answer, and they guess. Let them think aloud on paper, and they catch their own mistakes. Chain of thought gives the model the paper.

```viz
{"id":"cot-compare","component":"compare","title":"The direct answer guesses; the worked answer checks the constraint and gets it right","caption":"Illustrative outputs from a non-reasoning model on the same word problem. Hover the marks.","alt":"Comparison of a direct answer and a chain-of-thought answer to a word problem about muffins and coffees.","data":"illustrative","mono":false,"a":{"title":"Direct answer","text":"Question: Muffins cost $3 and coffees cost $2. Ana buys 4 items and spends $10. How many muffins did she buy?\n\nAnswer: 3 muffins.","mono":false},"b":{"title":"Chain of thought","text":"Question: (same)\n\nLet m be muffins and c coffees. m + c = 4, and 3m + 2c = 10. Substituting c = 4 − m: 3m + 8 − 2m = 10, so m = 2. Check: 2 × $3 + 2 × $2 = $10.\n\nAnswer: 2 muffins.","mono":false},"links":[{"a":"Answer: 3 muffins.","b":"Answer: 2 muffins.","note":"Three muffins and one coffee cost $11, not $10; the direct answer never checked."},{"b":"m + c = 4, and 3m + 2c = 10.","note":"Writing the constraints down is what makes the error impossible to miss."},{"b":"Check: 2 × $3 + 2 × $2 = $10.","note":"A verification step catches mistakes before the final answer."}]}
```

## How it works
**Chain of thought.** Wei et al. (2022) showed that prompting with worked examples improves arithmetic, symbolic and commonsense reasoning; Kojima et al. (2022) found that simply adding “Let’s think step by step” helps too. For production, ask for reasoning in a separate section (for example inside `<thinking>` tags) and parse only the final answer.

**Decomposition.** Break a hard question into sub-questions and answer them in order, either in one prompt (least-to-most prompting, Zhou et al., 2022) or across a [chain](#prompt-chaining) of calls.

**Self-consistency.** Sample several reasoning paths at a non-zero temperature and take the majority final answer (Wang et al., 2022). It trades cost for reliability on problems with one correct answer:

```viz
{"id":"sc-vote","component":"stepper","title":"Five independent attempts disagree, and the majority answer is right more often than any single one","caption":"Illustrative samples on the muffin problem at temperature 0.8. Voting only works when answers can be compared, such as numbers or labels.","alt":"Stepper showing five sampled reasoning paths producing answers 2, 2, 3, 2 and 1, and a majority vote of 2.","data":"illustrative","frames":[
{"label":"Sample 1","caption":"Sets up both equations and solves: 2 muffins.","tokens":["2"]},
{"label":"Sample 2","caption":"Tries combinations one by one: 2 muffins.","tokens":["2","2"]},
{"label":"Sample 3","caption":"Mistakes the total and never checks: 3 muffins.","tokens":["2","2","3"]},
{"label":"Sample 4","caption":"Solves with substitution: 2 muffins.","tokens":["2","2","3","2"]},
{"label":"Sample 5","caption":"Swaps the prices: 1 muffin.","tokens":["2","2","3","2","1"]},
{"label":"Vote","caption":"Majority answer: 2, with three of five votes. The agreement rate is also a rough confidence signal.","panel":"Votes: 2 → 3, 3 → 1, 1 → 1. Final: 2 muffins."}]}
```

**Reflection and self-critique.** Ask the model to check its answer against criteria or to critique and revise it. It helps most when grounded in something external, such as a failing test, a schema validator or a calibrated judge; without an external signal it can simply rephrase the same mistake. See [planning strategies](#planning-reasoning).

**Reasoning models are different.** Models trained to think before answering already reason at length internally. For them:
- State the goal, constraints and success criteria; avoid scripting the steps.
- Use the API’s effort or thinking-budget control instead of “think step by step”.
- Give room for the answer: reasoning tokens count toward output limits and cost.
- Still verify outputs that matter. See [reasoning models](#reasoning-models).

## In practice
```text
Solve the problem. First write your reasoning inside <thinking> tags,
checking each constraint. Then give only the final answer inside
<answer> tags.

<problem>{problem}</problem>
```

Decision rules:
- **Non-reasoning model, multi-step task:** ask for reasoning before the answer, in a separate section.
- **Reasoning model:** describe the goal and constraints, set the effort, and skip step-by-step scripting.
- **One right answer and budget to spare:** add self-consistency with three to five samples.
- **Checkable output:** add a verification step with a real check.
- **Simple lookups or formatting:** skip reasoning; it adds cost and latency for nothing.

## Numbers to know
> [!number]
> Rules of thumb. Chain of thought multiplies output tokens, often by several times, so it costs latency and money. Self-consistency with N samples costs N times the tokens; three to five samples usually capture most of the gain.

## Pitfalls and anti-patterns
> [!pitfall] Scripting reasoning models step by step
> Rigid step lists can constrain a reasoning model’s own better approach. Give goals and constraints, then check results.

- **Parsing the whole output.** Separate reasoning from the final answer so code reads only the answer.
- **Reflection without a signal.** Self-critique on vibes rarely fixes errors.
- **Reasoning everywhere.** Simple tasks get slower and more expensive, not better.

## Talk like an expert
The vocabulary: **chain of thought**, **zero-shot CoT**, **least-to-most prompting**, **self-consistency**, **self-critique**, **thinking budget**, **reasoning effort**. Experts ask “is this a reasoning model?” before choosing a prompting strategy, and treat visible reasoning as a debugging aid rather than a guarantee of correctness. The live debate is how faithfully a model’s written reasoning reflects what actually produced its answer.

> [!hottake] For reasoning models, the best reasoning prompt is a clear statement of the goal and a way to check the answer.
> **The counterargument:** worked examples of the reasoning style you want still help on domain-specific problems, where the model does not know which considerations matter.

## Check yourself
```quiz
reasoning-prompts
```

## Go deeper
- Wei et al., “Chain-of-Thought Prompting Elicits Reasoning in Large Language Models” (2022).
- Kojima et al., “Large Language Models are Zero-Shot Reasoners” (2022).
- Wang et al., “Self-Consistency Improves Chain of Thought Reasoning in Language Models” (2022).
- Zhou et al., “Least-to-Most Prompting Enables Complex Reasoning in Large Language Models” (2022).

## Related
- [Prompting fundamentals](#prompting-fundamentals)
- [Reasoning models and test-time compute](#reasoning-models)
- [Planning and reasoning strategies](#planning-reasoning)
- [Prompt patterns and chaining](#prompt-chaining)
- [RL with verifiable rewards](#rlvr-reasoning)
- [Test-time search, sampling and verification](#test-time-search)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [A field guide to prompting techniques](#prompting-techniques)
