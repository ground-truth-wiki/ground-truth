---
id: ci-cd-for-ai
book: 16
order: "16.6"
title: CI/CD for AI
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [ci, eval-gates, model-upgrades]
visuals:
  - eval-gates:stepper
  - pr-comment-compare:compare
---
> [!tldr]
> CI/CD for AI adds eval gates to the usual pipeline: fast checks on every commit, a fuller eval suite before merge, safety suites before release, then canaries and gradual rollout with automatic rollback. Prompt, model and retrieval changes go through the same gates as code.

## Why it matters
Most AI regressions are caused by changes nobody thought of as risky: a prompt tweak, a model version bump, a re-chunked index, a new tool description. Without gates, they ship and users find them. With gates, they show up as a red check on a pull request with the failing cases attached.

## Intuition
A pipeline with eval gates is an airport security line with several checkpoints: a quick bag scan for everyone, a closer look for anything flagged, and a final check at the gate. Each catches what the earlier one could not afford to.

```viz
{"id":"eval-gates","component":"stepper","title":"Six gates between a pull request and every user, each slower and more thorough than the last","caption":"Step through an illustrative pipeline. Cheap gates run on every commit; expensive ones only when earlier gates pass.","alt":"Stepper of an AI delivery pipeline: unit tests, smoke evals, full evals, safety suite, canary and full rollout.","data":"illustrative","diagram":{"w":600,"h":56,"nodes":[{"id":"unit","label":"Unit\ntests","role":"tool","align":"center","glyph":false,"x":0,"y":0,"w":90,"h":56},{"id":"smoke","label":"Smoke\nevals","role":"tool","align":"center","glyph":false,"x":102,"y":0,"w":90,"h":56},{"id":"full","label":"Full\nevals","role":"data","align":"center","glyph":false,"x":204,"y":0,"w":90,"h":56},{"id":"safe","label":"Safety\nsuite","role":"untrusted","align":"center","glyph":false,"x":306,"y":0,"w":90,"h":56},{"id":"canary","label":"Canary","role":"agent","align":"center","glyph":false,"x":408,"y":0,"w":90,"h":56},{"id":"all","label":"Full\nrollout","role":"human","align":"center","glyph":false,"x":510,"y":0,"w":90,"h":56}],"edges":[{"from":"unit","to":"smoke"},{"from":"smoke","to":"full"},{"from":"full","to":"safe"},{"from":"safe","to":"canary"},{"from":"canary","to":"all"}]},
"frames":[
{"label":"Unit tests","highlight":["unit"],"caption":"Ordinary tests plus deterministic checks: prompt templates render, schemas validate, tool definitions parse. Seconds, on every commit."},
{"label":"Smoke evals","highlight":["smoke"],"caption":"A few dozen representative cases, one attempt each, with code-based graders. A couple of minutes; blocks obvious breakage."},
{"label":"Full evals","highlight":["full"],"caption":"The full suite with several attempts per case and calibrated judges, compared with the main branch using paired tests. Runs before merge for prompt, model and retrieval changes.","code":"answer quality   86.4% (main 85.9%)   +0.5 [−1.1, +2.0]\nrefund slice     91.0% (main 92.5%)   −1.5 [−4.8, +1.7]\ncitations valid  98.2% (main 98.0%)   +0.2"},
{"label":"Safety suite","highlight":["safe"],"caption":"Harm, over-refusal, injection and leakage cases. Any regression beyond its threshold blocks release. See the safety evals chapter."},
{"label":"Canary","highlight":["canary"],"caption":"A few percent of traffic for hours, with automatic rollback on error, latency, cost or quality thresholds."},
{"label":"Rollout","highlight":["all"],"caption":"Gradual increase to all traffic, with the same monitors watching and the previous version one switch away."}]}
```

