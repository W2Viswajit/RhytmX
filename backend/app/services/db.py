import uvicorn
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from functools import lru_cache

# MongoDB connection settings
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("MONGODB_DB", "moodmap")

@lru_cache(maxsize=1)
def get_db():
    """Get MongoDB database connection"""
    client = AsyncIOMotorClient(MONGODB_URI)
    return client[DATABASE_NAME]

async def init_db():
    """Initialize database connections and create indexes"""
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    
    # Create indexes if needed
    await db.songs.create_index([("energy", 1)])
    await db.songs.create_index([("valence", 1)])
    await db.songs.create_index([("cluster", 1)])
    
    return db

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
