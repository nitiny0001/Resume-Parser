from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Resume Intelligence Platform"
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/resume_intelligence"
    redis_url: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
