---
id: supply-chain-security
book: 17
order: "17.5"
title: Supply chain and model security
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [supply-chain, backdoors, signing]
visuals:
  - supply-chain-map:diagram
  - pickle-compare:compare
---
> [!tldr]
> AI systems inherit risk from everything they are built from: model weights, adapters, datasets, packages, MCP servers, skills and plugins. Load weights in safe formats, verify provenance and signatures, pin and scan dependencies, watch for poisoned data and hallucinated package names, and keep an inventory of every component.

## Why it matters
A model file can execute code when loaded. A fine-tuned model can carry a backdoor that triggers on a rare phrase. A coding agent can install a package whose name it invented, which an attacker has registered. A skill or MCP server can instruct an agent to leak data. These are supply-chain attacks, and AI multiplies the number of components most teams pull from strangers.

## Intuition
A restaurant is only as safe as its suppliers. You check where ingredients come from, keep receipts, reject unlabeled boxes, and notice when a familiar supplier’s packaging suddenly looks different.

```viz
{"id":"supply-chain-map","component":"diagram","title":"Eight kinds of component flow into an AI application, and each has its own way to be compromised","caption":"Click a component for the chapter covering its risks. The application at the center inherits every risk around it.","alt":"Diagram of supply-chain components feeding an AI application: base weights, adapters, model files, datasets, packages, MCP servers, skills and plugins, and prompts from other teams.","data":"illustrative","w":600,"h":260,"nodes":[
{"id":"app","label":"Your application","role":"agent","x":215,"y":102,"w":170,"h":56},
{"id":"weights","label":"Base weights","sub":"provenance, backdoors","role":"model","x":0,"y":0,"w":170,"h":52,"link":"#open-weight-frontier"},
{"id":"adapters","label":"Adapters and fine-tunes","sub":"poisoned training","role":"model","x":215,"y":0,"w":170,"h":52,"link":"#fine-tuning-practice"},
{"id":"files","label":"Model files","sub":"code on load","role":"untrusted","x":430,"y":0,"w":170,"h":52},
{"id":"data","label":"Datasets","sub":"poisoning","role":"data","x":0,"y":104,"w":170,"h":52,"link":"#pretraining-data"},
{"id":"pkgs","label":"Packages","sub":"typosquats, hallucinated names","role":"untrusted","x":430,"y":104,"w":170,"h":52},
{"id":"mcp","label":"MCP servers","sub":"tool poisoning","role":"tool","x":0,"y":208,"w":170,"h":52,"link":"#mcp-security"},
{"id":"skills","label":"Skills and plugins","sub":"malicious instructions","role":"context","x":215,"y":208,"w":170,"h":52,"link":"#skills-plugins"},
{"id":"retr","label":"Retrieval corpora","sub":"injected documents","role":"data","x":430,"y":208,"w":170,"h":52,"link":"#production-rag"}],
"edges":[{"from":"weights","to":"app"},{"from":"adapters","to":"app"},{"from":"files","to":"app"},{"from":"data","to":"app"},{"from":"pkgs","to":"app"},{"from":"mcp","to":"app"},{"from":"skills","to":"app"},{"from":"retr","to":"app"}]}
```

## How it works
**Unsafe serialization.** Python’s pickle format, used by older PyTorch checkpoints, can run arbitrary code during loading. Prefer safetensors, which stores only tensors, and load PyTorch checkpoints with `weights_only=True` on PyTorch 2.6.0 or later (the default there; in 2.5.1 and earlier this path could still run code, CVE-2025-32434). Hugging Face scans uploaded files for unsafe pickles, but scanning is not a guarantee.

**Provenance and signing.** Download models from the publisher’s official account, pin exact revisions, and verify checksums or signatures where offered; OpenSSF’s model-signing work brings Sigstore-style signing to model files. Record where every model came from.

**Backdoors and poisoning.** A model or dataset can be manipulated so that a trigger phrase produces attacker-chosen behavior. Research in 2025 by Anthropic with the UK AI Security Institute and the Alan Turing Institute found that a small, roughly constant number of poisoned documents could implant such a backdoor regardless of model size. Carlini et al. (2023) showed that poisoning web-scale datasets is practical. Vet fine-tuning data and evaluate fine-tunes for unexpected behavior. See [pretraining data](#pretraining-data).

**Packages and hallucinated names.** Coding agents sometimes suggest packages that do not exist; attackers register those names (sometimes called slopsquatting). Spracklen et al. (2024) measured how often models invent package names. Pin dependencies with lockfiles and hashes, use allowlisted registries or mirrors, and require review before agents add new dependencies.

**MCP servers, skills and plugins.** Third-party tools and instructions run with your agent’s authority. Review, pin, sandbox and monitor them. See [MCP security](#mcp-security) and [skills](#skills-plugins).

**Inventory.** An AI bill of materials lists models (with revisions), datasets, adapters, packages, servers and skills, so you can answer “are we affected?” within minutes when a component is compromised.

## In practice
```viz
{"id":"pickle-compare","component":"compare","title":"Loading a pickle can run the attacker’s code; loading safetensors only reads numbers","caption":"Illustrative loading code. Hover the marks.","alt":"Comparison of loading a model checkpoint with pickle-based torch.load and with safetensors.","data":"illustrative","a":{"title":"Risky","text":"import torch\n# Older default, or weights_only=False:\nstate = torch.load('model.bin', weights_only=False)\n# A crafted pickle can execute any\n# Python during this call."},"b":{"title":"Safer","text":"from safetensors.torch import load_file\nstate = load_file('model.safetensors')\n# Only tensors and metadata are parsed;\n# no code runs.\n\n# If you must load a .bin checkpoint:\nstate = torch.load('model.bin', weights_only=True)"},"links":[{"a":"state = torch.load('model.bin', weights_only=False)","b":"state = load_file('model.safetensors')","note":"safetensors was designed so that loading cannot execute code."},{"a":"# A crafted pickle can execute any\n# Python during this call.","note":"Pickle deserialization calls functions named in the file. Scanning helps, but the format itself is unsafe."},{"b":"state = torch.load('model.bin', weights_only=True)","note":"Restricts unpickling to tensors and simple types. Needs PyTorch 2.6.0 or later; earlier versions could still run code here (CVE-2025-32434)."}]}
```

A supply-chain checklist:
- Safetensors or `weights_only=True` for every model load.
- Models from official publishers, pinned to exact revisions, with checksums recorded.
- Evaluations of every fine-tune or third-party model for unexpected behavior before deployment.
- Lockfiles with hashes; review before any new dependency, especially agent-suggested ones.
- Reviewed, pinned and sandboxed MCP servers and skills.
- An inventory of all AI components, with owners.

## Numbers to know
> [!number]
> Rules of thumb. Treat every model file in a pickle-based format as executable code. Research suggests a small number of poisoned documents can backdoor a model, so the size of a dataset is no protection against poisoning. Every new dependency an agent adds deserves the review a human-added one would get.

## Pitfalls and anti-patterns
> [!pitfall] Loading untrusted pickles
> `torch.load` on a downloaded checkpoint without `weights_only=True` is running a stranger’s code.

- **Unpinned model revisions.** The file behind a name can change.
- **Agents installing packages freely.** Hallucinated names are a real attack path.
- **No inventory.** When a component is compromised, you cannot tell whether you are affected.

## Talk like an expert
The vocabulary: **pickle**, **safetensors**, **provenance**, **model signing**, **backdoor**, **data poisoning**, **slopsquatting**, **AI bill of materials**. Experts ask “where did this file come from, and could loading it run code?” before anything else. The live debate is how to verify open-weight models whose training data cannot be inspected, and whether signing and attestation will become standard across model hubs.

> [!hottake] The most likely AI security incident in your company is a supply-chain one, not a prompt attack.
> **The counterargument:** prompt injection is far easier to attempt at scale, needs no access to your build pipeline, and hits every agent that reads untrusted content; both deserve investment.

## Check yourself
```quiz
supply-chain-security
```

## Go deeper
- The safetensors documentation and Hugging Face’s guidance on pickle scanning.
- OpenSSF’s model signing project.
- Spracklen et al., “We Have a Package for You! A Comprehensive Analysis of Package Hallucinations by Code Generating LLMs” (2024).
- Carlini et al., “Poisoning Web-Scale Training Datasets is Practical” (2023).

## Related
- [Threat modeling](#threat-modeling)
- [MCP security](#mcp-security)
- [Skills, plugins and extension ecosystems](#skills-plugins)
- [Open weights and the open ecosystem](#open-weight-frontier)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Model hubs and the Hugging Face ecosystem](#hugging-face-ecosystem)
- [Dataset versioning and lineage](#dataset-versioning-lineage)
- [Adversarial machine learning](#adversarial-ml)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Model theft and weight security](#model-theft)
