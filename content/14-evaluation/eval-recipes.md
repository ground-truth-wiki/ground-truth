---
id: eval-recipes
book: 14
order: "14.7"
title: Task-specific recipes
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [evals, rag, extraction, summarization]
visuals:
  - recipe-matrix:matrix
  - summarizer-eval:stepper
---
> [!tldr]
> Each kind of AI system has a standard evaluation recipe: what to measure, how to grade it, where the data comes from and the trap to avoid. Start from the recipe for your system type, then adapt it with your own error analysis.

## Why it matters
Teams often reinvent evaluation for every project, or copy the wrong one: grading a RAG system like a chatbot, or an agent like a classifier. A recipe is a head start, not a substitute for reading your outputs; it tells you which questions to ask first.

## Intuition
Cooking recipes do not replace tasting, but they stop you from baking bread like a stew. Eval recipes are the same: a reliable starting method for each kind of dish.

```viz
{"id":"recipe-matrix","component":"matrix","matrix":"eval-recipes","title":"Eight system types, each with what to measure, how to grade it, where the data comes from and the classic trap","caption":"Filter by system type or by a word such as “judge” or “state”. A starting point; error analysis on your own outputs decides the final design.","alt":"Table of evaluation recipes for RAG, agents, extraction, summarization, classification, chat assistants, code generation and voice agents.","data":"illustrative"}
```

## How it works
**RAG systems.** Measure retrieval (recall@k, nDCG) and generation (faithfulness, answer relevance, correctness) separately, with labeled questions from real users. See [evaluating RAG](#rag-evaluation).

**Agents.** Final-state checks in sandboxed environments, trajectory rules and rubrics, multiple attempts, cost per task. See [evaluating agents](#evaluating-agents).

**Extraction.** Field-level precision and recall against labeled documents, exact match after normalization, and schema validity. Slice by document type and field. See [document extraction](#document-extraction).

**Summarization.** Faithfulness (no unsupported claims), coverage of the key points a person listed, and length and format constraints. Overlap metrics against a reference are weak signals.

**Classification and routing.** Accuracy, per-class precision and recall, and a confusion matrix; watch the classes that matter most, which are usually the rare ones. See [classical ML](#classical-ml) for the metric definitions.

**Chat assistants.** Rubric-based judging of helpfulness, correctness and tone on real conversations; multi-turn cases; refusal and over-refusal checks. See [safety evals](#safety-evals) and [support agents](#support-agents).

**Code generation.** Execute: unit tests and hidden tests, plus linting and security scanning; review a sample for maintainability.

**Voice agents.** Task success, latency to first audio, interruption handling and transcription errors on real audio, including noise and accents. See [voice agents](#voice-agents).

## In practice
Here is a recipe applied end to end, for a meeting summarizer, in an afternoon:

```viz
{"id":"summarizer-eval","component":"stepper","title":"An eval for a meeting summarizer in six steps and one afternoon","caption":"Step through the recipe. Each step produces something reusable: cases, a key-point list, a judge prompt, a results table.","alt":"Stepper building a summarization eval: collecting transcripts, writing key points, defining checks, calibrating a judge, running and slicing.","data":"illustrative","frames":[
{"label":"Collect","caption":"Gather 40 real meeting transcripts, anonymized, across meeting types: stand-ups, sales calls, planning sessions."},
{"label":"Key points","caption":"For each transcript, a person lists the 3 to 6 points a good summary must contain, including decisions and owners.","code":"meeting-012 key points:\n- Launch moved to 18 November\n- Dana owns the pricing page\n- Legal review still pending"},
{"label":"Checks","caption":"Define checks: coverage of key points, no unsupported claims (faithfulness), action items with owners, under 150 words."},
{"label":"Judge","caption":"Write a judge prompt per check, label 30 summaries by hand, and measure the judge’s agreement with you before using it. See the LLM-as-judge chapter."},
{"label":"Run","caption":"Run the current summarizer three times per transcript and grade every output."},
{"label":"Slice","caption":"Report each check separately, sliced by meeting type. Sales calls fail coverage most: that is the next prompt fix.","panel":"Coverage 78% (sales calls 61%) · Faithfulness 94% · Owners present 83% · Length OK 97%"}]}
```

Adapting a recipe:
1. Pick the closest recipe from the matrix.
2. Run [error analysis](#error-analysis) on 50 to 100 real outputs.
3. Keep the recipe’s metrics that match failures you found; drop the rest.
4. Add checks for failure modes the recipe did not anticipate.

## Numbers to know
> [!number]
> Rules of thumb. Forty to a hundred cases is enough for a first recipe-based eval. Calibrate any judge on at least 30 to 50 human-labeled outputs before relying on it.

## Pitfalls and anti-patterns
> [!pitfall] Copying a recipe without error analysis
> A recipe measures the usual failures. Your system’s most damaging failure may be one no recipe lists.

- **Wrong recipe for the system.** Chatbot rubrics miss RAG retrieval failures; classifier metrics miss agent trajectory problems.
- **Averages across classes or slices.** Rare classes and hard slices disappear.
- **Reference-overlap metrics for summaries.** Use key-point coverage and faithfulness.

## Talk like an expert
The vocabulary: **key-point coverage**, **field-level precision and recall**, **confusion matrix**, **final-state check**, **faithfulness**, **over-refusal**, **time to first audio**. Experts name the recipe they started from and the changes they made after reading outputs. The live debate is how far one general judge prompt can cover many system types; most teams end up with specific judges per check.

> [!hottake] Most evaluation problems are already solved; teams just need to pick the right recipe.
> **The counterargument:** the hard part is rarely the recipe but the domain-specific definition of quality, which only error analysis on your own data can produce.

## Check yourself
```quiz
eval-recipes
```

## Go deeper
- The Book 14 chapters linked from each row of the recipe matrix.
- Published evaluation guides from model providers and eval-tool vendors, read critically.

## Related
- [Why evals are the core skill](#why-evals)
- [Evaluating RAG](#rag-evaluation)
- [Evaluating agents](#evaluating-agents)
- [Metrics and graders](#metrics-graders)
- [LLM-as-judge done right](#llm-as-judge)
