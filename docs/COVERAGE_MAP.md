# Coverage map

What Ground Truth Wiki covers: every book and chapter, what each chapter must cover, and its status. It comes from section 4 of the editorial masterprompt (`source/editorial-masterprompt.md`) and drives two things:

- **`continue`**, the maintainer command (AGENTS.md), which deepens seed chapters in the priority order below, then writes planned topics;
- **wanted pages**: every row with status `planned` becomes a wanted page with an issue people can claim (`npm run wanted -- --sync`, then `npm run wanted -- --issues`).

The status here must match the chapter's frontmatter; `npm run validate` warns when they drift apart.

## Adding a topic

Propose it in GitHub Discussions ("Proposals"), with the book, a title and what it must cover. Once accepted, a maintainer adds a row with status `planned` and an id, such as `| 12.15 | Agent payments protocols (`agent-payments`) | planned | What it must cover … |`. Never invent a topic to fill a gap.

## Priority order

When seeds or planned topics exist, books are worked on in this order (section 5 of the editorial masterprompt): 9, 12, 11, 6, 5, 14, 17, 15, 16, 10, 13, 2, 3, 4, 18, 1, 8, 7, 19, 0, 20.

## Summary

| Book | Title | Chapters | Full | Seed | Planned |
|---|---|---|---|---|---|
| 0 | Start here | 4 | 4 | 0 | 0 |
| 1 | Foundations, math and machine learning | 7 | 7 | 0 | 0 |
| 2 | Inside the transformer | 10 | 10 | 0 | 0 |
| 3 | How LLMs are built | 11 | 11 | 0 | 0 |
| 4 | The model landscape | 7 | 7 | 0 | 0 |
| 5 | Prompt and context engineering | 8 | 8 | 0 | 0 |
| 6 | Retrieval and knowledge (RAG) | 16 | 16 | 0 | 0 |
| 7 | Data for AI | 5 | 5 | 0 | 0 |
| 8 | Multimodal and generative media | 6 | 6 | 0 | 0 |
| 9 | Agents, core concepts | 12 | 12 | 0 | 0 |
| 10 | Agent archetypes | 8 | 8 | 0 | 0 |
| 11 | Harnesses | 11 | 11 | 0 | 0 |
| 12 | Protocols and standards | 14 | 14 | 0 | 0 |
| 13 | Frameworks and SDKs | 7 | 7 | 0 | 0 |
| 14 | Evaluation | 11 | 11 | 0 | 0 |
| 15 | Inference and performance | 11 | 11 | 0 | 0 |
| 16 | LLMOps and production | 10 | 10 | 0 | 0 |
| 17 | Security, safety and alignment | 11 | 11 | 0 | 0 |
| 18 | System design and case studies | 7 | 7 | 0 | 0 |
| 19 | The frontier | 9 | 9 | 0 | 0 |
| 20 | Reference and career | 10 | 10 | 0 | 0 |
| 21 | Playbooks | 1 | 0 | 1 | 0 |
| 22 | Field notes | 1 | 0 | 1 | 0 |
| | **Total** | **197** | **195** | **2** | **0** |

## Part I: Understand the machine

### Book 0: Start here

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 0.1 | [What an AI engineer is](../content/00-start-here/ai-engineer-role.md) | full | how the role differs from ML engineer, research scientist and data scientist; the skills map; what "state of the art" means in practice. |
| 0.2 | [The AI engineering stack](../content/00-start-here/ai-engineering-stack.md) | full | one diagram from silicon to product: hardware, models, inference, context and retrieval, tools and protocols, agents and harnesses, evals and observability, product and UX. |
| 0.3 | [Mental models that matter](../content/00-start-here/mental-models.md) | full | next-token predictors that learned to reason over context; context is everything; workflows vs agents; evals before vibes; the bitter lesson; the cost, latency and quality triangle. |
| 0.4 | [How to use Ground Truth](../content/00-start-here/how-to-use.md) | full | levels, stability badges, learning paths, search, and how to stay current. |

### Book 1: Foundations, math and machine learning

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 1.1 | [Linear algebra for AI](../content/01-foundations/linear-algebra.md) | full | vectors and matrices, matrix multiplication as the core operation, dot product and cosine similarity, norms, projections, eigenvectors, SVD and low-rank structure (why LoRA works). |
| 1.2 | [Probability, statistics and information theory](../content/01-foundations/probability-information.md) | full | distributions, Bayes, expectation and variance, sampling, entropy, cross-entropy, KL divergence, perplexity, maximum likelihood. |
| 1.3 | [Calculus and optimization](../content/01-foundations/calculus-optimization.md) | full | gradients, the chain rule, backpropagation and autograd, SGD, momentum, Adam and AdamW, learning-rate schedules and warmup, weight decay, gradient clipping, newer optimizers as a frontier note. |
| 1.4 | [Classical ML essentials](../content/01-foundations/classical-ml.md) | full | learning paradigms, train, validation and test splits, bias and variance, regularization, cross-validation, metrics (precision, recall, F1, ROC-AUC, calibration), class imbalance, data leakage. |
| 1.5 | [Neural networks](../content/01-foundations/neural-networks.md) | full | perceptron to MLP, activations (ReLU, GELU, SiLU), initialization, normalization (BatchNorm, LayerNorm, RMSNorm), dropout, residual connections; CNNs, RNNs and LSTMs as history. |
| 1.6 | [Representation learning and embeddings](../content/01-foundations/representation-learning.md) | full | word2vec to contextual embeddings, contrastive learning (InfoNCE, CLIP), self-supervised learning, embedding geometry. |
| 1.7 | [Reinforcement learning primer](../content/01-foundations/rl-primer.md) | full | MDPs, policies and value functions, policy gradients, actor-critic, PPO, exploration and reward design: everything RLHF and agentic RL build on. |

