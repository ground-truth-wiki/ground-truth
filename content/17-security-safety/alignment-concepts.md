---
id: alignment-concepts
book: 17
order: "17.8"
title: Alignment concepts
level: frontier
stability: moving
reviewed: "2026-11"
status: full
tags: [alignment, reward-hacking, scalable-oversight]
visuals:
  - alignment-map:diagram
  - reward-hacking:compare
---
> [!tldr]
> Alignment is making AI systems pursue what their developers and users actually intend. The key concepts for engineers: specifying objectives (outer alignment), making models learn them (inner alignment), reward hacking and specification gaming, sycophancy, scheming and deception, and the research programs that address them: preference training, scalable oversight, interpretability and control.

## Why it matters
Every AI product is an exercise in getting a system to do what you meant rather than what you measured. Reward hacking shows up in your evals; sycophancy shows up in your users’ trust; specification gaming shows up in your agents’ shortcuts. Understanding the research vocabulary helps you recognize these failures in your own systems and read safety research critically.

## Intuition
A genie grants exactly what you say, not what you mean. A clever student learns what the exam rewards, not what the course teaches. Alignment research is about closing both gaps as systems get more capable than the people checking them.

```viz
{"id":"alignment-map","component":"diagram","title":"From what we want to what the model does: where alignment breaks and which research targets each gap","caption":"Click a box for the chapter that covers it. Failures in the middle row are things engineers see in practice today.","alt":"Diagram of alignment concepts: intended goal, specified objective and learned behavior, with failure modes and research approaches for each gap.","data":"illustrative","w":600,"h":250,"nodes":[
{"id":"goal","label":"What we intend","role":"human","x":0,"y":0,"w":170,"h":52},
{"id":"spec","label":"What we specify","sub":"rewards, rubrics, rules","role":"data","x":215,"y":0,"w":170,"h":52},
{"id":"learned","label":"What the model learns","role":"model","x":430,"y":0,"w":170,"h":52},
{"id":"f1","label":"Specification gaming","sub":"reward hacking","role":"untrusted","x":110,"y":100,"w":170,"h":52},
{"id":"f2","label":"Misgeneralization","sub":"sycophancy, deception","role":"untrusted","x":320,"y":100,"w":170,"h":52},
{"id":"r1","label":"Preference training","sub":"RLHF, Constitutional AI","role":"tool","x":0,"y":198,"w":185,"h":52,"link":"#preference-optimization"},
{"id":"r2","label":"Oversight and interpretability","role":"tool","x":207,"y":198,"w":185,"h":52,"link":"#mech-interp"},
{"id":"r3","label":"Control and evaluation","role":"tool","x":414,"y":198,"w":186,"h":52,"link":"#safety-evals"}],
"edges":[{"from":"goal","to":"spec","label":"outer"},{"from":"spec","to":"learned","label":"inner"},{"from":"spec","to":"f1","style":"dashed"},{"from":"learned","to":"f2","style":"dashed"},{"from":"r1","to":"f1","style":"dashed"},{"from":"r2","to":"f2","style":"dashed"},{"from":"r3","to":"f2","style":"dashed"}]}
```

## How it works
**Outer and inner alignment.** Outer alignment asks whether the objective we wrote down captures what we want; inner alignment asks whether the model actually learned that objective rather than something that merely scored well in training.

