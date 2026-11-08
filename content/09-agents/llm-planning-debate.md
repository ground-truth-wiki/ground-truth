---
id: llm-planning-debate
book: 9
order: "9.5.1"
title: "Can LLMs plan? Classical planners, search and verifiers"
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [planning, pddl, mcts, verifiers, llm-modulo]
visuals: []
prerequisites: [planning-reasoning]
---
> [!tldr]
> In automated planning, a plan is a sequence of actions that provably reaches a goal under a formal model of the domain; the to-do lists agents write are something looser. Benchmarks built from planning-competition domains found LLMs weak and reasoning models much stronger but without guarantees, and the field is split between “LLMs can't plan, so pair them with verifiers” and newer evidence that frontier models rival classical planners. Whatever generates the plan, a sound external check is what makes it trustworthy.

## Key ideas

- **Planning in the formal sense, and translate-then-solve.** A classical planning task pairs a domain (actions with preconditions and effects) with a problem (objects, initial state, goal), both written in PDDL; a planner searches for a plan and a validator such as VAL checks it. LLM+P has the LLM translate a natural-language problem into problem PDDL, hands it to a classical planner and translates the plan back, but it assumes a human expert supplies the domain PDDL and an example problem file ([Liu et al., “LLM+P” (2023)](https://arxiv.org/abs/2304.11477); [Kambhampati et al., “LLMs Can't Plan, But Can Help Planning in LLM-Modulo Frameworks” (2024)](https://arxiv.org/abs/2402.01817)).
- **What PlanBench found.** PlanBench builds tasks from the kinds of domains used in the International Planning Competition and tests them both plainly and with obfuscated names, to separate planning from recalling familiar text. In a 2024 evaluation on 600 Blocksworld problems, the best standard LLM solved 62.6% and none reached 5% on the obfuscated Mystery Blocksworld; OpenAI's o1-preview reached 97.8% and 52.8%, but fell to 23.63% on problems needing 20 to 40 steps, returned an impossible plan for 54% of unsolvable problems, and gave no correctness guarantees, while the classical planner Fast Downward solved every instance in a fraction of the time and cost ([Valmeekam et al., “PlanBench” (2022)](https://arxiv.org/abs/2206.10498); [Valmeekam, Stechly and Kambhampati, “LLMs Still Can't Plan; Can LRMs?” (2024)](https://arxiv.org/abs/2409.13373)).
- **The LLM-Modulo position.** This ICML 2024 position paper argues that autoregressive LLMs cannot plan or verify plans by themselves, but are useful as approximate knowledge sources inside a generate-test-critique loop: the LLM proposes candidates, hard critics (model-based verifiers) and soft critics (style and preferences) critique them, and a controller feeds the critiques back. The loop is only as sound as its hard critics, and LLMs can also help draft the domain models those critics use, with humans checking them ([Kambhampati et al. (2024)](https://arxiv.org/abs/2402.01817)).
- **Grounded critique beats self-critique.** Huang et al. found that LLMs struggle to correct their own reasoning without external feedback and sometimes get worse, and Stechly et al. saw GPT-4's performance collapse with self-critique but rise with a sound external verifier on Game of 24, graph coloring and STRIPS planning. CRITIC gets its gains by checking outputs with tools, such as Google search for facts and a Python interpreter for programs ([Huang et al., “Large Language Models Cannot Self-Correct Reasoning Yet” (2023)](https://arxiv.org/abs/2310.01798); [Stechly et al., “On the Self-Verification Limitations of Large Language Models on Reasoning and Planning Tasks” (2024)](https://arxiv.org/abs/2402.08115); [Gou et al., “CRITIC” (2023)](https://arxiv.org/abs/2305.11738)).
- **The strongest counterevidence.** Corrêa, Pereira and Seipp gave frontier models freshly created tasks based on the latest International Planning Competition, checked every solution with a validator, and report that Gemini 3.1 Pro solved 245 of 360 tasks against 234 for the strongest classical planner, stayed competitive with the strongest planners when all semantic information was obfuscated, although its performance dropped, and that GPT-5 performed comparably to the planners (paper revised May 2026). They conclude that frontier models “might finally be able to plan”, while the LLM-Modulo point that such results come without guarantees still applies (as of November 2026) ([Corrêa et al., “Frontier Large Language Models Rival State-of-the-Art Planners” (2025)](https://arxiv.org/abs/2511.09378)).
- **Search and decomposition need a signal.** RAP uses the LLM as both world model and agent and searches reasoning paths with Monte Carlo tree search guided by task-specific rewards, and LATS adds LM-powered value functions, self-reflection and environment feedback; the search can only be as good as the value or reward it ranks paths by. ADaPT decomposes a task only when the executor fails, recursively and with And and Or links between subtasks, while HuggingGPT has an LLM plan subtasks and dispatch them to specialist models ([Hao et al., “Reasoning with Language Model is Planning with World Model” (2023)](https://arxiv.org/abs/2305.14992); [Zhou et al., “Language Agent Tree Search” (2023)](https://arxiv.org/abs/2310.04406); [Prasad et al., “ADaPT” (2023)](https://arxiv.org/abs/2311.05772); [Shen et al., “HuggingGPT” (2023)](https://arxiv.org/abs/2303.17580)).

## Planned visuals

- **`compare`:** the same Blocksworld task as a PDDL domain and problem next to the informal step list an agent writes, with links showing where preconditions, effects and the goal test live, and what the informal plan leaves unchecked.
- **`diagram`:** the LLM-Modulo loop: the LLM generates a candidate, reformulators translate it for hard and soft critics, and a meta-controller pools critiques into the next prompt, with the hard critic marked as the source of soundness.
- **`chart`** (real data): PlanBench accuracy for the best standard LLM and o1-preview on Blocksworld, Mystery Blocksworld, Randomized Mystery Blocksworld and 20-to-40-step problems, from Valmeekam et al. (2024).

## Talk like an expert

Planning researchers separate **plan generation** from **plan verification**, ask whether a method is **sound** and **complete**, and test on **obfuscated domains** to tell planning from recall. The live split is between **LLM-Modulo** (the model proposes, a verifier decides) and evidence that frontier reasoning models now rival classical planners on competition tasks, so ask which side's evidence matches your domain and how much a wrong plan costs.

## Go deeper

- [Valmeekam et al., “PlanBench” (2022)](https://arxiv.org/abs/2206.10498): the benchmark and its planning tasks; NeurIPS 2023 Datasets and Benchmarks track.
- [Kambhampati et al., “Position: LLMs Can't Plan, But Can Help Planning in LLM-Modulo Frameworks” (2024)](https://proceedings.mlr.press/v235/kambhampati24a.html): the position paper, in the ICML 2024 proceedings.
- [Valmeekam, Stechly and Kambhampati, “LLMs Still Can't Plan; Can LRMs?” (2024)](https://arxiv.org/abs/2409.13373): o1 on PlanBench, with cost and unsolvable instances.
- [Corrêa, Pereira and Seipp, “Frontier Large Language Models Rival State-of-the-Art Planners” (2025)](https://arxiv.org/abs/2511.09378): the counterevidence from validated competition tasks.

## Related

- [Planning and reasoning strategies](#planning-reasoning)
- [Reasoning models and test-time compute](#reasoning-models)
- [Test-time scaling](#test-time-scaling)
- [Model-based RL, planning and Monte Carlo tree search](#planning-mcts)
- [Do language models reason? The evidence on both sides](#reasoning-debate)
- [Language agents: research lineage and the CoALA framework](#agent-research-lineage)
