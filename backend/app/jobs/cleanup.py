from datetime import datetime, timedelta, timezone

from sqlalchemy import delete
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.config import settings
from app.models.resume import Resume


async def cleanup_expired_resumes() -> int:
    engine = create_async_engine(settings.database_url)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    cutoff = datetime.now(timezone.utc) - timedelta(days=settings.resume_retention_days)

    async with session_factory() as db:
        result = await db.execute(delete(Resume).where(Resume.created_at <= cutoff))
        await db.commit()

    await engine.dispose()
    return result.rowcount or 0


if __name__ == "__main__":
    import asyncio

    deleted = asyncio.run(cleanup_expired_resumes())
    print(f"Deleted {deleted} expired resume(s).")
