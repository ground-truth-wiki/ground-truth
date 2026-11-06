## 1. Mission

Build me "The AI Engineer's Bible": the most complete, accurate and enjoyable single resource for becoming a state-of-the-art AI engineer. That means someone who can design, build, evaluate, secure and run world-class AI systems, and who can talk shop with any researcher or senior engineer without hiding.

Work as a principal AI engineer, a researcher who has read the papers, a gifted teacher and a senior front-end engineer with an editor's eye.

The Bible must do three jobs at once:

- A course: readable front to back, with learning paths, quizzes and progress tracking.
- A reference: anything findable in seconds through search, the glossary, cheat sheets and cross-links.
- A joy: beautifully designed and playful, with interactive playgrounds and small rewards that make me come back.

It must be built to grow. I will extend it for years as new research, tools and protocols appear, so content stays separate from code and every fact that can go stale carries a date.

Don't stop to ask me questions. Make sensible decisions and list them in your final report.

## 2. Deliverable and architecture

Deliver one self-contained HTML file, an interactive single-page web app, and publish it as an artifact. Do not use a document, slide or design type: one HTML page lets later sessions read, edit and republish the whole Bible.

Separate content from the engine:

- Engine: one style block and one main script for layout, hash routing, Markdown rendering, search, glossary popovers, progress and every interactive tool.
- Chapters: each chapter is its own block of plain Markdown inside a script tag of type "text/markdown". Its attributes are data-id (stable, lowercase, hyphenated, used for deep links, such as "mcp-transports"), data-book, data-order (such as "12.5"), data-title, data-level (foundation, practitioner, expert or frontier), data-stability (evergreen, moving or volatile), data-reviewed (YYYY-MM), data-status (seed or full) and data-tags.
- Structured data: separate script blocks of type "application/json", each with a clear id, for the glossary, timeline, quizzes, learning paths, comparison matrices, cheat sheets, playground presets, changelog and id aliases.
- Anchors: each Book's chapters sit in order between comments such as "BOOK 12 START" and "BOOK 12 END", so later sessions can insert content with exact text edits.
- Escaping: escape any literal closing script tag inside Markdown.

Runtime: follow your environment's rules for published pages. That means allowed CDNs with exact pinned versions, no remote images, inlined CSS, Google Fonts with fallback stacks, guarded localStorage, plain "#chapter-id" hash routes, a responsive layout, and light and dark themes.

- Markdown: a pinned Markdown library.
- Code: syntax highlighting that needs no external stylesheet, with its theme inlined.
- Math: an approach that needs no external fonts or CSS, such as MathJax with SVG output.
- Diagrams: Mermaid that also renders in content inserted after page load, or inline SVG.
- Speed: stay fast with 200 or more chapters by rendering chapters on demand and building the search index once.

## 3. How to build it

This is too big for a single write, so ship in increments within this one turn.

1. Plan briefly. Use the map in section 4; you may merge or split chapters if that improves the structure, but drop no topic. Pick this run's flagship chapters from section 5.
2. Build the engine first, with every feature and visual component wired to the data blocks, and test it with a few sample chapters and their visuals.
3. Write content in waves, one Book per step, appending inside that Book's anchors. By the end of this run every chapter in the map exists, at least as a seed. Flagships get the full template.
4. Publish a checkpoint once the engine and the first Books are in. Keep going, then publish again to the same artifact at the end.
5. Before the final publish, run an automated check in your container. Every JSON block must parse, chapter ids must be unique, and every internal link, path step, quiz and timeline reference must point to an existing id. Every glossary popover term must exist, every visual spec must parse and name a known component, calculator tests must pass, and no closing script tag may sit unescaped in Markdown. Fix whatever fails.
6. End with a short report: what this version holds, the counts (full and seed chapters, glossary terms, timeline events, quiz questions), the decisions you made, and exactly what I should say next.

If budget runs short, protect in this order:

1. A working, bug-free engine with navigation and search.
2. The complete map, with every chapter present at least as a seed.
3. The flagship chapters in full.
4. The glossary and quizzes.
5. Everything else.

Never publish a broken page.

## 4. Coverage map, Part I: Understand the machine

Group the 21 Books into five Parts in the navigation, with Book 0 first. The topics after each chapter title are what it must cover. Named tools and products are examples, not limits.

### Book 0: Start here

- 0.1 What an AI engineer is — how the role differs from ML engineer, research scientist and data scientist; the skills map; what "state of the art" means in practice.
- 0.2 The AI engineering stack — one diagram from silicon to product: hardware, models, inference, context and retrieval, tools and protocols, agents and harnesses, evals and observability, product and UX.
- 0.3 Mental models that matter — next-token predictors that learned to reason over context; context is everything; workflows vs agents; evals before vibes; the bitter lesson; the cost, latency and quality triangle.
- 0.4 How to use this Bible — levels, stability badges, learning paths, search, and how to stay current.

### Book 1: Foundations, math and machine learning

- 1.1 Linear algebra for AI — vectors and matrices, matrix multiplication as the core operation, dot product and cosine similarity, norms, projections, eigenvectors, SVD and low-rank structure (why LoRA works).
- 1.2 Probability, statistics and information theory — distributions, Bayes, expectation and variance, sampling, entropy, cross-entropy, KL divergence, perplexity, maximum likelihood.
- 1.3 Calculus and optimization — gradients, the chain rule, backpropagation and autograd, SGD, momentum, Adam and AdamW, learning-rate schedules and warmup, weight decay, gradient clipping, newer optimizers as a frontier note.
- 1.4 Classical ML essentials — learning paradigms, train, validation and test splits, bias and variance, regularization, cross-validation, metrics (precision, recall, F1, ROC-AUC, calibration), class imbalance, data leakage.
- 1.5 Neural networks — perceptron to MLP, activations (ReLU, GELU, SiLU), initialization, normalization (BatchNorm, LayerNorm, RMSNorm), dropout, residual connections; CNNs, RNNs and LSTMs as history.
- 1.6 Representation learning and embeddings — word2vec to contextual embeddings, contrastive learning (InfoNCE, CLIP), self-supervised learning, embedding geometry.
- 1.7 Reinforcement learning primer — MDPs, policies and value functions, policy gradients, actor-critic, PPO, exploration and reward design: everything RLHF and agentic RL build on.

### Book 2: Inside the transformer

- 2.1 Tokenization — BPE, WordPiece, Unigram and SentencePiece, byte-level BPE, vocabulary-size trade-offs, the multilingual token tax, number and whitespace quirks, glitch tokens.
- 2.2 Embeddings and position — learned and sinusoidal positions, RoPE, ALiBi, NoPE; context extension with position interpolation, NTK-aware scaling and YaRN.
- 2.3 Attention step by step — queries, keys and values, scaled dot-product, causal masking, multi-head attention; MQA, GQA and MLA; sliding-window and sparse attention; attention sinks.
- 2.4 The transformer block — the FFN and SwiGLU, the residual stream, pre-norm vs post-norm, decoder-only vs encoder-only vs encoder-decoder, counting parameters.
- 2.5 Mixture of Experts — routing, top-k, shared and fine-grained experts, load balancing, total vs active parameters, what MoE means for serving.
- 2.6 The KV cache — what it stores, the memory formula, why it limits context and batch size, and how GQA, MLA and quantization shrink it.
- 2.7 Efficient attention and long context — FlashAttention, ring and context-parallel attention, needle-in-a-haystack vs real long-context tasks, lost in the middle, context rot.
- 2.8 Decoding and sampling — greedy, temperature, top-k, top-p, min-p, beam search, penalties, logprobs, logit bias, constrained decoding, sources of nondeterminism.
- 2.9 Beyond the transformer — state-space models (the Mamba family), RWKV, hybrid attention and SSM models, linear attention, diffusion language models, tokenizer-free byte-level models.
- 2.10 Mechanistic interpretability — features and superposition, sparse autoencoders and transcoders, circuits and attribution graphs, induction heads, probing, steering vectors, and what it can and cannot tell an engineer today.

### Book 3: How LLMs are built

- 3.1 Pretraining data — web corpora, filtering and quality classifiers, deduplication, data mixtures, code and math data, synthetic pretraining data, contamination.
- 3.2 Scaling laws and compute — Kaplan vs Chinchilla, training compute of about 6 × parameters × tokens, over-training for cheaper inference, data-constrained regimes, the emergence debate, test-time compute as a second axis.
- 3.3 Distributed training — data, tensor, pipeline, sequence and expert parallelism; FSDP and ZeRO; mixed precision (BF16, FP8, FP4); stability tricks; checkpointing; MFU.
- 3.4 Mid-training — continued pretraining, annealing on high-quality data, long-context extension, domain adaptation.
- 3.5 Supervised fine-tuning — instruction tuning, chat templates and special tokens, data quality over quantity, synthetic instruction data.
- 3.6 Preference optimization — reward models and RLHF with PPO, DPO and its variants (IPO, KTO, ORPO, SimPO), RLAIF, Constitutional AI.
- 3.7 RL with verifiable rewards and reasoning models — RLVR, GRPO and its successors, outcome vs process rewards, distilling reasoning traces, controlling thinking length, reward hacking.
- 3.8 Agentic RL and environments — training on multi-turn tool use, environment and reward design, rollout infrastructure, environment hubs.
- 3.9 Distillation, merging and compression — knowledge and on-policy distillation, model merging (SLERP, TIES, DARE), pruning.
- 3.10 Fine-tuning in practice — when to fine-tune instead of prompting, RAG or long context; full fine-tuning vs PEFT (LoRA, QLoRA, DoRA); hyperparameters and data prep; tooling (Hugging Face TRL and PEFT, Unsloth, Axolotl, LLaMA-Factory, torchtune); managed and reinforcement fine-tuning APIs; evaluating a fine-tune; catastrophic forgetting.
- 3.11 Safety and character training — refusals and over-refusal, honesty, the instruction hierarchy and system-prompt adherence, model specs and constitutions, persona.

### Book 4: The model landscape (volatile, a dated snapshot)

- 4.1 Frontier model families — Anthropic, OpenAI, Google, xAI, Meta, Mistral, DeepSeek, Qwen, Moonshot, Zhipu, MiniMax and others; open vs closed weights; licenses.
- 4.2 Reasoning models and test-time compute — thinking tokens, effort and budget controls, interleaved thinking with tools, when reasoning helps or hurts, parallel sampling (best-of-N, self-consistency).
- 4.3 Small and local models — small language models, distilled and quantized models, on-device use, when small beats big.
- 4.4 Specialist models — embeddings, rerankers, code models, guard and safety classifiers, speech, vision-language, image and video generation.
- 4.5 Benchmark literacy — what the major benchmarks measure (knowledge and reasoning, math, coding, agentic tasks, computer use, browsing, long-horizon task length, human-preference arenas, ARC-AGI); saturation; contamination; why your own evals beat leaderboards.
- 4.6 Choosing a model — capability, cost, latency, context, modality, privacy and license; routing and cascades; multi-provider strategy; a decision matrix.
- 4.7 Model APIs in practice — message formats, system prompts, tool calling, streaming, structured outputs, prompt caching, batch, files and vision or PDF input, rate limits; provider differences; cloud platforms (Bedrock, Vertex AI, Azure AI Foundry).

## 4. Coverage map, Part II: Build with models

### Book 5: Prompt and context engineering

- 5.1 Prompting fundamentals — clarity and specificity, system prompts and roles, examples, structure with XML or Markdown, saying what to do rather than only what not to do, output control, prefill.
- 5.2 Reasoning prompts — chain of thought, decomposition, self-consistency, reflection and self-critique, and how prompting reasoning models differs.
- 5.3 Prompt patterns and chaining — pipelines, routers, generator and critic, meta-prompting, templates and variables.
- 5.4 Context engineering — the context window as working memory; what goes in (instructions, tools, examples, retrieved knowledge, history, memory); budgeting and ordering; context rot; compaction and compression; tool-result clearing; just-in-time retrieval; structured notes; sub-agent isolation; cache-friendly, append-only context.
- 5.5 Prompt caching and token economics — how prefix caching works, breakpoints and TTLs, designing for cache hits, the cost math.
- 5.6 Structured outputs — JSON mode vs schema-constrained decoding, function-call outputs, Pydantic and Zod, Instructor, BAML, grammar engines (Outlines, XGrammar, llguidance), validate-and-repair loops.
- 5.7 Prompt optimization — DSPy (signatures, modules, optimizers such as MIPROv2 and GEPA), automatic prompt engineering, prompt versioning and A/B tests.
- 5.8 Model-specific notes — conventions and known quirks for Claude, GPT, Gemini and open models, including where long documents go (dated).

### Book 6: Retrieval and knowledge (RAG)

- 6.1 RAG fundamentals — why RAG (grounding, freshness, private data, citations); RAG vs fine-tuning vs long context vs cache-augmented generation; the canonical pipeline.
- 6.2 Ingestion and parsing — PDFs, HTML, Office files, tables, slides and images; OCR vs vision-model parsing; layout-aware parsers (Unstructured, Docling, LlamaParse, Marker, MinerU); metadata extraction; cleaning.
- 6.3 Chunking — fixed, recursive, structure-aware and semantic chunking; overlap; parent-child and small-to-big; propositions; late chunking; contextual retrieval; choosing a chunk size.
- 6.4 Embeddings — bi-encoders, MTEB and its limits, dimensions and Matryoshka embeddings, int8 and binary quantization, multilingual and domain models, fine-tuning embedders, multi-vector models.
- 6.5 Vector search — exact vs approximate search; HNSW, IVF, PQ, DiskANN, ScaNN; recall, latency and memory trade-offs; filtered search; FAISS.
- 6.6 Vector databases and search engines — pgvector, Pinecone, Weaviate, Qdrant, Milvus, Chroma, LanceDB, Elasticsearch and OpenSearch, Vespa, Redis, turbopuffer and others; a selection matrix.
- 6.7 Lexical and hybrid retrieval — BM25, learned sparse retrieval (SPLADE), fusion (RRF, weighted), when keywords beat vectors.
- 6.8 Query understanding — rewriting, expansion, HyDE, multi-query, step-back, decomposition, routing, filter extraction, conversational condensation.
- 6.9 Reranking — cross-encoders, late interaction (ColBERT), LLM rerankers, latency budgets.
- 6.10 Advanced RAG architectures — agentic RAG, multi-hop and iterative retrieval, Self-RAG, CRAG, adaptive RAG, RAPTOR, GraphRAG, LightRAG, knowledge graphs with LLMs.
- 6.11 Structured and code retrieval — text-to-SQL and semantic layers, tabular QA, code search (grep vs embeddings vs AST and repo maps), agentic search.
- 6.12 Multimodal RAG — images, charts and slides, visual-document retrieval (ColPali-style), audio and video.
- 6.13 Grounding and citations — attribution, quote extraction, groundedness checks, hallucination mitigation.
- 6.14 Evaluating RAG — retrieval metrics (recall@k, precision@k, MRR, nDCG, hit rate), generation metrics (faithfulness, answer relevance, context precision and recall), RAGAS-style tooling, synthetic test sets.
- 6.15 Production RAG — incremental indexing and deletions, permission-aware retrieval, multi-tenancy, freshness, caching, cost and latency, and a failure-modes catalog with fixes.
- 6.16 Deep research systems — plan, search, read, reason and synthesize loops; sub-question decomposition; source quality; long report generation.

### Book 7: Data for AI

- 7.1 Data strategy — proprietary data as a moat, the data flywheel.
- 7.2 Labeling and annotation — guidelines, inter-annotator agreement, LLM-assisted labeling, active learning.
- 7.3 Synthetic data — generation strategies, diversity and quality filtering, model-collapse risks, privacy.
- 7.4 Data quality and governance — deduplication, PII, licensing and provenance, datasheets, versioning (DVC, lakeFS), lineage.
- 7.5 Unstructured data pipelines — document ETL, incremental processing, metadata enrichment, orchestration.

