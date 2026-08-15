/**
 * ==========================================================================
 * MUSIC STREAM RESOLVER — DIRECT AUDIO ENGINE
 * ==========================================================================
 */

export class MusicApiService {
  constructor() {
    this.cache = JSON.parse(localStorage.getItem('sensual_audio_cache') || '{}');
  }

  /**
   * Resolves exact commercial song audio stream and high-res album art
   */
  async resolveTrack(track) {
    const cacheKey = `${track.title} - ${track.artist}`.toLowerCase();
    
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const term = encodeURIComponent(`${track.artist} ${track.title}`);
      const response = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=1`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const item = data.results[0];
          const resolved = {
            audioUrl: item.previewUrl,
            artwork: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : null,
            durationSec: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 240,
            trackName: item.trackName || track.title,
            artistName: item.artistName || track.artist
          };

          this.cache[cacheKey] = resolved;
          try {
            localStorage.setItem('sensual_audio_cache', JSON.stringify(this.cache));
          } catch (e) {
            // LocalStorage quota safety
          }

          return resolved;
        }
      }
    } catch (error) {
      console.warn("Failed to fetch exact audio stream from CDN:", error);
    }

    return null;
  }
}
