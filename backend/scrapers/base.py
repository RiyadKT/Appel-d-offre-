from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class RawTender:
    """Représentation brute d'un AO avant normalisation."""
    external_id: str
    source: str
    title: str
    description: Optional[str] = None
    buyer: Optional[str] = None
    location: Optional[str] = None
    cpv_codes: list[str] = field(default_factory=list)
    estimated_value: Optional[float] = None
    deadline: Optional[datetime] = None
    published_at: Optional[datetime] = None
    url: Optional[str] = None
    raw_data: dict = field(default_factory=dict)


class BaseScraper(ABC):
    """Interface commune pour tous les scrapers."""

    source_name: str = ""

    @abstractmethod
    async def fetch(self, **kwargs) -> list[RawTender]:
        """Récupère les AO depuis la source et retourne une liste de RawTender."""
        ...

    def log(self, msg: str):
        print(f"[{self.source_name}] {msg}")
