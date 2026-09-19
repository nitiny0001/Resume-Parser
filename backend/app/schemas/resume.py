from uuid import UUID

from pydantic import BaseModel, Field


class ExtractedText(BaseModel):
    text: str
    page_count: int = Field(ge=0)
    character_count: int = Field(ge=0)
    extraction_method: str


class UploadResponse(BaseModel):
    id: UUID
    filename: str
    size: int
    content_type: str
    status: str
    extracted: ExtractedText | None = None
