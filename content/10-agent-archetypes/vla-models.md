---
id: vla-models
book: 10
order: "10.8.1"
title: Vision-language-action models, robot data and sim-to-real
level: frontier
stability: volatile
reviewed: "2026-11"
status: seed
tags: [robotics, vision-language-action, imitation-learning, simulation, sim-to-real]
visuals: []
prerequisites: [embodied-agents, vision-language-models]
---
> [!tldr]
> A vision-language-action (VLA) model starts from a vision-language model and learns to turn camera images, an instruction and the robot's own state into motor actions. The recipe is pretraining across many robots, co-training with web data and fine-tuning on the target robot, and the bottleneck is robot data, gathered by teleoperation, hand-held devices and simulation. Remember that a policy that looks perfect in simulation or on a saturated benchmark can still fail on a real robot.

## Key ideas

- **From actions as text to a model family.** RT-2 expressed robot actions as text tokens, co-fine-tuned vision-language models on robot trajectories together with Internet-scale vision-language tasks, and named the category vision-language-action models (Brohan et al., [“RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control”](https://arxiv.org/abs/2307.15818) (2023)). OpenVLA, a 7B open model built on Llama 2 with fused DINOv2 and SigLIP visual features and trained on 970k real robot demonstrations, beat the 55B RT-2-X by 16.5% absolute task success across 29 tasks (Kim et al., [“OpenVLA: An Open-Source Vision-Language-Action Model”](https://arxiv.org/abs/2406.09246) (2024)), and Gemini Robotics, a VLA built on Gemini 2.0, builds on Gemini Robotics-ER, a model for embodied reasoning such as pointing, grasp prediction and 3D bounding boxes (Gemini Robotics Team, [“Gemini Robotics: Bringing AI into the Physical World”](https://arxiv.org/abs/2503.20020) (2025)).
- **How actions are represented decides what the model can learn.** Per-dimension, per-timestep binning performs poorly on high-frequency dexterous data, so FAST compresses action sequences with the discrete cosine transform and, combined with π0, matched diffusion-based VLAs while cutting training time by up to 5x (Pertsch et al., [“FAST: Efficient Action Tokenization for Vision-Language-Action Models”](https://arxiv.org/abs/2501.09747) (2025)). Continuous heads are the other route: π0 puts a flow-matching model on a pretrained VLM and observes several camera images, a language command and the robot's joint angles (Black et al., [“π0: A Vision-Language-Action Flow Model for General Robot Control”](https://arxiv.org/abs/2410.24164) (2024)), GR00T N1 pairs a vision-language System 2 with a diffusion-transformer System 1 that generates motor actions in real time (Bjorck et al., [“GR00T N1: An Open Foundation Model for Generalist Humanoid Robots”](https://arxiv.org/abs/2503.14734) (2025)), and Action Chunking with Transformers (ACT) learns a generative model over action sequences, reaching 80 to 90% success on 6 difficult real-world tasks from about 10 minutes of demonstrations collected with a custom teleoperation interface (Zhao et al., [“Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware”](https://arxiv.org/abs/2304.13705) (2023)).
- **The recipe: pretrain across robots, co-train with web data, fine-tune on yours.** Open X-Embodiment pooled data from 22 robots at 21 institutions covering 527 skills, and the RT-X models trained on it showed positive transfer between platforms (Open X-Embodiment Collaboration, [“Open X-Embodiment: Robotic Learning Datasets and RT-X Models”](https://arxiv.org/abs/2310.08864) (2023)); π0.5 co-trains on data from multiple robots, high-level semantic prediction and web data, and cleaned kitchens and bedrooms in homes it had never seen (Physical Intelligence, [“π0.5: a Vision-Language-Action Model with Open-World Generalization”](https://arxiv.org/abs/2504.16054) (2025)). On the target robot, the OpenVLA-OFT fine-tuning recipe (parallel decoding, action chunking, continuous actions and an L1 regression objective) raised OpenVLA's average success on the four LIBERO suites from 76.5% to 97.1% and its action throughput 26-fold (Kim et al., [“Fine-Tuning Vision-Language-Action Models: Optimizing Speed and Success”](https://arxiv.org/abs/2502.19645) (2025)).
- **Robot data is the bottleneck, so collection is engineering.** The Universal Manipulation Interface collects in-the-wild demonstrations with hand-held grippers and no robot, and its policies are hardware-agnostic across robot platforms (Chi et al., [“Universal Manipulation Interface: In-The-Wild Robot Teaching Without In-The-Wild Robots”](https://arxiv.org/abs/2402.10329) (2024)), while DROID gathered 76k demonstration trajectories, 350 hours across 564 scenes and 84 tasks, from 50 collectors over 12 months (Khazatsky et al., [“DROID: A Large-Scale In-The-Wild Robot Manipulation Dataset”](https://arxiv.org/abs/2403.12945) (2024)). As of November 2026, the LeRobotDataset v3.0 format stores states and actions in Parquet, camera frames in MP4 and episode metadata separately, and streams datasets from the Hugging Face Hub ([LeRobotDataset v3.0 docs](https://huggingface.co/docs/lerobot/lerobot-dataset-v3)).
- **Simulation is cheap, but the reality gap is real.** Domain randomization trained an object detector only on simulated images with non-realistic random textures, and it was still accurate to 1.5 cm in the real world (Tobin et al., [“Domain Randomization for Transferring Deep Neural Networks from Simulation to the Real World”](https://arxiv.org/abs/1703.06907) (2017)), and automatic domain randomization generates randomized environments of ever-increasing difficulty, which let a policy trained only in simulation solve a Rubik's cube with a real humanoid robot hand (OpenAI et al., [“Solving Rubik's Cube with a Robot Hand”](https://arxiv.org/abs/1910.07113) (2019)). Behavior cloning itself is covered in [imitation learning and offline RL](#imitation-offline-rl).
- **Evaluation and inference are both bottlenecks.** LIBERO has 130 tasks in four suites (Liu et al., [“LIBERO: Benchmarking Knowledge Transfer for Lifelong Robot Learning”](https://arxiv.org/abs/2306.03310) (2023)), and averages above 97% leave it little headroom, so real-to-sim setups such as SIMPLER, whose simulated scores correlate strongly with real-world performance, help bridge to costly real trials (Li et al., [“Evaluating Real-World Robot Manipulation Policies in Simulation”](https://arxiv.org/abs/2405.05941) (2024)). At run time the control loop cannot wait for the model: SmolVLA separates perception and action prediction from execution so the robot runs at higher control rates with chunked actions, and runs on consumer hardware including CPUs (Shukor et al., [“SmolVLA: A Vision-Language-Action Model for Affordable and Efficient Robotics”](https://arxiv.org/abs/2506.01844) (2025)).

## Planned visuals

- `diagram`: inside a VLA, as variants: actions as discrete tokens from the language model (RT-2, OpenVLA, FAST), and a VLM backbone with a continuous flow-matching or diffusion action head (π0, GR00T N1), each fed by several cameras, the instruction and the robot's state.
- `timeline`: the lineage with dates and one line each, from RT-2 and Open X-Embodiment through OpenVLA, π0, GR00T N1, Gemini Robotics, π0.5 and SmolVLA, stamped as of November 2026.
- `stepper`: receding-horizon execution of action chunks: the model predicts a chunk, the robot executes part of it at its control rate while the next chunk is computed, and the plan is replaced when a new observation arrives.

## Talk like an expert

Experts talk about **VLAs**, **action tokenization** versus **flow-matching** or **diffusion heads**, **action chunking**, **cross-embodiment** pretraining, **co-training**, **teleoperation**, **proprioception**, **control frequency**, **domain randomization** and the **sim-to-real gap**, and they judge a robot result by success rates on unseen objects and scenes in real trials, not by demo videos or a saturated benchmark.

## Go deeper

- Brohan et al., [“RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control”](https://arxiv.org/abs/2307.15818) (2023).
- Kim et al., [“OpenVLA: An Open-Source Vision-Language-Action Model”](https://arxiv.org/abs/2406.09246) (2024).
- Black et al., [“π0: A Vision-Language-Action Flow Model for General Robot Control”](https://arxiv.org/abs/2410.24164) (2024).
- [LeRobotDataset v3.0 docs](https://huggingface.co/docs/lerobot/lerobot-dataset-v3), for recording, loading and streaming robot data.

## Related

- [Embodied and robotics agents](#embodied-agents)
- [Vision-language models](#vision-language-models)
- [Video, 3D and world models](#video-world-models)
- [Imitation learning and offline RL](#imitation-offline-rl)
- [Reinforcement learning primer](#rl-primer)
- [Synthetic data](#synthetic-data)
