from pathlib import Path

from arq import create_pool
from arq.connections import RedisSettings
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.resume import Resume
from app.schemas.resume import UploadResponse
from app.services.text_extractor import extract_text

router = APIRouter(prefix="/resumes", tags=["Resumes"])
ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


@router.post("/upload", response_model=UploadResponse)
async def upload_resume(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    max_size = settings.max_upload_size_bytes
    contents = await file.read(max_size + 1)
    if len(contents) > max_size:
        raise HTTPException(
            status_code=413,
            detail=f"File must be smaller than {settings.max_upload_size_mb}MB.",
        )

    try:
        text, page_count, extraction_method = extract_text(contents, file.content_type)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not extract resume text: {exc}") from exc

    if not text.strip():
        raise HTTPException(status_code=422, detail="No readable text was found in the document.")

    resume = Resume(
        filename=Path(file.filename or "resume").name,
        content_type=file.content_type,
        extracted_text=text,
        status="queued",
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)

    try:
        redis = await create_pool(RedisSettings.from_dsn(settings.redis_url))
        await redis.enqueue_job("process_resume", str(resume.id))
        await redis.close()
    except Exception as exc:
        resume.status = "extracted"
        await db.commit()
        raise HTTPException(status_code=503, detail=f"Resume queue is unavailable: {exc}") from exc

    return UploadResponse(
        id=resume.id,
        filename=resume.filename,
        size=len(contents),
        content_type=file.content_type,
        status=resume.status,
        extracted={
            "text": text,
            "page_count": page_count,
            "character_count": len(text),
            "extraction_method": extraction_method,
        },
    )


@router.get("")
async def list_resumes(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Resume).order_by(Resume.created_at.desc()))).scalars().all()
    return [
        {
            "id": str(row.id),
            "filename": row.filename,
            "status": row.status,
            "profile": row.profile or {},
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
        for row in rows
    ]


@router.get("/{resume_id}")
async def get_resume(resume_id: str, db: AsyncSession = Depends(get_db)):
    from uuid import UUID

    try:
        parsed_id = UUID(resume_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid resume id.") from exc

    row = await db.get(Resume, parsed_id)
    if not row:
        raise HTTPException(status_code=404, detail="Resume not found.")

    return {
        "id": str(row.id),
        "filename": row.filename,
        "content_type": row.content_type,
        "status": row.status,
        "profile": row.profile or {},
        "extracted_text": row.extracted_text,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }
