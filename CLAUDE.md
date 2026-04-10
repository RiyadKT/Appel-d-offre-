# CLAUDE.md — Contexte projet Appel d'Offre

## Objectif
Outil de veille + réponse automatisée aux appels d'offre marchés publics FR, focus BTP.
Deux axes : scraping/matching + génération automatique des réponses (Claude AI).

## Stack
- **Backend** : Python 3.11 / FastAPI / SQLAlchemy async / PostgreSQL+pgvector / Redis+Celery
- **Frontend** : Next.js 14 / Tailwind CSS / TypeScript
- **IA** : Claude API (Anthropic) — modèle claude-opus-4-6
- **Infra** : Docker Compose (db + redis)

## Structure des fichiers clés
```
backend/
  main.py                  — point d'entrée FastAPI
  config.py                — settings Pydantic (lit .env)
  database/
    models.py              — Tender, TenderResponse, CompanyProfile
    connection.py          — engine async, SessionLocal, init_db
  scrapers/
    base.py                — RawTender dataclass + BaseScraper ABC
    boamp.py               — API publique BOAMP (marchés publics FR)
    place.py               — Scraper PLACE (profil acheteur national)
  pipeline/
    normalizer.py          — RawTender → dict Tender
    deduplicator.py        — filtre les external_id déjà en BDD
    extractor.py           — NLP léger : secteur, mots-clés BTP, urgence
  matching/
    scorer.py              — score 0→1 (secteur 30%, montant 20%, loc 20%, délai 15%, certifs 15%)
  notifications/
    email.py               — Resend API
    slack.py               — Slack webhook
  ai/
    analyzer.py            — analyse DCE PDF/Word avec Claude
    generator.py           — génère mémoire technique, admin_docs, calendrier
  api/routes/
    tenders.py             — GET /tenders, PATCH /:id/status
    profile.py             — GET/PUT /profile
    responses.py           — POST /:id/analyze-dce, POST /:id/generate
  tasks/
    scheduler.py           — APScheduler, scraping toutes les 6h

frontend/
  src/app/
    page.tsx               — accueil avec liens Dashboard / Profil
    dashboard/page.tsx     — Kanban 4 colonnes (Nouveau/Retenu/En cours/Soumis)
    profile/page.tsx       — formulaire profil entreprise
  src/components/
    TenderCard.tsx         — carte AO avec score, statut, lien
    ScoreIndicator.tsx     — badge coloré % pertinence
  src/lib/api.ts           — client axios vers backend
```

## Variables d'environnement (.env)
- `DATABASE_URL` — PostgreSQL async
- `REDIS_URL`
- `ANTHROPIC_API_KEY` — obligatoire pour analyzer.py et generator.py
- `RESEND_API_KEY` — notifications email
- `SLACK_WEBHOOK_URL` — notifications Slack
- `NOTIFICATION_EMAIL`

## Démarrage
```bash
# Infrastructure
docker-compose up -d

# Backend
cd backend
pip install -e .
uvicorn main:app --reload         # API sur :8000
python tasks/scheduler.py         # scraping auto toutes les 6h

# Frontend
cd frontend
npm install
npm run dev                        # UI sur :3000
```

## Phases du projet
- **Phase 1 (MVP)** — scraping BOAMP/PLACE + matching mots-clés/CPV + notifs email + dashboard Kanban ← ON EST ICI
- **Phase 2** — matching sémantique embeddings (pgvector) + analyse DCE Claude
- **Phase 3** — génération réponse complète + assembly dossier + workflow validation

## Points d'attention
- Tous les scrapers héritent de `BaseScraper` (backend/scrapers/base.py)
- Le scoring est dans `matching/scorer.py` — poids ajustables
- Les seuils de notification : score ≥ 0.70 = urgent, 0.50-0.70 = normal
- `CompanyProfile` est en table singleton (1 seule ligne par instance)
- Le frontend proxifie `/api/*` vers `localhost:8000` via next.config.js
- Modèle Claude utilisé : `claude-opus-4-6` (changer dans ai/analyzer.py et ai/generator.py si besoin)

## Prochaines étapes suggérées
1. Configurer le profil via `/profile` dans l'UI
2. Lancer le scheduler et vérifier les premiers AO dans le dashboard
3. Phase 2 : ajouter embeddings pour matching sémantique
4. Phase 2 : endpoint upload DCE + analyse Claude
