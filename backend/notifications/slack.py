"""
Notifications Slack via webhook.
"""
import httpx
from database.models import Tender
from config import settings


async def send_tender_alert(tender: Tender, score: float, recommendation: str):
    if not settings.slack_webhook_url:
        return

    emoji = {"high": ":red_circle:", "medium": ":yellow_circle:", "low": ":green_circle:"}.get(
        recommendation, ":white_circle:"
    )
    deadline_str = tender.deadline.strftime("%d/%m/%Y") if tender.deadline else "N/A"
    value_str = f"{tender.estimated_value:,.0f} €" if tender.estimated_value else "N/A"

    payload = {
        "text": f"{emoji} *Nouvel AO — Score {score:.0%}*",
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": (
                        f"{emoji} *{tender.title[:100]}*\n"
                        f"Acheteur: {tender.buyer or 'N/A'} | "
                        f"Lieu: {tender.location or 'N/A'} | "
                        f"Montant: {value_str} | "
                        f"Limite: {deadline_str}\n"
                        f"Score: *{score:.0%}* ({recommendation})"
                    ),
                },
                "accessory": {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Voir l'AO"},
                    "url": tender.url or "#",
                },
            }
        ],
    }

    async with httpx.AsyncClient() as client:
        await client.post(settings.slack_webhook_url, json=payload)