### Book 2: Inside the transformer

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 2.1 | [Tokenization](../content/02-transformer/tokenization.md) | full | BPE, WordPiece, Unigram and SentencePiece, byte-level BPE, vocabulary-size trade-offs, the multilingual token tax, number and whitespace quirks, glitch tokens. |
| 2.2 | [Embeddings and position](../content/02-transformer/positional-encoding.md) | full | learned and sinusoidal positions, RoPE, ALiBi, NoPE; context extension with position interpolation, NTK-aware scaling and YaRN. |
| 2.3 | [Attention step by step](../content/02-transformer/attention.md) | full | queries, keys and values, scaled dot-product, causal masking, multi-head attention; MQA, GQA and MLA; sliding-window and sparse attention; attention sinks. |
| 2.4 | [The transformer block](../content/02-transformer/transformer-block.md) | full | the FFN and SwiGLU, the residual stream, pre-norm vs post-norm, decoder-only vs encoder-only vs encoder-decoder, counting parameters. |
| 2.5 | [Mixture of Experts](../content/02-transformer/mixture-of-experts.md) | full | routing, top-k, shared and fine-grained experts, load balancing, total vs active parameters, what MoE means for serving. |
| 2.6 | [The KV cache](../content/02-transformer/kv-cache.md) | full | what it stores, the memory formula, why it limits context and batch size, and how GQA, MLA and quantization shrink it. |
| 2.7 | [Efficient attention and long context](../content/02-transformer/long-context.md) | full | FlashAttention, ring and context-parallel attention, needle-in-a-haystack vs real long-context tasks, lost in the middle, context rot. |
| 2.8 | [Decoding and sampling](../content/02-transformer/decoding-sampling.md) | full | greedy, temperature, top-k, top-p, min-p, beam search, penalties, logprobs, logit bias, constrained decoding, sources of nondeterminism. |
| 2.9 | [Beyond the transformer](../content/02-transformer/beyond-transformers.md) | full | state-space models (the Mamba family), RWKV, hybrid attention and SSM models, linear attention, diffusion language models, tokenizer-free byte-level models. |
| 2.10 | [Mechanistic interpretability](../content/02-transformer/mech-interp.md) | full | features and superposition, sparse autoencoders and transcoders, circuits and attribution graphs, induction heads, probing, steering vectors, and what it can and cannot tell an engineer today. |

### Book 3: How LLMs are built

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 3.1 | [Pretraining data](../content/03-building-llms/pretraining-data.md) | full | web corpora, filtering and quality classifiers, deduplication, data mixtures, code and math data, synthetic pretraining data, contamination. |
| 3.2 | [Scaling laws and compute](../content/03-building-llms/scaling-laws.md) | full | Kaplan vs Chinchilla, training compute of about 6 × parameters × tokens, over-training for cheaper inference, data-constrained regimes, the emergence debate, test-time compute as a second axis. |
| 3.3 | [Distributed training](../content/03-building-llms/distributed-training.md) | full | data, tensor, pipeline, sequence and expert parallelism; FSDP and ZeRO; mixed precision (BF16, FP8, FP4); stability tricks; checkpointing; MFU. |
| 3.4 | [Mid-training](../content/03-building-llms/mid-training.md) | full | continued pretraining, annealing on high-quality data, long-context extension, domain adaptation. |
| 3.5 | [Supervised fine-tuning](../content/03-building-llms/sft.md) | full | instruction tuning, chat templates and special tokens, data quality over quantity, synthetic instruction data. |
| 3.6 | [Preference optimization](../content/03-building-llms/preference-optimization.md) | full | reward models and RLHF with PPO, DPO and its variants (IPO, KTO, ORPO, SimPO), RLAIF, Constitutional AI. |
| 3.7 | [RL with verifiable rewards and reasoning models](../content/03-building-llms/rlvr-reasoning.md) | full | RLVR, GRPO and its successors, outcome vs process rewards, distilling reasoning traces, controlling thinking length, reward hacking. |
| 3.8 | [Agentic RL and environments](../content/03-building-llms/agentic-rl.md) | full | training on multi-turn tool use, environment and reward design, rollout infrastructure, environment hubs. |
| 3.9 | [Distillation, merging and compression](../content/03-building-llms/distillation-merging.md) | full | knowledge and on-policy distillation, model merging (SLERP, TIES, DARE), pruning. |
| 3.10 | [Fine-tuning in practice](../content/03-building-llms/fine-tuning-practice.md) | full | when to fine-tune instead of prompting, RAG or long context; full fine-tuning vs PEFT (LoRA, QLoRA, DoRA); hyperparameters and data prep; tooling (Hugging Face TRL and PEFT, Unsloth, Axolotl, LLaMA-Factory, torchtune); managed and reinforcement fine-tuning APIs; evaluating a fine-tune; catastrophic forgetting. |
| 3.11 | [Safety and character training](../content/03-building-llms/safety-character-training.md) | full | refusals and over-refusal, honesty, the instruction hierarchy and system-prompt adherence, model specs and constitutions, persona. |

### Book 4: The model landscape

*Volatile, a dated snapshot.*

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 4.1 | [Frontier model families](../content/04-model-landscape/frontier-families.md) | full | Anthropic, OpenAI, Google, xAI, Meta, Mistral, DeepSeek, Qwen, Moonshot, Zhipu, MiniMax and others; open vs closed weights; licenses. |
| 4.2 | [Reasoning models and test-time compute](../content/04-model-landscape/reasoning-models.md) | full | thinking tokens, effort and budget controls, interleaved thinking with tools, when reasoning helps or hurts, parallel sampling (best-of-N, self-consistency). |
| 4.3 | [Small and local models](../content/04-model-landscape/small-local-models.md) | full | small language models, distilled and quantized models, on-device use, when small beats big. |
| 4.4 | [Specialist models](../content/04-model-landscape/specialist-models.md) | full | embeddings, rerankers, code models, guard and safety classifiers, speech, vision-language, image and video generation. |
| 4.5 | [Benchmark literacy](../content/04-model-landscape/benchmark-literacy.md) | full | what the major benchmarks measure (knowledge and reasoning, math, coding, agentic tasks, computer use, browsing, long-horizon task length, human-preference arenas, ARC-AGI); saturation; contamination; why your own evals beat leaderboards. |
| 4.6 | [Choosing a model](../content/04-model-landscape/choosing-a-model.md) | full | capability, cost, latency, context, modality, privacy and license; routing and cascades; multi-provider strategy; a decision matrix. |
| 4.7 | [Model APIs in practice](../content/04-model-landscape/model-apis.md) | full | message formats, system prompts, tool calling, streaming, structured outputs, prompt caching, batch, files and vision or PDF input, rate limits; provider differences; cloud platforms (Bedrock, Vertex AI, Azure AI Foundry). |

