from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.schemas.candidate import CandidateProfile
from app.services.llm_service import analyze_resume

router = APIRouter(prefix="/analysis", tags=["Analysis"])


class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=20, max_length=60000)


@router.post("/resume", response_model=CandidateProfile)
async def analyze(request: AnalyzeRequest):
    return await analyze_resume(request.text)
