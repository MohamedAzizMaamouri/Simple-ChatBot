from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "AI Chat App"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    MYSQL_USER: str
    MYSQL_PASSWORD: str
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int
    MYSQL_DATABASE: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # LLM
    GEMINI_API_KEY: str

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"


settings = Settings()