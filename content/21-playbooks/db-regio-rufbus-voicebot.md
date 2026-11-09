---
id: db-regio-rufbus-voicebot
book: 21
order: "21.63"
title: "DB Regio Bus: a phone voicebot that books on-demand buses"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [transport, voice-agents, speech-recognition, call-centre-automation, public-record]
visuals: []
type: playbook
account: public-record
industry: "Public transport (on-demand bus service, Germany)"
use_case: "A phone voicebot that books on-demand bus trips in a rural district and forwards the calls it cannot handle to the booking centre's staff"
outcome: "Reached the pilot target of a 60 percent success rate; handles just under one third of bookings entirely on its own; around 700 calls per week in production"
measured_how: "Success rate counting successful bot bookings plus successful forwardings to the call centre when wanted or necessary, against a 60 percent target, in a pilot in the district of Neumarkt in der Oberpfalz, January to June 2023; no number of pilot calls given (DB Systel, January 2024)"
prerequisites: [voice-agents]
replications: []
---
> [!tldr]
> DB Regio Bus and DB Systel built a voicebot that takes phone bookings for on-demand buses ("Rufbus") and forwards callers it cannot serve to staff. In a six-month pilot in Neumarkt in der Oberpfalz it reached its target success rate of 60 percent, which counts wanted or necessary forwardings to staff as successes, and it handles just under a third of bookings on its own. The work started with data: every stop and connection in the district, and around 50,000 voice files recorded by booking centre staff.

> [!note] From the public record
> Built from DB Systel's own published account, "Dank KI automatisiert einen Rufbus bestellen – die neue Hotline für DB Regio Bus" (January 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

DB Regio Bus runs around 500 buses in Germany in demand-responsive service. A trip only runs when someone books it, in the app "Wohin Du willst" or by phone with DB Regio's booking centre, the "Fahrtwunschzentrale". DB Regio Bus Bayern reports that in the past even short waits of a few minutes on the phone led to complaints.

## Why this approach

The idea came from a DB Regio Bus hackathon and narrowed to an automated hotline. DB Systel's venture SEMMI became the partner because it specializes in AI dialogue systems. Neumarkt was chosen for criteria such as its relatively low call volume and its booking system. The article mentions a business case but gives no figures, and describes no other options considered. DB Regio states that the bot should relieve booking centre staff, not replace them.

## The approach

