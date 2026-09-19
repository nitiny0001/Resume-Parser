import json
import os
import re

from app.core.config import settings
from app.schemas.candidate import CandidateProfile


SYSTEM_PROMPT = """You extract structured candidate information from resumes.
Never invent facts.
Every skill must include evidence copied verbatim from the resume.
Confidence values must be between 0 and 1.
Return only the requested structured data."""

RESPONSE_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "name": {"type": ["string", "null"]},
        "headline": {"type": ["string", "null"]},
        "summary": {"type": ["string", "null"]},
        "skills": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "name": {"type": "string"},
                    "confidence": {"type": "number", "minimum": 0, "maximum": 1},
                    "evidence": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "additionalProperties": False,
                            "properties": {
                                "source": {"type": "string"},
                                "text": {"type": "string"},
                                "confidence": {"type": "number", "minimum": 0, "maximum": 1},
                            },
                            "required": ["source", "text", "confidence"],
                        },
                    },
                },
                "required": ["name", "confidence", "evidence"],
            },
        },
        "years_of_experience": {"type": ["number", "null"], "minimum": 0},
    },
    "required": [
        "name",
        "headline",
        "summary",
        "skills",
        "years_of_experience",
    ],
}


async def analyze_resume(text: str) -> CandidateProfile:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return _local_fallback(text)

    from openai import AsyncOpenAI, RateLimitError

    client = AsyncOpenAI(api_key=api_key)
    try:
        response = await client.responses.create(
            model=settings.openai_model,
            input=[
                {
                    "role": "system",
                    "content": [{"type": "input_text", "text": SYSTEM_PROMPT}],
                },
                {
                    "role": "user",
                    "content": [{"type": "input_text", "text": text[:60000]}],
                },
            ],
            text={
                "format": {
                    "type": "json_schema",
                    "name": "candidate_profile",
                    "strict": True,
                    "schema": RESPONSE_SCHEMA,
                }
            },
        )
    except RateLimitError as exc:
        if getattr(exc, "status_code", None) == 429:
            return _local_fallback(text)
        raise

    return CandidateProfile.model_validate(json.loads(response.output_text))


def _local_fallback(text: str) -> CandidateProfile:
    known_skills = [
        "Python", "JavaScript", "TypeScript", "React", "Next.js", "FastAPI",
        "Django", "Node.js", "PostgreSQL", "MongoDB", "Redis", "Docker",
        "AWS", "Git", "GitHub", "SQL", "Java", "C++", "Machine Learning",
    ]
    skills = []

    for skill in known_skills:
        match = re.search(r"(?<!\w)" + re.escape(skill) + r"(?!\w)", text, flags=re.IGNORECASE)
        if not match:
            continue

        start = match.start()
        evidence = text[max(0, start - 80): match.end() + 160].strip()
        skills.append(
            {
                "name": skill,
                "confidence": 0.7,
                "evidence": [
                    {
                        "source": "resume_text",
                        "text": evidence,
                        "confidence": 0.7,
                    }
                ],
            }
        )

    first_line = next((line.strip() for line in text.splitlines() if line.strip()), None)
    return CandidateProfile(
        name=first_line,
        summary="AI enrichment unavailable; extracted locally from the resume text.",
        skills=skills,
    )
