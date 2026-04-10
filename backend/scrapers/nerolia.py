"""
Scraper Nerolia — AOs Intelligence Artificielle, Formation IA et Outils Numériques.

Sources :
  - BOAMP (API publique) — ODSQL LIKE sur objet/descriptif, par lots de mots-clés
  - TED (Tenders Electronic Daily) — appels d'offre européens, acheteurs FR

Codes CPV ciblés :
  72xxxxxx — Services informatiques & développement logiciel
  48xxxxxx — Logiciels et systèmes d'information
  80500xxx — Services de formation (inclut formation IA/numérique)
  80530xxx — Formation professionnelle / informatique
"""
import httpx
import urllib.parse
from datetime import datetime, timedelta
from typing import Optional

from scrapers.base import BaseScraper, RawTender

BOAMP_API = "https://www.boamp.fr/api/explore/v2.1/catalog/datasets/boamp/records"
TED_SEARCH = "https://ted.europa.eu/api/v3.0/notices/search"

# Mots-clés IA/numérique — regroupés par lots pour rester sous la limite de l'API
IA_KEYWORD_BATCHES = [
    ["intelligence artificielle", "machine learning", "apprentissage automatique", "deep learning"],
    ["formation numérique", "formation IA", "formation intelligence artificielle", "numérique"],
    ["transformation numérique", "outil numérique", "solution logicielle", "digitalisation"],
    ["data science", "business intelligence", "tableau de bord", "analyse de données"],
    ["chatbot", "assistant virtuel", "NLP", "traitement du langage", "LLM"],
    ["automatisation", "RPA", "vision par ordinateur", "reconnaissance automatique"],
]


class NeroliaScraper(BaseScraper):
    """
    Scraper dédié à Nerolia : veille sur les AOs IA, formation IA
    et outils numériques dans les marchés publics français et européens.
    """
    source_name = "nerolia"

    def __init__(self, keyword_batches: Optional[list[list[str]]] = None):
        self.keyword_batches = keyword_batches or IA_KEYWORD_BATCHES

    async def fetch(self, days_back: int = 7) -> list[RawTender]:
        results: list[RawTender] = []

        async with httpx.AsyncClient(timeout=30) as client:
            # BOAMP — une requête par lot de mots-clés
            for batch in self.keyword_batches:
                batch_results = await self._fetch_boamp_batch(client, batch, days_back)
                results.extend(batch_results)
                self.log(f"Lot {batch[:2]}… → {len(batch_results)} AO")

            # TED Europe — acheteurs français, CPV IT/formation
            ted = await self._fetch_ted(client, days_back)
            results.extend(ted)
            self.log(f"TED Europe → {len(ted)} AO")

        # Déduplication locale par external_id
        seen: set[str] = set()
        unique: list[RawTender] = []
        for t in results:
            if t.external_id not in seen:
                seen.add(t.external_id)
                unique.append(t)

        self.log(f"Total : {len(unique)} AO uniques IA/numérique")
        return unique

    # ------------------------------------------------------------------ #
    #  BOAMP — ODSQL LIKE sur objet + descriptif
    # ------------------------------------------------------------------ #
    async def _fetch_boamp_batch(
        self, client: httpx.AsyncClient, keywords: list[str], days_back: int
    ) -> list[RawTender]:
        """
        Recherche BOAMP par ODSQL LIKE sur objet/descriptif.
        L'URL est construite manuellement pour que les guillemets simples
        ODSQL ne soient pas encodés en %27 (ce qui casse la syntaxe).
        """
        since = (datetime.utcnow() - timedelta(days=days_back)).strftime("%Y-%m-%d")

        results: list[RawTender] = []
        for kw in keywords:
            # ODSQL : guillemets simples autour des valeurs dans LIKE
            # Le champ descriptif n'accepte pas LIKE sur l'API BOAMP — objet uniquement
            where = (
                f"dateparution>=date'{since}' AND "
                f"objet LIKE '%{kw}%'"
            )
            batch = await self._paginate_boamp(client, where)
            results.extend(batch)
        return results

    async def _paginate_boamp(
        self, client: httpx.AsyncClient, where: str
    ) -> list[RawTender]:
        """
        Pagine l'API BOAMP en construisant l'URL manuellement pour préserver
        les guillemets simples non-encodés (requis par l'API ODS v2.1).
        """
        results: list[RawTender] = []
        offset = 0
        limit = 100

        while True:
            try:
                # Encode le where en préservant les guillemets simples
                qs = urllib.parse.urlencode({
                    "limit": limit,
                    "offset": offset,
                    "order_by": "dateparution DESC",
                })
                encoded_where = urllib.parse.quote(where, safe="',()")
                url = f"{BOAMP_API}?where={encoded_where}&{qs}"

                resp = await client.get(url)
                resp.raise_for_status()
                data = resp.json()
            except Exception as e:
                self.log(f"Erreur BOAMP: {e}")
                break

            records = data.get("results", [])
            if not records:
                break

            for rec in records:
                tender = self._parse_boamp(rec)
                if tender:
                    results.append(tender)

            offset += limit
            if offset >= data.get("total_count", 0):
                break

        return results

    def _parse_boamp(self, rec: dict) -> Optional[RawTender]:
        try:
            fields = rec.get("fields", rec)
            raw_id = fields.get("idweb") or fields.get("id")
            if not raw_id:
                return None
            return RawTender(
                external_id=f"nerolia-boamp-{raw_id}",
                source=self.source_name,
                title=fields.get("objet", "")[:500],
                description=fields.get("descriptif"),
                buyer=fields.get("denomination_acheteur") or fields.get("identite"),
                location=fields.get("lieu_execution"),
                cpv_codes=self._extract_cpv(fields),
                estimated_value=self._parse_value(fields.get("valeur_estimee")),
                deadline=self._parse_date(fields.get("datelimitereponse")),
                published_at=self._parse_date(fields.get("dateparution")),
                url=f"https://www.boamp.fr/avis/detail/{raw_id}",
                raw_data=fields,
            )
        except Exception as e:
            self.log(f"Erreur parsing BOAMP: {e}")
            return None

    # ------------------------------------------------------------------ #
    #  TED Europe — interface REST publique (sans auth)
    # ------------------------------------------------------------------ #
    async def _fetch_ted(
        self, client: httpx.AsyncClient, days_back: int
    ) -> list[RawTender]:
        """
        TED public search via les paramètres GET de l'API REST v3.
        Filtre : pays FR, mots-clés IA, annonces récentes.
        """
        since = (datetime.utcnow() - timedelta(days=days_back)).strftime("%Y%m%d")
        results: list[RawTender] = []

        # Termes de recherche IA pour TED
        ted_keywords = [
            "intelligence artificielle",
            "formation numérique",
            "machine learning",
            "transformation numérique",
            "logiciel",
        ]

        for kw in ted_keywords:
            try:
                resp = await client.get(
                    "https://ted.europa.eu/api/v3.0/notices/search",
                    params={
                        "q": f'"{kw}"',
                        "scope": "ALL",
                        "language": "FR",
                        "fields": "ND,TI,AU,PC,CY,DD,PD,TV",
                        "pageNum": 1,
                        "pageSize": 25,
                        "sortField": "PD",
                        "sortOrder": "DESC",
                        "onlyLatestVersions": "true",
                    },
                    headers={"Accept": "application/json"},
                )
                if resp.status_code != 200:
                    continue

                data = resp.json()
                notices = data.get("notices", [])
                for notice in notices:
                    # Filtre : acheteur français uniquement
                    country = notice.get("CY", "") or ""
                    if isinstance(country, list):
                        country = country[0] if country else ""
                    if str(country).upper() not in ("FR", "FRA", "FRANCE"):
                        continue
                    tender = self._parse_ted(notice)
                    if tender:
                        results.append(tender)

            except Exception as e:
                self.log(f"Erreur TED '{kw}': {e}")

        return results

    def _parse_ted(self, notice: dict) -> Optional[RawTender]:
        try:
            notice_id = notice.get("ND") or str(hash(str(notice)))

            title_raw = notice.get("TI") or {}
            if isinstance(title_raw, dict):
                title = title_raw.get("FR") or title_raw.get("EN") or next(iter(title_raw.values()), "")
            else:
                title = str(title_raw)

            buyer_raw = notice.get("AU") or {}
            if isinstance(buyer_raw, dict):
                buyer = buyer_raw.get("officialName") or buyer_raw.get("name", "")
            elif isinstance(buyer_raw, list):
                buyer = buyer_raw[0] if buyer_raw else ""
            else:
                buyer = str(buyer_raw)

            cpv_raw = notice.get("PC") or []
            if isinstance(cpv_raw, str):
                cpv_codes = [cpv_raw]
            elif isinstance(cpv_raw, list):
                cpv_codes = [str(c) for c in cpv_raw]
            else:
                cpv_codes = []

            value_raw = notice.get("TV")
            value = self._parse_value(value_raw)

            return RawTender(
                external_id=f"nerolia-ted-{notice_id}",
                source=self.source_name,
                title=title[:500] if title else "",
                description=None,
                buyer=buyer or None,
                location="France",
                cpv_codes=cpv_codes,
                estimated_value=value,
                deadline=self._parse_date(notice.get("DD")),
                published_at=self._parse_date(notice.get("PD")),
                url=f"https://ted.europa.eu/udl?uri=TED:NOTICE:{notice_id}:TEXT:FR:HTML",
                raw_data=notice,
            )
        except Exception as e:
            self.log(f"Erreur parsing TED: {e}")
            return None

    # ------------------------------------------------------------------ #
    #  Helpers
    # ------------------------------------------------------------------ #
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
        except (ValueError, TypeError):
            return None

    def _parse_date(self, val) -> Optional[datetime]:
        if not val:
            return None
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%Y-%m-%dT%H:%M:%S", "%Y%m%d"):
            try:
                return datetime.strptime(str(val)[:19], fmt)
            except ValueError:
                continue
        return None
