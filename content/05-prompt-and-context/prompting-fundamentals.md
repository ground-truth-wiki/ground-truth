---
id: prompting-fundamentals
book: 5
order: "5.1"
title: Prompting fundamentals
level: foundation
stability: moving
reviewed: "2026-11"
status: full
tags: [prompting, system-prompt, examples]
visuals:
  - prompt-anatomy:diagram
  - prompt-compare:compare
---
> [!tldr]
> A good prompt is a good brief: who it is for and what it must achieve, the context the model needs, examples of what good looks like, constraints, and an explicit output format, with each part clearly separated. Most prompt problems are specification problems.

## Why it matters
The prompt is the cheapest, fastest lever on quality you have, and the one most often pulled badly. Teams switch models, add retrieval or fine-tune when a clearer brief would have fixed the problem in minutes. Prompting well is also the foundation of everything else in this Book: tool descriptions, judge rubrics and agent instructions are all prompts.

## Intuition
Brief the model the way you would brief a brilliant contractor who has never seen your company: smart, fast and completely without context. Anything you do not write down, they will guess.

```viz
{"id":"prompt-anatomy","component":"diagram","title":"Six parts, each separated, make a prompt a brief instead of a wish","caption":"Not every prompt needs every part, but every missing part is a guess you are asking the model to make. Click a part for the chapter that goes deeper.","alt":"Layered diagram of prompt parts: role and audience, goal and success criteria, context and data, examples, constraints, and output format.","data":"illustrative","w":560,"layer_h":46,"layers":[
{"id":"role","label":"Role and audience","sub":"who is speaking, to whom","role":"human"},
{"id":"goal","label":"Goal and success criteria","sub":"what done looks like","role":"agent","link":"#why-evals"},
{"id":"context","label":"Context and data","sub":"in labeled sections or tags","role":"context","link":"#context-engineering"},
{"id":"examples","label":"Examples","sub":"two or three, diverse","role":"data"},
{"id":"constraints","label":"Constraints","sub":"what to do, stated positively","role":"tool","link":"#guardrails-control"},
{"id":"format","label":"Output format","sub":"structure, length, tone","role":"model","link":"#structured-outputs"}]}
```

## How it works
**Clarity and specificity.** Say what the output is for, who will read it, and what it must contain. “Summarize this” leaves length, audience, focus and format to chance; “Summarize this incident report in five bullet points for an engineering manager, leading with customer impact” does not.

**System prompts and roles.** Put durable instructions, persona and policy in the system prompt; put the specific task and data in the user turn. A role (“you are a senior security reviewer”) sets defaults for vocabulary and judgment, but it does not replace explicit instructions.

**Examples.** A few diverse input-and-output examples (few-shot prompting) teach format, tone and judgment faster than paragraphs of rules. Make them varied, so the model learns the pattern rather than copying one example’s quirks, and wrap them in their own tags.

**Structure.** Separate instructions, context, examples and data with XML tags or Markdown headings, so the model can tell what is an instruction and what is material to work on. Name the tags meaningfully (`<contract>`, `<question>`) and refer to them in the instructions.

**Say what to do.** “Write in flowing prose paragraphs” works better than “don’t use bullet points”. Negative instructions can prime the behavior they forbid, and they leave the alternative unspecified.

**Output control and prefill.** Specify format, length and tone explicitly; for machine-readable output, use [structured outputs](#structured-outputs). Where the API allows it (open-weight models and some hosted APIs; Claude models from 4.6 on reject it, as of November 2026), starting the assistant’s reply yourself (prefill) locks the format, for example by beginning with `{`.

## In practice
```viz
{"id":"prompt-compare","component":"compare","title":"The same request as a wish and as a brief","caption":"Hover the marks. Each addition removes one guess the model would otherwise make.","alt":"Comparison of a vague prompt and a structured prompt with role, goal, data, examples, constraints and format.","data":"illustrative","a":{"title":"A wish","text":"Write release notes for these changes.\n\n[paste of 40 commit messages]"},"b":{"title":"A brief","text":"You write release notes for our customers,\nwho are non-technical admins.\n\n<changes>\n[40 commit messages]\n</changes>\n\n<example>\nFaster exports: large CSV exports now\nfinish in seconds instead of minutes.\n</example>\n\nGroup user-visible changes under New,\nImproved and Fixed. Skip internal\nrefactors. One plain-language sentence\nper item, present tense.\nReturn Markdown with three H2 sections."},"links":[{"a":"Write release notes","b":"You write release notes for our customers,\nwho are non-technical admins.","note":"Audience decides vocabulary and what counts as worth mentioning."},{"a":"[paste of 40 commit messages]","b":"<changes>\n[40 commit messages]\n</changes>","note":"Tags separate the material from the instructions."},{"b":"<example>\nFaster exports: large CSV exports now\nfinish in seconds instead of minutes.\n</example>","note":"One example communicates tone and level of detail better than adjectives."},{"b":"Skip internal\nrefactors.","note":"A constraint that removes most of the noise in commit logs."},{"b":"Return Markdown with three H2 sections.","note":"An explicit format makes the output predictable and easy to check."}]}
```

A reusable template:

```text
<role>You are … writing for … </role>
<goal>Produce … so that the reader can … Good output: … </goal>
<context> … documents, data, background … </context>
<examples> <example> … </example> <example> … </example> </examples>
<instructions>
1. …
2. …
Do … (state the desired behavior, not only what to avoid).
</instructions>
<format> Length, structure, tone. </format>
```

Treat prompts like code: keep them in version control, test them against a set of cases rather than one, and change one thing at a time. See [prompt management](#prompt-config-management).

## Numbers to know
> [!number]
> Rules of thumb. Two to five diverse examples capture most of the benefit of few-shot prompting. Test every prompt change on at least a few dozen representative inputs; a prompt that works on one example proves little.

## Pitfalls and anti-patterns
> [!pitfall] The mega-prompt
> Hundreds of accumulated rules dilute each other and contradict in edge cases. When a prompt grows past what a person can read in a minute, split procedures into skills or chained steps.

- **Examples that are all alike.** The model copies their surface features.
- **Hidden assumptions.** If a human expert would need to ask a question, put the answer in the prompt.
- **Only negative instructions.** Say what good looks like.
- **Testing on one input.** Variance between inputs is the norm.

## Talk like an expert
The vocabulary: **system prompt**, **few-shot**, **XML tags**, **prefill**, **success criteria**, **prompt template**, **specification**. Experts write prompts like specs and evaluate them on test sets; they say “the model did what I asked, not what I meant” and fix the asking. The live debate is how much prompt craft still matters as models follow plain instructions better; clear specification keeps mattering even as tricks fade.

> [!hottake] Prompt engineering is mostly writing, and good writers make good prompt engineers.
> **The counterargument:** effective prompting also needs systematic testing and an understanding of model behavior, context limits and evaluation; clear prose without measurement still produces fragile systems.

## Check yourself
```quiz
prompting-fundamentals
```

## Go deeper
- Anthropic’s prompting best practices at platform.claude.com/docs.
- OpenAI’s and Google’s prompting guides for their model families.

## Related
- [Context engineering](#context-engineering)
- [Reasoning prompts](#reasoning-prompts)
- [Structured outputs](#structured-outputs)
- [Model-specific notes](#model-specific-notes)
- [Prompt optimization](#prompt-optimization)
- [Model specs, constitutions and the instruction hierarchy](#model-specs-instruction-hierarchy)
- [A field guide to prompting techniques](#prompting-techniques)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [In-context learning and example design](#in-context-learning)
- [Prompt sensitivity and robust prompt testing](#prompt-robustness)
