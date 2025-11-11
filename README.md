# RhythmX — The Algorithmic Sound Explorer

RhythmX is an innovative, animated, and elegant full‑stack web application for algorithmic music discovery in niche genres. It leverages granular audio features and collaborative listening patterns from small communities—eschewing popularity—to recommend songs by mood and vibe.

- Frontend: React + TailwindCSS + Framer Motion (cinematic gradients, glassmorphism, interactive transitions)
- Backend: FastAPI (Python) with Librosa (feature extraction), scikit‑learn (KMeans clustering), and Apriori/PrefixSpan (association/sequential pattern mining)
- Data: Spotify Million Playlist Dataset (and other large datasets) via Pandas/NumPy; stored in MongoDB
- Prototype: Streamlit app with interactive Mood Map and audio previews
- App name and theme: RhythmX with coral red primary color

## Monorepo Layout

```
frontend/          # React app (TailwindCSS, Framer Motion)
backend/           # FastAPI service (ML + data mining)
  app/
    routers/
    services/
    models/
    schemas/
streamlit_app/     # Streamlit prototype
scripts/           # Data ingestion and batch processing utilities
.data/             # Local data (ignored)
```

## Quick Start

### Prerequisites
- Node.js >= 18
- Python >= 3.10
- MongoDB (local or remote)

### 1) Configure environment
Copy the environment templates and adjust values:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

### 2) Install and run frontend
```bash
cd frontend
npm install
npm run dev
```
Dev server runs at http://localhost:5173 (Vite).

### 3) Install and run backend
```bash
cd backend
python -m venv .venv && . .venv/Scripts/activate  # Windows PowerShell
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API runs at http://localhost:8000 with docs at /docs.

### 4) Run Streamlit prototype
```bash
cd streamlit_app
pip install -r requirements.txt
streamlit run app.py
```

## Core Features
- Mood Map Dashboard: interactive scatter (energy vs. valence), clustered micro‑genres; click to generate niche playlists
- Playlist Generator: animated recommendations with audio previews and glassmorphic cards
- Analytics: clustering quality (e.g., silhouette), user pattern insights, association rules and sequential transitions
- Big data pipelines: batch Librosa feature extraction, KMeans clustering, Apriori/PrefixSpan mining

## Data Processing Overview
- Feature extraction: MFCCs, spectral centroid, zero‑crossing rate, tempo, chroma, energy, valence proxies
- Clustering: KMeans (configurable K), stored per song with cluster labels and centroids
- Association mining: frequent itemsets and rules across playlist sessions; sequential patterns for hidden transitions
- Storage: MongoDB collections for songs, features, clusters, playlists, user histories, and mined patterns

## Theming
Primary color: Coral Red (#FF7F50). Tailwind theme token `primary` maps to coral.

## Licensing
This repository includes example integration scaffolding; verify dataset licensing before distribution.
 
## How It Works (Step‑by‑Step)

### 1) Input Data (Big Data)

The system collects:

- User playlists and listening history
- Song metadata (artist, genre, etc.)
- Audio features such as:
  - Energy → how intense or active a song feels
  - Valence → how happy or sad it sounds
  - Tempo → beats per minute (speed)
  - Timbre → tone quality or texture

These can be obtained from APIs like Spotify Audio Features API or local datasets (e.g., Million Song Dataset / Million Playlist Dataset).

### 2) Feature Extraction

Each song is represented as a feature vector, for example:

| Song | Energy | Valence | Tempo | Acousticness | Danceability |
|------|--------|---------|-------|--------------|--------------|
| A    | 0.78   | 0.64    | 120   | 0.12         | 0.80         |
| B    | 0.45   | 0.30    | 90    | 0.50         | 0.40         |

### 3) Unsupervised Clustering (K‑Means)

Apply K‑Means clustering on song features. Each cluster represents a mood/vibe group — for example:

- Cluster 1 → "Chill & Low Energy"
- Cluster 2 → "Happy & Upbeat"
- Cluster 3 → "Dark & Intense"

Thus, even without explicit genres, songs are grouped by their emotional fingerprint.

### 4) Association Rule Mining (Apriori / PrefixSpan)

Analyze community‑level listening patterns:

If many users often play Song A → Song B → Song C, infer an association rule:

`A, B → C`

This helps find hidden relationships between niche songs listened to together.

### 5) Mood‑Based Recommendation

When a user plays or searches a song:

1. Identify its cluster (mood)
2. Use association rules to find other songs people in that cluster enjoy
3. Recommend similar, less popular but high‑match songs

Example: if a user listens to a "chill rainy‑night" vibe song, recommend others in the same emotional cluster — even if they’re obscure or indie.

### 6) Output

Personalized playlists like:

- "Late Night Lo‑Fi Energy"
*- "Calm with Subtle Beats"

Each user or small community can get niche recommendations that major streaming algorithms might miss.

### 7) APIs Integrated for Real‑Time Recommendations

- Spotify Web API for tracks, artists, and audio features
- Optional: YouTube/Apple Music lookups for previews
- Real‑time inference via FastAPI endpoints (see `backend/app/routers`)

### 8) Downloadable Recommendations

- Export recommendations as CSV
- Generate a Spotify playlist link seeded with recommended tracks

### 9) Design Goals

- Innovative, cinematic UI transitions
- Animated loading states and music pulse effects (Framer Motion)
- Glassmorphism and gradient‑driven mood visuals (Tailwind)

### ✅ Example Outcome

You listen to "Cold/Mellow Indie Rock." The system identifies your current mood cluster → "Sad Calm Acoustic." Using association rules, it finds users who often switch from those songs to niche tracks by similar but lesser‑known artists. Your playlist then includes undiscovered tracks with matching emotional tones.