1. **Data first.** DB Regio and DB Systel began by capturing all stops and connections in the district.
2. **Voice recordings.** With a recording tool from DB Systel, booking centre staff recorded around 50,000 voice files, so that the speech model would know the district's stops, places and possible dialects. A DB Systel computational linguist supported the work. See [Speech recognition models](#speech-recognition).
3. **Dialogue design.** The two companies wrote the conversation flows together, based on real calls and again with the computational linguist. The article calls the opening announcement, the "Intro Prompt", decisive for callers to understand who they are talking to, what to say and how booking works. See [Task-oriented dialogue](#dialogue-systems).
4. **Integration.** The bot is connected to the booking centre's telephone system and to the "Wohin Du willst" booking system, where it saves trips directly. Callers could give a whole trip in one sentence, but for safety the bot walks them through each point. Callers then receive an SMS confirming the booking. See [Telephony and transport for voice agents](#voice-telephony).
5. **Handover.** When speech recognition does not understand a caller, the bot automatically forwards the caller to staff with a notice.
6. **Weekly releases.** During the pilot, January to June 2023, each week brought booking centre feedback and a new DB Systel release. When the success rate was good enough, DB Regio Bus decided with the district to go live.

## The stack

As of January 2024, the article names an AI dialogue platform that turns speech into text, a speech model trained on the staff recordings, AI speech output instead of pre-recorded audio, interfaces to the telephone and booking systems, and SMS confirmations. The bot can hold ten calls at the same time. No model or speech vendor is named, and the article does not say whether a large language model is used.

## Results, and how they were measured

- **Target.** "Das Ziel dieser Testphase war es, eine Erfolgsquote von 60 Prozent zu erreichen." (translated: "The goal of this test phase was to reach a success rate of 60 percent.") It counts successful bot bookings plus successful forwardings to the call centre that are wanted or necessary. A failure would be, for example, a forwarding that was not strictly necessary, or a caller hanging up during the call.
- **Target reached.** "Zum Ende der Testphase stand das Ergebnis, dass der Voicebot die 60 Prozent Erfolgsquote erreicht hat" (translated: "At the end of the test phase, the result was that the voicebot had reached the 60 percent success rate").
- **Bookings done alone.** The same end-of-pilot result says the bot handles "knapp ein Drittel der Buchungen ganz alleine" (translated: "just under a third of bookings entirely on its own"). The article says forwarding part of the calls is explicitly wanted, because some callers want advice first.
- **Share of calls.** "Während der Testphase gelangten im Schnitt 80 Prozent der Anrufe zunächst an den Voicebot." (translated: "During the test phase, on average 80 percent of calls first reached the voicebot.")
- **Volume.** The bot has been in production since June 2023. In practice it takes "bereits rund 700 Anrufe pro Woche" (translated: "already around 700 calls per week") in what the article calls a comparatively small district.

**Not measured:** the article gives no number of pilot calls or bookings, no success rate figure beyond the statement that the 60 percent target was reached, no date range for the 700 calls per week, and no figures for wait times, complaints, staff workload or cost before or after the bot. It does not say how each call was classified.

## What failed

- **Early bugs.** "Wir haben schnell gemerkt, dass es noch Bugs gibt" (translated: "We quickly noticed that there were still bugs"), recalls a SEMMI team member. Weeks and months of fine-tuning removed them. The article does not say what they were.
- **Noise and dialect.** When background noise is too loud, or the Upper Palatinate dialect becomes a language barrier, the bot forwards the caller to staff. The article says a booking can then fail "aus Sicht der Statistik" (translated: "from the statistics' point of view").
- **Complex trips.** In many cases staff are needed, for example for trips with a bicycle, a pram, several people or transfers. See [Human in the loop](#human-in-the-loop).

## What the team would do differently

The article does not say what the team would do differently. It reports what carries over. For two large Bavarian districts, Deggendorf and Passau, which also use "Wohin Du willst", the project team estimates both will need only around four months to launch. Dialogue paths and restrictions need not be built again. Each district still needs its stop names and their pronunciation trained in, residents informed and staff trained. "Neue Landkreise benötigen jedoch keine Pilotphase mehr" (translated: "New districts, however, no longer need a pilot phase").

The wiki's reading: the success rate and the share of bookings done alone answer different questions. A rate that counts wanted or necessary forwardings suits a bot designed to hand over; the share done alone shows how much booking work no longer needs staff. Stated success criteria and a fixed six-month pilot made the target checkable.

## Disclosure

None.

## Sources

- No author named, DB Systel (Deutsche Bahn), [“Dank KI automatisiert einen Rufbus bestellen – die neue Hotline für DB Regio Bus”](https://www.dbsystel.de/dbsystel/Digital-Stories/Dank-KI-automatisiert-einen-Rufbus-bestellen-die-neue-Hotline-fuer-DB-Regio-Bus--12624278), DB Systel Digital Stories, January 2024. With quotes from Asha Joseph-Pattani (IT Bus, DB Regio Bus), Robert Muras (Team SEMMI, DB Systel) and Nadia Panetta (Fahrgastmarketing, DB Regio Bus Bayern).

## Related

- [About playbooks](#about-playbooks)
- [Voice and realtime agents](#voice-agents)
- [Speech recognition models](#speech-recognition)
- [Task-oriented dialogue: from intents and slots to LLM agents](#dialogue-systems)
- [Human in the loop](#human-in-the-loop)
