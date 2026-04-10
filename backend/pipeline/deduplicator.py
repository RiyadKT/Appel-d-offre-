"""
Détecte les doublons avant insertion en BDD.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import Tender
from scrapers.base import RawTender


async def filter_new(raws: list[RawTender], db: AsyncSession) -> list[RawTender]:
    """Retourne uniquement les AO dont l'external_id n'existe pas encore en BDD."""
    if not raws:
        return []

    ids = [r.external_id for r in raws]
    result = await db.execute(
        select(Tender.external_id).where(Tender.external_id.in_(ids))
    )
    existing = {row[0] for row in result.all()}
    return [r for r in raws if r.external_id not in existing]
