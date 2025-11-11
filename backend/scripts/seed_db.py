from pymongo import MongoClient
import random

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['moodmap']

# Generate sample songs
songs = []
for i in range(50):
    song = {
        'title': f'Sample Track {i}',
        'artist': f'Artist {i % 10}',
        'energy': round(random.uniform(0, 1), 3),
        'valence': round(random.uniform(0, 1), 3),
        'danceability': round(random.uniform(0, 1), 3),
        'acousticness': round(random.uniform(0, 1), 3),
        'cluster': random.randint(0, 7)
    }
    songs.append(song)

# Insert songs
result = db.songs.insert_many(songs)
print(f"Inserted {len(result.inserted_ids)} songs")