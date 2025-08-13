<template>
  <div class="hello">
    <header>
      <h1>My Music Player</h1>
      <div class="header-controls">
        <div v-if="isSpotifyConnected" class="user-info">
          <span class="user-name">{{ userProfile?.display_name }}</span>
          <button class="logout-btn" @click="logout">ログアウト</button>
        </div>
        <div v-else class="auth-actions">
          <button class="login-btn" @click="goToLogin">Spotifyログイン</button>
        </div>
      </div>
    </header>
    <main>
      <section class="player">
        <h2 class="song-title">{{ current.title }} - <span>{{ current.artist }}</span></h2>
        <div class="controls">
          <button class="prev" @click="prev">Prev</button>
          <button class="play" v-if="!isPlaying" @click="play">Play</button>
          <button class="pause" v-else @click="pause">Pause</button>
          <button class="next" @click="next">Next</button>
        </div>
        <div class="timeAndProgress">
                                <div class="currentTimeContainer">
                                        <span class="currentTime">{{ currentTimeShow }}</span>
          <span class="totalTime"> {{ trackDurationShow }}</span>
                                </div>

                                <div class="currentProgressBar" ref="progress" @click="clickProgress">
                                        <div class="currentProgress" :style="{ width: currentProgressBar + '%' }"></div>
                                </div>

                        </div>
      </section>
      
      <!-- ライブラリ同期状態 -->
      <section v-if="isSpotifyConnected" class="sync-status">
        <div class="sync-info">
          <span class="sync-text">
            {{ syncStatus.inProgress ? '同期中...' : '同期完了' }}
          </span>
          <span class="track-count">
            ローカル: {{ syncStatus.localTracksCount }} | 
            Spotify: {{ syncStatus.spotifyTracksCount }} | 
            合計: {{ syncStatus.totalTracksCount }}
          </span>
          <button 
            class="sync-btn" 
            @click="syncLibrary" 
            :disabled="syncStatus.inProgress"
          >
            {{ syncStatus.inProgress ? '同期中...' : '再同期' }}
          </button>
        </div>
      </section>

      <!-- ライブラリフィルター -->
      <section class="library-controls">
        <div class="filter-tabs">
          <button 
            :class="['filter-tab', { active: activeFilter === 'all' }]"
            @click="setFilter('all')"
          >
            すべて ({{ getCombinedLibrary().length }})
          </button>
          <button 
            :class="['filter-tab', { active: activeFilter === 'local' }]"
            @click="setFilter('local')"
          >
            ローカル ({{ getFilteredTracks('local').length }})
          </button>
          <button 
            v-if="isSpotifyConnected"
            :class="['filter-tab', { active: activeFilter === 'spotify' }]"
            @click="setFilter('spotify')"
          >
            Spotify ({{ getFilteredTracks('spotify').length }})
          </button>
        </div>
        
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="楽曲を検索..."
            class="search-input"
          />
        </div>
      </section>

      <section class="playlist">
        <h3>ライブラリ</h3>
        <div v-if="filteredSongs.length === 0" class="empty-library">
          <p v-if="searchQuery">「{{ searchQuery }}」に一致する楽曲が見つかりませんでした</p>
          <p v-else-if="activeFilter === 'spotify' && !isSpotifyConnected">
            Spotifyにログインしてライブラリを表示
          </p>
          <p v-else>楽曲がありません</p>
        </div>
        <div v-else class="song-list">
          <button 
            v-for="song in filteredSongs" 
            :key="song.id || song.src" 
            @click="play(song)" 
            :class="getSongClass(song)"
            class="song-item"
          >
            <div class="song-info">
              <div class="song-title">{{ song.title }}</div>
              <div class="song-artist">{{ song.artist }}</div>
              <div v-if="song.album" class="song-album">{{ song.album }}</div>
            </div>
            <div class="song-meta">
              <span class="song-source" :class="song.source">
                {{ getSourceLabel(song.source) }}
              </span>
              <span v-if="song.duration_ms" class="song-duration">
                {{ formatDuration(song.duration_ms) }}
              </span>
            </div>
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import authService from '../services/auth.js';
import spotifyService from '../services/spotify.js';
import libraryService from '../services/library.js';

