"""
Analyse un DCE (PDF/Word) avec Claude pour extraire les exigences clés.
"""
import anthropic
from pathlib import Path
import pypdf
import docx

from config import settings

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)


def extract_text_from_file(path: str) -> str:
    p = Path(path)
    if p.suffix.lower() == ".pdf":
        reader = pypdf.PdfReader(path)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    elif p.suffix.lower() in (".docx", ".doc"):
        doc = docx.Document(path)
        return "\n".join(para.text for para in doc.paragraphs)
    else:
        return p.read_text(encoding="utf-8", errors="ignore")


def analyze_dce(file_path: str, company_profile: dict) -> dict:
    """
    Analyse le DCE et retourne les exigences structurées.
    """
    text = extract_text_from_file(file_path)
    # Tronquer pour rester dans les limites du contexte
    text = text[:50_000]

    prompt = f"""Tu es un expert en marchés publics BTP français.
Analyse ce DCE et retourne un JSON structuré avec les champs suivants :

- objet : description courte des travaux
- montant_estimatif : valeur en euros ou null
- date_limite_remise : au format DD/MM/YYYY ou null
- criteres_selection : liste des critères (ex: prix 60%, mémoire technique 40%)
- certifications_requises : liste des certifs (Qualibat, ISO, RGE...)
- exigences_techniques : liste des points clés techniques
- documents_requis : liste des pièces à fournir (DC1, DC2, mémoire, DUME...)
- lots : liste des lots si AO alloti
- points_vigilance : alertes importantes à noter

Profil de l'entreprise soumissionnaire :
{company_profile}

--- DÉBUT DU DCE ---
{text}
--- FIN DU DCE ---

Réponds UNIQUEMENT en JSON valide, sans markdown ni commentaires."""

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    import json
    try:
        return json.loads(message.content[0].text)
    except json.JSONDecodeError:
        return {"raw_analysis": message.content[0].text}
