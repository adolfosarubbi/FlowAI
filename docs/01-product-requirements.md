# FlowAI - Product Requirements v1

## Problem

Small businesses frequently receive commercial inquiries through WhatsApp but manage them manually. Leads get lost, follow-ups are forgotten and management has little visibility into conversion.

## Promise

FlowAI turns inbound WhatsApp conversations into structured, trackable sales opportunities.

## Users

- Admin: workspace, users, integrations, AI configuration.
- Manager: pipeline, metrics, assignments.
- Agent: inbox, conversations, leads and follow-ups.

## MVP

1. Authentication and workspace.
2. Roles: Admin, Manager, Agent.
3. Contacts.
4. Demo inbound-message transport.
5. Conversation inbox.
6. Leads.
7. AI qualification.
8. Kanban pipeline.
9. Tasks/follow-ups.
10. Dashboard.
11. Audit log.
12. Real WhatsApp integration after the demo transport works.

## Default pipeline

New -> Qualified -> Appointment -> Proposal -> Won / Lost

## AI qualification

May suggest:

- intent
- urgency
- service interest
- budget only if explicitly stated
- summary
- recommended next action
- confidence
- missing information

All AI suggestions remain human-editable.

## Dashboard

- inbound conversations
- leads created
- qualified leads
- tasks due
- won leads
- conversion rate
- leads by stage
- average first response time

## Out of scope for MVP

- billing/subscriptions
- native mobile app
- arbitrary workflow builder
- voice calls
- full marketing campaign system
- RAG knowledge base
- Instagram/Facebook inbox

## MVP success

A demo user can simulate an inbound message, see it in the inbox, qualify it with AI, create/update a lead, move it through the pipeline and see dashboard metrics update.