### Book 8: Multimodal and generative media

- 8.1 Vision-language models — vision encoders (ViT, SigLIP), projectors vs native multimodality, image-token costs, failure modes.
- 8.2 Document and screen understanding — OCR vs VLM parsing, charts and tables, GUI understanding for computer use.
- 8.3 Image generation — diffusion (forward and reverse processes, latent diffusion, U-Net vs DiT, classifier-free guidance), flow matching, autoregressive and native image generation, editing and control, style LoRAs, watermarking and provenance (C2PA, SynthID).
- 8.4 Video, 3D and world models — video diffusion transformers and interactive world models (a dated landscape).
- 8.5 Speech and audio — ASR, TTS, speech-to-speech, audio codecs and tokens, voice-cloning ethics, music generation.
- 8.6 Multimodal applications — multimodal RAG and agents, video understanding, real-time assistants.

## 4. Coverage map, Part III: Build agents

### Book 9: Agents, core concepts

- 9.1 What is an agent? — definitions, workflows vs agents, the autonomy spectrum, when not to build one.
- 9.2 The agent loop — perceive, reason, act and observe; ReAct; stop conditions; step and budget limits; a minimal agent in about 50 lines.
- 9.3 Tool use and tool design — schemas, descriptions as prompts, tool choice, parallel calls, errors as information, idempotency and side effects, pagination and truncation, token-efficient outputs, the agent-computer interface, the many-tools problem and tool search, code as action (CodeAct) vs JSON tool calls.
- 9.4 Workflow patterns — prompt chaining, routing, parallelization (sectioning and voting), orchestrator and workers, evaluator and optimizer.
- 9.5 Planning and reasoning strategies — plan-and-execute, ReWOO, LLMCompiler, Tree and Graph of Thoughts, LATS, Reflexion, self-refine, re-planning.
- 9.6 Memory — working, short-term and long-term memory (episodic, semantic, procedural); write and read policies; consolidation; vector, graph and file-based memory; MemGPT/Letta, Mem0, Zep/Graphiti, LangMem; memory in provider APIs and coding agents; privacy and forgetting.
- 9.7 Multi-agent systems — orchestrator and subagents, hierarchies, handoffs and swarms, debate, blackboards, role-based crews; context isolation and parallelism; token multipliers; coordination failures; when multi-agent helps and when it hurts, with both sides of the debate.
- 9.8 Long-running and durable agents — checkpointing, resumability, durable execution (Temporal, Restate, Inngest, DBOS), background and ambient agents, scheduling, progress files, compaction across sessions.
- 9.9 Human in the loop — approvals, interrupts, escalation, autonomy dials, review interfaces.
- 9.10 Guardrails and control — input and output checks, policy enforcement, budgets, loop detection, permissions, sandboxes, kill switches.
- 9.11 Agent failure modes — hallucinated tools and arguments, loops, premature "done", context poisoning, distraction and confusion, goal drift, over-eagerness, error cascades; a debugging playbook.
- 9.12 Agent UX — streaming progress, visible plans, interruptibility, generative UI, artifacts and canvases, citations, undo, trust calibration.

### Book 10: Agent archetypes

- 10.1 Coding agents — repo understanding, agentic search, edit formats (whole file, search and replace, unified diff, apply-patch), test-and-iterate loops, worktrees and parallel agents, review agents, SWE-bench-style evaluation.
- 10.2 Computer-use and browser agents — screenshots and vision vs DOM and accessibility trees, action spaces, Playwright- and DevTools-based tools, Browser Use, Stagehand, reliability and safety, OSWorld- and WebArena-style evals.
- 10.3 Research and analyst agents — deep research, data-analysis agents with code execution, notebook agents.
- 10.4 Voice and realtime agents — cascaded STT, LLM and TTS vs speech-to-speech; latency budgets; voice-activity detection and turn-taking; barge-in; telephony and WebRTC; LiveKit Agents, Pipecat; realtime APIs.
- 10.5 Customer-support and enterprise workflow agents — knowledge plus actions, policy adherence, human handoff, simulated-user evaluation.
- 10.6 Personal and ambient assistants — email, calendar and tasks, memory, proactive triggers, permissions.
- 10.7 Document-processing and extraction pipelines — schema extraction, validation, human review queues.
- 10.8 Embodied and robotics agents — vision-language-action models, world models, sim-to-real (an overview).

### Book 11: Harnesses

- 11.1 What "harness" means — the four meanings (agent harness or scaffold, eval harness, RL environment harness, test harness); model plus harness equals product.
- 11.2 Anatomy of an agent harness — system prompt, tool set, loop controller, context manager and compaction, memory files, permissions and sandbox, subagents, hooks and events, interface, telemetry.
- 11.3 Case study: Claude Code — CLAUDE.md memory, slash commands, subagents and agent teams, hooks, Agent Skills, plugins and marketplaces, MCP and tool search, permission modes, sandboxing, headless use, scheduled tasks, the Claude Agent SDK.
- 11.4 The coding-harness landscape — CLI vs IDE vs cloud and background agents (Claude Code, Codex, Gemini CLI, Cursor, GitHub Copilot, Devin, Jules, Aider, Cline, Roo Code, Kilo Code, OpenHands, SWE-agent and mini-SWE-agent, Amp, Goose, OpenCode, Factory, Kiro, Windsurf and others); instruction files (AGENTS.md, CLAUDE.md, GEMINI.md, rules files); a comparison matrix.
- 11.5 Skills, plugins and extension ecosystems — Agent Skills and the SKILL.md format, progressive disclosure, cross-agent skill tooling and directories, plugin manifests and marketplaces across harnesses, skill and plugin supply-chain security.
- 11.6 Working effectively with coding agents — spec-driven development, plan-first workflows, test-driven loops, context files, parallel agents, reviewing AI-written code, vibe coding vs agentic engineering.
- 11.7 Harness engineering — designing tools and prompts for a specific model, ablations, why one model scores differently in different harnesses, minimal vs maximal harnesses.
- 11.8 Sandboxes and execution environments — containers, microVMs (Firecracker), gVisor, WebAssembly, OS-level sandboxing; hosted sandboxes (E2B, Modal, Daytona, Cloudflare and others); network egress, secrets and resource limits.
- 11.9 Evaluation harnesses — lm-evaluation-harness, Inspect, OpenAI Evals, HELM, lighteval, SWE-bench and Terminal-Bench harnesses, τ-bench, custom harnesses.
- 11.10 RL environment harnesses — Gym-style interfaces, verifiers and environment hubs, OpenEnv, rollout frameworks (veRL, OpenRLHF, TRL, SkyRL, ART and others), reward functions.
- 11.11 Build your own harness — a step-by-step reference implementation: loop, tools, context management, permissions, logging, evals.

### Book 12: Protocols and standards

