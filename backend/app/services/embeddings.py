import os

from openai import AsyncOpenAI, RateLimitError

from app.core.config import settings


async def embed_text(text: str) -> list[float]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return []

    client = AsyncOpenAI(api_key=api_key)
    try:
        response = await client.embeddings.create(
            model=settings.openai_embedding_model,
            input=text[:8000],
        )
    except RateLimitError as exc:
        if getattr(exc, "status_code", None) == 429:
            return []
        raise

    return response.data[0].embedding
