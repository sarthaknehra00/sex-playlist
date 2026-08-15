/**
 * ==========================================================================
 * SENSUAL RHYTHM PLAYER — 150 LOCAL MASTER SONGS WITH LANGUAGE FILTER
 * ==========================================================================
 */

import { FULL_PLAYLIST } from './playlist.js';

class SensualPlayer {
  constructor() {
    this.currentMode = 'all'; // 'all' | 'en' (No Hindi) | 'hi' (Only Hindi)
    this.masterList = [...FULL_PLAYLIST];
    this.playlist = this.shuffleArray([...this.masterList]);
    this.currentTrackIndex = 0;
    this.isPlaying = false;

    // DOM Elements
    this.audio = document.getElementById('audio-engine');
    this.clockEl = document.getElementById('clock');
    this.trackTitleEl = document.getElementById('track-title');
    this.trackArtistEl = document.getElementById('track-artist');
    this.coverEl = document.getElementById('music-cover');
    this.coverImgEl = document.getElementById('cover-img');
    this.btnPlay = document.getElementById('btn-play');
    this.btnPrev = document.getElementById('btn-prev');
    this.btnNext = document.getElementById('btn-next');
    this.btnShuffle = document.getElementById('btn-shuffle');
    this.btnTopPlay = document.getElementById('btn-top-play');
    this.timeCurEl = document.getElementById('time-cur');
    this.timeDurEl = document.getElementById('time-dur');
    this.seekRail = document.getElementById('seek-rail');
    this.seekFill = document.getElementById('seek-fill');
    this.seekKnob = document.getElementById('seek-knob');

    this.initSecurityAndInteractions();
    this.initFullscreen();
    this.initLanguageFilter();
    this.initClock();
    this.initAudioEvents();
    this.initUIEvents();
    this.loadTrack(0, false);
  }

