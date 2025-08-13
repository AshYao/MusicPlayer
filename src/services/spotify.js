/**
 * Spotify API サービス
 */
import authService from './auth.js';

export class SpotifyAPIService {
  constructor() {
    this.baseURL = 'https://api.spotify.com/v1';
  }

  /**
   * 認証付きAPIリクエストを実行
   */
  async makeAuthenticatedRequest(endpoint, options = {}) {
    let token = authService.getAccessToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    // トークンが期限切れの場合、リフレッシュを試行
    if (response.status === 401) {
      try {
        token = await authService.refreshAccessToken();
        const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
          ...options,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
        
        if (!retryResponse.ok) {
          throw new Error(`API request failed: ${retryResponse.status}`);
        }
        
        return await retryResponse.json();
      } catch (error) {
        authService.logout();
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * ユーザープロファイル取得
   */
  async getUserProfile() {
    return await this.makeAuthenticatedRequest('/me');
  }

  /**
   * ユーザーのプレイリスト取得
   */
  async getUserPlaylists(limit = 50, offset = 0) {
    return await this.makeAuthenticatedRequest(`/me/playlists?limit=${limit}&offset=${offset}`);
  }

  /**
   * プレイリストの楽曲取得
   */
  async getPlaylistTracks(playlistId, limit = 50, offset = 0) {
    return await this.makeAuthenticatedRequest(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`);
  }

  /**
   * ユーザーの保存済み楽曲取得
   */
  async getSavedTracks(limit = 50, offset = 0) {
    return await this.makeAuthenticatedRequest(`/me/tracks?limit=${limit}&offset=${offset}`);
  }

  /**
   * 楽曲を検索
   */
  async searchTracks(query, limit = 20) {
    const encodedQuery = encodeURIComponent(query);
    return await this.makeAuthenticatedRequest(`/search?q=${encodedQuery}&type=track&limit=${limit}`);
  }

  /**
   * 楽曲の詳細情報を取得
   */
  async getTrack(trackId) {
    return await this.makeAuthenticatedRequest(`/tracks/${trackId}`);
  }

  /**
   * 複数楽曲の詳細情報を取得
   */
  async getTracks(trackIds) {
    const ids = trackIds.join(',');
    return await this.makeAuthenticatedRequest(`/tracks?ids=${ids}`);
  }

  /**
   * アルバム情報を取得
   */
  async getAlbum(albumId) {
    return await this.makeAuthenticatedRequest(`/albums/${albumId}`);
  }

  /**
   * アーティスト情報を取得
   */
  async getArtist(artistId) {
    return await this.makeAuthenticatedRequest(`/artists/${artistId}`);
  }

  /**
   * 楽曲の音響分析データを取得
   */
  async getAudioFeatures(trackId) {
    return await this.makeAuthenticatedRequest(`/audio-features/${trackId}`);
  }
}

export default new SpotifyAPIService();