## Part II: Build with models

### Book 5: Prompt and context engineering

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 5.1 | [Prompting fundamentals](../content/05-prompt-and-context/prompting-fundamentals.md) | full | clarity and specificity, system prompts and roles, examples, structure with XML or Markdown, saying what to do rather than only what not to do, output control, prefill. |
| 5.2 | [Reasoning prompts](../content/05-prompt-and-context/reasoning-prompts.md) | full | chain of thought, decomposition, self-consistency, reflection and self-critique, and how prompting reasoning models differs. |
| 5.3 | [Prompt patterns and chaining](../content/05-prompt-and-context/prompt-chaining.md) | full | pipelines, routers, generator and critic, meta-prompting, templates and variables. |
| 5.4 | [Context engineering](../content/05-prompt-and-context/context-engineering.md) | full | the context window as working memory; what goes in (instructions, tools, examples, retrieved knowledge, history, memory); budgeting and ordering; context rot; compaction and compression; tool-result clearing; just-in-time retrieval; structured notes; sub-agent isolation; cache-friendly, append-only context. |
| 5.5 | [Prompt caching and token economics](../content/05-prompt-and-context/prompt-caching.md) | full | how prefix caching works, breakpoints and TTLs, designing for cache hits, the cost math. |
| 5.6 | [Structured outputs](../content/05-prompt-and-context/structured-outputs.md) | full | JSON mode vs schema-constrained decoding, function-call outputs, Pydantic and Zod, Instructor, BAML, grammar engines (Outlines, XGrammar, llguidance), validate-and-repair loops. |
| 5.7 | [Prompt optimization](../content/05-prompt-and-context/prompt-optimization.md) | full | DSPy (signatures, modules, optimizers such as MIPROv2 and GEPA), automatic prompt engineering, prompt versioning and A/B tests. |
| 5.8 | [Model-specific notes](../content/05-prompt-and-context/model-specific-notes.md) | full | conventions and known quirks for Claude, GPT, Gemini and open models, including where long documents go (dated). |

### Book 6: Retrieval and knowledge (RAG)

*RAG.*

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 6.1 | [RAG fundamentals](../content/06-retrieval-rag/rag-fundamentals.md) | full | why RAG (grounding, freshness, private data, citations); RAG vs fine-tuning vs long context vs cache-augmented generation; the canonical pipeline. |
| 6.2 | [Ingestion and parsing](../content/06-retrieval-rag/ingestion-parsing.md) | full | PDFs, HTML, Office files, tables, slides and images; OCR vs vision-model parsing; layout-aware parsers (Unstructured, Docling, LlamaParse, Marker, MinerU); metadata extraction; cleaning. |
| 6.3 | [Chunking](../content/06-retrieval-rag/chunking.md) | full | fixed, recursive, structure-aware and semantic chunking; overlap; parent-child and small-to-big; propositions; late chunking; contextual retrieval; choosing a chunk size. |
| 6.4 | [Embeddings](../content/06-retrieval-rag/embeddings.md) | full | bi-encoders, MTEB and its limits, dimensions and Matryoshka embeddings, int8 and binary quantization, multilingual and domain models, fine-tuning embedders, multi-vector models. |
| 6.5 | [Vector search](../content/06-retrieval-rag/vector-search.md) | full | exact vs approximate search; HNSW, IVF, PQ, DiskANN, ScaNN; recall, latency and memory trade-offs; filtered search; FAISS. |
| 6.6 | [Vector databases and search engines](../content/06-retrieval-rag/vector-databases.md) | full | pgvector, Pinecone, Weaviate, Qdrant, Milvus, Chroma, LanceDB, Elasticsearch and OpenSearch, Vespa, Redis, turbopuffer and others; a selection matrix. |
| 6.7 | [Lexical and hybrid retrieval](../content/06-retrieval-rag/hybrid-retrieval.md) | full | BM25, learned sparse retrieval (SPLADE), fusion (RRF, weighted), when keywords beat vectors. |
| 6.8 | [Query understanding](../content/06-retrieval-rag/query-understanding.md) | full | rewriting, expansion, HyDE, multi-query, step-back, decomposition, routing, filter extraction, conversational condensation. |
| 6.9 | [Reranking](../content/06-retrieval-rag/reranking.md) | full | cross-encoders, late interaction (ColBERT), LLM rerankers, latency budgets. |
| 6.10 | [Advanced RAG architectures](../content/06-retrieval-rag/advanced-rag.md) | full | agentic RAG, multi-hop and iterative retrieval, Self-RAG, CRAG, adaptive RAG, RAPTOR, GraphRAG, LightRAG, knowledge graphs with LLMs. |
| 6.11 | [Structured and code retrieval](../content/06-retrieval-rag/structured-code-retrieval.md) | full | text-to-SQL and semantic layers, tabular QA, code search (grep vs embeddings vs AST and repo maps), agentic search. |
| 6.12 | [Multimodal RAG](../content/06-retrieval-rag/multimodal-rag.md) | full | images, charts and slides, visual-document retrieval (ColPali-style), audio and video. |
| 6.13 | [Grounding and citations](../content/06-retrieval-rag/grounding-citations.md) | full | attribution, quote extraction, groundedness checks, hallucination mitigation. |
| 6.14 | [Evaluating RAG](../content/06-retrieval-rag/rag-evaluation.md) | full | retrieval metrics (recall@k, precision@k, MRR, nDCG, hit rate), generation metrics (faithfulness, answer relevance, context precision and recall), RAGAS-style tooling, synthetic test sets. |
| 6.15 | [Production RAG](../content/06-retrieval-rag/production-rag.md) | full | incremental indexing and deletions, permission-aware retrieval, multi-tenancy, freshness, caching, cost and latency, and a failure-modes catalog with fixes. |
| 6.16 | [Deep research systems](../content/06-retrieval-rag/deep-research.md) | full | plan, search, read, reason and synthesize loops; sub-question decomposition; source quality; long report generation. |

