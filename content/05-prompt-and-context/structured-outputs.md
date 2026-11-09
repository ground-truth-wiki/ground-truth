---
id: structured-outputs
book: 5
order: "5.6"
title: Structured outputs
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [json, schemas, constrained-decoding]
visuals:
  - constrained-decoding:stepper
  - json-mode-compare:compare
---
> [!tldr]
> When code consumes model output, ask for structure the API can enforce. Schema-constrained decoding makes invalid shapes impossible; typed models in Pydantic or Zod define the schema once; validation and repair loops catch the semantic errors no schema can.

## Why it matters
Free-text output breaks parsers, and “please return valid JSON” is a request, not a guarantee. A missing field or an invented enum value crashes a pipeline at 3 a.m. Structured outputs move format correctness from hope to mechanism, so your code can trust the shape and spend its checks on the meaning.

## Intuition
Asking for JSON in the prompt is handing someone a blank page and asking for a filled-in form. Constrained decoding hands them the form itself, with boxes that only accept valid entries.

```viz
{"id":"constrained-decoding","component":"stepper","title":"At each step, tokens that would break the schema are masked out before sampling","caption":"Illustrative decoding of {\"priority\": …} with an enum of low, medium and high. The model’s favorite value, “urgent”, is never possible.","alt":"Stepper showing token-by-token JSON generation under a schema, with invalid tokens masked at each step.","data":"illustrative","frames":[
{"label":"Start","caption":"The schema requires an object, so the only allowed first token is an opening brace.","tokens":["{"],"panel":"Allowed: { only. Masked: everything else, including “Sure,”."},
{"label":"Key","caption":"The only allowed key is \"priority\", so it is forced.","tokens":["{","\"priority\""]},
{"label":"Colon","caption":"JSON grammar requires a colon next.","tokens":["{","\"priority\"",":"]},
{"label":"Value","caption":"Without constraints, the model’s top choice was \"urgent\". The schema allows only three values, so the rest of the vocabulary is masked and the model picks the most likely allowed one.","tokens":["{","\"priority\"",":","\"high\""],"code":"model's ranking:   \"urgent\" 0.41   \"high\" 0.33   \"critical\" 0.12   \"medium\" 0.08\nafter the mask:    \"high\" 0.80   \"medium\" 0.19   \"low\" 0.01"},
{"label":"Close","caption":"With every required field present, only the closing brace is allowed. The output is guaranteed to parse and match the schema.","tokens":["{","\"priority\"",":","\"high\"","}"]}]}
```

## How it works
**JSON mode versus schemas.** JSON mode guarantees syntactically valid JSON, but not the shape you need. Schema-constrained decoding (offered by several providers as a strict structured-output mode) guarantees that output matches a JSON Schema: required fields present, types right, enum values valid. Prefer the schema mode where available.

