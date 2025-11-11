const API_BASE_URL = 'http://localhost:8000';

export async function generateMusic(energy: number, valence: number, preview: boolean = true): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/music/generate/${energy}/${valence}?preview=${preview}`);
  
  if (!response.ok) {
    throw new Error('Failed to generate music');
  }
  
  return await response.blob();
}