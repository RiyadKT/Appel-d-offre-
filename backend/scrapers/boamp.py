"""
Scraper BOAMP (Bulletin Officiel des Annonces des Marchés Publics).
API REST publique : https://www.boamp.fr/api/explore/v2.1/
"""
import httpx
import urllib.parse
from datetime import datetime, timedelta
from typing import Optional

from scrapers.base import BaseScraper, RawTender

BOAMP_API = "https://www.boamp.fr/api/explore/v2.1/catalog/datasets/boamp/records"


class BOAMPScraper(BaseScraper):
    source_name = "boamp"

    def __init__(self, cpv_codes: Optional[list[str]] = None):
        # Codes CPV BTP par défaut (45xxx = travaux de construction)
        self.cpv_codes = cpv_codes or ["45"]

    async def fetch(self, days_back: int = 7) -> list[RawTender]:
        since = (datetime.utcnow() - timedelta(days=days_back)).strftime("%Y-%m-%d")
        # Recherche fulltext sur les codes CPV via q (évite les problèmes d'encodage avec LIKE)
        cpv_q = " OR ".join(f'"{c}"' for c in self.cpv_codes)
        where = f"dateparution>=date'{since}'"

        results: list[RawTender] = []
        offset = 0
        limit = 100

        async with httpx.AsyncClient(timeout=30) as client:
            while True:
                qs = urllib.parse.urlencode({"q": cpv_q, "limit": limit, "offset": offset, "order_by": "dateparution DESC"})
                encoded_where = urllib.parse.quote(where, safe="',()")
                url = f"{BOAMP_API}?where={encoded_where}&{qs}"
                try:
                    resp = await client.get(url)
                    resp.raise_for_status()
                    data = resp.json()
                except Exception as e:
                    self.log(f"Erreur requête: {e}")
                    break
                records = data.get("results", [])
                if not records:
                    break

                for rec in records:
                    tender = self._parse(rec)
                    if tender:
                        results.append(tender)

                offset += limit
                if offset >= data.get("total_count", 0):
                    break

        self.log(f"{len(results)} AO récupérés depuis {since}")
        return results

    def _parse(self, rec: dict) -> Optional[RawTender]:
        try:
            fields = rec.get("fields", rec)
            return RawTender(
                external_id=f"boamp-{fields.get('idweb') or fields.get('id')}",
                source=self.source_name,
                title=fields.get("objet", "")[:500],
                description=fields.get("descriptif"),
                buyer=fields.get("denomination_acheteur") or fields.get("identite"),
                location=fields.get("lieu_execution"),
                cpv_codes=self._extract_cpv(fields),
                estimated_value=self._parse_value(fields.get("valeur_estimee")),
                deadline=self._parse_date(fields.get("datelimitereponse")),
                published_at=self._parse_date(fields.get("dateparution")),
                url=f"https://www.boamp.fr/avis/detail/{fields.get('idweb')}",
                raw_data=fields,
            )
        except Exception as e:
            self.log(f"Erreur parsing: {e}")
            return None

    def _extract_cpv(self, fields: dict) -> list[str]:
        cpv = fields.get("cpv", "")
        if isinstance(cpv, list):
            return cpv
        if isinstance(cpv, str) and cpv:
            return [c.strip() for c in cpv.split(",") if c.strip()]
        return []

    def _parse_value(self, val) -> Optional[float]:
        if val is None:
            return None
        try:
            return float(str(val).replace(" ", "").replace(",", "."))
        except ValueError:
            return None

    def _parse_date(self, val) -> Optional[datetime]:
        if not val:
            return None
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%Y-%m-%dT%H:%M:%S"):
            try:
                return datetime.strptime(str(val)[:19], fmt)
            except ValueError:
                continue
        return None
