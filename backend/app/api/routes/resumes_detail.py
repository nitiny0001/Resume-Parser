from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.resume import Resume

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.get("/{resume_id}")
async def get_resume(resume_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalar_one_or_none()
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return {
        "id": str(resume.id),
        "filename": resume.filename,
        "content_type": resume.content_type,
        "status": resume.status,
        "profile": resume.profile,
        "created_at": resume.created_at,
    }


@router.get("")
async def list_resumes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resume).order_by(Resume.created_at.desc()).limit(100))
    return [
        {
            "id": str(item.id),
            "filename": item.filename,
            "status": item.status,
            "created_at": item.created_at,
        }
        for item in result.scalars()
    ]
