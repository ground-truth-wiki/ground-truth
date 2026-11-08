# Visual language

Every concept with a shape gets a visual, and the visual comes before the prose that explains it. After using a visual, a reader should predict the system's behavior better than before; a visual that only decorates gets cut. This guide is built from section 6 of the editorial masterprompt (`source/editorial-masterprompt.md`) and from the 446 visuals in the existing chapters.

## Pick the form from the shape of the idea

| The idea is… | Use | Component |
|---|---|---|
| Structure: what sits inside what, what connects to what | A labeled diagram where clicking a part opens its chapter | `diagram` |
| A flow that branches or loops | A flowchart | ` ```mermaid ` (flowchart) |
| Messages between parties over time | A sequence you can step through, with each payload shown | `sequence` |
| States and transitions | A state diagram | ` ```mermaid ` (stateDiagram-v2) |
| A mechanism that unfolds in steps | An animated stepper with play, pause, step and scrub, and a caption per step | `stepper` |
| A quantity that responds to settings | An explorer: sliders and toggles redraw a chart live | `explorer` |
| A formula people apply | A calculator showing inputs, result, formula and assumptions | `calculator` |
| Numbers across time or items | A chart, with log axes when values span orders of magnitude | `chart` |
| A matrix | A heatmap | `heatmap` |
| High-dimensional geometry | A 2D map with a draggable query point | `embedding-map` |
| A network or a dependency | A graph | `graph` |
| A hierarchy or a decision | An expandable tree | `tree` |
| A fixed budget split into parts | A stacked bar | `budget` |
| A change or a choice | A side-by-side comparison with linked highlights | `compare` |
| Dates | A timeline | `timeline` |
| Text as the model sees it | A token strip | `tokens` |
| Code that implements a concept | A code walk, where each highlighted line lights up its part of a diagram | `code-walk` |
| A span waterfall of an agent run | A trace with tokens and latency per span | `trace` |
| A decision with several steps | An embedded decision wizard | `wizard` |
| A dated comparison of options | An embedded comparison matrix | `matrix` |
| A formula on its own | Typeset math | ` ```math ` or `\( … \)` |

## One visual language

- **The same thing always looks the same.** Nine roles each have one glyph, drawn once in the SVG library in `engine/shell.html`, and one color:

  | Role | Glyph | Light | Dark |
  |---|---|---|---|
  | Model | `g-model` | `#0072B2` | `#5AAEE6` |
  | Context window | `g-context` | `#2A86C2` | `#8DD0F3` |
  | Token | `g-token` | `#7D6D00` | `#EDE15A` |
  | Tool | `g-tool` | `#00795A` | `#3CCB9E` |
  | Data store | `g-data` | `#A96F00` | `#F2B53E` |
  | Agent | `g-agent` | `#A24C85` | `#E59CC6` |
  | Human | `g-human` | `#3B3F48` | `#D9DCE2` |
  | External service | `g-external` | `#69707C` | `#A4AAB5` |
  | Untrusted content | `g-untrusted` | `#C04F00` | `#FF8E45` |

  In a spec, a node takes its role with `"role": "model"` and so on. The colors are CSS variables (`--r-model` and so on) from a colorblind-safe palette based on Okabe-Ito, and stay separate from the book accent colors.
- **Color never carries meaning alone.** Pair it with a shape, a label or a pattern (untrusted content also carries a hatch pattern).
- **The style is flat:** no gradients or shadows, thin consistent strokes, rounded corners, and labels at least 12 px at phone width.
- **The legend** at `#visual-legend` teaches the language once, and every visual links to it.

## Where visuals live

Visuals are content, not code. A chapter places each one as a fenced block in its Markdown, and lists it in its frontmatter `visuals` as `id:form`:

| Block | For | Listed as |
|---|---|---|
| ` ```viz ` with a JSON spec | Every component in the table above | `id:component`, such as `kv-cache-calculator:calculator` |
| ` ```mermaid id=… title="…" caption="…" alt="…" ` | Quick flows, sequences and states | `id:type`, such as `agent-loop-flow:flowchart` or `breaker-states:state` |
| ` ```svg id=… title="…" caption="…" alt="…" ` | A hand-drawn diagram using the glyphs and role colors | `id:svg` |
| ` ```math ` | A displayed formula | (not listed) |

The engine draws each visual when it scrolls into view. `npm run validate` checks that the frontmatter list and the body match, that every id is unique across the site, and that every component and explorer model exists.

## The spec

Every `viz` spec has these fields ([schemas/viz.schema.json](../schemas/viz.schema.json)):

| Field | Rule |
|---|---|
| `id` | Unique across the site, lowercase and hyphenated |
| `component` | One of the 18 components below |
| `title` | States the takeaway ("Decode is memory-bound"), not the topic ("Decode") |
| `caption` | What to notice. Illustrative visuals say so; the engine adds "Illustrative." if the word is missing |
| `alt` | A text description, also shown by the "Read as text" button |
| `data` | `formula` (computed live), `real` (measured; needs `source` and `asof`) or `illustrative` (not measured) |
| `try` | Optional: one suggested first move ("Try: raise the temperature to 1.5") |
| `depicts` | Optional: the spec or version the visual shows |

