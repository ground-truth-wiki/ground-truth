---
id: adversarial-ml
book: 17
order: "17.12"
title: Adversarial machine learning
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [adversarial-ml, evasion, poisoning, membership-inference, robustness]
visuals:
  - adversarial-ml-lifecycle:diagram
  - adversarial-ml-linearity:calculator
  - adversarial-ml-pgd:stepper
  - adversarial-ml-llm-map:tree
prerequisites: [threat-modeling, neural-networks]
---
> [!tldr]
> Adversarial machine learning studies attacks on learning itself: inputs crafted to fool a model (evasion), training data crafted to corrupt it (poisoning), and queries crafted to leak its data or weights (privacy attacks). The few defenses that held up all cost accuracy or compute, and a defense counts only if it survives an attacker who knows it. Every class returns in LLM systems.

## Why it matters
Code does what its source says; a model does what its data and optimization made it do. An attacker can change its behavior without touching code, by nudging pixels, planting training examples or editing a page it will read, and its outputs leak traces of its data and weights. Knowing the attack classes tells you what belongs in a [threat model](#threat-modeling) and which defenses to trust.

## Intuition
A model is a student who learned from worked examples, not a rulebook. You can fool it with a trick question aimed at its shortcuts (evasion), slip forged pages into its textbook (poisoning), or quiz it until it recites the textbook (privacy). [NIST AI 100-2 E2025](https://csrc.nist.gov/pubs/ai/100/2/e2025/final) (March 2025, the latest final edition as of November 2026) classifies them by stage, goal, capability and knowledge.

```viz
{"id":"adversarial-ml-lifecycle","component":"diagram","title":"Poisoning strikes before training; evasion and privacy attacks strike the deployed model","caption":"The attack surface of one predictive model, using the stages and attack classes of NIST AI 100-2 E2025. Each box names the attacks that enter there. Click a box for the chapter that covers its defenses.","alt":"Diagram with two groups. Training stage: training data (data poisoning, backdoors), training code and suppliers (source code control, model poisoning) and federated clients (poisoned model updates), all feeding the deployed model. Deployment stage: inputs at test time (evasion, sponge examples) flow into the deployed model (query access, extraction), which produces predictions and scores (membership inference, inversion).","data":"illustrative","depicts":"NIST AI 100-2 E2025 (March 2025)","w":600,"h":280,"groups":[{"label":"Training stage","x":0,"y":0,"w":290,"h":280},{"label":"Deployment stage","x":310,"y":0,"w":290,"h":280}],"nodes":[
{"id":"data","label":"Training data","sub":"data poisoning, backdoors","role":"data","x":14,"y":34,"w":262,"h":56,"link":"#pretraining-data"},
{"id":"code","label":"Training code, suppliers","sub":"source code, model poisoning","role":"tool","x":14,"y":122,"w":262,"h":56,"link":"#supply-chain-security"},
{"id":"clients","label":"Federated clients","sub":"poisoned model updates","role":"external","x":14,"y":210,"w":262,"h":56},
{"id":"inputs","label":"Inputs at test time","sub":"evasion, sponge examples","role":"untrusted","x":324,"y":34,"w":262,"h":56,"link":"#jailbreaks-misuse"},
{"id":"model","label":"Deployed model","sub":"query access, extraction","role":"model","x":324,"y":122,"w":262,"h":56,"link":"#model-theft"},
{"id":"outputs","label":"Predictions and scores","sub":"membership, inversion","role":"plain","x":324,"y":210,"w":262,"h":56,"link":"#privacy"}],
"edges":[{"from":"data","to":"model","label":"train"},{"from":"code","to":"model"},{"from":"clients","to":"model"},{"from":"inputs","to":"model"},{"from":"model","to":"outputs"}]}
```

## How it works
**The taxonomy.** Beyond the stage, NIST sorts attacks on three axes:
- **Goal:** availability breakdown, integrity violation or privacy compromise; for generative AI, also misuse enablement (evading the owner's restrictions).
- **Capability:** control of training data, the model, test inputs or source code; query access; a label limit (clean-label attackers cannot choose labels); and for generative AI, resource control over documents the model reads at runtime.
- **Knowledge:** white-box (everything, defenses included), gray-box (say, the architecture but not the weights) or black-box (queries only).

**Evasion.** An adversarial example stays close to a real input, often within an L∞ budget (the largest change to any pixel), yet flips the prediction. [Goodfellow et al. (2014)](https://arxiv.org/abs/1412.6572) blamed linearity: tiny per-pixel changes add up across many dimensions.

```viz
{"id":"adversarial-ml-linearity","component":"calculator","title":"A per-pixel change too small to see adds up across every input dimension","caption":"Formula from Goodfellow et al. (2014): set the perturbation to ε times the sign of the weights, and a linear unit's activation moves by ε × m × n. The mean weight magnitude m = 0.01 is an illustrative default, not a measured value. At the same 8/255 budget, a 224 × 224 color image moves the unit 49 times further than a 32 × 32 one.","alt":"Calculator: from a per-pixel budget ε in 8-bit levels, the input size n and the mean weight magnitude m, it computes ε on a 0 to 1 scale, the worst-case activation change ε × m × n, and the L2 size of the same perturbation, ε × √n.","data":"formula","try":"Switch the input size from CIFAR-10 to an ImageNet crop and watch the activation change grow 49 times while ε stays the same.","inputs":{"eps_255":8,"n":3072,"mean_abs_w":0.01},"input_meta":{"eps_255":{"label":"Per-pixel budget ε","unit":"of 255 levels","min":0,"max":255,"step":1},"n":{"label":"Input size n","options":[["MNIST, 28 × 28 × 1 = 784",784],["CIFAR-10, 32 × 32 × 3 = 3,072",3072],["ImageNet crop, 224 × 224 × 3 = 150,528",150528]]},"mean_abs_w":{"label":"Mean weight magnitude m","min":0,"step":0.001}},"outputs":[{"id":"eps","label":"ε on a 0 to 1 pixel scale","expr":"eps_255 / 255"},{"id":"shift","label":"Worst-case activation change, ε × m × n","expr":"eps * mean_abs_w * n","main":true},{"id":"l2","label":"Same perturbation in L2, ε × √n","expr":"eps * sqrt(n)"}],"assumptions":["One linear unit, w · x, with the perturbation set to ε × sign(w), as in Goodfellow et al. (2014).","m is the average absolute weight. Real networks stack many units and nonlinearities, so this is the linear intuition, not a bound for a deep network.","Pixels are scaled to the range 0 to 1, so 8 of 255 levels is ε ≈ 0.031."],"tests":[{"inputs":{},"expect":{"shift":0.963764705882353,"l2":1.7388431636769903}},{"inputs":{"n":150528},"expect":{"shift":47.22447058823529,"l2":12.171902145738933}},{"inputs":{"eps_255":1},"expect":{"shift":0.12047058823529412}}]}
```

Their fast gradient sign method (FGSM) steps once along the sign of the input gradient, found by backpropagation ([neural networks](#neural-networks)). Projected gradient descent (PGD) takes many small steps, projecting back into the ε-ball after each ([Madry et al., 2017](https://arxiv.org/abs/1706.06083)). The Carlini-Wagner attack, which optimizes distance and misclassification jointly, broke defensive distillation ([Carlini and Wagner, 2016](https://arxiv.org/abs/1608.04644)).

```viz
{"id":"adversarial-ml-pgd","component":"stepper","title":"PGD climbs the loss in small signed steps and snaps back into the ε-ball after each one","caption":"Illustrative walk through L∞ PGD on one image, with the matching line of the code below. The PGD settings and accuracies quoted are from Madry et al. (2017) on CIFAR-10; the panda example is from Goodfellow et al. (2014).","alt":"Stepper through one PGD attack: random start inside the epsilon-ball, forward pass and loss on the true label, gradient with respect to the input, a signed step up the loss, projection back into the ball and the valid pixel range, repetition, and use of the result for adversarial training.","data":"illustrative","try":"Pause on Step and compare it with FGSM, which takes this step once, with α = ε.","depicts":"Madry et al., 2017 (L∞ PGD)","diagram":{"w":600,"h":190,"nodes":[{"id":"x","label":"Clean x","sub":"label y","role":"data","x":0,"y":0,"w":120,"h":56},{"id":"xadv","label":"x + δ","sub":"‖δ‖∞ ≤ ε","role":"untrusted","x":150,"y":0,"w":140,"h":56},{"id":"model","label":"Model","sub":"weights frozen","role":"model","x":320,"y":0,"w":130,"h":56},{"id":"loss","label":"Loss","sub":"true label","role":"plain","x":480,"y":0,"w":120,"h":56},{"id":"proj","label":"Project","sub":"clip to ε-ball","role":"tool","x":150,"y":130,"w":140,"h":56},{"id":"step","label":"Step","sub":"+ α · sign(g)","role":"plain","x":320,"y":130,"w":130,"h":56},{"id":"grad","label":"Gradient g","sub":"w.r.t. input","role":"plain","x":480,"y":130,"w":120,"h":56}],"edges":[{"from":"x","to":"xadv","label":"start"},{"from":"xadv","to":"model"},{"from":"model","to":"loss"},{"from":"loss","to":"grad","label":"backward","dx":-44},{"from":"grad","to":"step"},{"from":"step","to":"proj"},{"from":"proj","to":"xadv","label":"repeat","dx":-34}]},"frames":[
{"label":"Start","highlight":["x","xadv"],"edges":["x>xadv"],"caption":"Begin at the clean image plus uniform noise inside the ε-ball. Madry et al. start from a random point; on CIFAR-10 they used ε = 8/255.","code":"x_adv = (x + torch.empty_like(x).uniform_(-eps, eps)).clamp(0, 1)"},
{"label":"Forward","highlight":["xadv","model","loss"],"edges":["xadv>model","model>loss"],"caption":"Run the model and score it against the **true** label. The attacker wants this loss high.","code":"loss = F.cross_entropy(model(x_adv), y)"},
{"label":"Backward","highlight":["loss","grad"],"edges":["loss>grad"],"caption":"Backpropagate to the input pixels, not to the weights: the chain rule of training, pointed at a different variable.","code":"grad, = torch.autograd.grad(loss, x_adv)"},
{"label":"Step","highlight":["grad","step"],"edges":["grad>step"],"caption":"Move every pixel by α in the direction that raises the loss. FGSM is this step taken once, from x, with α = ε. With ε = 0.007, Goodfellow et al. turned GoogLeNet's “panda” into “gibbon” at 99.3% confidence.","code":"x_adv = x_adv + alpha * grad.sign()"},
{"label":"Project","highlight":["step","proj","xadv"],"edges":["step>proj","proj>xadv"],"caption":"Clip back to within ε of the original and to valid pixel values, so the change stays inside the threat model.","code":"x_adv = torch.min(torch.max(x_adv, x - eps), x + eps).clamp(0, 1)"},
{"label":"Repeat","highlight":["xadv","model","loss","grad","step","proj"],"caption":"Loop. Madry et al. trained with 7 steps of 2/255 and evaluated with 20. Even their adversarially trained network fell from 87.3% accuracy on clean images to 45.8%.","code":"for _ in range(steps): ..."},
{"label":"Train on it","highlight":["x","model"],"caption":"Adversarial training feeds x_adv, with its true label, to the optimizer: the outer minimization of the min-max objective. Every PGD step adds one more forward and backward pass to each training step."}]}
```

One image-agnostic perturbation can fool a network on most natural images, and it generalizes well to other networks ([Moosavi-Dezfooli et al., 2016](https://arxiv.org/abs/1610.08401)). Stickers fooled a stop-sign classifier in 84.8% of frames filmed from a moving car ([Eykholt et al., 2017](https://arxiv.org/abs/1707.08945)). Black-box attackers transfer examples from a substitute model ([Papernot et al., 2016](https://arxiv.org/abs/1602.02697)) or attack through queries alone; recent query attacks typically need fewer than 1,000 queries (NIST).

**Defenses that held up.** NIST names three. All trade clean accuracy for robustness and add compute (NIST), and [Tsipras et al. (2018)](https://arxiv.org/abs/1805.12152) proved that such a trade-off can be unavoidable in a simple setting. Adversarial training solves a min-max problem:

```math
\min_\theta \; \mathbb{E}_{(x,y)\sim D}\Big[\max_{\|\delta\|_\infty \le \varepsilon} L(\theta, x+\delta, y)\Big]
```

- **Adversarial training** runs an attack inside every training step; FGSM with a random start is a cheap substitute for PGD ([Wong et al., 2020](https://arxiv.org/abs/2001.03994)).
- **Randomized smoothing** votes over Gaussian-noised copies and proves an L2 radius ([Cohen et al., 2019](https://arxiv.org/abs/1902.02918)).
- **Formal verification** proves properties with solvers such as Reluplex ([Katz et al., 2017](https://arxiv.org/abs/1702.01135)), but scales poorly.

**Poisoning** corrupts training:
- **Availability** poisoning degrades everything and usually shows in metrics (NIST).
- **Targeted, clean-label** poisoning flips chosen inputs with correctly labeled data; one image sufficed under transfer learning ([Shafahi et al., 2018](https://arxiv.org/abs/1804.00792)).
- **Backdoors** teach a trigger: BadNets read stickered stop signs as speed limits ([Gu et al., 2017](https://arxiv.org/abs/1708.06733)).
- **Model poisoning** controls the parameters, through a supplier or a federated client that replaces its update ([Bagdasaryan et al., 2018](https://arxiv.org/abs/1807.00459)).

Scale does not dilute poison: 250 documents backdoored models from 600M to 13B parameters ([Souly et al., 2025](https://arxiv.org/abs/2510.07192)). Sanitization, robust aggregation and differential privacy help, but NIST describes limits for each. Cryptographic hashes of every item ensure you train on the data the dataset maintainers indexed, not content swapped in later ([Carlini et al., 2023](https://arxiv.org/abs/2302.10149)). See [supply chain security](#supply-chain-security).

**Privacy attacks** often need only query access (NIST):
- **Membership inference** asks whether a record was in training; judge it by true positives at false-positive rates below 0.1% ([Carlini et al., 2021](https://arxiv.org/abs/2112.03570)).
- **Reconstruction, model inversion, attribute and property inference** recover records, class representatives, sensitive attributes or dataset statistics.
- **Model extraction** copies the model. See [model theft](#model-theft).

Differential privacy bounds membership inference and reconstruction, not extraction (NIST; see [privacy-preserving ML](#privacy-preserving-ml)). **Energy-latency attacks** use sponge inputs that raised energy use 10 to 200 times ([Shumailov et al., 2020](https://arxiv.org/abs/2006.03463)).

**Adaptive attacks.** Seven of nine ICLR 2018 defenses that Athalye et al. examined relied on obfuscated gradients, and attacks built around them fully circumvented six ([Athalye et al., 2018](https://arxiv.org/abs/1802.00420)). [Tramèr et al. (2020)](https://arxiv.org/abs/2002.08347) broke 13 defenses whose authors had attempted adaptive evaluations. A defense counts only if it survives an attacker who knows it.

**LLM systems.**

```viz
{"id":"adversarial-ml-llm-map","component":"tree","title":"Every classic attack class has an LLM counterpart","caption":"Expand a class for its LLM form and the chapter that covers it. The mapping follows NIST AI 100-2 E2025, which likens optimization-based jailbreaks to evasion and files RAG knowledge-base poisoning under indirect prompt injection, enabled by resource control. The energy-latency branch follows Shumailov et al. (2020).","alt":"Tree mapping classic attack classes to LLM attacks: evasion to jailbreaks, data poisoning to poisoned pretraining data, model poisoning and model control to malicious weights and fine-tuning that strips refusals, resource control to indirect prompt injection and poisoned RAG documents, privacy attacks to training data and prompt extraction, model extraction to stealing through the API, and energy-latency attacks to sponge inputs, which also work on language models.","data":"illustrative","depicts":"NIST AI 100-2 E2025 (March 2025)","open":1,"root":{"label":"Classic class and its LLM form","children":[
{"label":"Evasion","children":[{"label":"Jailbreaks: adversarial suffixes optimized on open models that transfer to closed ones","link":"#jailbreak-techniques"}]},
{"label":"Data poisoning and backdoors","children":[{"label":"Poisoned web pages in pretraining crawls; trigger phrases that act as backdoors","link":"#supply-chain-security"}]},
{"label":"Model poisoning (model control)","children":[{"label":"Malicious open weights; fine-tuning that strips refusals, which NIST calls fine-tuning circumvention","link":"#fine-tuning-and-safety"}]},
{"label":"Resource control (new for generative AI)","children":[{"label":"Indirect prompt injection through documents, web pages and tool results","link":"#prompt-injection"},{"label":"Poisoned documents in a RAG knowledge base","link":"#rag-security"}]},
{"label":"Privacy attacks","children":[{"label":"Training data extraction, membership inference, system prompt extraction","link":"#privacy"}]},
{"label":"Model extraction","children":[{"label":"Recovering the hidden size and output projection through the API","link":"#model-theft"}]},
{"label":"Energy-latency","children":[{"label":"Sponge inputs that maximize energy use and latency, shown on language models too","link":"#cost-capacity"}]}]}}
```

Jailbreak suffixes optimized on Vicuna transferred to ChatGPT, Bard and Claude ([Zou et al., 2023](https://arxiv.org/abs/2307.15043)), and five poisoned texts per target question made a RAG system give the attacker's answer 90% of the time ([Zou et al., 2024](https://arxiv.org/abs/2402.07867)). Adaptive attacks bypassed 12 recent jailbreak and prompt-injection defenses, most with success rates above 90%, although most of those defenses had reported near-zero attack success ([Nasr et al., 2025](https://arxiv.org/abs/2510.09023)).

## In practice
Measure before you claim. This L∞ PGD baseline assumes a PyTorch image classifier with inputs in [0, 1] and normalization inside the model, so ε is in pixel units.

```python
import torch
import torch.nn.functional as F

def pgd_attack(model, x, y, eps=8/255, alpha=2/255, steps=20):
    model.eval()
    x_adv = (x + torch.empty_like(x).uniform_(-eps, eps)).clamp(0, 1)
    for _ in range(steps):
        x_adv.requires_grad_(True)
        loss = F.cross_entropy(model(x_adv), y)
        grad, = torch.autograd.grad(loss, x_adv)
        with torch.no_grad():
            x_adv = x_adv + alpha * grad.sign()
            x_adv = torch.min(torch.max(x_adv, x - eps), x + eps).clamp(0, 1)
    return x_adv.detach()

def robust_accuracy(model, loader, device="cuda", **attack):
    correct = total = 0
    for x, y in loader:
        x, y = x.to(device), y.to(device)
        x_adv = pgd_attack(model, x, y, **attack)
        with torch.no_grad():
            correct += (model(x_adv).argmax(dim=1) == y).sum().item()
        total += y.numel()
    return correct / total
```

- **Write the threat model first:** goal, capability, knowledge.
- **Report robust accuracy with its norm, ε and attack,** beside clean accuracy.
- **Run AutoAttack ([Croce and Hein, 2020](https://arxiv.org/abs/2003.01690)), then attack your defense directly,** approximating non-differentiable steps (BPDA) and averaging over randomness (Expectation over Transformation), as Athalye et al. did.
- **Against poisoning,** verify dataset hashes and test fine-tunes before deployment.
- **Against privacy attacks,** use DP-SGD on sensitive data and rate-limit queries; hiding confidence scores does not fully stop extraction ([Tramèr et al., 2016](https://arxiv.org/abs/1609.02943)).
- **For LLM apps,** feed these classes into [red teaming](#red-teaming).

> [!try]
> Run `robust_accuracy` at ε = 1, 2, 4 and 8 out of 255. Accuracy should keep falling as ε grows: Madry et al.'s undefended CIFAR-10 networks kept under 4% under 20-step PGD at 8/255. If accuracy stops falling, suspect masked gradients.

## Numbers to know
> [!number]
> Reference results; one rule of thumb.
> - Robust accuracy lags: one adversarially trained CIFAR-10 network scored 87.3% clean and 45.8% under 20-step PGD at ε = 8/255 ([Madry et al., 2017](https://arxiv.org/abs/1706.06083)).
> - Certification is slow: 49% certified top-1 on ImageNet at L2 radius 0.5, at 110 seconds per image ([Cohen et al., 2019](https://arxiv.org/abs/1902.02918)).
> - Poison is cheap: 0.01% of LAION-400M could have been poisoned for $60 ([Carlini et al., 2023](https://arxiv.org/abs/2302.10149)).
> - Extraction is cheap: under $20 for two OpenAI models' output projections ([Carlini et al., 2024](https://arxiv.org/abs/2403.06634)).
> - Rule of thumb: white-box attacks should beat black-box ones, and iterative attacks single-step ones; if not, suspect gradient masking ([Athalye et al., 2018](https://arxiv.org/abs/1802.00420)).

## Pitfalls and anti-patterns
> [!pitfall] Declaring victory against yesterday's attacks
> Off-the-shelf FGSM or PGD can fail only because a defense hides its gradients. Other warning signs: unbounded attacks miss 100%, or a larger ε does not raise success ([Athalye et al., 2018](https://arxiv.org/abs/1802.00420)). Build an adaptive attack.

- **One norm assumed to cover all.** Madry et al.'s L∞-trained MNIST model looked robust to L2 PGD, until a decision-based attack, which uses no gradients, showed it was much more brittle ([Madry et al., 2017](https://arxiv.org/abs/1706.06083)).
- **Average-case privacy metrics** hide exposed individuals; report true positives at low false-positive rates ([Carlini et al., 2021](https://arxiv.org/abs/2112.03570)).

## Talk like an expert
The vocabulary: **ε-ball**, **L∞ budget**, **transferability**, **adaptive attack**, **obfuscated gradients**, **robust accuracy**, **certified radius**, **clean-label**, **trigger**. Experts ask “robust to what, within which budget, against whom?”

The live debate is relevance. Among 4,600 inputs a commercial phishing detector flagged as uncertain, 100 were adversarial, made by cropping, masking or blurring, not gradients ([Apruzzese et al., 2022](https://arxiv.org/abs/2212.14315), via NIST). The other side cites optimized attacks that transfer to closed production models ([Zou et al., 2023](https://arxiv.org/abs/2307.15043)).

> [!hottake] Jailbreak and prompt-injection defenses are replaying the adversarial-example decade, and most will be broken the same way.
> **The counterargument:** permissions, sandboxes, approvals and rate limits bound the damage of a successful attack, so an LLM app can be safe without a robust model ([secure agent design](#secure-agent-design)).

## Check yourself
```quiz
adversarial-ml
```

## Go deeper
- Vassilev et al., [“Adversarial Machine Learning: A Taxonomy and Terminology of Attacks and Mitigations”](https://csrc.nist.gov/pubs/ai/100/2/e2025/final), NIST AI 100-2 E2025 (2025).
- Madry et al., [“Towards Deep Learning Models Resistant to Adversarial Attacks”](https://arxiv.org/abs/1706.06083) (2017).
- Carlini et al., [“On Evaluating Adversarial Robustness”](https://arxiv.org/abs/1902.06705) (2019).
- Tramèr et al., [“On Adaptive Attacks to Adversarial Example Defenses”](https://arxiv.org/abs/2002.08347) (2020).

## Related
- [Threat modeling LLM apps and agents](#threat-modeling)
- [Jailbreak attacks and defenses in depth](#jailbreak-techniques)
- [Privacy-preserving machine learning](#privacy-preserving-ml)
- [Model theft and weight security](#model-theft)
- [Supply chain and model security](#supply-chain-security)
- [AI security frameworks and standards](#ai-security-frameworks)