export default {
        name: "HelloWorld",
        data() {
                return {
                        current: {},
                        index: 0,
                        isPlaying: false,
                        currentTime: 0,
                        trackDuration: 266,
                        currentProgressBar: 0,
                        checkingCurrentPositionInTrack: "",
                        localSongs: [
                                {
                                        title: "GLAMOROUS SKY",
                                        artist: "中島美嘉",
                                        src: require("../assets/GLAMOROUSSKY.mp3"),
                                },
                                {
                                        title: "ORION",
                                        artist: "中島美嘉",
                                        src: require("../assets/ORION.mp3"),
                                },
                                {
                                        title: "雪の華",
                                        artist: "中島美嘉",
                                        src: require("../assets/雪の華.mp3"),
                                },
                        ],
                        player: new Audio(),
                        // Spotify関連
                        isSpotifyConnected: false,
                        userProfile: null,
                        syncStatus: {
                                inProgress: false,
                                localTracksCount: 0,
                                spotifyTracksCount: 0,
                                totalTracksCount: 0
                        },
                        // フィルタリング
                        activeFilter: 'all', // 'all', 'local', 'spotify'
                        searchQuery: '',
                        error: null
                };
        },
        methods: {
                timeFormat: (s) => {
                        const minutes = Math.floor(s / 60);
                        const seconds = Math.floor(s % 60);
                        return minutes + (seconds < 10 ? ":0" : ":") + seconds;
                },
                getTrackDuration: function () {
                        this.trackDuration = Math.round(this.player.duration);
                },
                getCurrentTimeEverySecond: function () {
                        this.checkingCurrentPositionInTrack = setTimeout(
                                (() => {
                                        this.currentTime = Math.round(this.player.currentTime);
                                        this.currentProgressBar =
                                                (this.player.currentTime / this.trackDuration) * 100;
                                        this.getCurrentTimeEverySecond();
                                }).bind(this),
                                1000,
                        );
                },
                playAudio: function () {
                        this.getCurrentTimeEverySecond();
                        this.player.play();
                        this.player.addEventListener("loadedmetadata", this.getTrackDuration);
                        this.player.addEventListener("ended", this.handleEnded);
                        this.isPlaying = true;
                },
                handleEnded: function () {
                        this.next();
                },
                play(song) {
                        if (song.source === 'local' && song.src) {
                                // ローカル楽曲の再生
                                this.current = song;
                                this.player.src = this.current.src;
                                this.playAudio();
                        } else if (song.source?.startsWith('spotify') && song.preview_url) {
                                // Spotify楽曲のプレビュー再生
                                this.current = song;
                                this.player.src = song.preview_url;
                                this.playAudio();
                        } else if (song.src) {
                                // 後方互換性のため
                                this.current = song;
                                this.player.src = this.current.src;
                                this.playAudio();
                        } else {
                                this.error = 'この楽曲は再生できません';
                        }
                },
                pause() {
                        this.player.pause();
                        this.isPlaying = false;
                },
                next() {
                        const songs = this.filteredSongs;
                        this.index++;
                        if (this.index > songs.length - 1) {
                                this.index = 0;
                        }
                        this.player.pause();
                        this.currentlyPlaying = false;
                        clearTimeout(this.checkingCurrentPositionInTrack);
                        this.player.currentTime = 0;
                        this.current = songs[this.index];
                        this.play(this.current);
                },
                prev() {
                        const songs = this.filteredSongs;
                        this.index--;
                        if (this.index < 0) {
                                this.index = songs.length - 1;
                        }
                        this.player.pause();
                        this.currentlyPlaying = false;
                        clearTimeout(this.checkingCurrentPositionInTrack);
                        this.player.currentTime = 0;
                        this.current = songs[this.index];
                        this.play(this.current);
                },
                clickProgress: function (event) {
                        if (this.isPlaying === true) {
                                this.pause();
                        }
                        this.updateBar(event.pageX);
                },
                updateBar: function (x) {
                        const progress = this.$refs.progress;
                        const maxduration = this.player.duration;
                        const position = x - progress.getBoundingClientRect().left;
                        let percentage = (100 * position) / progress.offsetWidth;
                        if (percentage > 100) {
                                percentage = 100;
                        }
                        if (percentage < 0) {
                                percentage = 0;
                        }
                        this.player.currentTime = Math.round((maxduration * percentage) / 100);
                        this.currentTime = this.player.currentTime;
                        this.currentProgressBar = (this.currentTime / this.trackDuration) * 100;
                        this.playAudio();
                },
                
                // Spotify関連メソッド
                async initializeSpotify() {
                        this.isSpotifyConnected = authService.isLoggedIn();
                        
                        if (this.isSpotifyConnected) {
                                try {
                                        this.userProfile = await spotifyService.getUserProfile();
                                        await this.syncLibrary();
                                } catch (error) {
                                        console.error('Spotify initialization failed:', error);
                                        this.error = 'Spotify初期化でエラーが発生しました';
                                        authService.logout();
                                        this.isSpotifyConnected = false;
                                }
                        }
                },
                
                async syncLibrary() {
                        if (!this.isSpotifyConnected) return;
                        
                        try {
                                // ローカル楽曲をライブラリサービスに設定
                                libraryService.setLocalTracks(this.localSongs);
                                
                                // Spotifyライブラリを同期
                                await libraryService.syncSpotifyLibrary();
                                
                                this.updateSyncStatus();
                        } catch (error) {
                                console.error('Library sync failed:', error);
                                this.error = 'ライブラリ同期でエラーが発生しました';
                        }
                },
                
                updateSyncStatus() {
                        this.syncStatus = libraryService.getSyncStatus();
                },
                
                logout() {
                        authService.logout();
                        this.isSpotifyConnected = false;
                        this.userProfile = null;
                        this.syncStatus = {
                                inProgress: false,
                                localTracksCount: 0,
                                spotifyTracksCount: 0,
                                totalTracksCount: 0
                        };
                        this.activeFilter = 'local';
                },
                
                goToLogin() {
                        this.$router.push('/');
                },
                
                // フィルタリング関連メソッド
                setFilter(filter) {
                        this.activeFilter = filter;
                        this.searchQuery = '';
                },
                
                getCombinedLibrary() {
                        return libraryService.getCombinedLibrary();
                },
                
                getFilteredTracks(source) {
                        if (source === 'local') {
                                return libraryService.getTracksBySource('local');
                        } else if (source === 'spotify') {
                                const spotifyTracks = libraryService.getTracksBySource('spotify-saved');
                                const playlistTracks = libraryService.getTracksBySource('spotify-playlist');
                                return [...spotifyTracks, ...playlistTracks];
                        }
                        return [];
                },
                
                getSongClass(song) {
                        const isCurrentSong = this.current.id === song.id || this.current.src === song.src;
                        return isCurrentSong ? 'song playing' : 'song';
                },
                
                getSourceLabel(source) {
                        if (source === 'local') return 'ローカル';
                        if (source === 'spotify-saved') return 'お気に入り';
                        if (source === 'spotify-playlist') return 'プレイリスト';
                        return source;
                },
                
                formatDuration(durationMs) {
                        const minutes = Math.floor(durationMs / 60000);
                        const seconds = Math.floor((durationMs % 60000) / 1000);
                        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                },
        },
        async created() {
                // ローカル楽曲をライブラリサービスに初期設定
                libraryService.setLocalTracks(this.localSongs);
                this.updateSyncStatus();
                
                // 初期楽曲を設定
                if (this.localSongs.length > 0) {
                        this.current = this.localSongs[this.index];
                        this.player.src = this.current.src;
                }
                
                // Spotify初期化
                await this.initializeSpotify();
        },
        computed: {
                currentTimeShow() {
                        return this.timeFormat(this.currentTime);
                },
                trackDurationShow() {
                        return this.timeFormat(this.trackDuration);
                },
                filteredSongs() {
                        let songs = [];
                        
                        if (this.activeFilter === 'all') {
                                songs = this.getCombinedLibrary();
                        } else if (this.activeFilter === 'local') {
                                songs = this.getFilteredTracks('local');
                        } else if (this.activeFilter === 'spotify') {
                                songs = this.getFilteredTracks('spotify');
                        }
                        
                        if (this.searchQuery.trim()) {
                                const query = this.searchQuery.toLowerCase();
                                songs = songs.filter(song => 
                                        song.title.toLowerCase().includes(query) ||
                                        song.artist.toLowerCase().includes(query) ||
                                        (song.album && song.album.toLowerCase().includes(query))
                                );
                        }
                        
                        return songs;
                },
        },
        beforeUnmount: function () {
                this.player.removeEventListener("ended", this.handleEnded);
                this.player.removeEventListener("loadedmetadata", this.getTrackDuration);
                clearTimeout(this.checkingCurrentPositionInTrack);
        },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
* {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
}
body {
        font-family: sans-serif;
}
header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 25px;
        background-color: #0C4842;
        color: #FFF;
}

