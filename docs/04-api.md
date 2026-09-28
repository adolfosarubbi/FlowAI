# REST API v1

Prefix: /api/v1

## Auth

POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET /auth/me

## Contacts

GET /contacts
POST /contacts
GET /contacts/:id
PATCH /contacts/:id

## Conversations

GET /conversations
GET /conversations/:id
GET /conversations/:id/messages
POST /conversations/:id/messages
POST /conversations/:id/assign

## Leads

GET /leads
POST /leads
GET /leads/:id
PATCH /leads/:id
POST /leads/:id/move
POST /leads/:id/qualify

## Pipeline

GET /pipeline
GET /pipeline/stages

## Tasks

GET /tasks
POST /tasks
PATCH /tasks/:id
POST /tasks/:id/complete

## Dashboard

GET /dashboard/summary
GET /dashboard/pipeline
GET /dashboard/activity

## Integrations

GET /integrations
POST /integrations/whatsapp/connect
GET /integrations/whatsapp/status

## Webhooks

GET /webhooks/whatsapp
POST /webhooks/whatsapp

## Demo

POST /demo/messages
POST /demo/reset

## Standards

- JSON
- Swagger/OpenAPI
- consistent pagination
- DTO validation
- standardized error envelope
- 401 unauthenticated
- 403 unauthorized
- tenant-safe 404
- 409 for relevant conflicts/idempotency
