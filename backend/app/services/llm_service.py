import json
import os
import re

from app.core.config import settings
from app.schemas.candidate import CandidateProfile


SYSTEM_PROMPT = """You extract a structured candidate profile from a resume.
Never invent facts. Only use information supported by the resume.
Every skill must include evidence copied verbatim from the resume.
Return at most 35 distinct skills and avoid duplicates/synonyms.

Classify every skill into exactly one category:
- language: programming/query languages such as Python, C, JavaScript, TypeScript, SQL
- framework: application/UI frameworks such as React, Next.js, FastAPI, Flask, Django, Tailwind CSS
- library: libraries such as NumPy, Pandas, Matplotlib, scikit-learn
- database: data stores such as PostgreSQL, MySQL, MongoDB, Redis
- tool: developer tools such as Git, GitHub, Postman
- cloud_devops: cloud/platform/container/CI/CD technologies such as AWS, Docker, Kubernetes
- ai_ml: AI/ML techniques, models and domains such as Machine Learning, Generative AI, NLP
- core_skill: resume-relevant technical capabilities such as Data Preprocessing, Feature Engineering, Predictive Analytics, Linear Regression, Resume Parsing, Skill-Gap Analysis
- other: only when none of the above fits

Prefer specific technical technologies over generic words like "programming" or "web development".
Keep category assignment consistent and do not place the same skill in multiple categories."""


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
                    "category": {
                        "type": "string",
                        "enum": [
                            "language",
                            "framework",
                            "library",
                            "database",
                            "tool",
                            "cloud_devops",
                            "ai_ml",
                            "core_skill",
                            "other",
                        ],
                    },
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
                "required": ["name", "category", "confidence", "evidence"],
            },
        },
        "years_of_experience": {"type": ["number", "null"], "minimum": 0},
    },
    "required": ["name", "headline", "summary", "skills", "years_of_experience"],
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


def _categorize_skill(name: str) -> str:
    normalized = name.lower().strip()
    categories = {
        "language": {"python", "c", "c++", "java", "javascript", "typescript", "sql"},
        "framework": {"react", "next.js", "nextjs", "fastapi", "flask", "django", "tailwind css"},
        "library": {"numpy", "pandas", "matplotlib", "scikit-learn"},
        "database": {"postgresql", "mysql", "mongodb", "redis"},
        "tool": {"git", "github", "postman"},
        "cloud_devops": {"aws", "docker", "kubernetes", "github actions", "ci/cd"},
        "ai_ml": {"machine learning", "generative ai", "artificial intelligence", "nlp", "deep learning"},
        "core_skill": {
            "data preprocessing", "feature engineering", "predictive analytics",
            "linear regression", "resume parsing", "skill-gap analysis",
        },
    }
    for category, names in categories.items():
        if normalized in names:
            return category
    return "other"


def _local_fallback(text: str) -> CandidateProfile:
    known_skills = [
        "Python", "C", "Java", "JavaScript", "TypeScript", "SQL", "React", "Next.js",
        "FastAPI", "Flask", "Django", "Tailwind CSS", "NumPy", "Pandas", "Matplotlib",
        "scikit-learn", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker", "AWS",
        "Git", "GitHub", "Postman", "Machine Learning", "Generative AI",
        "Data Preprocessing", "Feature Engineering", "Predictive Analytics",
        "Linear Regression", "Resume Parsing", "Skill-Gap Analysis",
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
                "category": _categorize_skill(skill),
                "confidence": 0.7,
                "evidence": [{
                    "source": "resume_text",
                    "text": evidence,
                    "confidence": 0.7,
                }],
            }
        )

    first_line = next((line.strip() for line in text.splitlines() if line.strip()), None)
    return CandidateProfile(
        name=first_line,
        summary="AI enrichment unavailable; extracted locally from the resume text.",
        skills=skills,
    )
