from fastapi import APIRouter, UploadFile, File, Query
from typing import Optional, List
import numpy as np
from bson import ObjectId
from ..services.db import get_db
from ..services.audio import extract_features_from_bytes

router = APIRouter()

@router.post("/features")
async def upload_and_extract(file: UploadFile = File(...)):
    """Upload and analyze audio files"""
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

@router.post("/cluster/run")
async def run_kmeans(k: int = Query(8, ge=2, le=64)):
    """Run k-means clustering on the songs"""
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

@router.get("/recommend")
async def recommend_by_song(song_id: str | None = None, k: int = 10):
    """Get song recommendations based on a seed song"""
    db = get_db()
    
    if song_id is not None:
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

@router.get("/get_mood_clusters")
async def get_mood_clusters():
    """Get information about mood clusters"""
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

@router.get("/get_playlist_by_mood")
async def get_playlist_by_mood(
    cluster: int | None = None,
    e_min: float | None = None,
    e_max: float | None = None,
    v_min: float | None = None,
    v_max: float | None = None,
    k: int = 20
):
    """Get a playlist based on mood parameters or cluster"""
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