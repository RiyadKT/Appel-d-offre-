from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional

from database.connection import get_db
from database.models import CompanyProfile

router = APIRouter()


class ProfileIn(BaseModel):
    name: str
    siret: Optional[str] = None
    size: Optional[str] = None          # TPE, PME, ETI, GE
    revenue_range: Optional[str] = None  # "1M-5M"
    regions: Optional[list[str]] = None  # ["IDF", "PACA"]
    sectors: Optional[list[str]] = None  # codes CPV ["45", "45200000"]
    keywords: Optional[list[str]] = None
    certifications: Optional[list[str]] = None
    max_tender_value: Optional[float] = None
    min_tender_value: Optional[float] = None
    references: Optional[list[dict]] = None


@router.get("/")
async def get_profile(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CompanyProfile).limit(1))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil non configuré")
    return profile


@router.put("/")
async def upsert_profile(body: ProfileIn, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CompanyProfile).limit(1))
    profile = result.scalar_one_or_none()

    if not profile:
        profile = CompanyProfile()
        db.add(profile)

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile
