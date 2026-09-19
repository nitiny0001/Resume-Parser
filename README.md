# Resume Intelligence Platform

An AI-powered resume intelligence system that turns PDF/DOCX resumes into structured, evidence-backed candidate profiles and supports semantic candidate search.

## Stack
- Next.js 16 + TypeScript + Tailwind CSS
- FastAPI + Pydantic
- PostgreSQL + pgvector
- Redis + ARQ
- PyMuPDF + python-docx
- Provider-agnostic LLM extraction
- Docker Compose

## Local development

### Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. API docs: http://localhost:8000/docs.

### Infrastructure
```bash
docker compose up -d postgres redis
```

## Product flow
Upload resume -> extract text -> analyze into structured data -> validate -> index -> dashboard/search.

The implementation is being built incrementally on the `feat/resume-intelligence-platform` branch.
