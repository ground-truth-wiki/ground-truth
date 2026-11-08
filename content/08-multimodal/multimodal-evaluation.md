---
id: multimodal-evaluation
book: 8
order: "8.8"
title: Evaluating multimodal and generative models
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [multimodal-evaluation, fid, clip-score, mos, vlm-benchmarks, human-preference]
visuals:
  - multimodal-evaluation-question-tree:tree
  - multimodal-evaluation-fid-stepper:stepper
  - multimodal-evaluation-wer-calculator:calculator
prerequisites: [why-evals, metrics-graders]
---
> [!tldr]
> Generated media has no single right answer, so evaluation asks separate questions: does the set look real, does each output match its prompt, do people prefer it, is it faithful to a target, and did an understanding model read its input correctly? Every automatic metric hides a feature extractor, preprocessing and a blind spot, so report the setup with every score.

## Why it matters

Multimodal scores move for reasons other than quality. Matching ImageNet class statistics can lower FID without better images (Kynkäänniemi et al., [“The Role of ImageNet Classes in Fréchet Inception Distance”](https://arxiv.org/abs/2203.06026) (2022)). Text normalization alone cut Whisper’s word error rate by up to 50 percent on some datasets (Radford et al., [“Robust Speech Recognition via Large-Scale Weak Supervision”](https://arxiv.org/abs/2212.04356) (2022)). Gemini Pro scored 42.9% on MMMU with no image (Chen et al., [“Are We on the Right Way for Evaluating Large Vision-Language Models?”](https://arxiv.org/abs/2403.20330) (2024)). Here, [metrics and graders](#metrics-graders) meet pixels and waveforms.

## Intuition

One prompt allows many valid images, so no single correct output exists. Judging a generative model is like judging a cooking school, not one dish. Do its dishes, together, resemble real cuisine? Does each match its order? Do diners like it? How close is a dish to its recipe photo? Models that read images or audio sit an exam instead. Each question needs its own metrics.

```viz
{"id":"multimodal-evaluation-question-tree","component":"tree","title":"Five questions, five metric families: name the question before you pick the metric","caption":"Expand a question to see the metrics that answer it and what they miss. A report that mixes families into one score hides which question moved.","alt":"Tree with five evaluation questions. Does the set look like real data: FID, KID and CMMD for images, FVD for video, FAD for audio. Does each output match its prompt: CLIPScore, object checks such as GenEval, VQA-based scores such as VQAScore. Do people prefer it: pairwise studies, arenas, learned preference models. Is it faithful to a target: PSNR, SSIM, LPIPS, DreamSim. Did the model read its input correctly: VLM benchmarks, hallucination probes, WER, CER, DER and TEDS.","data":"illustrative","try":"Open “Does each output match its prompt?” and ask which branch would catch a wrong object count.","open":1,"root":{"label":"What do you need to know?","children":[
{"label":"Does the set of outputs look like real data?","children":[{"label":"Images: FID, KID, CMMD"},{"label":"Video: FVD. Audio: FAD"},{"label":"Misses: whether any single output matches its prompt"}]},
{"label":"Does each output match its prompt?","children":[{"label":"CLIPScore: cheap, weak on relations, binding and word order"},{"label":"Object checks (GenEval) and VQA-based scores (VQAScore)"},{"label":"Misses: whether the output looks good"}]},
{"label":"Do people prefer it?","children":[{"label":"Blind pairwise studies and arenas"},{"label":"Learned preference models: ImageReward, PickScore, HPS v2"},{"label":"Misses: your users’ taste, unless they are the raters"}]},
{"label":"Is it faithful to a known target?","children":[{"label":"PSNR and SSIM: pixel error and local structure"},{"label":"LPIPS and DreamSim: perceptual similarity"},{"label":"For editing, codecs, super-resolution and 3D views"}]},
{"label":"Did the model read its input correctly?","children":[{"label":"VLM benchmarks: VQA, DocVQA, ChartQA, MMMU, Video-MME","link":"#vision-language-models"},{"label":"Hallucination probes: CHAIR, POPE"},{"label":"Speech: WER, CER, DER","link":"#speech-audio"},{"label":"Tables: TEDS","link":"#document-screen-understanding"}]}]}}
```

## How it works

**Distribution metrics.** FID embeds real and generated images with Inception-v3, fits a Gaussian to each set and measures their distance (Heusel et al., [“GANs Trained by a Two Time-Scale Update Rule Converge to a Local Nash Equilibrium”](https://arxiv.org/abs/1706.08500) (2017); formula from the [reference code](https://github.com/bioinf-jku/TTUR)):

```math
\text{FID} = \lVert \mu_r - \mu_g \rVert^2 + \operatorname{Tr}\left(\Sigma_r + \Sigma_g - 2\,(\Sigma_r \Sigma_g)^{1/2}\right)
```

```viz
{"id":"multimodal-evaluation-fid-stepper","component":"stepper","title":"FID is a five-step pipeline, and every step can change the number","caption":"Illustrative walk through the standard FID recipe. Each step names the setting you must report with the score.","alt":"Stepper over the FID pipeline: draw real and generated samples, resize to 299 by 299 pixels, extract 2,048-dimensional Inception-v3 features, fit a mean and covariance per set, compute the Fréchet distance.","data":"illustrative","depicts":"FID as defined by Heusel et al. (2017) and its reference implementation","try":"Before the Embed step, predict what happens to FID if the generator matches ImageNet class frequencies but not image quality.","diagram":{"w":600,"h":56,"nodes":[{"id":"sets","label":"Samples","role":"data","align":"center","glyph":false,"x":0,"y":0,"w":104,"h":56},{"id":"resize","label":"Resize","role":"tool","align":"center","glyph":false,"x":124,"y":0,"w":104,"h":56},{"id":"embed","label":"Inception\nfeatures","role":"model","align":"center","glyph":false,"x":248,"y":0,"w":104,"h":56},{"id":"fit","label":"Mean and\ncovariance","role":"tool","align":"center","glyph":false,"x":372,"y":0,"w":104,"h":56},{"id":"dist","label":"Fréchet\ndistance","role":"tool","align":"center","glyph":false,"x":496,"y":0,"w":104,"h":56}],"edges":[{"from":"sets","to":"resize"},{"from":"resize","to":"embed"},{"from":"embed","to":"fit"},{"from":"fit","to":"dist"}]},
"frames":[
{"label":"Sample","highlight":["sets"],"caption":"Draw N real and N generated images. The FID estimate is biased and depends on N, so scores compare only at the same N. The reference code recommends at least 10,000."},
{"label":"Resize","highlight":["resize"],"caption":"Inception-v3 takes 299 × 299 inputs. Aliasing resizers and JPEG compression shift FID by more than the gap between published methods."},
{"label":"Embed","highlight":["embed"],"caption":"Each image becomes a 2,048-dimensional pool3 feature vector. These features sit close to ImageNet classes, so matching class frequencies can lower FID without better images."},
{"label":"Fit","highlight":["fit"],"caption":"Each set is summarized by a mean vector and a covariance matrix, as if the features were Gaussian. With fewer samples than dimensions, the covariance is not full rank and its square root gives complex numbers or NaNs."},
{"label":"Compare","highlight":["dist"],"caption":"The distance adds the squared gap between the means and a covariance term. Zero means identical statistics; lower is better. Report N, resizer, feature network and reference set with the score."}]}
```

The stepper’s warnings come from Bińkowski et al., [“Demystifying MMD GANs”](https://arxiv.org/abs/1801.01401) (2018), Parmar et al., [“On Aliased Resizing and Surprising Subtleties in GAN Evaluation”](https://arxiv.org/abs/2104.11222) (2021) and Kynkäänniemi et al. KID (Bińkowski et al.) swaps the Gaussian fit for a kernel MMD with an unbiased estimator. CMMD, a proposed replacement, uses CLIP embeddings (Jayasumana et al., [“Rethinking FID: Towards a Better Evaluation Metric for Image Generation”](https://arxiv.org/abs/2401.09603) (2023)). I3D video features give FVD ([Unterthiner et al., 2018](https://arxiv.org/abs/1812.01717)), which favors per-frame quality over motion ([Ge et al., 2024](https://arxiv.org/abs/2404.12391)); VGGish audio features give FAD ([Kilgour et al., 2018](https://arxiv.org/abs/1812.08466)).

**Alignment metrics.** CLIPScore is 2.5 × max(cos, 0) over CLIP image and text embeddings (Hessel et al., [“CLIPScore: A Reference-free Evaluation Metric for Image Captioning”](https://arxiv.org/abs/2104.08718) (2021)). CLIP-style encoders act like bags of words ([Yuksekgonul et al., 2022](https://arxiv.org/abs/2210.01936)), so CLIPScore can confuse a prompt with its reversal. [GenEval](https://arxiv.org/abs/2310.11513) (Ghosh et al., 2023) checks objects, counts and positions with a detector, then colors with a classifier on each detected object. VQAScore takes a VQA model’s probability of “Yes” to “Does this figure show {text}?” (Lin et al., [“Evaluating Text-to-Visual Generation with Image-to-Text Generation”](https://arxiv.org/abs/2404.01291) (2024), which also introduced GenAI-Bench).

**Human preference.** [GenAI-Arena](https://arxiv.org/abs/2406.04485) (Jiang et al., 2024) crowdsourced blind pairwise votes; GPT-4o predicted them with 49.19% average accuracy, so image judges need [calibration](#llm-as-judge) too. [ImageReward](https://arxiv.org/abs/2304.05977) (Xu et al., 2023), [PickScore](https://arxiv.org/abs/2305.01569) (Kirstain et al., 2023) and [HPS v2](https://arxiv.org/abs/2306.09341) (Wu et al., 2023) learn scorers from human preference comparisons. ImageReward’s paper also tunes diffusion models directly against its scorer. Used as rewards ([preference optimization](#preference-optimization)), scorers can be gamed: a DDPO model learned to write text that fooled its VLM judge (Black et al., [“Training Diffusion Models with Reinforcement Learning”](https://arxiv.org/abs/2305.13301) (2023)).

**Reference metrics.** Editing, codecs, super-resolution and 3D views have a target. PSNR scores pixel error and SSIM local structure (Wang et al., [“Image quality assessment: From error visibility to structural similarity”](https://www.cns.nyu.edu/~lcv/ssim/) (2004)). LPIPS ([Zhang et al., 2018](https://arxiv.org/abs/1801.03924)) and [DreamSim](https://arxiv.org/abs/2306.09344) (Fu et al., 2023) track human similarity judgments better. NeRF reports PSNR, SSIM and LPIPS on held-out views ([Mildenhall et al., 2020](https://arxiv.org/abs/2003.08934)).

**Video.** [VBench](https://arxiv.org/abs/2311.17982) (Huang et al., 2023) scores 16 dimensions, each validated against human preference annotations. On Physics-IQ, the models tested showed limited physical understanding, unrelated to their visual realism ([Motamed et al., 2025](https://arxiv.org/abs/2501.09038)); see [video and world models](#video-world-models).

**Speech and audio.** WER = (S + D + I) / N over reference words ([Hugging Face Evaluate](https://github.com/huggingface/evaluate/blob/main/metrics/wer/README.md)), after one normalizer on both sides; languages without spaces use CER (Radford et al.).

```viz
{"id":"multimodal-evaluation-wer-calculator","component":"calculator","title":"Normalization alone moves word error rate from 83% to 0% on the same transcript","caption":"Illustrative example. Reference “Dr. Smith paid $20 for it.” and hypothesis “doctor smith paid twenty dollars for it” mean the same thing. Raw, the best alignment has 4 substitutions and 1 insertion over 6 reference words. After lowercasing and removing punctuation and symbols, 2 substitutions and 1 insertion remain. Writing abbreviations and numbers the same way on both sides leaves none: Whisper’s English normalizer turns both into “doctor smith paid $20 for it”.","alt":"Calculator: word error rate equals substitutions plus deletions plus insertions, divided by the number of reference words.","data":"formula","try":"Set substitutions to 2 for the lowercased pair, then set insertions to 12 to see WER pass 100%.","inputs":{"substitutions":4,"deletions":0,"insertions":1,"reference_words":6},"input_meta":{"substitutions":{"label":"Substitutions","min":0,"step":1},"deletions":{"label":"Deletions","min":0,"step":1},"insertions":{"label":"Insertions","min":0,"step":1},"reference_words":{"label":"Words in the reference","min":1,"step":1}},"outputs":[{"id":"errors","label":"Word errors","expr":"substitutions + deletions + insertions","unit":"count"},{"id":"wer","label":"Word error rate","expr":"errors / reference_words","unit":"pct","main":true}],"assumptions":["Counts come from a minimum edit-distance alignment of the hypothesis to the reference.","Insertions are not capped, so WER can exceed 100%.","Both sides went through the same normalizer; WERs from different normalizers are not comparable."],"tests":[{"inputs":{},"expect":{"errors":5,"wer":0.8333333},"tol":0.0001},{"inputs":{"substitutions":2},"expect":{"wer":0.5}},{"inputs":{"substitutions":0,"insertions":12},"expect":{"wer":2}}]}
```

ITU-T [P.800](https://www.itu.int/rec/T-REC-P.800-199608-I) listening tests rate speech from 1 (Bad) to 5 (Excellent) and average to a MOS, with reference conditions so labs can compare; a paired variant yields CMOS. [P.808](https://www.itu.int/rec/T-REC-P.808) crowdsources this, with qualification, trapping and gold questions ([Naderi and Cutler, 2020](https://arxiv.org/abs/2005.08138)). MOS predictors such as [UTMOS](https://arxiv.org/abs/2204.02152) (Saeki et al., 2022) struggle with unseen speakers and listeners, and with unseen systems rated in a different listening test ([Huang et al., 2022](https://arxiv.org/abs/2203.11389)). Voice cloning adds speaker-verification similarity and ASR-based WER ([VALL-E](https://arxiv.org/abs/2301.02111), Wang et al., 2023). DER sums false alarm, missed speech and speaker confusion over reference speech, and depends on collar and overlap settings ([pyannote.metrics](https://pyannote.github.io/pyannote-metrics/reference.html)).

**Understanding benchmarks.** Most vision-language benchmarks are question answering: [VQA v2](https://arxiv.org/abs/1612.00837), [DocVQA](https://arxiv.org/abs/2007.00398), [ChartQA](https://arxiv.org/abs/2203.10244), [MMMU](https://arxiv.org/abs/2311.16502), [MathVista](https://arxiv.org/abs/2310.02255), [MME](https://arxiv.org/abs/2306.13394), [Video-MME](https://arxiv.org/abs/2405.21075) and [OCRBench](https://arxiv.org/abs/2305.07895). CHAIR measures how often captions name objects that the image’s COCO annotations do not contain, per object and per caption ([Rohrbach et al., 2018](https://arxiv.org/abs/1809.02156)). POPE asks “Is there a {object} in the image?” with random, popular and adversarial absent objects, reporting accuracy, precision, recall, F1 and the share of “yes” answers (Li et al., [“Evaluating Object Hallucination in Large Vision-Language Models”](https://arxiv.org/abs/2305.10355) (2023)). TEDS scores parsed tables by tree edit distance over HTML ([Zhong et al., 2019](https://arxiv.org/abs/1911.10683)); see [document understanding](#document-screen-understanding).

**Contamination and shortcuts.** MMStar’s authors found leaked and text-answerable items (Chen et al.). MMMU-Pro drops text-answerable questions, adds options up to 10 and embeds questions in images; scores fell by 16.8 to 26.9 percentage points against MMMU across the models tested ([Yue et al., 2024](https://arxiv.org/abs/2409.02813)). See [benchmark literacy](#benchmark-literacy).

## In practice

Public benchmarks shortlist; your own set decides ([building eval datasets](#eval-datasets)). Sample real inputs and tag slices: modality, input quality, language and accent, and skills such as counting or text rendering. Ask each question once without its image or audio, and flag what still gets answered. Store images losslessly with a fixed resizer. Report per slice with intervals ([statistics for evals](#eval-statistics)). Per-slice error rates with Whisper’s normalizers and jiwer (APIs as of November 2026):

```python
# pip install jiwer openai-whisper pandas
import jiwer
import pandas as pd
from whisper.normalizers import BasicTextNormalizer, EnglishTextNormalizer

CHAR_LANGS = {"zh", "ja", "th", "lo", "my"}  # written without spaces: score per character
english, basic = EnglishTextNormalizer(), BasicTextNormalizer()

def normalize(text: str, lang: str) -> str:
    text = english(text) if lang == "en" else basic(text)
    return text.replace(" ", "") if lang in CHAR_LANGS else text

# One row per utterance: reference, hypothesis, language, condition ("clean", "street", ...).
df = pd.read_json("asr_eval.jsonl", lines=True)

rows = []
for (lang, condition), g in df.groupby(["language", "condition"]):
    refs = [normalize(t, lang) for t in g["reference"]]
    hyps = [normalize(t, lang) for t in g["hypothesis"]]
    score = jiwer.cer if lang in CHAR_LANGS else jiwer.wer  # corpus-level rate over the slice
    rows.append({"language": lang, "condition": condition, "n": len(g),
                 "metric": score.__name__, "error_rate": score(refs, hyps)})

print(pd.DataFrame(rows).sort_values("error_rate", ascending=False))
```

## Numbers to know

> [!number]
> From the cited sources, as of November 2026. FID needs more samples than its 2,048 feature dimensions; the reference code recommends 10,000 or more. Saving real FFHQ images as JPEG at quality 75 gave an FID of 21 against the PNG originals, while recent methods are typically within 1 FID of each other on FFHQ (Parmar et al.). With CLIP ViT-B/32, raw image-text cosines ranged from about 0 to 0.4, hence CLIPScore’s factor 2.5 (Hessel et al.). Rule of thumb: a gap smaller than the shift a preprocessing change causes is noise.

## Pitfalls and anti-patterns

> [!pitfall] Comparing FID across pipelines
> Sample size, resizer, compression, feature network and reference set all move FID. Recompute every model in one pipeline, such as clean-fid.

> [!pitfall] Evaluating with the reward you trained on
> A scorer used as the reward stops being an independent measure. Keep a metric you did not train on, and a human study.

- **MOS without anchors.** Without reference conditions, MOS from two tests cannot be sensibly compared (P.800).
- **Blind-solvable items.** If text alone answers it, it is not a vision test.

## Talk like an expert

The vocabulary: **FID**, **CMMD**, **CLIPScore**, **VQAScore**, **reward hacking**, **LPIPS**, **MOS**, **WER**, **TEDS**, **blind baseline**. Experts name the axis before the metric (distribution, alignment, preference, fidelity or understanding) and ask for N, resizer and feature network with every FID. Open debates: should CMMD replace FID despite years of comparable FID results, and can learned scorers replace human studies?

> [!hottake] For product decisions on generated media, a small blind pairwise human study beats every automatic metric.
> **The counterargument:** human studies are slow, costly and may not reflect your users. Automatic metrics run on every commit and catch regressions between studies.

## Check yourself

```quiz
multimodal-evaluation
```

## Go deeper

- Parmar et al., [“On Aliased Resizing and Surprising Subtleties in GAN Evaluation”](https://arxiv.org/abs/2104.11222) (2021), and its clean-fid library.
- ITU-T [P.800, “Methods for subjective determination of transmission quality”](https://www.itu.int/rec/T-REC-P.800-199608-I) (1996).

## Related

- [Metrics and graders](#metrics-graders)
- [Benchmark literacy](#benchmark-literacy)
- [Image generation](#image-generation)
- [Speech and audio](#speech-audio)
- [Building eval datasets](#eval-datasets)
- [LLM-as-judge done right](#llm-as-judge)