### Book 7: Data for AI

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 7.1 | [Data strategy](../content/07-data/data-strategy.md) | full | proprietary data as a moat, the data flywheel. |
| 7.2 | [Labeling and annotation](../content/07-data/labeling-annotation.md) | full | guidelines, inter-annotator agreement, LLM-assisted labeling, active learning. |
| 7.3 | [Synthetic data](../content/07-data/synthetic-data.md) | full | generation strategies, diversity and quality filtering, model-collapse risks, privacy. |
| 7.4 | [Data quality and governance](../content/07-data/data-governance.md) | full | deduplication, PII, licensing and provenance, datasheets, versioning (DVC, lakeFS), lineage. |
| 7.5 | [Unstructured data pipelines](../content/07-data/unstructured-pipelines.md) | full | document ETL, incremental processing, metadata enrichment, orchestration. |

### Book 8: Multimodal and generative media

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 8.1 | [Vision-language models](../content/08-multimodal/vision-language-models.md) | full | vision encoders (ViT, SigLIP), projectors vs native multimodality, image-token costs, failure modes. |
| 8.2 | [Document and screen understanding](../content/08-multimodal/document-screen-understanding.md) | full | OCR vs VLM parsing, charts and tables, GUI understanding for computer use. |
| 8.3 | [Image generation](../content/08-multimodal/image-generation.md) | full | diffusion (forward and reverse processes, latent diffusion, U-Net vs DiT, classifier-free guidance), flow matching, autoregressive and native image generation, editing and control, style LoRAs, watermarking and provenance (C2PA, SynthID). |
| 8.4 | [Video, 3D and world models](../content/08-multimodal/video-world-models.md) | full | video diffusion transformers and interactive world models (a dated landscape). |
| 8.5 | [Speech and audio](../content/08-multimodal/speech-audio.md) | full | ASR, TTS, speech-to-speech, audio codecs and tokens, voice-cloning ethics, music generation. |
| 8.6 | [Multimodal applications](../content/08-multimodal/multimodal-apps.md) | full | multimodal RAG and agents, video understanding, real-time assistants. |

## Part III: Build agents

### Book 9: Agents, core concepts

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 9.1 | [What is an agent?](../content/09-agents/what-is-an-agent.md) | full | definitions, workflows vs agents, the autonomy spectrum, when not to build one. |
| 9.2 | [The agent loop](../content/09-agents/agent-loop.md) | full | perceive, reason, act and observe; ReAct; stop conditions; step and budget limits; a minimal agent in about 50 lines. |
| 9.3 | [Tool use and tool design](../content/09-agents/agent-tools.md) | full | schemas, descriptions as prompts, tool choice, parallel calls, errors as information, idempotency and side effects, pagination and truncation, token-efficient outputs, the agent-computer interface, the many-tools problem and tool search, code as action (CodeAct) vs JSON tool calls. |
| 9.4 | [Workflow patterns](../content/09-agents/workflow-patterns.md) | full | prompt chaining, routing, parallelization (sectioning and voting), orchestrator and workers, evaluator and optimizer. |
| 9.5 | [Planning and reasoning strategies](../content/09-agents/planning-reasoning.md) | full | plan-and-execute, ReWOO, LLMCompiler, Tree and Graph of Thoughts, LATS, Reflexion, self-refine, re-planning. |
| 9.6 | [Memory](../content/09-agents/agent-memory.md) | full | working, short-term and long-term memory (episodic, semantic, procedural); write and read policies; consolidation; vector, graph and file-based memory; MemGPT/Letta, Mem0, Zep/Graphiti, LangMem; memory in provider APIs and coding agents; privacy and forgetting. |
| 9.7 | [Multi-agent systems](../content/09-agents/multi-agent.md) | full | orchestrator and subagents, hierarchies, handoffs and swarms, debate, blackboards, role-based crews; context isolation and parallelism; token multipliers; coordination failures; when multi-agent helps and when it hurts, with both sides of the debate. |
| 9.8 | [Long-running and durable agents](../content/09-agents/long-running-agents.md) | full | checkpointing, resumability, durable execution (Temporal, Restate, Inngest, DBOS), background and ambient agents, scheduling, progress files, compaction across sessions. |
| 9.9 | [Human in the loop](../content/09-agents/human-in-the-loop.md) | full | approvals, interrupts, escalation, autonomy dials, review interfaces. |
| 9.10 | [Guardrails and control](../content/09-agents/guardrails-control.md) | full | input and output checks, policy enforcement, budgets, loop detection, permissions, sandboxes, kill switches. |
| 9.11 | [Agent failure modes](../content/09-agents/agent-failure-modes.md) | full | hallucinated tools and arguments, loops, premature "done", context poisoning, distraction and confusion, goal drift, over-eagerness, error cascades; a debugging playbook. |
| 9.12 | [Agent UX](../content/09-agents/agent-ux.md) | full | streaming progress, visible plans, interruptibility, generative UI, artifacts and canvases, citations, undo, trust calibration. |

### Book 10: Agent archetypes

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 10.1 | [Coding agents](../content/10-agent-archetypes/coding-agents.md) | full | repo understanding, agentic search, edit formats (whole file, search and replace, unified diff, apply-patch), test-and-iterate loops, worktrees and parallel agents, review agents, SWE-bench-style evaluation. |
| 10.2 | [Computer-use and browser agents](../content/10-agent-archetypes/computer-use-agents.md) | full | screenshots and vision vs DOM and accessibility trees, action spaces, Playwright- and DevTools-based tools, Browser Use, Stagehand, reliability and safety, OSWorld- and WebArena-style evals. |
| 10.3 | [Research and analyst agents](../content/10-agent-archetypes/research-analyst-agents.md) | full | deep research, data-analysis agents with code execution, notebook agents. |
| 10.4 | [Voice and realtime agents](../content/10-agent-archetypes/voice-agents.md) | full | cascaded STT, LLM and TTS vs speech-to-speech; latency budgets; voice-activity detection and turn-taking; barge-in; telephony and WebRTC; LiveKit Agents, Pipecat; realtime APIs. |
| 10.5 | [Customer-support and enterprise workflow agents](../content/10-agent-archetypes/support-agents.md) | full | knowledge plus actions, policy adherence, human handoff, simulated-user evaluation. |
| 10.6 | [Personal and ambient assistants](../content/10-agent-archetypes/personal-assistants.md) | full | email, calendar and tasks, memory, proactive triggers, permissions. |
| 10.7 | [Document-processing and extraction pipelines](../content/10-agent-archetypes/document-extraction.md) | full | schema extraction, validation, human review queues. |
| 10.8 | [Embodied and robotics agents](../content/10-agent-archetypes/embodied-agents.md) | full | vision-language-action models, world models, sim-to-real (an overview). |