.header-controls {
        display: flex;
        align-items: center;
        gap: 15px;
}

.user-info {
        display: flex;
        align-items: center;
        gap: 10px;
}

.user-name {
        font-size: 14px;
        color: #CCC;
}

.logout-btn, .login-btn {
        padding: 8px 15px;
        font-size: 12px;
        font-weight: 600;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
}

.logout-btn {
        background-color: rgba(255, 255, 255, 0.2);
        color: #FFF;
}

.logout-btn:hover {
        background-color: rgba(255, 255, 255, 0.3);
}

.login-btn {
        background-color: #1DB954;
        color: #FFF;
}

.login-btn:hover {
        background-color: #1ed760;
}
main {
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  padding: 25px;
}

.song-title {
  color: #53565A;
  font-size: 32px;
  font-weight: 700;
  text-transform: uppercase;
  text-align: center;
}
.song-title span {
  color: #53565A;
  font-weight: 400;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px 15px;
}

button {
  appearance: none;
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
}
button:hover {
  opacity: 0.8;
}

.play, .pause {
  font-size: 20px;
  font-weight: 700;
  padding: 15px 25px;
  margin: 0px 15px;
  border-radius: 8px;
  color: #FFF;
  background-color: #376B6D;
}

.next, .prev {
  font-size: 16px;
  font-weight: 700;
  padding: 10px 20px;
  margin: 0px 15px;
  border-radius: 6px;
  color: #FFF;
  background-color: #78C2C4;
}