- 12.1 Why protocols — the N×M integration problem and the protocol map: model to tools (MCP), agent to agent (A2A), agent to interface (AG-UI, MCP Apps), editor to agent (Agent Client Protocol), agent to commerce (agentic commerce and payment protocols), instructions (AGENTS.md), packaged skills (Agent Skills), the web for agents (llms.txt, NLWeb).
- 12.2 MCP architecture — hosts, clients and servers; JSON-RPC 2.0; the shift from a stateful initialize handshake (through 2025-11-25) to stateless requests with per-request metadata and server/discover (2026-07-28); capability and extension negotiation.
- 12.3 MCP server primitives — tools, resources and resource templates, prompts; tool annotations; input and output schemas and structured content; resource links; completions; pagination; cacheable list results.
- 12.4 MCP client features and round trips — multi round-trip requests that replace server-initiated requests; elicitation; deprecated roots and sampling and what replaces them; progress and cancellation; change subscriptions; the tasks extension for long-running work.
- 12.5 MCP transports — stdio and Streamable HTTP; the removal of sessions and stream resumability; required request headers; the deprecated HTTP+SSE transport; scaling stateless remote servers.
- 12.6 MCP authorization — OAuth 2.1 with PKCE, protected-resource metadata and discovery, client registration options, issuer validation, credentials bound to their authorization server, audience-bound tokens, the token-passthrough anti-pattern, confused deputies.
- 12.7 MCP security — tool poisoning, rug pulls, cross-server shadowing, injection through tool results, over-broad scopes; mitigations (allowlists, pinning, sandboxing, consent, gateways).
- 12.8 MCP spec history — every version from 2024-11-05 to 2026-07-28 and what changed, the feature lifecycle and deprecation policy, how to follow proposals (SEPs).
- 12.9 Building MCP servers — official SDKs (TypeScript, Python and FastMCP, others), tool design for agents, testing with MCP Inspector, packaging and distribution, deploying remote servers, migrating to the stateless spec, registries.
- 12.10 MCP server types and catalog — by transport (local stdio vs remote HTTP); by role (knowledge and data, actions and integrations, compute and sandboxes, browsers, memory, and meta servers such as gateways, aggregators and proxies); by trust (vendor-official vs community); plus a categorized catalog: filesystems, version control, databases, search and web fetch, browser automation, docs and knowledge, productivity and communication, project management, cloud and infrastructure, observability, payments and finance, design, data and analytics, memory, security, media.
- 12.11 MCP at scale — gateways, registries and discovery, enterprise allowlists, the too-many-tools problem, tool search and deferred loading, code execution against MCP tools, interactive UI extensions (MCP Apps), trace propagation, deterministic tool order for prompt-cache hits.
- 12.12 Agent2Agent (A2A) — agent cards and discovery, tasks and their lifecycle, messages, parts and artifacts, streaming and push notifications, auth, the 1.0 release; A2A and MCP as complements, not rivals.
- 12.13 The rest of the alphabet soup — AG-UI, the Agent Client Protocol, app platforms inside chat assistants, agentic commerce and payment protocols, AGENTS.md, Agent Skills, llms.txt, OpenAPI as a tool source, agent identity and auth; a cheat sheet for naming collisions (the many "ACP"s).
- 12.14 Governance and ecosystem — who stewards MCP, A2A, AGENTS.md and Agent Skills today, working groups, and how standards evolve (dated, verify).

### Book 13: Frameworks and SDKs

- 13.1 The landscape map — provider SDKs, agent SDKs, orchestration frameworks, low-code builders and platforms; build vs buy; "start with plain API calls".
- 13.2 Provider and agent SDKs — the Anthropic SDK and Claude Agent SDK, the OpenAI SDK and Agents SDK, the Google Gen AI SDK and ADK, Microsoft Agent Framework, AWS Strands Agents and Bedrock AgentCore, the Vercel AI SDK.
- 13.3 Orchestration frameworks — LangChain and LangGraph, LlamaIndex, Haystack, CrewAI, AutoGen and AG2, Semantic Kernel, PydanticAI, smolagents, Agno, Mastra, DSPy, Letta, CAMEL.
- 13.4 Low-code and visual builders — n8n, Dify, Flowise, Langflow, OpenAI's Agent Builder, Zapier and Make, Copilot Studio and others.
- 13.5 Gateways and routers — LiteLLM, OpenRouter, Portkey, cloud AI gateways; failover, unified APIs, spend controls.
- 13.6 Selection guide and matrix — language, abstraction level, multi-agent support, durability, observability, MCP and A2A support, maturity, lock-in.
- 13.7 Framework anti-patterns — over-abstraction, hidden prompts, opaque debugging, version churn.

## 4. Coverage map, Part IV: Ship, measure, protect

### Book 14: Evaluation

- 14.1 Why evals are the core skill — evals as specs, eval-driven development, the flywheel.
- 14.2 Error analysis first — reading traces, open and axial coding, failure taxonomies, prioritizing fixes.
- 14.3 Building eval datasets — golden sets, production sampling, dimension-based synthetic data, adversarial cases, versioning, how many examples you need.
- 14.4 Metrics and graders — code assertions, exact match and F1, similarity metrics and their limits, pass@k vs pass^k, human evaluation and agreement.
- 14.5 LLM-as-judge done right — rubrics, binary vs scaled scores, pairwise vs pointwise, position, verbosity and self-preference bias, calibration against humans, judge drift.
- 14.6 Evaluating agents — outcome vs trajectory, tool-call accuracy, simulated users, environment-based evals, cost, steps and latency, reliability across runs, transcript review.
- 14.7 Task-specific recipes — RAG, chat, extraction, classification, summarization, code generation.
- 14.8 Safety and red-team evals — jailbreak and injection suites, harmful-content evals, over-refusal.
- 14.9 Online evaluation — A/B tests, guardrail metrics, explicit and implicit feedback, canaries, drift monitoring.
- 14.10 Statistics for evals — variance, confidence intervals, significance, sample sizes, nondeterminism, multiple comparisons.
- 14.11 Eval and observability tooling map — Inspect, promptfoo, DeepEval, RAGAS, OpenAI Evals, Braintrust, LangSmith, Langfuse, Arize Phoenix, W&B Weave, Opik and others (dated).

### Book 15: Inference and performance

- 15.1 Inference fundamentals — prefill vs decode, memory-bound decoding, arithmetic intensity, roofline intuition.
- 15.2 Latency and throughput — time to first token, time per output token, tokens per second, throughput vs latency, goodput, SLOs, tail latency.
- 15.3 Memory math — weights, KV cache and activations, with worked VRAM examples.
- 15.4 Batching and scheduling — continuous batching, PagedAttention, chunked prefill, prefix caching (RadixAttention), scheduling policies.
- 15.5 Speculative decoding — draft models, Medusa, the EAGLE family, n-gram and lookahead decoding, multi-token prediction.
- 15.6 Quantization — PTQ vs QAT, INT8 and INT4, GPTQ, AWQ, SmoothQuant, GGUF and k-quants, FP8, MXFP4 and NVFP4, KV-cache quantization, quality impact.
- 15.7 Parallelism and disaggregated serving — tensor, pipeline and expert parallelism; prefill and decode disaggregation; KV-cache transfer and offloading.
- 15.8 Serving engines — vLLM, SGLang, TensorRT-LLM, llama.cpp, Ollama, LM Studio, MLX, LMDeploy and others; a selection guide.
- 15.9 Hardware — what matters (memory capacity and bandwidth, FLOPs per precision, interconnect); GPU generations; AMD; TPUs; Trainium and Inferentia; inference ASICs such as Groq and Cerebras; Apple silicon; NPUs (dated).
- 15.10 Cost engineering — API pricing anatomy (input, output, cached and reasoning tokens), batch discounts, self-hosting break-even, utilization, routing and cascades, semantic caching.
- 15.11 Edge and on-device AI — ONNX Runtime, Core ML, ExecuTorch, WebGPU and WebLLM, mobile constraints, the privacy upside.

### Book 16: LLMOps and production

- 16.1 Reference architecture — gateway, orchestration, retrieval and tools, models, evals and observability; sync vs async; queues.
- 16.2 Reliability engineering — timeouts, retries with backoff and jitter, rate limits, provider failover, circuit breakers, idempotency keys, graceful degradation.
- 16.3 Streaming — SSE, WebSockets, partial JSON, streaming tool calls, cancellation.
- 16.4 Observability and tracing — what to log, spans for agent steps, OpenTelemetry GenAI conventions, OpenInference, PII-safe logging, dashboards.
- 16.5 Prompt and config management — versioning, registries, environments, feature flags, rollbacks.
- 16.6 CI/CD for AI — eval gates, regression suites, a model-upgrade playbook, canaries and shadow mode.
- 16.7 Cost and capacity — per-user and per-feature budgets, quotas, forecasting, caching, batch jobs.
- 16.8 The data flywheel — capturing feedback, curation, labeling, closing the loop.
- 16.9 Enterprise readiness — data residency, retention and zero data retention, compliance (SOC 2, ISO 27001 and 42001, HIPAA, GDPR), SSO, audit logs, multi-tenancy, vendor risk.
- 16.10 Incidents and on-call — model regressions, provider outages, injection incidents, runbooks, postmortems.