In the existing chapters, 390 visuals are illustrative, 46 formula-based and 2 use real data.

A complete calculator, ready to copy, is in [templates/visual-spec.json](../templates/visual-spec.json). Each calculator test overrides some inputs and states the expected outputs; `npm run validate` recomputes every test with the engine's own calculator code.

## Components and their fields

The fields each component uses in the existing chapters. "Uses" counts specs; a field in brackets is used by only some of them. Look at the example to copy a working spec.

| Component | Uses | Fields | Example |
|---|---|---|---|
| `tree` | 86 | `open`, `root` (nested `label`, `children`, `link`) | `stack-where` in `ai-engineering-stack` |
| `diagram` | 75 | `w`, `nodes`, `edges`, (`h`, `layers`, `layer_h`, `variants`, `groups`) | `stack-layers` in `ai-engineering-stack` |
| `compare` | 71 | `a`, `b`, `links`, (`mono`) | `role-compare` in `ai-engineer-role` |
| `stepper` | 53 | `frames`, (`diagram`) | `stack-request` in `ai-engineering-stack` |
| `chart` | 49 | `type`, (`y`, `series`, `x`, `categories`, `bands`, `groups`) | `bitter-lesson-chart` in `mental-models` |
| `calculator` | 26 | `inputs`, `input_meta`, `outputs`, `assumptions`, `tests`, (`formula`, `result`) | `pr-calculator` in `classical-ml` |
| `sequence` | 17 | `actors`, (`messages`, `variants`) | `api-anatomy` in `model-apis` |
| `matrix` | 16 | `matrix` (the id of a matrix in `data/matrices.json`) | `family-map` in `frontier-families` |
| `explorer` | 15 | `model`: one of `sampling`, `chunking`, `rrf`, `sawtooth`, `multiagent`, `judge`, `trifecta`, `injection`, `attention`, `passk`, `ci`, `autonomy`, `ndcg`, `roofline`, `spec` | `attention-playground` in `attention` |
| `trace` | 8 | `spans` | `research-trace` in `deep-research` |
| `graph` | 7 | `nodes`, `edges`, `per_row`, `node_w` | `skills-map` in `ai-engineer-role` |
| `wizard` | 4 | `wizard` (the id of a wizard in `data/wizards.json`) | `rag-wizard` in `rag-fundamentals` |
| `embedding-map` | 3 | `points`, `query`, `k`, `threshold` | `dot-product-drag` in `linear-algebra` |
| `code-walk` | 3 | `language`, `code`, `diagram`, `steps` | `minimal-agent-walk` in `agent-loop` |
| `timeline` | 2 | `events` | `mcp-versions` in `mcp-spec-history` |
| `tokens` | 1 | `text`, `merges` | `bpe-playground` in `tokenization` |
| `budget` | 1 | `total`, `unit`, `label`, `warn`, `parts` | `context-budget-planner` in `context-engineering` |
| `heatmap` | 1 | `rows`, `cols`, `values` | `dataset-coverage` in `eval-datasets` |

Calculator inputs are described in `input_meta` with `label`, `unit`, `min`, `max`, `step` and `options`. The engine's map of all components is in [engine/README.md](../engine/README.md).

## Quality bar

Hold every visual to this bar, and redesign any that fails it.

- The title states the takeaway, not the topic.
- One idea per visual. Split a visual that asks too much of one glance.
- It opens in a meaningful state, with one suggested first move (`try`).
- Axes carry labels and units, and direct labels beat legends.
- It matches the text, and it names the spec or version it depicts (`depicts`).
- Real data has a source and an as-of date, illustrative data says "Illustrative" in its caption, and no invented number is ever shown as real.
- Calculators show their formula and assumptions, and ship at least two tests.
- It works at 360 px and on a desktop, in light and dark, by touch and by keyboard.
- "Read as text" gives a written description, plus the data table for charts.
- Motion never autoplays when the reader prefers reduced motion, and step controls are always there.

## Coverage

- **Full chapters:** two to four visuals, the lead visual in the Intuition section, and an interactive or animated visual for every core mechanism. In the existing chapters, 140 have 2 visuals, 54 have 3 and 1 has 4.
- **Seed chapters:** planned visuals listed in the frontmatter, plus a quick lead diagram where that is cheap.
- **Book pages:** a map showing how the book's chapters build on each other, with the reader's progress (generated by the engine).
- **The Visuals page** at `#visuals`: a gallery of every visual, filterable by book and form (generated by the engine).

## Review

After building a visual, review it as a demanding teacher would. Can a newcomer state the takeaway after ten seconds, and does using it change what they predict? If not, change it, even to a different form. Check it at phone and desktop widths, in both themes: `npm run dev` and a browser are enough.

## Signature visuals

The flagship visuals of each book, from section 6 of the editorial masterprompt (chapter numbers in brackets). New chapters in a book should match their level of care.

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
