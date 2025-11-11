import io
import torch
import torchaudio
from transformers import AutoProcessor, MusicgenForConditionalGeneration
import scipy.io.wavfile
import numpy as np
from typing import Tuple
import logging
import random

class MusicGenerator:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logging.info(f"Using device: {self.device}")
        
        # Load model and processor
        self.processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
        self.model = MusicgenForConditionalGeneration.from_pretrained(
            "facebook/musicgen-small",
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
        ).to(self.device)
        
        # Default generation parameters
        self.model.generation_config.max_new_tokens = 256  # About 5 seconds for preview
        
    def generate_from_mood(
        self, 
        energy: float, 
        valence: float,
        max_tokens: int = 256
    ) -> Tuple[bytes, float]:
        """Generate music based on mood parameters"""
        
        # Map energy and valence to text prompts and music style
        mood_prompt, style = self._map_mood_to_text(energy, valence)
        
        prompt = f"{mood_prompt}. {style} music with clear melody and rhythm."
        
        # Update generation config for this run
        self.model.generation_config.max_new_tokens = max_tokens
        
        inputs = self.processor(
            text=[prompt],
            padding=True,
            return_tensors="pt",
        ).to(self.device)
        
        # Generate audio based on mode (preview/full)
        # Add variation using random seed based on energy/valence to ensure different songs
        seed = int((energy * 1000 + valence * 2000) % 2**32)
        # Set random seed for reproducibility and variation
        torch.manual_seed(seed)
        if self.device == "cuda":
            torch.cuda.manual_seed(seed)
        
        # Generate audio - MusicGen doesn't accept generator parameter directly
        audio_values = self.model.generate(**inputs, max_new_tokens=max_tokens)
        
        # Convert to audio file bytes
        sampling_rate = self.model.config.audio_encoder.sampling_rate
        audio_data = audio_values[0].cpu().numpy()
        
        # Ensure audio_data is 1D (flatten if needed)
        if len(audio_data.shape) > 1:
            audio_data = audio_data.flatten()
        
        # Normalize audio - ensure it's loud and clear
        max_val = np.max(np.abs(audio_data))
        if max_val > 0:
            # Normalize to 90% to avoid clipping
            audio_data = audio_data / max_val * 0.9
        
        # Convert to int16 format for WAV
        audio_data = (audio_data * 32767).astype(np.int16)
        
        # Ensure it's 1D array
        if len(audio_data.shape) > 1:
            audio_data = audio_data.squeeze()
        
        # Convert to bytes
        buffer = io.BytesIO()
        scipy.io.wavfile.write(buffer, int(sampling_rate), audio_data)
        
        return buffer.getvalue(), len(audio_data) / sampling_rate
        
    def _map_mood_to_text(self, energy: float, valence: float) -> Tuple[str, str]:
        """Map numerical mood parameters to descriptive text prompt and style"""
        
        # Mood mapping based on valence (happiness) level
        mood_desc = ""
        if valence < 0.33:
            mood_desc = "melancholic and emotional"
        elif valence < 0.66:
            mood_desc = "contemplative and balanced"
        else:
            mood_desc = "uplifting and joyful"
            
        # Style mapping based on energy level
        style = ""
        if energy < 0.33:
            style = "Ambient electronic" if valence < 0.5 else "Soft piano"
        elif energy < 0.66:
            style = "Melodic synthesizer" if valence < 0.5 else "Modern classical"
        else:
            style = "Electronic dance" if valence < 0.5 else "Upbeat pop"
            
        logging.info(f"Mapped mood: energy={energy}, valence={valence} -> {mood_desc}, {style}")
        return mood_desc, style