"""
Extraction NLP légère : secteur, mots-clés BTP / IA-numérique, urgence.
Pour l'extraction avancée, voir ai/analyzer.py (Claude).
"""
import re
from dataclasses import dataclass

BTP_KEYWORDS = [
    "travaux", "construction", "rénovation", "réhabilitation", "maçonnerie",
    "charpente", "couverture", "plomberie", "électricité", "menuiserie",
    "peinture", "revêtement", "VRD", "génie civil", "terrassement",
    "démolition", "isolation", "façade", "étanchéité", "serrurerie",
]

# Mots-clés secteur IA / numérique (Nerolia)
IA_KEYWORDS = [
    "intelligence artificielle",
    "machine learning",
    "apprentissage automatique",
    "deep learning",
    "ia générative",
    "traitement du langage",
    "nlp",
    "llm",
    "modèle de langage",
    "chatbot",
    "assistant virtuel",
    "data science",
    "transformation numérique",
    "formation numérique",
    "formation ia",
    "formation intelligence artificielle",
    "outil numérique",
    "solution logicielle",
    "automatisation intelligente",
    "rpa",
    "vision par ordinateur",
    "analyse de données",
    "business intelligence",
    "tableau de bord",
    "digitalisation",
    "logiciel",
    "système d'information",
    "plateforme numérique",
    "saas",
    "cloud",
]

URGENCY_KEYWORDS = ["urgent", "immédiat", "express", "délai réduit"]


@dataclass
class ExtractionResult:
    detected_sector: str
    keywords_found: list[str]
    is_urgent: bool
    has_lot_decomposition: bool


def extract(title: str, description: str | None) -> ExtractionResult:
    text = f"{title} {description or ''}".lower()

    btp_found = [kw for kw in BTP_KEYWORDS if kw in text]
    ia_found = [kw for kw in IA_KEYWORDS if kw in text]
    keywords_found = btp_found + ia_found

    is_urgent = any(kw in text for kw in URGENCY_KEYWORDS)
    has_lots = bool(re.search(r"\blot\s*n?°?\s*\d+", text))

    if btp_found and ia_found:
        sector = "BTP+IA"
    elif ia_found:
        sector = "IA-numérique"
    elif btp_found:
        sector = "BTP"
    else:
        sector = "autre"

    return ExtractionResult(
        detected_sector=sector,
        keywords_found=keywords_found,
        is_urgent=is_urgent,
        has_lot_decomposition=has_lots,
    )
