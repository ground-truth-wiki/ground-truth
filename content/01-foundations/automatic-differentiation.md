---
id: automatic-differentiation
book: 1
order: "1.3.1"
title: Automatic differentiation
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [autodiff, backpropagation, gradients, jacobians, pytorch]
visuals: []
prerequisites: [calculus-optimization]
---
> [!tldr]
> Automatic differentiation (autodiff) computes derivatives of a program by applying the chain rule to every operation it runs, which is how PyTorch and JAX produce gradients without anyone writing them by hand. Backpropagation is its reverse mode applied to one scalar loss. Remember the trade: reverse mode gets the whole gradient for a few times the cost of the forward pass, but it must keep the forward pass's intermediate results in memory.

## Key ideas

- **Not symbolic, not numerical.** Autodiff evaluates derivatives of numeric programs efficiently and accurately; Baydin et al., [“Automatic Differentiation in Machine Learning: a Survey”](https://www.jmlr.org/papers/v18/17-468.html) (2018) call it similar to but more general than backpropagation, and give a section to why it is neither numerical nor symbolic differentiation. Finite differences still serve as a check: PyTorch's `gradcheck` compares autograd's gradients against them and expects double-precision inputs ([PyTorch docs](https://docs.pytorch.org/docs/2.15/generated/torch.autograd.gradcheck.gradcheck.html)).
- **Forward mode and reverse mode.** Forward mode computes Jacobian-vector products (JVPs) and builds a Jacobian one column at a time; reverse mode computes vector-Jacobian products (VJPs) and builds it one row at a time, so a scalar loss gets its full gradient in one call ([JAX autodiff cookbook](https://docs.jax.dev/en/latest/301/cookbook.html)). A VJP costs only about three times as many FLOPs as evaluating the function, but its memory grows with the depth of the computation, while forward mode's does not (same source).
- **The graph is recorded as code runs.** PyTorch autograd records a directed acyclic graph of operations during the forward pass and rebuilds it every iteration, so Python loops and branches simply work; in the docs' words, "what you run is what you differentiate" ([PyTorch autograd mechanics](https://docs.pytorch.org/docs/2.15/notes/autograd.html)). JAX instead exposes `grad`, `jvp` and `vjp` as composable function transformations, and composing forward over reverse gives Hessian-vector products efficiently ([JAX autodiff cookbook](https://docs.jax.dev/en/latest/301/cookbook.html)).
- **Memory is the price of reverse mode.** Some operations save intermediate results during the forward pass for the backward pass ([PyTorch autograd mechanics](https://docs.pytorch.org/docs/2.15/notes/autograd.html)). Activation checkpointing recomputes them instead: Chen et al., [“Training Deep Nets with Sublinear Memory Cost”](https://arxiv.org/abs/1604.06174) (2016) train an n-layer network with O(√n) memory for the cost of one extra forward pass per mini-batch.
- **Stopping gradients on purpose.** `requires_grad_(False)` freezes parameters, no-grad mode stops recording (as in optimizer updates), and inference mode goes further for pure evaluation ([PyTorch autograd mechanics](https://docs.pytorch.org/docs/2.15/notes/autograd.html)). Detaching a value cuts it from its history, so gradients do not flow through it ([Dive into Deep Learning, 2.5](https://d2l.ai/chapter_preliminaries/autograd.html)).
- **Gradients through steps that have none.** The straight-through estimator copies the gradient with respect to a stochastic or discrete output straight back to its input, as a heuristic (Bengio et al., [“Estimating or Propagating Gradients Through Stochastic Neurons for Conditional Computation”](https://arxiv.org/abs/1308.3432) (2013)), and Gumbel-softmax replaces a categorical sample with a differentiable relaxation (Jang et al., [“Categorical Reparameterization with Gumbel-Softmax”](https://arxiv.org/abs/1611.01144) (2016)). For gradients of an expectation, Mohamed et al., [“Monte Carlo Gradient Estimation in Machine Learning”](https://arxiv.org/abs/1906.10652) (2019) survey three estimators: score function (REINFORCE in reinforcement learning), pathwise (the reparameterization trick) and measure-valued.

## Planned visuals

- **`stepper`:** forward mode and reverse mode on the same small expression graph, with tangents flowing forward in one run and adjoints flowing back in the other.
- **`compare`:** JVP versus VJP: what each pass produces, its cost and memory, and which Jacobian shape (tall or wide) it suits.
- **`code-walk`:** a few lines of PyTorch where each highlighted line lights up its part of the recorded graph: `requires_grad`, the forward operations, `backward()`, and the update under `torch.no_grad()`.

## Talk like an expert

Experts say "VJP" and "JVP" rather than "backprop", talk about primals and tangents (JAX) or saved tensors and `grad_fn` (PyTorch), and ask what a technique costs in activation memory before they ask about FLOPs.

## Go deeper

- Baydin et al., [“Automatic Differentiation in Machine Learning: a Survey”](https://www.jmlr.org/papers/v18/17-468.html) (2018).
- [The autodiff cookbook: JVPs and VJPs](https://docs.jax.dev/en/latest/301/cookbook.html), in the JAX documentation.
- [PyTorch autograd mechanics](https://docs.pytorch.org/docs/2.15/notes/autograd.html).
- Mohamed et al., [“Monte Carlo Gradient Estimation in Machine Learning”](https://arxiv.org/abs/1906.10652) (2019).

## Related

- [Calculus and optimization](#calculus-optimization)
- [Deep learning frameworks: PyTorch, JAX and Keras](#dl-frameworks)
- [Training neural networks in practice](#training-neural-networks)
- [Policy gradients, actor-critic and PPO](#policy-gradient-methods)
- [Quantization](#quantization)
