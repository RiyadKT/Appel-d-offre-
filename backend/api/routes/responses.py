from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import tempfile, os

from database.connection import get_db
from database.models import Tender, TenderResponse, CompanyProfile
from ai.analyzer import analyze_dce
from ai.generator import generate_technical_memo, generate_admin_docs, generate_calendar

router = APIRouter()


@router.post("/{tender_id}/analyze-dce")
async def analyze_dce_endpoint(
    tender_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload le DCE (PDF/Word) et déclenche l'analyse Claude."""
    tender_result = await db.execute(select(Tender).where(Tender.id == tender_id))
    tender = tender_result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=404, detail="AO introuvable")

    profile_result = await db.execute(select(CompanyProfile).limit(1))
    profile = profile_result.scalar_one_or_none()
    profile_dict = {c.name: getattr(profile, c.name) for c in profile.__table__.columns} if profile else {}

    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        analysis = analyze_dce(tmp_path, profile_dict)
    finally:
        os.unlink(tmp_path)

    return {"tender_id": tender_id, "analysis": analysis}


@router.post("/{tender_id}/generate")
async def generate_response(
    tender_id: int,
    dce_analysis: dict,
    db: AsyncSession = Depends(get_db),
):
    """Génère tous les documents de réponse à partir de l'analyse DCE."""
    tender_result = await db.execute(select(Tender).where(Tender.id == tender_id))
    tender = tender_result.scalar_one_or_none()
    if not tender:
        raise HTTPException(status_code=404, detail="AO introuvable")

    profile_result = await db.execute(select(CompanyProfile).limit(1))
    profile = profile_result.scalar_one_or_none()
    profile_dict = {c.name: getattr(profile, c.name) for c in profile.__table__.columns} if profile else {}
    references = profile_dict.get("references") or []

    technical_memo = generate_technical_memo(dce_analysis, profile_dict, references)
    admin_docs = generate_admin_docs(profile_dict)
    calendar = generate_calendar(dce_analysis, profile_dict)

    # Sauvegarde en BDD
    resp_result = await db.execute(
        select(TenderResponse).where(TenderResponse.tender_id == tender_id)
    )
    response = resp_result.scalar_one_or_none()
    if not response:
        response = TenderResponse(tender_id=tender_id)
        db.add(response)

    response.technical_memo = technical_memo
    response.admin_docs = admin_docs
    response.calendar = calendar
    await db.commit()

    return {
        "tender_id": tender_id,
        "technical_memo": technical_memo,
        "admin_docs": admin_docs,
        "calendar": calendar,
    }