### Book 17: Security, safety and alignment

- 17.1 Threat modeling LLM apps and agents — attack surfaces, the OWASP Top 10 for LLM applications and its agentic counterpart, MITRE ATLAS.
- 17.2 Prompt injection — direct vs indirect; through documents, web pages, tool results and images; why it is unsolved; the "lethal trifecta"; exfiltration channels.
- 17.3 Secure agent design — least privilege, sandboxing, egress control, approvals, dual-LLM and capability-based designs such as CaMeL, spotlighting, guard models and guardrail frameworks, output filtering, taint tracking, defense in depth.
- 17.4 Jailbreaks and misuse — technique families (role-play, many-shot, encoding, multi-turn escalation), classifier defenses, abuse monitoring.
- 17.5 Supply chain and model security — unsafe model files, poisoned data and backdoors, MCP server, skill and plugin supply chains, hallucinated-package attacks, provenance and signing.
- 17.6 Privacy — PII detection and redaction, data minimization, memorization and extraction, differential-privacy basics, retention.
- 17.7 Red teaming — manual and automated (PyRIT, garak, promptfoo), attack libraries, bug bounties.
- 17.8 Alignment concepts — outer and inner alignment, specification gaming and reward hacking, sycophancy, deception and scheming evaluations, sandbagging, situational awareness, scalable oversight (debate, weak-to-strong), AI control, corrigibility, interpretability for safety.
- 17.9 Frontier safety frameworks — responsible-scaling-style policies, capability thresholds, dangerous-capability evals (CBRN, cyber, autonomy), how to read a system card.
- 17.10 Governance, regulation and law — the EU AI Act, US federal and state rules, the UK, China; NIST AI RMF and ISO/IEC 42001; copyright and training-data litigation (dated, balanced, not legal advice).
- 17.11 Responsible AI in practice — bias and fairness testing, transparency, model and system cards, accessibility, human oversight.

### Book 18: System design and case studies

- 18.1 The AI system design method — requirements, decomposition, model choice, context and retrieval, tools, orchestration, evals, guardrails, observability, cost, rollout.
- 18.2 Reference architectures — at least 12 blueprints, each with a diagram, components, an eval plan, a cost sketch and pitfalls: enterprise knowledge assistant, support agent, coding agent, deep-research agent, text-to-SQL analyst, document-extraction pipeline, voice receptionist, browser-automation agent, multi-agent research system, personal assistant with memory, AI search engine, moderation pipeline.
- 18.3 Back-of-the-envelope estimation — tokens, latency, cost per request, and QPS to GPU counts, with worked examples.
- 18.4 Decision guides — prompt vs RAG vs fine-tune vs long context, workflow vs agent, single vs multi-agent, build vs buy, API vs self-hosting.
- 18.5 Lessons from public engineering write-ups — only real, well-known write-ups, summarized as lessons with no invented numbers.
- 18.6 AI product and UX — designing for probabilistic systems, setting expectations, latency perception, confidence and citations, feedback loops, failure UX.
- 18.7 The anti-patterns hall of shame — no evals, mega-prompts, premature multi-agent, framework lock-in, no tracing, ignoring cost, trusting tool output, unbounded loops.

## 4. Coverage map, Part V: Frontier and reference

### Book 19: The frontier (volatile, reviewed often)

- 19.1 State-of-the-art snapshot — what is true as of the review date, and what changed in the last 6 to 12 months.
- 19.2 Reasoning and test-time scaling — where the gains come from and where they stop.
- 19.3 Long-horizon autonomy — task-length trends, reliability, continual learning, memory.
- 19.4 Self-improving and automated research systems — evolutionary coding agents, AI scientists, automated ML engineering.
- 19.5 New architectures and efficiency — hybrids, diffusion language models, latent reasoning, sparse attention, tokenizer-free models.
- 19.6 The open-weight frontier — who leads, how close open models are, and what that means.
- 19.7 AI for science, math and code — protein structure, materials, formal math and theorem proving, competition results.
- 19.8 Open problems and big debates — scaling limits, data walls, reasoning vs memorization, benchmark validity, economic impact, timelines and safety, with every side presented fairly.
- 19.9 Watchlist — labs, conferences, arXiv categories, leaderboards, newsletters and podcasts, as starting points.

### Book 20: Reference and career

- 20.1 Lexicon — the glossary (see the Lexicon feature).
- 20.2 Acronym decoder — every acronym in the Bible, expanded and linked.
- 20.3 Numbers every AI engineer should know — characters and words per token, bytes per parameter by precision, FLOPs per token for training and inference, the KV-cache formula, typical latency ranges, context and embedding sizes, cost orders of magnitude; each flagged as a rule of thumb.
- 20.4 The Commandments — the cheat sheets (see features).
- 20.5 The Canon — 50 or more must-know papers in chronological order, each with a one-line "why it matters", plus essential essays, posts and books.
- 20.6 Who's who and where to learn — labs, research groups, educators, courses and communities.
- 20.7 Talking shop — how experts frame problems, 50 hard questions with strong answers, hot takes with counterarguments, and the red flags of shallow knowledge.
- 20.8 Interview prep — fundamentals, system design, LLM-API coding, evals and debugging scenarios, with model answers.
- 20.9 Learning paths and the project ladder — the paths (see features) plus a ladder of portfolio projects, from "chat with a PDF" to a multi-agent system with evals and observability.
- 20.10 Changelog and how to extend — see section 11.

Genesis, the timeline of AI, is a view rather than a Book (see features).

## 5. Chapter templates and writing style

Full chapters follow this order:

1. Header: number, title, level, reading time, stability, last-reviewed date and tags.
2. TL;DR in two or three sentences.
3. Why it matters for an engineer.
4. Intuition: the mental model, an analogy and the lead visual (section 6).
5. How it works: the mechanics, with a visual for every step that has a shape, and math where it truly helps.
6. In practice: Python or TypeScript code, configurations, sensible starting values and decision rules.
7. Numbers to know: rules of thumb, flagged as such.
8. Pitfalls and anti-patterns.
9. Talk like an expert: the vocabulary, how experts frame the topic, the live debates, and one hot take with its strongest counterargument.
10. Check yourself: two to four quiz questions with explanations, stored in the quiz data.
11. Go deeper: canonical papers and official docs, following the accuracy rules.
12. Related chapters.

Seed chapters hold a TL;DR, four to six key ideas, their planned visuals (with a quick lead diagram where it is cheap), one "Talk like an expert" line, related chapters, and a "Seed" badge that says how to grow it ("deepen \<id>").

Flagships for this run, in priority order, as many as budget allows: 0.2 The AI engineering stack, 9.2 The agent loop, 9.3 Tool use and tool design, 5.4 Context engineering, 12.2 MCP architecture, 12.3 MCP server primitives, 6.1 RAG fundamentals, 6.3 Chunking, 9.4 Workflow patterns, 9.7 Multi-agent systems, 11.2 Anatomy of an agent harness, 14.2 Error analysis, 14.5 LLM-as-judge, 17.2 Prompt injection, 2.3 Attention step by step, 2.6 The KV cache, and 20.3 Numbers every AI engineer should know.

After this run, deepen Books in this order: 9, 12, 11, 6, 5, 14, 17, 15, 16, 10, 13, 2, 3, 4, 18, 1, 8, 7, 19, then 0 and 20.

Writing style:

- Intuition first, then mechanics, then practice. Be precise, vivid, warm and a little witty; never fluffy or corporate.
- Mix short paragraphs with structure. Use bullets where they help, never as walls.
- Define every term on first use and link it to the Lexicon. Keep terminology consistent across chapters.
- Use a consistent set of callouts, each with its own icon: Insight, Pitfall, Talk like an expert, Hot take, Try it, Number to know and History.
- Cross-link generously, so every chapter is reachable from at least two others.

## 6. Visualizations