**Function-call outputs.** Defining a tool whose input schema is your output schema, and forcing the model to call it, is a portable way to get typed output from any API with tool use. See [tool design](#agent-tools).

**Typed models.** Define the shape once in Pydantic (Python) or Zod (TypeScript), generate the JSON Schema from it, and parse responses back into typed objects. Libraries such as Instructor add retries with validation errors fed back to the model; BAML defines typed functions in its own language.

**Grammar engines for self-hosted models.** Outlines, XGrammar and llguidance compile a schema or grammar into a mask over the vocabulary at each step, as in the stepper above. Serving engines such as vLLM and SGLang integrate them. See [decoding](#decoding-sampling).

**Validate and repair.** A schema cannot express “the end date is after the start date” or “this customer id exists”. Validate business rules after parsing, and on failure send the errors back for one repair attempt before falling back.

```viz
{"id":"json-mode-compare","component":"compare","title":"JSON mode guarantees valid JSON; a schema guarantees the JSON you asked for","caption":"Illustrative outputs for the same ticket-triage request. Hover the marks.","alt":"Comparison of output from JSON mode and from schema-constrained decoding for a ticket-triage task.","data":"illustrative","a":{"title":"JSON mode","text":"{\n  \"Priority\": \"urgent\",\n  \"tags\": \"billing, refund\",\n  \"summary\": \"Customer charged twice\"\n}"},"b":{"title":"Schema-constrained","text":"{\n  \"priority\": \"high\",\n  \"tags\": [\"billing\", \"refund\"],\n  \"summary\": \"Customer charged twice\",\n  \"needs_human\": false\n}"},"links":[{"a":"\"Priority\": \"urgent\",","b":"\"priority\": \"high\",","note":"Wrong key casing and a value outside the enum: valid JSON, broken contract."},{"a":"\"tags\": \"billing, refund\",","b":"\"tags\": [\"billing\", \"refund\"],","note":"A string where the schema requires an array."},{"b":"\"needs_human\": false","note":"A required field the free-form output simply omitted."}]}
```

## In practice
```python
from typing import Literal
from pydantic import BaseModel, Field

class Triage(BaseModel):
    priority: Literal["low", "medium", "high"]
    tags: list[str] = Field(max_length=5)
    summary: str = Field(max_length=200)
    needs_human: bool

schema = Triage.model_json_schema()        # send this as the structured-output or tool schema
triage = Triage.model_validate_json(raw)   # parse the response; raises on mismatch
if triage.needs_human and triage.priority == "low":
    raise ValueError("needs_human with low priority: send back for one repair attempt")
```

Design rules:
- **Keep schemas small and flat** where you can; deeply nested optional structures are harder for models and grammars.
- **Use enums for closed sets** and describe each field in the schema.
- **Leave an escape hatch**, such as a `needs_human` flag or an `unknown` enum value, so the model is not forced to invent data.
- **Validate semantics after syntax**, and log repair attempts as a quality signal.

## Numbers to know
> [!number]
> Rules of thumb. Schema-constrained decoding removes parse failures; semantic validation still catches real errors in a small but non-zero share of outputs, so measure it. One repair attempt with the validation error usually fixes most of those.

## Pitfalls and anti-patterns
> [!pitfall] “Parseable” treated as “correct”
> A schema guarantees shape, not truth. Invented ids and impossible dates pass every schema check.

- **Forcing an answer with no escape value.** The model fabricates rather than leaving a required field empty.
- **Huge schemas.** They cost tokens, slow constrained decoding and confuse models; split into steps.
- **Regex parsing of free text.** It works until it does not.

## Talk like an expert
The vocabulary: **JSON mode**, **structured outputs**, **strict schema**, **constrained decoding**, **grammar**, **Pydantic** and **Zod**, **validate and repair**. Experts say “the schema is the contract” and add semantic validation behind it. The live debate is whether constraining decoding hurts quality on reasoning-heavy tasks; a common fix is to let the model reason in free text first and produce the structured result in a final step.

> [!hottake] Every model output that code consumes should be schema-constrained.
> **The counterargument:** heavy constraints can degrade reasoning quality, and some tasks are better served by free text parsed leniently; constrain the final answer, not the thinking.

## Check yourself
```quiz
structured-outputs
```

## Go deeper
- Your provider’s documentation on structured outputs or forced tool use.
- The Outlines, XGrammar and llguidance projects for grammar-constrained decoding.
- Willard and Louf, “Efficient Guided Generation for Large Language Models” (2023), the Outlines paper.

## Related
- [Decoding and sampling](#decoding-sampling)
- [Tool use and tool design](#agent-tools)
- [Document-processing and extraction pipelines](#document-extraction)
- [Prompting fundamentals](#prompting-fundamentals)
- [Grounding and citations](#grounding-citations)
- [Playbook: LinkedIn's assistant for jobs and the feed: what came easy and where it struggled](#linkedin-generative-ai-product-lessons)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Structured generation engines](#structured-generation-engines)
