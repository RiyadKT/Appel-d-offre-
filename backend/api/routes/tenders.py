from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional

from database.connection import get_db
from database.models import Tender, TenderStatus

router = APIRouter()


class TenderOut(BaseModel):
    id: int
    external_id: str
    source: str
    title: str
    buyer: Optional[str]
    location: Optional[str]
    estimated_value: Optional[float]
    deadline: Optional[str]
    match_score: Optional[float]
    status: str
    url: Optional[str]

    model_config = {"from_attributes": True}


class StatusUpdate(BaseModel):
    status: TenderStatus


@router.get("/", response_model=list[TenderOut])
async def list_tenders(
    status: Optional[str] = Query(None),
    min_score: float = Query(0.0),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    q = select(Tender).order_by(desc(Tender.match_score), desc(Tender.published_at))
    if status:
        q = q.where(Tender.status == status)
    if min_score > 0:
        q = q.where(Tender.match_score >= min_score)
    q = q.limit(limit).offset(offset)

    result = await db.execute(q)
    tenders = result.scalars().all()
    return [
        TenderOut(
            **{
                k: v for k, v in t.__dict__.items()
                if k not in ("_sa_instance_state", "deadline")
            },
            deadline=t.deadline.strftime("%Y-%m-%d") if t.deadline else None,
        )
        for t in tenders
    ]


@router.get("/{tender_id}")
async def get_tender(tender_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tender).where(Tender.id == tender_id))
    tender = result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=404, detail="AO introuvable")
    return tender


@router.patch("/{tender_id}/status")
async def update_status(
    tender_id: int, body: StatusUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Tender).where(Tender.id == tender_id))
    tender = result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=404, detail="AO introuvable")
    tender.status = body.status
    await db.commit()
    return {"ok": True}
