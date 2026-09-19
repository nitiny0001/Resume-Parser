import json
import os

from app.schemas.candidate import CandidateProfile


SYSTEM_PROMPT = """You extract structured candidate information from resumes.
Return JSON matching the CandidateProfile schema.
Never invent facts. Every skill must include evidence copied from the resume.
Confidence must be between 0 and 1."""


async def analyze_resume(text: str) -> CandidateProfile:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return _local_fallback(text)

    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=api_key)
    response = await client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text[:60000]},
        ],
    )
    raw = response.choices[0].message.content or "{}"
    return CandidateProfile.model_validate(json.loads(raw))


def _local_fallback(text: str) -> CandidateProfile:
    known_skills = [
        "Python", "JavaScript", "TypeScript", "React", "Next.js", "FastAPI",
        "Django", "Node.js", "PostgreSQL", "MongoDB", "Redis", "Docker",
        "AWS", "Git", "GitHub", "SQL", "Java", "C++", "Machine Learning",
    ]
    skills = []
    lowered = text.lower()
    for skill in known_skills:
        if skill.lower() in lowered:
            start = lowered.find(skill.lower())
            evidence = text[max(0, start - 80): start + 160].strip()
            skills.append({
                "name": skill,
                "confidence": 0.7,
                "evidence": [{
                    "source": "resume_text",
                    "text": evidence,
                    "confidence": 0.7,
                }],
            })

    first_line = next((line.strip() for line in text.splitlines() if line.strip()), None)
    return CandidateProfile(name=first_line, skills=skills)
