from arq import cron
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


async def cleanup_expired_resumes(ctx):
    from datetime import datetime, timezone

    from sqlalchemy import delete

    from app.core.database import SessionLocal
    from app.models.resume import Resume

    async with SessionLocal() as db:
        result = await db.execute(
            delete(Resume).where(Resume.expires_at <= datetime.now(timezone.utc))
        )
        await db.commit()
        return {"deleted": result.rowcount or 0}


class WorkerSettings:
    functions = [process_resume]
    cron_jobs = [
        cron(
            cleanup_expired_resumes,
            hour=3,
            minute=15,
            name="cleanup_expired_resumes",
            unique=True,
        )
    ]
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
