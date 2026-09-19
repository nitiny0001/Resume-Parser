# Resume Intelligence Platform

An AI-powered resume intelligence system that turns PDF/DOCX resumes into structured, evidence-backed candidate profiles and supports semantic candidate search.

## Stack

- Next.js 16 + TypeScript + Tailwind CSS
- FastAPI + Pydantic
- PostgreSQL + pgvector
- Redis + ARQ
- PyMuPDF + python-docx
- OpenAI Responses API with structured output
- Docker Compose + Alembic
- GitHub Actions CI

## Local development

### Full stack

Create `backend/.env` from `backend/.env.example`, then run:

```bash
docker compose up --build
```

Open http://localhost:3000. API docs: http://localhost:8000/docs.

### Frontend only

```bash
cd frontend
npm install
npm run dev
```

### Backend only

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Production configuration

Required backend environment variables:

- `DATABASE_URL`
- `REDIS_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_EMBEDDING_MODEL`
- `CORS_ORIGINS`

The API exposes `/health` for liveness and `/ready` for database/Redis readiness.

## Product flow

Upload resume -> extract text -> queue background processing -> structured AI analysis -> evidence validation -> embedding -> PostgreSQL/pgvector -> dashboard -> semantic candidate search.

## Deployment

The frontend is configured for a Vercel/Next.js deployment. The backend and ARQ worker are containerized and require a PostgreSQL/pgvector database, Redis, and the production environment variables above.

The active implementation branch is `feat/resume-intelligence-platform`.