### Book 11: Harnesses

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 11.1 | [What “harness” means](../content/11-harnesses/what-is-a-harness.md) | full | the four meanings (agent harness or scaffold, eval harness, RL environment harness, test harness); model plus harness equals product. |
| 11.2 | [Anatomy of an agent harness](../content/11-harnesses/harness-anatomy.md) | full | system prompt, tool set, loop controller, context manager and compaction, memory files, permissions and sandbox, subagents, hooks and events, interface, telemetry. |
| 11.3 | [Case study: Claude Code](../content/11-harnesses/claude-code.md) | full | CLAUDE.md memory, slash commands, subagents and agent teams, hooks, Agent Skills, plugins and marketplaces, MCP and tool search, permission modes, sandboxing, headless use, scheduled tasks, the Claude Agent SDK. |
| 11.4 | [The coding-harness landscape](../content/11-harnesses/coding-harness-landscape.md) | full | CLI vs IDE vs cloud and background agents (Claude Code, Codex, Gemini CLI, Cursor, GitHub Copilot, Devin, Jules, Aider, Cline, Roo Code, Kilo Code, OpenHands, SWE-agent and mini-SWE-agent, Amp, Goose, OpenCode, Factory, Kiro, Windsurf and others); instruction files (AGENTS.md, CLAUDE.md, GEMINI.md, rules files); a comparison matrix. |
| 11.5 | [Skills, plugins and extension ecosystems](../content/11-harnesses/skills-plugins.md) | full | Agent Skills and the SKILL.md format, progressive disclosure, cross-agent skill tooling and directories, plugin manifests and marketplaces across harnesses, skill and plugin supply-chain security. |
| 11.6 | [Working effectively with coding agents](../content/11-harnesses/working-with-coding-agents.md) | full | spec-driven development, plan-first workflows, test-driven loops, context files, parallel agents, reviewing AI-written code, vibe coding vs agentic engineering. |
| 11.7 | [Harness engineering](../content/11-harnesses/harness-engineering.md) | full | designing tools and prompts for a specific model, ablations, why one model scores differently in different harnesses, minimal vs maximal harnesses. |
| 11.8 | [Sandboxes and execution environments](../content/11-harnesses/sandboxes.md) | full | containers, microVMs (Firecracker), gVisor, WebAssembly, OS-level sandboxing; hosted sandboxes (E2B, Modal, Daytona, Cloudflare and others); network egress, secrets and resource limits. |
| 11.9 | [Evaluation harnesses](../content/11-harnesses/eval-harnesses.md) | full | lm-evaluation-harness, Inspect, OpenAI Evals, HELM, lighteval, SWE-bench and Terminal-Bench harnesses, τ-bench, custom harnesses. |
| 11.10 | [RL environment harnesses](../content/11-harnesses/rl-environment-harnesses.md) | full | Gym-style interfaces, verifiers and environment hubs, OpenEnv, rollout frameworks (veRL, OpenRLHF, TRL, SkyRL, ART and others), reward functions. |
| 11.11 | [Build your own harness](../content/11-harnesses/build-your-own-harness.md) | full | a step-by-step reference implementation: loop, tools, context management, permissions, logging, evals. |

### Book 12: Protocols and standards

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 12.1 | [Why protocols](../content/12-protocols/why-protocols.md) | full | the N×M integration problem and the protocol map: model to tools (MCP), agent to agent (A2A), agent to interface (AG-UI, MCP Apps), editor to agent (Agent Client Protocol), agent to commerce (agentic commerce and payment protocols), instructions (AGENTS.md), packaged skills (Agent Skills), the web for agents (llms.txt, NLWeb). |
| 12.2 | [MCP architecture](../content/12-protocols/mcp-architecture.md) | full | hosts, clients and servers; JSON-RPC 2.0; the shift from a stateful initialize handshake (through 2025-11-25) to stateless requests with per-request metadata and server/discover (2026-07-28); capability and extension negotiation. |
| 12.3 | [MCP server primitives](../content/12-protocols/mcp-primitives.md) | full | tools, resources and resource templates, prompts; tool annotations; input and output schemas and structured content; resource links; completions; pagination; cacheable list results. |
| 12.4 | [MCP client features and round trips](../content/12-protocols/mcp-client-features.md) | full | multi round-trip requests that replace server-initiated requests; elicitation; deprecated roots and sampling and what replaces them; progress and cancellation; change subscriptions; the tasks extension for long-running work. |
| 12.5 | [MCP transports](../content/12-protocols/mcp-transports.md) | full | stdio and Streamable HTTP; the removal of sessions and stream resumability; required request headers; the deprecated HTTP+SSE transport; scaling stateless remote servers. |
| 12.6 | [MCP authorization](../content/12-protocols/mcp-authorization.md) | full | OAuth 2.1 with PKCE, protected-resource metadata and discovery, client registration options, issuer validation, credentials bound to their authorization server, audience-bound tokens, the token-passthrough anti-pattern, confused deputies. |
| 12.7 | [MCP security](../content/12-protocols/mcp-security.md) | full | tool poisoning, rug pulls, cross-server shadowing, injection through tool results, over-broad scopes; mitigations (allowlists, pinning, sandboxing, consent, gateways). |
| 12.8 | [MCP spec history](../content/12-protocols/mcp-spec-history.md) | full | every version from 2024-11-05 to 2026-07-28 and what changed, the feature lifecycle and deprecation policy, how to follow proposals (SEPs). |
| 12.9 | [Building MCP servers](../content/12-protocols/building-mcp-servers.md) | full | official SDKs (TypeScript, Python and FastMCP, others), tool design for agents, testing with MCP Inspector, packaging and distribution, deploying remote servers, migrating to the stateless spec, registries. |
| 12.10 | [MCP server types and catalog](../content/12-protocols/mcp-server-catalog.md) | full | by transport (local stdio vs remote HTTP); by role (knowledge and data, actions and integrations, compute and sandboxes, browsers, memory, and meta servers such as gateways, aggregators and proxies); by trust (vendor-official vs community); plus a categorized catalog: filesystems, version control, databases, search and web fetch, browser automation, docs and knowledge, productivity and communication, project management, cloud and infrastructure, observability, payments and finance, design, data and analytics, memory, security, media. |
| 12.11 | [MCP at scale](../content/12-protocols/mcp-at-scale.md) | full | gateways, registries and discovery, enterprise allowlists, the too-many-tools problem, tool search and deferred loading, code execution against MCP tools, interactive UI extensions (MCP Apps), trace propagation, deterministic tool order for prompt-cache hits. |
| 12.12 | [Agent2Agent (A2A)](../content/12-protocols/a2a.md) | full | agent cards and discovery, tasks and their lifecycle, messages, parts and artifacts, streaming and push notifications, auth, the 1.0 release; A2A and MCP as complements, not rivals. |
| 12.13 | [The rest of the alphabet soup](../content/12-protocols/protocol-soup.md) | full | AG-UI, the Agent Client Protocol, app platforms inside chat assistants, agentic commerce and payment protocols, AGENTS.md, Agent Skills, llms.txt, OpenAPI as a tool source, agent identity and auth; a cheat sheet for naming collisions (the many "ACP"s). |
| 12.14 | [Governance and ecosystem](../content/12-protocols/protocol-governance.md) | full | who stewards MCP, A2A, AGENTS.md and Agent Skills today, working groups, and how standards evolve (dated, verify). |