.timeAndProgress .currentTimeContainer{
  width: 100%;
  height: 1rem;
  display: flex;
  justify-content: space-between;
}

.currentProgressBar{
  width: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  margin: 0.75rem 0;
  cursor: pointer;
}
.currentProgressBar .currentProgress{
  background-color: #376B6D;
  width: 0px;
  height: 6px;
  transition: 100ms;
  cursor: pointer;
}

.playlist {
  padding: 50px 30px;
}
.playlist h3 {
  color: #0089A7;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 20px;
  text-align: center;
}
.playlist .song {
  display: block;
  width: 100%;
  padding: 15px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
}
.playlist .song:hover {
  color: #FF5858;
}

.playlist .song.playing {
  color: #FFF;
  background-image: linear-gradient(to right, #0089A7, #78C2C4);
}

/* 同期状態セクション */
.sync-status {
  padding: 20px 30px;
  background-color: rgba(0, 137, 167, 0.1);
  border-radius: 10px;
  margin: 20px 0;
}

.sync-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
  justify-content: space-between;
}

.sync-text {
  font-weight: 600;
  color: #0089A7;
}

.track-count {
  font-size: 14px;
  color: #666;
}

.sync-btn {
  padding: 8px 15px;
  background-color: #78C2C4;
  color: #FFF;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.3s ease;
}

.sync-btn:hover:not(:disabled) {
  background-color: #376B6D;
}

.sync-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ライブラリコントロール */
.library-controls {
  padding: 20px 0;
  margin: 20px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 10px 20px;
  background-color: #f8f9fa;
  color: #666;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  background-color: #e9ecef;
}

.filter-tab.active {
  background-color: #0089A7;
  color: #FFF;
}

.search-box {
  display: flex;
  justify-content: center;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 12px 20px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 25px;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: #0089A7;
}

/* 空のライブラリ表示 */
.empty-library {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* 楽曲リスト */
.song-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.song-item:hover {
  background-color: rgba(0, 137, 167, 0.1);
  transform: translateX(5px);
}

.song-item.playing {
  background-image: linear-gradient(to right, #0089A7, #78C2C4);
  color: #FFF;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 14px;
  color: #666;
  margin-bottom: 2px;
}

.song-item.playing .song-artist {
  color: rgba(255, 255, 255, 0.9);
}

.song-album {
  font-size: 12px;
  color: #999;
}

.song-item.playing .song-album {
  color: rgba(255, 255, 255, 0.7);
}

.song-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.song-source {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.song-source.local {
  background-color: rgba(55, 107, 109, 0.2);
  color: #376B6D;
}

.song-source.spotify-saved {
  background-color: rgba(29, 185, 84, 0.2);
  color: #1DB954;
}

.song-source.spotify-playlist {
  background-color: rgba(120, 194, 196, 0.2);
  color: #78C2C4;
}

.song-item.playing .song-source {
  background-color: rgba(255, 255, 255, 0.3);
  color: #FFF;
}

.song-duration {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.song-item.playing .song-duration {
  color: rgba(255, 255, 255, 0.9);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .filter-tabs {
    flex-wrap: wrap;
  }
  
  .filter-tab {
    flex: 1;
    min-width: auto;
  }
  
  .sync-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .song-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .song-meta {
    align-self: stretch;
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>

