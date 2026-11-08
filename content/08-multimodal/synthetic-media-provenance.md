---
id: synthetic-media-provenance
book: 8
order: "8.9"
title: Synthetic media, provenance and deepfakes
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [content-provenance, c2pa, watermarking, deepfakes, detection, ai-act]
visuals: []
prerequisites: [image-generation, responsible-ai]
---
> [!tldr]
> Generated images, voices, video and text can impersonate people, enable fraud and abuse, and pollute the information people rely on. No single tool settles what is real: signed provenance (C2PA Content Credentials), invisible watermarks, fingerprints and detectors each cover a different gap, and since August 2026 the EU requires machine-readable marking and deepfake disclosure. Remember that a credential proves origin only while it survives, a watermark survives only some edits, and a detector gives a probability, never proof.

## Key ideas

- **Know the harms, then layer the tools.** NIST names information integrity, synthetic child sexual abuse material (CSAM), non-consensual intimate imagery (NCII) and fraud, such as synthetic voices or video that fool biometric checks or trick people into transactions, and notes that showing content is authentic does not make it trustworthy, since authentic content can still mislead. Its toolbox is provenance data tracking and metadata, watermarking and labeling, synthetic content detection, and testing and auditing of those tools, combined as defense in depth for high-risk uses (NIST, [AI 100-4: Reducing Risks Posed by Synthetic Content](https://www.nist.gov/publications/reducing-risks-posed-synthetic-content-overview-technical-approaches-digital-content) (November 2024)).
- **C2PA Content Credentials: a signed history attached to the file.** A manifest bundles assertions, such as the actions performed on an asset and the ingredients it was made from, into a claim that the signer signs with a private key; a hard binding (a cryptographic hash) ties the manifest to the exact asset, a soft binding (a fingerprint or an invisible watermark) lets a “durable” credential be found again in a manifest repository after the metadata is stripped, and validators check the signer's certificate against the C2PA Trust List. As of November 2026 the current version is 2.5, dated October 2026 ([C2PA Content Credentials Technical Specification 2.5](https://spec.c2pa.org/specifications/specifications/2.5/specs/C2PA_Specification.html)).
- **Watermarks are deployed, and they can be removed or forged.** As of November 2026, Google DeepMind's SynthID embeds watermarks in generated images, audio, video and text, for images and video designed to withstand cropping, filters and lossy compression, and the Gemini app and the SynthID Detector portal check uploaded images, video and audio for them ([Google DeepMind SynthID](https://deepmind.google/models/synthid/)). Saberi et al. show that diffusion purification removes subtle image watermarks with minimal visible change, and that an attacker with only black-box access can add a watermark pattern to real images so that they are falsely flagged as watermarked (Saberi et al., [“Robustness of AI-Image Detectors: Fundamental Limits and Practical Attacks”](https://arxiv.org/abs/2310.00076) (2023)).
- **Detectors generalize poorly; fingerprints match only what is known.** A real-versus-fake classifier trained on GAN images fails on images from newer kinds of generative models, because its “real” class absorbs anything it has not learned to call fake (Ojha et al., [“Towards Universal Fake Image Detectors that Generalize Across Generative Models”](https://arxiv.org/abs/2302.10174) (2023)). Perceptual hashes take the opposite approach and match copies of content already on file: Meta's PDQ hash tries to match images that people perceive as similar, and its reference implementation suggests a distance of 31 or less as a starting threshold for a match, to be tuned on your own data ([PDQ in facebook/ThreatExchange](https://github.com/facebook/ThreatExchange/tree/main/pdq)).
- **The law, as of November 2026 (not legal advice).** Under EU AI Act Article 50, providers of generative systems must mark outputs in a machine-readable, detectable way, and deployers must disclose deepfakes and AI-generated text published to inform the public on matters of public interest, unless that text had human review and someone holds editorial responsibility; the duties apply from 2 August 2026 ([Article 50](https://artificialintelligenceact.eu/article/50/)), systems already on the market before then have until 2 December 2026 for the marking duty ([Regulation (EU) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng)), and the Commission and the AI Board have confirmed the voluntary Code of Practice published on 10 June 2026 as an adequate tool to show compliance ([European Commission](https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content)). Other jurisdictions differ: China's labeling measures, in force since 1 September 2025, require explicit labels that people can perceive on certain generated content, and implicit labels in the file metadata ([Cyberspace Administration of China](https://www.cac.gov.cn/2025-03/14/c_1743654684782215.htm)).
- **An engineering checklist.** Sign at generation and record what made the file, for example with the IPTC digital source types “trainedAlgorithmicMedia” (created using generative AI) and “compositeWithTrainedAlgorithmicMedia” (edited using generative AI) ([IPTC Digital Source Type vocabulary](https://cv.iptc.org/newscodes/digitalsourcetype/)). Expect the metadata to disappear, since many platforms strip at least some metadata from uploaded files ([NIST AI 100-4](https://www.nist.gov/publications/reducing-risks-posed-synthetic-content-overview-technical-approaches-digital-content)), so add a watermark or fingerprint as a soft binding that can find the credential again ([C2PA 2.5](https://spec.c2pa.org/specifications/specifications/2.5/specs/C2PA_Specification.html)). Then test the watermarking, detection and provenance tools you rely on, which NIST lists as an approach of its own.

## Planned visuals

- `diagram`: a C2PA manifest store inside an image file: assertions (actions, ingredients), the claim, the claim signature, the hard binding to the pixels and a soft binding to a manifest repository, with the trust list beside the validator.
- `stepper`: one generated image through a publishing pipeline: signed at generation, resized, re-encoded by a platform that strips metadata, recovered through its watermark or fingerprint, and shown to a viewer with a label, marking at each step which signal survives.
- `matrix`: provenance metadata, watermarks, fingerprints and classifiers against what each proves, what removes it, who can check it and where it fails.

## Talk like an expert

Experts talk about provenance versus detection, manifests, claims and assertions, hard and soft bindings, durable content credentials, trust lists, digital source types, watermark robustness, removal and spoofing, and perceptual hashing. They frame the problem as layered evidence across the pipeline from creation to publication to viewing, and they never treat a single detector score as a verdict.

## Go deeper

- NIST, [AI 100-4: Reducing Risks Posed by Synthetic Content](https://www.nist.gov/publications/reducing-risks-posed-synthetic-content-overview-technical-approaches-digital-content) (November 2024).
- C2PA, [Content Credentials Technical Specification 2.5](https://spec.c2pa.org/specifications/specifications/2.5/specs/C2PA_Specification.html) (October 2026).
- Saberi et al., [“Robustness of AI-Image Detectors: Fundamental Limits and Practical Attacks”](https://arxiv.org/abs/2310.00076) (2023).
- [EU AI Act Article 50](https://artificialintelligenceact.eu/article/50/).

## Related

- [Image generation](#image-generation)
- [Responsible AI in practice](#responsible-ai)
- [Governance, regulation and law](#governance-regulation)
- [Speech synthesis and voice cloning](#speech-synthesis)
- [Video generation models](#video-generation)
- [Data licensing, copyright and consent](#data-licensing-consent)
