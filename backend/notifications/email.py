"""
Notifications email via Resend.
"""
import resend
from database.models import Tender
from config import settings

resend.api_key = settings.resend_api_key


def send_tender_alert(tender: Tender, score: float, recommendation: str):
    if not settings.resend_api_key or not settings.notification_email:
        print(f"[email] Notification désactivée — AO: {tender.title[:60]}")
        return

    emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(recommendation, "⚪")
    deadline_str = tender.deadline.strftime("%d/%m/%Y") if tender.deadline else "N/A"
    value_str = f"{tender.estimated_value:,.0f} €" if tender.estimated_value else "N/A"

    resend.Emails.send({
        "from": "alertes@votredomaine.fr",
        "to": settings.notification_email,
        "subject": f"{emoji} Nouvel AO — {tender.title[:80]}",
        "html": f"""
<h2>{emoji} Nouvel appel d'offre détecté</h2>
<table>
  <tr><td><b>Titre</b></td><td>{tender.title}</td></tr>
  <tr><td><b>Acheteur</b></td><td>{tender.buyer or 'N/A'}</td></tr>
  <tr><td><b>Localisation</b></td><td>{tender.location or 'N/A'}</td></tr>
  <tr><td><b>Montant estimé</b></td><td>{value_str}</td></tr>
  <tr><td><b>Date limite</b></td><td>{deadline_str}</td></tr>
  <tr><td><b>Score de pertinence</b></td><td>{score:.0%} ({recommendation})</td></tr>
</table>
<p><a href="{tender.url}">Voir l'appel d'offre →</a></p>
        """,
    })
    print(f"[email] Alerte envoyée — {tender.title[:60]}")
