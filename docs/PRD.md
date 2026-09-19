# Product Requirements Document

## 1. Product

**Name:** Resume Intelligence Platform

**Type:** AI-powered resume parsing, candidate intelligence, and semantic search platform.

## 2. Problem

Recruiters and hiring teams often work with resumes containing inconsistent layouts, different wording, and unstructured skill descriptions. Keyword-only search can miss relevant candidates when the resume vocabulary and job vocabulary differ.

The product converts resumes into structured candidate profiles and adds semantic search so users can find candidates by meaning, not just exact keyword matches.

## 3. Goals

### Primary goals

- Accept common resume formats such as PDF and DOCX.
- Extract readable text reliably.
- Convert resume text into a predictable candidate schema.
- Preserve evidence for extracted skills.
- Support semantic candidate search.
- Degrade gracefully when AI enrichment is unavailable.
- Provide a clean dashboard for inspecting processed resumes.

### Non-goals for the current phase

- Full ATS replacement
- Automated hiring decisions
- Candidate scoring for employment decisions
- Public candidate profiles
- Production-grade multi-tenant authorization
- Automatic interview scheduling

## 4. Target users

### Recruiter / hiring user

Needs to upload resumes, inspect extracted information, and search for candidates using natural-language queries.

### Developer / engineering team

Needs clear APIs, predictable data models, deployable services, and failure-tolerant AI integration.

## 5. Core user stories

### Resume ingestion

> As a user, I want to upload a PDF or DOCX resume so that the platform can extract and structure its information.

### Profile inspection

> As a user, I want to open a processed resume and see the candidate name, summary, skills, categories, confidence, and evidence.

### Semantic search

> As a user, I want to search for a candidate profile using concepts such as "Python backend engineer with ML experience" without needing exact keyword matches.

### Graceful degradation

> As a user, I want the upload pipeline to remain usable even when AI enrichment is temporarily unavailable.

## 6. Functional requirements

### FR-1: File upload

- Accept PDF and DOCX.
- Reject unsupported MIME types.
- Enforce a configurable upload-size limit.
- Normalize the filename before persistence.

### FR-2: Text extraction

- Extract machine-readable text from supported documents.
- Reject documents with no readable text.
- Return extraction metadata such as page count and method.

### FR-3: Candidate analysis

The AI layer should return:

- Name
- Headline
- Summary
- Years of experience
- Skills
- Skill category
- Skill confidence
- Evidence for each skill

### FR-4: Skill categorization

Skills should be grouped consistently into:

- Language
- Framework
- Library
- Database
- Tool
- Cloud / DevOps
- AI / ML
- Core skill
- Other

### FR-5: Semantic search

- Embed the user query.
- Compare the query vector with stored resume vectors.
- Return the closest processed profiles.
- Expose a similarity value to the frontend.

### FR-6: Reliability

- Use local extraction fallback when OpenAI is unavailable.
- Skip embeddings when embedding generation is unavailable.
- Avoid exposing provider keys to the browser.

## 7. Non-functional requirements

### Performance

- Keep file validation before expensive AI work.
- Avoid unnecessarily repeated AI calls.
- Prefer asynchronous processing for expensive workloads as the system scales.

### Security

- Secrets must remain server-side.
- Uploaded files must be validated.
- APIs must eventually enforce authenticated ownership for resume data.
- Resume content should be treated as sensitive personal data.

### Maintainability

- Separate API routes, schemas, models, and services.
- Keep business logic out of UI components when possible.
- Use migrations for schema changes.

## 8. Success criteria

A successful implementation should let a user:

1. Upload a supported resume.
2. Receive structured candidate data.
3. Inspect evidence-backed skills.
4. Search semantically across processed resumes.
5. Continue using core resume extraction when AI quota is unavailable.

## 9. Current limitations

The current prototype has no authentication/authorization layer. Resume list/detail/search endpoints therefore do not yet enforce per-user ownership. This is the highest-priority production-hardening item.

## 10. Future roadmap

- Authentication and ownership isolation
- Role-based access control
- Background job processing
- Per-user rate limits and AI budgets
- Search filters by skills, experience, and other profile attributes
- Observability and cost dashboards
- Audit logs