### Book 13: Frameworks and SDKs

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 13.1 | [The landscape map](../content/13-frameworks/framework-landscape.md) | full | provider SDKs, agent SDKs, orchestration frameworks, low-code builders and platforms; build vs buy; "start with plain API calls". |
| 13.2 | [Provider and agent SDKs](../content/13-frameworks/provider-agent-sdks.md) | full | the Anthropic SDK and Claude Agent SDK, the OpenAI SDK and Agents SDK, the Google Gen AI SDK and ADK, Microsoft Agent Framework, AWS Strands Agents and Bedrock AgentCore, the Vercel AI SDK. |
| 13.3 | [Orchestration frameworks](../content/13-frameworks/orchestration-frameworks.md) | full | LangChain and LangGraph, LlamaIndex, Haystack, CrewAI, AutoGen and AG2, Semantic Kernel, PydanticAI, smolagents, Agno, Mastra, DSPy, Letta, CAMEL. |
| 13.4 | [Low-code and visual builders](../content/13-frameworks/low-code-builders.md) | full | n8n, Dify, Flowise, Langflow, OpenAI's Agent Builder, Zapier and Make, Copilot Studio and others. |
| 13.5 | [Gateways and routers](../content/13-frameworks/gateways-routers.md) | full | LiteLLM, OpenRouter, Portkey, cloud AI gateways; failover, unified APIs, spend controls. |
| 13.6 | [Selection guide and matrix](../content/13-frameworks/framework-selection.md) | full | language, abstraction level, multi-agent support, durability, observability, MCP and A2A support, maturity, lock-in. |
| 13.7 | [Framework anti-patterns](../content/13-frameworks/framework-anti-patterns.md) | full | over-abstraction, hidden prompts, opaque debugging, version churn. |

## Part IV: Ship, measure, protect

### Book 14: Evaluation

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 14.1 | [Why evals are the core skill](../content/14-evaluation/why-evals.md) | full | evals as specs, eval-driven development, the flywheel. |
| 14.2 | [Error analysis first](../content/14-evaluation/error-analysis.md) | full | reading traces, open and axial coding, failure taxonomies, prioritizing fixes. |
| 14.3 | [Building eval datasets](../content/14-evaluation/eval-datasets.md) | full | golden sets, production sampling, dimension-based synthetic data, adversarial cases, versioning, how many examples you need. |
| 14.4 | [Metrics and graders](../content/14-evaluation/metrics-graders.md) | full | code assertions, exact match and F1, similarity metrics and their limits, pass@k vs pass^k, human evaluation and agreement. |
| 14.5 | [LLM-as-judge done right](../content/14-evaluation/llm-as-judge.md) | full | rubrics, binary vs scaled scores, pairwise vs pointwise, position, verbosity and self-preference bias, calibration against humans, judge drift. |
| 14.6 | [Evaluating agents](../content/14-evaluation/evaluating-agents.md) | full | outcome vs trajectory, tool-call accuracy, simulated users, environment-based evals, cost, steps and latency, reliability across runs, transcript review. |
| 14.7 | [Task-specific recipes](../content/14-evaluation/eval-recipes.md) | full | RAG, chat, extraction, classification, summarization, code generation. |
| 14.8 | [Safety and red-team evals](../content/14-evaluation/safety-evals.md) | full | jailbreak and injection suites, harmful-content evals, over-refusal. |
| 14.9 | [Online evaluation](../content/14-evaluation/online-evaluation.md) | full | A/B tests, guardrail metrics, explicit and implicit feedback, canaries, drift monitoring. |
| 14.10 | [Statistics for evals](../content/14-evaluation/eval-statistics.md) | full | variance, confidence intervals, significance, sample sizes, nondeterminism, multiple comparisons. |
| 14.11 | [Eval and observability tooling map](../content/14-evaluation/eval-tooling.md) | full | Inspect, promptfoo, DeepEval, RAGAS, OpenAI Evals, Braintrust, LangSmith, Langfuse, Arize Phoenix, W&B Weave, Opik and others (dated). |

