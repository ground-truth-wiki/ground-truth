---
id: dl-frameworks
book: 1
order: "1.11"
title: "Deep learning frameworks: PyTorch, JAX and Keras"
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [pytorch, jax, keras, frameworks, autodiff]
visuals: []
prerequisites: [neural-networks, calculus-optimization]
---
> [!tldr]
> A deep learning framework gives you tensors on accelerators, automatic gradients, building blocks for models, and ways to compile and save them. PyTorch runs your Python code eagerly and records what it did, JAX transforms pure functions, and Keras 3 is a high-level API that runs on several backends. The one thing to remember: PyTorch keeps state inside objects, while plain JAX makes you pass parameters, optimizer state and random keys around explicitly.

## Key ideas

- **Tensors, devices and modules.** "A torch.Tensor is a multi-dimensional matrix containing elements of a single data type," created with a chosen dtype and device and moved between them with its `to()` method ([PyTorch: torch.Tensor](https://docs.pytorch.org/docs/stable/tensors.html)). PyTorch models subclass `nn.Module`, which nests modules in a tree and registers submodules assigned as attributes ([PyTorch: nn.Module](https://docs.pytorch.org/docs/stable/generated/torch.nn.Module.html)), and in JAX, Flax NNX, the API at the core of Flax, lets you write models as regular Python objects, classes that subclass `nnx.Module` ([Flax documentation](https://flax.readthedocs.io/en/latest/)).
- **Gradients and a training step, two ways.** PyTorch autograd records a directed acyclic graph of the operations you run and recreates it from scratch at every iteration, which is what lets ordinary Python control flow work ([PyTorch: Autograd mechanics](https://docs.pytorch.org/docs/stable/notes/autograd.html)), and a training step is `optimizer.zero_grad()`, `loss.backward()` and `optimizer.step()` ([PyTorch: torch.optim](https://docs.pytorch.org/docs/stable/optim.html)). JAX offers transformations instead, functions that take a function and return a transformed one, such as `jax.grad` ([JAX glossary](https://docs.jax.dev/en/latest/glossary.html)), and with Optax a step is `optimizer.update(grads, opt_state)` followed by `optax.apply_updates`, which adds the updates to the parameters ([Optax: Getting started](https://optax.readthedocs.io/en/latest/getting_started.html)).
- **JAX's model: pure functions and explicit state.** JAX transformations are designed only for functionally pure functions, side effects such as `print` may appear only on the first, tracing run, and arrays are immutable, so `x.at[i].set(v)` returns a new array ([JAX: Common gotchas](https://docs.jax.dev/en/latest/notebooks/Common_Gotchas_in_JAX.html)). Random numbers come from explicit keys that you split and never reuse ([JAX: Pseudorandom numbers](https://docs.jax.dev/en/latest/random-numbers.html)), nested containers of arrays are handled uniformly as pytrees and `jax.vmap` vectorizes a function ([JAX: Key concepts](https://docs.jax.dev/en/latest/key-concepts.html)), and a `jax.sharding.Sharding` describes how an array is laid out across devices ([JAX: Distributed arrays and automatic parallelization](https://docs.jax.dev/en/latest/201/sharding.html)).
- **Eager first, then graph capture for speed.** TensorFlow began by building dataflow graphs (Abadi et al., [“TensorFlow: Large-Scale Machine Learning on Heterogeneous Distributed Systems”](https://arxiv.org/abs/1603.04467) (2016)), PyTorch made every aspect of the library "a regular Python program under the full control of its user" (Paszke et al., [“PyTorch: An Imperative Style, High-Performance Deep Learning Library”](https://arxiv.org/abs/1912.01703) (2019)), and TensorFlow 2 runs eagerly by default, with `tf.function` turning Python code into graphs ([TensorFlow guide: tf.function](https://www.tensorflow.org/guide/function)). For speed, each framework hands captured code to a compiler, the subject of [GPU kernels and ML compilers](#gpu-kernels-compilers): `jax.jit` compiles array operations with XLA ([JAX glossary](https://docs.jax.dev/en/latest/glossary.html)), and `torch.compile` uses TorchDynamo with Inductor as its default backend ([PyTorch: torch.compile](https://docs.pytorch.org/docs/stable/generated/torch.compile.html)).
- **Keras 3 and the balance as of November 2026.** Keras 3 runs on JAX, TensorFlow or PyTorch, plus OpenVINO for inference only ([Keras 3 introduction](https://keras.io/keras_3/)), and starting with TensorFlow 2.16, `pip install tensorflow` installs Keras 3 and `tf.keras` is Keras 3 by default ([Keras: Getting started](https://keras.io/getting_started/)). As of November 2026, Hugging Face Transformers is on its v5 line ([PyPI: transformers](https://pypi.org/project/transformers/)), which sunset Flax and TensorFlow support to focus on PyTorch as its sole backend ([Hugging Face: Transformers v5](https://huggingface.co/blog/transformers-v5), December 2025), while code for Google's TPUs must be compiled by XLA, the same compiler `jax.jit` targets ([Cloud TPU introduction](https://docs.cloud.google.com/tpu/docs/intro-to-tpu)).
- **Saving and moving models between tools.** PyTorch recommends saving the `state_dict`, a dictionary from each layer to its parameter tensors, because a pickled whole model is bound to the exact classes and directory structure used when it was saved ([PyTorch: Saving and loading models](https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html)), and safetensors is a simple format that stores tensors safely, unlike pickle, while staying fast ([safetensors documentation](https://huggingface.co/docs/safetensors/index)). ONNX is an open standard format for models that PyTorch exports with `torch.onnx.export(..., dynamo=True)` ([PyTorch: torch.onnx](https://docs.pytorch.org/docs/stable/onnx.html)), and DLPack lets NumPy, CuPy, PyTorch, TensorFlow, JAX and others exchange arrays in memory ([DLPack documentation](https://dmlc.github.io/dlpack/latest/)).

## Planned visuals

- `compare`: the same minimal training step side by side, in PyTorch (`loss.backward()`, `optimizer.step()`) and in JAX with Optax (`jax.value_and_grad`, `optimizer.update`, `optax.apply_updates`), with linked highlights for the forward pass, the gradient and the update.
- `diagram`: from Python code to hardware in each framework: eager execution, graph capture (`torch.compile`, `jax.jit`, `tf.function`), the compiler (Inductor, XLA) and the device, each part linked to its chapter.
- `timeline`: from static dataflow graphs to eager execution and back to compilers: the TensorFlow paper, the PyTorch paper, eager-by-default TensorFlow 2, Keras 3 and Transformers v5, each with its dated source.

## Talk like an expert

Practitioners talk about eager versus traced code, graph breaks and recompilation, pytrees and PRNG keys, state dicts and checkpoints. They choose a framework by its ecosystem, deployment path and target hardware more than by its syntax.

## Go deeper

- Paszke et al., [“PyTorch: An Imperative Style, High-Performance Deep Learning Library”](https://arxiv.org/abs/1912.01703) (2019).
- [PyTorch: Autograd mechanics](https://docs.pytorch.org/docs/stable/notes/autograd.html).
- [JAX: Key concepts](https://docs.jax.dev/en/latest/key-concepts.html) and [Common gotchas in JAX](https://docs.jax.dev/en/latest/notebooks/Common_Gotchas_in_JAX.html).
- [Keras 3 introduction](https://keras.io/keras_3/).

## Related

- [Automatic differentiation](#automatic-differentiation)
- [Tensors, shapes and broadcasting](#tensors-and-shapes)
- [Training neural networks in practice](#training-neural-networks)
- [Hardware](#hardware)
- [Distributed training](#distributed-training)
