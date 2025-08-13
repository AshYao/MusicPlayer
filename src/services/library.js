/**
 * ライブラリ同期サービス
 */
import spotifyService from './spotify.js';

export class LibrarySyncService {
  constructor() {
    this.localTracks = [];
    this.spotifyTracks = [];
    this.syncInProgress = false;
  }

  /**
   * ローカルライブラリの楽曲を設定
   */
  setLocalTracks(tracks) {
    this.localTracks = tracks.map(track => ({
      ...track,
      source: 'local',
      id: this.generateLocalId(track)
    }));
  }

  /**
   * Spotifyライブラリを同期
   */
  async syncSpotifyLibrary() {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    
    try {
      const spotifyTracks = [];
      
      // 保存済み楽曲を取得
      const savedTracks = await this.getAllSavedTracks();
      spotifyTracks.push(...savedTracks);

      // プレイリストから楽曲を取得
      const playlistTracks = await this.getAllPlaylistTracks();
      spotifyTracks.push(...playlistTracks);

      // 重複を除去
      this.spotifyTracks = this.deduplicateTracks(spotifyTracks);
      
      return this.spotifyTracks;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * 全ての保存済み楽曲を取得
   */
  async getAllSavedTracks() {
    const tracks = [];
    let offset = 0;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      const response = await spotifyService.getSavedTracks(limit, offset);
      const items = response.items.map(item => ({
        ...this.normalizeSpotifyTrack(item.track),
        source: 'spotify-saved',
        added_at: item.added_at
      }));
      
      tracks.push(...items);
      offset += limit;
      hasMore = response.next !== null;
    }

    return tracks;
  }

  /**
   * 全てのプレイリスト楽曲を取得
   */
  async getAllPlaylistTracks() {
    const tracks = [];
    const playlists = await this.getAllPlaylists();

    for (const playlist of playlists) {
      const playlistTracks = await this.getPlaylistTracks(playlist.id);
      const normalizedTracks = playlistTracks.map(item => ({
        ...this.normalizeSpotifyTrack(item.track),
        source: 'spotify-playlist',
        playlist_id: playlist.id,
        playlist_name: playlist.name,
        added_at: item.added_at
      }));
      
      tracks.push(...normalizedTracks);
    }

    return tracks;
  }

  /**
   * 全てのプレイリストを取得
   */
  async getAllPlaylists() {
    const playlists = [];
    let offset = 0;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      const response = await spotifyService.getUserPlaylists(limit, offset);
      playlists.push(...response.items);
      offset += limit;
      hasMore = response.next !== null;
    }

    return playlists;
  }

  /**
   * プレイリストの楽曲を取得
   */
  async getPlaylistTracks(playlistId) {
    const tracks = [];
    let offset = 0;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      const response = await spotifyService.getPlaylistTracks(playlistId, limit, offset);
      const validTracks = response.items.filter(item => item.track && !item.track.is_local);
      tracks.push(...validTracks);
      offset += limit;
      hasMore = response.next !== null;
    }

    return tracks;
  }

  /**
   * Spotify楽曲データを正規化
   */
  normalizeSpotifyTrack(track) {
    if (!track) return null;
    
    return {
      id: track.id,
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      duration_ms: track.duration_ms,
      preview_url: track.preview_url,
      external_urls: track.external_urls,
      images: track.album.images,
      popularity: track.popularity,
      explicit: track.explicit,
      spotify_uri: track.uri
    };
  }

  /**
   * 楽曲の重複を除去
   */
  deduplicateTracks(tracks) {
    const seen = new Set();
    return tracks.filter(track => {
      if (!track || !track.id) return false;
      
      if (seen.has(track.id)) {
        return false;
      }
      
      seen.add(track.id);
      return true;
    });
  }

  /**
   * 統合ライブラリを取得
   */
  getCombinedLibrary() {
    return [...this.localTracks, ...this.spotifyTracks];
  }

  /**
   * 楽曲を検索
   */
  searchTracks(query) {
    const combined = this.getCombinedLibrary();
    const lowercaseQuery = query.toLowerCase();
    
    return combined.filter(track => 
      track.title.toLowerCase().includes(lowercaseQuery) ||
      track.artist.toLowerCase().includes(lowercaseQuery) ||
      (track.album && track.album.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * ソース別楽曲を取得
   */
  getTracksBySource(source) {
    const combined = this.getCombinedLibrary();
    return combined.filter(track => track.source === source);
  }

  /**
   * ローカルIDを生成
   */
  generateLocalId(track) {
    return `local-${btoa(track.title + track.artist).replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  /**
   * 同期状態を取得
   */
  getSyncStatus() {
    return {
      inProgress: this.syncInProgress,
      localTracksCount: this.localTracks.length,
      spotifyTracksCount: this.spotifyTracks.length,
      totalTracksCount: this.getCombinedLibrary().length
    };
  }
}

export default new LibrarySyncService();