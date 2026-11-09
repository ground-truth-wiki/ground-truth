---
id: mlops-foundations
book: 16
order: "16.0"
title: MLOps and LLMOps foundations
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [mlops, llmops, technical-debt, model-registry, experiment-tracking]
visuals:
  - mlops-foundations-loop:diagram
  - mlops-foundations-maturity:stepper
  - mlops-foundations-release-compare:compare
  - mlops-foundations-test-score:calculator
prerequisites: [ai-engineering-stack]
---
> [!tldr]
> MLOps is DevOps extended to data and models: version code, data and models together, retrain through automated pipelines, deploy only what the model registry holds, and monitor both the service and its predictions. LLMOps keeps that discipline and adds new versioned artifacts: prompts, orchestrators, retrieval indexes, gateways, safety checks and token budgets.

## Why it matters
Sculley et al. observed that developing and deploying ML systems is “relatively fast and cheap, but maintaining them over time is difficult and expensive” ([“Hidden Technical Debt in Machine Learning Systems” (2015)](https://papers.nips.cc/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html)). A model’s behavior depends on data, and data changes without a commit. MLOps keeps a model right after launch day, and most of it applies to LLM applications too.

## Intuition
A trained model is a photograph of the world on the day its data was collected. The world moves on; the photo does not. MLOps is the darkroom routine: retake the photo when it goes stale, check each print before it goes on the wall, and keep the negatives (code, data, parameters) so any print can be traced and reprinted. The model registry is the wall.

```viz
{"id":"mlops-foundations-loop","component":"diagram","title":"A deployed model is one turn of a loop, and monitoring decides when the next turn starts","caption":"Illustrative. Click a box for the chapter that covers it. Serving loads only what the registry holds, and the dashed arrows close the loop.","alt":"Loop diagram of the ML lifecycle: data feeds experiments and the training pipeline; experiments become pipeline code; the pipeline registers a new model version; serving loads the champion version; monitoring triggers the next pipeline run and sends logged outcomes back into the data.","data":"illustrative","try":"Follow the dashed feedback arrow from monitoring to data, and ask what happens if the model’s own predictions become its next labels.","w":600,"h":250,"nodes":[
{"id":"data","label":"Data","sub":"sources and labels","role":"data","x":0,"y":40,"w":160,"h":56,"link":"#dataset-versioning-lineage"},
{"id":"exp","label":"Experiments","sub":"tracked runs","role":"human","x":220,"y":40,"w":160,"h":56},
{"id":"pipe","label":"Training pipeline","sub":"validate and train","role":"tool","x":440,"y":40,"w":160,"h":56,"link":"#data-pipeline-orchestration"},
{"id":"mon","label":"Monitoring","sub":"service and quality","role":"data","x":0,"y":190,"w":160,"h":56,"link":"#data-validation-drift"},
{"id":"serve","label":"Serving","sub":"online or batch","role":"model","x":220,"y":190,"w":160,"h":56,"link":"#serving-engines"},
{"id":"reg","label":"Model registry","sub":"versions, aliases","role":"data","x":440,"y":190,"w":160,"h":56}],
"edges":[{"from":"data","to":"exp"},{"from":"data","to":"pipe","curve":-70,"label":"fresh data"},{"from":"exp","to":"pipe","label":"code"},{"from":"pipe","to":"reg","label":"new version","dx":-45},{"from":"reg","to":"serve","label":"champion"},{"from":"serve","to":"mon"},{"from":"mon","to":"pipe","style":"dashed","label":"trigger: schedule, drift, new data"},{"from":"mon","to":"data","style":"dashed","label":"feedback","dx":38}]}
```

## How it works
**What MLOps is.** Kreuzberger et al., [“Machine Learning Operations (MLOps): Overview, Definition, and Architecture” (2023)](https://doi.org/10.1109/ACCESS.2023.3262138), define MLOps as a paradigm and “an engineering practice that leverages three contributing disciplines: machine learning, software engineering (especially DevOps), and data engineering.” Its nine principles include versioning of data, model and code, continuous training, monitoring and feedback loops. Google’s [MLOps guide](https://docs.cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning) adds that CI must test data and models too, CD delivers a training pipeline, and continuous training (CT) is “unique to ML systems.”

**Lifecycle and tracking.** Google’s lifecycle runs from data extraction through training and validation to serving and monitoring. Each training attempt is a run that records parameters, metrics and artifacts, grouped into experiments ([MLflow Tracking](https://mlflow.org/docs/latest/ml/tracking/)).

**The model registry.** A registry stores numbered versions of named models, each linked to the run that produced it: its lineage. In [MLflow](https://mlflow.org/docs/latest/ml/model-registry/), a mutable alias such as `champion` points at one version and tags record status; the older Staging and Production stages have been deprecated since version 2.9.0 ([workflow docs](https://mlflow.org/docs/latest/ml/model-registry/workflow/)). In Amazon SageMaker, setting a version’s approval status to `Approved` can start CI/CD deployment ([docs](https://docs.aws.amazon.com/sagemaker/latest/dg/model-registry-approve.html)). Either way, serving deploys only what the registry holds. In MLflow, rollback points the alias back; with SageMaker’s project templates, rejecting an approved version redeploys the latest version still marked `Approved`.

**Pipelines and continuous training.** At higher maturity you deploy the pipeline, not the model. Google lists retraining triggers: on demand, on a schedule, on new data, on performance degradation and on significant distribution change. Data validation catches skew before training; model validation compares the candidate with the production model or a baseline. Google defines three maturity levels, 0 to 2; Microsoft’s [MLOps maturity model](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/mlops-maturity-model) defines five, 0 to 4 (as of November 2026).

```viz
{"id":"mlops-foundations-maturity","component":"stepper","title":"Each maturity level automates one more part of the loop, until code changes and data changes both reach production unaided","caption":"Illustrative layout of the levels in Google Cloud’s MLOps guide, with Microsoft’s five-level model in the last step.","alt":"Stepper over six stages (notebook runs, CI/CD, training pipeline, model registry, serving, monitoring) highlighting what is automated at Google’s levels 0, 1 and 2, then listing Microsoft’s levels 0 to 4.","data":"illustrative","depicts":"Google Cloud, “MLOps: Continuous delivery and automation pipelines in machine learning”; Microsoft, “MLOps maturity model” (as of November 2026)","try":"Step to level 1 and notice that the arrow from monitoring back to the pipeline lights up for the first time.","diagram":{"w":600,"h":110,"nodes":[{"id":"exp","label":"Notebook\nruns","role":"human","align":"center","glyph":false,"x":0,"y":0,"w":90,"h":56},{"id":"ci","label":"CI/CD for\npipeline","role":"tool","align":"center","glyph":false,"x":102,"y":0,"w":90,"h":56},{"id":"pipe","label":"Training\npipeline","role":"tool","align":"center","glyph":false,"x":204,"y":0,"w":90,"h":56},{"id":"reg","label":"Model\nregistry","role":"data","align":"center","glyph":false,"x":306,"y":0,"w":90,"h":56},{"id":"serve","label":"Serving","role":"model","align":"center","glyph":false,"x":408,"y":0,"w":90,"h":56},{"id":"mon","label":"Monitoring","role":"data","align":"center","glyph":false,"x":510,"y":0,"w":90,"h":56}],"edges":[{"from":"exp","to":"ci"},{"from":"ci","to":"pipe"},{"from":"pipe","to":"reg"},{"from":"reg","to":"serve"},{"from":"serve","to":"mon"},{"from":"mon","to":"pipe","style":"dashed","curve":-70,"label":"trigger"}]},
"frames":[
{"label":"Level 0: manual","highlight":["exp","serve"],"caption":"Every step is manual. A data scientist trains in a notebook and hands a model to engineers, who deploy it as a prediction service. Google: a new version ships “only a couple of times per year,” with no CI, no CD and no active monitoring of predictions."},
{"label":"Level 1: continuous training","highlight":["pipe","serve","mon"],"edges":["serve>mon","mon>pipe"],"caption":"You deploy the training pipeline instead of a model. A trigger retrains on fresh data, data and model validation guard each run, metadata is recorded, and the validated model is served automatically. The pipeline code itself still ships by hand."},
{"label":"Level 2: CI/CD for the pipeline","highlight":["exp","ci","pipe","reg","serve","mon"],"edges":["exp>ci","ci>pipe","pipe>reg","reg>serve","serve>mon","mon>pipe"],"caption":"Pipeline code is built, tested and deployed automatically, and each trained model is pushed to a model registry before it is served. New ideas about features, model architecture and hyperparameters now ship as tested pipeline components, not by hand."},
{"label":"Microsoft’s five levels","highlight":[],"caption":"Microsoft splits the same journey into levels 0 to 4 and notes that an organization often shows traits of several levels at once.","code":"0  No MLOps                     everything manual\n1  DevOps but no MLOps          app builds and tests automated\n2  Automated training           training, tracking, model management\n3  Automated model deployment   CI/CD releases, A/B tests, registries\n4  Full MLOps automated ops     drift or regression triggers retraining"}]}
```

**Serving and monitoring.** Online inference answers synchronous requests from an application; batch inference runs asynchronously when no one waits ([Vertex AI](https://docs.cloud.google.com/vertex-ai/docs/predictions/overview)). Microsoft’s [guide to GenAIOps](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/genaiops-for-mlops) (generative AI operations, sometimes known as LLMOps) separates operational monitoring (errors, latency, token usage) from learning from production (accuracy, or groundedness and relevance for RAG). Sculley et al. add prediction bias: predicted and observed label distributions should match. A system that shapes its own future training data can feed on itself: for recommenders, [Jiang et al., “Degenerate Feedback Loops in Recommender Systems” (2019)](https://arxiv.org/abs/1902.10730) show that user interest degenerates under very mild conditions, and that an ever-growing pool of candidate items can prevent it.

**Hidden technical debt.** Sculley et al. list debts that live at the system level:
- **Boundary erosion and entanglement:** models mix inputs, so “Changing Anything Changes Everything” (CACE).
- **Hidden feedback loops:** two systems influence each other through the world.
- **Undeclared consumers:** other systems silently use a model’s output.
- **Unstable data dependencies:** inputs, such as another model’s output or a signal another team owns, change behavior; keep a versioned copy.
- **Configuration debt:** configuration can outgrow code and deserves review.
- **Glue code and pipeline jungles:** glue around generic packages, and data preparation grown into a tangle of joins.
- **Changes in the external world:** fixed thresholds go stale, so monitor live behavior.

In LLM systems, one system prompt with many instructions is entanglement: fix the tone, break the format. A service parsing model replies without a contract is an undeclared consumer. A provider alias that moves, or an index another team rebuilds, is an unstable dependency. An eval set edited in place makes this month’s score incomparable with last month’s.

**What carries over to LLMOps.** Microsoft’s GenAIOps guide applies existing MLOps investments to [fine-tuning](#fine-tuning-practice): data preparation, training, evaluation and deployment. New are orchestrators that build prompts and call models, pipelines that chunk and index grounding data, index maintenance and deployment, and gateways in front of models. Microsoft’s [maturity model](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/mlops-maturity-model) lists the extra GenAIOps capabilities as prompt life cycle, retrieval augmentation, output safety and token cost governance, which complement its MLOps levels rather than replace them (as of November 2026).

```viz
{"id":"mlops-foundations-release-compare","component":"compare","title":"An LLM release versions more moving parts than a model release, under the same discipline","caption":"Illustrative releases; names and versions are made up. Hover a marked line to see its partner.","alt":"Comparison of what one classic ML release and one LLM application release pin and monitor: code, data, model and gates on one side; code, prompt, pinned model, retrieval index, gateway, frozen eval set and gates on the other.","data":"illustrative","a":{"title":"MLOps release","text":"release   churn-classifier v7\ncode      git commit\ndata      training snapshot, schema\nfeatures  feature definitions\nparams    hyperparameters\nmodel     registry version 7, alias champion\ngate      offline metrics vs champion\nmonitor   latency, errors, drift, accuracy"},"b":{"title":"LLMOps release","text":"release   support-answer v15\ncode      git commit (orchestrator)\nprompt    prompt registry version 15\nmodel     provider model, pinned version\nindex     chunker, embedder, index build\ngateway   routes, fallbacks, budgets\neval set  frozen golden set version\ngate      eval suite + safety suite\nmonitor   latency, errors, tokens, cost,\n          groundedness, safety flags"},"links":[{"a":"registry version 7, alias champion","b":"prompt registry version 15","note":"Same pattern, new artifact: numbered versions plus a movable alias. MLflow’s Prompt Registry keeps immutable prompt versions and mutable aliases such as production."},{"a":"training snapshot, schema","b":"chunker, embedder, index build","note":"Grounding data takes the place of training data, and its pipeline and index need their own versioning and upkeep (Microsoft’s GenAIOps guide)."},{"a":"hyperparameters","b":"provider model, pinned version","note":"A hosted model is an input you do not control. Pin its version, much as Sculley et al. suggest a versioned copy of an unstable data dependency."},{"a":"offline metrics vs champion","b":"eval suite + safety suite","note":"Gated releases carry over; the graders change from labeled metrics to evals and judges."},{"b":"frozen golden set version","note":"Unversioned eval data makes scores from different months incomparable."},{"a":"latency, errors, drift, accuracy","b":"tokens, cost,","note":"Token cost and output safety join the monitored quantities."},{"b":"routes, fallbacks, budgets","note":"A gateway in front of the model is new infrastructure to deploy and monitor."}]}
```

**Map of this book.** Book 7 covers [feature stores](#feature-stores), [data validation and drift](#data-validation-drift) and [dataset versioning](#dataset-versioning-lineage); Book 1 covers [distribution shift](#anomaly-drift-detection). Book 16 continues with [reference architecture](#reference-architecture); [reliability](#reliability-engineering), [rate limits](#rate-limits-overload) and [streaming](#streaming); [observability](#observability-tracing); [prompt management](#prompt-config-management) and [CI/CD for AI](#ci-cd-for-ai); [cost](#cost-capacity); [the data flywheel](#data-flywheel); [enterprise readiness](#enterprise-readiness) and [incidents](#incidents-on-call).

## In practice
Track, register, gate, then serve by alias. With MLflow 3.18, current as of November 2026:

```python
import mlflow
from mlflow import MlflowClient
from sklearn.linear_model import LogisticRegression

NAME = "churn-classifier"
mlflow.set_experiment("churn")

with mlflow.start_run():                       # one run = one training attempt
    params = {"C": 0.5, "max_iter": 500}
    model = LogisticRegression(**params).fit(X_train, y_train)   # your own splits
    mlflow.log_params(params)
    mlflow.log_metric("val_accuracy", model.score(X_val, y_val))
    info = mlflow.sklearn.log_model(model, name="model",
                                    registered_model_name=NAME,  # creates the next version
                                    input_example=X_val[:5])

# In CI, only after the evaluation gate passes:
client = MlflowClient()
version = str(info.registered_model_version)
client.set_model_version_tag(NAME, version, "validation_status", "approved")
client.set_registered_model_alias(NAME, "champion", version)

# Serving never names a version; rollback moves the alias back.
champion = mlflow.pyfunc.load_model(f"models:/{NAME}@champion")

# The same pattern for prompts, with MLflow's Prompt Registry:
prompt = mlflow.genai.load_prompt("prompts:/support-answer@production")
```

Decision rules:
- **Deploy only from the registry;** a pipeline, not a person, moves the alias after the gates pass.
- **Pin what you do not control:** model versions, eval sets, indexes, features.
- **Match triggers to labels.** Google ties scheduled retraining to labeled data arriving daily, weekly or monthly.
- **Fix the weakest area first.** The ML Test Score of [Breck et al. (2017)](https://research.google/pubs/pub46555/) is the lowest of four area totals.

```viz
{"id":"mlops-foundations-test-score","component":"calculator","title":"One neglected area caps the ML Test Score, however strong the other three are","caption":"Count, for each of the four areas of Breck et al. (2017), the tests that run automatically and those run by hand with documented results. The default counts are illustrative: strong model tests cannot lift a system whose monitoring is manual.","alt":"Calculator for the ML Test Score: per area, automated tests earn one point and manual tests half a point, and the final score is the lowest of the four area totals.","data":"formula","try":"Automate four monitoring tests and watch the score jump from 1 to 4.","depicts":"Breck et al., “The ML Test Score: A Rubric for ML Production Readiness and Technical Debt Reduction” (IEEE Big Data 2017), section VI.A and Table V","inputs":{"data_auto":3,"data_manual":2,"model_auto":4,"model_manual":3,"infra_auto":3,"infra_manual":2,"monitor_auto":0,"monitor_manual":2},"input_meta":{"data_auto":{"label":"Features and data: automated","unit":"tests","min":0,"max":7,"step":1},"data_manual":{"label":"Features and data: manual","unit":"tests","min":0,"max":7,"step":1},"model_auto":{"label":"Model development: automated","unit":"tests","min":0,"max":7,"step":1},"model_manual":{"label":"Model development: manual","unit":"tests","min":0,"max":7,"step":1},"infra_auto":{"label":"ML infrastructure: automated","unit":"tests","min":0,"max":7,"step":1},"infra_manual":{"label":"ML infrastructure: manual","unit":"tests","min":0,"max":7,"step":1},"monitor_auto":{"label":"Monitoring: automated","unit":"tests","min":0,"max":7,"step":1},"monitor_manual":{"label":"Monitoring: manual","unit":"tests","min":0,"max":7,"step":1}},"outputs":[{"id":"data","label":"Features and data","expr":"data_auto + 0.5 * data_manual","unit":"points"},{"id":"model","label":"Model development","expr":"model_auto + 0.5 * model_manual","unit":"points"},{"id":"infra","label":"ML infrastructure","expr":"infra_auto + 0.5 * infra_manual","unit":"points"},{"id":"monitor","label":"Monitoring","expr":"monitor_auto + 0.5 * monitor_manual","unit":"points"},{"id":"score","label":"ML Test Score (lowest area)","expr":"min(data, model, infra, monitor)","unit":"points","main":true}],"assumptions":["Each area has 7 tests, 28 in all, so automated plus manual should not exceed 7 per area.","A test run by hand, with results documented and shared, earns half a point; a test a system runs automatically and repeatedly earns a full point.","Count each test once, as automated if it is.","Reading the score (Table V): 0 is more research project than production system; up to 1, serious reliability holes are possible; up to 2, a first pass at productionization; up to 3, reasonably tested; up to 5, strong enough for mission-critical systems; above 5, exceptional."],"tests":[{"inputs":{},"expect":{"data":4,"model":5.5,"infra":4,"monitor":1,"score":1}},{"inputs":{"monitor_auto":4,"monitor_manual":1},"expect":{"monitor":4.5,"score":4}},{"inputs":{"data_auto":0,"data_manual":0},"expect":{"data":0,"score":0}}]}
```

> [!try]
> List the versions behind one production answer: code, data or index, model, prompt and eval set. Each blank is MLOps work.

## Numbers to know
> [!number]
> Anchors, not laws. The ML Test Score has 28 tests, seven per area, and above 5 points is “exceptional” (Breck et al., 2017). In their survey of several dozen Google teams, no test was implemented by more than 80% of teams. Sculley et al.: a mature system “might end up being (at most) 5% machine learning code.”

## Pitfalls and anti-patterns
> [!pitfall] Deploying a model instead of a pipeline
> A hand-delivered model file works on launch day, decays from then on, and nobody can rebuild it exactly. Deploy the training pipeline, register what it produces, and serve the registry alias.

- **Training on your own outputs.** Logged predictions that become labels close a loop; Sculley et al. suggest some randomization, or data the model cannot influence.
- **Monitoring only the service.** Green latency dashboards say nothing about whether answers are still right.

## Talk like an expert
The vocabulary: **CT**, **CACE**, **training-serving skew**, **lineage**, **champion** and **challenger**, **prediction bias**, **GenAIOps**. Experts ask: can you rebuild the model behind this prediction, and what starts the next training run? The live debates: build a platform or adopt one, and how much MLOps a team needs if it never trains a model.

> [!hottake] LLMOps is MLOps with more artifacts, not a new discipline.
> **The counterargument:** Microsoft recommends assessing GenAIOps maturity separately, because those capabilities mature independently. And grading open-ended answers, which often lack a single correct label, differs from tracking accuracy on labeled predictions.

## Check yourself
```quiz
mlops-foundations
```

## Go deeper
- Sculley et al., [“Hidden Technical Debt in Machine Learning Systems” (2015)](https://papers.nips.cc/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html).
- Breck et al., [“The ML Test Score: A Rubric for ML Production Readiness and Technical Debt Reduction” (2017)](https://research.google/pubs/pub46555/).
- Google Cloud, [“MLOps: Continuous delivery and automation pipelines in machine learning”](https://docs.cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning).

## Related
- [Reference architecture](#reference-architecture)
- [Prompt and config management](#prompt-config-management)
- [CI/CD for AI](#ci-cd-for-ai)
- [The data flywheel](#data-flywheel)
- [Observability and tracing](#observability-tracing)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Field note: SepsisWatch at Duke: what it took to put a sepsis model into practice](#duke-algorithm-journey-map)
