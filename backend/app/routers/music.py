from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import io
from ..services.music_gen import MusicGenerator

router = APIRouter()
generator = MusicGenerator()

@router.get("/generate/{energy}/{valence}")
async def generate_music(
    energy: float, 
    valence: float, 
    preview: bool = True
):
    """Generate music based on mood parameters"""
    try:
        # Adjust token length based on preview mode
        max_tokens = 256 if preview else 512  # ~5s for preview, ~10s for full
        
        audio_bytes, duration = generator.generate_from_mood(
            energy, 
            valence,
            max_tokens=max_tokens
        )
        
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/wav",
            headers={
                "Content-Disposition": "attachment;filename=generated_music.wav",
                "X-Duration": str(duration),
                "X-Preview": str(preview).lower()
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))