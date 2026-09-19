# System Design

## 1. Design principles

### Separation of concerns

Keep responsibilities split across:

- Routes for HTTP concerns
- Schemas for validation
- Models for persistence
- Services for business logic

### Structured AI

Never depend on free-form model prose when the application needs machine-readable data. Use a strict schema and validate the result.

### Evidence-backed extraction

A skill should not be presented as an unexplained AI claim. The profile should retain a text snippet from the resume that supports the extraction.

### Graceful degradation

AI features are treated as optional enrichment rather than the only way the system can function.

## 2. Resume processing design

### Step 1: Validate

The API verifies:

- MIME type
- upload size

### Step 2: Extract

Supported formats:

- PDF → PyMuPDF
- DOCX → python-docx

The result is normalized into plain text.

### Step 3: Analyze

The LLM receives the extracted text and returns:

~~~json
{
  "name": "Candidate",
  "headline": "Backend Engineer",
  "summary": "Experience building APIs and ML systems.",
  "years_of_experience": 2,
  "skills": [
    {
      "name": "Python",
      "category": "language",
      "confidence": 0.98,
      "evidence": [
        {
          "source": "resume_text",
          "text": "Built FastAPI services in Python...",
          "confidence": 0.96
        }
      ]
    }
  ]
}
~~~

### Step 4: Embed

Resume text is transformed into a dense vector with the configured embedding model.

The current database column uses 1536 dimensions.

### Step 5: Persist

The system stores:

- raw extracted text
- structured profile
- embedding
- processing status
- metadata

## 3. Skill categorization design

The application uses a fixed category vocabulary to keep the UI and search data consistent.

~~~text
language
framework
library
database
tool
cloud_devops
ai_ml
core_skill
other
~~~

The model is instructed to use one category per skill.

There is also a deterministic local categorization map used by the fallback path.

## 4. Semantic search design

The search endpoint:

1. validates the query
2. generates a query embedding
3. computes cosine distance against stored resume vectors
4. orders by distance
5. returns the closest processed resumes

Conceptually:

~~~text
query
  ↓
embedding(query)
  ↓
cosine distance
  ↓
top 20 resumes
~~~

This allows concept-level matching instead of exact string matching.

## 5. Failure handling

### OpenAI analysis fails

If the provider returns a quota/rate-limit condition, the backend uses the local skill extractor.

### Embedding generation fails

The resume can still be stored without a vector. Semantic search simply cannot return that particular resume until an embedding exists.

### Text extraction fails

The API returns a validation-style error because AI analysis cannot proceed without readable text.

### Invalid input

Unsupported file types and oversized files are rejected before expensive processing.

## 6. API design

The API uses resource-oriented endpoints:

~~~text
POST /api/resumes/upload
GET  /api/resumes
GET  /api/resumes/{id}

POST /api/analysis/resume

POST /api/search/candidates

GET /health
GET /ready
~~~

Pydantic schemas validate request bodies and structured AI output.

## 7. Frontend design

The dashboard prioritizes:

- clear upload interaction
- compact candidate summaries
- category-based skill organization
- expandable evidence
- semantic search results

The resume detail screen groups skills into technical domains instead of rendering one unstructured list.

## 8. Deployment design

### Frontend

Next.js → Vercel

### Backend

FastAPI → Railway

### Persistence

PostgreSQL + pgvector → Railway

### Queue infrastructure

Redis + ARQ → Railway

### External AI

FastAPI server → OpenAI API

## 9. Configuration design

Environment variables are used for deployment-specific values.

Examples:

- database URL
- Redis URL
- OpenAI key
- model names
- CORS origins
- upload limits

No secret is required in the frontend bundle.

## 10. Current vs target design

| Area | Current prototype | Target production design |
|---|---|---|
| Authentication | None | Supabase/Clerk-style identity provider |
| Authorization | None | Owner-scoped queries |
| Processing | Inline | Queue + worker |
| Search | Vector similarity | Vector + structured filters |
| Rate limiting | Not implemented | Per-user/IP limits |
| Observability | Basic health endpoints | Logs, metrics, traces |
| AI budget control | Provider quota | Per-user usage budgets |
| Auditability | Minimal | Audit events |

## 11. Engineering trade-offs

### Why PostgreSQL + pgvector?

It keeps structured candidate data and semantic vectors in one persistence system, reducing operational complexity for this project size.

### Why structured model output?

It makes the AI integration deterministic enough for downstream application code and UI rendering.

### Why local fallback?

It prevents a temporary AI quota/provider failure from turning resume ingestion into a total outage.

### Why keep Redis + ARQ?

It establishes a path to move expensive processing out of request handlers as resume volume grows.
