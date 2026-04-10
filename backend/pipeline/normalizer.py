"""
Normalise les RawTender en objets Tender prêts à être stockés en BDD.
"""
from datetime import datetime

from database.models import Tender, TenderStatus
from scrapers.base import RawTender


def normalize(raw: RawTender) -> dict:
    """Retourne un dict compatible avec le modèle Tender."""
    return {
        "external_id": raw.external_id,
        "source": raw.source,
        "title": raw.title[:1000] if raw.title else "",
        "description": raw.description,
        "buyer": raw.buyer,
        "location": _normalize_location(raw.location),
        "cpv_codes": raw.cpv_codes or [],
        "estimated_value": raw.estimated_value,
        "deadline": raw.deadline,
        "published_at": raw.published_at or datetime.utcnow(),
        "url": raw.url,
        "raw_data": raw.raw_data,
        "status": TenderStatus.new,
    }


def _normalize_location(loc: str | None) -> str | None:
    if not loc:
        return None
    loc = loc.strip()
    # Normalise les codes département → région
    dept_to_region = {
        "75": "IDF", "77": "IDF", "78": "IDF", "91": "IDF",
        "92": "IDF", "93": "IDF", "94": "IDF", "95": "IDF",
        "13": "PACA", "06": "PACA", "83": "PACA", "84": "PACA",
        "69": "AURA", "38": "AURA", "01": "AURA", "73": "AURA",
        # Ajouter selon besoins
    }
    for dept, region in dept_to_region.items():
        if loc.startswith(dept):
            return f"{loc} ({region})"
    return loc
