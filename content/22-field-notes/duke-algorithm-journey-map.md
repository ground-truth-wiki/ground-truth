---
id: duke-algorithm-journey-map
book: 22
order: "22.22"
title: "SepsisWatch at Duke: what it took to put a sepsis model into practice"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [healthcare, clinical-prediction, deployment, change-management, public-record]
visuals: []
type: field-note
account: public-record
industry: "Healthcare (university health system)"
use_case: "SepsisWatch, a custom machine learning tool that predicts sepsis, with rapid response team nurses as its primary users"
outcome: "No clinical outcome metrics reported; the process map surfaced lessons in modeling assumptions, stakeholder inclusion and organizational structure"
measured_how: "20 unstructured interviews with six Duke Institute for Health Innovation team members, turned into workflow diagrams; no model, outcome or cost metrics (Boag et al., npj Digital Medicine, April 2024)"
prerequisites: [mlops-foundations]
replications: []
---
> [!tldr]
> Duke University Health System built SepsisWatch, a machine learning tool that predicts sepsis. A later study, based on interviews with the innovation team, mapped its path from a fall 2015 innovation competition to lifecycle management. The Epic solution could not run the model, a training-data cut later forced a separate "2.0" project, and health system and service-line nurse leaders were left out until clinical integration. The paper reports that most of the model decisions that hampered the project occurred early.

> [!note] From the public record
> Built from the Duke Institute for Health Innovation's own published account, "The algorithm journey map: a tangible approach to implementing AI solutions in healthcare" (April 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

SepsisWatch is a machine learning tool for predicting sepsis at Duke University Health System. Its primary users are rapid response team (RRT) nurses, and the paper describes its use in the emergency department (ED). It began in the fall of 2015 with an innovation competition that "featured a strategic priority to reduce inpatient mortality". The funded project brought in the Duke Institute for Health Innovation (DIHI), an internal innovation team, and a statistics faculty member and graduate student from the university.

The April 2024 paper reconstructs the effort: "We conducted 20 interviews with the team of engineers and scientists that led the multi-year effort to build the tool". The six participants were all DIHI staff.

## What happened

After problem identification, the paper maps three more stages.

1. **Development.** RRT nurses reported to cardiology, which was not primarily responsible for sepsis care quality, so the project team and hospital leaders created a patient response program to house them. RRT nurse feedback turned a planned dashboard into a workflow tool, built as a custom web application because the health record could not support it then. Designers chose point-in-time views over risk trends, worried that users would over-rely on the trend.
2. **Integration.** The question was whether the model could be integrated into Epic via its Cognitive Computing Platform. Over a period of 6 months, the innovation team and health system IT "conducted due diligence on the Epic solution and determined it was not able to run the sepsis AI tool". IT and DIHI built a pipeline from Epic's Chronicles database to a model server, a database and the web application, and tested it for a few months. "Once IT signed off on the data pipeline, the sepsis AI tool was configured to pull real-time data once every 5 min." Before a "silent trial", regulatory leaders determined that the tool qualified as non-device clinical decision support. At clinical integration, a meeting with the chief nursing officer made clear that working mainly with physician leaders had "left out nurse leaders at the health system level and within relevant service lines". Working with nurse leaders and certified nurse educators, the team adapted the workflow and developed training material.
3. **Lifecycle management.** Ongoing work covers monitoring, audits that include shadowing RRT nurses, and a refresh of data element groupers every 6 months, under 2 owners: the clinical champion and the DIHI project manager.

The paper gives no go-live date.

## Impact, and how it was measured

The study maps the process; it does not measure outcomes. The authors call the path "highly circuitous, confusing, and not meant to ever be repeated". The problems it reports:

