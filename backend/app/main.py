from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.api.routes.resumes import router as resume_router

app = FastAPI(
    title="Resume Intelligence Platform API",
    version="0.1.0",
    description="AI-powered resume parsing, intelligence, and semantic search API.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(resume_router, prefix="/api")


@app.get("/")
async def root():
    return {"name": "Resume Intelligence Platform", "status": "running"}
