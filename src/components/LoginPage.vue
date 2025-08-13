<template>
  <div class="login-page">
    <header>
      <h1>Music Player - ログイン</h1>
    </header>
    <main class="login-main">
      <div class="login-container">
        <div class="login-card">
          <h2>Spotifyと連携</h2>
          <p class="login-description">
            Spotifyアカウントでログインして、あなたのライブラリと同期しましょう
          </p>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <div class="login-actions">
            <button 
              class="spotify-login-btn" 
              @click="loginWithSpotify"
              :disabled="loading"
            >
              <span v-if="loading">ログイン中...</span>
              <span v-else>
                <svg class="spotify-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#1DB954" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.49.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Spotifyでログイン
              </span>
            </button>
            
            <button 
              class="local-continue-btn" 
              @click="continueWithLocal"
            >
              ローカルライブラリで続行
            </button>
          </div>
          
          <div class="features">
            <h3>Spotify連携の特徴</h3>
            <ul>
              <li>あなたの保存済み楽曲にアクセス</li>
              <li>プレイリストの同期</li>
              <li>楽曲の検索とブラウジング</li>
              <li>プレビュー再生</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import authService from '../services/auth.js';

export default {
  name: 'LoginPage',
  data() {
    return {
      loading: false,
      error: null
    };
  },
  methods: {
    async loginWithSpotify() {
      try {
        this.loading = true;
        this.error = null;
        
        // Spotify認証URLにリダイレクト
        const authUrl = authService.getAuthUrl();
        window.location.href = authUrl;
      } catch (error) {
        this.error = 'Spotifyログインでエラーが発生しました: ' + error.message;
        this.loading = false;
      }
    },
    
    continueWithLocal() {
      // ローカルライブラリのみでメインページに移動
      this.$router.push('/player');
    }
  },
  
  async mounted() {
    // URLパラメータから認証コードをチェック
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if (error) {
      this.error = 'Spotify認証がキャンセルされました';
      return;
    }
    
    if (code && state) {
      try {
        this.loading = true;
        await authService.exchangeCodeForToken(code, state);
        
        // 認証成功後、メインページに移動
        this.$router.push('/player');
      } catch (error) {
        this.error = '認証処理でエラーが発生しました: ' + error.message;
        this.loading = false;
      }
    }
    
    // 既にログイン済みの場合はメインページに移動
    if (authService.isLoggedIn()) {
      this.$router.push('/player');
    }
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: rgba(12, 72, 66, 0.9);
  color: #FFF;
  backdrop-filter: blur(10px);
}

.login-main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 500px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  text-align: center;
}

.login-card h2 {
  color: #2c3e50;
  font-size: 28px;
  margin-bottom: 10px;
  font-weight: 700;
}

.login-description {
  color: #666;
  font-size: 16px;
  margin-bottom: 30px;
  line-height: 1.5;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #fcc;
}

.login-actions {
  margin-bottom: 30px;
}

.spotify-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 15px 25px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background-color: #1DB954;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 15px;
}

.spotify-login-btn:hover:not(:disabled) {
  background-color: #1ed760;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(29, 185, 84, 0.3);
}

.spotify-login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spotify-icon {
  flex-shrink: 0;
}

.local-continue-btn {
  width: 100%;
  padding: 12px 25px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  background-color: transparent;
  border: 2px solid #ddd;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.local-continue-btn:hover {
  color: #2c3e50;
  border-color: #2c3e50;
  transform: translateY(-1px);
}

.features {
  text-align: left;
  background-color: rgba(0, 137, 167, 0.1);
  border-radius: 15px;
  padding: 25px;
}

.features h3 {
  color: #0089A7;
  font-size: 18px;
  margin-bottom: 15px;
  text-align: center;
}

.features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features li {
  color: #555;
  padding: 5px 0;
  position: relative;
  padding-left: 20px;
}

.features li::before {
  content: "✓";
  color: #1DB954;
  font-weight: bold;
  position: absolute;
  left: 0;
}
</style>