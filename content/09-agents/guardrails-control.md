---
id: guardrails-control
book: 9
order: "9.10"
title: Guardrails and control
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [guardrails, permissions, budgets]
visuals:
  - guardrail-layers:diagram
  - guardrail-stepper:stepper
  - run-cost-guard:calculator
---
> [!tldr]
> Guardrails are the checks and limits around an agent: input and output filters, tool policies, budgets, loop detection, permissions, sandboxes and a kill switch. Rules written in the prompt are requests; rules enforced in code are guardrails.

## Why it matters
Agents fail in ways nobody predicted: a loop that burns a day’s budget in an hour, a command that touches the wrong directory, a reply that leaks a secret from a log file. You cannot prompt your way out of these, because the model is the component that failed. Guardrails catch failures after the model makes them, and the best ones make certain failures impossible.

## Intuition
A guardrail on a mountain road does not steer the car; it stops the car from leaving the road when the driver makes a mistake. Agent guardrails work the same way. They sit outside the model, they are boring, and they only matter on the bad day.

```viz
{"id":"guardrail-layers","component":"diagram","title":"The strongest guardrails are the ones the model cannot talk its way past","caption":"Ordered from strongest at the top to weakest at the bottom. Click a layer for the chapter that covers it. Defense in depth means using several; no single layer is enough.","alt":"Layered diagram of guardrails from network and sandbox limits at the top to system prompt instructions at the bottom.","data":"illustrative","w":560,"layer_h":46,"layers":[
{"id":"net","label":"Network and egress limits","sub":"infrastructure: cannot be argued with","link":"#sandboxes"},
{"id":"box","label":"Sandbox and permissions","sub":"what the process can touch","link":"#sandboxes"},
{"id":"budget","label":"Budgets and rate limits","sub":"steps, tokens, dollars, time"},
{"id":"policy","label":"Tool policy","sub":"allowlists, argument validation, approvals","role":"tool","link":"#human-in-the-loop"},
{"id":"loop","label":"Loop and anomaly detection","sub":"repeated calls, no progress","role":"agent","link":"#agent-failure-modes"},
{"id":"io","label":"Input and output checks","sub":"classifiers, PII and secret filters","role":"data","link":"#privacy"},
{"id":"prompt","label":"System prompt rules","sub":"requests, not guarantees","role":"context","link":"#prompting-fundamentals"}]}
```

