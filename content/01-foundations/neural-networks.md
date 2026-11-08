---
id: neural-networks
book: 1
order: "1.5"
title: Neural networks
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [ml, mlp, normalization, backprop]
visuals:
  - backprop-stepper:stepper
  - activation-chart:chart
---
> [!tldr]
> A neural network is layers of linear transformations separated by nonlinear activations, trained by backpropagation to minimize a loss. Depth lets networks build features from features; residual connections and normalization make very deep networks trainable. Transformers are a particular arrangement of these parts.

## Why it matters
Every model in this Bible is a neural network. Knowing forward passes, losses, gradients and the role of activations, normalization and residuals makes architecture papers, training failures and fine-tuning settings understandable.

## Intuition
A network is an assembly line of simple workers. Each multiplies its inputs by weights, adds them up and passes a squashed result on. Training is the foreman going back down the line after each mistake, telling each worker how to adjust.

```viz
{"id":"backprop-stepper","component":"stepper","title":"Forward to a prediction, back to gradients, then a small update","caption":"A tiny two-layer network on one example. Step through the training loop.","alt":"Stepper of a forward pass, loss computation, backpropagation of gradients and a weight update in a two-layer network.","data":"illustrative","diagram":{"w":600,"h":80,"nodes":[{"id":"x","label":"Input x","role":"data","x":0,"y":12,"w":100,"h":56},{"id":"h","label":"Hidden: ReLU(W₁x)","role":"model","x":140,"y":12,"w":150,"h":56},{"id":"y","label":"Output: W₂h","role":"model","x":330,"y":12,"w":130,"h":56},{"id":"loss","label":"Loss","role":"untrusted","x":500,"y":12,"w":100,"h":56}],"edges":[{"from":"x","to":"h"},{"from":"h","to":"y"},{"from":"y","to":"loss"}]},
"frames":[
{"label":"Forward","highlight":["x","h","y"],"caption":"Multiply the input by W₁, apply ReLU, multiply by W₂ to get a prediction."},
{"label":"Loss","highlight":["loss"],"caption":"Compare the prediction with the target, for example with cross-entropy."},
{"label":"Backward","highlight":["loss","y","h"],"caption":"The chain rule passes the loss gradient back through W₂, the ReLU and W₁, giving every weight’s gradient in one sweep."},
{"label":"Update","highlight":["h","y"],"caption":"Each weight moves a small step against its gradient, scaled by the learning rate and the optimizer."},
{"label":"Repeat","caption":"Over millions of examples, the weights settle where the loss is low on data the network has not memorized."}]}
```

## How it works
**Layers and activations.** A layer computes Wx + b; an activation (ReLU, GELU, SiLU) adds nonlinearity, without which stacked layers collapse into one linear map.

```viz
{"id":"activation-chart","component":"chart","type":"line","title":"ReLU and GELU agree for large inputs and differ near zero","caption":"Formula view: ReLU(x) = max(0, x); GELU(x) ≈ x·Φ(x), a smooth version used in many transformers.","alt":"Line chart comparing ReLU and GELU activation functions from x = −3 to 3.","data":"formula","x":{"label":"Input x"},"y":{"label":"Output","min":-0.5,"max":3},"series":[{"name":"ReLU","points":[[-3,0],[-2,0],[-1,0],[0,0],[1,1],[2,2],[3,3]]},{"name":"GELU","points":[[-3,-0.004],[-2,-0.045],[-1,-0.159],[0,0],[1,0.841],[2,1.955],[3,2.996]]}]}
```

**Losses.** Cross-entropy for classification and language modeling; mean squared error for regression. See [probability and information theory](#probability-information).

**Backpropagation.** Rumelhart, Hinton and Williams (1986) popularized computing all gradients with the chain rule; automatic differentiation in PyTorch and JAX does it for you. See [calculus and optimization](#calculus-optimization).

**Making depth work.** Residual connections (He et al., 2015) let gradients flow through deep stacks; normalization layers stabilize activations; careful initialization keeps signals from exploding or vanishing.

**Architectures.** Convolutional networks for images, recurrent networks for sequences, and transformers, which now dominate language, vision and audio. See [the transformer block](#transformer-block).

## In practice
- When training diverges, check the learning rate, normalization and gradient norms first.
- Use library implementations of standard layers; custom ones are a common source of bugs.

## Numbers to know
> [!number]
> Rules of thumb. A backward pass costs about twice a forward pass. Modern language models have tens to hundreds of layers.

## Pitfalls and anti-patterns
> [!pitfall] Treating networks as black boxes during debugging
> Logging losses, gradient norms and activation statistics finds most training bugs quickly.

## Talk like an expert
The vocabulary: **layer**, **activation**, **ReLU**, **GELU**, **loss**, **backpropagation**, **automatic differentiation**, **residual connection**, **normalization**, **initialization**. Experts debug networks from their training curves. The live debate here is mostly historical: neural networks won; the questions now are about architectures and scale.

> [!hottake] Residual connections are the single most important trick in deep learning.
> **The counterargument:** normalization, better optimizers and attention were equally necessary; deep learning’s success is a combination, not one trick.

## Check yourself
```quiz
neural-networks
```

## Go deeper
- Goodfellow, Bengio and Courville, *Deep Learning*.
- He et al., “Deep Residual Learning for Image Recognition” (2015).

## Related
- [Calculus and optimization](#calculus-optimization)
- [The transformer block](#transformer-block)
- [Classical ML essentials](#classical-ml)
- [Representation learning](#representation-learning)
- [Linear algebra for AI](#linear-algebra)
