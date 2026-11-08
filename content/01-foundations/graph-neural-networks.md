---
id: graph-neural-networks
book: 1
order: "1.13"
title: Graph neural networks
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [gnn, graphs, message-passing, graph-attention, ai-for-science]
visuals: []
prerequisites: [neural-networks, linear-algebra]
---
> [!tldr]
> Graph neural networks (GNNs) learn from data shaped as nodes and edges, such as molecules, social networks, recommendation graphs or a mesh over the globe. In each layer every node gathers messages from its neighbors and updates its own representation, in a way that does not depend on how the nodes happen to be numbered. Remember that each layer widens a node's view by one hop, and that stacking many layers brings two problems of its own: over-smoothing and over-squashing.

## Key ideas

- **Graphs as data, and three levels of task.** A graph carries node, edge and global attributes, and a task predicts something for the whole graph (what a molecule smells like), for each node or for each edge ([Sanchez-Lengeling et al., “A Gentle Introduction to Graph Neural Networks”, Distill (2021)](https://distill.pub/2021/gnn-intro/)). Adjacency matrices make poor inputs, because sparse graphs waste most entries and many matrices encode the same connectivity under different node orderings, while adjacency lists store each edge as a pair (i, j), so memory grows with the number of edges rather than the square of the number of nodes ([Distill](https://distill.pub/2021/gnn-intro/)).
- **Message passing respects the graph's symmetry.** A GNN is "an optimizable transformation on all attributes of the graph" that preserves its permutation symmetries: each node gathers its neighbors' embeddings, aggregates them (usually by summing) and updates its own, so after k layers a node holds information from nodes k hops away ([Distill](https://distill.pub/2021/gnn-intro/)). Gilmer et al. unified earlier models as message passing neural networks with learned message, update and readout functions, where the readout that pools node states into a graph-level output must not depend on their order (Gilmer et al., [“Neural Message Passing for Quantum Chemistry”](https://arxiv.org/abs/1704.01212) (2017)).
- **Three classic layers: GCN, GraphSAGE and GAT.** The graph convolutional network uses a localized first-order approximation of spectral graph convolutions and scales linearly in the number of edges (Kipf and Welling, [“Semi-Supervised Classification with Graph Convolutional Networks”](https://arxiv.org/abs/1609.02907) (2016)). GraphSAGE learns a function that samples and aggregates features from a node's neighborhood, so it can embed nodes never seen in training, an inductive rather than transductive setting (Hamilton et al., [“Inductive Representation Learning on Large Graphs”](https://arxiv.org/abs/1706.02216) (2017)), and graph attention networks use masked self-attention so that each node weights its neighbors differently (Veličković et al., [“Graph Attention Networks”](https://arxiv.org/abs/1710.10903) (2017)).
- **Depth has two failure modes.** Graph convolution is a special form of Laplacian smoothing, so with many layers node features can be over-smoothed until nodes from different clusters become indistinguishable (Li et al., [“Deeper Insights into Graph Convolutional Networks for Semi-Supervised Learning”](https://arxiv.org/abs/1801.07606) (2018)). Over-squashing is the other limit: information from an exponentially growing neighborhood is squeezed into fixed-size vectors, so GNNs struggle when a prediction depends on distant nodes (Alon and Yahav, [“On the Bottleneck of Graph Neural Networks and its Practical Implications”](https://arxiv.org/abs/2006.05205) (2020)).
- **Attention is message passing on a complete graph.** Transformers can be viewed as GNNs with an attention mechanism that model all connections instead of a sparse pattern ([Distill](https://distill.pub/2021/gnn-intro/)), which links this chapter to [attention](#attention). Graph transformers such as Graphormer build on the standard transformer and argue that the key is encoding the graph's structure into the model (Ying et al., [“Do Transformers Really Perform Bad for Graph Representation?”](https://arxiv.org/abs/2106.05234) (2021)).
- **Where GNNs run, and where "graph" means something else.** PyG, a library built on PyTorch, provides mini-batch loaders for many small graphs or a single giant graph ([PyG documentation](https://pytorch-geometric.readthedocs.io/en/latest/)), PinSage trained a graph convolutional network for recommendations at Pinterest on a graph of 3 billion nodes and 18 billion edges (Ying et al., [“Graph Convolutional Neural Networks for Web-Scale Recommender Systems”](https://arxiv.org/abs/1806.01973) (2018)), and the GraphCast weather model is built from GNNs in an encode-process-decode configuration over a multi-mesh of the globe (Lam et al., [“GraphCast: Learning skillful medium-range global weather forecasting”](https://arxiv.org/abs/2212.12794) (2022)). GraphRAG uses graphs differently: a language model builds an entity knowledge graph and community summaries from documents, and answers are generated from those summaries (Edge et al., [“From Local to Global: A Graph RAG Approach to Query-Focused Summarization”](https://arxiv.org/abs/2404.16130) (2024)).

## Planned visuals

- `stepper`: message passing on a small graph, one layer per frame: each node gathers, aggregates and updates, and the highlighted receptive field of one node grows by one hop per layer.
- `compare`: the same graph as two adjacency matrices under different node orderings, next to one adjacency list, showing why a GNN must not depend on the ordering.
- `diagram`: GraphCast's encode-process-decode pipeline: the latitude-longitude grid encoded onto the multi-mesh, message passing on the mesh, and decoding back to the grid.

## Talk like an expert

Experts name the task level (node, edge or graph) and whether the setting is transductive or inductive, describe a layer by its message, aggregation and update functions, and diagnose a deep GNN that stops improving as over-smoothing or over-squashing. They keep the graph in "GraphRAG" apart from the graph in "GNN": one is an index for retrieval, the other is the input to a trained network.

## Go deeper

- Sanchez-Lengeling et al., [“A Gentle Introduction to Graph Neural Networks”](https://distill.pub/2021/gnn-intro/), Distill (2021).
- Gilmer et al., [“Neural Message Passing for Quantum Chemistry”](https://arxiv.org/abs/1704.01212) (2017).
- Kipf and Welling, [“Semi-Supervised Classification with Graph Convolutional Networks”](https://arxiv.org/abs/1609.02907) (2016).
- Hamilton et al., [“Inductive Representation Learning on Large Graphs”](https://arxiv.org/abs/1706.02216) (2017).

## Related

- [Neural networks](#neural-networks)
- [Attention step by step](#attention)
- [Advanced RAG architectures](#advanced-rag)
- [AI for science, math and code](#ai-for-science)
- [Recommender systems](#recommender-systems)