- **Scope.** Training data was truncated at ICU transfer, which "limited the future ability to expand the use of the sepsis AI tool beyond the ED to general inpatient wards". Expanding to the wards needed a new "2.0" project.
- **Model.** The first design, a Multi-task Gaussian Process for imputation followed by an LSTM classifier, needed matrix inversion and significant computation, which the team realized only during technical integration. The team eventually used fill-forward imputation for the LSTM.
- **People.** Decisions shaped by physician leaders but not nurses "culminated in the clinical integration stage being nontrivially complex and stressful".
- **Unused devices.** iPads had been prepared for RRT nurses and for patient workflow coordinator nurses in the ED, but a few months after clinical integration the team learned that "the patient workflow coordinators were too busy with other duties to be using the sepsis AI tool".

**Not measured:** the paper reports no model performance, alert volume, bundle compliance, patient outcomes, costs or staff time. All six interviewees were innovation team members; the paper reports no interviews with nurses or patients. The adoption "did not include patients at any step".

## Why it happened

- **Modeling assumptions.** "There were multiple areas where technical decisions about the model hampered the project." Clinical collaborators expected no ICU use, physicians disagreed on the sepsis definition, and the team had not considered that every input must be available in real time; on Epic, IT builds an endpoint for each kind of element (see [training-serving consistency](#feature-stores)). The authors add that "it should have been knowable at the time that the runtime environment would limit expensive model architectures".
- **Stakeholder inclusion.** Although RRT nurses were in the early designs, "it was not well understood that physicians and nursing leaders within service lines and hospitals manage separate activities".
- **Organizational structure.** Research faculty had no mechanism to dedicate time to health system projects, and RRT nurses sat in cardiology. The authors say regular check-ins with front-line workers, in addition to managers, could have streamlined the iPad rollout.

## What changed afterwards

"Modeling became easier once the outcome definition was modularized." DIHI "has grown significant internal machine learning expertise", and an alert notification system spun off as a standalone product that now supports many AI tools. The paper does not report whether these changes improved results.

## Lessons

The source's generalizable insights include "Only include data elements in an AI tool if the data is available and robustly captured at the time predictions need to be made", "When building an AI tool for integration, reduce unnecessary complexity", and "Adapt the workflow to the needs of front-line workers and build flexibility into early pilots." It also asks teams to identify up front the reporting structures, training requirements and communication channels of every clinical profession a tool affects. Among the authors' own limits: one algorithm in one setting, and maps that may amplify existing power structures.

The wiki's reading:

- **Put deployment into the scope.** Real-time inputs, the compute budget and the patients in the training data decided what could ship and where. Check them at [scoping](#ai-use-case-scoping), before training.
- **Design against over-reliance.** Showing risk at a point in time rather than as a trend was a deliberate interface choice; see [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines).
- **Ownership is part of the system.** Named owners, monitoring and regular data refreshes are the [MLOps](#mlops-foundations) work that keeps such a tool running.

## Disclosure

None.

## Sources

- William Boag, Alifia Hasan, Jee Young Kim, Mike Revoir, Marshall Nichols, William Ratliff, Michael Gao, Shira Zilberstein, Zainab Samad, Zahra Hoodbhoy, Mushyada Ali, Nida Saddaf Khan, Manesh Patel, Suresh Balu and Mark Sendak, Duke Institute for Health Innovation, Duke University School of Medicine, Harvard University and Aga Khan University, [“The algorithm journey map: a tangible approach to implementing AI solutions in healthcare”](https://www.nature.com/articles/s41746-024-01061-4), npj Digital Medicine 7, 87, published 9 April 2024, doi:10.1038/s41746-024-01061-4. Read through its [PubMed Central copy](https://pmc.ncbi.nlm.nih.gov/articles/PMC11003994/). The paper's competing-interests statement reports that several authors co-invented software that Duke University licensed to external companies, and that some own equity in Clinetic.

## Related

- [About field notes](#about-field-notes)
- [MLOps and LLMOps foundations](#mlops-foundations)
- [Scoping AI features: when to use AI and what success means](#ai-use-case-scoping)
- [Feature stores and training-serving consistency](#feature-stores)
- [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines)
