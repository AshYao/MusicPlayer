# My Music Player

外部音楽認可サービス（Spotify）と連携し、ライブラリ同期機能を搭載した音楽プレイヤーです。

## 主な機能

- 🎵 **ローカル音楽ファイルの再生**: MP3ファイルをローカルから再生
- 🎧 **Spotify連携**: OAuth 2.0でSpotifyアカウントと連携
- 📚 **ライブラリ同期**: Spotifyの保存済み楽曲とプレイリストを同期
- 🔍 **楽曲検索**: 統合されたライブラリから楽曲を検索
- 🎛️ **フィルタリング**: ローカル/Spotify/全ての楽曲を切り替え表示
- 🎨 **レスポンシブデザイン**: モバイルとデスクトップ両対応

## Software Demo
![img](https://github.com/AshYao/MusicPlayer/blob/master/public/screenshot2.gif)

## Spotify連携設定

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)でアプリケーションを作成
2. `.env`ファイルを作成し、以下の情報を設定:
   ```
   VUE_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   VUE_APP_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
   VUE_APP_SPOTIFY_REDIRECT_URI=http://localhost:8080/#/callback
   ```
3. SpotifyアプリケーションのRedirect URIsに上記のURIを追加

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```