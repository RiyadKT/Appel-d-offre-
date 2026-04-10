"""
Scraper PLACE (Profil Acheteur national).
URL : https://www.marches-publics.gouv.fr
API DUME / données ouvertes via data.gouv.fr
"""
import httpx
from datetime import datetime, timedelta
from typing import Optional

from scrapers.base import BaseScraper, RawTender

# API data.gouv.fr — jeu de données marchés publics
DATAGOUV_API = "https://data.gouv.fr/api/1/datasets/5cd57bf68b4c4179299eb0e9/resources"
PLACE_SEARCH = "https://www.marches-publics.gouv.fr/index.php"


class PLACEScraper(BaseScraper):
    """
    Scrape les AO publiés sur PLACE via l'API data.gouv.fr
    et la page de recherche publique.
    """
    source_name = "place"

    def __init__(self, keywords: Optional[list[str]] = None):
        self.keywords = keywords or ["BTP", "travaux", "construction", "rénovation"]

    async def fetch(self, days_back: int = 7) -> list[RawTender]:
        results: list[RawTender] = []
        since = datetime.utcnow() - timedelta(days=days_back)

        async with httpx.AsyncClient(timeout=30) as client:
            for keyword in self.keywords:
                page_results = await self._search(client, keyword, since)
                results.extend(page_results)

        # Déduplication locale par external_id
        seen = set()
        unique = []
        for t in results:
            if t.external_id not in seen:
                seen.add(t.external_id)
                unique.append(t)

        self.log(f"{len(unique)} AO uniques récupérés")
        return unique

    async def _search(
        self, client: httpx.AsyncClient, keyword: str, since: datetime
    ) -> list[RawTender]:
        results = []
        try:
            resp = await client.get(
                PLACE_SEARCH,
                params={
                    "page": "entreprise.EntrepriseAdvancedSearch",
                    "searchAO[keyword]": keyword,
                    "searchAO[datePublication][min]": since.strftime("%d/%m/%Y"),
                    "format": "json",
                },
            )
            if resp.status_code != 200:
                return []
            data = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
            for item in data.get("results", []):
                t = self._parse(item)
                if t:
                    results.append(t)
        except Exception as e:
            self.log(f"Erreur search '{keyword}': {e}")
        return results

    def _parse(self, item: dict) -> Optional[RawTender]:
        try:
            ref = item.get("reference") or item.get("id") or str(hash(item.get("objet", "")))
            return RawTender(
                external_id=f"place-{ref}",
                source=self.source_name,
                title=item.get("objet") or item.get("title", ""),
                description=item.get("description"),
                buyer=item.get("acheteur") or item.get("pouvoir_adjudicateur"),
                location=item.get("lieu") or item.get("departement"),
                cpv_codes=item.get("cpv", []),
                estimated_value=None,
                deadline=self._parse_date(item.get("date_limite")),
                published_at=self._parse_date(item.get("date_publication")),
                url=item.get("url"),
                raw_data=item,
            )
        except Exception as e:
            self.log(f"Erreur parsing: {e}")
            return None

    def _parse_date(self, val) -> Optional[datetime]:
        if not val:
            return None
        for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%Y-%m-%dT%H:%M:%S"):
            try:
                return datetime.strptime(str(val)[:19], fmt)
            except ValueError:
                continue
        return None
