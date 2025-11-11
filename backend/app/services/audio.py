import io
import numpy as np
import librosa


def extract_features_from_bytes(audio_bytes: bytes) -> dict:
    y, sr = librosa.load(io.BytesIO(audio_bytes), sr=None, mono=True)
    # Core features (keep lightweight for demo; extend in pipeline)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    rms = librosa.feature.rms(y=y).mean()
    zcr = librosa.feature.zero_crossing_rate(y=y).mean()
    spec_cent = librosa.feature.spectral_centroid(y=y, sr=sr).mean()
    # Normalize into [0,1] proxies for mood axes
    energy = float(np.tanh(rms * 10))
    valence = float(1 - np.tanh(spec_cent / 8000))
    danceability = float(np.clip(tempo / 200, 0, 1))
    return {
        "energy": energy,
        "valence": valence,
        "danceability": danceability,
        "tempo": float(tempo),
    }

