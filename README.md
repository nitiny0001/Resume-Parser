# Resume Intelligence Platform

An AI-powered resume intelligence platform that converts PDF/DOCX resumes into structured candidate profiles, evidence-backed skills, and semantic search results.

> **Project status:** Working prototype / portfolio project. Authentication and per-user authorization are still on the roadmap; the current deployment should not be treated as a private multi-user production system.

## What it does

- Uploads PDF and DOCX resumes
- Extracts resume text locally
- Converts unstructured resume content into a structured candidate profile
- Extracts skills with confidence and resume evidence
- Groups skills into technical domains such as languages, frameworks, databases, cloud/devops, AI/ML, and core skills
- Generates embeddings for semantic candidate search
- Persists structured data and vectors in PostgreSQL + pgvector
- Falls back to local skill extraction when OpenAI enrichment or quota is unavailable
- Provides a Next.js dashboard for upload, review, and search

## Architecture

~~~mermaid
flowchart LR
    U[Browser] --> V[Vercel / Next.js]
    V --> A[FastAPI API]
    A --> T[PDF/DOCX Text Extraction]
    A --> L[OpenAI Structured Analysis]
    A --> E[OpenAI Embeddings]
    A --> P[(PostgreSQL + pgvector)]
    A --> R[(Redis)]
    W[ARQ Worker] --> R
    W --> P
~~~

The current upload endpoint performs extraction, AI analysis, and embedding inline. Redis + ARQ are included as the background-processing foundation for scaling longer-running workloads.

## Main stack

| Technology | Purpose |
|---|---|
| Next.js + React + TypeScript | Frontend dashboard and interactive resume UI |
| FastAPI + Python | REST API and backend application logic |
| PostgreSQL | Persistent storage for resumes and structured profiles |
| pgvector | Vector storage and semantic similarity search |
| OpenAI API | Structured resume intelligence and embeddings |
| PyMuPDF + python-docx | PDF/DOCX text extraction |
| Redis + ARQ | Queue/background-processing infrastructure |
| Docker | Reproducible local and deployment environments |
| Vercel | Frontend hosting and deployment |
| Railway | Backend, database, Redis, and worker hosting |

## Project structure

~~~text
.
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI routes
│   │   ├── core/             # Configuration and database setup
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic API/domain schemas
│   │   └── services/         # Extraction, AI, embeddings, etc.
│   ├── alembic/              # Database migrations
│   ├── Dockerfile
│   └── worker.Dockerfile
├── frontend/
│   ├── app/                  # Next.js App Router pages
│   └── ...
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   ├── RULES.md
│   └── SECURITY.md
├── docker-compose.yml
└── .github/workflows/ci.yml
~~~

## Core workflow

~~~text
Upload resume
    ↓
Validate file type + size
    ↓
Extract text
    ↓
Analyze with structured AI output
    ↓
Attach evidence-backed skills
    ↓
Generate embedding
    ↓
Store profile + vector in PostgreSQL
    ↓
Display profile in dashboard
    ↓
Use query embeddings for semantic search
~~~

When OpenAI quota is unavailable, the application falls back to local rule-based skill extraction and skips embeddings instead of failing the entire upload pipeline.

## Local development

### Prerequisites

- Docker + Docker Compose
- Node.js 22+
- Python 3.12+
- OpenAI API key for full AI functionality

### Full stack

Create backend/.env from backend/.env.example, then:

~~~bash
docker compose up --build
~~~

Open:

- Frontend: http://localhost:3000
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

### Frontend only

~~~bash
cd frontend
npm install
npm run dev
~~~

### Backend only

~~~bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
~~~

## Environment variables

The backend expects values such as:

~~~env
DATABASE_URL=
REDIS_URL=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-luna
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
CORS_ORIGINS=
MAX_UPLOAD_SIZE_MB=10
~~~

Never commit API keys, database passwords, or other secrets.

## API surface

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/resumes/upload | Upload and process a resume |
| GET | /api/resumes | List stored resumes |
| GET | /api/resumes/{id} | Retrieve a resume and extracted profile |
| POST | /api/analysis/resume | Analyze raw resume text |
| POST | /api/search/candidates | Semantic candidate search |
| GET | /health | Liveness |
| GET | /ready | Readiness |

## Reliability

The backend is designed to degrade gracefully around AI quota failures:

- Missing OpenAI key → local extraction fallback
- OpenAI 429 quota response → local extraction fallback
- Embedding quota failure → embedding is skipped
- Invalid or unsupported file → request rejected with a validation error
- Oversized upload → request rejected before processing

## CI

GitHub Actions currently validates:

- Backend tests
- Frontend linting
- Frontend production build
- Backend/worker/frontend Docker builds

## Deployment

- **Vercel:** Next.js frontend
- **Railway:** FastAPI API, PostgreSQL, Redis, and worker services
- **GitHub:** source control and CI

## Documentation

- [Product Requirements](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [System Design](docs/DESIGN.md)
- [Engineering Rules](docs/RULES.md)
- [Security](docs/SECURITY.md)

## Roadmap

1. Add authentication and strict per-user authorization
2. Associate every resume with an authenticated owner
3. Move heavy analysis to the ARQ worker path
4. Add rate limiting and per-user AI quotas
5. Add richer candidate ranking and filtering
6. Add observability, tracing, and cost monitoring
7. Expand test coverage for extraction, search, and authorization

## Why this project exists

The project is designed as a realistic backend-heavy AI application rather than a simple LLM wrapper. It combines document processing, structured generation, vector search, asynchronous infrastructure, relational storage, and cloud deployment into one end-to-end system.
