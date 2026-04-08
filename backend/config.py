from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    llm_api_key: str
    database_url: str
    cors_origins: str = "http://localhost:3000"
    tz: str = "Asia/Shanghai"

    # Claude / LLM model
    claude_model: str = "qwen-plus"
    claude_max_tokens: int = 4096

    # Analysis settings
    max_signals_per_run: int = 100
    signal_window_days: int = 7
    signal_window_extended_days: int = 14
    min_signals_threshold: int = 20

    # Public site settings
    site_url: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
