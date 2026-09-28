# AI Qualification Contract

## Goal

Convert conversation context into a bounded sales qualification suggestion.

## Input

- recent customer/agent messages
- optional service catalog
- existing contact/lead information

## Structured output

{
"intent": "low|medium|high|unknown",
"urgency": "low|medium|high|unknown",
"serviceInterest": "string|null",
"budget": {
"amount": "number|null",
"currency": "string|null",
"explicitlyMentioned": "boolean"
},
"summary": "string",
"recommendedNextAction": "string",
"confidence": "number 0..1",
"missingInformation": ["string"]
}

## Rules

- Never invent budget or customer facts.
- Unknown is acceptable.
- Validate with a runtime schema before using output.
- Qualification is advisory.
- Record provider/model/token/latency metadata.
- Provider must be replaceable behind an interface.
- Tests use a deterministic fake provider, not live API calls.
