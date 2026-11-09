---
id: spotify-quality-at-higher-velocity
book: 22
order: "22.20"
title: "Spotify: when the volume of change outgrows verification"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [incidents, developer-productivity, coding-agents, reliability, public-record]
visuals: []
type: field-note
account: public-record
industry: "Media and streaming (audio and video)"
use_case: "Keeping service and app quality up as AI-assisted development and agentic automation raised the pace of change"
outcome: "Total merged changes rose from roughly 8,100 to 17,000 year over year in August; incident reviews so far did not identify AI-authored code as a material direct contributor"
measured_how: "Count and classification of merged PRs, August year over year, plus a monthly retrospective of all major incidents; number of incidents not stated (Spotify Engineering, September 2026)"
prerequisites: [incidents-on-call]
replications: []
---
> [!tldr]
> Spotify describes four areas that tested its quality at once, and says the cause was "the pace of change inside Spotify and across the world". Its incident reviews "did not identify AI-authored code as a material direct contributor"; the risk it names is change volume outpacing some of its verification controls. Its lesson: "The next constraint became our ability to verify it."

> [!note] From the public record
> Built from Spotify's own published account, "AI Changed How Spotify Builds. What We Learned (and Fixed) About Quality at Higher Velocity" (September 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

As of September 2026, Spotify says its services and data pipelines come together in "a super app for 777 million monthly active users", and that its platform "runs nearly 3,000 production services". Moving to AI-assisted development raised the question of what this does to quality. The post says four areas tested it at once, and "AI slop isn’t among those." Instead, "It’s the pace of change inside Spotify and across the world that has forced us to adapt."

## What happened

1. **Content processing.** Spotify processes "more than 500K new songs, videos, podcasts, and audiobooks every day". A pre-existing weakness: "processing failures could be masked". On June 24, a scheduled batch job competed with new episodes, a recent quality improvement had raised the compute per episode, and "a scheduling bug reduced throughput by about 10%." The result: "Episodes that normally published within minutes were delayed for hours." The incident report adds that "roughly four hours passed between the first alerts and formal incident response."
2. **Fleet updates.** Spotify's custom Fleet Management framework makes large scale changes every day, "with the vast majority merged automatically after passing safety checks." For over a year it has also supported "more complex agentic-driven changes", including "a recent Java migration across backend services completed in three days." But "This year, an automated dependency upgrade passed our checks, but still failed in production, impacting end users."
3. **Compute shortages.** Across the industry, the post says, "the use of AI has triggered a huge spike in demand, without commensurate supply increases, on both CPUs and GPUs", reducing spare capacity. During regional failovers earlier in the year, "this lack of capacity exacerbated issues that were previously trivial and unnoticeable." End users noticed. The post calls this "an impact of AI to our quality of service, but an indirect one".
4. **The mobile app.** The post describes "an ebb and flow in our mobile app quality" over more than a decade. Now "AI has increased the pace of change, which means this cycle moves at a higher frequency and gaps surface faster." The gap: "individual releases can look healthy while smaller regressions accumulate over time".

## Impact, and how it was measured

- **Volume of change.** "Total merged changes more than doubled year over year in August, from roughly 8,100 to 17,000."
- **Kind of change.** "We classify every merged PR by the work it contains", into features, code quality and optimization, maintenance, and documentation. "Quality and optimization work rose from 27% of that mix to 31%," and "Maintenance and configuration fell from 31% of the mix to 25%."
- **Incidents.** "Every month we run a retrospective of all major incidents." During its AI ramp-up, Spotify added two questions: "Did AI-authored code directly contribute to the incident?" and whether more change put "additional pressure on review, testing, rollout, or observability". The first finding: "Across the incidents reviewed so far, we did not identify AI-authored code as a material direct contributor."
- **Rework and warning signals.** Citing the FAROS 2026 report on an industry-wide rise in code churn, the post says "we see no corresponding rise in rework rate." But "code complexity and PR size are both creeping up".

**Not measured:** the post does not state which AI tools are used, which repositories the counts cover, how many incidents were reviewed, how PRs were classified or AI-authored code identified, or what share of changes was written with AI. It gives no values for rework rate, complexity or PR size. No incident has user counts, and the May incident, the failovers and the failed upgrade have no dates or durations.

## Why it happened

For content processing, the post names as root causes "subtle misses on failure alerting, challenges in capacity planning, and small gaps in workload controls." The incident report adds: "Our transcoding infrastructure was running with insufficient headroom to handle large spikes of content delivery."

The incident retrospectives did find the second risk: "the volume of change increased faster than some of our verification controls could adapt." It also says "data does not show a distinct direct AI-authored failure signature."

## What changed afterwards

- **Content processing.** Spotify "added end to end monitoring so we know of failures before creators do", fixed the scheduler, moved batch jobs to a lower priority and increased capacity. It reworked service tiering and workload prioritization so "critical services and new uploads take precedence when capacity is constrained".
- **Fleet updates.** Spotify is "strengthening safeguards, expanding rollback capacity," and "scheduling automated changes during owning teams’ working hours."
- **Compute.** "We doubled reserved edge capacity after a May incident." Part of internal service-mesh traffic can be shifted manually; edge traffic control and regional spillover tests "are still under way". The aim is to "move traffic gradually while ensuring receiving regions can absorb the additional load".
- **Mobile.** "We have now broadened those quality signals and added longer-term trends to those decisions".

The post does not say whether these changes worked.

## Lessons

The source's own lesson: "AI increased the capacity to produce change." "The next constraint became our ability to verify it." The controls that must keep pace are "automated safeguards, rollback, observability, failover, and quality measurement".

The wiki's reading:

- **Ask who wrote the code, then look past it.** Check whether verification kept up with volume. See [Incidents and on-call](#incidents-on-call).
- **Changes that merge on their own need a way back.** An automated upgrade passed Spotify's checks and still failed in production. See [Cloud agents, CI and review bots](#cloud-and-ci-coding-agents).
- **Watch slow signals.** Healthy releases can hide accumulating regressions. See [Measuring the impact and ROI of an AI feature](#measuring-ai-impact).
- **Read the headline finding with its limits.** It has no incident count and no stated method, so outsiders cannot check it.

## Disclosure

None.

## Sources

- Tyson Singer, Head of Technology and Platforms, SVP, Spotify, [“AI Changed How Spotify Builds. What We Learned (and Fixed) About Quality at Higher Velocity”](https://engineering.atspotify.com/2026/9/ai-changed-how-spotify-builds-what-we-learned-and-fixed-about-quality-at-higher-velocity), Spotify Engineering blog, 16 September 2026.
- Jim Whitehead, Ulrik Mikaelsson, John Lagomarsino and Saunak Jai Chakrabarti, Spotify, [“Content Ingestion & Podcast Video Incident Report”](https://engineering.atspotify.com/2026/7/content-ingestion-and-podcast-video-incident-report), Spotify Engineering blog, 20 July 2026.

## Related

- [About field notes](#about-field-notes)
- [Incidents and on-call](#incidents-on-call)
- [Working effectively with coding agents](#working-with-coding-agents)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Reliability engineering](#reliability-engineering)
