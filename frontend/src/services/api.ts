const API_BASE_URL = '/api'; // Use proxy for development

export interface SongPoint {
    id: string;
    title: string;
    artist: string;
    energy: number;
    valence: number;
    cluster?: number;
}

export interface Cluster {
    cluster: number;
    centroid: {
        energy: number;
        valence: number;
    };
    size: number;
}

export interface RecommendationResponse {
    items: Array<{
        song_id: string;
        title: string;
        score: number;
        energy?: number;
        valence?: number;
    }>;
}

export const api = {
    async generateMusic(energy: number, valence: number, preview: boolean = true): Promise<Blob> {
        // The vite proxy rewrites /api to remove it, so /api/music becomes /music
        // But backend route is /api/music, so we need to use /api/api/music or fix the proxy
        // Actually, let's use the direct backend URL for now
        const response = await fetch(
            `http://localhost:8000/api/music/generate/${energy}/${valence}?preview=${preview}`
        );
        if (!response.ok) {
            throw new Error('Failed to generate music');
        }
        return response.blob();
    },

    async getClusters() {
        const response = await fetch(`${API_BASE_URL}/get_mood_clusters`);
        if (!response.ok) throw new Error('Failed to fetch clusters');
        return response.json();
    },

    async getPlaylistByMood(params: {
        cluster?: number;
        e_min?: number;
        e_max?: number;
        v_min?: number;
        v_max?: number;
        k?: number;
    }) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) searchParams.append(key, value.toString());
        });
        
        const response = await fetch(`${API_BASE_URL}/get_playlist_by_mood?${searchParams}`);
        if (!response.ok) throw new Error('Failed to fetch playlist');
        return response.json();
    },

    async runClustering(k: number = 8) {
        const response = await fetch(`${API_BASE_URL}/cluster/run?k=${k}`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to run clustering');
        return response.json();
    }
};