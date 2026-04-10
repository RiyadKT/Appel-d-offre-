"""
Génère les documents de réponse à un AO : mémoire technique, bordereau, calendrier.
"""
import anthropic
from config import settings

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)


def generate_technical_memo(
    dce_analysis: dict,
    company_profile: dict,
    references: list[dict],
) -> str:
    """Génère une mémoire technique sur mesure."""

    refs_text = "\n".join(
        f"- {r.get('titre')} ({r.get('montant', 'N/A')} €, {r.get('annee', 'N/A')}) : {r.get('description', '')}"
        for r in references[:5]
    )

    prompt = f"""Tu es un expert en rédaction de réponses aux appels d'offre BTP français.

Génère une mémoire technique professionnelle en réponse à cet appel d'offre.

**Analyse du DCE :**
{dce_analysis}

**Profil de l'entreprise :**
{company_profile}

**Références similaires :**
{refs_text or "Aucune référence fournie"}

La mémoire technique doit inclure :
1. Présentation de l'entreprise et ses compétences
2. Compréhension du projet et des enjeux
3. Méthodologie et organisation chantier
4. Moyens humains et matériels mobilisés
5. Gestion qualité, sécurité, environnement
6. Références similaires
7. Planning prévisionnel

Ton : professionnel, précis, orienté résultats. Format Markdown."""

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=8192,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


def generate_admin_docs(company_profile: dict) -> dict:
    """
    Pré-remplit les pièces administratives standards
    à partir du profil entreprise.
    """
    return {
        "dc1": {
            "denomination": company_profile.get("name"),
            "siret": company_profile.get("siret"),
            "forme_juridique": company_profile.get("forme_juridique"),
            "adresse": company_profile.get("adresse"),
            # Champs DC1 complets à compléter selon profil
        },
        "dc2": {
            "denomination": company_profile.get("name"),
            "siret": company_profile.get("siret"),
            "ca_annuel": company_profile.get("revenue_range"),
            "effectif": company_profile.get("effectif"),
            "certifications": company_profile.get("certifications", []),
        },
        "attestations_fiscales": "À télécharger sur impots.gouv.fr",
        "kbis": "À télécharger sur infogreffe.fr",
    }


def generate_calendar(dce_analysis: dict, company_profile: dict) -> dict:
    """Génère un planning prévisionnel basé sur les contraintes du DCE."""
    prompt = f"""À partir de cette analyse de DCE, génère un planning prévisionnel en JSON.
Format attendu : liste de phases avec {{"phase": "nom", "debut": "semaine N", "duree": "X semaines", "ressources": "..."}}

DCE : {dce_analysis}
Capacités entreprise : {company_profile}

Réponds UNIQUEMENT en JSON."""

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )
    import json
    try:
        return json.loads(message.content[0].text)
    except json.JSONDecodeError:
        return {"phases": [], "raw": message.content[0].text}
