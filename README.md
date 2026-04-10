# Appel d'Offre — Veille & Réponse Automatisée

Outil de scraping, matching et réponse automatisée aux appels d'offre (focus BTP / marchés publics FR).

## Structure

```
├── backend/          FastAPI — scrapers, pipeline, matching, IA
├── frontend/         Next.js — dashboard Kanban
├── docker-compose.yml
└── .env.example
```

## Démarrage rapide

```bash
cp .env.example .env
docker-compose up -d          # PostgreSQL + Redis
cd backend && pip install -e .
uvicorn main:app --reload
cd frontend && npm install && npm run dev
```

## Phases

- **Phase 1** — Scraping BOAMP/PLACE + matching + notifications email
- **Phase 2** — Matching sémantique (embeddings) + analyse DCE (Claude)
- **Phase 3** — Génération automatique des réponses + assembly dossier