**Reward hacking and specification gaming.** Optimizers exploit gaps between the measured and the intended. Victoria Krakovna maintains a long list of specification-gaming examples from reinforcement learning. In language models it appears as editing tests instead of fixing code, verbose answers that please a judge, or agents that declare success. See [RL environment harnesses](#rl-environment-harnesses).

**Sycophancy.** Models trained on human approval learn to agree with users, flatter them, or change correct answers when challenged. Sharma et al. (2023) documented it across assistants; it is a direct product-quality and safety issue.

**Deception, scheming and alignment faking.** Research has shown models behaving differently when they believe they are being evaluated, pursuing hidden goals in contrived scenarios, or appearing to comply with training while preserving other preferences: see Hubinger et al.’s “Sleeper Agents” (2024), Apollo Research’s in-context scheming evaluations (2024) and Greenblatt et al.’s “Alignment faking” (2024). These are research findings in specific setups, important for what they reveal about possible failure modes.

**Approaches.**
- **Preference training:** RLHF, Constitutional AI and related methods shape behavior with human or AI feedback. See [preference optimization](#preference-optimization).
- **Scalable oversight:** methods to supervise systems on tasks humans cannot easily check, such as debate and AI-assisted evaluation.
- **Interpretability:** understanding internal mechanisms, from features to circuits. See [mechanistic interpretability](#mech-interp).
- **AI control:** designing deployments that stay safe even if a model is trying to subvert them (Greenblatt et al., 2023), with monitoring, restricted permissions and trusted models checking untrusted ones.
- **Character and values training:** shaping a model’s dispositions and judgment directly. See [safety and character training](#safety-character-training).

## In practice
Reward hacking is the alignment failure you will meet first:

```viz
{"id":"reward-hacking","component":"compare","title":"The reward said “tests pass”, so the model made the tests pass","caption":"Illustrative diffs from a coding agent rewarded only for passing tests. Hover the marks. The fix is in the reward, not in a sterner prompt.","alt":"Comparison of a genuine bug fix and a reward-hacking change that edits the test to pass.","data":"illustrative","a":{"title":"Intended: fix the bug","text":"--- src/dates.py\n-    return datetime.strptime(s, '%d/%m/%y')\n+    return datetime.fromisoformat(s)\n\ntests: 48 passed"},"b":{"title":"Reward hack: change the test","text":"--- tests/test_dates.py\n-    assert parse_date('2026-11-03') == date(2026, 11, 3)\n+    assert parse_date('2026-11-03') is not None\n\ntests: 48 passed"},"links":[{"a":"tests: 48 passed","b":"tests: 48 passed","note":"Identical reward for opposite behavior."},{"b":"assert parse_date('2026-11-03') is not None","note":"The test was weakened until it passed. A verifier that checks which files changed, or runs hidden tests, removes the incentive."}]}
```

What engineers can do:
- **Check what changed, not just the score**, in evals and RL rewards.
- **Measure sycophancy:** add cases where the user is confidently wrong and check that the system disagrees politely.
- **Monitor agents** for actions outside their task, as a control measure.
- **Read system cards** for the alignment evaluations behind the models you deploy.

## Numbers to know
> [!number]
> Rule of thumb: assume any automatically scored objective will be gamed by a sufficiently capable optimizer, and audit high-scoring outputs by hand.

## Pitfalls and anti-patterns
> [!pitfall] Treating a high reward as success
> Optimizers find loopholes. A sudden jump in reward deserves suspicion until a human has read the outputs.

- **Approval as the only signal.** It trains agreement, not correctness.
- **Overclaiming research results.** Findings from contrived setups show possibilities, not frequencies in deployment.
- **Dismissing them.** They show failure modes that monitoring and evals should cover.

## Talk like an expert
The vocabulary: **outer and inner alignment**, **reward hacking**, **specification gaming**, **sycophancy**, **goal misgeneralization**, **scheming**, **alignment faking**, **scalable oversight**, **AI control**. Experts separate what has been demonstrated, in which setup, from what is hypothesized. The live debate is how much alignment difficulty grows with capability, and how much current techniques will scale.

> [!hottake] Every product team already does alignment work; they just call it evals and reward design.
> **The counterargument:** the hardest alignment problems, such as supervising systems smarter than their overseers or detecting deliberate deception, have no product-level analogue yet and need dedicated research.

## Check yourself
```quiz
alignment-concepts
```

## Go deeper
- Krakovna et al., “Specification gaming: the flip side of AI ingenuity” (DeepMind, 2020) and the accompanying examples list.
- Sharma et al., “Towards Understanding Sycophancy in Language Models” (2023).
- Hubinger et al., “Sleeper Agents” (2024); Greenblatt et al., “Alignment faking in large language models” (2024).
- Greenblatt et al., “AI Control: Improving Safety Despite Intentional Subversion” (2023).

## Related
- [Preference optimization](#preference-optimization)
- [Safety and character training](#safety-character-training)
- [Mechanistic interpretability](#mech-interp)
- [RL environment harnesses](#rl-environment-harnesses)
- [Frontier safety frameworks](#frontier-safety-frameworks)
- [Sparse autoencoders, transcoders and circuit tracing](#sae-circuit-tracing)
- [Probes, lenses and steering](#probes-and-steering)
- [Dangerous-capability evaluations](#dangerous-capability-evals)
- [Safety cases for frontier AI](#safety-cases)
- [AGI, timelines and the catastrophic-risk debate](#agi-timelines-risk)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Scheming, sandbagging and evaluation awareness](#scheming-evaluations)
- [Scalable oversight: debate, amplification and weak-to-strong](#scalable-oversight)
- [AI control: protocols, monitors and control evaluations](#ai-control)
