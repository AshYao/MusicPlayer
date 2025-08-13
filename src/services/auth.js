/**
 * Spotify 認証サービス
 */
export class SpotifyAuthService {
  constructor() {
    this.clientId = process.env.VUE_APP_SPOTIFY_CLIENT_ID;
    this.redirectUri = process.env.VUE_APP_SPOTIFY_REDIRECT_URI || window.location.origin + '/callback';
    this.scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-library-read',
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state'
    ];
  }

  /**
   * Spotify認証URLを生成
   */
  getAuthUrl() {
    const state = this.generateRandomString(16);
    localStorage.setItem('spotify_auth_state', state);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: this.scopes.join(' '),
      redirect_uri: this.redirectUri,
      state: state
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * 認証コードからアクセストークンを取得
   */
  async exchangeCodeForToken(code, state) {
    const storedState = localStorage.getItem('spotify_auth_state');
    if (!storedState || state !== storedState) {
      throw new Error('State mismatch');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: process.env.VUE_APP_SPOTIFY_CLIENT_SECRET
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error_description || 'Token exchange failed');
    }

    // トークンをlocalStorageに保存
    localStorage.setItem('spotify_access_token', data.access_token);
    localStorage.setItem('spotify_refresh_token', data.refresh_token);
    localStorage.setItem('spotify_token_expires', Date.now() + data.expires_in * 1000);
    localStorage.removeItem('spotify_auth_state');

    return data;
  }

  /**
   * アクセストークンを取得
   */
  getAccessToken() {
    const token = localStorage.getItem('spotify_access_token');
    const expires = localStorage.getItem('spotify_token_expires');
    
    if (!token || !expires || Date.now() >= parseInt(expires)) {
      return null;
    }
    
    return token;
  }

  /**
   * リフレッシュトークンでアクセストークンを更新
   */
  async refreshAccessToken() {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error_description || 'Token refresh failed');
    }

    localStorage.setItem('spotify_access_token', data.access_token);
    localStorage.setItem('spotify_token_expires', Date.now() + data.expires_in * 1000);
    
    if (data.refresh_token) {
      localStorage.setItem('spotify_refresh_token', data.refresh_token);
    }

    return data.access_token;
  }

  /**
   * ログアウト
   */
  logout() {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expires');
    localStorage.removeItem('spotify_auth_state');
  }

  /**
   * ログイン状態を確認
   */
  isLoggedIn() {
    return this.getAccessToken() !== null;
  }

  /**
   * ランダム文字列を生成
   */
  generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
  }
}

export default new SpotifyAuthService();