### Book 15: Inference and performance

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 15.1 | [Inference fundamentals](../content/15-inference/inference-fundamentals.md) | full | prefill vs decode, memory-bound decoding, arithmetic intensity, roofline intuition. |
| 15.2 | [Latency and throughput](../content/15-inference/latency-throughput.md) | full | time to first token, time per output token, tokens per second, throughput vs latency, goodput, SLOs, tail latency. |
| 15.3 | [Memory math](../content/15-inference/memory-math.md) | full | weights, KV cache and activations, with worked VRAM examples. |
| 15.4 | [Batching and scheduling](../content/15-inference/batching-scheduling.md) | full | continuous batching, PagedAttention, chunked prefill, prefix caching (RadixAttention), scheduling policies. |
| 15.5 | [Speculative decoding](../content/15-inference/speculative-decoding.md) | full | draft models, Medusa, the EAGLE family, n-gram and lookahead decoding, multi-token prediction. |
| 15.6 | [Quantization](../content/15-inference/quantization.md) | full | PTQ vs QAT, INT8 and INT4, GPTQ, AWQ, SmoothQuant, GGUF and k-quants, FP8, MXFP4 and NVFP4, KV-cache quantization, quality impact. |
| 15.7 | [Parallelism and disaggregated serving](../content/15-inference/disaggregated-serving.md) | full | tensor, pipeline and expert parallelism; prefill and decode disaggregation; KV-cache transfer and offloading. |
| 15.8 | [Serving engines](../content/15-inference/serving-engines.md) | full | vLLM, SGLang, TensorRT-LLM, llama.cpp, Ollama, LM Studio, MLX, LMDeploy and others; a selection guide. |
| 15.9 | [Hardware](../content/15-inference/hardware.md) | full | what matters (memory capacity and bandwidth, FLOPs per precision, interconnect); GPU generations; AMD; TPUs; Trainium and Inferentia; inference ASICs such as Groq and Cerebras; Apple silicon; NPUs (dated). |
| 15.10 | [Cost engineering](../content/15-inference/cost-engineering.md) | full | API pricing anatomy (input, output, cached and reasoning tokens), batch discounts, self-hosting break-even, utilization, routing and cascades, semantic caching. |
| 15.11 | [Edge and on-device AI](../content/15-inference/edge-on-device.md) | full | ONNX Runtime, Core ML, ExecuTorch, WebGPU and WebLLM, mobile constraints, the privacy upside. |

### Book 16: LLMOps and production

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 16.1 | [Reference architecture](../content/16-llmops/reference-architecture.md) | full | gateway, orchestration, retrieval and tools, models, evals and observability; sync vs async; queues. |
| 16.2 | [Reliability engineering](../content/16-llmops/reliability-engineering.md) | full | timeouts, retries with backoff and jitter, rate limits, provider failover, circuit breakers, idempotency keys, graceful degradation. |
| 16.3 | [Streaming](../content/16-llmops/streaming.md) | full | SSE, WebSockets, partial JSON, streaming tool calls, cancellation. |
| 16.4 | [Observability and tracing](../content/16-llmops/observability-tracing.md) | full | what to log, spans for agent steps, OpenTelemetry GenAI conventions, OpenInference, PII-safe logging, dashboards. |
| 16.5 | [Prompt and config management](../content/16-llmops/prompt-config-management.md) | full | versioning, registries, environments, feature flags, rollbacks. |
| 16.6 | [CI/CD for AI](../content/16-llmops/ci-cd-for-ai.md) | full | eval gates, regression suites, a model-upgrade playbook, canaries and shadow mode. |
| 16.7 | [Cost and capacity](../content/16-llmops/cost-capacity.md) | full | per-user and per-feature budgets, quotas, forecasting, caching, batch jobs. |
| 16.8 | [The data flywheel](../content/16-llmops/data-flywheel.md) | full | capturing feedback, curation, labeling, closing the loop. |
| 16.9 | [Enterprise readiness](../content/16-llmops/enterprise-readiness.md) | full | data residency, retention and zero data retention, compliance (SOC 2, ISO 27001 and 42001, HIPAA, GDPR), SSO, audit logs, multi-tenancy, vendor risk. |
| 16.10 | [Incidents and on-call](../content/16-llmops/incidents-on-call.md) | full | model regressions, provider outages, injection incidents, runbooks, postmortems. |

### Book 17: Security, safety and alignment

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 17.1 | [Threat modeling LLM apps and agents](../content/17-security-safety/threat-modeling.md) | full | attack surfaces, the OWASP Top 10 for LLM applications and its agentic counterpart, MITRE ATLAS. |
| 17.2 | [Prompt injection](../content/17-security-safety/prompt-injection.md) | full | direct vs indirect; through documents, web pages, tool results and images; why it is unsolved; the "lethal trifecta"; exfiltration channels. |
| 17.3 | [Secure agent design](../content/17-security-safety/secure-agent-design.md) | full | least privilege, sandboxing, egress control, approvals, dual-LLM and capability-based designs such as CaMeL, spotlighting, guard models and guardrail frameworks, output filtering, taint tracking, defense in depth. |
| 17.4 | [Jailbreaks and misuse](../content/17-security-safety/jailbreaks-misuse.md) | full | technique families (role-play, many-shot, encoding, multi-turn escalation), classifier defenses, abuse monitoring. |
| 17.5 | [Supply chain and model security](../content/17-security-safety/supply-chain-security.md) | full | unsafe model files, poisoned data and backdoors, MCP server, skill and plugin supply chains, hallucinated-package attacks, provenance and signing. |
| 17.6 | [Privacy](../content/17-security-safety/privacy.md) | full | PII detection and redaction, data minimization, memorization and extraction, differential-privacy basics, retention. |
| 17.7 | [Red teaming](../content/17-security-safety/red-teaming.md) | full | manual and automated (PyRIT, garak, promptfoo), attack libraries, bug bounties. |
| 17.8 | [Alignment concepts](../content/17-security-safety/alignment-concepts.md) | full | outer and inner alignment, specification gaming and reward hacking, sycophancy, deception and scheming evaluations, sandbagging, situational awareness, scalable oversight (debate, weak-to-strong), AI control, corrigibility, interpretability for safety. |
| 17.9 | [Frontier safety frameworks](../content/17-security-safety/frontier-safety-frameworks.md) | full | responsible-scaling-style policies, capability thresholds, dangerous-capability evals (CBRN, cyber, autonomy), how to read a system card. |
| 17.10 | [Governance, regulation and law](../content/17-security-safety/governance-regulation.md) | full | the EU AI Act, US federal and state rules, the UK, China; NIST AI RMF and ISO/IEC 42001; copyright and training-data litigation (dated, balanced, not legal advice). |
| 17.11 | [Responsible AI in practice](../content/17-security-safety/responsible-ai.md) | full | bias and fairness testing, transparency, model and system cards, accessibility, human oversight. |