I want to see every concept, not only read about it. Any idea with a shape gets a visual, and the visual comes before the prose that explains it. After using a visual, a reader should predict the system's behavior better than before; a visual that only decorates gets cut.

### Pick the form from the shape of the idea

- Structure, meaning what sits inside what and what connects to what → a labeled diagram where clicking a part opens its chapter.
- A flow that branches or loops → a flowchart.
- Messages between parties over time → a sequence diagram I can step through, with each payload shown.
- States and transitions → a state diagram.
- A mechanism that unfolds in steps → an animated stepper with play, pause, step and scrub, and a caption for each step.
- A quantity that responds to settings → an explorer, where sliders and toggles redraw a chart live.
- A formula people apply → a calculator showing the inputs, the result, the formula and its assumptions.
- Numbers across time or items → a chart, with log axes when values span orders of magnitude.
- A matrix → a heatmap.
- High-dimensional geometry → a 2D map with a draggable query point.
- A network or a dependency → a graph.
- A hierarchy or a decision → an expandable tree.
- A fixed budget split into parts → a stacked bar or a treemap.
- A change or a choice → a side-by-side comparison with linked highlights.
- Dates → a timeline.
- Text as the model sees it → a token strip.
- Code that implements a concept → a code walk, where each highlighted line lights up its part of a diagram.

### One visual language

- The same thing always looks the same. Model, context window, token, tool, data store, agent, human, external service and untrusted content each get one glyph, drawn once as an SVG symbol library in the engine.
- Role colors mean the same thing everywhere and stay separate from the Book accents. Define them as CSS variables with light and dark values from a colorblind-safe palette such as Okabe-Ito, and never let color carry meaning alone: pair it with a shape, a label or a pattern.
- The style is flat: no gradients or shadows, thin consistent strokes, rounded corners, and labels at least 12 px at phone width.
- A legend page at `#visual-legend` teaches the language once, and every visual links to it.

### Components

Build these once in the engine and configure them from content, each when the first chapter needs it. The playgrounds, calculators and wizards in section 7 are built from them.

- `diagram`: a static SVG from the glyph library, with clickable parts.
- `stepper`: frames of any diagram, with controls and a caption per step.
- `sequence`: lanes for actors and messages that appear step by step, with payloads on tap.
- `explorer`: controls bound to a formula or a small model, redrawing a chart live.
- `calculator`: inputs with units, the result, the formula, the assumptions and tested examples.
- `chart`: line, bar, scatter and area charts drawn from rows, with a source and an as-of date.
- `heatmap`: matrices such as attention weights, confusion matrices and similarity scores.
- `embedding-map`: labeled points, a draggable query, its nearest neighbors and a similarity threshold.
- `graph`: nodes and edges in a force or layered layout.
- `tree`: hierarchies and decision trees that expand on click.
- `budget`: a fixed total split into parts that resize live.
- `compare`: two panels, A and B, with linked highlights.
- `timeline`: dated events with zoom and filters.
- `tokens`: text split into colored tokens with their IDs and counts.
- `trace`: a span waterfall of an agent run, with tokens and latency per span.
- `code-walk`: code whose lines link to the parts of a diagram.

### Where visuals live

Visuals are content, not code. A chapter places each one as a fenced block in its Markdown: `viz` for a JSON spec of a component, `mermaid` for quick flows, sequences and states, `svg` for a hand-drawn diagram that uses the glyphs and role colors, and `math` for formulas. List each chapter's visuals, planned ones included, in a data-visuals attribute so status can count them. The engine renders each visual when it scrolls into view.

Every spec has an id, a component, a title that states the takeaway, a caption that says what to notice, alt text, and a data kind: formula, real or illustrative. Real data adds a source and an as-of date. Each test overrides some default inputs and states the expected result, and the automated check recomputes it. For example:

```viz
{
  "id": "kv-cache-calculator",
  "component": "calculator",
  "title": "KV-cache memory grows linearly with context and batch size",
  "caption": "At 128k tokens one sequence needs 40 GiB of cache, and a batch of four needs 160 GiB. Halve the KV heads and the cache halves too.",
  "alt": "Calculator: KV-cache bytes from layers, KV heads, head size, bytes per value, tokens and batch size.",
  "data": "formula",
  "formula": "2 × layers × kv_heads × head_dim × bytes_per_value × tokens × batch",
  "inputs": {"layers": 80, "kv_heads": 8, "head_dim": 128, "bytes_per_value": 2, "tokens": 131072, "batch": 1},
  "tests": [
    {"inputs": {"tokens": 1}, "expect_bytes": 327680},
    {"inputs": {"tokens": 131072}, "expect_bytes": 42949672960}
  ]
}
```

### Quality bar

Hold every visual to this bar, and redesign any that fails it.

- The title states the takeaway ("Decode is memory-bound"), not the topic ("Decode").
- One idea per visual. Split a visual that asks too much of one glance.
- It opens in a meaningful state, with one suggested first move ("Try: raise the temperature to 1.5").
- Axes carry labels and units, and direct labels beat legends.
- It matches the text, and it names the spec or version it depicts.
- Real data has a source and an as-of date, illustrative data says "Illustrative" in its caption, and no invented number is ever shown as real.
- Calculators show their formula and assumptions, and ship at least two tests.
- It works at 360 px and on a desktop, in light and dark, by touch and by keyboard.
- A "Read as text" toggle gives a written description, plus the data table for charts.
- Motion never autoplays when I prefer reduced motion, and step controls are always there.

### Coverage

- Full chapters: two to four visuals, the lead visual in the Intuition section, and an interactive or animated visual for every core mechanism.
- Seeds: planned visuals listed in data-visuals, plus a quick lead diagram where it is cheap.
- Each Book's landing page: a Book map showing how its chapters build on each other, with my progress.
- A Visuals page at `#visuals`: a gallery of every visual, filterable by Book and by form.

### Review

After building a visual, review it as a demanding teacher would. Can a newcomer state the takeaway after ten seconds, and does using it change what they predict? If not, change it, even to a different form. If you can render the page headlessly, screenshot the visuals at phone and desktop widths in both themes and fix what you see.

### Signature visuals for every Book

These are the flagship visuals. Build each one when its chapter becomes full; chapter numbers are in brackets.

