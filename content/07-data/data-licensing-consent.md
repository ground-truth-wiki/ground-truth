---
id: data-licensing-consent
book: 7
order: "7.4.1"
title: Data licensing, copyright and consent
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [data-licensing, copyright, consent, robots-txt, text-and-data-mining, gdpr]
visuals:
  - data-licensing-consent-four-questions:diagram
  - data-licensing-consent-license-tree:tree
  - data-licensing-consent-crawl-check:stepper
  - data-licensing-consent-eu-us:compare
prerequisites: [data-governance]
---
> [!tldr]
> Every dataset raises four separate questions: does copyright allow the copying, what does the license or contract allow, did collection respect terms and opt-outs, and is there a lawful basis for personal data. A yes to one says nothing about the others. Record the answers with dates. This is information as of November 2026, not legal advice.

## Why it matters

The labels are unreliable. An audit of more than 1,800 text datasets found license omission above 70% and error rates above 50% on popular hosting sites ([Longpre et al., “The Data Provenance Initiative: A Large Scale Audit of Dataset Licensing & Attribution in AI” (2023)](https://arxiv.org/abs/2310.16787)). Consent moves: from 2023 to 2024, restrictions made about 5% of C4 tokens and more than 28% of its most critical sources fully restricted ([Longpre et al., “Consent in Crisis: The Rapid Decline of the AI Data Commons” (2024)](https://arxiv.org/abs/2407.14933)). A wrong answer found after training can mean retraining or withdrawing the model, in [pretraining](#pretraining-data) and [fine-tuning](#fine-tuning-practice) alike. This chapter deepens the permitted-use control of [data governance](#data-governance).

## Intuition

Photographing a sculpture in a museum takes four unrelated permissions: the sculptor's copyright, the museum's ticket terms, the license on your photo, and the privacy of visitors in the frame. A dataset is the same.

```viz
{"id":"data-licensing-consent-four-questions","component":"diagram","title":"One dataset, four separate permissions: a yes on one says nothing about the others","caption":"Illustrative. Each dataset or web source passes four independent checks, and all four answers go into one record. Click a check for the chapter that covers it.","alt":"Diagram: a dataset on the left fans out to four checks stacked in the middle (copyright, license or contract, terms and opt-outs, personal data), which all feed a permitted-use record on the right.","data":"illustrative","try":"Click Personal data, then ask whether a CC0 license would change its answer.","w":600,"h":240,"nodes":[
{"id":"ds","label":"Dataset","sub":"or web source","role":"data","x":0,"y":92,"w":150,"h":56},
{"id":"cr","label":"Copyright","sub":"exception or permission?","role":"plain","x":190,"y":0,"w":220,"h":50,"link":"#ai-copyright"},
{"id":"lic","label":"License or contract","sub":"what does the grant allow?","role":"plain","x":190,"y":62,"w":220,"h":50},
{"id":"tos","label":"Terms and opt-outs","sub":"how was it collected?","role":"external","x":190,"y":124,"w":220,"h":50,"link":"#agent-facing-web"},
{"id":"pd","label":"Personal data","sub":"which lawful basis?","role":"human","x":190,"y":186,"w":220,"h":50,"link":"#privacy"},
{"id":"rec","label":"Permitted use","sub":"catalog and card","role":"data","x":450,"y":92,"w":150,"h":56,"link":"#dataset-documentation"}],
"edges":[{"from":"ds","to":"cr"},{"from":"ds","to":"lic"},{"from":"ds","to":"tos"},{"from":"ds","to":"pd"},{"from":"cr","to":"rec"},{"from":"lic","to":"rec"},{"from":"tos","to":"rec"},{"from":"pd","to":"rec"}]}
```

## How it works

**Licenses.** A license grants only its licensor's rights. Creative Commons licenses “apply only when copyright permission is required”, so where an exception covers the use, their conditions fall away ([CC training primer](https://creativecommons.org/using-cc-licensed-works-for-ai-training-2/)). Read conservatively, share-alike reaches models or outputs you share publicly, and non-commercial reaches every stage from copying to sharing the model. [Open Data Commons](https://opendatacommons.org/licenses/) offers PDDL, ODC-By and the share-alike [ODbL](https://opendatacommons.org/licenses/odbl/summary/); [CDLA-Permissive-2.0](https://cdla.dev/permissive-2-0/) explicitly frees “Results”, including machine learning models.

```viz
{"id":"data-licensing-consent-license-tree","component":"tree","title":"Share-alike and non-commercial terms reach the model, not just the data","caption":"Illustrative simplification of the license texts and the conservative reading in Creative Commons' training primer. Where a copyright exception covers the use, CC conditions do not apply. Not legal advice.","alt":"Tree of dataset license families and what each means for training and for a released model: public domain, attribution, share-alike, non-commercial, no derivatives, data agreements, and missing or custom licenses.","data":"illustrative","depicts":"License texts and CC guidance as of November 2026","try":"Open Share-alike, then decide whether you would release weights trained on that data.","open":1,"root":{"label":"Dataset license","children":[
{"label":"Public domain: CC0, ODC PDDL","children":[{"label":"No license conditions. Terms of collection and personal-data law still apply."}]},
{"label":"Attribution: CC BY, ODC-By","children":[{"label":"Credit the source when you share. CC suggests a link to the dataset's source could be enough for training."}]},
{"label":"Share-alike: CC BY-SA, ODbL","children":[{"label":"CC: models or outputs based on share-alike content and shared publicly would need the same license."},{"label":"ODbL: an adapted database you use publicly must be offered under the ODbL."}]},
{"label":"Non-commercial: CC BY-NC and its variants","children":[{"label":"Applies to every use that needs copyright permission, from copying for training to sharing the model."}]},
{"label":"No derivatives: CC BY-ND, BY-NC-ND","children":[{"label":"CC's conservative reading: do not use as training data."}]},
{"label":"Data agreements: CDLA-Permissive-2.0","children":[{"label":"Places results of computational analysis, including machine learning models, outside its restrictions."}]},
{"label":"Missing, “other” or “unknown”","children":[{"label":"Treat as unknown. Trace the original source before training.","link":"#dataset-documentation"}]}]}}
```

**Web signals.** [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html) (September 2022) standardized robots.txt and says its rules “are not a form of access authorization”: they are requests to named crawlers. As of November 2026, vendors split tokens by purpose, such as OpenAI's GPTBot for training and OAI-SearchBot for search ([OpenAI](https://developers.openai.com/api/docs/bots)), and Google-Extended is a control token with no effect on Search ([Google](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers)). Newer signals separate fetching from use: [TDMRep](https://www.w3.org/community/reports/tdmrep/CG-FINAL-tdmrep-20240510/), a W3C Community Group report (May 2024), and the IETF AI preferences drafts, with a [vocabulary](https://datatracker.ietf.org/doc/draft-ietf-aipref-vocab/) of `train-ai`, `ai-use` and `search` and a [`Content-Usage`](https://datatracker.ietf.org/doc/draft-ietf-aipref-attach/) header and robots.txt rule. As of November 2026 these are drafts; Google says it intends to support the AIPREF training preference signal in early 2027 ([Google](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers)). Creative Commons reworked CC signals in April 2026, after feedback that “preference signals without enforcement do not meaningfully shift power” ([CC](https://creativecommons.org/2026/04/23/update-on-cc-signals-what-changed-and-why/)).

```viz
{"id":"data-licensing-consent-crawl-check","component":"stepper","title":"Allowed to fetch is not allowed to train: each signal answers a different question","caption":"Illustrative site and crawler (example.com, ExampleDataBot). Only robots.txt is an IETF standard; the other signals are drafts, reports or contracts.","alt":"Stepper over six checks a crawler makes for one page: fetch robots.txt, match its product token, read the Content-Usage preference, check the TDMRep reservation, check terms and access controls, and write a catalog record with the date.","data":"illustrative","depicts":"RFC 9309, TDMRep (May 2024), IETF AIPREF drafts as of November 2026","try":"Pause on Match and ask what the site owner wanted, not just what the file says.","diagram":{"w":600,"h":170,"nodes":[
{"id":"robots","label":"robots.txt","sub":"RFC 9309","role":"external","x":0,"y":0,"w":180,"h":56},
{"id":"token","label":"Your token","sub":"which group applies","role":"tool","x":210,"y":0,"w":180,"h":56},
{"id":"pref","label":"Usage preference","sub":"IETF draft","role":"external","x":420,"y":0,"w":180,"h":56},
{"id":"tdm","label":"TDM reservation","sub":"TDMRep, EU Art. 4(3)","role":"external","x":420,"y":110,"w":180,"h":56},
{"id":"terms","label":"Terms and access","sub":"contract, paywalls","role":"external","x":210,"y":110,"w":180,"h":56},
{"id":"rec","label":"Catalog record","sub":"signals and date","role":"data","x":0,"y":110,"w":180,"h":56}],
"edges":[{"from":"robots","to":"token"},{"from":"token","to":"pref"},{"from":"pref","to":"tdm"},{"from":"tdm","to":"terms"},{"from":"terms","to":"rec"}]},
"frames":[
{"label":"Fetch","highlight":["robots"],"caption":"Before the page, the crawler fetches `/robots.txt` for the host. RFC 9309: use a cached copy for at most 24 hours and parse at least 500 KiB; a 4xx means the crawler may access anything, a 5xx means assume complete disallow.","code":"# https://example.com/robots.txt\nUser-agent: GPTBot\nDisallow: /\n\nUser-agent: CCBot\nDisallow: /\n\nUser-agent: *\nAllow: /\nDisallow: /account/"},
{"label":"Match","highlight":["token"],"edges":["robots>token"],"caption":"The crawler uses the group whose `User-agent` matches its product token, case-insensitively, else `*`. Within a group the most specific path wins. The site blocked two AI crawlers by name but not this one, so the file allows the fetch. Its intent is less clear: record both.","code":"token:   ExampleDataBot\ngroups:  GPTBot no | CCBot no | * yes\nrules:   Allow: /  (Disallow: /account/ does not match)\nresult:  fetch allowed for /blog/post-17"},
{"label":"Preference","highlight":["pref"],"edges":["token>pref"],"caption":"The response carries a usage preference in the syntax of the IETF drafts: search is welcome, training is not. A preference, not access control.","code":"HTTP/1.1 200 OK\nContent-Type: text/html\nContent-Usage: train-ai=n, search=y"},
{"label":"Reservation","highlight":["tdm"],"edges":["pref>tdm"],"caption":"TDMRep puts a text-and-data-mining reservation in a header, a meta tag, a well-known file or EPUB and PDF metadata. Under Article 4(3) of the EU DSM Directive, a machine-readable reservation takes this content out of the general mining exception.","code":"GET /.well-known/tdmrep.json\n[{\"location\": \"/blog/\", \"tdm-reservation\": 1,\n  \"tdm-policy\": \"https://example.com/tdm-policy.json\"}]"},
{"label":"Terms","highlight":["terms"],"edges":["tdm>terms"],"caption":"Terms of service and access controls are a separate layer. Longpre et al. (2024) found terms restricting crawling for 45% of C4, and general inconsistencies between sites' terms and their robots.txt. Signatories of the EU GPAI Code of Practice commit not to circumvent paywalls ([copyright chapter](https://ec.europa.eu/newsroom/dae/redirection/document/118115), Measure 1.2).","code":"/terms, section 7: \"No automated collection of content\n  for training machine-learning models.\"\npaywall on /blog/: none"},
{"label":"Record","highlight":["rec"],"edges":["terms>rec"],"caption":"Write down what you saw and when, because signals change between crawls. Decision here: index for search, exclude from training.","code":"{\"url\": \"https://example.com/blog/post-17\",\n \"checked\": \"2026-11-07\",\n \"robots\": \"allowed (* group)\",\n \"content_usage\": \"train-ai=n, search=y\",\n \"tdm_reservation\": 1,\n \"tos_training_clause\": true,\n \"decision\": \"search index only; exclude from training\"}"}]}
```

**Two legal models.** The EU asks whether the rightholder opted out; the US asks whether the use is fair. Article 4 of the [DSM Directive](https://eur-lex.europa.eu/eli/dir/2019/790/oj) allows mining of lawfully accessible works unless rights were expressly reserved “in an appropriate manner”, such as machine-readable means for online content; Article 3 covers scientific research by research organizations and cultural heritage institutions, with no such opt-out. Article 53 of the [AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj) makes general-purpose model providers keep a copyright policy that honors reservations and publish a training-content summary on the AI Office's [template](https://digital-strategy.ec.europa.eu/en/news/commission-presents-template-general-purpose-ai-model-providers-summarise-data-used-train-their). In the US, the Copyright Office's [Part 3 report](https://www.copyright.gov/ai/) (pre-publication, May 2025) weighs the [four fair use factors](https://www.copyright.gov/fair-use/) and draws the line at commercial use that competes with the works, “especially where this is accomplished through illegal access”. Courts differ on details ([Bartz](https://storage.courtlistener.com/recap/gov.uscourts.cand.434709/gov.uscourts.cand.434709.231.0.pdf), [Kadrey](https://storage.courtlistener.com/recap/gov.uscourts.cand.415175/gov.uscourts.cand.415175.598.0.pdf), [Ross](https://www2.ca3.uscourts.gov/opinarch/252153p.pdf)), and Bartz later settled ([settlement site](https://www.anthropiccopyrightsettlement.com/)). See [the EU AI Act](#eu-ai-act), [governance](#governance-regulation) and [AI copyright](#ai-copyright).

```viz
{"id":"data-licensing-consent-eu-us","component":"compare","title":"The EU asks whether rights were reserved; the US asks whether the use is fair","caption":"Hover the marks. A simplified, dated summary of the texts and rulings linked in this chapter; laws, guidance and appeals change. Not legal advice.","alt":"Comparison. EU: the DSM Directive's research exception (Article 3) and general mining exception unless rights are reserved (Article 4), the AI Act's Article 53 duties from 2 August 2025, and the July 2025 Code of Practice. US: the four fair use factors, the Copyright Office's Part 3 report of May 2025, and the Bartz, Kadrey and Ross rulings of 2025 and 2026.","data":"real","source":"Directive (EU) 2019/790; Regulation (EU) 2024/1689; European Commission; 17 U.S.C. § 107; US Copyright Office; court opinions linked in the text; Bartz settlement website (anthropiccopyrightsettlement.com)","asof":"November 2026","depicts":"As of November 2026","try":"Hover the market-effect factor, then the two rulings that disagree about it.","a":{"title":"EU: were rights reserved?","text":"DSM Directive (2019/790)\nArt. 3  scientific research by research\n        organizations and cultural\n        heritage institutions: no opt-out\nArt. 4  anyone with lawful access,\n        unless rights are reserved\n        (online: e.g. machine-readably)\n\nAI Act Art. 53, from 2 Aug 2025\n(c) copyright policy honoring opt-outs\n(d) public training-content summary\n    open-source models included\n\nCode of Practice (July 2025)\nfollow robots.txt (RFC 9309)\nand other opt-out protocols\nno paywall circumvention"},"b":{"title":"US: is the use fair?","text":"17 U.S.C. § 107, four factors\n1 purpose and character of the use\n2 nature of the work\n3 amount and substantiality\n4 effect on the potential market\n\nCopyright Office, Part 3 (May 2025)\nvarious training uses likely\ntransformative; competing commercial\nuse, especially via illegal access,\ngoes beyond established fair use\n\nRulings\nJun 2025 Bartz: training fair use;\n         pirated copies to trial\nJun 2025 Kadrey: Meta wins on record\nSep 2026 Ross (3d Cir.): not fair use"},"links":[{"a":"unless rights are reserved","b":"17 U.S.C. § 107, four factors","note":"The EU default is permission unless reserved. The US has no reservation mechanism, so each use is weighed case by case."},{"a":"no paywall circumvention","b":"pirated copies to trial","note":"How you got the data matters on both sides: lawful access in the EU, and pirated library copies that Bartz sent to trial."},{"a":"open-source models included","note":"The open-source exemption in Article 53(2) covers the documentation duties, not the copyright policy or the summary. Recital 106 applies the policy wherever training took place."},{"b":"4 effect on the potential market","note":"The contested factor. Kadrey said authors are not entitled to a market for licensing works as training data; the Third Circuit in Ross counted harm to a market for licensing headnotes as training data."},{"b":"Sep 2026 Ross (3d Cir.): not fair use","note":"ROSS trained a non-generative legal search tool on Westlaw headnotes to build a substitute for Westlaw. The court contrasted it with generative models, such as those in Bartz."},{"b":"Jun 2025 Kadrey: Meta wins on record","note":"The authors offered no evidence of market dilution, and the ruling affects only the thirteen plaintiffs."},{"b":"Jun 2025 Bartz: training fair use;","note":"The case then settled as a class action, and the court granted final approval on 20 July 2026."}]}
```

**Terms on outputs.** These are contract terms, separate from any copyright question. As of November 2026, Anthropic's [commercial terms](https://www.anthropic.com/legal/commercial-terms) bar using the services “to build a competing product or service, including to train competing AI models”, and the [Gemini API terms](https://aistudio.google.com/docs/terms) bar developing “models that compete with the Services”. Read them before generating [synthetic data](#synthetic-data) or [distilling](#distillation-merging).

**Personal data.** [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj) Article 6 lists six lawful bases. The EDPB's [Opinion 28/2024](https://www.edpb.europa.eu/news/edpb-opinion-on-ai-models-gdpr-principles-support-responsible-ai_en) assesses legitimate interests for AI models in three steps (interest, necessity, balancing), treats a model as anonymous only if identifying people or extracting their data is very unlikely, and warns that unlawful processing in development can affect deployment unless the model was anonymized. See [privacy](#privacy).

**Provenance-first data.** The Common Pile ([Kandpal et al., “The Common Pile v0.1: An 8TB Dataset of Public Domain and Openly Licensed Text” (2025)](https://arxiv.org/abs/2506.05209)) gathers 8 TB of openly licensed and public domain text; its 7B models are competitive with Llama 1 and 2 7B at similar compute. The Stack ([Kocetkov et al., “The Stack: 3 TB of permissively licensed source code” (2022)](https://arxiv.org/abs/2211.15533)) kept permissively licensed code and offered a process to remove code from the dataset. See [open pretraining datasets](#open-pretraining-datasets).

## In practice

Collect signals at crawl time in your [web pipeline](#web-data-pipeline), store them with the data, and re-check before each training run. This sketch reads headers only; `tdmrep.json` and robots.txt `Content-Usage` lines need their own parsing:

```python
from datetime import date
from urllib.parse import urlsplit

import requests
from protego import Protego  # pip install protego: RFC 9309 matching rules

TOKEN = "ExampleDataBot"  # placeholder: the product token your crawler sends
UA = {"User-Agent": f"{TOKEN}/1.0 (+https://example.com/bot)"}


def collection_signals(url: str) -> dict:
    parts = urlsplit(url)
    robots = requests.get(f"{parts.scheme}://{parts.netloc}/robots.txt", headers=UA, timeout=10)
    if robots.status_code >= 500:
        fetch_ok = False  # RFC 9309: unreachable means assume complete disallow
    elif robots.status_code >= 400:
        fetch_ok = True   # RFC 9309: unavailable means crawlers MAY access
    else:
        fetch_ok = Protego.parse(robots.text).can_fetch(url, TOKEN)

    headers = requests.get(url, headers=UA, timeout=10).headers if fetch_ok else {}
    return {
        "url": url,
        "checked": date.today().isoformat(),
        "robots_allows_fetch": fetch_ok,
        "tdm_reservation": headers.get("tdm-reservation"),  # TDMRep: "1" means reserved
        "content_usage": headers.get("Content-Usage"),      # AIPREF draft, e.g. "train-ai=n"
    }
```

Then record permitted use. A Hugging Face dataset card declares a [license identifier](https://huggingface.co/docs/hub/repositories-licenses). [Gating](https://huggingface.co/docs/hub/datasets-gated), switched on in the dataset settings, makes users request access before downloading, and the card sets the prompt and form fields they see:

```yaml
---
license: cc-by-nc-4.0
extra_gated_prompt: "Licensed CC BY-NC 4.0: non-commercial use only."
extra_gated_fields:
  Affiliation: text
  I will use this dataset for non-commercial purposes only: checkbox
---
```

Decision rules:

- **Missing, “other” or “unknown” license:** trace the source first.
- **Non-commercial or no-derivatives:** keep out of commercial training and released models unless counsel confirms an exception.
- **Share-alike:** decide before training whether you will share weights or outputs under the same license.
- **Personal data:** document the lawful basis and balancing test; minimize and gate.
- **System of record:** your catalog, not the hub field ([dataset documentation](#dataset-documentation)).

> [!try]
> Run the signal check on one URL from each of three sources you train on, and compare the results with your catalog.

## Numbers to know

> [!number]
> Measured facts, not rules of thumb. Hub license fields: omission above 70%, errors above 50% (Longpre et al., 2023). C4, 2023 to 2024: about 5% of tokens and over 28% of critical sources fully restricted; terms of service restrict 45% (Longpre et al., 2024). RFC 9309: cache robots.txt at most 24 hours; parse at least 500 KiB. EU rules for general-purpose models: from 2 August 2025 (as of November 2026).

## Pitfalls and anti-patterns

> [!pitfall] Trusting the hub's license field
> A dataset's license is not its sources' license: a CC BY compilation of scraped posts does not license the posts. Trace each source.

> [!pitfall] A robots.txt parser that predates RFC 9309
> Python's `urllib.robotparser` applied the first matching rule until a May 2026 fix ([gh-138907](https://github.com/python/cpython/issues/138907)). On older interpreters, `Allow: /` before `Disallow: /private/` allows `/private/x`; RFC 9309 says the most specific match wins. Use an RFC 9309 parser such as [Protego](https://github.com/scrapy/protego).

- **Checking once.** Signals change; store dates and re-check.
- **Forgetting output terms** when distilling from a hosted model.

## Talk like an expert

The vocabulary: **TDM exception**, **rights reservation**, **product token**, **fair use factors**, **market dilution**, **lawful basis**, **training-content summary**, **provenance**. Experts keep the four questions apart and ask: which law, which use, which release? Live debates: opt-out versus opt-in, whether unenforced preferences matter, and whether market dilution counts.

> [!hottake] robots.txt is doing a job it was never designed for.
> It speaks only allow and disallow, per path and crawler name, so it can say "index but do not train" only where a vendor splits its crawlers by purpose. **The counterargument:** it is the only one of these signals that is an IETF standard, the Code of Practice anchors on it, and the IETF drafts extend it with a `Content-Usage` rule rather than replace it.

## Check yourself

```quiz
data-licensing-consent
```

## Go deeper

- Longpre et al., [“The Data Provenance Initiative: A Large Scale Audit of Dataset Licensing & Attribution in AI”](https://arxiv.org/abs/2310.16787) (2023) and [“Consent in Crisis: The Rapid Decline of the AI Data Commons”](https://arxiv.org/abs/2407.14933) (2024).
- US Copyright Office, [Copyright and Artificial Intelligence, Part 3: Generative AI Training](https://www.copyright.gov/ai/) (pre-publication, May 2025).
- [Directive (EU) 2019/790](https://eur-lex.europa.eu/eli/dir/2019/790/oj), Articles 3 and 4, and [Regulation (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj), Article 53.

## Related

- [Data quality and governance](#data-governance)
- [Governance, regulation and law](#governance-regulation)
- [Privacy](#privacy)
- [Pretraining data](#pretraining-data)
- [Dataset documentation](#dataset-documentation)
- [Copyright and AI](#ai-copyright)
