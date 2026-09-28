# Data Model v1

Prisma will map these entities to PostgreSQL.

## Workspace

id, name, slug, timeZone, defaultCurrency, createdAt, updatedAt

## User

id, email, passwordHash, displayName, isActive, createdAt, updatedAt

## WorkspaceUser

workspaceId, userId, role
Role: ADMIN | MANAGER | AGENT

## Contact

id, workspaceId, firstName, lastName, phoneE164, email, notes, createdAt, updatedAt
Unique: workspaceId + phoneE164

## Conversation

id, workspaceId, contactId, channel, externalConversationKey, status, assignedUserId, lastMessageAt

## Message

id, conversationId, direction, externalMessageId, type, body, status, sentAt, receivedAt, rawPayloadJson
externalMessageId unique where appropriate

## Lead

id, workspaceId, contactId, conversationId, title, stageId, assignedUserId, source,
intent, urgency, estimatedValue, currency, serviceInterest, summary,
qualificationConfidence, createdAt, updatedAt, version

## PipelineStage

id, workspaceId, name, position, isWon, isLost

## Task

id, workspaceId, leadId, assignedUserId, type, title, description, dueAt, completedAt, status

## AiRun

id, workspaceId, conversationId, leadId, provider, model, purpose,
inputTokens, outputTokens, latencyMs, success, structuredOutputJson, errorCode, createdAt

Never persist hidden chain-of-thought.

## IntegrationConnection

id, workspaceId, provider, status, externalAccountId, encryptedConfiguration, createdAt

## IntegrationEvent

id, workspaceId nullable, provider, externalEventId, eventType, payloadJson,
processingStatus, receivedAt, processedAt
Unique: provider + externalEventId

## AuditLog

id, workspaceId, userId nullable, action, entityType, entityId, metadataJson, createdAt

## Rules

- Tenant-owned data is always scoped by workspaceId.
- Store phone numbers in E.164.
- Prisma Decimal/PostgreSQL numeric for money, never JS floating point calculations.
- Store timestamps in UTC.
- Add indexes based on actual query paths.
