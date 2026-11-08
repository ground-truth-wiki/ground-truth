---
id: self-supervised-methods
book: 1
order: "1.6.2"
title: Self-supervised learning methods
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [self-supervised-learning, contrastive-learning, dino, jepa, vision-encoders]
visuals: []
prerequisites: [representation-learning]
---
> [!tldr]
> Self-supervised learning (SSL) trains an encoder on a task built from unlabeled data itself, such as matching two augmented views of one image or filling in masked patches, so the labels come for free. Methods that match views differ mainly in how they stop the encoder from collapsing to one constant output (negatives, a slowly moving teacher or variance and decorrelation terms), while masked modeling that reconstructs the input sidesteps the problem. Remember that the pretext task decides what the features capture, and you check that with a k-NN classifier, a linear probe or fine-tuning.

## Key ideas

- **Every joint-embedding method must avoid collapse.** Making two views of an input produce similar embeddings has a trivial solution: the encoder produces a constant output regardless of the input ([Assran et al., 2023](https://arxiv.org/abs/2301.08243)). Balestriero et al., [“A Cookbook of Self-Supervised Learning”](https://arxiv.org/abs/2304.12210) (2023) sorts methods into four families: deep metric learning (SimCLR), self-distillation (BYOL, SimSiam, DINO), canonical correlation analysis (VICReg, Barlow Twins) and masked image modeling. The first three use different guards against collapse: negatives, often an encoder updated as a running average of the other, or variance and covariance terms ([Balestriero et al., 2023](https://arxiv.org/abs/2304.12210)). Methods that reconstruct the signal do not face collapse as long as the extra variable the decoder is conditioned on carries little information compared with the signal ([Assran et al., 2023](https://arxiv.org/abs/2301.08243)).
- **Contrastive methods use many negatives.** SimCLR pulls two augmented views of an image together and pushes the other images in the batch away; the authors found that the composition of augmentations matters a lot, that a nonlinear projection head helps, and that contrastive learning benefits from larger batches than supervised learning (Chen et al., [“A Simple Framework for Contrastive Learning of Visual Representations”](https://arxiv.org/abs/2002.05709) (2020)). MoCo gets a large set of negatives without huge batches by keeping a queue of embeddings from a slowly updated momentum encoder (He et al., [“Momentum Contrast for Unsupervised Visual Representation Learning”](https://arxiv.org/abs/1911.05722) (2019)), and the temperature in the softmax over similarities makes that distribution sharper or flatter ([Balestriero et al., 2023](https://arxiv.org/abs/2304.12210)).
- **Self-distillation and redundancy reduction work without negatives.** In BYOL an online network predicts a target network's embedding of another view, and the target is an exponential moving average (EMA) of the online network (Grill et al., [“Bootstrap your own latent”](https://arxiv.org/abs/2006.07733) (2020)); DINO, which its authors interpret as “self-distillation with no labels”, also relies on a momentum encoder and showed that self-supervised vision transformer features are excellent k-NN classifiers (Caron et al., [“Emerging Properties in Self-Supervised Vision Transformers”](https://arxiv.org/abs/2104.14294) (2021)). Barlow Twins pushes the cross-correlation matrix of the two views' embeddings toward the identity and needs no large batches, predictor or momentum encoder (Zbontar et al., [“Barlow Twins”](https://arxiv.org/abs/2103.03230) (2021)), and VICReg prevents collapse explicitly with a variance term on each embedding dimension (Bardes et al., [“VICReg”](https://arxiv.org/abs/2105.04906) (2021)).
- **Masked modeling reconstructs; JEPAs predict embeddings.** MAE masks a high proportion of image patches, for example 75%, encodes only the visible ones and reconstructs the missing pixels with a lightweight decoder (He et al., [“Masked Autoencoders Are Scalable Vision Learners”](https://arxiv.org/abs/2111.06377) (2021)), while BEiT predicts discrete visual tokens for the masked patches (Bao et al., [“BEiT: BERT Pre-Training of Image Transformers”](https://arxiv.org/abs/2106.08254) (2021)). I-JEPA instead predicts the representations of masked target blocks from a context block, in embedding space and without hand-crafted augmentations (Assran et al., [“Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture”](https://arxiv.org/abs/2301.08243) (2023)); V-JEPA 2 is pretrained this way on a video and image dataset with more than 1 million hours of internet video, and an action-conditioned version, V-JEPA 2-AC, plans pick-and-place on robot arms zero-shot, in labs where no data from those robots was collected (Assran et al., [“V-JEPA 2”](https://arxiv.org/abs/2506.09985) (2025)).
- **Evaluate with k-NN, linear probes and fine-tuning.** The three common protocols, in order of complexity, are a k-NN classifier on frozen features, a linear classifier trained on frozen features (the most popular) and full fine-tuning; the MAE authors argued for fine-tuning because linear-probe accuracy does not track fine-tuning and transfer results ([Balestriero et al., 2023](https://arxiv.org/abs/2304.12210)).
- **Image-text contrastive models and frozen backbones.** CLIP learns from 400 million image-text pairs by predicting which caption belongs to which image, which allows zero-shot classification from text prompts (Radford et al., [“Learning Transferable Visual Models From Natural Language Supervision”](https://arxiv.org/abs/2103.00020) (2021)); SigLIP replaces the batch-wide softmax with a pairwise sigmoid loss that needs no global normalization (Zhai et al., [“Sigmoid Loss for Language Image Pre-Training”](https://arxiv.org/abs/2303.15343) (2023)). DINOv2 aims at features that work across images and tasks without fine-tuning (Oquab et al., [“DINOv2”](https://arxiv.org/abs/2304.07193) (2023)), and such encoders serve as vision backbones: PaliGemma, for example, pairs a SigLIP encoder with a Gemma language model (Beyer et al., [“PaliGemma”](https://arxiv.org/abs/2407.07726) (2024)).

## Planned visuals

- `tree`: the four SSL families plus JEPAs, each with what it predicts, its main methods and the mechanism that prevents collapse (negatives, EMA teacher with a predictor, variance and decorrelation terms, reconstruction).
- `stepper`: one self-distillation step: two augmented views, the student and the EMA teacher, the prediction loss, the gradient step on the student and the slow teacher update, ending with a frame that shows what a collapsed embedding looks like.
- `compare`: MAE next to I-JEPA on the same masked image: one reconstructs pixels with a decoder, the other predicts target-block embeddings with a predictor.

## Talk like an expert

Experts talk about **views**, **augmentations**, **positives and negatives**, **InfoNCE**, **temperature**, the **projector**, the **EMA teacher**, **collapse** and **dimensional collapse**, and **linear-probe** versus **k-NN** versus **fine-tuning** accuracy, and they ask which invariances a pretext task builds in before they trust its features for a new task.

## Go deeper

- Balestriero et al., [“A Cookbook of Self-Supervised Learning”](https://arxiv.org/abs/2304.12210) (2023).
- Chen et al., [“A Simple Framework for Contrastive Learning of Visual Representations”](https://arxiv.org/abs/2002.05709) (2020).
- Oquab et al., [“DINOv2: Learning Robust Visual Features without Supervision”](https://arxiv.org/abs/2304.07193) (2023).
- Assran et al., [“Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture”](https://arxiv.org/abs/2301.08243) (2023).

## Related

- [Representation learning and embeddings](#representation-learning)
- [Vision-language models](#vision-language-models)
- [Autoencoders and latent spaces](#autoencoders-latent-spaces)
- [Video, 3D and world models](#video-world-models)
- [Word embeddings: from word2vec to contextual representations](#word-embeddings)
