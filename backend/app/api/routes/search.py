from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.resume import Resume
from app.services.embeddings import embed_text

router = APIRouter(prefix="/search", tags=["Search"])


class SearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=500)


@router.post("/candidates")
async def search_candidates(request: SearchRequest, db: AsyncSession = Depends(get_db)):
    vector = await embed_text(request.query)
    if not vector:
        return {"query": request.query, "results": [], "status": "embedding-not-configured"}

    distance = Resume.embedding.cosine_distance(vector)
    statement = (
        select(Resume)
        .where(Resume.embedding.is_not(None), Resume.status == "processed")
        .order_by(distance)
        .limit(20)
    )
    rows = (await db.execute(statement)).scalars().all()

    return {
        "query": request.query,
        "results": [
            {
                "id": str(row.id),
                "filename": row.filename,
                "profile": row.profile or {},
                "similarity": round(max(0.0, 1.0 - float(distance_value)), 4),
            }
            for row, distance_value in (
                (row, await db.scalar(select(Resume.embedding.cosine_distance(vector)).where(Resume.id == row.id)))
                for row in rows
            )
        ],
        "status": "ok",
    }
