from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, DateTime, Text, JSON, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from database.connection import Base


class TenderStatus(str, enum.Enum):
    new = "new"
    reviewed = "reviewed"
    shortlisted = "shortlisted"
    responding = "responding"
    submitted = "submitted"
    won = "won"
    lost = "lost"
    ignored = "ignored"


class Tender(Base):
    __tablename__ = "tenders"

    id: Mapped[int] = mapped_column(primary_key=True)
    external_id: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    source: Mapped[str] = mapped_column(String(50))          # boamp, place, ted...
    title: Mapped[str] = mapped_column(Text)
    description: Mapped[Optional[str]] = mapped_column(Text)
    buyer: Mapped[Optional[str]] = mapped_column(String(500))
    location: Mapped[Optional[str]] = mapped_column(String(200))
    cpv_codes: Mapped[Optional[list]] = mapped_column(JSON)   # codes CPV
    estimated_value: Mapped[Optional[float]] = mapped_column(Float)
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    url: Mapped[Optional[str]] = mapped_column(Text)
    raw_data: Mapped[Optional[dict]] = mapped_column(JSON)

    # Matching
    match_score: Mapped[Optional[float]] = mapped_column(Float)
    match_details: Mapped[Optional[dict]] = mapped_column(JSON)

    # Workflow
    status: Mapped[TenderStatus] = mapped_column(
        SAEnum(TenderStatus), default=TenderStatus.new
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    response: Mapped[Optional["TenderResponse"]] = relationship(back_populates="tender")


class TenderResponse(Base):
    __tablename__ = "tender_responses"

    id: Mapped[int] = mapped_column(primary_key=True)
    tender_id: Mapped[int] = mapped_column(ForeignKey("tenders.id"))
    tender: Mapped["Tender"] = relationship(back_populates="response")

    # Documents générés
    technical_memo: Mapped[Optional[str]] = mapped_column(Text)
    financial_memo: Mapped[Optional[str]] = mapped_column(Text)
    admin_docs: Mapped[Optional[dict]] = mapped_column(JSON)   # DC1, DC2, K-bis...
    calendar: Mapped[Optional[dict]] = mapped_column(JSON)

    # État
    is_complete: Mapped[bool] = mapped_column(default=False)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class CompanyProfile(Base):
    __tablename__ = "company_profile"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    siret: Mapped[Optional[str]] = mapped_column(String(14))
    size: Mapped[Optional[str]] = mapped_column(String(20))    # TPE, PME, ETI, GE
    revenue_range: Mapped[Optional[str]] = mapped_column(String(50))  # ex: "1M-5M"
    regions: Mapped[Optional[list]] = mapped_column(JSON)      # ["IDF", "PACA"]
    sectors: Mapped[Optional[list]] = mapped_column(JSON)      # codes CPV cibles
    keywords: Mapped[Optional[list]] = mapped_column(JSON)     # mots-clés métier
    certifications: Mapped[Optional[list]] = mapped_column(JSON)  # Qualibat, ISO...
    max_tender_value: Mapped[Optional[float]] = mapped_column(Float)
    min_tender_value: Mapped[Optional[float]] = mapped_column(Float)
    references: Mapped[Optional[list]] = mapped_column(JSON)   # références passées
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
