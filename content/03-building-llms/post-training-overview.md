---
id: post-training-overview
book: 3
order: "3.12"
title: "Post-training: from base model to assistant"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [post-training, sft, rlhf, rlvr, training-recipes]
visuals:
  - post-training-overview-stages:stepper
  - post-training-overview-recipes:diagram
  - post-training-overview-data-engine:stepper
  - post-training-overview-map:tree
prerequisites: [pretraining-data, rl-primer]
---
> [!tldr]
> Post-training turns a base model, which only continues text, into an instruct or reasoning model. Recipes chain supervised fine-tuning, preference tuning and RL with verifiable rewards, plus distillation, fed by synthetic data and checked on held-out evaluations. Learn the canonical recipes and you can read any model report.

## Why it matters
Most of what users notice in a model is set after pretraining: answer format, tone, refusals, long reasoning, tool use. Nathan Lambert's [RLHF book](https://rlhfbook.com/c/01-introduction) says most gains users see come from post-training. This map helps you read a model card, pick a checkpoint to fine-tune, decide which stages you need, and tell a real gain from an evaluation artifact.

## Intuition
Pretraining is reading a whole library. Post-training is an apprenticeship: copy worked examples, hear a mentor say which of two drafts is better, practice on exams with an answer key, then learn from several specialist mentors at once. Lambert compares the base model to a Formula 1 chassis: the best teams gain more by tuning it during a season than from one chassis to the next.

```viz
{"id":"post-training-overview-stages","component":"stepper","title":"Each stage adds one behavior: format, then preferences, then checkable skills","caption":"Illustrative outputs for one model as it moves through a typical recipe. Real recipes change the order, skip stages or repeat them.","alt":"Stepper through five post-training stages, base model, SFT, preference tuning, RLVR and distillation, with an illustrative model output after each stage.","data":"illustrative","try":"Step from Base model to SFT, then to RLVR, and compare how the answers change.","diagram":{"w":600,"h":60,"nodes":[{"id":"base","label":"Base\nmodel","role":"model","align":"center","glyph":false,"x":0,"y":2,"w":100,"h":56,"link":"#pretraining-data"},{"id":"sft","label":"SFT","role":"data","align":"center","glyph":false,"x":125,"y":2,"w":100,"h":56,"link":"#sft"},{"id":"pref","label":"Preference\ntuning","role":"human","align":"center","glyph":false,"x":250,"y":2,"w":100,"h":56,"link":"#preference-optimization"},{"id":"rlvr","label":"RLVR","role":"tool","align":"center","glyph":false,"x":375,"y":2,"w":100,"h":56,"link":"#rlvr-reasoning"},{"id":"distill","label":"Distill","role":"model","align":"center","glyph":false,"x":500,"y":2,"w":100,"h":56,"link":"#distillation-merging"}],"edges":[{"from":"base","to":"sft"},{"from":"sft","to":"pref"},{"from":"pref","to":"rlvr"},{"from":"rlvr","to":"distill"}]},
"frames":[
{"label":"Base model","highlight":["base"],"caption":"Pretraining produced a document continuer. Given a question, it writes what often follows such a question on the web: more questions, page furniture, metadata.","code":"User:  What is the capital of France?\nModel: What is the capital of Germany? What is the\n       capital of Spain? | Quiz 3 of 12 | Geography"},
{"label":"SFT","highlight":["sft"],"caption":"Training on prompt and ideal response pairs teaches the format: answer the question, then stop. The result is an instruct model.","code":"User:  What is the capital of France?\nModel: The capital of France is Paris."},
{"label":"Preference tuning","highlight":["pref"],"caption":"Comparisons between two acceptable answers teach what people prefer: tone, length, when to refuse. Much of a model's style comes from here.","code":"Prompt:   Explain RoPE to a beginner.\nChosen:   a short analogy, then one formula\nRejected: correct, but a dense wall of math"},
{"label":"RLVR","highlight":["rlvr"],"caption":"On problems with checkable answers, only verified answers earn reward. The model learns to reason before it answers: a reasoning model.","code":"User:  What is 17 × 24?\nModel: <think>17 × 20 = 340, 17 × 4 = 68,\n       340 + 68 = 408</think>\n       The answer is 408.        reward = 1 (verified)"},
{"label":"Distill","highlight":["distill"],"caption":"A strong model's outputs or token probabilities train another model: a smaller one, or one student that absorbs several specialist teachers.","code":"offline:   teacher writes answers -> filter -> student SFT\non-policy: student writes answers -> teacher scores each token"}]}
```

## How it works
**Three kinds of model.** A *base model* continues documents. An *instruct model* follows instructions and answers directly. A *reasoning* (or thinking) *model* writes a reasoning trace before its answer. [Olmo 3](https://arxiv.org/abs/2512.13961) (Team Olmo, 2025) releases all three from one base, plus RL-Zero, trained with RL straight from the base. See [model types](#model-types) and [reasoning models](#reasoning-models).

**Four optimization families.** Lambert defines post-training as a many-stage process built from three methods:
- [Supervised fine-tuning](#sft) (SFT, or instruction tuning) trains on prompt and response pairs: format and instruction following.
- [Preference fine-tuning](#preference-optimization) (RLHF, DPO and relatives) learns from comparisons between answers.
- [RL with verifiable rewards](#rlvr-reasoning) (RLVR) rewards answers a program can check, such as math results or passing tests.

[Distillation](#distillation-merging) is the fourth: a student trains on a teacher's outputs or token probabilities.

**Canonical recipes.** Switch between five published ones:

```viz
{"id":"post-training-overview-recipes","component":"diagram","title":"All five recipes open with SFT and differ in what comes after","caption":"Stages and data sizes as reported in each paper, top to bottom. Click a stage for its chapter.","alt":"Five post-training recipes as stacked stages: InstructGPT (SFT, reward model, PPO), Tülu 3 (SFT, DPO, RLVR), DeepSeek-R1 (cold-start SFT, reasoning RL, rejection sampling and SFT, RL for all scenarios), Olmo 3 Think (SFT, DPO with delta learning, RLVR) and multi-teacher on-policy distillation (SFT, RL-trained specialist teachers, on-policy distillation into one student).","data":"real","source":"Ouyang et al. 2022; Lambert et al. 2024; DeepSeek-AI 2025; Team Olmo 2025; Xiaomi LLM-Core Team 2026","asof":"2026-11","depicts":"Published post-training recipes, 2022 to 2026","try":"Compare Tülu 3 with InstructGPT: which stage was replaced, and which was added?","w":560,"layer_h":46,"variants":[
{"name":"InstructGPT","note":"Ouyang et al. (2022). Raters preferred the 1.3B InstructGPT to the 175B GPT-3, a model with about 100 times more parameters.","layers":[{"id":"base","label":"GPT-3 base model","role":"model"},{"id":"s1","label":"1. SFT on demonstrations","sub":"labelers write ideal answers: about 13k prompts","role":"data","link":"#sft"},{"id":"s2","label":"2. Reward model","sub":"labelers rank sampled outputs: 33k prompts","role":"tool","link":"#preference-optimization"},{"id":"s3","label":"3. RL with PPO against the reward model","sub":"31k prompts, with a KL penalty to the SFT model","role":"agent","link":"#rl-primer"},{"id":"out","label":"InstructGPT","sub":"an instruct model","role":"model"}]},
{"name":"Tülu 3","note":"Lambert et al. (2024); sizes for the 8B model. DPO on pairs sampled partly from the SFT model replaces the reward model and PPO; RL returns at the end, with programs as rewards. Data, code and evaluations are all open.","layers":[{"id":"base","label":"Llama 3.1 base model","role":"model"},{"id":"s1","label":"1. SFT","sub":"about 939k prompts, public and synthetic, decontaminated","role":"data","link":"#sft"},{"id":"s2","label":"2. DPO","sub":"about 271k pairs, partly sampled from the SFT model, rated by GPT-4o","role":"data","link":"#preference-optimization"},{"id":"s3","label":"3. RLVR with PPO","sub":"about 30k prompts: math and precise instruction following","role":"agent","link":"#rlvr-reasoning"},{"id":"out","label":"Tülu 3","sub":"an instruct model","role":"model"}]},
{"name":"DeepSeek-R1","note":"DeepSeek-AI (2025). Stage 2 adds a language-consistency reward so the reasoning stays readable. Stage 3 fine-tunes DeepSeek-V3-Base again, on data mostly written by the stage 2 model.","layers":[{"id":"base","label":"DeepSeek-V3-Base","role":"model"},{"id":"s1","label":"1. Cold-start SFT","sub":"thousands of long chain-of-thought examples","role":"data","link":"#sft"},{"id":"s2","label":"2. Reasoning RL with GRPO","sub":"rule-based rewards on math, code, science and logic","role":"agent","link":"#rlvr-reasoning"},{"id":"s3","label":"3. Rejection sampling, then SFT from the base","sub":"about 600k reasoning and 200k general samples","role":"data","link":"#synthetic-data"},{"id":"s4","label":"4. RL for all scenarios","sub":"rules for reasoning, reward models for helpfulness and safety","role":"agent","link":"#preference-optimization"},{"id":"out","label":"DeepSeek-R1, a reasoning model","sub":"its 800k samples also trained six smaller students","role":"model","link":"#distillation-merging"}]},
{"name":"Olmo 3 Think","note":"Team Olmo (2025). Every stage, checkpoint and dataset is released. Olmo 3.1 Think 32B continued the best RL run for another 21 days on 224 GPUs.","layers":[{"id":"base","label":"Olmo 3 base model","sub":"mid-training already targets post-training","role":"model","link":"#mid-training"},{"id":"s1","label":"1. Think SFT","sub":"synthetic examples with long thinking traces","role":"data","link":"#sft"},{"id":"s2","label":"2. DPO with delta learning","sub":"pairs with a large quality gap between chosen and rejected","role":"data","link":"#preference-optimization"},{"id":"s3","label":"3. RLVR with OlmoRL","sub":"math, code, instruction following and general chat","role":"agent","link":"#rlvr-reasoning"},{"id":"out","label":"Olmo 3 Think","sub":"a reasoning model","role":"model"}]},
{"name":"Multi-teacher distillation","note":"MiMo-V2-Flash Technical Report (January 2026). The student did not always reach its best teacher: on BrowseComp it stayed below it.","layers":[{"id":"base","label":"Base model","role":"model"},{"id":"s1","label":"1. SFT","sub":"instruction following across domains","role":"data","link":"#sft"},{"id":"s2","label":"2. Specialist teachers, each trained with RL","sub":"search, coding, tool use, math, reasoning, safety","role":"agent","link":"#rlvr-reasoning"},{"id":"s3","label":"3. Multi-teacher on-policy distillation","sub":"the student samples; the domain's teacher scores each token","role":"model","link":"#distillation-merging"},{"id":"out","label":"One student model","sub":"aims to keep each teacher's best skill","role":"model"}]}]}
```

[InstructGPT](https://arxiv.org/abs/2203.02155) (Ouyang et al., 2022) set the template. [Tülu 3](https://arxiv.org/abs/2411.15124) (Lambert et al., 2024) swapped its reward model and PPO for DPO on pairs sampled partly from its own SFT model (on-policy), then added RLVR. [DeepSeek-R1](https://arxiv.org/abs/2501.12948) (DeepSeek-AI, 2025) built a reasoning model in four stages, and Olmo 3 Think opened every stage of its recipe.

As of November 2026, the newest pattern trains specialist teachers with RL, then merges them with *multi-teacher on-policy distillation* (MOPD): the student samples its own answers, and each domain's teacher scores every token through a KL divergence. The [MiMo-V2-Flash report](https://arxiv.org/abs/2601.02780) (Xiaomi LLM-Core Team, January 2026) introduced it against the “see-saw” effect, where improving one skill regresses another. [GLM-5](https://arxiv.org/abs/2602.15763) (GLM-5 Team, February 2026) ends by distilling from its own earlier stage checkpoints, and [Nemotron 3 Ultra](https://arxiv.org/abs/2606.15007) (NVIDIA, June 2026) runs SFT, RLVR, then MOPD. Lambert's [training overview](https://rlhfbook.com/c/03-training-overview) notes that labs are far from unanimous in using MOPD.

**The data engine.** Much post-training data is now written by models: Tülu 3 had GPT-4o answer persona-based synthetic prompts, and Olmo 3 Think trains on synthetic reasoning traces. *Rejection sampling* turns a model into its own data source; see [synthetic data](#synthetic-data).

```viz
{"id":"post-training-overview-data-engine","component":"stepper","title":"Rejection sampling turns the current model into the author of its next training set","caption":"Illustrative loop with four candidates for one prompt. The scorer can be a verifier, a reward model or an LLM judge.","alt":"Stepper of a rejection-sampling loop: prompts go to the current model, which writes several candidates; a scorer rates them; the best are kept as training data for the next model.","data":"illustrative","try":"Pause on Score and ask what the loop would learn if the scorer rewarded length instead of correctness.","diagram":{"w":600,"h":104,"nodes":[{"id":"prompts","label":"Prompts","role":"data","x":0,"y":0,"w":100,"h":56},{"id":"model","label":"Current\nmodel","role":"model","x":166,"y":0,"w":100,"h":56},{"id":"score","label":"Scorer","role":"tool","x":333,"y":0,"w":100,"h":56},{"id":"keep","label":"Kept\ndata","role":"data","x":500,"y":0,"w":100,"h":56}],"edges":[{"from":"prompts","to":"model"},{"from":"model","to":"score","label":"sample"},{"from":"score","to":"keep","label":"filter"},{"from":"keep","to":"model","curve":-90,"label":"train the next model","style":"dashed"}]},
"frames":[
{"label":"Prompts","highlight":["prompts"],"caption":"Collect prompts for the skill you want, and drop any that overlap your evaluation sets."},
{"label":"Sample","highlight":["model"],"caption":"The best current model writes several candidate answers per prompt, at a temperature above zero so they differ.","code":"prompt 17: 4 candidates"},
{"label":"Score","highlight":["score"],"caption":"A verifier checks what code can check; a reward model or LLM judge scores the rest.","code":"scores = [0.2, 0.9, 0.4, 0.7]"},
{"label":"Filter","highlight":["keep"],"caption":"The best candidate becomes an SFT target. The best and the worst can form a preference pair.","code":"SFT target:      candidate 2 (0.9)\npreference pair: chosen 2, rejected 1"},
{"label":"Train and repeat","highlight":["keep","model"],"edges":["keep>model"],"caption":"The next model trains on the kept data and samples the next round. DeepSeek-R1 built about 600k reasoning samples this way; Tülu 3 found the gains too small for the compute in its setup."}]}
```

**Evaluation.** A recipe is tuned on a *development suite* and judged on an *unseen suite* nobody tuned toward. Every model Tülu 3 tested scored far lower on IFEval-OOD (new constraints) than on IFEval: overfitting to the constraints people tune on. Olmo 3 develops on IFEval, holds out IFBench, and removes training data that matches at least half of an evaluation item's 8-grams (decontamination). See [benchmark literacy](#benchmark-literacy) and [eval datasets](#eval-datasets).

## In practice
Decision rules:
- **Narrow format or style:** SFT alone often suffices; see [fine-tuning in practice](#fine-tuning-practice).
- **Comparisons from users or judges:** add DPO on pairs sampled from your own model (Tülu 3 found on-policy pairs help).
- **Checkable outputs:** add RLVR, and attack your verifier first.
- **A small, fast model:** distill from a strong one before trying RL on it.
- **Every stage:** keep a development and an unseen suite, and decontaminate all training data.

The three classic stages in Hugging Face TRL, with placeholder ids (checked with TRL 1.17.1 on a tiny model, November 2026); in a real run each stage is its own `accelerate launch` script.

```python
import re
from datasets import load_dataset
from trl import DPOConfig, DPOTrainer, GRPOConfig, GRPOTrainer, SFTConfig, SFTTrainer

# 1. SFT on conversations (a "messages" column)
sft = SFTTrainer(model="<base-model-id>", args=SFTConfig(output_dir="ckpt/sft"),
                 train_dataset=load_dataset("<sft-dataset>", split="train"))
sft.train()
sft.save_model()

# 2. DPO on "prompt", "chosen", "rejected", ideally sampled from the SFT model
dpo = DPOTrainer(model="ckpt/sft", args=DPOConfig(output_dir="ckpt/dpo", beta=0.1),
                 train_dataset=load_dataset("<preference-dataset>", split="train"))
dpo.train()
dpo.save_model()

# 3. RLVR with GRPO: conversational prompts plus an "answer" column; the reward is a program
def boxed_answer_matches(completions, answer, **kwargs):
    found = [re.search(r"\\boxed\{(.*?)\}", c[0]["content"]) for c in completions]
    return [1.0 if m and m.group(1).strip() == a else 0.0 for m, a in zip(found, answer)]

grpo = GRPOTrainer(model="ckpt/dpo", reward_funcs=boxed_answer_matches,
                   args=GRPOConfig(output_dir="ckpt/rlvr"),
                   train_dataset=load_dataset("<verifiable-prompts>", split="train"))
grpo.train()
```

```viz
{"id":"post-training-overview-map","component":"tree","title":"Stop at this overview, or open the stage you need","caption":"Expand a stage for its chapter and the deeper chapters beneath it.","alt":"Tree of post-training chapters: supervised fine-tuning, preference tuning, RL with verifiable rewards, distillation, safety and character, and data and evaluation, each with its deep-dive chapters.","data":"illustrative","open":1,"root":{"label":"Post-training chapters","children":[
{"label":"Supervised fine-tuning","note":"format and instruction following","link":"#sft","children":[{"label":"Synthetic data recipes","link":"#synthetic-data-recipes"},{"label":"Chat templates and message roles","link":"#chat-templates"},{"label":"Training for tool use","link":"#function-calling-training"}]},
{"label":"Preference optimization","note":"which answer is better","link":"#preference-optimization","children":[{"label":"Reward models and preference data","link":"#reward-modeling"},{"label":"DPO and its relatives","link":"#dpo-and-relatives"}]},
{"label":"RL with verifiable rewards","note":"checkable skills and reasoning","link":"#rlvr-reasoning","children":[{"label":"Policy-gradient algorithms for LLMs","link":"#llm-policy-gradients"},{"label":"Training reasoning models","link":"#reasoning-training-recipes"},{"label":"Agentic RL and environments","link":"#agentic-rl"}]},
{"label":"Distillation and merging","note":"one student from many teachers","link":"#distillation-merging","children":[{"label":"Distillation for LLMs","link":"#llm-distillation"},{"label":"Model merging methods","link":"#model-merging-methods"}]},
{"label":"Safety and character","note":"trained at every stage","link":"#safety-character-training","children":[{"label":"Model specs and the instruction hierarchy","link":"#model-specs-instruction-hierarchy"},{"label":"How fine-tuning changes safety","link":"#fine-tuning-and-safety"}]},
{"label":"Data and evaluation","note":"what every stage depends on","children":[{"label":"Deduplication and decontamination","link":"#deduplication-decontamination"},{"label":"How benchmarks are built and why they break","link":"#benchmark-validity"},{"label":"Fine-tuning in practice","link":"#fine-tuning-practice"}]}]}}
```

## Numbers to know
> [!number]
> Reported sizes, as orders of magnitude, not targets. InstructGPT: about 13k SFT, 33k reward-model and 31k PPO prompts (Ouyang et al., 2022). Tülu 3 8B: about 939k SFT prompts, 271k preference pairs and 30k RLVR prompts (Lambert et al., 2024). DeepSeek-R1: about 800k SFT samples in its second SFT stage, 600k of them rejection-sampled reasoning traces (DeepSeek-AI, 2025). Training R1, R1-Zero included, took about 147k H800 GPU hours (Table 7 in the 2026 revision of the paper); [Lambert's book](https://rlhfbook.com/c/01-introduction) sets that against about 2.8M GPU hours for the DeepSeek-V3 base, roughly 5%. Rule of thumb from Olmo 3: evaluation took 10 to 20% of compute while the recipe was developed on 7B models.

## Pitfalls and anti-patterns
> [!pitfall] Tuning on the suite you report
> Hill-climbing a development suite inflates it, as the IFEval gap shows. Open an unseen suite only at the end, and report both.

- **The see-saw.** A stage that lifts one skill can drop another. Run the full suite after every stage; Olmo 3 found that mixing RL domains can prevent over-optimization.
- **Imitating weaker data.** More SFT on Qwen3 32B reasoning traces hurt Olmo 3; pairing those traces with worse answers for DPO (delta learning) helped.
- **Copying a frontier recipe at small scale.** On a 32B base, DeepSeek-R1 found distillation from R1 beat large-scale RL.
- **Leaky data.** Decontaminate every stage's data, not only SFT.

## Talk like an expert
The vocabulary: **SFT**, **preference fine-tuning**, **RLVR**, **on-policy data**, **rejection sampling**, **cold start**, **RL-Zero**, **delta learning**, **MOPD**, **see-saw effect**, **unseen suite**, **decontamination**. Experts describe a model by its recipe: which stages, in what order, on whose data.

The live debate is how much post-training adds. The *superficial alignment hypothesis* of [LIMA](https://arxiv.org/abs/2305.11206) (Zhou et al., 2023) holds that “a model’s knowledge and capabilities are learnt almost entirely during pretraining”, so alignment mostly teaches format. Lambert's *elicitation* view agrees the base sets the ceiling but says reaching it is real work: OLMoE's benchmark average rose from 35 to 48 when only its post-training was updated. He rejects the superficial hypothesis and expects even elicitation to hold only for lighter recipes, not for compute-heavy frontier ones. On RL, Yue et al., [“Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?”](https://arxiv.org/abs/2504.13837) (2025) found base models beat their RLVR versions on pass@k at large k; Olmo 3 reports DPO raising pass@k on AIME. See [the reasoning debate](#reasoning-debate) and [alignment concepts](#alignment-concepts).

> [!hottake] The classic three-stage pipeline is becoming a teaching example; frontier recipes now run SFT, specialist RL, then distillation.
> **The counterargument:** as of November 2026, labs are far from unanimous on MOPD, it needs a separate RL run for every teacher, and the fully open Olmo 3 Think still runs SFT, DPO and RLVR, finding DPO a better starting point for RL than SFT.

## Check yourself
```quiz
post-training-overview
```

## Go deeper
- Lambert, *Reinforcement Learning from Human Feedback*, chapters [1](https://rlhfbook.com/c/01-introduction) and [3](https://rlhfbook.com/c/03-training-overview).
- Ouyang et al., [“Training language models to follow instructions with human feedback”](https://arxiv.org/abs/2203.02155) (2022).
- Lambert et al., [“Tülu 3: Pushing Frontiers in Open Language Model Post-Training”](https://arxiv.org/abs/2411.15124) (2024).
- DeepSeek-AI, [“DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning”](https://arxiv.org/abs/2501.12948) (2025); Team Olmo, [“Olmo 3”](https://arxiv.org/abs/2512.13961) (2025); Xiaomi LLM-Core Team, [“MiMo-V2-Flash Technical Report”](https://arxiv.org/abs/2601.02780) (2026).

## Related
- [Supervised fine-tuning](#sft)
- [Preference optimization](#preference-optimization)
- [RL with verifiable rewards](#rlvr-reasoning)
- [Distillation, merging and compression](#distillation-merging)
- [Safety and character training](#safety-character-training)
- [Model types](#model-types)
