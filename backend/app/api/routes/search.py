from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/search", tags=["Search"])


class SearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=500)


@router.post("/candidates")
async def search_candidates(request: SearchRequest):
    return {
        "query": request.query,
        "results": [],
        "status": "semantic-indexing-not-configured",
    }
