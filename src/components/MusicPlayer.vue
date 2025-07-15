<template>
  <div class="hello">
    <header>
      <h1>My Music Player</h1>
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
      <section class="playlist">
        <h3>The Playlist</h3>
        <button v-for="song in songs" :key="song.src" @click="play(song)" :class="(song.src == current.src) ? 'song playing' : 'song'">
          {{ song.title }} - {{ song.artist }}
        </button>
      </section>
    </main>
  </div>
</template>

<script>
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
                        songs: [
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
                        if (typeof song.src !== "undefined") {
                                this.current = song;
                                this.player.src = this.current.src;
                        }
                        this.playAudio();
                },
                pause() {
                        this.player.pause();
                        this.isPlaying = false;
                },
                next() {
                        this.index++;
                        if (this.index > this.songs.length - 1) {
                                this.index = 0;
                        }
                        this.player.pause();
                        this.currentlyPlaying = false;
                        clearTimeout(this.checkingCurrentPositionInTrack);
                        this.player.currentTime = 0;
                        this.current = this.songs[this.index];
                        this.play(this.current);
                },
                prev() {
                        this.index--;
                        if (this.index < 0) {
                                this.index = this.songs.length - 1;
                        }
                        this.player.pause();
                        this.currentlyPlaying = false;
                        clearTimeout(this.checkingCurrentPositionInTrack);
                        this.player.currentTime = 0;
                        this.current = this.songs[this.index];
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
        },
        created() {
                this.current = this.songs[this.index];
                this.player.src = this.current.src;
        },
        computed: {
                currentTimeShow() {
                        return this.timeFormat(this.currentTime);
                },
                trackDurationShow() {
                        return this.timeFormat(this.trackDuration);
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
        justify-content: center;
        align-items: center;
        padding: 15px;
        background-color: #0C4842;
        color: #FFF;
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
</style>

