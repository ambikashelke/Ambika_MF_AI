"""
MindForge AI — Application Settings

Loads configuration from environment variables / .env file
using pydantic-settings.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application-wide settings sourced from the environment."""

    app_env: str = "development"
    app_debug: bool = True
    frontend_url: str = "http://localhost:8080"
    gemini_api_key: str = ""
    openai_api_key: str = ""
    ai_provider: str = "gemini"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
