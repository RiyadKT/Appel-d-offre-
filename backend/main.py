from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from database.connection import init_db
from api.routes import tenders, profile, responses


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Appel d'Offre API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tenders.router, prefix="/api/tenders", tags=["tenders"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(responses.router, prefix="/api/responses", tags=["responses"])


@app.get("/health")
async def health():
    return {"status": "ok"}
