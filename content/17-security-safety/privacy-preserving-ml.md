---
id: privacy-preserving-ml
book: 17
order: "17.6.1"
title: Privacy-preserving machine learning
level: expert
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [differential-privacy, federated-learning, confidential-computing, tee, privacy]
visuals: []
prerequisites: [privacy, probability-information]
---
> [!tldr]
> Privacy-preserving machine learning limits what a model, a server or an operator can learn about the people behind the data. Differential privacy bounds what a trained model reveals about one unit of data, federated learning keeps raw data on devices, and confidential computing hides prompts and weights from the cloud that runs the model. Each technique stops a different adversary, so a privacy claim means little until you know whom it protects against and what unit it protects.

## Key ideas

- **Differential privacy bounds the influence of one unit of data.** A training algorithm \(M\) is (ε, δ)-differentially private if, for any two adjacent datasets \(d\) and \(d'\) and any set of outcomes \(S\), \(\Pr[M(d)\in S] \le e^{\varepsilon}\Pr[M(d')\in S] + \delta\); in the experiments of Abadi et al., two datasets are adjacent when one image-label pair is present in one and absent in the other. What counts as one unit (an event, a record, a sequence or a user) decides what is really protected, and NIST advises starting from the user level when you judge whether a unit is enough ([NIST SP 800-226, “Guidelines for Evaluating Differential Privacy Guarantees”](https://csrc.nist.gov/pubs/sp/800/226/final) (2025)).
- **An epsilon is an upper bound, and it adds up.** ε caps the privacy loss rather than measuring it, and the ε values of repeated analyses of the same data add up to a total privacy budget: ten analyses at ε = 0.1 spend ε = 1. NIST cites one study suggesting that ε = 0.1 generally gives strong protection and that values below 1 are considered reasonable, and notes that many deployments have used 1 < ε ≤ 20 and that large values may not give meaningful privacy ([NIST SP 800-226](https://csrc.nist.gov/pubs/sp/800/226/final) (2025)).
- **DP-SGD makes gradient descent private, at a cost in quality.** Each step clips every example's gradient to a norm bound, adds Gaussian noise to the sum, averages it and records the privacy cost with an accountant; the original paper reached 97% test accuracy on MNIST and 73% on CIFAR-10 at (8, 10⁻⁵)-differential privacy (Abadi et al., [“Deep Learning with Differential Privacy”](https://arxiv.org/abs/1607.00133) (2016)). VaultGemma 1B was pretrained from scratch with DP at ε ≤ 2.0 and δ ≤ 1.1 × 10⁻¹⁰ per 1024-token sequence; its authors put its quality near non-private models from about five years earlier and detected no memorization in about a million sampled training sequences (Sinha et al., [“VaultGemma: A Differentially Private Gemma Model”](https://arxiv.org/abs/2510.15001) (2025)).
- **Federated learning keeps raw data on devices, but updates still leak.** Federated averaging trains a shared model from updates computed on each device, with 10 to 100 times fewer communication rounds than synchronized SGD in the original experiments (McMahan et al., [“Communication-Efficient Learning of Deep Networks from Decentralized Data”](https://arxiv.org/abs/1602.05629) (2016)). Shared gradients can reveal training examples (Zhu et al., [“Deep Leakage from Gradients”](https://arxiv.org/abs/1906.08935) (2019)), a single participant can plant a backdoor in the joint model (Bagdasaryan et al., [“How To Backdoor Federated Learning”](https://arxiv.org/abs/1807.00459) (2018)), and secure aggregation lets the server learn only the sum of the updates, for 1.73 to 1.98 times the communication of sending 16-bit updates in the clear in the paper's analysis (Bonawitz et al., [“Practical Secure Aggregation for Privacy Preserving Machine Learning”](https://eprint.iacr.org/2017/281) (2017)).
- **Confidential inference protects prompts and weights from the operator.** GPU confidential computing keeps data, model weights and prompts protected while in use, and hardware-rooted attestation checks the environment before sensitive data is released to it; as of November 2026, NVIDIA offers it on Hopper, Blackwell and Rubin GPUs and states up to 98% of the performance of unsecured deployments ([NVIDIA confidential computing](https://www.nvidia.com/en-us/data-center/solutions/confidential-computing/)). Attestation tells a client which code runs on genuine hardware, not whether that code is trustworthy, so someone still has to be able to inspect it.
- **Verifiable designs go further than contracts.** Apple's Private Cloud Compute sets five requirements (stateless computation, enforceable guarantees, no privileged runtime access, non-targetability and verifiable transparency), and devices send requests only to nodes whose attested software appears in a public transparency log; Apple notes that researchers generally cannot verify a cloud service's promise not to log data, which is the weakness of a zero data retention contract (Apple Security Research, [“Private Cloud Compute: A new frontier for AI privacy in the cloud”](https://security.apple.com/blog/private-cloud-compute/) (2024)). On-device inference avoids the server entirely, and self-hosting moves the trust to your own operators (see [edge and on-device AI](#edge-on-device) and [enterprise readiness](#enterprise-readiness)).

## Planned visuals

- **`stepper`:** one DP-SGD step: per-example gradients, clipping to the norm bound, averaging, adding noise, the update, and the accountant's running ε.
- **`sequence`:** confidential inference with attestation: the client asks for an attestation report, checks the measurement against a published log, then sends an encrypted prompt that only the attested environment can read.
- **`tree`:** choosing a technique by threat model: who must not see the data (the public via the model, the server, the cloud operator, other tenants) and which technique, or combination, answers each.

## Talk like an expert

Experts name the adversary and the unit before the technique: “user-level DP at ε = 2” or “hidden from the cloud operator, not from the model's users”. They read ε only together with δ, the privacy unit and the accounting method, and they treat attestation as evidence of which code runs, not of what that code does.

## Go deeper

- Abadi et al., [“Deep Learning with Differential Privacy”](https://arxiv.org/abs/1607.00133) (2016).
- Near et al., [“Guidelines for Evaluating Differential Privacy Guarantees”](https://csrc.nist.gov/pubs/sp/800/226/final), NIST SP 800-226 (2025).
- Sinha et al., [“VaultGemma: A Differentially Private Gemma Model”](https://arxiv.org/abs/2510.15001) (2025).
- Apple Security Research, [“Private Cloud Compute: A new frontier for AI privacy in the cloud”](https://security.apple.com/blog/private-cloud-compute/) (2024).

## Related

- [Privacy](#privacy)
- [Enterprise readiness](#enterprise-readiness)
- [Adversarial machine learning](#adversarial-ml)
- [Model theft and weight security](#model-theft)
- [Edge and on-device AI](#edge-on-device)
- [Synthetic data](#synthetic-data)