### Book 18: System design and case studies

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 18.1 | [The AI system design method](../content/18-system-design/system-design-method.md) | full | requirements, decomposition, model choice, context and retrieval, tools, orchestration, evals, guardrails, observability, cost, rollout. |
| 18.2 | [Reference architectures](../content/18-system-design/reference-architectures.md) | full | at least 12 blueprints, each with a diagram, components, an eval plan, a cost sketch and pitfalls: enterprise knowledge assistant, support agent, coding agent, deep-research agent, text-to-SQL analyst, document-extraction pipeline, voice receptionist, browser-automation agent, multi-agent research system, personal assistant with memory, AI search engine, moderation pipeline. |
| 18.3 | [Back-of-the-envelope estimation](../content/18-system-design/back-of-envelope.md) | full | tokens, latency, cost per request, and QPS to GPU counts, with worked examples. |
| 18.4 | [Decision guides](../content/18-system-design/decision-guides.md) | full | prompt vs RAG vs fine-tune vs long context, workflow vs agent, single vs multi-agent, build vs buy, API vs self-hosting. |
| 18.5 | [Lessons from public engineering write-ups](../content/18-system-design/public-writeups.md) | full | only real, well-known write-ups, summarized as lessons with no invented numbers. |
| 18.6 | [AI product and UX](../content/18-system-design/ai-product-ux.md) | full | designing for probabilistic systems, setting expectations, latency perception, confidence and citations, feedback loops, failure UX. |
| 18.7 | [The anti-patterns hall of shame](../content/18-system-design/anti-patterns.md) | full | no evals, mega-prompts, premature multi-agent, framework lock-in, no tracing, ignoring cost, trusting tool output, unbounded loops. |

## Part V: Frontier and reference

### Book 19: The frontier

*Volatile, reviewed often.*

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 19.1 | [State-of-the-art snapshot](../content/19-frontier/sota-snapshot.md) | full | what is true as of the review date, and what changed in the last 6 to 12 months. |
| 19.2 | [Reasoning and test-time scaling](../content/19-frontier/test-time-scaling.md) | full | where the gains come from and where they stop. |
| 19.3 | [Long-horizon autonomy](../content/19-frontier/long-horizon-autonomy.md) | full | task-length trends, reliability, continual learning, memory. |
| 19.4 | [Self-improving and automated research systems](../content/19-frontier/self-improving-systems.md) | full | evolutionary coding agents, AI scientists, automated ML engineering. |
| 19.5 | [New architectures and efficiency](../content/19-frontier/new-architectures.md) | full | hybrids, diffusion language models, latent reasoning, sparse attention, tokenizer-free models. |
| 19.6 | [The open-weight frontier](../content/19-frontier/open-weight-frontier.md) | full | who leads, how close open models are, and what that means. |
| 19.7 | [AI for science, math and code](../content/19-frontier/ai-for-science.md) | full | protein structure, materials, formal math and theorem proving, competition results. |
| 19.8 | [Open problems and big debates](../content/19-frontier/open-problems.md) | full | scaling limits, data walls, reasoning vs memorization, benchmark validity, economic impact, timelines and safety, with every side presented fairly. |
| 19.9 | [Watchlist](../content/19-frontier/watchlist.md) | full | labs, conferences, arXiv categories, leaderboards, newsletters and podcasts, as starting points. |

### Book 20: Reference and career

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 20.1 | [Glossary](../content/20-reference-career/lexicon-guide.md) | full | the glossary (see the Lexicon feature). |
| 20.2 | [Acronym decoder](../content/20-reference-career/acronym-decoder.md) | full | every acronym in the Bible, expanded and linked. |
| 20.3 | [Numbers every AI engineer should know](../content/20-reference-career/numbers-to-know.md) | full | characters and words per token, bytes per parameter by precision, FLOPs per token for training and inference, the KV-cache formula, typical latency ranges, context and embedding sizes, cost orders of magnitude; each flagged as a rule of thumb. |
| 20.4 | [Cheat sheets](../content/20-reference-career/commandments-guide.md) | full | the cheat sheets (see features). |
| 20.5 | [The Canon](../content/20-reference-career/the-canon.md) | full | 50 or more must-know papers in chronological order, each with a one-line "why it matters", plus essential essays, posts and books. |
| 20.6 | [Who’s who and where to learn](../content/20-reference-career/whos-who.md) | full | labs, research groups, educators, courses and communities. |
| 20.7 | [Talking shop](../content/20-reference-career/talking-shop.md) | full | how experts frame problems, 50 hard questions with strong answers, hot takes with counterarguments, and the red flags of shallow knowledge. |
| 20.8 | [Interview prep](../content/20-reference-career/interview-prep.md) | full | fundamentals, system design, LLM-API coding, evals and debugging scenarios, with model answers. |
| 20.9 | [Learning paths and the project ladder](../content/20-reference-career/project-ladder.md) | full | the paths (see features) plus a ladder of portfolio projects, from "chat with a PDF" to a multi-agent system with evals and observability. |
| 20.10 | [Changelog and how to extend](../content/20-reference-career/changelog-extend.md) | full | see section 11. |

## Part VI: In practice

Playbooks and field notes are not planned in advance: every real use case, deployment or postmortem that follows the rulebook is welcome, so these books have no planned rows. Each starts with a page that explains what belongs there and how to contribute.

### Book 21: Playbooks

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 21.1 | [About playbooks](../content/21-playbooks/about-playbooks.md) | seed | what a playbook is, what belongs here and what does not, how to add one with or without a coding agent, and how playbooks are reviewed |

### Book 22: Field notes

| # | Chapter | Status | Must cover |
|---|---|---|---|
| 22.1 | [About field notes](../content/22-field-notes/about-field-notes.md) | seed | what a field note is, what belongs here and what does not, how to add one, and how field notes are reviewed |
