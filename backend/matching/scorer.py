"""
Calcule le score de pertinence d'un AO par rapport au profil entreprise.

Score = 0.30 * secteur
      + 0.20 * montant
      + 0.20 * localisation
      + 0.15 * délai
      + 0.15 * certifications
"""
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional

from database.models import CompanyProfile, Tender


@dataclass
class MatchResult:
    score: float                      # 0.0 → 1.0
    details: dict                     # décomposition par critère
    recommendation: str               # "high", "medium", "low", "skip"


def score(tender: Tender, profile: CompanyProfile) -> MatchResult:
    details = {}

    # 1. Secteur (CPV)
    s_sector = _score_sector(tender.cpv_codes or [], profile.sectors or [])
    details["sector"] = round(s_sector, 2)

    # 2. Montant
    s_value = _score_value(
        tender.estimated_value,
        profile.min_tender_value,
        profile.max_tender_value,
    )
    details["value"] = round(s_value, 2)

    # 3. Localisation
    s_location = _score_location(tender.location, profile.regions or [])
    details["location"] = round(s_location, 2)

    # 4. Délai (au moins 2 semaines)
    s_deadline = _score_deadline(tender.deadline)
    details["deadline"] = round(s_deadline, 2)

    # 5. Certifications (vérif basique par mots-clés dans titre/description)
    s_certs = _score_certifications(
        tender.title, tender.description, profile.certifications or []
    )
    details["certifications"] = round(s_certs, 2)

    total = (
        0.30 * s_sector
        + 0.20 * s_value
        + 0.20 * s_location
        + 0.15 * s_deadline
        + 0.15 * s_certs
    )
    total = round(total, 3)

    if total >= 0.70:
        rec = "high"
    elif total >= 0.50:
        rec = "medium"
    elif total >= 0.30:
        rec = "low"
    else:
        rec = "skip"

    return MatchResult(score=total, details=details, recommendation=rec)


def _score_sector(cpv_tender: list[str], cpv_profile: list[str]) -> float:
    if not cpv_profile:
        return 0.5  # pas de filtre configuré → neutre
    if not cpv_tender:
        return 0.3  # on ne sait pas → pénalité légère

    for tp in cpv_tender:
        for pp in cpv_profile:
            if tp.startswith(pp) or pp.startswith(tp):
                return 1.0
    return 0.0


def _score_value(
    value: Optional[float],
    min_val: Optional[float],
    max_val: Optional[float],
) -> float:
    if value is None:
        return 0.5  # inconnu → neutre

    if min_val and value < min_val:
        return 0.1
    if max_val and value > max_val:
        # Tolérance : jusqu'à 2x le max → score partiel
        if value <= max_val * 2:
            return 0.4
        return 0.0
    return 1.0


def _score_location(location: Optional[str], regions: list[str]) -> float:
    if not regions:
        return 0.5
    if not location:
        return 0.3
    location_upper = location.upper()
    for region in regions:
        if region.upper() in location_upper:
            return 1.0
    return 0.2


def _score_deadline(deadline: Optional[datetime]) -> float:
    if not deadline:
        return 0.5
    remaining = (deadline - datetime.utcnow()).days
    if remaining >= 14:
        return 1.0
    if remaining >= 7:
        return 0.6
    if remaining >= 3:
        return 0.3
    return 0.0


def _score_certifications(
    title: str, description: Optional[str], certifications: list[str]
) -> float:
    if not certifications:
        return 0.8  # pas de filtre → on suppose OK
    text = f"{title} {description or ''}".lower()
    # Si une certif requise est mentionnée dans le texte, vérif qu'on l'a
    required = [c for c in certifications if c.lower() in text]
    if not required:
        return 0.8  # aucune certif mentionnée → OK
    # On a toutes les certifs requises
    return 1.0
