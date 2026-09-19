# Security

## Security posture

This repository is a working prototype and is not yet a secure multi-user production application.

The most important outstanding issue is **authentication and authorization**.

## Current controls

### Input validation

- Only PDF and DOCX MIME types are accepted.
- Uploads have a configurable size limit.
- Resume IDs are parsed as UUIDs.
- Analyze requests have minimum and maximum text length constraints.

### Server-side secrets

OpenAI credentials are read by the backend from environment variables.

The browser should never receive the OpenAI API key.

### Response hardening

The API currently adds:

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin

### AI safety

The extraction prompt instructs the model not to invent facts and to attach evidence to extracted skills.

## Critical current limitation

There is currently no authenticated user identity attached to a Resume record.

That means these data-access operations are not yet owner-scoped:

- resume listing
- resume detail lookup
- candidate semantic search

Consequently, the current prototype must be treated as **single-tenant/trusted-user infrastructure only**.

## Required production fix

The target security model is:

~~~text
User
  ↓
Authentication provider
  ↓
Verified user identity
  ↓
Resume.user_id
  ↓
Server-side authorization
  ↓
owner-scoped database queries
~~~

Every protected operation should derive ownership from the verified identity rather than from request-body fields or frontend state.

## Authorization requirements

### Upload

Create the resume with the authenticated user's ID.

### List

Return only resumes owned by the authenticated user.

### Detail

Fetch by both resume ID and authenticated owner ID.

### Search

Only compare against vectors belonging to the authenticated user unless an explicit organization-level search model is introduced.

### Analysis

Protect the endpoint from unauthenticated abuse and apply request/rate limits.

## Threats to consider

### Cross-user data access

Prevent a user from guessing or obtaining another resume UUID and reading its contents.

### Unbounded AI usage

Prevent a client from sending unlimited analysis requests and consuming the application's OpenAI budget.

### Malicious uploads

Validate file type, size, and parser behavior. Consider malware scanning and storage isolation before accepting untrusted public uploads at scale.

### Prompt injection

Resume text is untrusted input. The extraction prompt must distinguish instructions from resume content and must never treat resume text as system-level instructions.

### Sensitive information exposure

Resumes may contain phone numbers, email addresses, addresses, education history, employment history, and other personal information. Logs and error responses should avoid copying sensitive content unnecessarily.

## Security checklist

Before a public multi-user launch:

- [ ] Authentication
- [ ] Server-side authorization
- [ ] Owner-scoped database queries
- [ ] Rate limiting
- [ ] AI usage budgets
- [ ] Secure secret management
- [ ] File upload hardening
- [ ] Dependency/update monitoring
- [ ] Audit logging
- [ ] Production CORS allowlist
- [ ] Security testing for IDOR/BOLA-style access
