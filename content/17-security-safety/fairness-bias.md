---
id: fairness-bias
book: 17
order: "17.11.1"
title: Fairness metrics and bias measurement
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [fairness, bias, fairness-metrics, responsible-ai, evaluation]
visuals:
  - fairness-bias-calculator:calculator
  - fairness-bias-sources:tree
  - fairness-bias-impossibility:stepper
  - fairness-bias-choose:tree
prerequisites: [responsible-ai, classical-ml]
---
> [!tldr]
> A group fairness metric compares one rate from the confusion matrix across groups. When base rates differ, an imperfect model cannot equalize every rate, so choose the criterion from the decision and its harm. Measure every slice with an interval, and treat language-model bias benchmarks as evidence, not verdicts.

## Why it matters
A hiring screen, a credit model or an LLM assistant can pass every aggregate eval and still fail one group. Fairness work turns the checks of [responsible AI](#responsible-ai) into numbers: which gap you measure, which you accept and what you change.

## Intuition
Take one model, one threshold and two groups, and count the four outcomes in each (see [classification metrics](#classification-metrics)). Every group fairness metric picks one ratio from these counts and asks whether both groups share it. Is each group selected at the same rate? Are qualified and unqualified people treated alike? When the model says yes, is it equally often right?

```viz
{"id":"fairness-bias-calculator","component":"calculator","title":"One model can pass equal opportunity and predictive parity and still fail the four-fifths rule","caption":"Illustrative counts for two groups of 1,000 people with base rates of 50% and 30%. Each metric compares one rate from the two confusion matrices. Change one count and watch which criteria move.","alt":"Calculator: from confusion-matrix counts for two groups, compute base rates, selection rates, the selection-rate ratio, the demographic parity difference, the true positive rate difference, the false positive rate difference, the equalized odds difference and the precision difference.","data":"formula","try":"Set group B's false positives to 150 and true negatives to 550: the false positive gap shrinks, and precision parity breaks.","inputs":{"tp_a":350,"fp_a":150,"fn_a":150,"tn_a":350,"tp_b":210,"fp_b":90,"fn_b":90,"tn_b":610},"input_meta":{"tp_a":{"label":"Group A: true positives","min":0,"step":1},"fp_a":{"label":"Group A: false positives","min":0,"step":1},"fn_a":{"label":"Group A: false negatives","min":0,"step":1},"tn_a":{"label":"Group A: true negatives","min":0,"step":1},"tp_b":{"label":"Group B: true positives","min":0,"step":1},"fp_b":{"label":"Group B: false positives","min":0,"step":1},"fn_b":{"label":"Group B: false negatives","min":0,"step":1},"tn_b":{"label":"Group B: true negatives","min":0,"step":1}},"outputs":[{"id":"base_a","label":"Base rate, group A","expr":"(tp_a + fn_a) / (tp_a + fp_a + fn_a + tn_a)","unit":"pct"},{"id":"base_b","label":"Base rate, group B","expr":"(tp_b + fn_b) / (tp_b + fp_b + fn_b + tn_b)","unit":"pct"},{"id":"sel_a","label":"Selection rate, group A","expr":"(tp_a + fp_a) / (tp_a + fp_a + fn_a + tn_a)","unit":"pct"},{"id":"sel_b","label":"Selection rate, group B","expr":"(tp_b + fp_b) / (tp_b + fp_b + fn_b + tn_b)","unit":"pct"},{"id":"sr_ratio","label":"Selection-rate ratio, lower ÷ higher (independence)","expr":"min(sel_a, sel_b) / max(sel_a, sel_b)","unit":"","main":true},{"id":"dp_diff","label":"Demographic parity difference","expr":"abs(sel_a - sel_b)","unit":"pct"},{"id":"tpr_diff","label":"True positive rate difference (equal opportunity)","expr":"abs(tp_a / (tp_a + fn_a) - tp_b / (tp_b + fn_b))","unit":"pct"},{"id":"fpr_diff","label":"False positive rate difference","expr":"abs(fp_a / (fp_a + tn_a) - fp_b / (fp_b + tn_b))","unit":"pct"},{"id":"eo_diff","label":"Equalized odds difference, the larger gap (separation)","expr":"max(tpr_diff, fpr_diff)","unit":"pct"},{"id":"ppv_diff","label":"Precision difference (predictive parity)","expr":"abs(tp_a / (tp_a + fp_a) - tp_b / (tp_b + fp_b))","unit":"pct"}],"assumptions":["Binary labels, binary decisions and two groups.","Differences are absolute gaps; the ratio divides the lower selection rate by the higher, as in the four-fifths rule.","The counts are a sample. Add intervals before you act on a gap in a small group."],"tests":[{"inputs":{},"expect":{"base_a":0.5,"base_b":0.3,"sr_ratio":0.6,"dp_diff":0.2,"tpr_diff":0,"fpr_diff":0.1714286,"eo_diff":0.1714286,"ppv_diff":0},"tol":0.00001},{"inputs":{"fp_b":150,"tn_b":550},"expect":{"sr_ratio":0.72,"fpr_diff":0.0857143,"eo_diff":0.0857143,"ppv_diff":0.1166667},"tol":0.00001},{"inputs":{"tp_b":350,"fp_b":150,"fn_b":150,"tn_b":350},"expect":{"sr_ratio":1,"dp_diff":0,"eo_diff":0,"ppv_diff":0}}]}
```

## How it works
**Where bias comes from.** NIST SP 1270 ([Schwartz et al., 2022](https://doi.org/10.6028/NIST.SP.1270)) names three categories: systemic (institutional practices), statistical and computational (unrepresentative samples) and human (biased judgment). Suresh and Guttag ([2021](https://arxiv.org/abs/1901.10002)) trace seven sources:

```viz
{"id":"fairness-bias-sources","component":"tree","title":"Harm can enter at seven points, and each needs a different fix","caption":"Expand a stage. Definitions and examples follow Suresh and Guttag ([2021](https://arxiv.org/abs/1901.10002)), who note that the categories overlap. Collecting more data the same way does not fix historical bias.","alt":"Tree of the seven sources of harm: historical, representation and measurement bias in data generation; aggregation, learning and evaluation bias in model building and evaluation; deployment bias in use.","data":"illustrative","open":1,"root":{"label":"Where harm enters","children":[
{"label":"Data generation","children":[{"label":"Historical bias: the world as it was leads to harmful outcomes even with perfect sampling. Example: word embeddings that link nurse with women"},{"label":"Representation bias: the sample under-represents part of the population. Example: ImageNet under-samples some countries"},{"label":"Measurement bias: features or labels are poor proxies. Example: arrests used as a proxy for crime, in communities policed differently"}]},
{"label":"Model building and evaluation","children":[{"label":"Aggregation bias: one model for subgroups that need different treatment"},{"label":"Learning bias: modeling choices widen gaps. Example: compression or differential privacy hurting under-represented data"},{"label":"Evaluation bias: the benchmark does not represent the users. Example: face benchmarks with few darker-skinned women","link":"#eval-datasets"}]},
{"label":"Deployment","children":[{"label":"Deployment bias: the system is used for a different problem than it was built for. Example: risk scores used off-label to help set sentences"}]}]}}
```

**Kinds of harm.** Allocation harms withhold jobs or loans; quality-of-service harms make a system work worse for some people ([Fairlearn](https://fairlearn.org/main/user_guide/fairness_in_machine_learning.html)). Representational harms demean, stereotype or erase groups ([Blodgett et al., 2020](https://arxiv.org/abs/2005.14050)).

**Three criteria.** For a score or decision R, label Y and group A ([Barocas et al., 2023](https://fairmlbook.org/classification.html)):

```math
\text{Independence: } R \perp A \qquad \text{Separation: } R \perp A \mid Y \qquad \text{Sufficiency: } Y \perp A \mid R
```

For yes/no decisions, independence means equal selection rates (demographic parity). Separation means equal true and false positive rates (equalized odds); equal opportunity keeps only the true positive rates ([Hardt et al., 2016](https://arxiv.org/abs/1610.02413)). Sufficiency means equal precision and equal negative predictive value; predictive parity keeps only precision. For scores, sufficiency is essentially calibration within groups. Each comes as a difference, where 0 is parity, or a ratio, where 1 is parity ([Fairlearn](https://fairlearn.org/main/user_guide/assessment/common_fairness_metrics.html)).

**You cannot have them all.** Calibration within groups and balance for both classes hold together only with perfect prediction or equal base rates ([Kleinberg et al., 2016](https://arxiv.org/abs/1609.05807)). Chouldechova ([2017](https://arxiv.org/abs/1703.00056)) shows why, with base rate p in each group:

```math
\text{FPR} = \frac{p}{1-p}\cdot\frac{1-\text{PPV}}{\text{PPV}}\cdot(1-\text{FNR})
```

Equal precision and unequal base rates force unequal error rates. That was the COMPAS dispute: Black defendants who did not reoffend were labeled higher risk 44.85% of the time, white defendants 23.45% ([Larson et al., 2016](https://www.propublica.org/article/how-we-analyzed-the-compas-recidivism-algorithm)). Northpointe answered that the score had predictive parity, and the base rates in the data were 51% and 39% ([Chouldechova](https://arxiv.org/abs/1703.00056)).

```viz
{"id":"fairness-bias-impossibility","component":"stepper","title":"Equal precision with unequal base rates forces unequal false positive rates","caption":"Illustrative groups; the arithmetic is exact. The shape mirrors the COMPAS dispute without using its data.","alt":"Stepper: two groups of 1,000 with base rates of 50% and 30%. The model has precision 0.70 and true positive rate 0.70 in both groups, but false positive rates of 0.30 and 0.13 and selection rates of 0.50 and 0.30. Chouldechova's identity explains the gap. Forcing equal false positive rates while keeping precision drops group A's true positive rate to 0.30.","data":"illustrative","try":"Step to the identity and check that it reproduces both false positive rates.","frames":[
{"label":"Two groups","caption":"1,000 people in each group. In group A, 500 belong to the positive class (base rate 50%); in group B, 300 do (30%).","matrix":{"title":"People by true class","rows":["Group A","Group B"],"cols":["Positive","Negative"],"values":[[500,500],[300,700]],"fmt":0,"min":0,"max":1000}},
{"label":"One model","caption":"The same model and threshold produce these four outcomes in each group.","matrix":{"title":"Confusion-matrix counts","rows":["Group A","Group B"],"cols":["TP","FP","FN","TN"],"values":[[350,150,150,350],[210,90,90,610]],"fmt":0,"min":0,"max":1000}},
{"label":"Predictive parity holds","caption":"Precision is 350 ÷ 500 = 0.70 in A and 210 ÷ 300 = 0.70 in B. A flag is equally often right in both groups: Northpointe's lens. Full sufficiency would also need equal negative predictive values, and those differ: 350 ÷ 500 = 0.70 against 610 ÷ 700 = 0.87.","matrix":{"title":"Rates","rows":["Group A","Group B"],"cols":["PPV"],"values":[[0.7],[0.7]],"min":0,"max":1}},
{"label":"Equal opportunity holds","caption":"True positive rates are 350 ÷ 500 = 0.70 and 210 ÷ 300 = 0.70. Qualified people are found equally often.","matrix":{"title":"Rates","rows":["Group A","Group B"],"cols":["PPV","TPR"],"values":[[0.7,0.7],[0.7,0.7]],"min":0,"max":1}},
{"label":"False positive rates differ","caption":"150 ÷ 500 = 0.30 in A against 90 ÷ 700 = 0.13 in B. Negatives in A are flagged more than twice as often: ProPublica's lens.","matrix":{"title":"Rates","rows":["Group A","Group B"],"cols":["PPV","TPR","FPR"],"values":[[0.7,0.7,0.3],[0.7,0.7,0.13]],"min":0,"max":1}},
{"label":"Independence fails","caption":"Selection rates are 0.50 and 0.30, a ratio of 0.60, below four-fifths.","matrix":{"title":"Rates","rows":["Group A","Group B"],"cols":["PPV","TPR","FPR","Selected"],"values":[[0.7,0.7,0.3,0.5],[0.7,0.7,0.13,0.3]],"min":0,"max":1}},
{"label":"The identity","caption":"FPR = p/(1 − p) × (1 − PPV)/PPV × (1 − FNR). Precision and FNR are equal, so FPR follows p/(1 − p): 1.00 × 0.43 × 0.70 = 0.30 for A, 0.43 × 0.43 × 0.70 = 0.13 for B.","matrix":{"title":"Factors of the identity","rotate":true,"rows":["Group A","Group B"],"cols":["p/(1 − p)","(1 − PPV)/PPV","1 − FNR","FPR"],"values":[[1,0.43,0.7,0.3],[0.43,0.43,0.7,0.13]],"min":0,"max":1}},
{"label":"Force equal FPR","caption":"Push A's FPR down to 0.13 while its precision stays 0.70, and the identity requires A's TPR to fall to 0.13 ÷ (1.00 × 0.43) = 0.30. Equal false positive rates now cost equal opportunity. Some criterion always gives way.","matrix":{"title":"Rates required by the identity","rows":["Group A","Group B"],"cols":["PPV","TPR","FPR"],"values":[[0.7,0.3,0.13],[0.7,0.7,0.13]],"min":0,"max":1}}]}
```

**Choosing.** Aequitas ([Saleiro et al., 2018](https://arxiv.org/abs/1811.05577)) asks whether a decision helps or hurts the people it selects:

```viz
{"id":"fairness-bias-choose","component":"tree","title":"The harm of the decision picks the fairness criterion","caption":"Expand a branch. A guide for a first choice, not a rule. The help-or-hurt split follows the Aequitas fairness tree (Saleiro et al., [2018](https://arxiv.org/abs/1811.05577)); the label caveat follows Barocas, Hardt and Narayanan ([2023](https://fairmlbook.org/classification.html)). Benchmarks: BBQ (Parrish et al., [2022](https://arxiv.org/abs/2110.08193)), WinoBias (Zhao et al., [2018](https://arxiv.org/abs/1804.06876)), StereoSet (Nadeem et al., [2020](https://arxiv.org/abs/2004.09456)), CrowS-Pairs (Nangia et al., [2020](https://arxiv.org/abs/2010.00133)), BOLD (Dhamala et al., [2021](https://arxiv.org/abs/2101.11718)) and RealToxicityPrompts (Gehman et al., [2020](https://arxiv.org/abs/2009.11462)).","alt":"Decision tree: if a decision helps people, compare false negative rates; if it burdens them, compare false positive rates; if people read the score as a probability, check calibration within groups; if labels may encode discrimination, fix measurement first; for hiring, compute selection-rate ratios; for service quality, compare slices; for generated content, test for representational harm with benchmarks such as BBQ, WinoBias, StereoSet, CrowS-Pairs, BOLD and RealToxicityPrompts.","data":"illustrative","open":1,"root":{"label":"What does a positive decision do?","children":[
{"label":"Helps the person (loan, interview, extra support)","children":[{"label":"Missed qualified people are the harm: compare false negative rates, that is, equal opportunity"}]},
{"label":"Burdens the person (investigation, detention, extra checks)","children":[{"label":"Wrong flags are the harm: compare false positive rates"}]},
{"label":"Produces a score people read as a probability","children":[{"label":"Check calibration within groups, so a score means the same risk in every group"}]},
{"label":"Relies on labels that may encode past discrimination","children":[{"label":"Separation inherits a biased label. Fix the measurement first; independence does not use labels"}]},
{"label":"Selects candidates for jobs","children":[{"label":"Compute selection-rate ratios per category, as the US Uniform Guidelines do, and per intersection, as New York City audits do","link":"#us-ai-law"}]},
{"label":"Serves everyone (speech, vision, chat answers)","children":[{"label":"Quality of service: compare error rates per slice and intersection, with intervals","link":"#eval-statistics"}]},
{"label":"Generates text or images about people","children":[{"label":"Representational harm: run matched prompts, and read benchmark items before trusting a score","link":"#safety-evals"},{"label":"BBQ: in question answering, does the model fall back on stereotypes when the context is ambiguous?"},{"label":"WinoBias: does coreference follow gender stereotypes about occupations?"},{"label":"StereoSet and CrowS-Pairs: does the model prefer the stereotypical option over the anti-stereotypical one?"},{"label":"BOLD: 23,679 prompts in five domains; scores open-ended generations"},{"label":"RealToxicityPrompts: 100K web prompts; how often do continuations turn toxic?"}]}]}}
```

**Individual and counterfactual fairness.** Individual fairness treats similar people similarly under a task-specific metric ([Dwork et al., 2011](https://arxiv.org/abs/1104.3913)). Counterfactual fairness asks whether a decision would hold had the person belonged to another group, which needs a causal model ([Kusner et al., 2017](https://arxiv.org/abs/1703.06856)). Swapping a name is counterfactual testing: useful, but it changes one cue, not everything else that would differ.

**Fairness through unawareness fails.** In large feature spaces, a sensitive attribute is generally redundant given the other features, so a model can rebuild it from them ([Barocas et al.](https://fairmlbook.org/classification.html)). Measuring a group gap still needs the attribute itself.

**Slices.** Averages hide intersections: Gender Shades found that commercial gender classifiers had error rates up to 34.7% for darker-skinned women and at most 0.8% for lighter-skinned men ([Buolamwini and Gebru, 2018](https://proceedings.mlr.press/v81/buolamwini18a.html)). In Berkeley's 1973 admissions, men led overall, yet four of the six largest departments admitted women at higher rates ([fairmlbook](https://fairmlbook.org/causal.html)): Simpson's paradox. Report n and an interval per slice ([statistics for evals](#eval-statistics)).

**Mitigation.** Before training, [reweigh](https://aif360.readthedocs.io/en/stable/modules/generated/aif360.algorithms.preprocessing.Reweighing.html) group and label combinations. During training, add constraints ([Agarwal et al., 2018](https://arxiv.org/abs/1803.02453)) or an adversary that predicts the group ([Zhang et al., 2018](https://arxiv.org/abs/1801.07593)). After training, set per-group thresholds (Hardt et al.) or favor the disadvantaged group near the boundary ([reject option](https://aif360.readthedocs.io/en/stable/modules/generated/aif360.algorithms.postprocessing.RejectOptionClassification.html)). Fairlearn and AIF360 ([Bellamy et al., 2018](https://arxiv.org/abs/1810.01943)) implement these. Each can cost accuracy or another criterion, and [post-processing](https://fairlearn.org/main/user_guide/mitigation/postprocessing.html) needs the group at prediction time.

**Language and image models.** Contrastive benchmarks such as StereoSet and WinoBias often leave unclear what they measure ([Blodgett et al., 2021](https://aclanthology.org/2021.acl-long.81/)). Text-to-image models amplify stereotypes, even from prompts that do not mention identity ([Bianchi et al., 2023](https://arxiv.org/abs/2211.03759)). In word embeddings, debiasing can hide gender bias rather than remove it ([Gonen and Goldberg, 2019](https://arxiv.org/abs/1903.03862)); see [representation learning](#representation-learning).

**Toxicity scores.** Scorers are biased too: hate speech classifiers flagged African American English tweets up to twice as often ([Sap et al., 2019](https://aclanthology.org/P19-1163/)). As of November 2026, Perspective API, used by RealToxicityPrompts, is due to stop after 31 December 2026 ([perspectiveapi.com](https://perspectiveapi.com/)), and its scores shifted with silent retraining ([Hartmann et al., 2026](https://arxiv.org/abs/2604.25580)). Pin your scorer ([guard models](#guard-models-moderation)).

## In practice
Fairlearn's `MetricFrame` reproduces the worked example:

```python
import numpy as np
from sklearn.metrics import precision_score
from fairlearn.metrics import (
    MetricFrame, count, selection_rate, true_positive_rate,
    false_positive_rate, demographic_parity_ratio, equalized_odds_difference,
)

def from_counts(tp, fp, fn, tn):
    """Rebuild label and prediction arrays from confusion-matrix counts."""
    y_true = [1] * tp + [0] * fp + [1] * fn + [0] * tn
    y_pred = [1] * tp + [1] * fp + [0] * fn + [0] * tn
    return y_true, y_pred

ya, pa = from_counts(350, 150, 150, 350)   # group A, base rate 50%
yb, pb = from_counts(210, 90, 90, 610)     # group B, base rate 30%
y_true, y_pred = np.array(ya + yb), np.array(pa + pb)
group = np.array(["A"] * len(ya) + ["B"] * len(yb))

mf = MetricFrame(
    metrics={"n": count, "selection": selection_rate, "tpr": true_positive_rate,
             "fpr": false_positive_rate, "ppv": precision_score},
    y_true=y_true, y_pred=y_pred, sensitive_features=group,
)
print(mf.by_group.round(3))   # tpr and ppv 0.7 in both; fpr 0.300 vs 0.129
print(demographic_parity_ratio(y_true, y_pred, sensitive_features=group))   # 0.6
print(equalized_odds_difference(y_true, y_pred, sensitive_features=group))  # 0.171
```

- **Decide first:** write down the decision, harm, criterion and tolerated gap.
- **Matched pairs for LLM applications:** vary only a stated demographic or a name across many otherwise identical prompts, and estimate the difference with an interval, as Tamkin et al. ([2023](https://arxiv.org/abs/2312.03689)) did in 70 decision scenarios.
- **Sensitive attributes:** [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng) Article 9 generally prohibits processing data such as ethnic origin. As of November 2026, EU AI Act Article 4a ([Regulation (EU) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng)) lets providers of high-risk systems, and more narrowly other providers and deployers, use it for bias detection and correction when strictly necessary and with safeguards.
- **Legal vocabulary** (information as of November 2026, not legal advice; see [US AI law](#us-ai-law)): disparate treatment is treating people differently because of a protected trait; disparate impact is a neutral practice with a disproportionate effect not justified by business necessity ([42 U.S.C. § 2000e-2](https://www.law.cornell.edu/uscode/text/42/2000e-2)). New York City's Local Law 144 requires yearly audits of hiring tools that report impact ratios by sex, race or ethnicity and intersections ([DCWP rule](https://rules.cityofnewyork.us/rule/automated-employment-decision-tools-updated/)), and it requires no specific action based on the results ([DCWP FAQ](https://www.nyc.gov/assets/dca/downloads/pdf/about/DCWP-AEDT-FAQ.pdf)).
- **Recourse:** tell people which actionable inputs would change the outcome ([Ustun et al., 2019](https://arxiv.org/abs/1809.06514)) and how to contest it. For some solely automated decisions, GDPR Article 22(3) requires a right to human intervention and to contest the decision ([human in the loop](#human-in-the-loop)).

## Numbers to know
> [!number]
> Rules of thumb. A selection-rate ratio below 0.8 is generally treated as evidence of adverse impact under the four-fifths rule ([29 CFR 1607.4(D)](https://www.law.cornell.edu/cfr/text/29/1607.4)). As of November 2026, the EEOC plans to rescind the interpretive parts of these guidelines, with final action listed for November 2026 ([RIN 3046-AB43](https://www.reginfo.gov/public/do/eAgendaViewRule?pubId=202510&RIN=3046-AB43)). A slice of 50 with 10% errors has a 95% interval of about ±8 points by the normal approximation: 1.96 × √(0.1 × 0.9 ÷ 50).

## Pitfalls and anti-patterns
> [!pitfall] Treating the four-fifths rule as a fairness test
> It compares selection rates only, says nothing about errors or calibration, and the guideline itself lets sample size and statistical significance override it.

> [!pitfall] Group thresholds in US hiring
> US law forbids different cutoff scores on employment tests by race, color, religion, sex or national origin ([42 U.S.C. § 2000e-2(l)](https://www.law.cornell.edu/uscode/text/42/2000e-2)), so per-group thresholds may be unlawful there.

## Talk like an expert
The vocabulary: **independence**, **separation**, **sufficiency**, **equalized odds**, **equal opportunity**, **predictive parity**, **impact ratio**. Experts name the criterion and why, and ask for base rates and slice sizes. The live debate is how far statistics can capture fairness, which [Chouldechova](https://arxiv.org/abs/1703.00056) calls "a social and ethical concept, not a statistical one".

> [!hottake] Most fairness disputes are disputes about labels, not metrics.
> With a biased label, separation and sufficiency inherit the bias. **The counterargument:** even with perfect labels, the impossibility results remain whenever base rates differ and prediction is imperfect, so choosing a criterion is a value judgment no better label makes for you.

## Check yourself
```quiz
fairness-bias
```

## Go deeper
- Barocas, Hardt and Narayanan, [*Fairness and Machine Learning: Limitations and Opportunities*](https://fairmlbook.org/) (MIT Press, 2023).
- Gallegos et al., [“Bias and Fairness in Large Language Models: A Survey”](https://arxiv.org/abs/2309.00770) (2023).

## Related
- [Responsible AI in practice](#responsible-ai)
- [Statistics for evals](#eval-statistics)
- [Safety and red-team evals](#safety-evals)
- [Classical ML essentials](#classical-ml)
- [AI risk management](#ai-risk-management)
- [US AI law and policy](#us-ai-law)
- [Playbook: Upstart's credit model under the CFPB's first No-Action Letter](#upstart-cfpb-fair-lending)
