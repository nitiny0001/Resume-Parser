# Engineering Rules

These rules keep the project predictable, maintainable, and safe to extend.

## 1. Architecture rules

1. Keep HTTP concerns inside route modules.
2. Keep business logic inside services.
3. Keep database persistence inside models/repositories rather than duplicating SQL across routes.
4. Keep request/response contracts in Pydantic schemas.
5. Do not make the frontend call OpenAI directly.

## 2. AI rules

1. Never invent resume facts.
2. Prefer evidence-backed extraction.
3. Use strict structured output for machine-readable results.
4. Validate model output with Pydantic.
5. Cap user-provided text before sending it to external AI services.
6. Treat OpenAI as an unreliable external dependency.
7. Preserve a deterministic fallback for important ingestion paths.

## 3. Data rules

1. Never commit secrets.
2. Use Alembic migrations for schema changes.
3. Store structured candidate data in JSONB only where schema flexibility is useful.
4. Keep embeddings at the configured dimension.
5. Do not expose raw extracted resume text unless the caller is authorized to view it.
6. Once authentication is added, every resume query must include an owner/tenant scope.

## 4. API rules

1. Validate request input at the API boundary.
2. Use appropriate HTTP status codes.
3. Return machine-readable error messages.
4. Reject unsupported file types explicitly.
5. Enforce upload limits before expensive work.
6. Avoid leaking stack traces or secrets in API responses.

## 5. Frontend rules

1. Keep UI components focused on presentation and interaction.
2. Do not place server secrets in NEXT_PUBLIC_* variables.
3. Keep API access consistent through the application's API boundary.
4. Do not duplicate backend business rules in multiple components unless a UI-only fallback is required.
5. Keep skill categorization labels consistent with backend vocabulary.

## 6. Security rules

1. Authentication must be enforced on protected routes.
2. Authorization must be checked on the server, not only in the UI.
3. Never trust a user-supplied owner ID.
4. Use verified identity claims to derive ownership.
5. Treat uploaded resumes as sensitive personal data.
6. Apply least-privilege credentials in deployment environments.
7. Rotate compromised secrets immediately.

## 7. Git rules

1. Use descriptive commit messages.
2. Keep changes focused by concern.
3. Run CI before merging meaningful changes.
4. Avoid committing generated secrets, local databases, and large build artifacts.
5. Prefer pull requests for cross-cutting changes.

## 8. Testing rules

Backend:

- test API validation
- test text extraction
- test AI fallback behavior
- test search behavior
- test authorization once identity is introduced

Frontend:

- run lint
- run production build
- add UI tests for critical upload/search flows as the app grows

## 9. Documentation rules

When behavior changes:

1. Update the relevant docs.
2. Update API examples if the contract changed.
3. Document new environment variables.
4. Record security implications for changes touching user data.

## 10. Production gate

The application must not be presented as a secure multi-user production system until:

- authentication exists
- every resume has an owner
- list/detail/search queries are owner-scoped
- authorization is enforced server-side
- rate limiting exists
- secrets and environment configuration are verified
