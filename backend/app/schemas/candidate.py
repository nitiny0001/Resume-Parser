from typing import Literal

from pydantic import BaseModel, Field


SkillCategory = Literal[
    "language",
    "framework",
    "library",
    "database",
    "tool",
    "cloud_devops",
    "ai_ml",
    "core_skill",
    "other",
]


class Evidence(BaseModel):
    source: str
    text: str
    confidence: float = Field(ge=0, le=1)


class Skill(BaseModel):
    name: str
    category: SkillCategory = "other"
    confidence: float = Field(ge=0, le=1)
    evidence: list[Evidence] = Field(default_factory=list)


class CandidateProfile(BaseModel):
    name: str | None = None
    headline: str | None = None
    summary: str | None = None
    skills: list[Skill] = Field(default_factory=list)
    years_of_experience: float | None = Field(default=None, ge=0)
