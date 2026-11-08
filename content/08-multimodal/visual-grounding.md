---
id: visual-grounding
book: 8
order: "8.7"
title: Visual grounding, detection and segmentation
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [object-detection, segmentation, visual-grounding, gui-grounding, open-vocabulary]
visuals: []
prerequisites: [vision-language-models]
---
> [!tldr]
> Visual grounding ties words to pixels: boxes around objects, masks over them, and the one region that a phrase or an instruction refers to, from “the red mug” to “the Save button”. Specialist detectors and promptable segmenters do this fast and precisely, and vision-language models (VLMs) now output boxes and points as well, which makes grounding the eyes of computer-use agents. Remember that a coordinate means nothing until you know which image size and which convention it refers to.

## Key ideas

- **The classic tasks and how they are scored.** Detection draws a box around each object, instance segmentation a mask per object, semantic segmentation a class per pixel, and referring expression comprehension finds the one object a phrase describes; overlap is measured as intersection over union (IoU), the area two regions share divided by the area they cover together. COCO labels 2.5 million instances of 91 object types in 328k images, each with its own segmentation mask (Lin et al., [“Microsoft COCO: Common Objects in Context”](https://arxiv.org/abs/1405.0312) (2014)), and its evaluation code averages precision over ten IoU thresholds from 0.50 to 0.95 in steps of 0.05, split by object size and capped at 1, 10 or 100 detections per image ([pycocotools `cocoeval.py`](https://github.com/cocodataset/cocoapi/blob/master/PythonAPI/pycocotools/cocoeval.py)).
- **Open-vocabulary detection: name the object, get a box.** OWL-ViT adapts a contrastively pretrained image-text vision transformer to detection, so it can find objects from a text query or from one example image (Minderer et al., [“Simple Open-Vocabulary Object Detection with Vision Transformers”](https://arxiv.org/abs/2205.06230) (2022)). Grounding DINO accepts category names or referring expressions and reaches 52.5 AP on COCO without any COCO training data (Liu et al., [“Grounding DINO: Marrying DINO with Grounded Pre-Training for Open-Set Object Detection”](https://arxiv.org/abs/2303.05499) (2023)).
- **Promptable segmentation: point at it, get a mask.** SAM segments from point, box or mask prompts and was trained on SA-1B, over 1 billion masks on 11 million images that the model itself helped annotate in a model-in-the-loop data engine (Kirillov et al., [“Segment Anything”](https://arxiv.org/abs/2304.02643) (2023)); SAM 2 extends this to video with streaming memory and is 6 times faster than SAM on images (Ravi et al., [“SAM 2: Segment Anything in Images and Videos”](https://arxiv.org/abs/2408.00714) (2024)). SAM 3 adds concept prompts: a short noun phrase such as “yellow school bus”, image exemplars or both return masks and identities for every matching instance in images and videos (Carion et al., [“SAM 3: Segment Anything with Concepts”](https://arxiv.org/abs/2511.16719) (2025)).
- **VLMs output coordinates, in different conventions.** Qwen2.5-VL represents boxes and points in absolute pixel coordinates based on the input image's actual size (Bai et al., [“Qwen2.5-VL Technical Report”](https://arxiv.org/abs/2502.13923) (2025)), and as of November 2026 Gemini's documentation has the model return boxes as `[ymin, xmin, ymax, xmax]` normalized to 0 to 1000, which you must scale back to your image size ([Gemini API: Image understanding](https://aistudio.google.com/docs/image-understanding)). Claude's computer use tool, also as of November 2026, returns coordinates in the pixel space of the screenshot you sent, so if you downscaled the screenshot you must scale clicks back up to the real screen ([Claude docs: Computer use tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)).
- **Marks often beat raw coordinates.** Set-of-Mark prompting segments an image with SAM or SEEM, overlays numbered marks, masks or boxes, and lets the VLM answer with a mark; zero-shot GPT-4V with these marks outperformed the best fully fine-tuned referring expression comprehension and segmentation model on RefCOCOg (Yang et al., [“Set-of-Mark Prompting Unleashes Extraordinary Visual Grounding in GPT-4V”](https://arxiv.org/abs/2310.11441) (2023)). Screen parsers apply the same idea to interfaces: OmniParser detects interactable regions and captions what each does, which significantly improved GPT-4V on ScreenSpot (Lu et al., [“OmniParser for Pure Vision Based GUI Agent”](https://arxiv.org/abs/2408.00203) (2024)), a benchmark for locating screen elements from instructions on mobile, desktop and web screens (Cheng et al., [“SeeClick: Harnessing GUI Grounding for Advanced Visual GUI Agents”](https://arxiv.org/abs/2401.10935) (2024)).
- **A wrong click is costly, so verify every coordinate.** Draw predicted boxes and clicks on the image the model saw before acting on them, and prefer a specialist detector or the accessibility tree ([computer-use agents](#computer-use-agents)) where speed and precision matter more than open vocabulary. Dense professional screens are hard: in the 2025 ScreenSpot-Pro paper, on high-resolution screens from 23 applications, the best model the authors tested found the target only 18.9% of the time, and their planner-guided visual search, ScreenSeekeR, reached 48.1% without extra training (Li et al., [“ScreenSpot-Pro: GUI Grounding for Professional High-Resolution Computer Use”](https://arxiv.org/abs/2504.07981) (2025)).

## Planned visuals

- `calculator`: convert coordinates between conventions: a 0 to 1000 normalized `[ymin, xmin, ymax, xmax]` box to pixels of the original image, and a click on a downscaled screenshot back to screen pixels, with tests for both; plus the IoU of two boxes.
- `stepper`: Set-of-Mark on one screenshot: segment the screen, overlay numbered marks, the model answers “mark 7”, the harness maps mark 7 to its box center, draws it for checking and clicks.
- `compare`: a specialist detector or segmenter next to a VLM used for grounding: vocabulary, latency, cost, precision, output format and typical failure modes.

## Talk like an expert

Experts talk about IoU, AP averaged over IoU 0.50 to 0.95, open-vocabulary and open-set detection, referring expressions, promptable and concept segmentation, normalized versus absolute coordinates, Set-of-Mark and GUI grounding. They ask which image size a coordinate refers to, and they look at drawn boxes before trusting either a metric or an agent's click.

## Go deeper

- Lin et al., [“Microsoft COCO: Common Objects in Context”](https://arxiv.org/abs/1405.0312) (2014).
- Kirillov et al., [“Segment Anything”](https://arxiv.org/abs/2304.02643) (2023).
- Liu et al., [“Grounding DINO: Marrying DINO with Grounded Pre-Training for Open-Set Object Detection”](https://arxiv.org/abs/2303.05499) (2023).
- Li et al., [“ScreenSpot-Pro: GUI Grounding for Professional High-Resolution Computer Use”](https://arxiv.org/abs/2504.07981) (2025).

## Related

- [Vision-language models](#vision-language-models)
- [Computer-use and browser agents](#computer-use-agents)
- [Document and screen understanding](#document-screen-understanding)
- [Vision-language model architectures and training](#vlm-architectures)
- [Labeling and annotation](#labeling-annotation)
- [Evaluating multimodal and generative models](#multimodal-evaluation)
