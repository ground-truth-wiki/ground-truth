---
id: convolutional-networks
book: 1
order: "1.5.2"
title: Convolutional neural networks
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [cnn, convolution, computer-vision, resnet, u-net]
visuals: []
prerequisites: [neural-networks]
---
> [!tldr]
> A convolutional neural network (CNN) slides small learned filters across an image, so each output depends only on a local patch and the same weights are reused at every position. Those two constraints, locality and weight sharing, build in assumptions that suit images and help most when labeled data is limited. The one thing to remember: whether a CNN or a vision transformer wins depends on data scale and training recipe, and convolutions also sit inside latent diffusion’s U-Net denoiser and image autoencoder and in efficient mobile models such as MobileNets.

## Key ideas

- **Local filters with shared weights.** A convolutional layer slides a small kernel over its input and computes a cross-correlation (calling it convolution is a misnomer kept by convention); its output is a feature map, and an output’s receptive field, the set of inputs that can affect it, can grow larger than the layer’s direct input as layers stack ([Dive into Deep Learning, “Convolutions for Images”](https://d2l.ai/chapter_convolutional-neural-networks/conv-layer.html)). Each neuron connects only to a local region, and all neurons in one depth slice share the same weights and bias ([CS231n notes, “Convolutional Neural Networks: Architectures, Convolution / Pooling Layers”](https://cs231n.github.io/convolutional-networks/)).
- **Shapes follow a formula.** Along each spatial dimension, an input of size W with filter size F, padding P and stride S gives (W − F + 2P) / S + 1 outputs, and a 2 × 2 max pool with stride 2 halves width and height, discarding 75% of the activations ([CS231n notes](https://cs231n.github.io/convolutional-networks/)).
- **Inductive bias versus scale.** The vision transformer (ViT) paper notes that transformers lack inductive biases built into CNNs, such as translation equivariance and locality, and so generalize worse on too little data, yet finds that “large scale training trumps inductive bias” (Dosovitskiy et al., [“An Image is Worth 16x16 Words”](https://arxiv.org/abs/2010.11929) (2020)). ConvNeXt, a standard ResNet modernized step by step toward ViT design and built entirely from standard ConvNet modules, competes favorably with transformers in accuracy and scalability; switching a ResNet-50 to a transformer-style training recipe alone raised its ImageNet accuracy from 76.1% to 78.8%, which suggests that much of the gap came from training techniques (Liu et al., [“A ConvNet for the 2020s”](https://arxiv.org/abs/2201.03545) (2022)).
- **The lineage.** LeCun et al. showed that CNNs trained by gradient-based learning, designed to deal with the variability of 2D shapes, outperformed all other techniques on a handwritten digit recognition task, and used them in a deployed system for reading bank checks ([LeCun et al., “Gradient-Based Learning Applied to Document Recognition” (1998)](https://bottou.org/papers/lecun-98h)); AlexNet was the first large-scale network to beat conventional computer vision methods on a large-scale vision challenge, followed by VGG blocks, GoogLeNet’s multi-branch modules, batch normalization and ResNet’s residual connections ([Dive into Deep Learning, “Modern Convolutional Neural Networks”](https://d2l.ai/chapter_convolutional-modern/index.html)). For efficiency, MobileNets build light networks for mobile and embedded vision from depthwise separable convolutions, and EfficientNet scales depth, width and input resolution together with one compound coefficient (Howard et al., [“MobileNets”](https://arxiv.org/abs/1704.04861) (2017); Tan and Le, [“EfficientNet”](https://arxiv.org/abs/1905.11946) (2019)).
- **From labels to pixels and boxes.** Transposed convolutions upsample feature maps to reverse earlier downsampling, which per-pixel tasks such as segmentation need ([Dive into Deep Learning, “Transposed Convolution”](https://d2l.ai/chapter_computer-vision/transposed-conv.html)), and U-Net pairs a contracting path that captures context with a symmetric expanding path for precise localization, trained end to end from very few images ([Ronneberger et al., “U-Net” (2015)](https://arxiv.org/abs/1505.04597)). YOLO frames detection as regression to boxes and class probabilities in one pass of a single network, Mask R-CNN adds a mask branch in parallel with Faster R-CNN’s box branch, and Segment Anything is a promptable segmentation model trained on over 1 billion masks on 11 million images (Redmon et al., [“You Only Look Once”](https://arxiv.org/abs/1506.02640) (2015); He et al., [“Mask R-CNN”](https://arxiv.org/abs/1703.06870) (2017); Kirillov et al., [“Segment Anything”](https://arxiv.org/abs/2304.02643) (2023)).
- **Inside other systems.** The CS231n notes advise downloading a pretrained model and fine-tuning it rather than training a ConvNet from scratch ([CS231n notes](https://cs231n.github.io/convolutional-networks/)). Latent diffusion bases its autoencoder on the VQGAN work of Esser et al., which uses CNNs to learn a vocabulary of image constituents, and realizes its denoiser as a time-conditional U-Net built mainly from 2D convolutional layers, while diffusion transformers replace that U-Net with a transformer over latent patches; see [image generation](#image-generation) (Rombach et al., [“High-Resolution Image Synthesis with Latent Diffusion Models”](https://arxiv.org/abs/2112.10752) (2022); Esser et al., [“Taming Transformers for High-Resolution Image Synthesis”](https://arxiv.org/abs/2012.09841) (2020); Peebles and Xie, [“Scalable Diffusion Models with Transformers”](https://arxiv.org/abs/2212.09748) (2022)).

## Planned visuals

- **`stepper`: a filter sliding over an image.** A 3 × 3 kernel moves over a small padded input, first with stride 1 and then with stride 2, filling the output cell by cell, then a second layer shows how the receptive field grows.
- **`calculator`: output size and parameters of a convolutional layer.** Inputs W, F, P, S and input and output channels; outputs the output size from (W − F + 2P) / S + 1, the weight count and the multiply-adds, with tests.
- **`timeline`: the CNN lineage.** LeNet, AlexNet, VGG, GoogLeNet, ResNet, U-Net, MobileNet, EfficientNet and ConvNeXt, each with the idea it introduced and a link to its paper.

## Talk like an expert

Experts talk about **kernels**, **channels**, **feature maps**, **stride**, **padding**, **receptive field**, **inductive bias**, **backbones**, **depthwise separable convolutions** and **encoder-decoder** networks, and they frame the CNN-versus-transformer choice as a trade between built-in assumptions and the amount of data and compute available.

## Go deeper

- [CS231n notes, “Convolutional Neural Networks: Architectures, Convolution / Pooling Layers”](https://cs231n.github.io/convolutional-networks/) (Stanford).
- [Dive into Deep Learning, chapter 8, “Modern Convolutional Neural Networks”](https://d2l.ai/chapter_convolutional-modern/index.html): AlexNet to ResNet and beyond, with code.
- Krizhevsky, Sutskever and Hinton, [“ImageNet Classification with Deep Convolutional Neural Networks”](https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks) (NIPS 2012).
- Liu et al., [“A ConvNet for the 2020s”](https://arxiv.org/abs/2201.03545) (CVPR 2022).

## Related

- [Neural networks](#neural-networks)
- [Vision-language models](#vision-language-models)
- [Image generation](#image-generation)
- [Making deep networks trainable](#trainable-deep-networks)
- [Edge and on-device AI](#edge-on-device)
- [Document and screen understanding](#document-screen-understanding)
