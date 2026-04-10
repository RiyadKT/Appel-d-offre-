from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")

    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/appeldoffre"
    redis_url: str = "redis://localhost:6379"

    anthropic_api_key: str = ""
    openai_api_key: str = ""

    resend_api_key: str = ""
    slack_webhook_url: str = ""
    notification_email: str = ""

    secret_key: str = "changeme"
    environment: str = "development"


settings = Settings()
