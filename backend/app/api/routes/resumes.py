import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.resume import Resume
from app.schemas.resume import UploadResponse
from app.services.text_extractor import extract_text

router = APIRouter(prefix="/resumes", tags=["Resumes"])

ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/upload", response_model=UploadResponse)
async def upload_resume(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File must be smaller than 10MB.")

    try:
        text, page_count, extraction_method = extract_text(contents, file.content_type)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not extract resume text: {exc}") from exc

    resume = Resume(
        id=uuid.uuid4(),
        filename=file.filename or "resume",
        content_type=file.content_type,
        extracted_text=text,
        status="extracted",
    )
    db.add(resume)
    await db.commit()

    return UploadResponse(
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
