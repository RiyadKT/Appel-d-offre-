"""
Planificateur de tâches : scraping automatique + matching + notifications.
Lance avec : python tasks/scheduler.py
"""
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import SessionLocal, init_db
from database.models import Tender, CompanyProfile
from scrapers.boamp import BOAMPScraper
from scrapers.place import PLACEScraper
from scrapers.nerolia import NeroliaScraper
from pipeline.normalizer import normalize
from pipeline.deduplicator import filter_new
from pipeline.extractor import extract
from matching.scorer import score
from notifications.email import send_tender_alert
from notifications import slack


async def run_scraping_pipeline():
    print("[scheduler] Démarrage du pipeline de scraping...")

    async with SessionLocal() as db:
        # Chargement du profil
        from sqlalchemy import select
        profile_result = await db.execute(select(CompanyProfile).limit(1))
        profile = profile_result.scalar_one_or_none()

        if not profile:
            print("[scheduler] Aucun profil configuré. Pipeline annulé.")
            return

        cpv_codes = profile.sectors or ["45"]
        keywords = profile.keywords or ["BTP", "travaux", "construction"]

        # Scraping
        scrapers = [
            BOAMPScraper(cpv_codes=cpv_codes),
            PLACEScraper(keywords=keywords),
            # Scraper Nerolia : AOs IA / formation / outils numériques
            # (CPV 72/48/80 + fulltext + TED Europe)
            NeroliaScraper(),
        ]
        all_raws = []
        for scraper in scrapers:
            try:
                raws = await scraper.fetch(days_back=1)
                all_raws.extend(raws)
            except Exception as e:
                print(f"[scheduler] Erreur scraper {scraper.source_name}: {e}")

        # Déduplication
        new_raws = await filter_new(all_raws, db)
        print(f"[scheduler] {len(new_raws)} nouveaux AO à traiter")

        # Insertion + scoring
        for raw in new_raws:
            normalized = normalize(raw)
            extraction = extract(raw.title, raw.description)

            tender = Tender(**normalized)
            db.add(tender)
            await db.flush()  # obtenir l'id

            match_result = score(tender, profile)
            tender.match_score = match_result.score
            tender.match_details = match_result.details

            # Notifications si pertinent
            if match_result.recommendation in ("high", "medium"):
                send_tender_alert(tender, match_result.score, match_result.recommendation)
                await slack.send_tender_alert(tender, match_result.score, match_result.recommendation)

        await db.commit()
        print(f"[scheduler] Pipeline terminé — {len(new_raws)} AO insérés")


async def main():
    await init_db()

    scheduler = AsyncIOScheduler()
    # Scraping toutes les 6h
    scheduler.add_job(run_scraping_pipeline, "interval", hours=6, id="scraping")
    # Scraping immédiat au démarrage
    scheduler.add_job(run_scraping_pipeline, "date", id="scraping_now")

    scheduler.start()
    print("[scheduler] Planificateur démarré (Ctrl+C pour arrêter)")

    try:
        await asyncio.Event().wait()
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()


if __name__ == "__main__":
    asyncio.run(main())