- Book 0: the AI engineering stack as a layered diagram where each layer opens its Book (0.2); the cost, latency and quality triangle as an explorer (0.3).
- Book 1: two vectors I drag to watch the dot product and cosine similarity change (1.1); a low-rank explorer where a rank slider rebuilds a matrix, showing why LoRA works (1.1); two distributions whose entropy, cross-entropy and KL divergence update as I reshape them (1.2); a loss landscape where SGD, momentum and Adam race from a start point I drag, with a learning-rate slider (1.3); training and validation error against model complexity, and a ROC curve with a threshold slider and its confusion matrix (1.4); a forward and backward pass stepper on a tiny network (1.5); an embedding map with a draggable query (1.6); a gridworld where value iteration spreads step by step (1.7).
- Book 2: BPE merges stepping through my own text (2.1); a RoPE dial showing rotation by position (2.2); an attention stepper from scores through scaling, mask and softmax to weighted values, ending in a heatmap, plus how heads share keys and values in MQA, GQA and MLA (2.3); a clickable transformer block on the residual stream, with a parameter counter (2.4); an MoE router sending tokens to experts (2.5); a KV cache that grows token by token, with its calculator (2.6); FlashAttention tiling between fast and slow memory (2.7); a sampling explorer (2.8); superposition as features packed into fewer directions (2.10).
- Book 3: the pretraining data funnel from crawl to mixture, illustrative (3.1); a scaling-law chart on log-log axes and a training-compute calculator using 6 × parameters × tokens (3.2); data, tensor, pipeline and expert parallelism as one switchable diagram, with a training-memory calculator (3.3); the path from pretraining to safety training as one flow showing what each stage adds (3.4 to 3.7 and 3.11); RLHF and DPO side by side (3.6); GRPO scoring a group of sampled answers (3.7); a LoRA low-rank update with a parameter-count calculator (3.10).
- Book 4: accuracy against thinking budget, illustrative, and self-consistency voting (4.2); a dated benchmark-saturation chart from sourced data only (4.5); a model-choice decision tree (4.6); the anatomy of an API request and its streamed events (4.7).
- Book 5: prompt anatomy (5.1); the context-budget planner, a compaction sawtooth of context size over a long session, and sub-agent isolation (5.4); a prompt-caching prefix picture with a savings calculator (5.5); constrained decoding masking invalid tokens step by step (5.6); the DSPy optimization loop (5.7).
- Book 6: a RAG stepper following one question from ingest to answer (6.1); a chunking explorer (6.3); Matryoshka truncation, dimensions against quality, illustrative (6.4); an HNSW search animation across graph layers and a recall-latency trade-off chart (6.5); an RRF fusion explorer (6.7); a query-rewrite flow (6.8); rankings before and after reranking (6.9); an agentic RAG loop and a GraphRAG community map (6.10); a metrics calculator where toggling relevance updates nDCG (6.14); the deep-research loop (6.16).
- Book 7: the data flywheel (7.1); an inter-annotator agreement calculator for Cohen's kappa (7.2); a synthetic-data generate-and-filter funnel (7.3); a lineage graph from source data to model (7.4).
- Book 8: an image cut into patches and turned into tokens (8.1); diffusion adding and removing noise step by step, with a guidance-scale slider (8.3); cascaded and speech-to-speech voice pipelines as latency waterfalls (8.5).
- Book 9: the agent-loop step-through, with context growing each turn and a step budget (9.2); a tool-call round trip as a sequence player (9.3); the five workflow patterns as a switchable gallery (9.4); a ReAct trace beside plan-and-execute (9.5); memory types and their write and read paths (9.6); a topology switcher showing context per agent and the token multiplier (9.7); a long-running timeline with checkpoints and compaction (9.8); a failure-mode gallery pairing each symptom with its trace (9.11).
- Book 10: the coding-agent loop, with edit formats compared (10.1); the screenshot-and-action loop beside DOM-based control (10.2); a voice-agent latency waterfall and a turn-taking timeline (10.4).
- Book 11: a layered harness anatomy (11.2); the hook lifecycle, a skills ladder showing what loads at each level of progressive disclosure and its token cost, and a permission-mode ladder (11.3); a sandbox boundary diagram of files, network and secrets (11.8); the RL environment loop of rollout, reward and update (11.10).
- Book 12: the protocol map of who talks to whom (12.1); the stateful handshake through 2025-11-25 and the stateless 2026-07-28 requests in one sequence player with a version toggle (12.2); a multi round-trip request, from input\_required to the retried call (12.4); stdio and Streamable HTTP side by side (12.5); an OAuth 2.1 and PKCE sequence stepper (12.6); tool poisoning and rug-pull attack flows (12.7); tool search deferring definitions once they pass 10% of context (12.11); the A2A task lifecycle as a state machine from the 1.0 spec, and MCP beside A2A (12.12).
- Book 13: a dated framework landscape map, illustrative (13.1); gateway failover between providers (13.5).
- Book 14: the eval flywheel (14.1); a Pareto chart of failure modes from a worked trace review (14.2); a pass@k versus pass^k explorer (14.4); a judge-calibration confusion matrix with a movable threshold, and a position-bias demo (14.5); an agent trajectory viewer (14.6); a confidence-interval explorer where sample size and pass rate set the width (14.10).
- Book 15: prefill and decode on one timeline with time to first token and time per token marked, plus a roofline explorer (15.1); latency against throughput as batch size grows (15.2); the VRAM planner as a stacked bar against card memory (15.3); static versus continuous batching, animated, with a PagedAttention block table and a radix-tree prefix cache (15.4); speculative decoding with an acceptance-rate slider (15.5); weight histograms and error by bit width (15.6); disaggregated prefill and decode (15.7); a self-hosting break-even chart (15.10).
- Book 16: a clickable reference architecture (16.1); retries with backoff and jitter on a timeline, and a circuit breaker as a state machine (16.2); a streamed response as a sequence of events (16.3); a trace waterfall of a sample agent run (16.4); a CI pipeline with eval gates (16.6).
- Book 17: a threat-model data-flow diagram with trust boundaries (17.1); an indirect-injection stepper that replays with each defense switched on, and the lethal trifecta, where removing any one part breaks the attack (17.2); defense-in-depth layers and a dual-LLM data flow (17.3); a reward-hacking example beside the intended behavior (17.8).
- Book 18: every reference architecture as a clickable diagram (18.2); a back-of-the-envelope calculator from QPS to GPU count (18.3); the decision guides as trees (18.4).
- Book 19: a task-length trend chart from sourced data only (19.3); debate maps showing each claim, its strongest support and its strongest objection (19.8).
- Book 20: the numbers every AI engineer should know on one log scale, each value sourced or marked as a rule of thumb (20.3); a lineage graph of the Canon, where clicking a paper shows what it built on and what it changed (20.5); the project ladder (20.9).
- Genesis: eras as a ribbon above the timeline, each linked to its chapters.

## 7. Features

Build these as real, working features. The first-run minimums are in section 12; everything else can arrive on "continue".

- Home: title and tagline, search, a "Start here" card, continue reading, learning-path progress, the Book grid grouped by Part (each Book with its icon, accent color, chapter count and progress), a daily "Did you know?", a random chapter, stats (chapters, terms, version, last updated) and what's new.
- Navigation: a sidebar tree of Parts, Books and chapters with read ticks and a filter box; breadcrumbs; previous and next; a right rail with "On this page", related chapters and backlinks; drawers on mobile; deep links to every chapter, term and tool.
- Search: a command palette on Ctrl or Cmd plus K and on "/", plus a search bar. It is instant and fuzzy across titles, headings, tags, body text, glossary, cheat sheets and timeline, with grouped results, highlighted matches, full keyboard control and recent searches.
- Reading: a TL;DR card, styled callouts, code blocks with a language label and copy button, diagrams and math, glossary popovers on the first use of each term, reading time, copy as Markdown, bookmarks, mark as read, private notes per chapter, font-size and width controls, focus mode and print styles.
- Lexicon: the A to Z glossary, starting at 150 terms and growing past 300. Each term has a one-line definition, a one-line "in practice", aliases and the chapters that use it. Filter by letter and Book, and study it in flashcard mode.
- Genesis: an interactive timeline of AI from 1943 to today, starting at 60 events and growing past 120. Filter by track (models, techniques, agents and tools, protocols and standards, infrastructure and hardware, safety and policy, culture), with era headers, links to chapters and an "approximate" marker for uncertain dates.
- Learning paths with progress bars and "next up": Zero to AI Engineer in 12 weeks, RAG Specialist, Agent Architect, Harness and MCP Builder, Inference and Infra, Security and Safety, Interview Sprint in 2 weeks, and Talk Like a Researcher.
- Quizzes: every chapter's "Check yourself" plus a 10-question boss quiz per Book, with instant feedback, explanations and saved scores.
- Fun layer: XP for reading, quizzes and flashcards; levels with playful names, from Token Tourist through Context Crafter and Agent Architect to Frontier Sage; badges for finished Books and paths; a daily streak; a stats page and a reset. Keep it tasteful and never in the way of reading. One small easter egg is welcome.
- Playgrounds, client-side and labeled as toys where they simplify: sampling with temperature, top-k, top-p and min-p on a toy distribution; a BPE tokenizer on my own text; an attention heatmap; an embedding and cosine-similarity explorer; chunking with adjustable size and overlap; hybrid-search fusion with RRF; an agent-loop step-through; a context-budget planner.
- Calculators: VRAM (weights, KV cache and overhead), KV cache, tokens and cost (I enter current prices; presets are labeled illustrative), latency (time to first token plus tokens times time per token) and RAG index size.
- Decision wizards, each a question flow ending in a recommendation with links: prompt vs RAG vs fine-tune vs long context; workflow vs agent; single vs multi-agent; which vector store; API vs self-hosting; which eval method; MCP server vs plain function vs skill.
- Comparison matrices, sortable, filterable and dated: agent frameworks and SDKs, coding-agent harnesses, vector databases, serving engines, eval and observability tools, protocols, MCP transports, fine-tuning methods, chunking strategies and retrieval methods. Use qualitative cells unless a fact is certain.
- The Commandments: one-screen, printable cheat sheets for prompting, context engineering, the RAG pipeline, chunking, agent patterns, tool design, MCP, A2A, evals, LLM-as-judge rubrics, inference math, fine-tuning decisions, security and production readiness.
- The Apocrypha: a corner for hot takes, contested ideas and open debates, each with its strongest counterargument.
- What's new and freshness: a changelog, a coverage meter (full vs seed chapters) and a list of volatile chapters last reviewed more than 90 days ago.
- Extend me: a page documenting the content schema and the commands in section 11, with copy buttons.
- Settings: theme (system, light or dark), font size, reduced motion, export and import of progress as copyable JSON, and reset.

