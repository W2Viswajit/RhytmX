from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Union
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from mlxtend.frequent_patterns import apriori, association_rules
from pymongo import UpdateOne
from bson import ObjectId
from .services.audio import extract_features_from_bytes
from .services.db import get_db, init_db
from dotenv import load_dotenv
import os

from .routers.health import router as health_router
from .routers.music import router as music_router
from .routers.mood import router as mood_router

load_dotenv()

app = FastAPI(title="RhythmX API", version="0.2.0")

# Set up CORS origins
origins = [
    os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
    "http://localhost:3000",
    "http://localhost:3001",  # Add the Next.js port
]

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Initialize database
@app.on_event("startup")
async def startup_event():
    await init_db()

# Include routers
app.include_router(health_router, prefix="/health", tags=["health"])
app.include_router(music_router, prefix="/api/music", tags=["music"])
app.include_router(mood_router, prefix="/api", tags=["mood"])
# Route already included above

@app.get("/")
def root():
    return {"name": os.getenv("APP_NAME", "RhythmX"), "status": "ok"}


class RecommendRequest(BaseModel):
    seed_song_id: Optional[str] = None
    mood_box: Optional[tuple[float, float, float, float]] = None  # (e_min, e_max, v_min, v_max)
    k: int = 5


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.post("/features")
async def upload_and_extract(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    feats = extract_features_from_bytes(audio_bytes)
    db = get_db()
    
    song = {
        "title": file.filename,
        "artist": "unknown",
        **feats
    }
    result = await db.songs.insert_one(song)
    return {"song_id": str(result.inserted_id), "features": feats}


@app.post("/cluster/run")
async def run_kmeans(k: int = Query(8, ge=2, le=64)):
    db = get_db()
    cursor = db.songs.find({}, {
        "energy": 1,
        "valence": 1,
        "danceability": 1,
        "acousticness": 1
    })
    
    songs = await cursor.to_list(length=None)
    if not songs:
        return {"clusters": 0}
        
    X = np.array([[s["energy"], s["valence"], s["danceability"], s.get("tempo", 120)] for s in songs])
    model = KMeans(n_clusters=k, n_init=10, random_state=42)
    labels = model.fit_predict(X)
    
    # Update songs with cluster assignments
    operations = []
    for song, label in zip(songs, labels):
        operations.append(
            UpdateOne(
                {"_id": song["_id"]},
                {"$set": {"cluster": int(label)}}
            )
        )
    
    if operations:
        await db.songs.bulk_write(operations)
    
    return {"clusters": int(k)}


@app.post("/recommend")
async def recommend(req: RecommendRequest):
    db = get_db()
    query = {}
    if req.mood_box is not None:
        e_min, e_max, v_min, v_max = req.mood_box
        query = {
            "energy": {"$gte": e_min, "$lte": e_max},
            "valence": {"$gte": v_min, "$lte": v_max}
        }
    
    songs = await db.songs.find(query).to_list(length=None)
    if not songs:
        return {"items": []}
    
    # Calculate center point
    if req.mood_box is not None:
        center = np.array([(req.mood_box[0]+req.mood_box[1])/2, (req.mood_box[2]+req.mood_box[3])/2])
    else:
        center = np.array([0.5, 0.5])
    
    # Score songs by distance to center
    scored = []
    for song in songs:
        p = np.array([song["energy"], song["valence"]])
        dist = float(np.linalg.norm(p - center))
        scored.append((str(song["_id"]), song["title"], 1.0/(1e-6+dist)))
    
    scored.sort(key=lambda x: x[2], reverse=True)
    top = scored[:max(10, req.k*4)]
    
    return {"items": [{"song_id": sid, "title": title, "score": sc} for sid, title, sc in top]}


@app.get("/health")
def health():
    return {"ok": True}


# New: GET variant for recommend by song_id, plus cluster/mood endpoints
@app.get("/recommend")
async def recommend_by_song(song_id: str | None = None, k: int = 10):
    db = get_db()
    
    if song_id is not None:
        from bson import ObjectId
        seed = await db.songs.find_one({"_id": ObjectId(song_id)})
        if not seed:
            return {"items": []}
        center = np.array([seed["energy"], seed["valence"]])
    else:
        center = np.array([0.5, 0.5])
    
    songs = await db.songs.find().to_list(length=None)
    scored = []
    for song in songs:
        p = np.array([song["energy"], song["valence"]])
        dist = float(np.linalg.norm(p - center))
        scored.append((str(song["_id"]), song["title"], 1.0/(1e-6+dist)))
    
    scored.sort(key=lambda x: x[2], reverse=True)
    top = scored[:k]
    
    return {"items": [{"song_id": sid, "title": title, "score": sc} for sid, title, sc in top]}


@app.get("/get_mood_clusters")
async def get_mood_clusters():
    db = get_db()
    pipeline = [
        {"$group": {
            "_id": "$cluster",
            "energy": {"$avg": "$energy"},
            "valence": {"$avg": "$valence"},
            "size": {"$sum": 1}
        }},
        {"$project": {
            "cluster": "$_id",
            "centroid": {
                "energy": "$energy",
                "valence": "$valence"
            },
            "size": 1,
            "_id": 0
        }}
    ]
    
    clusters = await db.songs.aggregate(pipeline).to_list(length=None)
    return {"clusters": clusters}


@app.get("/get_playlist_by_mood")
async def get_playlist_by_mood(
    cluster: int | None = None,
    e_min: float | None = None,
    e_max: float | None = None,
    v_min: float | None = None,
    v_max: float | None = None,
    k: int = 20
):
    db = get_db()
    query = {}
    
    if cluster is not None:
        query["cluster"] = cluster
    if e_min is not None and e_max is not None:
        query["energy"] = {"$gte": e_min, "$lte": e_max}
    if v_min is not None and v_max is not None:
        query["valence"] = {"$gte": v_min, "$lte": v_max}
    songs = await db.songs.find(query).limit(k).to_list(length=None)
    return {
        "items": [
            {
                "song_id": str(s["_id"]),
                "title": s["title"],
                "energy": s["energy"],
                "valence": s["valence"]
            } for s in songs
        ]
    }

