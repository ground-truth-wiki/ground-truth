---
id: google-build-repair-ml
book: 21
order: "21.15"
title: "Google: repairing broken builds with ML-suggested fixes"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [developer-tools, code-repair, fine-tuning, online-experiments, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software and developer tools"
use_case: "An ML model that suggests fixes for build errors inline in the IDE, filtered for quality and safety, which the developer previews and then accepts or rejects"
outcome: "~2% reduction in active coding time per CL, ~2% reduction in shepherding time per CL and ~2% increase in CL throughput; no detectable difference in the rate of CL rollbacks or new sanitizer failures between CLs authored with and without build repairs"
measured_how: "Randomized experiment with 50% of all Google developers in treatment and 50% in control, monitored for 11 weeks; retrospective rollback and new sanitizer failure rates compared for CLs authored with the help of build repairs vs. without (Google Research blog, 23 April 2024)"
prerequisites: [online-experiments]
replications: []
---
> [!tldr]
> Google fine-tuned a DIDACT model on developers' build errors and their fixes, and shows suggested fixes in the IDE behind automated safety checks and human review. In an 11-week randomized experiment (50% of all Google developers in treatment, 50% in control), the post reports a "~2% increase in CL throughput". For CLs authored with and without build repairs, it "found no detectable difference" in rollback or new sanitizer failure rates.

> [!note] From the public record
> Built from Google's own published account, "Safely repairing broken builds with ML" (April 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Build errors are not all simple typos: "Errors from generics or templates can be convoluted, and error messages can be cryptic." At Google a build is also more than compilation: a curated set of Error Prone static analysis checkers runs on every build, and "Build errors and some static-analysis checks block submission of code changes."

The work began with Java build errors, then widened to other kinds of errors, other languages including C++, and more environments.

## Why this approach

The post points to data Google already had. Every saved source file leaves a snapshot in version control, and every build leaves logs. Together they show when a build broke, which errors appeared, when the build succeeded and what code changed: "essentially, exactly how the developer fixed the build." The post describes DIDACT as a methodology that "uses the software development process as a whole as training data". On the general technique, see [Fine-tuning in practice](#fine-tuning-practice).

The post also names a risk: "there is a real risk of making code worse with ML-generated repairs". It does not describe other options the team weighed.

## The approach

1. **Training data.** The team assembled "resolution sessions": code snapshots and build logs in one workspace, from the first breakage to its resolution.
2. **Training.** A pre-trained DIDACT model is fine-tuned on the build errors at the broken snapshot, the file contents at that snapshot, and the code diff between the broken and the fixed snapshot.
3. **Serving.** Given the current code and its build errors, the model predicts a patch with a confidence score. The post does not say how the score is used.
4. **Filtering.** Each fix is auto-formatted, then passed through heuristic filters built from expert knowledge and user feedback "to avoid common quality and safety pitfalls, such as code vulnerabilities."
5. **Review in the IDE.** A developer clicks a "Review ML-suggested fix" button, previews the fix, and applies or discards it. An accepted fix then goes through the normal building, testing, static and dynamic analysis, and code review. See [Human in the loop](#human-in-the-loop).

## The stack

As of April 2024: a pre-trained DIDACT model fine-tuned on developers' build errors and fixes, and Error Prone checkers in the build. One safety metric uses sanitizers, with AddressSanitizer, MemorySanitizer and GWP-Asan named as examples. Java and C++ are the languages named. The post does not name the IDE, the model size, the architecture or the serving infrastructure. It describes the work as a multi-year collaboration between Google DeepMind and Google Core Systems & Experiences, and says "ML-powered build repair is now enabled for all Google developers".

## Results, and how they were measured

"We randomly assigned 50% of all Google developers to the treatment group", who received access to ML build fixes in the IDE. The other 50% were the control. The team monitored both groups for 11 weeks, then compared outcomes: an [online controlled experiment](#online-experiments). The post states: "Our results show statistically significant results":

- "~2% reduction in active coding time per changelist (CL)", defined as the average time "fingers on keyboard" on a CL before sending it for review.
- "~2% reduction in shepherding time per CL", the average time spent on a CL after sending it for review, including addressing review feedback.
- "~2% increase in CL throughput", the average number of CLs submitted per week.

Adoption is reported separately from the experiment: "about 34% of users experiencing a build breakage in a given month end up applying such ML-suggested fixes."

For safety, the team examined retrospective metrics, including the rate of CL rollbacks and the rate of new sanitizer failures on unit tests and fuzz targets. It compared CLs authored with the help of build repairs against CLs without, "and found no detectable difference." The introduction states: "We also detect no observable increase in safety risks or bugs when ML-generated fixes are applied."

**Not measured:** the post gives no number of developers, CLs or fixes, no absolute values behind the ~2% figures, and no confidence intervals or named statistical tests (see [Statistics for evals](#eval-statistics)). It reports no acceptance rate for shown fixes, no share removed by the filters, no model accuracy, and no rollback or sanitizer rates for either set of CLs. Its explanation of the gains, that developers solve complex build failures more efficiently, is stated as a hypothesis, not a measurement.

## What failed

The post reports no failed attempts or bad fixes. Code-generation ML models "may introduce bugs that can slip past developers", the stated reason for the post-processing filters. Speed alone is not the goal: "Increasing development velocity alone isn’t necessarily better." Review costs time too: the team suspects developers would not "invest the extra time needed to review a suggestion" if fixes were only trivial. The post makes its result conditional, "provided that high quality training data and responsible monitoring are employed."

## What the team would do differently

The post states no regrets. It concludes that surfacing fixes in the IDE, "guarded by automated safety checks and human review, significantly improved developer productivity", "without negatively impacting code safety." It suggests the approach could extend further: "similar approaches may be effective in addressing other kinds of error".

The wiki's reading:

- **Mine the records you already keep.** Saves and builds were logged anyway, so fixed builds could become training examples. See [The data flywheel](#data-flywheel).
- **Measure the downside next to the upside.** Rollback and sanitizer rates sat next to the speed metrics, so a gain bought with breakage would show. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).
- **Keep the suggestion behind the usual gates.** An accepted fix faces the same checks as any other change, so the model opens no new path into the codebase.

## Disclosure

None.

## Sources

- Emily Johnston and Stephanie Tang, Software Engineers, Core Systems & Experiences, Google, [“Safely repairing broken builds with ML”](https://research.google/blog/safely-repairing-broken-builds-with-ml/), Google Research blog, 23 April 2024.

## Related

- [About playbooks](#about-playbooks)
- [Online controlled experiments for AI features](#online-experiments)
- [Human in the loop](#human-in-the-loop)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [The data flywheel](#data-flywheel)
