---
id: in-context-learning
book: 5
order: "5.1.1"
title: In-context learning and example design
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [in-context-learning, few-shot, examples, many-shot, calibration]
visuals:
  - in-context-learning-anatomy:compare
  - in-context-learning-calibration:stepper
  - in-context-learning-token-cost:calculator
  - in-context-learning-decision:tree
prerequisites: [prompting-fundamentals]
---
> [!tldr]
> In-context learning (ICL) is a model picking up a task from demonstrations in its prompt, with no weight updates. Demonstrations mostly show the label words, the kind of input and the format, and results shift with label balance, order and selection. Pick examples on purpose, keep them consistent, measure the spread, and remember that each one is paid for on every request.

## Why it matters
Examples are a cheap way to change a model’s behavior, and a fragile one: reordering the same examples can move a classifier from near state-of-the-art to near chance ([Lu et al., “Fantastically Ordered Prompts and Where to Find Them: Overcoming Few-Shot Prompt Order Sensitivity” (2022)](https://aclanthology.org/2022.acl-long.556/)). Your examples set the accuracy, the lean toward some labels, the token bill and the point where fine-tuning wins. This chapter expands the “Examples” part of [prompting fundamentals](#prompting-fundamentals).

## Intuition
Demonstrations often work less like teaching and more like pointing. A large model has seen countless tasks in pretraining; a few input-output pairs tell it which one you mean and what the answer looks like. A new colleague learns a form’s fields from three filled-in copies, even if one has a wrong entry.

```viz
{"id":"in-context-learning-anatomy","component":"compare","title":"Demonstrations mostly show the task’s label words, inputs and format, not the right answers","caption":"Illustrative prompts. Hover the marks on the right to see what each part of a demonstration carries. The four parts follow Min et al. (2022).","alt":"Comparison of a zero-shot sentiment prompt with only an instruction and a few-shot version that adds two tagged demonstrations before the same query.","data":"illustrative","try":"Hover “Sentiment: negative” to see how much correct labels matter.","a":{"title":"Zero-shot","text":"Classify each review as positive or negative.\n\nReview: The battery died after two days.\nSentiment:"},"b":{"title":"Few-shot","text":"Classify each review as positive or negative.\n\n<examples>\n<example>\nReview: Setup took five minutes and it just works.\nSentiment: positive\n</example>\n<example>\nReview: The strap broke on the first run.\nSentiment: negative\n</example>\n</examples>\n\nReview: The battery died after two days.\nSentiment:"},"links":[{"b":"<examples>\n<example>","note":"Format: every demonstration uses the same tags and fields, kept apart from the instructions."},{"b":"Review: Setup took five minutes and it just works.","note":"Input distribution: what real inputs look like, in length, topic and tone."},{"b":"Sentiment: positive","note":"Label space: the exact words an answer may use, spelled the way your code will parse them."},{"b":"Sentiment: negative","note":"Min et al. (2022) replaced gold labels with random ones and lost only 0 to 5 points for nearly all of 12 models: the pairs mostly show the task, not the answers."},{"a":"Review: The battery died after two days.\nSentiment:","b":"Review: The battery died after two days.\nSentiment:","note":"The same query. Zero-shot, the model must guess the label words from the instruction alone; few-shot, the query stops exactly where every demonstration put its label."}]}
```

[Brown et al., “Language Models are Few-Shot Learners” (2020)](https://arxiv.org/abs/2005.14165) called this in-context learning: GPT-3 did tasks “without any gradient updates or fine-tuning”, from text alone. Zero-shot gives an instruction only, one-shot one demonstration, and few-shot as many as fit in GPT-3’s 2,048-token context, typically 10 to 100. Many-shot means hundreds or thousands ([Agarwal et al., “Many-Shot In-Context Learning” (2024)](https://papers.nips.cc/paper_files/paper/2024/hash/8cb564df771e9eacbfe9d72bd46a24a9-Abstract-Conference.html)).

## How it works
**What demonstrations teach.** [Min et al., “Rethinking the Role of Demonstrations: What Makes In-Context Learning Work?” (2022)](https://aclanthology.org/2022.emnlp-main.759/) split a demonstration into four parts: input-label mapping, input distribution, label space and format. Random labels instead of gold ones cost only 0 to 5 points for nearly all of 12 models on classification and multiple choice; breaking the format, the inputs or the label space hurt more. Scale matters: [Wei et al., “Larger language models do in-context learning differently” (2023)](https://arxiv.org/abs/2303.03846) found that large models follow flipped labels that contradict their priors, while small models ignore them.

**Biases from label balance and position.** [Zhao et al., “Calibrate Before Use: Improving Few-Shot Performance of Language Models” (2021)](https://proceedings.mlr.press/v139/zhao21c.html) found three biases in GPT-3: majority-label (answers frequent in the prompt), recency (answers near the end) and common-token (tokens frequent in pretraining). Contextual calibration measures the label probabilities on a content-free input such as “N/A” and divides them out. It raised average accuracy by up to 30 points and cut variance across prompts, but it needs log-probs.

```viz
{"id":"in-context-learning-calibration","component":"stepper","title":"Dividing by the prompt’s answer on “N/A” removes its built-in lean toward one label","caption":"Illustrative probabilities; the arithmetic is real, rounded to two decimals. Contextual calibration sets W = diag(p_cf)⁻¹ and b = 0, following Zhao et al. (2021), who average three content-free inputs.","alt":"Stepper: a prompt with three positive and one negative demonstration predicts positive at 0.58. On the content-free input N/A it says positive 0.70. Dividing by these and renormalizing gives negative 0.63.","data":"illustrative","try":"Step to the content-free probe and compare it with the 50/50 an empty input deserves.","frames":[
{"label":"The prompt","caption":"Four demonstrations: three positive, one negative, and the last one positive. Majority-label and recency bias both push toward “positive”.","tokens":["positive","positive","negative","positive","?"],"code":"Review: Great sound for the price.     Sentiment: positive\nReview: Comfortable all day.          Sentiment: positive\nReview: Arrived late and scratched.   Sentiment: negative\nReview: Easy to pair with my phone.   Sentiment: positive\nReview: It works, but it broke within a week.\nSentiment:"},
{"label":"Raw prediction","caption":"For the mixed review the model leans “positive” at 0.58. Is that the review, or the prompt?","matrix":{"title":"Label probabilities","rows":["Raw"],"cols":["positive","negative"],"values":[[0.58,0.42]],"min":0,"max":1.5}},
{"label":"Content-free probe","caption":"Send the same prompt with “N/A” as the review. An input with no content should score 50/50; the 0.70 is the prompt’s own bias.","matrix":{"title":"Label probabilities","rows":["Raw","Content-free"],"cols":["positive","negative"],"values":[[0.58,0.42],[0.7,0.3]],"min":0,"max":1.5}},
{"label":"Divide","caption":"Divide each raw probability by its content-free probability: 0.58 ÷ 0.70 = 0.83 and 0.42 ÷ 0.30 = 1.40.","matrix":{"title":"Label probabilities","rows":["Raw","Content-free","Raw ÷ content-free"],"cols":["positive","negative"],"values":[[0.58,0.42],[0.7,0.3],[0.83,1.4]],"min":0,"max":1.5}},
{"label":"Renormalize","caption":"Rescale to sum to 1: 0.83 ÷ 2.23 = 0.37 and 1.40 ÷ 2.23 = 0.63. The calibrated answer is “negative”, with no new labeled data and one extra call per prompt.","matrix":{"title":"Label probabilities","rows":["Raw","Content-free","Raw ÷ content-free","Calibrated"],"cols":["positive","negative"],"values":[[0.58,0.42],[0.7,0.3],[0.83,1.4],[0.37,0.63]],"min":0,"max":1.5}}]}
```

**Order.** Lu et al. found that order alone can separate near state-of-the-art from near-random results across model sizes, and that a good order for one model often fails on another. They pick orders by entropy on a probing set the model generates itself.

**Selection: similarity versus diversity.** KATE ([Liu et al., “What Makes Good In-Context Examples for GPT-3?” (2022)](https://aclanthology.org/2022.deelio-1.10/)) retrieves each test input’s nearest neighbors by embedding and uses them as demonstrations, beating random selection. Run per request against an example store, it is dynamic few-shot ([embeddings](#embeddings)). Near neighbors can all share one label and feed majority-label bias, so mix in diversity, which [Zhang et al., “Automatic Chain of Thought Prompting in Large Language Models” (2022)](https://arxiv.org/abs/2210.03493) found also limits the damage from flawed generated demonstrations.

**Self-generated demonstrations.** When writing demonstrations by hand is too expensive, let the model write them. Auto-CoT writes [reasoning chains](#reasoning-prompts) with “Let’s think step by step”; Agarwal et al.’s reinforced ICL keeps only model rationales that reach the correct final answer, so it needs those answers or another correctness check. Their unsupervised ICL shows only the problems: it works on MATH but fails where outputs define the task, such as low-resource translation. [Prompt optimization](#prompt-optimization) automates the bootstrapping.

**Many-shot.** Agarwal et al. report gains with hundreds to thousands of examples, results comparable to full fine-tuning on low-resource translation and overridden pretraining biases, but also a drop on GPQA at 250 shots and lasting order sensitivity. [Bertsch et al., “In-Context Learning with Long-Context Models: An In-Depth Exploration” (2024)](https://arxiv.org/abs/2405.00200) found that retrieval helps less as demonstrations grow, and that grouping same-label examples hurts. The cost is linear: every example is processed on every request.

**Why it works at all.** One mechanistic hypothesis is induction heads, attention heads that continue patterns seen earlier in the context. [Olsson et al., “In-context Learning and Induction Heads” (2022)](https://arxiv.org/abs/2209.11895) argue they may drive most in-context learning, which they define broadly as loss falling later in the context. They give causal evidence in small attention-only models and correlational evidence in larger ones ([mechanistic interpretability](#mech-interp)).

## In practice
- **Format identically:** same fields, order and label spelling in every example and the query, wrapped in `<example>` tags inside `<examples>`. [Anthropic’s guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) suggests 3 to 5 relevant, diverse examples (as of November 2026).
- **Balance labels** and vary which label comes last; calibrate when you can read log-probs.
- **Stable block first, retrieved examples after.** Caches match exact prefixes ([OpenAI](https://developers.openai.com/api/docs/guides/prompt-caching), [Anthropic](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), as of November 2026); see [prompt caching](#prompt-caching).
- **Measure the spread** over several orders and example sets on held-out data, not the best run ([prompt robustness](#prompt-robustness)).

Dynamic few-shot from an example store, with the most similar example last, next to the query. KATE’s default puts it first; Liu et al. found the order of retrieved examples mattered little and that the better order depended on the dataset, so test both:

```python
import os
import numpy as np
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

def embed(texts):
    resp = client.embeddings.create(model="<embedding-model-id>", input=texts)
    vecs = np.array([d.embedding for d in resp.data])
    return vecs / np.linalg.norm(vecs, axis=1, keepdims=True)

store = [  # labeled examples, embedded once
    {"input": "I was charged twice this month.", "label": "billing"},
    {"input": "The export button does nothing.", "label": "bug"},
    {"input": "How do I add a teammate?", "label": "how-to"},
]
store_vecs = embed([ex["input"] for ex in store])

INSTRUCTIONS = "Classify the ticket as billing, bug or how-to. Answer with the label only."

def build_input(ticket, k=2):
    sims = store_vecs @ embed([ticket])[0]
    top = np.argsort(sims)[-k:]  # k nearest, ascending: the closest lands next to the query
    shots = "\n".join(
        f"<example>\n<ticket>{store[i]['input']}</ticket>\n<label>{store[i]['label']}</label>\n</example>"
        for i in top
    )
    return f"<examples>\n{shots}\n</examples>\n<ticket>{ticket}</ticket>"

resp = client.responses.create(
    model="<model-id>",
    instructions=INSTRUCTIONS,  # fixed part first: once long enough, this prefix can be cached
    input=build_input("My invoice shows the wrong company name."),
)
print(resp.output_text)
```

```viz
{"id":"in-context-learning-token-cost","component":"calculator","title":"Example tokens grow linearly with the shot count, and caching a stable block pays most of them back","caption":"Illustrative prices and multipliers: enter your provider’s current prices and your measured hit rate. Per-query retrieved examples change every request and do not get this discount.","alt":"Calculator for the daily input cost of a fixed example block, from shots, tokens per example, requests per day, input price, cache hit rate and cache multipliers.","data":"formula","try":"Set shots to 500 to see many-shot cost, then set the hit rate to 0.","outputs":[{"id":"example_tokens","label":"Example tokens per request","expr":"shots * tokens_per_shot","unit":"count"},{"id":"uncached","label":"Daily example cost without caching","expr":"requests * example_tokens * price / 1000000","unit":"usd"},{"id":"cached","label":"Daily example cost with caching","expr":"requests * example_tokens * price * (hit * read_mult + (1 - hit) * write_mult) / 1000000","unit":"usd","main":true},{"id":"saving","label":"Saving from caching","expr":"1 - cached / uncached","unit":"pct"}],"inputs":{"shots":50,"tokens_per_shot":200,"requests":10000,"price":3,"hit":0.9,"read_mult":0.1,"write_mult":1.25},"input_meta":{"shots":{"label":"Examples in the prompt"},"tokens_per_shot":{"label":"Tokens per example"},"requests":{"label":"Requests per day"},"price":{"label":"Input price","unit":"$ per million, illustrative"},"hit":{"label":"Cache hit rate","unit":"0 to 1"},"read_mult":{"label":"Cached read multiplier","unit":"× input price"},"write_mult":{"label":"Cache write multiplier","unit":"× input price"}},"assumptions":["Every request sends the same example block, so it can be cached.","Every cache miss writes the block at the write multiplier.","Only example tokens are counted; instructions, query and output are excluded."],"tests":[{"inputs":{},"expect":{"example_tokens":10000,"uncached":300,"cached":64.5,"saving":0.785},"tol":0.001},{"inputs":{"shots":500},"expect":{"example_tokens":100000,"uncached":3000,"cached":645},"tol":0.001},{"inputs":{"hit":0},"expect":{"cached":375,"saving":-0.25},"tol":0.001}]}
```

Examples stop paying when a task is stable and high-volume. ICL processes every example on every prediction, and [Liu et al., “Few-Shot Parameter-Efficient Fine-Tuning is Better and Cheaper than In-Context Learning” (2022)](https://arxiv.org/abs/2205.05638) found parameter-efficient fine-tuning more accurate and far cheaper. In a fair comparison the two generalize similarly out of domain, with large variation for both ([Mosbach et al., “Few-shot Fine-tuning vs. In-context Learning: A Fair Comparison and Evaluation” (2023)](https://arxiv.org/abs/2305.16938)), and fine-tuning needs more data before it overtakes ICL (Bertsch et al.). See [fine-tuning in practice](#fine-tuning-practice).

```viz
{"id":"in-context-learning-decision","component":"tree","title":"Fix the examples first, add more when the curve still climbs, and fine-tune when volume makes them expensive","caption":"Illustrative decision guide. Expand the symptom you see; each leaf names the usual next step.","alt":"Decision tree mapping example problems to fixes: consistent format, label balance and calibration, retrieved examples, generated demonstrations, many-shot with caching, fine-tuning, or retrieval of facts.","data":"illustrative","open":1,"root":{"label":"What is going wrong?","children":[
{"label":"Wrong label words or format","children":[{"label":"Make every example identical in fields, tags and label spelling; enforce parseable output","link":"#structured-outputs"}]},
{"label":"Answers skew toward one label","children":[{"label":"Balance labels, vary the last one, or calibrate with a content-free input"}]},
{"label":"Inputs vary too much for one fixed set","children":[{"label":"Retrieve similar examples per query from an embedded example store","link":"#embeddings"}]},
{"label":"No hand-written demonstrations","children":[{"label":"Generate demonstrations and keep only the ones you can check","link":"#prompt-optimization"}]},
{"label":"Still short with dozens of good examples","children":[{"label":"Try many-shot with a cached block, and measure the curve","link":"#prompt-caching"}]},
{"label":"High volume, and the example bill hurts","children":[{"label":"Fine-tune and compare against the best prompt","link":"#fine-tuning-practice"}]},
{"label":"The model lacks facts, not behavior","children":[{"label":"Retrieval, not examples","link":"#rag-fundamentals"}]}]}}
```

## Numbers to know
> [!number]
> Rules of thumb, with their sources.
> - **Random labels:** 0 to 5 points lost for nearly all of 12 models ([Min et al., 2022](https://aclanthology.org/2022.emnlp-main.759/)).
> - **Calibration:** up to 30 points gained, the best case ([Zhao et al., 2021](https://proceedings.mlr.press/v139/zhao21c.html)).
> - **Many-shot:** gains with hundreds to thousands of examples, but a drop on GPQA at 250 shots ([Agarwal et al., 2024](https://papers.nips.cc/paper_files/paper/2024/hash/8cb564df771e9eacbfe9d72bd46a24a9-Abstract-Conference.html)).
> - **Vendor guidance:** 3 to 5 examples ([Anthropic](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices), as of November 2026).
> - **Cost:** shots × tokens per example, on every request unless cached.

## Pitfalls and anti-patterns
> [!pitfall] Examples that teach a pattern you did not intend
> If most examples share a label, a length or an opening phrase, the model copies it. Count the labels, check the last one, vary the surface.

- **Tuning order on one model.** Good orders do not transfer (Lu et al.); re-test after every model change.
- **Retrieval that returns clones.** Same-label neighbors feed majority-label bias; retrieve per label.
- **Retrieved examples above the instructions.** Every request gets a new prefix and a cache miss.
- **Demonstrations from untrusted text.** Hundreds of demonstrations of undesired behavior can jailbreak models, with a power law in the number of shots ([Anil et al., “Many-shot Jailbreaking” (2024)](https://proceedings.neurips.cc/paper_files/paper/2024/hash/ea456e232efb72d261715e33ce25f208-Abstract.html)). Keep user and retrieved content out of the example block ([jailbreaks and misuse](#jailbreaks-misuse)).

## Talk like an expert
The vocabulary: **shots**, **label space**, **contextual calibration**, **majority-label** and **recency bias**, **KATE**, **dynamic few-shot**, **many-shot**, **reinforced** and **unsupervised ICL**, **induction heads**. Experts report the spread over orders and treat the example set as versioned, evaluated data. The live debate is whether ICL learns or locates: random labels barely hurting (Min et al.) suggests locating a task learned in pretraining; large models following flipped labels (Wei et al.) and many-shot gains suggest real learning from the prompt.

> [!hottake] Past a handful of examples, the next example is worse value than a fine-tune.
> **The counterargument:** many-shot ICL performed comparably to full fine-tuning on low-resource translation (Agarwal et al.) with no training pipeline, changes in seconds, and gets cheaper with a cached block; fine-tuning needs more data before it pulls ahead (Bertsch et al.).

## Check yourself
```quiz
in-context-learning
```

## Go deeper
- [Brown et al., “Language Models are Few-Shot Learners” (2020)](https://arxiv.org/abs/2005.14165).
- [Min et al., “Rethinking the Role of Demonstrations: What Makes In-Context Learning Work?” (2022)](https://aclanthology.org/2022.emnlp-main.759/).
- [Zhao et al., “Calibrate Before Use: Improving Few-Shot Performance of Language Models” (2021)](https://proceedings.mlr.press/v139/zhao21c.html).
- [Agarwal et al., “Many-Shot In-Context Learning” (2024)](https://papers.nips.cc/paper_files/paper/2024/hash/8cb564df771e9eacbfe9d72bd46a24a9-Abstract-Conference.html).

## Related
- [Prompting fundamentals](#prompting-fundamentals)
- [Prompt sensitivity and robust prompt testing](#prompt-robustness)
- [Prompt optimization](#prompt-optimization)
- [Prompt caching and token economics](#prompt-caching)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Mechanistic interpretability](#mech-interp)