## How it works
**Input checks** screen what enters: policy classifiers, prompt-injection detectors, PII detection, size limits. They lower risk but are probabilistic. See [prompt injection](#prompt-injection).

**Output checks** screen what leaves: redact secrets and personal data, block policy violations, validate formats, strip remote images or links that could exfiltrate data.

**Tool policy** validates every tool call before it runs: allowlisted tools per task, argument checks (paths inside the workspace, amounts under a limit), and approvals for risky classes. Implement it in hooks or a policy layer, not in prose. See [harness anatomy](#harness-anatomy).

**Budgets and rate limits** cap steps, tokens, dollars and wall-clock time per run, per user and per day. A budget is the guardrail that catches failures you never imagined.

**Loop and anomaly detection** watches the trajectory: the same tool call with the same arguments several times, no new information for N steps, or a sudden spike in spend. The response can be a nudge to the model, a forced strategy change, or a stop.

**Permissions and sandboxes** limit what the process can reach at the operating-system level: files, network hosts, credentials. See [sandboxes](#sandboxes).

**A kill switch** stops one run, one feature or every agent, from outside, immediately.

**Guardrail frameworks and guard models.** Libraries such as NVIDIA’s NeMo Guardrails and Guardrails AI, and guard models such as Llama Guard or provider moderation endpoints, package common checks. Use them as layers, and calibrate them on your data like any classifier.

Follow one request through the layers:

```viz
{"id":"guardrail-stepper","component":"stepper","title":"Three different layers stop three different mistakes in one cleanup task","caption":"Step through an illustrative run. No layer depends on the model behaving well: the policy layer blocks a bad path, the loop detector stops a retry spiral, and the output filter catches a leaked key.","alt":"Stepper following a log-cleanup request through input check, model, tool policy, loop detection, budget and output check.","data":"illustrative","diagram":{"w":620,"h":58,"nodes":[{"id":"in","label":"Input\ncheck","role":"data","align":"center","glyph":false,"x":0,"y":0,"w":80,"h":56},{"id":"model","label":"Model","role":"model","align":"center","glyph":false,"x":90,"y":0,"w":80,"h":56},{"id":"policy","label":"Tool\npolicy","role":"tool","align":"center","glyph":false,"x":180,"y":0,"w":80,"h":56},{"id":"loop","label":"Loop\ndetector","role":"agent","align":"center","glyph":false,"x":270,"y":0,"w":80,"h":56},{"id":"budget","label":"Budget","align":"center","glyph":false,"x":360,"y":0,"w":80,"h":56},{"id":"box","label":"Sandbox","align":"center","glyph":false,"x":450,"y":0,"w":80,"h":56},{"id":"out","label":"Output\ncheck","role":"data","align":"center","glyph":false,"x":540,"y":0,"w":80,"h":56}],"edges":[{"from":"in","to":"model"},{"from":"model","to":"policy"},{"from":"policy","to":"loop"},{"from":"loop","to":"budget"},{"from":"budget","to":"box"},{"from":"box","to":"out"}]},
"frames":[
{"label":"Request","highlight":["in"],"caption":"“Clean up old log files.” The input check finds nothing unusual and passes it on."},
{"label":"Proposal","highlight":["model"],"caption":"The model proposes a shell command that deletes everything under /var/log.","code":"rm -rf /var/log/*"},
{"label":"Policy","highlight":["policy"],"caption":"The tool policy rejects it: the path is outside the workspace. The error goes back to the model as a tool result.","code":"error: path /var/log is outside the allowed workspace ./logs"},
{"label":"Retry spiral","highlight":["model","loop"],"caption":"The model retries the same command twice. The loop detector sees three identical calls and injects a message asking for a different approach."},
{"label":"Recovery","highlight":["model","box"],"caption":"The model lists ./logs, finds 40 files older than 30 days, and deletes them inside the sandbox."},
{"label":"Budget","highlight":["budget"],"caption":"Seven steps and about 30,000 tokens so far, well under the run’s limits of 25 steps and $1."},
{"label":"Output","highlight":["out"],"caption":"The final summary quotes a log line containing an API key. The output filter redacts it before the user sees it.","code":"… connected with key sk-live-••••••••"}]}
```

## In practice
Set budgets from a worst case, not an average:

```viz
{"id":"run-cost-guard","component":"calculator","title":"A step limit is also a cost limit: worst-case spend per run is steps times tokens times price","caption":"Enter your own limits and prices; the defaults are illustrative. If the worst case is a number you would not accept, lower the step limit or the per-step context.","alt":"Calculator for worst-case cost per agent run and per day from step limit, tokens per step, prices and runs per day.","data":"formula","outputs":[{"id":"per_run","label":"Worst-case cost per run","expr":"max_steps * (in_per_step * price_in + out_per_step * price_out) / 1000000","unit":"usd","main":true},{"id":"per_day","label":"Worst case per day","expr":"per_run * runs_per_day","unit":"usd"}],"inputs":{"max_steps":50,"in_per_step":20000,"out_per_step":500,"price_in":3,"price_out":15,"runs_per_day":200},"input_meta":{"max_steps":{"label":"Step limit"},"in_per_step":{"label":"Input tokens per step","unit":"at the limit"},"out_per_step":{"label":"Output tokens per step"},"price_in":{"label":"Input price","unit":"$ per million, illustrative"},"price_out":{"label":"Output price","unit":"$ per million, illustrative"},"runs_per_day":{"label":"Runs per day"}},"assumptions":["Every run hits the step limit with a full context each step.","No prompt caching; cached input makes real costs much lower.","Tool costs and retries are not included."],"tests":[{"inputs":{},"expect":{"per_run":3.375,"per_day":675}},{"inputs":{"max_steps":10},"expect":{"per_run":0.675,"per_day":135}}]}
```

A minimal guardrail set for any agent with tools:

```python
# Pseudocode: checks the harness runs around every tool call.
def guarded_call(call, run):
    if run.steps >= MAX_STEPS or run.cost_usd >= MAX_COST:
        raise StopRun("budget exhausted")                  # budgets
    if call.name not in ALLOWED_TOOLS[run.task_type]:
        return error("tool not allowed for this task")     # allowlist
    if not policy.validate(call):                          # paths, amounts, hosts
        return error(policy.reason(call))
    if run.recent_calls.count(call.signature) >= 3:
        return error("You have tried this three times. Try a different approach.")
    if call.risk >= Risk.IRREVERSIBLE and not approved(call):
        return error("The user declined this action.")      # human gate
    return sandbox.run(call)                               # OS-level limits
```

## Numbers to know
> [!number]
> Rules of thumb. Three identical consecutive tool calls is a common loop-detection threshold. Set step limits from the 95th percentile of successful runs plus headroom, and cost limits from the worst case. Classifier-based checks have error rates; measure their false positives as well as their catch rate.

## Pitfalls and anti-patterns
> [!pitfall] Guardrails that only exist in the system prompt
> “Never delete files outside the project” is a sentence the model may ignore under pressure or manipulation. Enforce it in the tool layer or the sandbox.

- **Silent blocks.** A blocked call that returns nothing leaves the model guessing; return a reason.
- **Over-blocking.** Guardrails with high false-positive rates train users and developers to switch them off.
- **No per-user limits.** One user’s runaway loop should not consume everyone’s budget.
- **Untested kill switches.** A kill switch you have never pulled may not work.

## Talk like an expert
The vocabulary: **defense in depth**, **enforced versus requested**, **allowlist**, **budget**, **loop detection**, **guard model**, **output filtering**, **kill switch**. Experts classify every guardrail by what defeats it: a prompt rule is defeated by persuasion, a classifier by an unusual input, a sandbox only by a sandbox escape. The live debate is how much safety to put in the model versus around it; production teams want both.

> [!hottake] A budget is the most important guardrail, because it catches the failures you did not predict.
> **The counterargument:** budgets limit how much damage accumulates, not whether a single catastrophic action happens; one destructive call needs a permission or approval guardrail, not a cost cap.

## Check yourself
```quiz
guardrails-control
```

## Go deeper
- NVIDIA NeMo Guardrails and Guardrails AI documentation, for guardrail frameworks.
- Inan et al., “Llama Guard: LLM-based Input-Output Safeguard for Human-AI Conversations” (2023).

## Related
- [Human in the loop](#human-in-the-loop)
- [Secure agent design](#secure-agent-design)
- [Sandboxes and execution environments](#sandboxes)
- [Agent failure modes](#agent-failure-modes)
- [Cost and capacity](#cost-capacity)
