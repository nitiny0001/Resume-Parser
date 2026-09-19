# Architecture

## 1. System overview

The Resume Intelligence Platform is a web application with a Next.js frontend, FastAPI backend, PostgreSQL/pgvector storage, Redis/ARQ infrastructure, and OpenAI-powered enrichment.

~~~mermaid
flowchart TB
    Browser --> Frontend[Next.js / React]
    Frontend --> API[FastAPI]
    API --> Extract[Document Extraction]
    API --> LLM[OpenAI Structured Analysis]
    API --> Embed[OpenAI Embeddings]
    API --> DB[(PostgreSQL + pgvector)]
    API --> Redis[(Redis)]
    Worker[ARQ Worker] --> Redis
    Worker --> DB
~~~

## 2. Deployment architecture

~~~mermaid
flowchart LR
    GitHub --> Vercel[Vercel]
    GitHub --> Railway[Railway]
    Vercel --> Browser[Users]
    Railway --> API[FastAPI]
    Railway --> PG[(PostgreSQL)]
    Railway --> REDIS[(Redis)]
    Railway --> WORKER[ARQ Worker]
~~~

### Vercel

Hosts the Next.js frontend and handles frontend build/deployment.

### Railway

Hosts:

- FastAPI API
- PostgreSQL
- Redis
- ARQ worker

### GitHub

Provides source control and CI through GitHub Actions.

## 3. Frontend architecture

The frontend uses the Next.js App Router.

Responsibilities:

- Page routing
- Resume upload UI
- Dashboard rendering
- Resume detail rendering
- Search UI
- Client-side presentation/state

API calls use the application's /api/* path so the frontend can proxy requests to the backend deployment.

## 4. Backend architecture

FastAPI routes are organized by responsibility:

~~~text
app/
├── api/routes/
│   ├── analyze.py
│   ├── health.py
│   ├── resumes.py
│   └── search.py
├── models/
├── schemas/
├── services/
└── core/
~~~

### Route layer

Responsible for:

- HTTP validation
- dependency injection
- status codes
- response shaping

### Service layer

Responsible for:

- document text extraction
- AI analysis
- embeddings

### Model layer

Responsible for persistence through SQLAlchemy.

### Schema layer

Responsible for typed request/response/domain structures with Pydantic.

## 5. Data model

The current primary entity is the Resume model.

Conceptually:

~~~text
Resume
├── id
├── filename
├── content_type
├── extracted_text
├── profile (JSONB)
├── embedding (1536-d vector)
├── status
└── created_at
~~~

The structured profile contains:

~~~text
CandidateProfile
├── name
├── headline
├── summary
├── years_of_experience
└── skills[]
    ├── name
    ├── category
    ├── confidence
    └── evidence[]
~~~

## 6. Ingestion flow

~~~mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as FastAPI
    participant X as Extractor
    participant O as OpenAI
    participant D as PostgreSQL

    U->>F: Upload PDF/DOCX
    F->>A: POST /api/resumes/upload
    A->>A: Validate type and size
    A->>X: Extract text
    X-->>A: Text + metadata
    A->>D: Create processing record
    A->>O: Structured candidate analysis
    O-->>A: CandidateProfile
    A->>O: Generate embedding
    O-->>A: Vector
    A->>D: Save profile + vector
    A-->>F: Processed resume
~~~

## 7. Search flow

~~~mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as FastAPI
    participant O as OpenAI
    participant D as PostgreSQL

    U->>F: Enter natural-language query
    F->>A: POST /api/search/candidates
    A->>O: Embed query
    O-->>A: Query vector
    A->>D: Cosine-distance search
    D-->>A: Closest resumes
    A-->>F: Ranked candidate results
~~~

## 8. AI boundary

The LLM receives extracted resume text and returns only schema-conforming data.

The backend is responsible for:

- limiting input length
- defining the JSON schema
- validating the model response
- preserving evidence
- handling provider failures

The client never talks directly to OpenAI.

## 9. Reliability boundary

OpenAI is an external dependency, so the system treats it as fallible.

~~~text
OpenAI available
    → structured analysis
    → embeddings
    → semantic search

OpenAI unavailable
    → local skill fallback
    → resume upload can still complete
    → embeddings may be absent
~~~

## 10. Scalability direction

The repository already contains Redis + ARQ worker infrastructure.

The intended next architecture is:

~~~text
Upload API
   ↓
Persist "processing" record
   ↓
Redis queue
   ↓
ARQ worker
   ↓
Extraction → AI → embedding → persistence
   ↓
Status = processed
~~~

This moves expensive work out of the request/response path and allows worker concurrency to scale independently.

## 11. Current architectural constraint

The current implementation does not yet include an authentication/authorization boundary. As a result, the data-access layer is not tenant-scoped.

The target architecture is:

~~~text
Authenticated user
      ↓
Verified identity
      ↓
user_id / tenant_id
      ↓
Every resume read/write/search query scoped by owner
~~~

This must be implemented before treating the system as a secure multi-user production application.
