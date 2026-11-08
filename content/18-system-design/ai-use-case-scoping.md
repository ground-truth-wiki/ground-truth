---
id: ai-use-case-scoping
book: 18
order: "18.0"
title: "Scoping AI features: when to use AI and what success means"
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [scoping, product, success-criteria, requirements, decision-making]
visuals:
  - ai-use-case-scoping-gates:tree
  - ai-use-case-scoping-error-costs:calculator
  - ai-use-case-scoping-worksheet:stepper
prerequisites: [ai-engineer-role]
---
> [!tldr]
> Scoping decides whether a feature should use AI at all, what role AI plays, and what “good enough” means. Start from the user need and a non-AI baseline, test the model on real cases, and write success criteria that price each kind of error. A session that ends in “no AI here” has done its job.

## Why it matters
An AI feature can fail before its first prompt: the problem did not need AI, nobody agreed on success, or a demo passed for a product. In the [chapter summaries](https://github.com/chiphuyen/aie-book/blob/main/chapter-summaries.md) of her book *AI Engineering*, Chip Huyen calls whether to build at all “an important yet often overlooked question”. Scoping is the first step of the [system design method](#system-design-method), sets the targets your [evals](#why-evals) check, and draws on a core [AI engineer](#ai-engineer-role) skill: knowing when not to use AI.

## Intuition
Scoping is like hiring. You ask whether the work needs a person or a checklist, which parts the team wants to keep, how a candidate does on real work, and what a good first quarter looks like. An AI feature deserves the same questions. The [People + AI Guidebook](https://pair.withgoogle.com/chapter/user-needs/) from Google’s PAIR (People + AI Research) team suggests changing the question from “Can we use AI to ___?” to “How might we solve ___? Can AI solve this problem in a unique way?”

```viz
{"id":"ai-use-case-scoping-gates","component":"tree","title":"Five gates stand between an idea and an AI feature, and each one can end in “no AI”","caption":"Illustrative order. The questions come from Google PAIR, Google’s problem-framing guide, Zinkevich’s Rules of Machine Learning, Apple’s design guidelines, Dell’Acqua et al. (2026) and Anthropic’s guide to success criteria. Expand a gate; leaves with a link open the chapter that goes deeper.","alt":"Tree of five scoping gates: beat a non-AI baseline, decide between automating and augmenting, name the role AI plays, test whether the task is inside the jagged frontier, and define success with priced errors.","data":"illustrative","try":"Open gate 1 and name the non-AI version of a feature on your own roadmap.","open":1,"root":{"label":"A user need, written without the word AI","children":[
{"label":"1. Baseline: can a rule, search, form or lookup meet the need?","children":[{"label":"Yes, or nearly: ship that and measure it. It is the benchmark any AI version must beat."},{"label":"The value is predictability, the information is static, errors are very costly or full transparency is required: AI is probably not better (PAIR)."},{"label":"The rules have grown complex and you have data: now consider a model (Rules of ML, Rule #3)."}]},
{"label":"2. Automate or augment?","children":[{"label":"Automate boring, repetitive, awkward or dangerous work, and keep a way for people to oversee it","link":"#human-in-the-loop"},{"label":"Augment work people enjoy, are responsible for, or where the stakes are high","link":"#autonomy-and-oversight"},{"label":"Wizard of Oz: a person secretly plays the AI, to see how users feel about the results (PAIR)"}]},
{"label":"3. What role does AI play in the product?","children":[{"label":"Critical or complementary, private or public data, proactive or reactive, visible or invisible, dynamic or static (Apple)"},{"label":"Plan a non-AI fallback where you can","link":"#ai-product-ux"}]},
{"label":"4. Is the task inside the jagged frontier?","children":[{"label":"Run the model by hand on real, messy cases before building anything","link":"#error-analysis"}]},
{"label":"5. What does success mean?","children":[{"label":"Specific, measurable, achievable and relevant criteria for quality, severe errors, safety, latency and cost","link":"#why-evals"},{"label":"Price false positives and false negatives separately","link":"#classification-metrics"},{"label":"Track the product metric and the model metric apart","link":"#measuring-ai-impact"}]}]}}
```

## How it works
**Gate 1: beat the baseline.** PAIR notes that “often a rule or heuristic-based solution will work just as well, if not better, than an AI version”. Google’s [problem-framing guide](https://developers.google.com/machine-learning/problem-framing/problem) calls the non-ML solution “the benchmark to measure an ML solution against”. Zinkevich’s [Rules of Machine Learning](https://developers.google.com/machine-learning/guides/rules-of-ml) open with “Don’t be afraid to launch a product without machine learning” (Rule #1). Rule #3 adds that “a complex heuristic is unmaintainable”: once you have data and a clear goal, move on to machine learning. PAIR also lists when AI is probably not better: when predictability is the point, the information is static (a credit card form), errors are very costly, or full transparency is required.

**Gate 2: automate or augment.** PAIR suggests automating boring, repetitive, awkward or dangerous tasks, with human oversight. Augment when people enjoy the task, are responsible for it, face high stakes, or struggle to put their preferences into words. A task people say they do not want automated is “a good task not to try to disrupt”. To find out, PAIR suggests letting people try the product, or a Wizard of Oz test, and seeing how they feel about the results. In a [Wizard of Oz](https://en.wikipedia.org/wiki/Wizard_of_Oz_experiment) test, a person secretly runs a system that users believe is automated.

**Gate 3: name the role.** Apple’s [machine learning guidelines](https://developer.apple.com/design/human-interface-guidelines/machine-learning) give five axes: critical or complementary (does the app work without it?), private or public data (sensitive data makes errors more serious), proactive or reactive (people tolerate less from results they did not ask for), visible or invisible (invisible ones struggle to show reliability), and dynamic or static. Apple’s [generative AI guidelines](https://developer.apple.com/design/human-interface-guidelines/generative-ai) add that generative AI is “not the right solution for every situation”, and suggest a non-AI fallback.

**Gate 4: probe the jagged frontier.** Dell’Acqua et al., [“Navigating the Jagged Technological Frontier”](https://doi.org/10.1287/orsc.2025.21838) (2026), named AI’s uneven reach: it helps on some tasks and hurts on others “with a seemingly similar level of difficulty”. In their experiment with 758 consultants, run with Boston Consulting Group and GPT-4, AI users did better on 18 tasks inside the frontier and worse on one task outside it. Only tests on real cases show where your task falls, and with which model.

**Gate 5: price the errors.** PAIR: “It is tempting to weigh both equally by default. However, that’s not likely to match the consequences in real life for users.” Favor **precision** (fewer false alarms) when false positives cost more, and **recall** (fewer misses) when misses do. See [classification metrics](#classification-metrics).

```viz
{"id":"ai-use-case-scoping-error-costs","component":"calculator","title":"If a miss costs 100 times a false alarm, the high-recall setting costs about a fifth as much","caption":"Illustrative: a model flags the 2% of 10,000 monthly support tickets that report a safety problem. Setting A is tuned for precision, setting B for recall. Costs are in any unit, the same for both errors. Make the two costs equal and A wins.","alt":"Calculator comparing the monthly cost of errors at two operating points, from the number of cases, the share of positives, the recall and precision of each setting, and the cost of a false positive and a false negative.","data":"formula","try":"Set the cost of a miss to 2, the same as a false alarm, and watch the saving turn negative.","formula":"cost = false positives × cost of a false alarm + false negatives × cost of a miss","inputs":{"n":10000,"prevalence":0.02,"recall_a":0.7,"precision_a":0.9,"recall_b":0.95,"precision_b":0.5,"cost_fp":2,"cost_fn":200},"input_meta":{"n":{"label":"Cases per month","min":100,"step":100},"prevalence":{"label":"Share of cases that are positive","min":0,"max":1,"step":0.01},"recall_a":{"label":"Setting A: recall","min":0.01,"max":1,"step":0.01},"precision_a":{"label":"Setting A: precision","min":0.01,"max":1,"step":0.01},"recall_b":{"label":"Setting B: recall","min":0.01,"max":1,"step":0.01},"precision_b":{"label":"Setting B: precision","min":0.01,"max":1,"step":0.01},"cost_fp":{"label":"Cost of a false alarm","unit":"any unit","min":0},"cost_fn":{"label":"Cost of a miss","unit":"same unit","min":0}},"outputs":[{"id":"pos","label":"Positive cases","expr":"n * prevalence","unit":"count"},{"id":"fn_a","label":"A: misses (false negatives)","expr":"pos * (1 - recall_a)","unit":"count"},{"id":"fp_a","label":"A: false alarms (false positives)","expr":"pos * recall_a * (1 - precision_a) / precision_a","unit":"count"},{"id":"cost_a","label":"A: cost of errors","expr":"fp_a * cost_fp + fn_a * cost_fn"},{"id":"fn_b","label":"B: misses (false negatives)","expr":"pos * (1 - recall_b)","unit":"count"},{"id":"fp_b","label":"B: false alarms (false positives)","expr":"pos * recall_b * (1 - precision_b) / precision_b","unit":"count"},{"id":"cost_b","label":"B: cost of errors","expr":"fp_b * cost_fp + fn_b * cost_fn"},{"id":"saving","label":"Cost of A minus cost of B (positive: B is cheaper)","expr":"cost_a - cost_b","main":true}],"assumptions":["False alarms follow from precision: false positives = true positives × (1 − precision) ÷ precision.","Correct decisions cost nothing, and every error of one type costs the same.","Recall and precision are measured on data with the same share of positives as production."],"tests":[{"inputs":{},"expect":{"pos":200,"fn_a":60,"fp_a":15.5555556,"cost_a":12031.1111111,"fn_b":10,"fp_b":190,"cost_b":2380,"saving":9651.1111111},"tol":0.000001},{"inputs":{"cost_fn":2},"expect":{"cost_a":151.1111111,"cost_b":400,"saving":-248.8888889},"tol":0.000001}]}
```

**Write success criteria.** Anthropic’s [guide](https://platform.claude.com/docs/en/test-and-evaluate/define-success) asks for criteria that are specific, measurable, achievable and relevant, and notes that “most use cases need multidimensional evaluation”. Its example sets targets for F1, non-toxic outputs, the share of errors that are mere inconveniences, and response time. Its list of common criteria also includes price, so add cost per task. Google’s [framing guide](https://developers.google.com/machine-learning/problem-framing/ml-framing) separates **success metrics**, what you care about (such as engagement), from evaluation metrics such as precision and recall: a model “might have great evaluation metrics, but not move you closer to your success criteria”. See [measuring AI impact](#measuring-ai-impact).

**Plan past the demo.** LinkedIn engineers [reported](https://www.linkedin.com/blog/engineering/generative-ai/musings-on-building-a-generative-ai-product) in 2024 that they reached 80% of the basic experience they aimed for in the first month, then spent four more months trying to pass 95% of the full experience. Plan maintenance: Anthropic [gives](https://platform.claude.com/docs/en/about-claude/model-deprecations) customers with active deployments at least 60 days’ notice before retiring a publicly released model (as of November 2026), and Apple advises planning for “fine-tuning, retesting, and prompt engineering” when moving to a newer base model. Prices move as well; see [AI pricing and unit economics](#ai-pricing-unit-economics).

## In practice
Fill in a one-page worksheet before anyone writes a prompt. This illustrative one ends in “do not use AI”.

```viz
{"id":"ai-use-case-scoping-worksheet","component":"stepper","title":"A request for an AI leave assistant stops at the first gate: a database lookup already gives the exact answer","caption":"Illustrative request, walked through the worksheet. The same HR team’s policy questions would need a worksheet of their own.","alt":"Stepper through a one-page scoping worksheet for a requested AI assistant that tells employees their remaining vacation days: need, baseline, added value, role, errors, success criteria and the decision not to use AI.","data":"illustrative","try":"Stop at Baseline and ask what the AI version would add that the lookup does not.","frames":[
{"label":"Need","caption":"Write the need without the word AI. Employees want to know their remaining vacation days before they book time off. Today they email HR, who look it up in the HR system.","code":"need: employees know their leave balance before booking time off"},
{"label":"Baseline","caption":"The non-AI version: read the balance from the HR system and show it on the portal’s home page and in the leave request form. It is exact, instant and almost free to run.","code":"baseline: database lookup, shown on the portal and in the request form"},
{"label":"Added value","caption":"What would AI add? Typing a question to get one number that a form field already shows. This is PAIR’s case of static, limited information, where AI is probably not better.","code":"ai_adds: natural-language access to a single field"},
{"label":"Role","caption":"Critical, private, reactive, visible, static. Apple’s guidelines say critical features and sensitive data both raise the demand for accuracy and reliability.","code":"role: critical | private | reactive | visible | static"},
{"label":"Errors","caption":"A generated number can be wrong; a lookup is as right as the data. A false “you still have days left” costs more than the convenience is worth. Predictability is the whole value here.","code":"worst_error: wrong balance -> wrong booking, payroll dispute"},
{"label":"Success","caption":"Criteria: every balance shown matches the HR system, it appears in under a second, and it costs nothing per query beyond hosting. The lookup meets them by construction; a model cannot promise the first one.","code":"criteria: balance_match = 100%, latency < 1 s, no per-query model cost"},
{"label":"Decision","caption":"Do not use AI here. Ship the lookup. Questions like “can I carry days over into next year?” are a different need, with open-ended text, and may pass the gates on their own worksheet.","code":"decision: no AI\nrevisit_if: employees ask policy questions the portal cannot answer"}]}
```

When a use case passes, turn its criteria into a launch gate for the eval run:

```python
# Illustrative thresholds: take yours from the worksheet, not from this example.
CRITERIA = {
    "task_success_rate": (">=", 0.90),
    "severe_error_rate": ("<=", 0.005),
    "p95_latency_s": ("<=", 3.0),
    "cost_per_task_usd": ("<=", 0.02),
}

def launch_gate(measured: dict[str, float]) -> list[str]:
    """Return the failing criteria; an empty list means the gate passes."""
    failures = []
    for name, (op, target) in CRITERIA.items():
        value = measured.get(name)
        if value is None:
            failures.append(f"{name}: not measured")
        elif (op == ">=" and value < target) or (op == "<=" and value > target):
            failures.append(f"{name}: {value} (target {op} {target})")
    return failures
```

Decision rules:
- **Optimize and measure the baseline first,** as Google’s problem-framing guide advises. AI must beat it on the criteria.
- **Record a revisit trigger** in a [decision record](#decision-guides); the frontier and prices move.
- **Estimate volume and cost** with a [back-of-the-envelope estimate](#back-of-envelope) before picking a model.

> [!try]
> Pick one AI feature on your roadmap. Write down its non-AI version and the metric the AI version must beat.

## Numbers to know
> [!number]
> Two rules of thumb and one study result, each from a single source. Zinkevich (Rule #1): “If you think that machine learning will give you a 100% boost, then a heuristic will get you 50% of the way there.” LinkedIn (2024): 80% of the basic experience in the first month, then four more months trying to pass 95%. Dell’Acqua et al. (2026), with GPT-4: inside the frontier, AI users completed 12.2% more tasks, 25.1% faster on average; on the task outside it, they were 19% less likely to produce a correct solution.

## Pitfalls and anti-patterns
> [!pitfall] Starting from the technology
> “Can we use AI to ___?” yields features in search of a problem. Start from the need and the baseline.

- **Judging the frontier from a demo.** Test the hard, messy cases.
- **Equal error weights.** A missed safety report and a false alarm do not cost the same.
- **Model metrics as the goal.** A higher F1 that leaves the product metric flat is not a win.
- **No fallback.** A feature with no non-AI path stops working whenever its model does. Apple suggests a non-AI fallback where possible.

## Talk like an expert
The vocabulary: **non-AI baseline**, **automate versus augment**, **critical versus complementary**, **jagged frontier**, **Wizard of Oz test**, **success metric versus model metric**, **revisit trigger**. Co-author Ethan Mollick’s 2023 [post on the study](https://www.oneusefulthing.org/p/centaurs-and-cyborgs-on-the-jagged) adds **centaurs**, who split work with AI, and **cyborgs**, who interleave it. Experts ask “what does the non-AI version score?” before “which model?”. The live debate: Zinkevich’s Rule #1 assumes machine learning needs data, but a prompt needs none to try. Does heuristics-first still hold?

> [!hottake] The most valuable outcome of a scoping session is often “no AI here”.
> **The counterargument:** a prompt prototype can be about as cheap to try as a heuristic, and the frontier moves as models change. A no that is never tested or revisited misses the cases where AI now wins.

## Check yourself
```quiz
ai-use-case-scoping
```

## Go deeper
- Google PAIR, [People + AI Guidebook: User Needs + Defining Success](https://pair.withgoogle.com/chapter/user-needs/).
- Zinkevich, [Rules of Machine Learning: Best Practices for ML Engineering](https://developers.google.com/machine-learning/guides/rules-of-ml) (Google).
- Dell’Acqua et al., [“Navigating the Jagged Technological Frontier: Field Experimental Evidence of the Effects of Artificial Intelligence on Knowledge Worker Productivity and Quality”](https://doi.org/10.1287/orsc.2025.21838) (2026).

## Related
- [The AI system design method](#system-design-method)
- [Decision guides](#decision-guides)
- [AI product and UX](#ai-product-ux)
- [Why evals are the core skill](#why-evals)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Back-of-the-envelope estimation](#back-of-envelope)