## How it works
**What triggers which gate.** Code changes run unit tests and smoke evals. Prompt, model, retrieval, tool or guardrail changes also run the full eval suite and the safety suite. Model provider updates (a new version behind an alias) deserve the same treatment, which is why pinned versions matter. See [prompt management](#prompt-config-management).

**Gate design.** Compare against the main branch on the same cases with paired statistics, not against a fixed number alone; set per-slice thresholds so a big regression in one slice cannot hide behind an overall gain. See [statistics for evals](#eval-statistics).

**Speed and cost.** Full evals with judges cost money and minutes. Run smoke evals on every push, full evals on pull requests that touch AI behavior, and cache results for unchanged cases.

**Reporting.** Post results on the pull request: overall and slice scores with intervals, and links to the failing cases and their traces.

**Release.** Canaries, shadow traffic and A/B tests in production, with automatic rollback. See [online evaluation](#online-evaluation).

An illustrative workflow:

```yaml
name: ai-evals
on:
  pull_request:
    paths: ["prompts/**", "retrieval/**", "tools/**", "models.yaml"]
jobs:
  evals:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r requirements.txt
      - run: python evals/run.py --suite full --attempts 3 --out results.json
      - run: python evals/gate.py results.json --baseline main --max-slice-drop 0.03
      - run: python evals/comment.py results.json   # posts the summary to the PR
```

## In practice
```viz
{"id":"pr-comment-compare","component":"compare","title":"A pull request that says “tweaked the prompt” versus one that shows what changed","caption":"Hover the marks. The second makes review possible.","alt":"Comparison of a pull request with no eval information and one with an automated eval summary.","data":"illustrative","a":{"title":"Without eval gates","text":"PR #482: tweak answer prompt\n\n“Made the tone friendlier.”\n\n✓ unit tests passed\nApproved by: 1 reviewer"},"b":{"title":"With eval gates","text":"PR #482: tweak answer prompt\n\n✓ unit tests  ✓ smoke evals (40/40)\n✗ full evals: refund slice −6.2 pts\n   [−9.8, −2.6], 7 newly failing cases\n✓ safety suite: no regressions\n\nFailing cases: refund-017, refund-023, …\n(each links to its trace)"},"links":[{"a":"“Made the tone friendlier.”","b":"✗ full evals: refund slice −6.2 pts","note":"The friendlier tone started promising refunds the policy does not allow."},{"a":"✓ unit tests passed","b":"✓ unit tests  ✓ smoke evals (40/40)","note":"Unit tests and smoke evals cannot catch slice regressions."},{"b":"(each links to its trace)","note":"Reviewers read the failures, not just the number."}]}
```

Pipeline checklist:
- Path filters so AI-behavior changes trigger full evals.
- Paired comparison with the main branch and per-slice thresholds.
- Safety suite as a release gate.
- Results and failing cases posted on the pull request.
- Canary with automatic rollback, and the previous version kept warm.

## Numbers to know
> [!number]
> Rules of thumb. Keep smoke evals under a few minutes so they run on every push. Full suites of a few hundred cases with three attempts each detect regressions of a few points with paired tests.

## Pitfalls and anti-patterns
> [!pitfall] Evals that only run when someone remembers
> If evals are not a required check, they will be skipped exactly when a change looks small.

- **Fixed thresholds only.** A model that scores 88% today and 86% tomorrow still passes an 85% gate; compare with main.
- **No slice thresholds.** Averages hide the regression that matters.
- **Model aliases.** Provider updates bypass the pipeline entirely.

## Talk like an expert
The vocabulary: **eval gate**, **smoke suite**, **full suite**, **paired comparison**, **slice threshold**, **canary**, **automatic rollback**, **required check**. Experts treat every behavior change, including prompts and model versions, as a deploy that must pass gates. The live debate is how to gate agents whose evals are slow and expensive: sampling, caching and nightly suites are common compromises.

> [!hottake] A prompt change without an eval run is an untested deploy.
> **The counterargument:** for early prototypes with no users, eval gates slow learning; the right time to add them is when real users depend on the behavior.

## Check yourself
```quiz
ci-cd-for-ai
```

## Go deeper
- Your CI platform’s documentation for required checks and path filters.
- The [eval harnesses](#eval-harnesses) and [eval tooling](#eval-tooling) chapters.

## Related
- [Why evals are the core skill](#why-evals)
- [Online evaluation](#online-evaluation)
- [Prompt and config management](#prompt-config-management)
- [Statistics for evals](#eval-statistics)
- [Safety evals](#safety-evals)
