from arq import create_pool
from arq.connections import RedisSettings

from app.core.config import settings


async def process_resume(ctx, resume_id: str):
    from uuid import UUID

    from sqlalchemy import select

    from app.core.database import SessionLocal
    from app.models.resume import Resume
    from app.services.embeddings import embed_text
    from app.services.llm_service import analyze_resume

    async with SessionLocal() as db:
        result = await db.execute(select(Resume).where(Resume.id == UUID(resume_id)))
        resume = result.scalar_one_or_none()
        if not resume or not resume.extracted_text:
            return

        resume.status = "processing"
        await db.commit()
        try:
            profile = await analyze_resume(resume.extracted_text)
            resume.profile = profile.model_dump()
            vector = await embed_text(resume.extracted_text)
            resume.embedding = vector or None
            resume.status = "processed"
        except Exception:
            resume.status = "failed"
            raise
        finally:
            await db.commit()


class WorkerSettings:
    functions = [process_resume]
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