  // Fisher-Yates Random Shuffler
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Language Filter (All / No Hindi / Only Hindi)
  initLanguageFilter() {
    const buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-lang');
        if (mode === this.currentMode) return;

        this.currentMode = mode;
        buttons.forEach((b) => b.classList.toggle('is-active', b === btn));

        // Filter songs
        let filtered = [];
        if (mode === 'all') {
          filtered = [...this.masterList];
        } else if (mode === 'en') {
          // No Hindi
          filtered = this.masterList.filter((item) => item.lang === 'en');
        } else if (mode === 'hi') {
          // Only Hindi
          filtered = this.masterList.filter((item) => item.lang === 'hi');
        }

        this.playlist = this.shuffleArray(filtered);
        this.loadTrack(0, this.isPlaying);
      });
    });
  }

  // Disable Right Click & Zoom
  initSecurityAndInteractions() {
    // 1. Disable Right Click Context Menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // 2. Disable Ctrl + Mouse Wheel Zoom
    window.addEventListener('wheel', (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    }, { passive: false });

    // 3. Disable Keyboard Zoom Shortcuts (Ctrl + / -, Ctrl 0)
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && (
        e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0' ||
        e.code === 'NumpadAdd' || e.code === 'NumpadSubtract'
      )) {
        e.preventDefault();
      }
    });

    // 4. Disable Gesture Zoom on Touch Devices
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());
  }

  // Fullscreen Management
  initFullscreen() {
    const btn = document.getElementById('btn-fullscreen');
    const icon = document.getElementById('icon-fullscreen');

    const toggle = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn("Fullscreen request error:", err);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch((err) => {
            console.warn("Exit fullscreen error:", err);
          });
        }
      }
    };

    if (btn) btn.addEventListener('click', toggle);

    // Keyboard shortcut 'F' for Fullscreen
    window.addEventListener('keydown', (e) => {
      if (e.key === 'f' || e.key === 'F') {
        if (e.target.tagName !== 'INPUT') {
          e.preventDefault();
          toggle();
        }
      }
    });

    // Update icon when fullscreen state changes
    document.addEventListener('fullscreenchange', () => {
      if (!icon || !btn) return;
      if (document.fullscreenElement) {
        icon.innerHTML = `<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-14v3h3v2h-5V5h2z"></path>`;
        btn.title = "Exit Fullscreen (F)";
      } else {
        icon.innerHTML = `<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path>`;
        btn.title = "Toggle Fullscreen (F)";
      }
    });
  }

  // Live System Clock with Seconds in Top-Left
  initClock() {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      if (this.clockEl) {
        this.clockEl.textContent = `${hours}:${mins}:${secs} ${ampm}`;
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  getCurrentTrack() {
    return this.playlist[this.currentTrackIndex];
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  loadTrack(index, autoPlay = true) {
    if (!this.playlist.length) return;
    this.currentTrackIndex = (index + this.playlist.length) % this.playlist.length;
    const track = this.getCurrentTrack();

    // Update Text Metadata
    if (this.trackTitleEl) this.trackTitleEl.textContent = track.title;
    if (this.trackArtistEl) this.trackArtistEl.textContent = track.artist;
    if (this.timeCurEl) this.timeCurEl.textContent = "0:00";
    if (this.seekFill) this.seekFill.style.width = "0%";
    if (this.seekKnob) this.seekKnob.style.left = "0%";

    // Display Official Album Cover on Spinning Vinyl Disc
    if (this.coverImgEl) {
      this.coverImgEl.src = track.artwork || 'background.jpg';
    }

    // Set Audio Source to Local Full MP3
    this.audio.src = track.file;

    if (autoPlay || this.isPlaying) {
      this.play();
    }
  }

  play() {
    if (!this.audio.src) {
      this.loadTrack(this.currentTrackIndex, true);
      return;
    }

    this.audio.play().then(() => {
      this.isPlaying = true;
      this.setPlayingUI(true);
    }).catch((err) => {
      console.warn("Audio playback awaiting user interaction:", err);
    });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.setPlayingUI(false);
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setPlayingUI(playing) {
    document.body.classList.toggle('is-playing', playing);
    if (playing) {
      if (this.coverEl) this.coverEl.classList.add('is-spinning');
      if (this.btnPlay) {
        this.btnPlay.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"></path>
          </svg>
        `;
      }
    } else {
      if (this.coverEl) this.coverEl.classList.remove('is-spinning');
      if (this.btnPlay) {
        this.btnPlay.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z"></path>
          </svg>
        `;
      }
    }
  }

  seek(percent) {
    if (this.audio.duration) {
      const targetTime = percent * this.audio.duration;
      this.audio.currentTime = targetTime;
      this.updateProgress();
    }
  }

  updateProgress() {
    const cur = this.audio.currentTime || 0;
    const dur = this.audio.duration || 1;

    if (this.timeCurEl) this.timeCurEl.textContent = this.formatTime(cur);
    if (this.timeDurEl && !isNaN(this.audio.duration)) {
      this.timeDurEl.textContent = this.formatTime(dur);
    }

    const percent = Math.min(100, Math.max(0, (cur / dur) * 100));
    if (this.seekFill) this.seekFill.style.width = `${percent}%`;
    if (this.seekKnob) this.seekKnob.style.left = `${percent}%`;
  }

  nextTrack() {
    this.loadTrack(this.currentTrackIndex + 1, true);
  }

  prevTrack() {
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }
    this.loadTrack(this.currentTrackIndex - 1, true);
  }

  shuffle() {
    const randomIndex = Math.floor(Math.random() * this.playlist.length);
    this.loadTrack(randomIndex, true);
  }

  initAudioEvents() {
    if (!this.audio) return;

    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('loadedmetadata', () => {
      if (this.timeDurEl && !isNaN(this.audio.duration)) {
        this.timeDurEl.textContent = this.formatTime(this.audio.duration);
      }
    });
    this.audio.addEventListener('ended', () => this.nextTrack());
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.setPlayingUI(true);
    });
    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.setPlayingUI(false);
    });
  }

  initUIEvents() {
    if (this.btnPlay) this.btnPlay.addEventListener('click', () => this.togglePlay());
    if (this.btnTopPlay) this.btnTopPlay.addEventListener('click', () => this.togglePlay());
    if (this.coverEl) this.coverEl.addEventListener('click', () => this.togglePlay());
    if (this.btnNext) this.btnNext.addEventListener('click', () => this.nextTrack());
    if (this.btnPrev) this.btnPrev.addEventListener('click', () => this.prevTrack());
    if (this.btnShuffle) this.btnShuffle.addEventListener('click', () => this.shuffle());

    // Scrubber Dragging
    let isDragging = false;
    const handleScrub = (e) => {
      const rect = this.seekRail.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.seek(pos);
    };

    if (this.seekRail) {
      this.seekRail.addEventListener('mousedown', (e) => {
        isDragging = true;
        handleScrub(e);
      });
    }

    window.addEventListener('mousemove', (e) => {
      if (isDragging) handleScrub(e);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.nextTrack();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.prevTrack();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.sensualPlayer = new SensualPlayer();
});
