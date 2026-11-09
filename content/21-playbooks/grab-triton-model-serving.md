---
id: grab-triton-model-serving
book: 21
order: "21.40"
title: "Grab's Catwalk: replacing a legacy ONNX server with NVIDIA Triton"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [inference, serving-engines, platform-migration, cost-engineering, public-record]
visuals: []
type: playbook
account: public-record
industry: "Technology platform (Southeast Asian superapp for deliveries, mobility and digital financial services; internal ML platform)"
use_case: "Moving online ML model deployments on Catwalk, Grab's model serving platform, from a legacy ONNX server to NVIDIA Triton Inference Server without user code changes"
outcome: "Rolled out to over 50% of online model deployments within 10 days; average spend fell by ~ 20% across 11 migrated services within 14 days; p90 latency of some larger transformer models fell from 120ms to 20ms"
measured_how: "Share of online model deployments rolled out within 10 days of Triton's availability; infrastructure spend of 11 migrated production ML services, 14 days before against 14 days after each cut-over; latency of business-critical models before and after rollout (Grab Tech blog, October 2025)"
prerequisites: [serving-engines, latency-throughput]
replications: []
---
> [!tldr]
> Grab's model serving platform, Catwalk, is moving online model deployments from its legacy ONNX server to NVIDIA Triton Inference Server, offered as a drop-in replacement behind a proxy that translates requests from the old API. The team reports that Triton reached over 50% of online model deployments within 10 days and that average spend fell by "~ 20%" across a small cohort of 11 migrated services. Tail latency for larger models during request spikes is still open.

> [!note] From the public record
> Built from Grab's own published account, "Modernising Grab’s model serving platform with NVIDIA Triton Inference Server" (October 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Catwalk is Grab's platform for deploying ML models as production inference APIs. The post says it "powers hundreds of ML models and online deployments". It had progressively added support for ONNX, PyTorch, TensorFlow and vLLM. Maintaining several inference engines, keeping backward compatibility and managing deprecated components such as the ONNX server "introduced significant technical debt". The result was "increased latency, reduced throughput, and escalating costs", and larger models could no longer be served efficiently or cost-effectively by the legacy components.

## Why this approach

After evaluating other serving platforms, which the post does not name, the team analysed NVIDIA Triton in depth. It lists support for several frameworks, one API across them, optimisation for NVIDIA GPUs with performance on CPU-only environments and AWS Inferentia, regular upstream updates, and features such as dynamic batching and model ensembling. The post says its benchmarking demonstrated that NVIDIA Triton "delivers substantial enhancements in both performance and service stability compared to our existing solutions". The plan is one Triton engine in place of the various engines Catwalk manages, starting with ONNX. See [Serving engines](#serving-engines).

The post explains that, given how often migrations happen at Grab, "even exceptional performance improvements are often insufficient to fully motivate internal users to adopt new systems." So the team built the migration around compatibility.

## The approach

1. **Benchmark first.** The team tested Triton against the existing ONNX server under varying levels of request traffic, on one of Grab's core models. The results are published as an image (Table 1), which this page does not transcribe. See [Benchmarking inference servers](#inference-benchmarking).
2. **Set requirements.** API compatibility, zero downtime, all existing functionality kept, and minimal disruption to downstream services and users.
3. **Migrate centrally,** in the platform, not by each user.
4. **Build a "Triton manager"** with two parts. The **Triton server manager** downloads the model from remote storage, verifies the files, prepares per-model configurations, launches Triton and checks its health. A special mode keeps the command line interface of the old ONNX runtime server. The **Triton proxy** translates requests from the older API and forwards them to Triton, so users need no code changes.
5. **Ship with limited capabilities,** to put backward compatibility first.

## The stack

As of October 2025, as the post names it: Catwalk as the serving platform; NVIDIA Triton Inference Server, first for ONNX models; ONNX Runtime, whose thread settings the team profiled; and the in-house Triton manager. The results cover transformer-based and XGBoost models. TensorRT appears only as a possible further optimisation. The post does not state the hardware or instance types used.

## Results, and how they were measured

- **Rollout.** Within 10 days of Triton's availability, "we successfully rolled it out to over 50% of our online model deployments." Most users did not notice.
- **Benchmark capacity.** With a transformer-based model, "Triton demonstrated the ability to handle at least 5 times the traffic while maintaining excellent latency."
- **Latency on critical models.** "For some larger transformer models, the p90 latency decreased dramatically from 120ms to 20ms", while "the average latency remained steady at 4ms". Smaller XGBoost models kept their average latency at 2ms across regions. The introduction also reports some critical systems "achieving a 50% improvement in tail latency". See [Latency and throughput](#latency-throughput).
- **Cost on some models.** Triton cut cost for certain models, "with some achieving over 90% reductions due to its advanced optimisations."
- **Cost across a cohort.** The team compared the infrastructure spend of 11 migrated production ML services over the 14 days before each cut-over with the 14 days after. Despite staggered migration dates, "average spend fell by ~ 20% across this small cohort within 14 days."

**Not measured:** the post gives no absolute spend figures, does not say which models or how many saw the over 90% cost reductions or the change from 120ms to 20ms, gives its benchmark figures only as an image, and does not mention incidents or rollbacks. The caption of Figure 2 labels its dashed line p99, while the text reports p90.

## What failed

- **Tail latency under spikes.** The post notes that "higher tail latency still remains an issue when facing request spikes for larger models in production." The team is working on enabling batching through Triton, an effort that will involve model owners. See [Batching and scheduling](#batching-scheduling).
- **Partial scope.** The migration so far covers ONNX. Backward compatibility for other frameworks in the Triton manager is planned.
- **Early cost evidence.** The post calls the 11 services a "small cohort" and expects the absolute dollar savings to "scale proportionally" as more models and applications migrate.

## What the team would do differently

The post states no regrets. It says "Initial results are aligned with our benchmarks for the Triton migration", and names the painless migration for internal users as a takeaway: instead of asking for code changes, the team spent significant time "providing Triton as a drop-in inference engine". From profiling it names one low-effort tuning step: set the ONNX Runtime intra-op thread count to the number of physical CPU cores. "In most cases, this single change yields a healthy performance lift". See [Cost engineering](#cost-engineering).

The wiki's reading: most of the engineering described went into compatibility, a proxy for the old API and a mode for the old command line, not into the engine. The cost figure compares 14-day windows on 11 services, and the post describes no control group, so traffic changes in those windows could also affect it.

## Disclosure

None.

## Sources

- Daniel Tai, Siddharth Pandey, Richard Ryu, Do Khai Hung and Nguyen Nhat Minh, Grab, [“Modernising Grab’s model serving platform with NVIDIA Triton Inference Server”](https://engineering.grab.com/modernising-grab-model-serving-platform), Grab Tech blog, 21 October 2025.

## Related

- [About playbooks](#about-playbooks)
- [Serving engines](#serving-engines)
- [Benchmarking inference servers](#inference-benchmarking)
- [Batching and scheduling](#batching-scheduling)
- [Cost engineering](#cost-engineering)
