import asyncio

from app.services.llm_service import analyze_resume


def test_analyze_resume_local_fallback(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    profile = asyncio.run(
        analyze_resume(
            "Nitin Kumar\nBackend Engineer\nBuilt Python FastAPI services with PostgreSQL and Docker."
        )
    )

    assert profile.name == "Nitin Kumar"
    skill_names = {skill.name for skill in profile.skills}
    assert {"Python", "FastAPI", "PostgreSQL", "Docker"}.issubset(skill_names)
