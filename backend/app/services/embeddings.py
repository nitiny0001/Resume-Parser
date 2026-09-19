import os

from openai import AsyncOpenAI


async def embed_text(text: str) -> list[float]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return []

    client = AsyncOpenAI(api_key=api_key)
    response = await client.embeddings.create(
        model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"),
        input=text[:8000],
    )
    return response.data[0].embedding
