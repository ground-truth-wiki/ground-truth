---
id: guard-models-moderation
book: 17
order: "17.3.1"
title: Guard models and content moderation
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [guard-models, safety-classifiers, content-moderation, guardrails, trust-and-safety]
visuals:
  - guard-models-moderation-checkpoints:diagram
  - guard-models-moderation-families:tree
  - guard-models-moderation-threshold:calculator
  - guard-models-moderation-pipeline:stepper
prerequisites: [secure-agent-design, guardrails-control]
---
> [!tldr]
> A guard model is a classifier that labels prompts, replies, tool calls or whole conversations against a written harm policy. It is one part of a moderation system that also needs rules, a threshold per harm, human review, appeals and audits. Measure it on your own traffic before you trust its published scores.

## Why it matters
Any product that takes content from people, or shows them model output, must decide what it will not process or show. A guard makes that decision cheaply at scale, and it is easy to get wrong: a threshold copied from a model card can flood a review queue, or miss most of a rare harm. This chapter extends [secure agent design](#secure-agent-design) and the guard layer of [guardrails and control](#guardrails-control).

## Intuition
Think of airport security. The metal detector is a rule: fast, and blind to anything it was not built for. The X-ray screener is the guard model, judging each bag against a rulebook. Unclear bags go to a person, and passengers can complain. The system is designed around the screener’s errors.

```viz
{"id":"guard-models-moderation-checkpoints","component":"diagram","title":"Guards can check four places: what comes in, what goes out, what the agent does, and the whole trajectory","caption":"A concept diagram. Rules and block lists run beside the guards, cheaper and narrower. Tool results are untrusted input, so screen them like user input. Click a box for its chapter.","alt":"Diagram: user input passes an input guard to the model; the model's reply passes an output guard; the model's tool calls pass a tool-call guard before reaching tools, whose untrusted results flow back to the model; rules and block lists feed the input guard; a trajectory monitor watches the whole conversation and agent trace.","data":"illustrative","try":"Click the trajectory monitor, then name an attack that a guard checking one message at a time would miss.","w":600,"h":250,"nodes":[
{"id":"user","label":"User","sub":"prompt, files, images","role":"human","x":0,"y":0,"w":120,"h":52},
{"id":"in","label":"Input guard","sub":"harm, jailbreak, injection","role":"tool","x":160,"y":0,"w":140,"h":52,"link":"#jailbreaks-misuse"},
{"id":"model","label":"Model","sub":"your LLM or agent","role":"model","x":340,"y":0,"w":110,"h":52},
{"id":"out","label":"Output guard","sub":"harm, leaks, while streaming","role":"tool","x":480,"y":0,"w":120,"h":52,"link":"#streaming"},
{"id":"rules","label":"Rules and lists","sub":"regex, hashes, allowlists","role":"data","x":0,"y":110,"w":140,"h":52},
{"id":"toolg","label":"Tool-call guard","sub":"arguments, policy","role":"tool","x":320,"y":110,"w":150,"h":52,"link":"#guardrails-control"},
{"id":"tool","label":"Tool results","sub":"web, email, files","role":"untrusted","x":490,"y":110,"w":110,"h":52,"link":"#prompt-injection"},
{"id":"traj","label":"Trajectory monitor","sub":"the whole conversation and agent trace","role":"agent","x":0,"y":200,"w":600,"h":46,"link":"#secure-agent-design"}],
"edges":[{"from":"user","to":"in"},{"from":"in","to":"model"},{"from":"model","to":"out"},{"from":"model","to":"toolg"},{"from":"toolg","to":"tool"},{"from":"tool","to":"model","label":"untrusted"},{"from":"rules","to":"in","style":"dashed"},{"from":"model","to":"traj","style":"dashed"}]}
```

The policy, not the guard, decides what is harmful. It defines each harm with examples and lists the actions allowed. MLCommons’ AILuminate v1.0 defines 12 hazard categories, including hate, privacy and specialized advice (Ghosh et al., [2025](https://arxiv.org/abs/2503.05731)), and provider usage policies, such as Anthropic’s [Usage Policy](https://www.anthropic.com/legal/aup), set a floor. Actions go beyond block or allow: removing or labeling content, reducing its visibility, restricting accounts, warnings and reports to law enforcement ([TSPA](https://www.tspa.org/curriculum/ts-fundamentals/policy/enforcement-methods/)). An LLM app can also answer safely or show support resources.

## How it works
**Checkpoints.** Meta’s LlamaFirewall (Chennabasappa et al., [2025](https://arxiv.org/abs/2505.03574)) runs Prompt Guard 2 on inputs, AlignmentCheck on the agent’s reasoning and CodeShield on generated code. On AgentDojo, the first two together cut attack success from 17.6% to 1.75%, while task utility fell from 47.7% to 42.7%. Hash matching finds known material quickly at scale and reduces how much of it reviewers must see ([TSPA](https://www.tspa.org/curriculum/ts-fundamentals/automated-systems-and-ai/models/)).

**Fixed taxonomy or policy in the prompt.** The moderation APIs of 2023 each enforced one fixed policy, so they could not adapt to a new one (Inan et al., [2023](https://arxiv.org/abs/2312.06674)). Llama Guard, from the same paper, takes its taxonomy as part of the input, and its authors report success on new policies with zero-shot and few-shot prompts, without fine-tuning. OpenAI’s gpt-oss-safeguard reads your whole written policy and returns a decision with its reasoning ([model card](https://huggingface.co/openai/gpt-oss-safeguard-20b)). OpenAI’s [guide](https://developers.openai.com/cookbook/articles/gpt-oss-safeguard-guide) states the price: trained classifiers are faster and cheaper, and with thousands of examples likely more accurate. It suggests pre-filtering: run a fast classifier on everything and the reasoner only on ambiguous cases.

```viz
{"id":"guard-models-moderation-families","component":"tree","title":"Guard families differ in what they check and in who writes the policy","caption":"Expand a family. Sources: the [Llama Guard 4](https://huggingface.co/meta-llama/Llama-Guard-4-12B) and [Prompt Guard 2](https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M) model cards, ShieldGemma (Zeng et al., [2024](https://arxiv.org/abs/2407.21772)), Granite Guardian (Padhi et al., [2024](https://arxiv.org/abs/2412.07724)), WildGuard (Han et al., [2024](https://arxiv.org/abs/2406.18495)), and the papers and docs linked in the text.","alt":"Tree of guard families: harm classifiers trained on a fixed taxonomy (Llama Guard 4, ShieldGemma, Granite Guardian, WildGuard, Qwen3Guard), attack detectors (Prompt Guard 2, LlamaFirewall), policy-following reasoners (gpt-oss-safeguard), provider-run classifiers (OpenAI moderation endpoint, constitutional classifiers and their successor), and frameworks that orchestrate guards (NeMo Guardrails, Guardrails AI).","data":"real","source":"each project’s paper, model card or documentation","asof":"November 2026","try":"Open “Policy-following reasoners” and compare what you would have to do to add a new harm category there and under the fixed-taxonomy family.","open":1,"root":{"label":"Guard families","children":[
{"label":"Harm classifiers trained on a fixed taxonomy","children":[{"label":"Llama Guard 4 (Meta): 12B, text and images, prompts and replies, 14 categories based on the MLCommons taxonomy"},{"label":"ShieldGemma (Google): built on Gemma 2; sexually explicit content, dangerous content, harassment and hate speech; trained mainly on synthetic data"},{"label":"Granite Guardian (IBM): harm risks and jailbreaks, plus groundedness and relevance checks for RAG"},{"label":"WildGuard (Ai2): harmful prompts, harmful replies and refusals; trained on WildGuardMix, 92K labeled examples"},{"label":"Qwen3Guard (Alibaba Cloud): 0.6B, 4B and 8B; labels safe, controversial or unsafe; up to 119 languages; a Stream variant labels tokens during generation"}]},
{"label":"Attack detectors","children":[{"label":"Prompt Guard 2 (Meta): 86M and 22M; labels text malicious when it explicitly tries to override instructions; 512-token window","link":"#prompt-injection"},{"label":"LlamaFirewall (Meta): Prompt Guard 2 on inputs, AlignmentCheck on the agent’s reasoning, CodeShield on generated code","link":"#secure-agent-design"}]},
{"label":"Policy-following reasoners","children":[{"label":"gpt-oss-safeguard (OpenAI): 20B and 120B open weights under Apache 2.0; you write the policy, it returns a decision with its reasoning"}]},
{"label":"Provider-run classifiers","children":[{"label":"OpenAI moderation endpoint: free; text and images; 13 categories, each scored from 0 to 1"},{"label":"Constitutional classifiers (Anthropic): input and output classifiers trained on synthetic data generated from a written constitution","link":"#jailbreaks-misuse"},{"label":"Constitutional Classifiers++ (Anthropic): judge each reply together with its conversation, behind a cheap first-stage screen"}]},
{"label":"Frameworks that orchestrate guards","children":[{"label":"NeMo Guardrails (NVIDIA): input, dialog, retrieval, execution and output rails","link":"#guardrails-control"},{"label":"Guardrails AI: validators from a hub, combined into input and output guards"}]}]}}
```

**Streaming and context.** Stream Qwen3Guard labels tokens as they are generated (Zhao et al., [2025](https://arxiv.org/abs/2510.14276)), so a [streaming](#streaming) reply can be cut short. Constitutional Classifiers++ judge each reply in its full conversational context. That catches replies that look harmless alone but are harmful given the input, such as an answer to a request split into scattered fragments, or an answer in code words (Cunningham et al., [2026](https://arxiv.org/abs/2601.04603)); see [jailbreaks and misuse](#jailbreaks-misuse).

**A threshold per harm.** Pick each cutoff from the cost of each error. For imminent physical harm, extra false positives may be worth it ([TSPA](https://www.tspa.org/curriculum/ts-fundamentals/content-moderation-and-operations/metrics-for-content-moderation/)). Prevalence p, the share of items that violate, largely decides how many flags are wrong (see [classification metrics](#classification-metrics)):

```math
\text{precision} = \frac{p \cdot \text{recall}}{p \cdot \text{recall} + (1 - p) \cdot \text{FPR}}
```

```viz
{"id":"guard-models-moderation-threshold","component":"calculator","title":"When violations are rare, even a 1% false-positive rate makes most flags wrong","caption":"Every flag goes to a human reviewer. The defaults are illustrative: replace them with your own volume, prevalence, the recall and false-positive rate you measured at one threshold, and your own costs. Moving the threshold trades recall against false positives, so change both together.","alt":"Calculator for a guard threshold: from daily volume, prevalence, recall, false-positive rate and the costs of a check, a review and a missed violation, it computes precision, flags per day, false flags, misses and daily cost.","data":"formula","try":"Cut the false-positive rate to 0.001 and watch precision rise to about 64%; then also drop recall to 0.6 and see the daily cost climb because misses are expensive.","formula":"precision = prevalence × recall ÷ (prevalence × recall + (1 − prevalence) × fpr)","inputs":{"items_per_day":1000000,"prevalence":0.002,"recall":0.9,"fpr":0.01,"cost_check":0.00002,"cost_review":0.1,"cost_miss":5},"input_meta":{"items_per_day":{"label":"Items checked per day","min":0,"step":1000},"prevalence":{"label":"Share of items that violate","unit":"0 to 1","min":0,"max":1,"step":0.0005},"recall":{"label":"Recall at this threshold","unit":"0 to 1","min":0,"max":1,"step":0.01},"fpr":{"label":"False-positive rate at this threshold","unit":"0 to 1","min":0,"max":1,"step":0.001},"cost_check":{"label":"Cost per guard check","unit":"$, illustrative","min":0,"step":0.00001},"cost_review":{"label":"Cost per human review","unit":"$, illustrative","min":0,"step":0.01},"cost_miss":{"label":"Cost of one missed violation","unit":"$, your estimate","min":0,"step":0.5}},"outputs":[{"id":"precision","label":"Share of flags that are real violations","expr":"prevalence * recall / (prevalence * recall + (1 - prevalence) * fpr)","unit":"pct","main":true},{"id":"flagged","label":"Flags per day","expr":"items_per_day * (prevalence * recall + (1 - prevalence) * fpr)","unit":"count"},{"id":"false_flags","label":"False flags per day","expr":"items_per_day * (1 - prevalence) * fpr","unit":"count"},{"id":"missed","label":"Missed violations per day","expr":"items_per_day * prevalence * (1 - recall)","unit":"count"},{"id":"daily_cost","label":"Daily cost of checks, reviews and misses","expr":"items_per_day * cost_check + flagged * cost_review + missed * cost_miss","unit":"usd"}],"assumptions":["Every flagged item is reviewed by a person, and reviewers decide correctly.","Recall and false-positive rate were measured together at one threshold on a sample like your traffic.","A missed violation has one average cost; real harms vary by severity, so run the calculator per harm.","No second-stage reasoner and no automatic actions; both change the review load."],"tests":[{"inputs":{},"expect":{"precision":0.15280135823429541,"flagged":11780,"false_flags":9980,"daily_cost":2198}},{"inputs":{"fpr":0.001},"expect":{"precision":0.6433166547533953,"flagged":2798,"daily_cost":1299.8}},{"inputs":{"recall":0.6,"fpr":0.001},"expect":{"missed":800,"daily_cost":4239.8}}]}
```

**The generalization gap.** Young ([2025](https://arxiv.org/abs/2511.22047)) found that Qwen3Guard’s accuracy fell from 91.0% on public benchmark prompts to 33.8% on novel attacks, and suspects training-data contamination. Nasr et al. ([2025](https://arxiv.org/abs/2510.09023)) used adaptive attacks to bypass 12 recent defenses, four of them detector models such as PromptGuard, most with over 90% success; see [jailbreak techniques](#jailbreak-techniques). Many NLP tools work best on English ([TSPA](https://www.tspa.org/curriculum/ts-fundamentals/automated-systems-and-ai/challenges/)), so test decoded and obfuscated text, every language you serve ([multilingual models](#multilingual-models)) and every user group ([fairness metrics](#fairness-bias)).

## In practice
A moderation blueprint in the format of [reference architectures](#reference-architectures):
- **Request path:** rules, a fast classifier, a reasoner for the gray zone, a router, human review, appeals and audits.
- **Defining component:** the router and its per-harm thresholds.
- **Main risk:** silent drift after the guard, the policy or the traffic changes.
- **Eval plan:** labeled samples of your traffic per harm and language, plus attacks from [red teaming](#red-teaming); precision and recall per harm; reviewer consistency; appeal overturns.
- **Cost sketch:** the calculator above, plus reasoner calls on the gray zone only.

```viz
{"id":"guard-models-moderation-pipeline","component":"stepper","title":"Cheap checks see everything, expensive judgment sees only what stays uncertain","caption":"Illustrative pipeline. Each stage is cheaper per item than the next and sees fewer items. The appeal and audit stages measure the errors the others make.","alt":"Stepper through a moderation pipeline: rules and hashes, a fast classifier, a policy reasoner for the gray zone, a router by severity and confidence, a human review queue, appeals, and audits.","data":"illustrative","try":"Step to Audit and name the error that appeals can never reveal.","diagram":{"w":620,"h":58,"nodes":[{"id":"rules","label":"Rules,\nhashes","role":"tool","align":"center","glyph":false,"x":0,"y":0,"w":80,"h":56},{"id":"fast","label":"Fast\nclassifier","role":"model","align":"center","glyph":false,"x":90,"y":0,"w":80,"h":56},{"id":"reason","label":"Policy\nreasoner","role":"model","align":"center","glyph":false,"x":180,"y":0,"w":80,"h":56},{"id":"route","label":"Router","role":"agent","align":"center","glyph":false,"x":270,"y":0,"w":80,"h":56},{"id":"queue","label":"Review\nqueue","role":"human","align":"center","glyph":false,"x":360,"y":0,"w":80,"h":56},{"id":"appeal","label":"Appeals","role":"human","align":"center","glyph":false,"x":450,"y":0,"w":80,"h":56},{"id":"audit","label":"Audit","role":"data","align":"center","glyph":false,"x":540,"y":0,"w":80,"h":56}],"edges":[{"from":"rules","to":"fast"},{"from":"fast","to":"reason"},{"from":"reason","to":"route"},{"from":"route","to":"queue"},{"from":"queue","to":"appeal"},{"from":"appeal","to":"audit"}]},
"frames":[
{"label":"Known content","highlight":["rules"],"caption":"A hash match against known violating images, or an exact block-list hit, acts at once. Fast and precise, but blind to anything new."},
{"label":"Screen everything","highlight":["fast"],"caption":"Every other item gets one call to a small classifier that scores each harm. Most items score low on every harm and pass."},
{"label":"Gray zone","highlight":["reason"],"caption":"Items scoring between the review and action thresholds go to a policy-following reasoner, which reads the written policy and returns a decision with a short rationale."},
{"label":"Route","highlight":["route"],"caption":"The router combines severity and confidence. Confident and severe: act at once and escalate. Confident and mild: label or limit automatically. Still uncertain: send to people, most severe first."},
{"label":"Human review","highlight":["queue"],"caption":"Reviewers follow internal enforcement guidelines, often with decision trees. Their tools can blur graphic images, and a regular sample of decisions is reviewed again to measure quality."},
{"label":"Appeal","highlight":["appeal"],"caption":"The user gets a statement of reasons and can appeal. A person decides the appeal, and overturned decisions, once checked, become labeled false positives in the eval set."},
{"label":"Audit","highlight":["audit"],"caption":"Random samples estimate prevalence and find false negatives that nobody reported or appealed. The same numbers drive threshold reviews and the transparency report."}]}
```

Routing on a provider endpoint’s scores, failing closed:

```python
import logging
import os

import openai
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
MODEL = "<moderation-model-id>"

# Illustrative values: set yours from your own labeled data.
# category: (send to review at, act automatically at, automatic action)
POLICY = {
    "sexual/minors":    (0.01, 0.30, "block_and_escalate"),
    "self-harm/intent": (0.20, 0.80, "show_support_resources"),
    "harassment":       (0.50, 0.95, "block"),
}

def route(text: str) -> tuple[str, list[str]]:
    try:
        result = client.moderations.create(model=MODEL, input=text).results[0]
    except openai.APIError:
        logging.exception("moderation call failed")
        return "human_review", ["guard_unavailable"]       # fail closed
    scores = result.category_scores.model_dump(by_alias=True)
    for category, (_, act_at, action) in POLICY.items():   # most severe first
        if scores[category] >= act_at:
            return action, [category]
    review = [c for c, (review_at, _, _) in POLICY.items() if scores[c] >= review_at]
    return ("human_review", review) if review else ("allow", [])
```

Frameworks such as [NeMo Guardrails](https://docs.nvidia.com/nemo/guardrails/about-nemo-guardrails-library/rail-types) and [Guardrails AI](https://github.com/guardrails-ai/guardrails) orchestrate guards as rails or validators; they do not replace them.

**Quality over time.** Prevalence is normally estimated from a random sample of all content ([TSPA metrics](https://www.tspa.org/curriculum/ts-fundamentals/content-moderation-and-operations/metrics-for-content-moderation/)). TSPA’s [quality assurance](https://www.tspa.org/curriculum/ts-fundamentals/content-moderation-and-operations/content-moderation-quality-assurance/) guide adds two checks: re-review a regular sample of decisions, and send pre-reviewed cases through the normal queue to test reviewers (reverse quality sampling); see [label quality](#label-quality). Appeals show false positives cheaply, but appealed cases are not representative, and a miss that nobody reported never reaches an appeal. Pin versions: Perspective API results shifted when its model was silently retrained (Hartmann et al., [2026](https://arxiv.org/abs/2604.25580)), and as of November 2026 the service is set to end on 31 December 2026 ([perspectiveapi.com](https://perspectiveapi.com/)), so toxicity baselines built on it need replacing.

**Legal duties (information, not legal advice, as of November 2026).** For services in its scope, the EU [Digital Services Act](https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng) asks for transparency reports on automated moderation with accuracy indicators (Article 15(1)(e)), statements of reasons that disclose automated means (Article 17(3)(c)), and complaint decisions not taken solely by automated means (Article 20(6)). Harmonized report templates apply from 1 July 2025 ([European Commission](https://digital-strategy.ec.europa.eu/en/news/harmonised-transparency-reporting-rules-under-digital-services-act-now-effect)). See [governance and regulation](#governance-regulation).

## Numbers to know
> [!number]
> Reported by each paper’s authors, as of November 2026, plus one rule of thumb:
> - Prompt Guard 2: 92.4 ms (86M) or 19.3 ms (22M) per 512-token check on an A100 ([Chennabasappa et al., 2025](https://arxiv.org/abs/2505.03574)).
> - Constitutional classifiers: 0.38 percentage points more refusals on production traffic, 23.7% inference overhead ([Sharma et al., 2025](https://arxiv.org/abs/2501.18837)). Their successor: a 0.05% refusal rate on production traffic, at 40 times less compute than its baseline exchange classifier ([Cunningham et al., 2026](https://arxiv.org/abs/2601.04603)).
> - Rule of thumb, from the formula: at 0.2% prevalence, 90% recall and a 1% false-positive rate, about 85% of flags are wrong.

## Pitfalls and anti-patterns
> [!pitfall] Trusting the model card’s scores
> Public benchmark prompts may sit in the training data, many NLP tools work best on English, and published results often come from static attacks rather than adaptive ones (Nasr et al., 2025). Pick thresholds from a labeled sample of your own traffic, and redo it whenever the guard, the policy or your users change.

- **One threshold for all harms.** Rare, severe harms need lower cutoffs and different actions.
- **Checking each message in isolation.** A request split into fragments, or a reply in code words, can look harmless alone (Cunningham et al., 2026).
- **Failing open silently.** Decide what a guard timeout means, and log it.

## Talk like an expert
The vocabulary: **guard model**, **policy as prompt**, **operating point**, **gray zone**, **exchange classifier**, **reverse quality sampling**, **overturn rate**. Experts quote precision and recall per harm, at a threshold, on their own data. The live debates: trained classifiers versus policy reasoners, and safety in the model versus around it.

> [!hottake] Guard models are moderation tools, not security boundaries.
> Adaptive attacks bypassed 12 recent defenses, detector models among them, most with over 90% success (Nasr et al., 2025). **The counterargument:** in over 3,000 estimated hours of red teaming, no one found a universal jailbreak that made an early classifier-guarded model answer most target questions as fully as an unguarded one (Sharma et al., 2025). Raising attacker cost that much is defense.

## Check yourself
```quiz
guard-models-moderation
```

## Go deeper
- Inan et al., [“Llama Guard: LLM-based Input-Output Safeguard for Human-AI Conversations”](https://arxiv.org/abs/2312.06674) (2023).
- Sharma et al., [“Constitutional Classifiers: Defending against Universal Jailbreaks across Thousands of Hours of Red Teaming”](https://arxiv.org/abs/2501.18837) (2025).
- Trust & Safety Professional Association, [Trust & Safety Fundamentals](https://www.tspa.org/curriculum/ts-fundamentals/).

## Related
- [Secure agent design](#secure-agent-design)
- [Guardrails and control](#guardrails-control)
- [Jailbreaks and misuse](#jailbreaks-misuse)
- [Jailbreak attacks and defenses in depth](#jailbreak-techniques)
- [Reference architectures](#reference-architectures)
- [Fairness metrics and bias measurement](#fairness-bias)
- [Playbook: Roblox's voice safety classifier: moderating live voice chat in 30 languages](#roblox-voice-safety-classifier)