## 8. Design direction

Treat this as a design brief, and follow your frontend design guidance if you have it.

- Subject: the craft of AI engineering. Draw the visual language from its own materials: tokens, attention maps, embedding spaces, agent graphs, traces, and the rigor of a well-made reference book.
- Audience and job: an ambitious engineer who reads for hours and looks things up in seconds. Long-form comfort and instant lookup come first.
- Personality: a serious reference with a playful streak. Keep the Bible flavor light: Books and chapters, the Genesis timeline, the Lexicon, the Commandments and the Apocrypha.
- Boldness in one place: make the home hero the memorable moment, for example a live, interactive visualization from the subject's world. Keep everything else quiet and disciplined.
- Typography: one or two clearly distinct families, a clear type scale, body lines under about 75 characters, generous line height, and excellent code type.
- Color: light and dark themes of equal quality, plus one accent color and icon per Book, used consistently in navigation, headers and cards.
- Avoid generic looks: cream paper with a serif and a clay accent, near-black with one acid accent, identical rounded cards with soft shadows, and all-caps labels above every heading.
- Layout: three columns on desktop (navigation, chapter, on this page) and one column with drawers on mobile.
- Quality floor: keyboard navigation, visible focus, proper roles for the tree and dialogs, AA contrast, respect for reduced motion, and motion only where it answers an action.

## 9. Accuracy and honesty rules

- Fundamentals must be textbook-accurate, with both the intuition and the formula.
- Anything that can go stale goes into volatile chapters or callouts, stamped "as of \<month year>": models, versions, prices, benchmark scores, leaderboards, framework status and laws. Prefer qualitative statements.
- Never invent benchmark numbers, prices, dates, version numbers, paper titles, authors, quotes or URLs. If you are unsure, leave it out or mark it "verify".
- Name papers by title, first author and year only when you are sure. Link only to stable official pages you are confident exist; otherwise give a search hint.
- On contested questions (multi-agent, scaling, safety, regulation, timelines), present the strongest version of each side.
- Code must be correct, minimal and idiomatic for current SDKs. Label pseudocode as pseudocode, and use placeholders for model ids and keys.
- Case studies come only from real, well-known public write-ups, summarized as lessons, with no invented metrics or quotes.
- State your knowledge cutoff in Book 19 and in the footer. If you have web search, run a short freshness pass on volatile areas before writing them, and cite what you used.
- Legal and regulatory content is informational, not legal advice.

## 10. Freshness notes verified in November 2026

These facts were checked against primary sources on GitHub on 3 November 2026, and some are newer than your training. Use them, and mark them "verified Nov 2026".

- MCP: the latest specification is version 2026-07-28 (see the changelog in the modelcontextprotocol/modelcontextprotocol repository, under docs/specification/2026-07-28). Its main changes:
  - MCP is stateless. The initialize handshake and protocol-level sessions are gone; each request carries its protocol version and client capabilities in \_meta, and servers must implement server/discover.
  - Multi round-trip requests replace server-initiated requests. A server returns a result with resultType "input\_required", and the client retries the original request with the answers. Every result now carries resultType.
  - subscriptions/listen replaces the HTTP GET stream and the resource subscribe calls. Ping, logging/setLevel and SSE stream resumability were removed.
  - Tasks moved out of the core into an official extension, polled with tasks/get.
  - Roots, Sampling and Logging are deprecated, and the HTTP+SSE transport is formally deprecated under the new feature-lifecycle policy.
  - List results carry cache hints (ttlMs and cacheScope), and servers should list tools in a deterministic order to help prompt-cache hits.
  - OpenTelemetry trace context travels in \_meta, tool schemas may use any JSON Schema 2020-12 keyword, and authorization adds issuer validation and credentials bound to their authorization server.
- A2A: version 1.0.0 shipped on 12 March 2026 with breaking spec changes, and 1.0.1 followed on 26 May 2026 (a2aproject/A2A changelog).
- Claude Code: at version 2.1.317 in early November 2026. Recent additions include agent teams (a research preview of multi-agent collaboration), an auto permission mode backed by a safety check, recurring and scheduled tasks (/loop and /schedule), plugins and marketplaces, OpenTelemetry metrics, and MCP tool search, which defers MCP tool definitions once they exceed 10% of the context window (anthropics/claude-code changelog).
- Agent Skills: an open format of folders that each hold a SKILL.md file (agentskills/agentskills). A cross-agent skills CLI supports more than 75 agents (vercel-labs/skills), other harnesses ship their own plugin manifests (cursor/plugins), and dedicated skill security scanners exist (NVIDIA/SkillSpector).
- Sandboxing: Anthropic's sandbox runtime (anthropics/sandbox-runtime) enforces filesystem and network limits at the OS level, without a container, for agents, local MCP servers and shell commands.
- Trend: GitHub's monthly trending list is led by agent skills, plugins, memory and context-compression tools for coding agents.

Everything else that moves fast still gets your own freshness pass if you have web search.

## 11. Built to grow: the extension protocol

- Chapter ids are permanent. If one must change, map the old id to the new one in the alias block so old links keep working.
- Updates never delete content unless I ask. Deepening a chapter replaces its seed body and sets data-status to full.
- Every update bumps the version (minor for new content, patch for fixes), adds a changelog entry (date, chapter ids, one-line summary) and updates data-reviewed on the chapters it touched.
- New research goes wherever it belongs, with glossary terms, a timeline event and quiz questions. If it fits nowhere yet, it goes into Book 19 and gets promoted later.
- In future sessions I will give you the artifact link and a command. Read the artifact, edit it in place, and republish to the same artifact.

Honor these commands here, and show them on the Extend me page:

- continue: first add any features from section 7 or visual components from section 6 that are still missing, then deepen the next 10 to 15 seed chapters in the order from section 5, each with its visuals, then republish.
- deepen \<chapter id or Book number>: deepen just that.
- add: \<topic, paper, link or notes>: integrate the new material everywhere it belongs.
- refresh: run a freshness pass over volatile chapters, using web search if available.
- audit: review accuracy and consistency, fix what you find, and report.
- status: report coverage, including visuals built and planned, and what comes next.
- visualize \<chapter id or Book number>: build its planned visuals, replace weak ones, add an interactive visual for each core mechanism, and report what changed.

## 12. Definition of done for this run

- A published, working artifact with no console errors, on desktop and mobile, in light and dark themes.
- Every chapter in the map exists, and at least 12 flagship chapters are full.
- Working features: navigation, deep links, search, glossary popovers, progress, bookmarks and notes, quizzes, the Genesis timeline and the learning paths.
- At least 3 playgrounds, 3 calculators, 3 wizards, 4 matrices and 8 Commandments; the rest can grow later.
- First-run minimums: 150 glossary terms, 60 timeline events and 40 quiz questions.
- A final report with counts, decisions and next steps.
- Every full chapter has two to four visuals, at least one interactive or animated, and every visual passes the quality bar in section 6.
- The Visuals page, the visual legend and the Book maps work.
